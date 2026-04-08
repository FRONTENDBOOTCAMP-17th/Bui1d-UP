export const getDetail = async (postId) => {
  try {
    const response = await fetch(
      `${import.meta.VITE_API_URL}/movies/${postId}`,
      {
        mehtod: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching detail:", error);
  }
};
