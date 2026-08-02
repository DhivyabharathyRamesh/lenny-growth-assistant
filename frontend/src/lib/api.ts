import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export interface SessionSummary {
  id: string;
  title: string;
  created_at: string;
}

export interface ApiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: string | null;
  created_at: string;
}

export interface SessionDetail {
  id: string;
  title: string;
  created_at: string;
  messages: ApiMessage[];
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  artifact?: string | null;
}

export interface HealthInfo {
  llm_provider: string;
  model: string;
  database: string;
}

export async function fetchSessions(): Promise<SessionSummary[]> {
  const { data } = await api.get<SessionSummary[]>("/sessions/");
  return data;
}

export async function fetchSession(sessionId: string): Promise<SessionDetail> {
  const { data } = await api.get<SessionDetail>(`/sessions/${sessionId}`);
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/sessions/${sessionId}`);
}

export async function sendChatMessage(
  message: string,
  sessionId: string | null
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat/", {
    session_id: sessionId,
    message,
  });
  return data;
}

export async function fetchApiInfo(): Promise<HealthInfo> {
  const { data } = await api.get<{
    llm_provider: string;
    model: string;
    database: string;
  }>("/");
  return {
    llm_provider: data.llm_provider,
    model: data.model,
    database: data.database,
  };
}
