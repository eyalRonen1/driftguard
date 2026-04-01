import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="bg-jungle-stage min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-8 block">← Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
          <p><strong>Last updated:</strong> April 1, 2026</p>
          <p>These Terms & Conditions govern your use of Zikit (&quot;the Service&quot;), operated by Zikit (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">1. Service Description</h2>
          <p>Zikit is a website change monitoring service that checks web pages on a schedule and provides AI-powered summaries of detected changes.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">2. Payment & Billing</h2>
          <p>Payments are processed by our merchant of record, Paddle.com Market Limited, who also acts as the reseller of the Service. Paddle handles all billing, invoicing, sales tax, and payment processing on our behalf. By purchasing a subscription, you agree to Paddle&apos;s <a href="https://www.paddle.com/legal/terms" className="text-primary hover:underline">Terms of Service</a>.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">3. Free Trial</h2>
          <p>We offer a 14-day free trial with limited features. No credit card is required. After the trial period, you may upgrade to a paid plan to continue using the Service.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">4. Acceptable Use</h2>
          <p>You agree to only monitor web pages you have a legitimate interest in. You must not use the Service to monitor pages in violation of any applicable laws or the terms of service of the monitored websites.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">5. Data & Privacy</h2>
          <p>We store snapshots of monitored page content to detect changes. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">6. Limitation of Liability</h2>
          <p>The Service is provided &quot;as is&quot;. We are not liable for missed changes, delayed alerts, or any decisions made based on our monitoring results.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">7. Contact</h2>
          <p>Email: <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a></p>
        </div>
      </div>
    </main>
  );
}
