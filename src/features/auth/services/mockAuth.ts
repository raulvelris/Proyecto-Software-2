import { mockOk, mockFail } from '../../../api/mock'
import type { User } from '../../../store/authStore'

type InternalUser = User & { password: string; activated: boolean }

const users: Array<InternalUser> = [
  { id: '1', name: 'Demo User', email: 'demo@example.com', password: 'Password1!', activated: true },
]

const activations: Array<{ email: string; token: string }> = []

export async function mockLogin(email: string, password: string) {
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return mockFail('Invalid credentials')
  if (!user.activated) return mockFail('Please activate your account')
  const { password: _pwd, ...safe } = user
  return mockOk({ user: safe, token: 'mock-token' })
}

export async function mockRegister(name: string, email: string, password: string) {
  const exists = users.some((u) => u.email === email)
  if (exists) return mockFail('User already exists')
  const newUser: InternalUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
    activated: false,
  }
  users.push(newUser)
  // generate activation token
  const token = Math.random().toString(36).slice(2, 10)
  activations.push({ email, token })
  const { password: _pwd, ...safe } = newUser
  return mockOk({ user: safe, activationToken: token })
}

export async function mockGetActivationLink(email: string) {
  const entry = activations.find((a) => a.email === email)
  if (!entry) return mockFail('Activation not found')
  return mockOk({ url: `/activate/verify?email=${encodeURIComponent(email)}&token=${entry.token}` })
}

export async function mockActivate(email: string, token: string) {
  const entry = activations.find((a) => a.email === email && a.token === token)
  if (!entry) return mockFail('Invalid activation link')
  const user = users.find((u) => u.email === email)
  if (!user) return mockFail('User not found')
  user.activated = true
  // remove activation
  const idx = activations.indexOf(entry)
  if (idx >= 0) activations.splice(idx, 1)
  const { password: _pwd, ...safe } = user
  return mockOk({ user: safe, token: 'mock-token' })
}
