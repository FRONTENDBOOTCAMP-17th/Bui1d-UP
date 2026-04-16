export const sendResetCode = async (email) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/password/reset/send`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errorCode ?? "인증코드 전송 실패");
  }

  // 인증코드 전송에 성공하면 해당 UUID를 보내줌
  return json.data.uuid;
};
