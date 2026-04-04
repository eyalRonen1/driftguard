/** Chrome storage helpers for API key and cached data */

interface StoredAuth {
  apiKey: string;
  org: { id: string; name: string; plan: string };
  user: { email: string; name: string };
  limits: Record<string, any>;
}

export async function getAuth(): Promise<StoredAuth | null> {
  const result = await chrome.storage.local.get("zikit_auth");
  return result.zikit_auth || null;
}

export async function setAuth(auth: StoredAuth): Promise<void> {
  await chrome.storage.local.set({ zikit_auth: auth });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove(["zikit_auth", "zikit_last_seen"]);
}

export async function getLastSeen(): Promise<string | null> {
  const result = await chrome.storage.local.get("zikit_last_seen");
  return result.zikit_last_seen || null;
}

export async function setLastSeen(timestamp: string): Promise<void> {
  await chrome.storage.local.set({ zikit_last_seen: timestamp });
}
