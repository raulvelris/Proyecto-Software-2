import { mockOk, mockFail } from '../../../api/mock'
import type { User } from '../../../store/authStore'

const users: Array<User & { password: string }> = [
  { id: '1', name: 'Demo User', email: 'demo@example.com', password: 'Password1!' },
]

export async function mockLogin(email: string, password: string) {
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return mockFail('Invalid credentials')
  const { password: _pwd, ...safe } = user
  return mockOk({ user: safe, token: 'mock-token' })
}
