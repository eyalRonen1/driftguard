import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="bg-jungle-stage min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-8 block">← Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
          <p><strong>Last updated:</strong> April 1, 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">30-Day Money-Back Guarantee</h2>
          <p>We offer a full refund within 30 days of your first payment, no questions asked. If Zikit isn&apos;t right for you, we&apos;ll refund your money.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">How to request a refund</h2>
          <p>Email <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a> with your account email. Refunds are processed within 5-10 business days via Paddle.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">After 30 days</h2>
          <p>After the 30-day period, you can cancel your subscription at any time. Your access continues until the end of the current billing period. No partial refunds for unused time.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Free trial</h2>
          <p>The 14-day free trial requires no payment. You will not be charged unless you choose to upgrade.</p>
        </div>
      </div>
    </main>
  );
}
