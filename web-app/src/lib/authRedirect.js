export function buildAuthRedirectUrl(location = window.location) {
  return `${location.origin}${location.pathname}`
}
