import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { StatusBar } from "@/components/dashboard/status-bar";
import { MonitorCard } from "@/components/dashboard/monitor-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardChatContext } from "@/components/dashboard/dashboard-chat-context";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let org;
  try {
    const result = await ensureUserAndOrg(user);
    org = result.org;
  } catch {
    return (
      <div className="p-8 text-center">
        <Image src="/assets/camo-sleep.webp" alt="Camo sleeping while setting up" width={100} height={100} className="mx-auto mb-4" />
        <p className="text-[var(--text-muted)]">Setting up... refresh in a moment.</p>
      </div>
    );
  }

  let allMonitors: any[] = [];
  let recentChanges: any[] = [];
  let totalChanges = 0;
  try {
    allMonitors = await db.select().from(monitors).where(eq(monitors.orgId, org.id)).orderBy(desc(monitors.createdAt));
    recentChanges = await db
      .select({
        id: changes.id,
        monitorId: changes.monitorId,
        summary: changes.summary,
        importanceScore: changes.importanceScore,
        createdAt: changes.createdAt,
        monitorName: monitors.name,
      })
      .from(changes)
      .leftJoin(monitors, eq(changes.monitorId, monitors.id))
      .where(eq(changes.orgId, org.id))
      .orderBy(desc(changes.createdAt))
      .limit(10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(changes).where(and(eq(changes.orgId, org.id), gte(changes.createdAt, sevenDaysAgo)));
    totalChanges = Number(countResult[0]?.count || 0);
  } catch {}

  const activeCount = allMonitors.filter((m: any) => m.isActive && !m.isPaused).length;
  const firstName = (user.user_metadata?.full_name || user.email || "").split(/[\s@]/)[0];

  // Calculate dynamic welcome
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentCount = recentChanges.filter((c: any) => new Date(c.createdAt) > oneDayAgo).length;
  const errorCount = allMonitors.filter((m: any) => m.healthStatus === "error").length;

  let welcomeSubtext = "All your pages look good right now.";
  if (errorCount > 0) {
    welcomeSubtext = `${errorCount} page${errorCount > 1 ? "s" : ""} need${errorCount === 1 ? "s" : ""} attention.`;
  } else if (recentCount > 0) {
    welcomeSubtext = `${recentCount} change${recentCount > 1 ? "s" : ""} detected today. Camo's on it.`;
  }

  return (
    <div>
      {/* Set chat context with real dashboard data */}
      <DashboardChatContext
        monitorsCount={allMonitors.length}
        changesCount={totalChanges}
        plan={org.plan}
        monitorNames={allMonitors.map((m: any) => m.name)}
        recentChangeSummaries={recentChanges.map((c: any) => c.summary).filter(Boolean)}
      />
      {/* Welcome */}
      <div className="relative card-glass p-8 sm:p-10 mb-6 overflow-hidden !bg-gradient-to-r !from-[#122117] !via-[#173021] !to-[#0d1812]">
        <div className="absolute right-4 bottom-0 opacity-[0.18] hidden sm:block">
          <Image src="/assets/camo-happy.webp" alt="Camo mascot waving" width={120} height={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-cream)]">Hey {firstName}!</h1>
          <p className="text-[var(--text-muted)] mt-1 text-base">{welcomeSubtext}</p>
        </div>
      </div>

      {allMonitors.length > 0 && (
        <StatusBar
          activeMonitors={activeCount}
          recentChanges={totalChanges}
          hasErrors={allMonitors.some((m: any) => m.healthStatus === "error")}
          errorCount={errorCount}
          lastCheckAt={allMonitors.reduce((latest: string | null, m: any) => {
            if (!m.lastCheckedAt) return latest;
            if (!latest) return m.lastCheckedAt;
            return new Date(m.lastCheckedAt) > new Date(latest) ? m.lastCheckedAt : latest;
          }, null)?.toString() || undefined}
          nextCheckAt={allMonitors.reduce((earliest: string | null, m: any) => {
            if (!m.nextCheckAt || m.isPaused) return earliest;
            if (!earliest) return m.nextCheckAt;
            return new Date(m.nextCheckAt) < new Date(earliest) ? m.nextCheckAt : earliest;
          }, null)?.toString() || undefined}
        />
      )}

      {allMonitors.length === 0 ? (
        <div className="space-y-4">
          <div className="card-glass p-8 text-center">
            <Image src="/assets/empty-hammock.webp" alt="Camo relaxing in a hammock waiting for monitors" width={150} height={150} className="mx-auto mb-4 rounded-xl" />
            <h2 className="text-lg font-bold text-[var(--text-cream)] mb-2">Let&apos;s get Camo watching!</h2>
            <p className="text-[var(--text-muted)] mb-6 max-w-xs mx-auto text-sm">Add a page and see changes detected in real-time.</p>
            <Link href="/dashboard/monitors/new" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add first monitor
            </Link>
          </div>

          {/* Quick start suggestions */}
          <div className="card-glass p-5">
            <p className="text-xs font-semibold text-[var(--text-cream)] mb-3">Quick start ideas</p>
            <div className="space-y-2">
              {[
                { emoji: "🏷️", text: "Track a competitor's pricing page", example: "competitor.com/pricing" },
                { emoji: "📰", text: "Monitor a news site for updates", example: "news-site.com" },
                { emoji: "📋", text: "Watch a government regulations page", example: "regulator.gov/rules" },
              ].map((idea) => (
                <Link
                  key={idea.text}
                  href="/dashboard/monitors/new"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition group"
                >
                  <span className="text-lg">{idea.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium group-hover:text-[var(--accent-jade)] transition">{idea.text}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{idea.example}</p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-jade)] transition" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div className="card-glass card-lift card-enter p-6 !border-[var(--accent-lime)]/15 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"><Image src="/assets/pat-eye.webp" alt="" fill className="object-cover" /></div>
              <div className="relative z-10">
                <p className="text-sm text-[var(--accent-lime)] font-semibold uppercase tracking-[0.12em]">Pages tracked</p>
                <p className="text-4xl font-bold text-[var(--accent-lime)] mt-1 tracking-tight count-pop">{activeCount}</p>
              </div>
            </div>
            <div className="card-glass card-lift card-enter p-6 !border-[var(--accent-gold)]/15 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"><Image src="/assets/pat-spiral.webp" alt="" fill className="object-cover" /></div>
              <div className="relative z-10">
                <p className="text-sm text-[var(--accent-gold)] font-semibold uppercase tracking-[0.12em]">Changes this week</p>
                <p className="text-4xl font-bold text-[var(--accent-gold)] mt-1 tracking-tight count-pop">{totalChanges}</p>
              </div>
            </div>
            <Link href="/dashboard/billing" className="card-glass card-lift card-enter p-3 sm:p-6 !border-[var(--accent-ember)]/15 relative overflow-hidden block hover:!border-[var(--accent-ember)]/30 transition">
              <div className="absolute inset-0 opacity-[0.03]"><Image src="/assets/pat-scales.webp" alt="" fill className="object-cover" /></div>
              <div className="relative z-10">
                <p className="text-sm text-[var(--accent-ember)] font-semibold uppercase tracking-[0.12em]">Plan</p>
                <p className="text-lg font-bold text-[var(--accent-ember)] mt-2 capitalize">{org.plan}</p>
              </div>
            </Link>
          </div>

          {/* Activity Feed */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Image src="/assets/camo-watch.webp" alt="Camo watching activity" width={22} height={22} />
                Activity
              </h2>
            </div>
            <div className="card-glass p-3 rounded-xl">
              <ActivityFeed activities={recentChanges.map((c: any) => ({
                id: c.id,
                monitorId: c.monitorId,
                monitorName: c.monitorName || undefined,
                type: c.importanceScore >= 7 ? "alert" as const : "change" as const,
                message: c.summary,
                timestamp: c.createdAt,
                importance: c.importanceScore,
              }))} />
            </div>
          </div>

          {/* Monitors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[var(--text-cream)]">Monitors</h2>
              <Link href="/dashboard/monitors/new" className="text-sm text-[var(--accent-lime)] hover:underline font-medium">+ Add</Link>
            </div>
            <div className="space-y-2">
              {allMonitors.map((m: any) => (
                <MonitorCard
                  key={m.id}
                  id={m.id}
                  name={m.name}
                  url={m.url}
                  checkFrequency={m.checkFrequency}
                  healthStatus={m.healthStatus || "healthy"}
                  isActive={m.isActive && !m.isPaused}
                  isPaused={m.isPaused}
                  lastCheckedAt={m.lastCheckedAt}
                  nextCheckAt={m.nextCheckAt}
                  changesCount={m.totalChanges}
                  totalChecks={m.totalChecks}
                  tags={m.tags}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
