export type WatchStatus = "not-watched" | "watching" | "watched"

export interface Season {
  id: number
  status: WatchStatus
  watchedDate?: string // Format: "YYYY-MM" - when completed
  startedDate?: string // Format: "YYYY-MM" - when started watching
}

export interface ShowMetadata {
  id: string // External DB ID (TMDB, TVDB, etc.)
  title: string
  originalTitle?: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  firstAirDate?: string
  lastAirDate?: string
  status?: "Returning Series" | "Ended" | "Canceled" | "In Production"
  genres?: string[]
  network?: string
  rating?: number
  voteCount?: number
  totalSeasons?: number
  totalEpisodes?: number
  runtime?: number
  language?: string
  country?: string
}

export interface UserShow {
  id: number // Local user ID
  externalId?: string // Reference to external DB
  title: string // User can override title
  seasons: Season[]
  metadata?: ShowMetadata
  addedDate: string
  lastUpdated: string
  userRating?: number
  userNotes?: string
  isFavorite?: boolean
}

export interface ShowSearchResult {
  id: string
  title: string
  overview: string
  posterPath?: string
  firstAirDate?: string
  totalSeasons?: number
  rating?: number
}
