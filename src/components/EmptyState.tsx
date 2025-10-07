import React from 'react'

export default function EmptyState({ title = 'Nothing here', description = 'There is no data to display yet.', action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-14 w-14 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-2xl">✨</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
