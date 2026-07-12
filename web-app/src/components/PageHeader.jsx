import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, children }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="page-with-header">
      <header className="page-header">
        <button className="page-header-back" onClick={handleBack} aria-label="返回上一页">
          <span className="back-arrow">‹</span>
        </button>
        <h1 className="page-header-title">{title}</h1>
        <div className="page-header-spacer" />
      </header>
      <div className="page-body">
        {children}
      </div>
    </div>
  )
}
