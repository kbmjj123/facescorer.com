// IndexedDB model cache using idb-keyval

import { get, set, keys as idbKeys } from 'idb-keyval'

const CACHE_PREFIX = 'cardscan_model_'

export function useModelCache() {
  async function getCachedModel(name: string): Promise<ArrayBuffer | null> {
    try {
      const cached = await get(CACHE_PREFIX + name)
      if (cached instanceof ArrayBuffer) return cached
      // If stored as Uint8Array, convert back
      if (cached instanceof Uint8Array) return (cached.buffer as ArrayBuffer).slice(cached.byteOffset, cached.byteOffset + cached.byteLength)
      return null
    } catch {
      return null
    }
  }

  async function setCachedModel(name: string, buffer: ArrayBuffer): Promise<void> {
    try {
      await set(CACHE_PREFIX + name, buffer)
    } catch (e) {
      console.warn('Failed to cache model to IndexedDB:', e)
    }
  }

  async function isModelCached(name: string): Promise<boolean> {
    try {
      const keys = await idbKeys()
      return keys.includes(CACHE_PREFIX + name)
    } catch {
      return false
    }
  }

  return { getCachedModel, setCachedModel, isModelCached }
}
