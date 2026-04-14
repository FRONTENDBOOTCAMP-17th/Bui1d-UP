export const changeEmail = async (email, uuid) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error(
        "계정 인증에 에러가 발생하였습니다. 다시 로그인해주세요.",
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/email`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, uuid }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.errorCode ?? "이메일 변경 실패");
    }

    return json.data;
  } catch (error) {
    console.error("이메일 변경 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
