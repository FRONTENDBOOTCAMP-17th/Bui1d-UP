export const login = async (id, password) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.errorCode ?? "로그인 실패");
    }

    alert(`로그인에 성공하였습니다!`);

    return json.data;
  } catch (error) {
    console.error("로그인 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
