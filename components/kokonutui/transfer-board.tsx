"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Send, Wallet } from "lucide-react"
import { createTransfer } from "@/app/actions/transfers"

export interface Account {
  id: number
  title: string
  description: string | null
  type: string
  balanceCents: number
}

export interface Transfer {
  id: number
  fromTitle: string
  toTitle: string
  amountCents: number
  note: string | null
  createdAt: string | Date
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function formatTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function TransferBoard({
  accounts,
  transfers,
}: {
  accounts: Account[]
  transfers: Transfer[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [fromId, setFromId] = useState<number | "">(accounts[0]?.id ?? "")
  const [toId, setToId] = useState<number | "">(accounts[1]?.id ?? "")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fromAccount = accounts.find((a) => a.id === fromId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (fromId === "" || toId === "") {
      setError("Select both accounts.")
      return
    }

    startTransition(async () => {
      const result = await createTransfer({
        fromAccountId: Number(fromId),
        toAccountId: Number(toId),
        amount: Number(amount),
        note: note || undefined,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess(`Sent ${formatCurrency(Math.round(Number(amount) * 100))} successfully.`)
      setAmount("")
      setNote("")
      // Instantly refresh server data so balances + feed update in real time.
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Transfer form */}
      <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 dark:border-[#1F1F23] dark:bg-[#0F0F12]">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <Send className="h-4 w-4" />
          Transfer Money
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="from" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From
            </label>
            <select
              id="from"
              value={fromId}
              onChange={(e) => setFromId(Number(e.target.value))}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-[#1F1F23] dark:bg-[#0F0F12] dark:text-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} — {formatCurrency(a.balanceCents)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="to" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </label>
            <select
              id="to"
              value={toId}
              onChange={(e) => setToId(Number(e.target.value))}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-[#1F1F23] dark:bg-[#0F0F12] dark:text-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} — {formatCurrency(a.balanceCents)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-7 pr-3 text-base text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-[#1F1F23] dark:bg-[#0F0F12] dark:text-white"
              />
            </div>
            {fromAccount && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available: {formatCurrency(fromAccount.balanceCents)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Note <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="note"
              type="text"
              maxLength={140}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Rent, savings goal"
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-[#1F1F23] dark:bg-[#0F0F12] dark:text-white"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || accounts.length < 2}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-gray-900"
          >
            {isPending ? "Transferring..." : "Send transfer"}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Live transfer feed */}
      <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white p-6 dark:border-[#1F1F23] dark:bg-[#0F0F12]">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <Wallet className="h-4 w-4" />
          Transfer Activity
        </h2>

        {transfers.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No transfers yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Send your first transfer to see it appear here.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-[#1F1F23]">
            {transfers.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {t.fromTitle} <span className="text-gray-400">→</span> {t.toTitle}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {t.note ? `${t.note} · ` : ""}
                      {formatTime(t.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(t.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
