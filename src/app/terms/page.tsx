import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="bg-jungle-stage min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-8 block">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
        <nav className="flex gap-4 text-xs text-muted-foreground mb-8">
          <Link href="/terms" className="text-primary font-medium">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition">Privacy</Link>
          <Link href="/accessibility" className="hover:text-primary transition">Accessibility</Link>
        </nav>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
          <p><strong>Last updated:</strong> April 1, 2026</p>
          <p>These Terms & Conditions govern your use of Zikit (&quot;the Service&quot;), operated by Zikit (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">1. Service Description</h2>
          <p>Zikit is a website change monitoring service that checks web pages on a schedule and provides AI-powered summaries of detected changes.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">2. Payment & Billing</h2>
          <p>Payments are processed by our merchant of record, Paddle.com Market Limited, who also acts as the reseller of the Service. Paddle handles all billing, invoicing, sales tax, and payment processing on our behalf. By purchasing a subscription, you agree to Paddle&apos;s <a href="https://www.paddle.com/legal/terms" className="text-primary hover:underline">Terms of Service</a>.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">3. Free Plan</h2>
          <p>We offer a free plan with limited features (3 monitors, daily checks, email alerts). No credit card is required. You may upgrade to a paid plan at any time for additional features.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">4. Acceptable Use</h2>
          <p>You agree to only monitor web pages you have a legitimate interest in. You must not use the Service to monitor pages in violation of any applicable laws or the terms of service of the monitored websites.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">5. Data & Privacy</h2>
          <p>We store snapshots of monitored page content to detect changes. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">6. Limitation of Liability</h2>
          <p>The Service is provided &quot;as is&quot;. We are not liable for missed changes, delayed alerts, or any decisions made based on our monitoring results.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">7. Intellectual Property</h2>
          <p>All content, code, and intellectual property of Zikit remains owned by Zikit. You retain full ownership of your data. We grant you a limited, non-exclusive license to use the service for its intended purpose during your subscription period.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">8. Governing Law</h2>
          <p>These terms are governed by the laws of the State of Israel. Any disputes shall be resolved in the competent courts of Tel Aviv, Israel.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">9. Dispute Resolution</h2>
          <p>Before initiating legal proceedings, both parties agree to attempt to resolve disputes through good-faith negotiation for a period of 30 days. Either party may initiate this process by sending written notice to the other party describing the dispute and proposed resolution.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">10. Contact</h2>
          <p>Email: <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a></p>
        </div>
      </div>
    </main>
  );
}
