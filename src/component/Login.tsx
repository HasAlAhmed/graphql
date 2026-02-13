import { useState, type FormEvent } from "react"
import { encodeBasicAuth } from "../utils"
import { AUTH_ENDPOINT } from "../App"
import { GraduationCap } from 'lucide-react';

type LoginFormComponentProps = {
  onLogin: (usernameOrEmail: string) => void
}

export default function LoginFormComponent({ onLogin }: LoginFormComponentProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!identifier.trim() || !password) {
      setError('Please enter username/email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const basicAuth = encodeBasicAuth(identifier.trim(), password)
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      })

      if (!response.ok) {
        setError("Failed to login")
        return
      }
      const msg = await response.json()
      if (msg?.error) {
        setError(msg.error)
        return
      }
      if (!msg) {
        setError('No JWT token found in the response.')
        return
      }

      localStorage.setItem('jwt', msg)
      onLogin(identifier.trim())
      setSuccess('Login successful. JWT saved to local storage.')
      setPassword('')
    } catch {
      setError('Network error while trying to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <main className="login-page">
      <div className="login-background-image" aria-hidden="true" />
      <div className="login-background-gradient" aria-hidden="true" />
      <div className="login-orb login-orb-primary" aria-hidden="true" />
      <div className="login-orb login-orb-secondary" aria-hidden="true" />

      <section className="login-card" aria-label="Campus GraphQL login form">
        <div className="login-card-topline" aria-hidden="true" />

        <header className="login-header">
          <div className="login-header-icon" aria-hidden="true">
            <GraduationCap />
          </div>
          <h1>
            Campus <span>GraphQL</span> Profile
          </h1>
          <p>Student Access Portal v2.4</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="identifier">Identifier</label>
            <div className="field-wrapper">
              <span className="field-icon" aria-hidden="true">
                ~
              </span>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="username or email"
                disabled={isSubmitting}
              />
            </div>
            <small>Use your campus username or email address</small>
          </div>

          <div className="field-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="field-wrapper">
              <span className="field-icon" aria-hidden="true">
                ●
              </span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
          </button>

          {error ? <p className="status error">{error}</p> : null}
          {success ? <p className="status success">{success}</p> : null}
        </form>

        <footer className="login-footer">
            <p>Made by hasalahmed</p>
        </footer>
      </section>
    </main>
  )
}