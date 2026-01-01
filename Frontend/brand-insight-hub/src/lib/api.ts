// Change this to your backend URL (e.g., ngrok URL for remote testing)
// For local development: "http://127.0.0.1:8000"
// For ngrok: "https://your-ngrok-url.ngrok.io"
export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface AnalyzeRequest {
  my_brand: string;
  category: string;
  competitors: string;
}

export interface LeaderboardEntry {
  brand: string;
  visibility_score: number;
  citation_share: number;
  is_me: boolean;
}

export interface RankDistribution {
  "1st": number;
  "2nd": number;
  "3rd+": number;
}

export interface Metrics {
  visibility_score: number;
  total_citations: number;
  total_answers: number;
  leaderboard: LeaderboardEntry[];
  rank_distribution: RankDistribution;
  top_cited_domains: Record<string, number>;
  top_cited_pages: Record<string, number>;
}

export interface Citation {
  text: string;
  url: string;
}

export interface PromptItem {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
}

export interface HistoryEntry {
  timestamp: string;
  visibility_score: number;
}

export interface LatestResponse {
  metrics: Metrics;
  recommendations: string[];
}

export async function analyzeRequest(data: AnalyzeRequest): Promise<void> {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze");
  }
}

export async function getLatest(): Promise<LatestResponse> {
  const response = await fetch(`${BASE_URL}/latest`);
  if (!response.ok) {
    throw new Error("Failed to fetch latest data");
  }
  return response.json();
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
}

export async function getMentionedPrompts(): Promise<PromptItem[]> {
  const response = await fetch(`${BASE_URL}/prompts/mentioned`);
  if (!response.ok) {
    throw new Error("Failed to fetch mentioned prompts");
  }
  return response.json();
}

export async function getNotMentionedPrompts(): Promise<PromptItem[]> {
  const response = await fetch(`${BASE_URL}/prompts/not-mentioned`);
  if (!response.ok) {
    throw new Error("Failed to fetch not-mentioned prompts");
  }
  return response.json();
}
