export const getProfileNickname = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    const res = await response.json();
    return res.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};
