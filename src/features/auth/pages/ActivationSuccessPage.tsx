export default function ActivationSuccessPage() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold">Email de activación enviado</h1>
      <p className="text-sm text-slate-400 mt-1">Por favor revisa tu correo para verificar tu cuenta.</p>
    </div>
  )
}
