import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="bg-jungle-stage min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-8 block">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
          <p><strong>Last updated:</strong> April 3, 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">30-Day Money-Back Guarantee</h2>
          <p>We offer a full refund within 30 days of your first payment. If Zikit isn&apos;t right for you, contact us and we&apos;ll refund your money.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">How to request a refund</h2>
          <p>Email <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a> from the email address associated with your account. Please include your account email and reason for the refund. Refunds are processed within 5-10 business days via Paddle, our payment processor.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">After 30 days</h2>
          <p>After the 30-day period, no refunds will be issued. You can cancel your subscription at any time from your dashboard. Your access continues until the end of the current billing period. No partial refunds are provided for unused subscription time.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Abuse and fraud prevention</h2>
          <p>We reserve the right to refuse refund requests where there is evidence of abuse, fraud, or violation of our Terms of Service. This includes but is not limited to: creating multiple accounts to exploit free trials or refund policies, excessive or automated usage intended to extract data rather than use the service as intended, and chargeback fraud (filing a chargeback after receiving a refund or while continuing to use the service).</p>
          <p>We maintain detailed usage logs including account activity, monitors created, changes detected, API usage, and login history. These records may be used as evidence in the event of a disputed refund or chargeback.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Chargebacks</h2>
          <p>All payments are processed by Paddle as our Merchant of Record. If you believe a charge is incorrect, please contact us at <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a> before filing a chargeback with your bank. Filing a fraudulent chargeback may result in account termination and may be reported to fraud prevention services.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Free plan</h2>
          <p>The free plan requires no payment and has no time limit. You will not be charged unless you choose to upgrade to a paid plan.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Contact</h2>
          <p>For any questions about our refund policy, contact us at <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a>.</p>
        </div>
      </div>
    </main>
  );
}
