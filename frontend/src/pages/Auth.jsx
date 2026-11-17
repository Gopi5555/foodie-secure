import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api.js'
import { useApp } from '../store.jsx'

function Shell({ title, sub, children }) {
  return <div className="authwrap"><div className="authcard"><div className="brand">🍔 Foodie</div><h2>{title}</h2><p className="sub">{sub}</p>{children}</div></div>
}
function useForm(init) { const [f, setF] = useState(init); return [f, (k) => (e) => setF({ ...f, [k]: e.target.value })] }
function useRunner() {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn() } catch (e) { setErr(e.message) } setBusy(false) }
  return { busy, err, run }
}

export function Login() {
  const nav = useNavigate(); const loc = useLocation(); const { login } = useApp()
  const [f, on] = useForm({ email: '', password: '', otp: '' })
  const [step, setStep] = useState(1); const [msg, setMsg] = useState(loc.state?.msg || '')
  const { busy, err, run } = useRunner()
  const sendOtp = () => run(async () => { const r = await api.login({ email: f.email, password: f.password }); setMsg(r.message); setStep(2) })
  const verify = () => run(async () => { const r = await api.verifyOtp({ email: f.email, otp: f.otp }); login(r.token, r.user); nav('/') })
  return (
    <Shell title={step === 1 ? 'Welcome back' : 'Verify OTP'} sub={step === 1 ? 'Log in to order your favourite food' : 'Enter the 6-digit code we emailed you'}>
      {msg && <p className="ok">{msg}</p>}{err && <p className="err">{err}</p>}
      {step === 1 ? (
        <div className="form">
          <input type="email" placeholder="Email" value={f.email} onChange={on('email')} />
          <input type="password" placeholder="Password" value={f.password} onChange={on('password')} onKeyDown={(e) => e.key === 'Enter' && sendOtp()} />
          <button className="primary" disabled={busy || !f.email || !f.password} onClick={sendOtp}>{busy ? 'Please wait…' : 'Continue'}</button>
          <div className="linkrow"><Link to="/forgot">Forgot password?</Link><Link to="/register">Create account</Link></div>
        </div>
      ) : (
        <div className="form">
          <input className="otp" maxLength={6} inputMode="numeric" placeholder="••••••" value={f.otp} onChange={on('otp')} onKeyDown={(e) => e.key === 'Enter' && verify()} />
          <button className="primary" disabled={busy || f.otp.length < 6} onClick={verify}>{busy ? 'Verifying…' : 'Verify & Login'}</button>
          <div className="linkrow"><a href="#" onClick={(e) => { e.preventDefault(); sendOtp() }}>Resend OTP</a><a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setMsg('') }}>← Back</a></div>
        </div>
      )}
    </Shell>
  )
}

export function Register() {
  const nav = useNavigate(); const [f, on] = useForm({ name: '', email: '', phone: '', password: '' }); const { busy, err, run } = useRunner()
  const submit = () => run(async () => { const r = await api.register(f); nav('/login', { state: { msg: r.message } }) })
  return (
    <Shell title="Create account" sub="Join Foodie in a few seconds">
      {err && <p className="err">{err}</p>}
      <div className="form">
        <input placeholder="Full name" value={f.name} onChange={on('name')} />
        <input type="email" placeholder="Email" value={f.email} onChange={on('email')} />
        <input placeholder="Phone" value={f.phone} onChange={on('phone')} />
        <input type="password" placeholder="Password (min 8 chars)" value={f.password} onChange={on('password')} />
        <button className="primary" disabled={busy || !f.name || !f.email || !f.password} onClick={submit}>{busy ? 'Creating…' : 'Register'}</button>
        <div className="linkrow"><span /><Link to="/login">Already have an account?</Link></div>
      </div>
    </Shell>
  )
}

export function Forgot() {
  const nav = useNavigate(); const [f, on] = useForm({ email: '', otp: '', newPassword: '' })
  const [step, setStep] = useState(1); const [msg, setMsg] = useState(''); const { busy, err, run } = useRunner()
  const send = () => run(async () => { const r = await api.forgot({ email: f.email }); setMsg(r.message); setStep(2) })
  const reset = () => run(async () => { const r = await api.reset(f); nav('/login', { state: { msg: r.message } }) })
  return (
    <Shell title="Reset password" sub={step === 1 ? "We'll email you a one-time code" : 'Enter the OTP and choose a new password'}>
      {msg && <p className="ok">{msg}</p>}{err && <p className="err">{err}</p>}
      <div className="form">
        <input type="email" placeholder="Email" value={f.email} onChange={on('email')} disabled={step === 2} />
        {step === 2 && <>
          <input className="otp" maxLength={6} placeholder="••••••" value={f.otp} onChange={on('otp')} />
          <input type="password" placeholder="New password (min 8 chars)" value={f.newPassword} onChange={on('newPassword')} /></>}
        <button className="primary" disabled={busy || !f.email} onClick={step === 1 ? send : reset}>{busy ? 'Please wait…' : step === 1 ? 'Send OTP' : 'Update password'}</button>
        <div className="linkrow"><span /><Link to="/login">← Back to login</Link></div>
      </div>
    </Shell>
  )
}
