export const getDetail = async (postId) => {
  try {
    console.log("Fetching detail for postId:", postId);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/movies/${postId}`,
      {
        method: "GET",
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
    console.error(error);
  }
};
