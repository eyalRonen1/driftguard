import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import Image from "next/image";

export const metadata = { title: "Connect Extension  - Zikit" };

export default async function ExtensionAuthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/auth/extension");

  const { user: dbUser, org } = await ensureUserAndOrg(user);

  // Auto-generate an API key for the extension (256-bit entropy)
  const randomPart = randomBytes(32).toString("hex");
  const fullKey = `zk_live_${randomPart}`;
  const keyPrefix = `zk_${randomPart.slice(0, 4)}`;
  const keyHash = createHash("sha256").update(fullKey).digest("hex");

  // Deactivate old auto-generated extension keys to make room
  await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.orgId, org.id), eq(apiKeys.name, "Chrome Extension (auto)")));

  await db.insert(apiKeys).values({
    orgId: org.id,
    userId: dbUser.id,
    name: "Chrome Extension (auto)",
    keyPrefix,
    keyHash,
  });
  const generatedKey = fullKey;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#07130f",
      color: "#F4F1E8",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
        <Image src="/assets/camo-happy.webp" alt="Camo" width={64} height={64} style={{ margin: "0 auto" }} />

        {/* Hidden element for content script to read */}
        <div id="zikit-ext-auth" data-key={generatedKey} style={{ display: "none" }} />

            <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>Connecting...</h1>
            <p style={{ color: "#9DB89D", fontSize: 14, marginTop: 6 }}>
              The extension is connecting automatically.
              <br />You can close this tab in a moment.
            </p>

            <div style={{
              marginTop: 20,
              width: 32,
              height: 32,
              border: "3px solid rgba(124,203,139,0.2)",
              borderTopColor: "#7CCB8B",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "20px auto",
            }} />

            {/* Fallback for users without extension */}
            <p id="zikit-ext-fallback" style={{ color: "#9DB89D", fontSize: 11, marginTop: 24, display: "none" }}>
              Extension not detected? Copy this key manually:
            </p>
            <code id="zikit-ext-fallback-key" style={{
              display: "none",
              fontSize: 12,
              fontFamily: "monospace",
              background: "#0b1c15",
              padding: "8px 12px",
              borderRadius: 8,
              wordBreak: "break-all",
              color: "#F4F1E8",
              marginTop: 8,
            }}>
              {generatedKey}
            </code>

            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Show fallback after 3 seconds if extension hasn't picked up the key */}
            <script dangerouslySetInnerHTML={{ __html: `
              setTimeout(function() {
                var el = document.getElementById('zikit-ext-auth');
                if (el && !el.dataset.picked) {
                  document.getElementById('zikit-ext-fallback').style.display = 'block';
                  document.getElementById('zikit-ext-fallback-key').style.display = 'block';
                }
              }, 3000);
            `}} />

        <p style={{ color: "#9DB89D", fontSize: 12, marginTop: 20 }}>
          <a href="/dashboard" style={{ color: "#7CCB8B", textDecoration: "none" }}>
            ← Back to Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
