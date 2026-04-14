import { redirectOnAuthFail } from "@/utils/auth.js";

export const getMainList = async () => {
  try {
    console.log("Fetching main list from API...");
    console.log(`accessToken: ${localStorage.getItem("accessToken")}`);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/movies/home`,
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
      throw new Error("Failed to fetch main list");
    }
    const json = await response.json();
    console.log("Main list response:", json);
    return json.data;
  } catch (error) {
    console.error("Error fetching main list:", error);
    return null;
  }
};
