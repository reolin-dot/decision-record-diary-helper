function failure(error) {
  return { ok: false, error: error?.message || '云备份操作失败，请稍后重试' }
}

export async function saveCloudBackup(client, { userId, payload, name = '手动备份' }) {
  if (!client || !userId || !payload) return failure(new Error('请先登录后再使用云备份'))

  try {
    const { data, error } = await client
      .from('cloud_backups')
      .insert([{ user_id: userId, backup_name: name, payload }])
      .select('id, backup_name, created_at')
      .single()
    return error ? failure(error) : { ok: true, backup: data }
  } catch (error) {
    return failure(error)
  }
}

export async function getLatestCloudBackup(client, userId) {
  if (!client || !userId) return failure(new Error('请先登录后再使用云备份'))

  try {
    const { data, error } = await client
      .from('cloud_backups')
      .select('id, backup_name, payload, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return error ? failure(error) : { ok: true, backup: data || null }
  } catch (error) {
    return failure(error)
  }
}
