let pendingPrompt = null

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  pendingPrompt = event
})

window.addEventListener('appinstalled', () => {
  pendingPrompt = null
})

export function isInstalledApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export async function requestAppInstall() {
  if (!pendingPrompt) return { supported: false }
  await pendingPrompt.prompt()
  const choice = await pendingPrompt.userChoice
  pendingPrompt = null
  return { supported: true, accepted: choice.outcome === 'accepted' }
}
