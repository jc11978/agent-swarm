export type Agent = {
  address: string
  roles: string[]
  earned: number
  spent: number
  tasksPosted: number
  tasksClaimed: number
  tasksCompleted: number
  firstSeen: string
}

export type Task = {
  id: string
  title: string
  budget: string
  subtasks: number
  requestor: string
  status: string
  createdAt: string
}

export type Listing = {
  taskId: string
  title: string
  description?: string
  budget: string
  skills_needed?: string[]
  requestor: string
  bids?: number
  status?: string
  createdAt: string
}

export type Escrow = {
  taskId: string
  requestor: string
  worker: string
  amount: string
  deadline?: number
  status?: string
  txHash?: string
  createdAt: string
}

export type Activity = {
  type: string
  agent: string
  task?: string
  taskId?: string
  amount?: string | number
  txHash?: string
  at: string
}

export type SwarmState = {
  agents: Record<string, Agent>
  tasks: Task[]
  activity: Activity[]
  stats: {
    totalTasks: number
    totalPaid: number
    totalClaims: number
    totalResults: number
  }
  listings: Listing[]
  escrows: Escrow[]
}

export function shortAddr(a?: string) {
  if (!a) return "?"
  return a.slice(0, 6) + "…" + a.slice(-4)
}

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 0) return "just now"
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function usd(n: number | string) {
  const v = typeof n === "string" ? parseFloat(n) : n
  return `$${(Number.isFinite(v) ? v : 0).toFixed(2)}`
}

export const ACTIVITY_LABELS: Record<string, string> = {
  task_posted: "posted a task",
  subtask_claimed: "claimed a subtask",
  result_submitted: "submitted a result",
  payment_sent: "sent payment",
  listing_posted: "posted a listing",
  escrow_created: "created escrow",
  escrow_released: "released escrow",
}
