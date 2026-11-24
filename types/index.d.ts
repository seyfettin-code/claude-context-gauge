export type Gauge = {
  /** Son yanıtın üzerinde çalıştığı girdi token sayısı; ölçüm yoksa null. */
  tokens: number | null
  /** Doluluk, 0–100 arası tam yüzde; ölçüm yoksa null. */
  percent: number | null
  /** Modelin bağlam penceresi, token olarak. */
  window: number
}

declare module 'claude-code' {
  interface PluginState {
    'baglam-gostergesi': { gauge: Gauge | null }
  }
}
