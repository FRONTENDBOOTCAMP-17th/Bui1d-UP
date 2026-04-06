export const getMainList = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/movies/home`);
    if (!response.ok) {
      throw new Error("Failed to fetch main list");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching main list:", error);
    return null;
  }
};
