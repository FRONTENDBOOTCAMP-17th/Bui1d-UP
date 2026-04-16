export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/password/reset/change`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message ?? "비밀번호 재설정 실패");
    }

    return;
  } catch (error) {
    console.error("비밀번호 재설정 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
