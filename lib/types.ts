export type CollectionType = 1 | 2 | 3 | 4 | 5;
export type WatchStatus = 0 | 1 | 2 | 3;

export interface BgmUser {
  id: number;
  username: string;
  nickname: string;
  sign?: string;
  avatar?: string;
  url?: string;
}

export interface SubjectRating {
  score?: number;
  rank?: number;
  total?: number;
}

export interface SubjectSummary {
  id: number;
  name: string;
  nameCn: string;
  cover: string;
  coverRemote?: string;
  airDate?: string;
  totalEpisodes?: number;
  rating?: SubjectRating;
  collectionType: CollectionType;
  epStatus: number;
  rate: number;
  updatedAt?: string;
}

export interface Episode {
  id: number;
  ep: number | null;
  sort: number;
  type: number;
  name: string;
  nameCn: string;
  airdate: string;
  watchStatus: WatchStatus;
  durationSeconds?: number;
  watchedAt?: number;
}

export interface Subject extends SubjectSummary {
  summary: string;
  tags: string[];
  platform?: string;
  nsfw?: boolean;
  volStatus: number;
  comment?: string;
  private: boolean;
  episodes: Episode[];
}

export interface BangumiDataFile {
  lastSyncAt: string;
  user: BgmUser;
}

export interface BangumiIndexFile {
  lastSyncAt: string;
  subjects: SubjectSummary[];
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary?: string;
  spoiler: boolean;
  subjectId?: number;
  ep?: number;
  anime?: string;
  content: string;
  wordCount: number;
  readingMinutes: number;
}

export interface Quote {
  text: string;
  source?: string;
  character?: string;
}
