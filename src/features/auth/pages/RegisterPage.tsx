import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../components/Input'
import { Button } from '../../../components/Button'
import { registerUser } from '../services/authService'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'

const schema = z
  .object({
    nombre: z.string().min(2, 'El nombre es muy corto'),
    apellido: z.string().min(2, 'El apellido es muy corto'),
    correo: z.string().email('Ingresa un correo válido'),
    clave: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.clave === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema), 
    defaultValues: { nombre: '', apellido: '', correo: '', clave: '', confirmPassword: '' } 
  })

  async function onSubmit(values: FormValues) {
    try {
      const { confirmPassword, ...registerData } = values
      await registerUser(registerData)
      
      navigate('/activate/success')
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al registrar usuario')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Crear cuenta</h1>
      <p className="text-sm text-slate-400 mb-6">Comienza a gestionar tus eventos</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre" placeholder="Juan" error={errors.nombre?.message} {...register('nombre')} />
        <Input label="Apellido" placeholder="Pérez" error={errors.apellido?.message} {...register('apellido')} />
        <Input label="Correo" type="email" placeholder="tu@ejemplo.com" error={errors.correo?.message} {...register('correo')} />
        <Input label="Contraseña" type="password" placeholder="••••••••" error={errors.clave?.message} {...register('clave')} />
        <Input label="Confirmar contraseña" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creando…' : 'Crear cuenta'}</Button>
      </form>

      <p className="text-sm text-slate-400 mt-4">
        ¿Ya tienes cuenta? <Link className="text-blue-400 hover:underline" to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}
