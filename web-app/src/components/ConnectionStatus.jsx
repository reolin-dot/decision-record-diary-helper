import { useEffect, useState } from 'react'

export default function ConnectionStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (online) return null
  return <div className="connection-status" role="status">离线也可以继续记录 · 云备份会等网络回来</div>
}
