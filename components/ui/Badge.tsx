import type { DropStatus } from '@/types'

const statusStyles: Record<DropStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<DropStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
  completed: 'Completed',
}

export function Badge({ status }: { status: DropStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
