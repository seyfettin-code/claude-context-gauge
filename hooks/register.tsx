import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage } from 'claude-code'

import type { Gauge } from '../types'

const gauge = atom(
  { plugin: 'baglam-gostergesi', key: 'gauge' } as const,
  null,
)

/** Bu yüzdeden sonra çubuk sarıya, sonra kırmızıya döner. */
const WARN_AT = 60
const ALERT_AT = 85

const toGauge = (context: SessionContextUsage): Gauge => ({
  tokens: context.tokens ?? null,
  percent: context.percent ?? null,
  window: context.window,
})

/** 84300 -> "84,3 bin", 200000 -> "200 bin", 1000000 -> "1 milyon". */
const formatTokens = (count: number): string => {
  const [scaled, unit] =
    count >= 1_000_000
      ? [count / 1_000_000, ' milyon']
      : count >= 1_000
        ? [count / 1_000, ' bin']
        : [count, '']
  const rounded = Math.round(scaled * 10) / 10

  return `${String(rounded).replace('.', ',')}${unit}`
}

const colorOf = (percent: number): 'success' | 'warning' | 'error' =>
  percent >= ALERT_AT ? 'error' : percent >= WARN_AT ? 'warning' : 'success'

export const register: Register = on => {
  // Oturum açılırken (ve mod yeniden yüklenirken) eldeki son ölçümü al.
  on('session.start', async ($, e, next) => {
    const { context } = await $.session.usage()
    await update($, gauge, () => toGauge(context))

    return next(e)
  })

  // Motor her ana turdan sonra oturumu ölçer; doluluk değiştiyse burası çalışır.
  on('session.measure', async ($, e, next) => {
    let before: number | null = null
    await update($, gauge, previous => {
      before = previous?.percent ?? null

      return toGauge(e.context)
    })

    const now = e.context.percent ?? null
    const hasCrossed =
      now !== null && now >= ALERT_AT && (before === null || before < ALERT_AT)

    if (hasCrossed) {
      $.ui.toast(`Bağlam %${now} doldu. /compact ile yer açabilirsin.`)
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, gauge)

    if (e.props.hasSurvey || current === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    if (current.percent === null || current.tokens === null) {
      return (
        <Box>
          <Text dimColor>
            Bağlam: henüz ölçüm yok (pencere {formatTokens(current.window)}{' '}
            token)
          </Text>
        </Box>
      )
    }

    const cells = e.props.bodyColumns < 60 ? 10 : 20
    const percent = Math.min(100, Math.max(0, current.percent))
    // Sıfırdan büyük her doluluk en az bir dolu hücre gösterir.
    const filled =
      percent === 0 ? 0 : Math.max(1, Math.round((percent / 100) * cells))
    const color = colorOf(percent)

    return (
      <Box>
        <Text dimColor>Bağlam </Text>
        <Text mono color={color}>
          {'█'.repeat(filled)}
        </Text>
        <Text mono dimColor>
          {'░'.repeat(cells - filled)}
        </Text>
        <Text color={color} weight="semibold">
          {' '}
          %{percent}
        </Text>
        <Text dimColor>
          {' · '}
          {formatTokens(current.tokens)} / {formatTokens(current.window)} token
        </Text>
      </Box>
    )
  })
}
