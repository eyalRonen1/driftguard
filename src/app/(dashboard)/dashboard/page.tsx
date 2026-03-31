import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let org;
  try {
    const result = await ensureUserAndOrg(user);
    org = result.org;
  } catch {
    return (
      <div className="p-8 text-center">
        <Image src="/assets/chameleon-sleeping.png" alt="" width={100} height={100} className="mx-auto mb-4" />
        <p className="text-[var(--text-muted)]">Setting up... refresh in a moment.</p>
      </div>
    );
  }

  let allMonitors: any[] = [];
  let recentChanges: any[] = [];
  try {
    allMonitors = await db.select().from(monitors).where(eq(monitors.orgId, org.id)).orderBy(desc(monitors.createdAt));
    recentChanges = await db.select().from(changes).where(eq(changes.orgId, org.id)).orderBy(desc(changes.createdAt)).limit(10);
  } catch {}

  const activeCount = allMonitors.filter((m: any) => m.isActive && !m.isPaused).length;
  const firstName = (user.user_metadata?.full_name || user.email || "").split(/[\s@]/)[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="relative card-jungle p-6 sm:p-8 mb-6 overflow-hidden !bg-gradient-to-r !from-[#1a3a1a] !to-[#2d4a2d]">
        <div className="absolute right-2 bottom-0 opacity-30 hidden sm:block">
          <Image src="/assets/chameleon-main.png" alt="" width={120} height={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-light)]">Hey {firstName}!</h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">Your chameleon is watching. All good.</p>
        </div>
      </div>

      {allMonitors.length === 0 ? (
        <div className="card-jungle p-10 text-center">
          <Image src="/assets/chameleon-sleeping.png" alt="" width={130} height={130} className="mx-auto mb-5" />
          <h2 className="text-xl font-bold text-[var(--text-light)] mb-2">No pages to watch yet</h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-sm mx-auto">Give your chameleon a page to watch. It&apos;ll alert you when something changes.</p>
          <Link href="/dashboard/monitors/new" className="btn-jungle inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add first monitor
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-jungle p-4 !bg-[var(--accent-lime)]/5 !border-[var(--accent-lime)]/20">
              <p className="text-[10px] text-[var(--accent-lime)] font-semibold uppercase tracking-wider">Watching</p>
              <p className="text-2xl font-bold text-[var(--accent-lime)] mt-1">{activeCount}</p>
            </div>
            <div className="card-jungle p-4 !bg-[var(--accent-yellow)]/5 !border-[var(--accent-yellow)]/20">
              <p className="text-[10px] text-[var(--accent-yellow)] font-semibold uppercase tracking-wider">Changes</p>
              <p className="text-2xl font-bold text-[var(--accent-yellow)] mt-1">{recentChanges.length}</p>
            </div>
            <div className="card-jungle p-4 !bg-[var(--accent-orange)]/5 !border-[var(--accent-orange)]/20">
              <p className="text-[10px] text-[var(--accent-orange)] font-semibold uppercase tracking-wider">Plan</p>
              <p className="text-2xl font-bold text-[var(--accent-orange)] mt-1 capitalize">{org.plan}</p>
            </div>
          </div>

          {/* Changes */}
          {recentChanges.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[var(--text-light)] mb-3 flex items-center gap-2">
                <Image src="/assets/chameleon-alert.png" alt="" width={22} height={22} />
                Recent changes
              </h2>
              <div className="space-y-2">
                {recentChanges.map((c: any) => (
                  <div key={c.id} className="card-jungle p-4">
                    <p className="text-sm font-medium text-[var(--text-light)]">{c.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        c.importanceScore >= 7 ? "bg-[var(--accent-red)]/20 text-[var(--accent-red)]" :
                        c.importanceScore >= 4 ? "bg-[var(--accent-yellow)]/20 text-[var(--accent-yellow)]" :
                        "bg-[var(--bg-moss)] text-[var(--text-dim)]"
                      }`}>{c.importanceScore}/10</span>
                      <span className="text-[10px] text-[var(--text-dim)]">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-light)]">Monitors</h2>
              <Link href="/dashboard/monitors/new" className="text-xs text-[var(--accent-lime)] hover:underline font-medium">+ Add</Link>
            </div>
            <div className="space-y-2">
              {allMonitors.map((m: any) => (
                <Link key={m.id} href={`/dashboard/monitors/${m.id}`} className="card-jungle p-4 flex items-center justify-between block">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[var(--text-light)] text-sm">{m.name}</h3>
                    <p className="text-xs text-[var(--text-dim)] truncate">{m.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-[10px] text-[var(--text-dim)]">{m.checkFrequency}</span>
                    <span className="relative flex h-2.5 w-2.5">
                      {m.healthStatus === "healthy" && m.isActive && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-lime)] opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        m.healthStatus === "error" ? "bg-[var(--accent-red)]" :
                        m.healthStatus === "unstable" ? "bg-[var(--accent-yellow)]" :
                        m.isActive ? "bg-[var(--accent-lime)]" : "bg-[var(--bg-moss)]"
                      }`} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
