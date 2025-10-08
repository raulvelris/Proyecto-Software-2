import React from 'react'
import EmptyState from '../../../../components/EmptyState'

export default function GuestsListPage() {
  const guests: Array<{ id: string; name: string; status: 'confirmed' | 'pending' }> = []

  if (!guests.length) {
    return <EmptyState title="No guests yet" description="Invite people to your event to see them here." />
  }

  return (
    <div className="card p-4">
      <ul className="divide-y divide-white/5">
        {guests.map((g) => (
          <li key={g.id} className="py-3 flex items-center justify-between">
            <span>{g.name}</span>
            <span className="text-sm text-slate-400">{g.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
