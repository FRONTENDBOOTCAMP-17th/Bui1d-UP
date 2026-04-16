import { showToast } from "@/utils/toast.js";

export const signup = async (id, password, email, nickname, uuid) => {
  const userData = {
    id: id.trim(),
    password,
    email: email.trim(),
    nickname: nickname.trim(),
    uuid: uuid.trim(),
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.errorCode ?? "회원가입 실패");
    }

    showToast("회원가입에 성공하였습니다!");

    return json.data;
  } catch (error) {
    console.error("회원가입 에러가 발생하였습니다:", error.message);
    throw error;
  }
};
