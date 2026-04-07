import { setupInput, setupToggle } from "../../components/input.js";
import { login } from "@/API/accountAPI/login.js";

setupInput("username");
setupInput("password");
setupToggle("password");

const form = document.getElementById("login-form");
const usernameHint = document.getElementById("username-hint");
const passwordHint = document.getElementById("password-hint");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const { token, user } = await login(id, password);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("nickname", user.nickname);
    location.href = "../../main/main_list/main_list.html";
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      usernameHint.textContent = "존재하지 않는 아이디입니다.";
      usernameHint.className = "text-hint error";
    } else if (err.message === "UNAUTHORIZED") {
      passwordHint.textContent = "비밀번호가 올바르지 않습니다.";
      passwordHint.className = "text-hint error";
    } else {
      passwordHint.textContent = "로그인에 실패했습니다. 다시 시도해주세요.";
      passwordHint.className = "text-hint error";
    }
  }
});
