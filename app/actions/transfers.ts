"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { financialAccounts, transfers } from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type ActionResult = { ok: true } | { ok: false; error: string }

const DEFAULT_ACCOUNTS = [
  { title: "Main Checking", description: "Everyday spending", type: "checking", balanceCents: 850000 },
  { title: "Savings", description: "Emergency fund", type: "savings", balanceCents: 1240000 },
  { title: "Investments", description: "Brokerage account", type: "investment", balanceCents: 3120000 },
]

// Seeds a few starter accounts the first time a user opens the dashboard so
// there is something to transfer between.
async function ensureSeeded(userId: string) {
  const existing = await db
    .select({ id: financialAccounts.id })
    .from(financialAccounts)
    .where(eq(financialAccounts.userId, userId))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(financialAccounts).values(DEFAULT_ACCOUNTS.map((a) => ({ ...a, userId })))
  }
}

export async function getAccounts() {
  const userId = await getUserId()
  await ensureSeeded(userId)
  return db
    .select()
    .from(financialAccounts)
    .where(eq(financialAccounts.userId, userId))
    .orderBy(financialAccounts.id)
}

export async function getTransfers() {
  const userId = await getUserId()
  return db
    .select()
    .from(transfers)
    .where(eq(transfers.userId, userId))
    .orderBy(desc(transfers.createdAt))
    .limit(25)
}

export async function createTransfer(input: {
  fromAccountId: number
  toAccountId: number
  amount: number
  note?: string
}): Promise<ActionResult> {
  const userId = await getUserId()

  const fromId = Number(input.fromAccountId)
  const toId = Number(input.toAccountId)

  // --- Server-side validation ---------------------------------------------
  if (!Number.isInteger(fromId) || !Number.isInteger(toId)) {
    return { ok: false, error: "Please select valid accounts." }
  }
  if (fromId === toId) {
    return { ok: false, error: "Choose two different accounts." }
  }
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter an amount greater than zero." }
  }
  // Convert to integer cents; reject fractional cents.
  const amountCents = Math.round(amount * 100)
  if (amountCents <= 0 || Math.abs(amount * 100 - amountCents) > 1e-6) {
    return { ok: false, error: "Amount can have at most two decimal places." }
  }
  if (amountCents > 100_000_000) {
    return { ok: false, error: "That transfer amount is too large." }
  }

  const note = (input.note ?? "").trim().slice(0, 140) || null

  try {
    await db.transaction(async (tx) => {
      // Lock both accounts and confirm they belong to this user.
      const rows = await tx
        .select()
        .from(financialAccounts)
        .where(and(eq(financialAccounts.userId, userId)))
        .for("update")

      const from = rows.find((r) => r.id === fromId)
      const to = rows.find((r) => r.id === toId)

      if (!from || !to) {
        throw new Error("Account not found.")
      }
      if (from.balanceCents < amountCents) {
        throw new Error("Insufficient funds in the source account.")
      }

      await tx
        .update(financialAccounts)
        .set({ balanceCents: sql`${financialAccounts.balanceCents} - ${amountCents}` })
        .where(and(eq(financialAccounts.id, fromId), eq(financialAccounts.userId, userId)))

      await tx
        .update(financialAccounts)
        .set({ balanceCents: sql`${financialAccounts.balanceCents} + ${amountCents}` })
        .where(and(eq(financialAccounts.id, toId), eq(financialAccounts.userId, userId)))

      await tx.insert(transfers).values({
        userId,
        fromAccountId: fromId,
        toAccountId: toId,
        fromTitle: from.title,
        toTitle: to.title,
        amountCents,
        note,
      })
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transfer failed. Please try again."
    return { ok: false, error: message }
  }

  revalidatePath("/dashboard")
  return { ok: true }
}
