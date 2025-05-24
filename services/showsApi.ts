// Mock API service - client-side only handles data formatting
export class ShowsApiService {
  getImageUrl(path: string, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w342"): string {
    if (!path) return "/placeholder.svg?height=500&width=342&text=No+Image"
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  // Mock data for development - replace with server action calls
  async searchShows(query: string): Promise<any[]> {
    try {
      // Mock results for development
      const mockResults: any[] = [
        {
          id: "1399",
          title: "Game of Thrones",
          overview: "Seven noble families fight for control of the mythical land of Westeros.",
          posterPath: "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
          firstAirDate: "2011-04-17",
          totalSeasons: 8,
          rating: 8.4,
        },
        {
          id: "1396",
          title: "Breaking Bad",
          overview: "A high school chemistry teacher turned methamphetamine producer.",
          posterPath: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
          firstAirDate: "2008-01-20",
          totalSeasons: 5,
          rating: 9.5,
        },
        {
          id: "60735",
          title: "The Flash",
          overview:
            "After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma.",
          posterPath: "/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg",
          firstAirDate: "2014-10-07",
          totalSeasons: 9,
          rating: 7.7,
        },
        {
          id: "1418",
          title: "The Big Bang Theory",
          overview: "The sitcom is centered on five characters living in Pasadena, California.",
          posterPath: "/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg",
          firstAirDate: "2007-09-24",
          totalSeasons: 12,
          rating: 8.2,
        },
      ]

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      return mockResults.filter((show) => show.title.toLowerCase().includes(query.toLowerCase()))
    } catch (error) {
      console.error("Error searching shows:", error)
      return []
    }
  }

  async getShowDetails(id: string): Promise<any | null> {
    try {
      // Mock implementation with more varied data
      const mockShows: Record<string, any> = {
        "1399": {
          id: "1399",
          title: "Game of Thrones",
          originalTitle: "Game of Thrones",
          overview:
            "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond.",
          posterPath: "/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
          backdropPath: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
          firstAirDate: "2011-04-17",
          lastAirDate: "2019-05-19",
          status: "Ended",
          genres: ["Drama", "Action & Adventure", "Sci-Fi & Fantasy"],
          network: "HBO",
          rating: 8.4,
          voteCount: 11504,
          totalSeasons: 8,
          totalEpisodes: 73,
          runtime: 57,
          language: "en",
          country: "US",
        },
        "1396": {
          id: "1396",
          title: "Breaking Bad",
          originalTitle: "Breaking Bad",
          overview:
            "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
          posterPath: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
          backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
          firstAirDate: "2008-01-20",
          lastAirDate: "2013-09-29",
          status: "Ended",
          genres: ["Drama", "Crime"],
          network: "AMC",
          rating: 9.5,
          voteCount: 8503,
          totalSeasons: 5,
          totalEpisodes: 62,
          runtime: 47,
          language: "en",
          country: "US",
        },
        "60735": {
          id: "60735",
          title: "The Flash",
          originalTitle: "The Flash",
          overview:
            "After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma. Months later he awakens with the power of super speed, granting him the ability to move through Central City like an unseen guardian angel.",
          posterPath: "/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg",
          backdropPath: "/9Jmd1OumCjaXDkpllbSGi2EpJvl.jpg",
          firstAirDate: "2014-10-07",
          lastAirDate: "2023-05-24",
          status: "Ended",
          genres: ["Drama", "Sci-Fi & Fantasy"],
          network: "The CW",
          rating: 7.7,
          voteCount: 4521,
          totalSeasons: 9,
          totalEpisodes: 184,
          runtime: 44,
          language: "en",
          country: "US",
        },
        "1418": {
          id: "1418",
          title: "The Big Bang Theory",
          originalTitle: "The Big Bang Theory",
          overview:
            "The sitcom is centered on five characters living in Pasadena, California: roommates Leonard Hofstadter and Sheldon Cooper; Penny, a waitress and aspiring actress who lives across the hall; and Leonard and Sheldon's equally geeky and socially awkward friends and co-workers, mechanical engineer Howard Wolowitz and astrophysicist Raj Koothrappali.",
          posterPath: "/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg",
          backdropPath: "/nGsNruW3W27V6r4gkyc3iiEGsKR.jpg",
          firstAirDate: "2007-09-24",
          lastAirDate: "2019-05-16",
          status: "Ended",
          genres: ["Comedy"],
          network: "CBS",
          rating: 8.2,
          voteCount: 6789,
          totalSeasons: 12,
          totalEpisodes: 279,
          runtime: 22,
          language: "en",
          country: "US",
        },
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      return mockShows[id] || null
    } catch (error) {
      console.error("Error fetching show details:", error)
      return null
    }
  }
}

export const showsApi = new ShowsApiService()
