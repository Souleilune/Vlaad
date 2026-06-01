import Link from "next/link";
import { Github, Mail, MessageCircle } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" },
  { href: "/map", label: "Live Map" }
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-8 text-slate-500 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[-0.04em] text-slate-950"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          AGOS-BD
        </Link>

        <nav
          className="flex max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium"
          aria-label="Footer navigation"
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-slate-950">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <div className="flex items-center gap-3">
            <Link href="mailto:hello@agos-bd.local" aria-label="Email AGOS-BD" className="transition hover:text-slate-950">
              <Mail className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="AGOS-BD GitHub" className="transition hover:text-slate-950">
              <Github className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="AGOS-BD community chat" className="transition hover:text-slate-950">
              <MessageCircle className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-xs" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            © {new Date().getFullYear()} AGOS-BD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
