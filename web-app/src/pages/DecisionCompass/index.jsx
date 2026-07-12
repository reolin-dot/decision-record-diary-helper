import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMPASS_QUESTIONS, getCompassResult } from '../../domain/decisionCompass.js'
import './compass.css'

export default function DecisionCompass() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const result = step === COMPASS_QUESTIONS.length ? getCompassResult(answers) : null
  const question = COMPASS_QUESTIONS[step]
  const answer = value => {
    setAnswers(current => ({ ...current, [question.key]: value }))
    setStep(current => current + 1)
  }

  return <main className="compass-page">
    <div className="compass-sky" aria-hidden="true"><span>✦</span><i /></div>
    {!result ? <section className="compass-question">
      <span className="compass-kicker">决策罗盘 · {step + 1}/{COMPASS_QUESTIONS.length}</span>
      <div className="compass-progress"><i style={{ width: `${((step + 1) / COMPASS_QUESTIONS.length) * 100}%` }} /></div>
      <h1>{question.title}</h1><p>{question.hint}</p>
      <div className="compass-actions"><button onClick={() => answer(true)}>是的，差不多</button><button onClick={() => answer(false)}>还没有</button></div>
      {step > 0 && <button className="compass-back" onClick={() => setStep(current => current - 1)}>回到上一问</button>}
    </section> : <section className={`compass-result result-${result.tone}`}>
      <span className="compass-result-icon">{result.icon}</span><span className="compass-kicker">此刻的方向</span>
      <h1>{result.title}</h1><p>{result.text}</p>
      <button className="compass-primary" onClick={() => navigate(result.path)}>{result.action}</button>
      <button className="compass-back" onClick={() => { setAnswers({}); setStep(0) }}>重新看看</button>
    </section>}
  </main>
}
