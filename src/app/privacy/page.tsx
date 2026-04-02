import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="bg-jungle-stage min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-8 block">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <nav className="flex gap-4 text-xs text-muted-foreground mb-8">
          <Link href="/terms" className="hover:text-primary transition">Terms</Link>
          <Link href="/privacy" className="text-primary font-medium">Privacy</Link>
          <Link href="/accessibility" className="hover:text-primary transition">Accessibility</Link>
        </nav>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
          <p><strong>Last updated:</strong> April 1, 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Data Controller</h2>
          <p>Zikit (zikit.ai), operated from Israel. Contact: <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a></p>

          <h2 className="text-lg font-semibold text-foreground mt-6">What we collect</h2>
          <p>When you create an account, we collect your email address and name. When you add monitors, we store the URLs you choose to track and snapshots of their text content.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Lawful Basis for Processing (GDPR)</h2>
          <p>We process your personal data under the following legal bases:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong className="text-foreground">Contract performance:</strong> Processing necessary to deliver the monitoring service you signed up for.</li>
            <li><strong className="text-foreground">Legitimate interest:</strong> Processing for security, fraud prevention, and service improvement.</li>
            <li><strong className="text-foreground">Consent:</strong> For optional marketing communications. You can withdraw consent at any time.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">How we use your data</h2>
          <p>We use your data solely to provide the monitoring service: checking pages, detecting changes, generating AI summaries, and sending you alerts.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Cookie Policy</h2>
          <p>Zikit uses only essential cookies for authentication and session management. We do not use tracking, analytics, or marketing cookies. No cookie consent is required for essential cookies under GDPR.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Data Storage</h2>
          <p>Your data is stored on Supabase (PostgreSQL) hosted in the EU. Page content snapshots are retained according to your plan (7-365 days) and then automatically deleted.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Data Retention</h2>
          <p>We retain your data according to the following schedule:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong className="text-foreground">Account data</strong> (email, name, settings): Retained until you delete your account.</li>
            <li><strong className="text-foreground">Page snapshots:</strong> Retained per your plan &mdash; Free: 7 days, Pro: 90 days, Business: 365 days.</li>
            <li><strong className="text-foreground">System logs:</strong> 30 days, then automatically deleted.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">Third parties</h2>
          <p>We use: Supabase (database), Vercel (hosting), OpenAI (AI summaries), Paddle (payments), Resend (email). These services process data only as needed to provide their functionality.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Your Rights (GDPR)</h2>
          <p>Under the General Data Protection Regulation, you have the following rights regarding your personal data:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong className="text-foreground">Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate personal data.</li>
            <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data (&ldquo;right to be forgotten&rdquo;).</li>
            <li><strong className="text-foreground">Right to Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong className="text-foreground">Right to Restriction:</strong> Request limitation of processing in certain circumstances.</li>
            <li><strong className="text-foreground">Right to Object:</strong> Object to processing based on legitimate interest or direct marketing.</li>
          </ul>
          <p className="mt-2">To exercise any of these rights, email <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a>. We will respond within 30 days. You can also export or delete your data at any time from your dashboard settings.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Contact</h2>
          <p>Email: <a href="mailto:support@zikit.ai" className="text-primary">support@zikit.ai</a></p>
        </div>
      </div>
    </main>
  );
}
