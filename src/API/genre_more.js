export const getGenreMore = async (genre, offset = 0, limit = 20) => {
  try {
    const params = new URLSearchParams({ offset, limit });
    if (genre) {
      params.set("genre", genre);
    } // 최신은 genre 없이 요청  (500 에러 상황)

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
      throw new Error("Failed to fetch genre list");
    }
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching genre list:", error);
    return null;
  }
};
