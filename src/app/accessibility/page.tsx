import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-jungle-stage text-[var(--text-cream)]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] mb-8 block">&larr; Back to home</Link>
        <h1 className="text-2xl font-bold mb-6">Accessibility Statement</h1>

        <div className="space-y-4 text-sm text-[var(--text-sage)]">
          <p>Zikit is committed to making our website and services accessible to all people, including those with disabilities.</p>

          <h2 className="text-lg font-semibold text-[var(--text-cream)] mt-6">Conformance Status</h2>
          <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible to people with a wide array of disabilities.</p>

          <h2 className="text-lg font-semibold text-[var(--text-cream)] mt-6">Measures Taken</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Semantic HTML structure with proper heading hierarchy</li>
            <li>Sufficient color contrast ratios</li>
            <li>Keyboard navigation support</li>
            <li>Alternative text for meaningful images</li>
            <li>Form labels and error messages</li>
            <li>Responsive design for all screen sizes</li>
            <li>RTL (Right-to-Left) language support</li>
          </ul>

          <h2 className="text-lg font-semibold text-[var(--text-cream)] mt-6">Known Limitations</h2>
          <p>While we strive for full accessibility, some areas may have limitations. We are continuously working to improve the accessibility of our platform.</p>

          <h2 className="text-lg font-semibold text-[var(--text-cream)] mt-6">Accessibility Coordinator</h2>
          <p>If you encounter any accessibility barriers or have suggestions for improvement, please contact our accessibility coordinator:</p>
          <p className="mt-2">
            <strong className="text-[var(--text-cream)]">Email:</strong>{" "}
            <a href="mailto:accessibility@zikit.ai" className="text-[var(--accent-jade)] hover:underline">accessibility@zikit.ai</a>
          </p>
          <p>We aim to respond to accessibility feedback within 3 business days.</p>

          <h2 className="text-lg font-semibold text-[var(--text-cream)] mt-6">Compliance Standards</h2>
          <p>This website aims to comply with:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Israeli Standard IS 5568</li>
            <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
            <li>European Accessibility Act (EAA)</li>
          </ul>

          <p className="mt-6 text-xs text-[var(--text-muted)]">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
      </div>
    </div>
  );
}
