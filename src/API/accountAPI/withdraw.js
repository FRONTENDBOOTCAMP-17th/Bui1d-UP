export const withdraw = async (password) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/withdraw`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ password }),
      },
    );

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message ?? "회원탈퇴 실패");
    }

    localStorage.removeItem("accessToken");
  } catch (error) {
    console.error("회원탈퇴 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
