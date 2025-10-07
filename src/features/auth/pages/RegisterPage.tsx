import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../components/Input'
import { Button } from '../../../components/Button'
import { mockRegister } from '../services/mockAuth'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'

const schema = z
  .object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Min 6 chars').regex(/^(?=.*[A-Z])(?=.*\d).+$/, 'Must include 1 uppercase and 1 number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '', confirmPassword: '' } })

  async function onSubmit(values: FormValues) {
    try {
      await mockRegister(values.name, values.email, values.password)
      toast.success('Account created! Please check your email to activate.')
      navigate('/activate/success')
    } catch (e: any) {
      toast.error(e?.message ?? 'Registration failed')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Create account</h1>
      <p className="text-sm text-slate-400 mb-6">Start managing your events</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creating…' : 'Create account'}</Button>
      </form>

      <p className="text-sm text-slate-400 mt-4">
        Already have an account? <Link className="text-blue-400 hover:underline" to="/login">Sign in</Link>
      </p>
    </div>
  )
}
