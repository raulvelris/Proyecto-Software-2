import type { ClienteTipo } from './ClienteTipo'

export interface UsuarioTipo { // refleja la tabla usuario
  usuario_id: number
  clave: string
  correo: string
  isActive: boolean
  Cliente?: ClienteTipo
}