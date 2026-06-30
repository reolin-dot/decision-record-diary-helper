// CloudStorageAdapter stub - interface definition for future cloud sync
// V1 does NOT implement real cloud sync. This file defines the contract.
//
// Future options:
//   - CloudBase Web SDK (closest to WeChat cloud)
//   - Custom REST API + database
//   - Serverless Functions (Vercel/Netlify/Cloudflare Workers)

class CloudStorageAdapter {
  constructor() {
    this.enabled = false
  }

  /**
   * Enable cloud sync (would trigger auth flow)
   * @returns {Promise<boolean>}
   */
  async enable() {
    console.warn('[CloudAdapter] enable() not implemented in V1')
    return false
  }

  /**
   * Disable cloud sync
   */
  async disable() {
    this.enabled = false
  }

  /**
   * Pull changes from cloud since a given timestamp
   * @param {string} since - ISO timestamp
   * @returns {Promise<Object>} { decisions: [], profile: {} }
   */
  async pull(since) {
    console.warn('[CloudAdapter] pull() not implemented in V1')
    return { decisions: [], profile: null }
  }

  /**
   * Push local operations to cloud
   * @param {Array} operations - Array of { action, entityType, entityId, payload, timestamp }
   * @returns {Promise<Object>} { success: [], conflicts: [] }
   */
  async push(operations) {
    console.warn('[CloudAdapter] push() not implemented in V1')
    return { success: [], conflicts: [] }
  }

  /**
   * Get current sync status
   * @returns {Object}
   */
  getStatus() {
    return {
      enabled: false,
      queueLength: 0,
      lastSyncTime: null,
    }
  }
}

const cloudStorage = new CloudStorageAdapter()
export default cloudStorage
