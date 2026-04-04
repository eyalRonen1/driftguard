import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/6 py-10 relative z-10">
      <div className="max-w-6xl lg:max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="col-span-2">
            <Image src="/assets/zikit-nav-logo.webp" alt="Zikit" width={100} height={33} className="h-7 w-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[240px]">
              AI-powered website change monitoring. Know the moment anything changes on the pages that matter to your business.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Product</p>
            <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <Link href="/signup" className="block hover:text-[var(--accent-jade)] transition">Get started</Link>
              <Link href="/#pricing" className="block hover:text-[var(--accent-jade)] transition">Pricing</Link>
              <Link href="/#how" className="block hover:text-[var(--accent-jade)] transition">How it works</Link>
              <a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[var(--accent-jade)] transition">Chrome Extension</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Resources</p>
            <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <Link href="/about" className="block hover:text-[var(--accent-jade)] transition">About</Link>
              <Link href="/docs" className="block hover:text-[var(--accent-jade)] transition">API Docs</Link>
              <Link href="/integrations" className="block hover:text-[var(--accent-jade)] transition">Integrations</Link>
              <Link href="/blog" className="block hover:text-[var(--accent-jade)] transition">Blog</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Legal</p>
            <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <Link href="/terms" className="block hover:text-[var(--accent-jade)] transition">Terms</Link>
              <Link href="/privacy" className="block hover:text-[var(--accent-jade)] transition">Privacy</Link>
              <Link href="/refund" className="block hover:text-[var(--accent-jade)] transition">Refunds</Link>
              <Link href="/accessibility" className="block hover:text-[var(--accent-jade)] transition">Accessibility</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Support</p>
            <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <a href="mailto:support@zikit.ai" className="block hover:text-[var(--accent-jade)] transition">support@zikit.ai</a>
              <a href="https://x.com/zikit_ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--accent-jade)] transition"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>Follow on X</a>
              <Link href="/login" className="block hover:text-[var(--accent-jade)] transition">Sign in</Link>
              <Link href="/signup" className="block hover:text-[var(--accent-jade)] transition">Sign up</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <span>&copy; {new Date().getFullYear()} Zikit. All rights reserved.</span>
          <span>Payments secured by <a href="https://paddle.com" className="text-[var(--accent-jade)] hover:underline">Paddle</a></span>
        </div>
      </div>
    </footer>
  );
}
