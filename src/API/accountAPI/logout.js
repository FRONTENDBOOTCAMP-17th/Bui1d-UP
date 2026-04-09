export const logout = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to log out");
    }
    localStorage.removeItem("accessToken");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
