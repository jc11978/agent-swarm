import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const dynamic = "force-dynamic"

const EMPTY = {
  agents: {},
  tasks: [],
  activity: [],
  stats: { totalTasks: 0, totalPaid: 0, totalClaims: 0, totalResults: 0 },
  listings: [],
  escrows: [],
}

export async function GET() {
  try {
    const filePath = join(process.cwd(), "data", "state.json")
    const raw = await readFile(filePath, "utf-8")
    const state = JSON.parse(raw)
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(EMPTY, {
      headers: { "Cache-Control": "no-store" },
    })
  }
}
