export const COMPASS_QUESTIONS = [
  { key: 'clear', title: '你能说清自己真正想解决什么吗？', hint: '不是“应该怎么选”，而是这次选择想保护什么。' },
  { key: 'enoughInfo', title: '现有信息足够支持一个暂时选择吗？', hint: '不需要知道全部，但关键事实不能只靠猜。' },
  { key: 'calm', title: '你现在能不被强烈情绪推着走吗？', hint: '着急、内疚或害怕时，先停一下也是行动。' },
  { key: 'smallStep', title: '这个选择有一个可尝试的小步骤吗？', hint: '能先试一点，通常比一次定终身更轻松。' },
]

export function getCompassResult(answers) {
  if (!answers.calm) return { tone: 'pause', icon: '🌙', title: '先给自己一点缓冲', text: '现在最重要的不是立刻选对，而是让情绪先落下来。写下担心的事，明天再回来看看。', action: '去圆桌说说担心', path: '/coach' }
  if (!answers.clear || !answers.enoughInfo) return { tone: 'explore', icon: '🧭', title: '先补一块关键拼图', text: '你不缺勇气，可能只是还少一个关键问题或事实。让圆桌帮你找到最值得确认的信息。', action: '去圆桌找问题', path: '/coach' }
  if (!answers.smallStep) return { tone: 'shape', icon: '🌱', title: '把选择缩小一点', text: '方向已经比较清楚。先设计一个可撤回的小尝试，再决定要不要继续。', action: '记录一个小尝试', path: '/record?step=1' }
  return { tone: 'ready', icon: '🌤️', title: '你已经可以往前一步', text: '信息、状态和行动都准备得不错。记录此刻的判断，给未来的自己留下依据。', action: '记录这个决定', path: '/record?step=1' }
}
