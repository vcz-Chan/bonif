import { API_URL, buildBackendHeaders, toJsonResponse } from "@/lib/server/backend-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const response = await fetch(
    `${API_URL}/admin/chat-sessions/recent-activities${query ? `?${query}` : ""}`,
    {
      headers: buildBackendHeaders(request),
      cache: "no-store"
    }
  );

  return toJsonResponse(response);
}
