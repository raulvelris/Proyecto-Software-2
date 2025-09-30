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

export async function mockRegister(name: string, email: string, password: string) {
  const exists = users.some((u) => u.email === email)
  if (exists) return mockFail('User already exists')
  const newUser: User & { password: string } = {
    id: String(users.length + 1),
    name,
    email,
    password,
  }
  users.push(newUser)
  const { password: _pwd, ...safe } = newUser
  return mockOk({ user: safe })
}
