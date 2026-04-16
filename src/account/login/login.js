import { setupInput, setupToggle } from "../../components/input.js";
import { login } from "@/API/accountAPI/login.js";

setupInput("username");
setupInput("password");
setupToggle("password");

const form = document.getElementById("login-form");
const username = document.getElementById("username");
const password = document.getElementById("password");
const usernameHint = document.getElementById("username-hint");
const passwordHint = document.getElementById("password-hint");
const logInInfo = [
  [username, usernameHint],
  [password, passwordHint],
];
const submitBtn = form.querySelector("[type=submit]");

// input에 다시 입력 시 힌트 메세지 초기화
logInInfo.forEach(([input, hint]) => {
  input.addEventListener("input", () => {
    hint.textContent = "";
    hint.className = "text-hint";
  });
});

// 로그인 버튼 클릭 시 이벤트
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = username.value.trim();
  const pwd = password.value.trim();

  if (!id || !pwd) {
    passwordHint.textContent = "아이디와 비밀번호를 입력해주세요.";
    passwordHint.className = "text-hint error";
    return;
  }

  // 로그인 요청 시 버튼 비활성화
  submitBtn.disabled = true;

  try {
    await login(id, pwd);
    alert("로그인에 성공하였습니다!");
    location.href = "../../main/main_list/main_list.html";
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      usernameHint.textContent = "존재하지 않는 아이디입니다.";
      usernameHint.className = "text-hint error";
    } else if (error.message === "UNAUTHORIZED") {
      passwordHint.textContent = "비밀번호가 올바르지 않습니다.";
      passwordHint.className = "text-hint error";
    } else if (error.message === "이미 사용 중인 닉네임입니다.") {
      alert("이미 사용 중인 닉네임입니다.");
    } else {
      passwordHint.textContent = "로그인에 실패했습니다. 다시 시도해주세요.";
      passwordHint.className = "text-hint error";
    }
  } finally {
    submitBtn.disabled = false;
  }
});
