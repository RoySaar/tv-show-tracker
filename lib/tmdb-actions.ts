"use server"

// Server actions for TMDB API calls - keeps API key secure
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function searchTMDBShows(query: string) {
  if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY not configured, using mock data")
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()

    return (
      data.results?.map((show: any) => ({
        id: show.id.toString(),
        title: show.name,
        overview: show.overview,
        posterPath: show.poster_path,
        firstAirDate: show.first_air_date,
        totalSeasons: show.number_of_seasons,
        rating: show.vote_average,
      })) || []
    )
  } catch (error) {
    console.error("Error searching TMDB shows:", error)
    return []
  }
}

export async function getTMDBShowDetails(id: string) {
  if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY not configured, using mock data")
    return null
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const show = await response.json()

    return {
      id: show.id.toString(),
      title: show.name,
      originalTitle: show.original_name,
      overview: show.overview,
      posterPath: show.poster_path,
      backdropPath: show.backdrop_path,
      firstAirDate: show.first_air_date,
      lastAirDate: show.last_air_date,
      status: show.status,
      genres: show.genres?.map((g: any) => g.name) || [],
      network: show.networks?.[0]?.name,
      rating: show.vote_average,
      voteCount: show.vote_count,
      totalSeasons: show.number_of_seasons,
      totalEpisodes: show.number_of_episodes,
      runtime: show.episode_run_time?.[0],
      language: show.original_language,
      country: show.origin_country?.[0],
    }
  } catch (error) {
    console.error("Error fetching TMDB show details:", error)
    return null
  }
}
