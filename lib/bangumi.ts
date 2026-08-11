const BASE = "https://api.bgm.tv";
const MIN_INTERVAL_MS = 1100;

let lastRequestAt = 0;

interface ApiPage<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiUserCollection {
  subject_id: number;
  subject_type: number;
  rate: number;
  type: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  tags: string[];
  ep_status: number;
  vol_status: number;
  updated_at: string;
  private: boolean;
  subject: {
    id: number;
    type: number;
    name: string;
    name_cn: string;
    images?: {
      large?: string;
      common?: string;
      medium?: string;
      small?: string;
      grid?: string;
    };
    date?: string;
    eps?: number;
    total_episodes?: number;
  };
}

export interface ApiEpisode {
  id: number;
  type: number;
  name: string;
  name_cn: string;
  sort: number;
  ep: number | null;
  airdate: string;
  duration?: string;
}

export interface ApiUserEpisode {
  episode: ApiEpisode;
  type: 0 | 1 | 2 | 3;
  updated_at: number;
}

export interface ApiSubjectDetail {
  id: number;
  type: number;
  name: string;
  name_cn: string;
  summary: string;
  date?: string;
  platform?: string;
  nsfw?: boolean;
  eps?: number;
  total_episodes?: number;
  images?: {
    large?: string;
    common?: string;
    medium?: string;
    small?: string;
    grid?: string;
  };
  rating?: { score: number; rank: number; total: number };
  tags?: { name: string; count: number }[];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchBgm<T>(
  path: string,
  token?: string,
  retries = 3,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - Date.now());
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  const headers: Record<string, string> = {
    "User-Agent":
      process.env.BANGUMI_USER_AGENT || "LingFengSite/0.1 (personal site)",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init?.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    headers,
    method: init?.method ?? "GET",
    body:
      init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if ((res.status === 429 || res.status >= 500) && retries > 0) {
    const retryAfter = Number(res.headers.get("retry-after") || 5);
    await sleep(retryAfter * 1000 + 500);
    return fetchBgm<T>(path, token, retries - 1, init);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`BGM ${res.status} ${path}: ${body.slice(0, 200)}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getMe(token: string) {
  return fetchBgm<{
    id: number;
    username: string;
    nickname: string;
    sign?: string;
    avatar?: { large?: string };
    url?: string;
  }>("/v0/me", token);
}

export async function getCollections(
  username: string,
  token: string,
): Promise<ApiUserCollection[]> {
  const out: ApiUserCollection[] = [];
  const limit = 100;
  let offset = 0;

  for (;;) {
    const page = await fetchBgm<ApiPage<ApiUserCollection>>(
      `/v0/users/${username}/collections?subject_type=2&limit=${limit}&offset=${offset}`,
      token,
    );
    out.push(...page.data);
    if (out.length >= page.total || page.data.length === 0) break;
    offset += limit;
  }

  return out;
}

export async function getSubjectDetail(subjectId: number, token: string) {
  return fetchBgm<ApiSubjectDetail>(`/v0/subjects/${subjectId}`, token);
}

export async function getEpisodes(
  subjectId: number,
  token: string,
): Promise<ApiEpisode[]> {
  const out: ApiEpisode[] = [];
  const limit = 200;
  let offset = 0;

  for (;;) {
    const page = await fetchBgm<ApiPage<ApiEpisode>>(
      `/v0/episodes?subject_id=${subjectId}&type=0&limit=${limit}&offset=${offset}`,
      token,
    );
    out.push(...page.data);
    if (out.length >= page.total || page.data.length === 0) break;
    offset += limit;
  }

  return out;
}

export async function getEpisodeProgress(
  subjectId: number,
  token: string,
): Promise<ApiUserEpisode[]> {
  const out: ApiUserEpisode[] = [];
  const limit = 1000;
  let offset = 0;

  for (;;) {
    const page = await fetchBgm<ApiPage<ApiUserEpisode>>(
      `/v0/users/-/collections/${subjectId}/episodes?limit=${limit}&offset=${offset}`,
      token,
    );
    out.push(...page.data);
    if (out.length >= page.total || page.data.length === 0) break;
    offset += limit;
  }

  return out;
}

export async function patchEpisodeProgress(
  subjectId: number,
  episodeIds: number[],
  type: 0 | 1 | 2 | 3,
  token: string,
) {
  return fetchBgm<void>(
    `/v0/users/-/collections/${subjectId}/episodes`,
    token,
    3,
    { method: "PATCH", body: { episode_id: episodeIds, type } },
  );
}
