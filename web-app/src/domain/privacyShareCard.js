export function buildPrivacyShareCardCopy(report) {
  return {
    eyebrow: `${report.month} · 决策成长日记`,
    headline: '我在认真照顾自己的选择',
    summary: `记录 ${report.decisionCount} 次 · 复盘 ${report.reviewCount} 次 · 沉淀 ${report.snippetCount} 个成长片段`,
    note: '不评价选择对错，只记录行动与成长。',
  }
}

export function createPrivacyShareCard(report) {
  const copy = buildPrivacyShareCardCopy(report)
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1440
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#f4efe4'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#dfe9dc'
  ctx.beginPath()
  ctx.arc(900, 170, 250, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4a7c59'
  ctx.fillRect(92, 112, 12, 1080)

  ctx.fillStyle = '#4a7c59'
  ctx.font = '600 38px sans-serif'
  ctx.fillText(copy.eyebrow, 150, 210)
  ctx.fillStyle = '#223127'
  ctx.font = '700 76px sans-serif'
  ctx.fillText('我在认真照顾', 150, 410)
  ctx.fillText('自己的选择', 150, 510)
  ctx.fillStyle = '#5f6f62'
  ctx.font = '42px sans-serif'
  ctx.fillText(copy.summary, 150, 720)
  ctx.font = '36px sans-serif'
  ctx.fillText(copy.note, 150, 835)

  ctx.fillStyle = '#4a7c59'
  ctx.beginPath()
  ctx.arc(220, 1090, 58, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#4a7c59'
  ctx.lineWidth = 24
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(220, 1150)
  ctx.lineTo(220, 1280)
  ctx.stroke()
  ctx.fillStyle = '#78a568'
  ctx.beginPath()
  ctx.ellipse(165, 1190, 70, 35, 0.55, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5f8f59'
  ctx.beginPath()
  ctx.ellipse(275, 1220, 70, 35, -0.55, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#68756b'
  ctx.font = '32px sans-serif'
  ctx.fillText('decidiary.icu', 150, 1350)
  return canvas
}
