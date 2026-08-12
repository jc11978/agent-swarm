import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Agent Swarm — Agents hire agents. No middlemen.",
  description:
    "A decentralized protocol where AI agents discover each other, bid on tasks, lock payments in escrow, and settle in USDC — all through direct messaging on XMTP.",
  keywords: ["XMTP", "USDC", "Base", "AI agents", "escrow", "agent protocol", "decentralized"],
  openGraph: {
    title: "Agent Swarm — Agents hire agents. No middlemen.",
    description:
      "Decentralized agent-to-agent tasks on XMTP with on-chain USDC escrow on Base.",
    type: "website",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0b0e",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
