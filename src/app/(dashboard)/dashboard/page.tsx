import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { db } from "@/lib/db";
import { chatbots, scanRuns } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { org } = await ensureUserAndOrg(user);

  // Fetch chatbots with their latest scan
  const bots = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.orgId, org.id))
    .orderBy(desc(chatbots.createdAt));

  // Fetch recent scans
  const recentScans = await db
    .select()
    .from(scanRuns)
    .where(eq(scanRuns.orgId, org.id))
    .orderBy(desc(scanRuns.createdAt))
    .limit(5);

  const activeBots = bots.filter((b) => b.isActive).length;
  const avgHealth = bots.length > 0
    ? bots.reduce((sum, b) => sum + (b.lastHealthScore ? parseFloat(b.lastHealthScore) : 0), 0) / bots.length
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user.user_metadata?.full_name || user.email}
        </p>
      </div>

      {bots.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No chatbots yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add your first chatbot to start monitoring its responses.
            We&apos;ll alert you the moment something drifts.
          </p>
          <Link
            href="/dashboard/bots"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add your first chatbot
          </Link>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Active Bots</p>
              <p className="text-3xl font-bold text-gray-900">{activeBots}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Avg Health Score</p>
              <p className={`text-3xl font-bold ${avgHealth >= 80 ? "text-green-600" : avgHealth >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {avgHealth > 0 ? `${avgHealth.toFixed(0)}%` : "—"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <p className="text-3xl font-bold text-gray-900 capitalize">{org.plan}</p>
            </div>
          </div>

          {/* Chatbots */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Chatbots</h2>
              <Link href="/dashboard/bots" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-3">
              {bots.slice(0, 5).map((bot) => (
                <Link
                  key={bot.id}
                  href={`/dashboard/bots/${bot.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{bot.name}</h3>
                    <p className="text-sm text-gray-400 truncate max-w-md">{bot.endpointUrl}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      !bot.lastHealthScore ? "bg-gray-100 text-gray-600" :
                      parseFloat(bot.lastHealthScore) >= 80 ? "bg-green-100 text-green-700" :
                      parseFloat(bot.lastHealthScore) >= 50 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {bot.lastHealthScore ? `${parseFloat(bot.lastHealthScore).toFixed(0)}%` : "No scans"}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${bot.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent scans */}
          {recentScans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Scans</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Trigger</th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Tests</th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Health</th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentScans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm text-gray-600">
                          {new Date(scan.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500 capitalize">{scan.triggerType}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">
                          {scan.passedTests}/{scan.totalTests} passed
                        </td>
                        <td className={`px-5 py-3 text-sm font-medium ${
                          !scan.healthScore ? "text-gray-400" :
                          parseFloat(scan.healthScore) >= 80 ? "text-green-600" :
                          parseFloat(scan.healthScore) >= 50 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {scan.healthScore ? `${parseFloat(scan.healthScore).toFixed(0)}%` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            scan.status === "completed" ? "bg-green-100 text-green-700" :
                            scan.status === "running" ? "bg-blue-100 text-blue-700" :
                            scan.status === "failed" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {scan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
