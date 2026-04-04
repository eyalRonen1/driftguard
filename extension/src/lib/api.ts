/** Shared API client — all calls to zikit.ai with Bearer auth */

import { API_BASE } from "./constants";
import { getAuth, clearAuth } from "./storage";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = await getAuth();
  if (!auth?.apiKey) throw new ApiError(401, "Not authenticated");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.apiKey}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    await clearAuth();
    throw new ApiError(401, "API key expired or revoked");
  }

  if (res.status === 429) {
    throw new ApiError(429, "Rate limited — try again in a moment");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Request failed");
  }

  return data as T;
}

/** Verify API key and get org info */
export async function verifyKey(apiKey: string) {
  const res = await fetch(`${API_BASE}/api/v1/extension/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return res.json();
}

/** List monitors */
export async function getMonitors() {
  return request<{ monitors: any[]; plan: string }>("/api/v1/monitors");
}

/** Get monitor with recent changes */
export async function getMonitor(id: string) {
  return request<{ monitor: any; changes: any[] }>(`/api/v1/monitors/${id}`);
}

/** Create monitor */
export async function createMonitor(data: {
  name: string;
  url: string;
  checkFrequency?: string;
  cssSelector?: string;
  useCase?: string;
  tags?: string;
}) {
  return request<{ monitor: any }>("/api/v1/monitors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Trigger manual check */
export async function triggerCheck(monitorId: string) {
  return request(`/api/v1/monitors/${monitorId}/check`, { method: "POST" });
}

/** Pause/resume monitor */
export async function updateMonitor(monitorId: string, data: Record<string, any>) {
  return request(`/api/v1/monitors/${monitorId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** Get badge count */
export async function getBadgeCount() {
  return request<{ unreadChanges: number }>("/api/v1/extension/badge-count");
}

export { ApiError };
