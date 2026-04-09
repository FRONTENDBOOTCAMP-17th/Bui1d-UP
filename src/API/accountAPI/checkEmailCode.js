export const checkEmailCode = async (uuid, checkCode) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/email/code/check`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, checkCode }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.errorCode ?? "인증코드 확인 실패");
    }

    return json.data;
  } catch (error) {
    console.error("인증코드 확인 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
