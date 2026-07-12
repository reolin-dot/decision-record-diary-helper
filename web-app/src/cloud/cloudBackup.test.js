import test from 'node:test'
import assert from 'node:assert/strict'
import { deleteCloudBackups, getLatestCloudBackup, saveCloudBackup } from './cloudBackup.js'

test('saves a complete backup for the signed-in user', async () => {
  const calls = []
  const client = {
    from(table) {
      calls.push(['from', table])
      return {
        insert(rows) {
          calls.push(['insert', rows])
          return {
            select(columns) {
              calls.push(['select', columns])
              return {
                single: async () => ({
                  data: { id: 'b1', backup_name: '手动备份', created_at: '2026-07-11T10:00:00Z' },
                  error: null,
                }),
              }
            },
          }
        },
      }
    },
  }
  const payload = { schemaVersion: 1, decisions: [{ id: 'd1' }] }

  const result = await saveCloudBackup(client, { userId: 'u1', payload })

  assert.equal(result.ok, true)
  assert.deepEqual(calls[1][1], [{ user_id: 'u1', backup_name: '手动备份', payload }])
})

test('loads the latest backup payload only for the signed-in user', async () => {
  const calls = []
  const backup = { id: 'b2', payload: { decisions: [] }, created_at: '2026-07-11T11:00:00Z' }
  const client = {
    from(table) {
      calls.push(['from', table])
      return {
        select(columns) {
          calls.push(['select', columns])
          return {
            eq(column, value) {
              calls.push(['eq', column, value])
              return {
                order(column, options) {
                  calls.push(['order', column, options])
                  return {
                    limit(count) {
                      calls.push(['limit', count])
                      return { maybeSingle: async () => ({ data: backup, error: null }) }
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  }

  const result = await getLatestCloudBackup(client, 'u1')

  assert.deepEqual(result, { ok: true, backup })
  assert.deepEqual(calls[2], ['eq', 'user_id', 'u1'])
})

test('deletes only the signed-in user cloud backups', async () => {
  const calls = []
  const client = {
    from(table) {
      calls.push(['from', table])
      return {
        delete() {
          calls.push(['delete'])
          return {
            eq: async (column, value) => {
              calls.push(['eq', column, value])
              return { error: null }
            },
          }
        },
      }
    },
  }

  const result = await deleteCloudBackups(client, 'u1')

  assert.deepEqual(result, { ok: true })
  assert.deepEqual(calls, [['from', 'cloud_backups'], ['delete'], ['eq', 'user_id', 'u1']])
})
