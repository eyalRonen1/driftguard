import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Image src="/assets/camo-sleep.webp" alt="Camo looking confused" width={120} height={120} className="mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-[var(--text-cream)] mb-2">Page not found</h2>
        <p className="text-[var(--text-muted)] mb-6">Camo looked everywhere but couldn&apos;t find this page.</p>
        <Link href="/" className="btn-primary inline-block">Back to home</Link>
      </div>
    </div>
  );
}
