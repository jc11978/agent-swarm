import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row">
        <div className="font-mono">
          built on{" "}
          <a href="https://xmtp.org" target="_blank" rel="noreferrer" className="text-secondary hover:underline">
            XMTP
          </a>{" "}
          +{" "}
          <a href="https://base.org" target="_blank" rel="noreferrer" className="text-secondary hover:underline">
            Base
          </a>
        </div>
        <div className="flex items-center gap-5">
          <a href="https://github.com/clawberrypi/agent-swarm" target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </a>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <a href="https://x.com/clawberrypi" target="_blank" rel="noreferrer" className="hover:text-foreground">
            @clawberrypi
          </a>
        </div>
      </div>
    </footer>
  )
}
