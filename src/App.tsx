
import './App.css'
import { useState } from 'react'
import LoginFormComponent from './component/Login'
import StudentDashboardOverview from './component/StudentDashboardOverview'

export const AUTH_ENDPOINT = 'https://learn.reboot01.com/api/auth/signin'
export const GRAPHQL_ENDPOINT = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql'

function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('jwt'))
  const logout = () => {
    setUser(null)
    localStorage.removeItem('jwt')
  }

  if (user !== null) {
    return <StudentDashboardOverview onLogout={logout} />
  }

  return <LoginFormComponent onLogin={setUser} />
}

export default App
