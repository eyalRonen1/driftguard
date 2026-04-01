import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="bg-jungle-stage min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-8 block">← Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-muted-foreground">
          <p><strong>Last updated:</strong> April 1, 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">What we collect</h2>
          <p>When you create an account, we collect your email address and name. When you add monitors, we store the URLs you choose to track and snapshots of their text content.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">How we use your data</h2>
          <p>We use your data solely to provide the monitoring service: checking pages, detecting changes, generating AI summaries, and sending you alerts.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Data storage</h2>
          <p>Your data is stored on Supabase (PostgreSQL) hosted in the EU. Page content snapshots are retained according to your plan (7-365 days) and then automatically deleted.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Third parties</h2>
          <p>We use: Supabase (database), Vercel (hosting), OpenAI (AI summaries), Paddle (payments), Resend (email). These services process data only as needed to provide their functionality.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Your rights</h2>
          <p>You can export or delete your data at any time from your dashboard settings. To request full data deletion, email support@pagelifeguard.com.</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Contact</h2>
          <p>Email: <a href="mailto:support@pagelifeguard.com" className="text-primary">support@pagelifeguard.com</a></p>
        </div>
      </div>
    </main>
  );
}
