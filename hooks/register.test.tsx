import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'baglam-gostergesi',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const SURFACES = ['terminal', 'desktop', 'vscode', 'mobile'] as const

test('her ölçümden sonra bant doluluğu gösterir', async ($, on) => {
  // Testte motorun yerini bu kanca tutar.
  on('session.measure', (_, e) => ({ changed: e.changed }))

  const toasts: string[] = []
  on('ui.toast', (_, e) => {
    toasts.push(e.text)

    return { value: undefined }
  })

  await $.session.measure({
    context: { tokens: 84_300, window: 200_000, percent: 42 },
    rateLimits: [],
    changed: ['context'],
  })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...BAND, surface })

    expect((await ui.find({ type: 'Text', text: /%42/ }))?.text).toContain(
      '%42',
    )
    expect(
      (await ui.find({ type: 'Text', text: /84,3 bin/ }))?.text,
    ).toContain('84,3 bin / 200 bin token')
    // 20 hücrenin 8'i dolu.
    expect((await ui.find({ type: 'Text', text: /█/ }))?.text).toBe(
      '█'.repeat(8),
    )
    await ui.unmount()
  }

  expect(toasts).toEqual([])

  // %85 eşiği bir kez aşıldığında bir kez uyarır.
  await $.session.measure({
    context: { tokens: 176_000, window: 200_000, percent: 88 },
    rateLimits: [],
    changed: ['context'],
  })
  await $.session.measure({
    context: { tokens: 180_000, window: 200_000, percent: 90 },
    rateLimits: [],
    changed: ['context'],
  })

  expect(toasts.length).toBe(1)
  expect(toasts[0]).toContain('%88')
})

test('ölçüm yokken (yeni ya da sıkıştırılmış oturum) bunu söyler', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure({
    context: { window: 200_000 },
    rateLimits: [],
    changed: ['context'],
  })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...BAND, surface })

    expect((await ui.find({ type: 'Text' }))?.text).toContain(
      'henüz ölçüm yok',
    )
    await ui.unmount()
  }
})
