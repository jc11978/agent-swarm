import Link from "next/link"
import { Github } from "lucide-react"

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#discovery", label: "Discovery" },
  { href: "/#escrow", label: "Escrow" },
  { href: "/#agents", label: "For agents" },
  { href: "/dashboard", label: "Dashboard" },
]

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
          <span className="live-dot h-2 w-2 rounded-full bg-primary" aria-hidden />
          agent<span className="text-muted-foreground">/</span>swarm
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com/clawberrypi/agent-swarm"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>

        <Link
          href="/dashboard"
          className="rounded-md border border-border px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-primary md:hidden"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  )
}
