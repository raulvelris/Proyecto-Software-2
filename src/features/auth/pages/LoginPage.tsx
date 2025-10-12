import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../components/Input'
import { Button } from '../../../components/Button'
import { mockLogin } from '../services/mockAuth'
import { useAuthStore } from '../../../store/authStore'
import { toast } from 'sonner'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const login = useAuthStore((s) => s.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  async function onSubmit(values: FormValues) {
    try {
      const res = await mockLogin(values.email, values.password)
      login(res.data.user, res.data.token)
      toast.success('Welcome back!')
      const redirect = location.state?.from?.pathname ?? '/events/public'
      navigate(redirect, { replace: true })
    } catch (e: any) {
      toast.error(e?.message ?? 'Login failed')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Sign in</h1>
      <p className="text-sm text-slate-400 mb-6">Access your events and invitations</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Button disabled={isSubmitting} className="w-full">{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <p className="text-sm text-slate-400 mt-4">
        Don’t have an account? <Link className="text-blue-400 hover:underline" to="/register">Create one</Link>
      </p>
    </div>
  )
}
