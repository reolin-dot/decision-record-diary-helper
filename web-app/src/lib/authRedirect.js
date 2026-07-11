export function buildAuthRedirectUrl(location = window.location) {
  return `${location.origin}${location.pathname}`
}

export function buildPasswordRecoveryRedirectUrl(redirectUrl = buildAuthRedirectUrl()) {
  const url = new URL(redirectUrl)
  url.searchParams.set('recovery', '1')
  return url.toString()
}

export function getPasswordRecoveryRoute(location = window.location) {
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''))
  const searchParams = new URLSearchParams(location.search)
  return searchParams.get('recovery') === '1' || hashParams.get('type') === 'recovery'
    ? '/login'
    : null
}
