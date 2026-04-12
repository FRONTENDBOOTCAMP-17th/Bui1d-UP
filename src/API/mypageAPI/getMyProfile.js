export const getMyProfile = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error(
        "계정 인증에 에러가 발생하였습니다. 다시 로그인해주세요.",
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.errorCode ?? "프로필 조회 실패");
    }

    return json.data;
  } catch (error) {
    console.error("프로필 조회 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
