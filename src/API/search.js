import { redirectOnAuthFail } from "@/utils/auth.js";

export const searchMovies = async (keyword, offset = 0, limit = 20) => {
  try {
    const params = new URLSearchParams({
      search: keyword,
      sort: "DESC",
      offset,
      limit,
    });
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/movies?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    if (!response.ok) {
      if (redirectOnAuthFail(response)) return null;
      if (response.status === 404) return [];
      throw new Error("Failed to fetch search results");
    }
    const json = await response.json();
    console.log("Search results fetched successfully:", json);
<<<<<<< HEAD
    return json.data.results ?? [];
=======
    return Array.isArray(json.data) ? json.data : (json.data.results ?? []);
>>>>>>> 693d6e5885187716760ba8f53eaa9640e43c27a1
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
};
