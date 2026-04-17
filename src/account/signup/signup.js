import { signup } from "../../API/accountAPI/signup.js";
import {
  setupInput,
  setupToggle,
  setupPasswordCheck,
} from "../../components/input.js";
import { sendEmailCode } from "../../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../../API/accountAPI/checkEmailCode.js";
import { showToast } from "@/utils/toast.js";

setupInput("username");
setupInput("nickname");
setupInput("new-password");
setupToggle("new-password");
setupInput("email");
setupInput("email-code");
setupPasswordCheck();
setupToggle("password-check");

// 이메일 인증 상태
let emailUuid = null;
let isEmailVerified = false;

const emailInput = document.getElementById("email");
const emailHint = document.getElementById("email-hint");
const emailCodeInput = document.getElementById("email-code");
const emailCodeHint = document.getElementById("email-code-hint");
const sendCodeBtn = document.getElementById("send-code-btn");
const verifyCodeBtn = document.getElementById("verify-code-btn");

const usernameInput = document.getElementById("username");
const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("new-password");
const usernameHint = document.getElementById("username-hint");
const nicknameHint = document.getElementById("nickname-hint");
const passwordHint = document.getElementById("new-password-hint");
const signupForm = document.getElementById("signup-form");
const submitBtn = signupForm.querySelector("button[type='submit']");

// 이메일 인증코드 발송
sendCodeBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    emailHint.textContent = "이메일을 입력하세요.";
    emailHint.className = "text-hint error";
    return;
  }

  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = "인증코드 발송 중...";

  try {
    emailUuid = await sendEmailCode(email);
    isEmailVerified = false;
    emailHint.textContent = "인증코드가 발송되었습니다. 이메일을 확인하세요.";
    emailHint.className = "text-hint success";
    emailCodeInput.focus();
  } catch (e) {
    console.error(e);
    emailHint.textContent =
      "인증코드 발송에 실패했습니다. 이메일을 확인하세요.";
    emailHint.className = "text-hint error";
  } finally {
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = "인증코드 발송";
  }
});

// 인증코드 확인
verifyCodeBtn.addEventListener("click", async () => {
  if (!emailUuid) {
    emailCodeHint.textContent = "먼저 인증코드를 발송하세요.";
    emailCodeHint.className = "text-hint error";
    return;
  }

  const code = emailCodeInput.value.trim();
  if (!code) {
    emailCodeHint.textContent = "인증 코드를 입력하세요.";
    emailCodeHint.className = "text-hint error";
    return;
  }

  verifyCodeBtn.disabled = true;
  verifyCodeBtn.textContent = "인증코드 확인 중...";

  try {
    await checkEmailCode(emailUuid, code);
    isEmailVerified = true;
    emailCodeHint.textContent = "이메일 인증이 완료되었습니다.";
    emailCodeHint.className = "text-hint success";
    usernameInput.focus();
  } catch (e) {
    isEmailVerified = false;
    if (e.message === "EXPIRED") {
      emailCodeHint.textContent =
        "인증코드가 만료되었습니다. 다시 발송해주세요.";
    } else {
      emailCodeHint.textContent = "인증코드가 잘못되었습니다.";
    }
    emailCodeHint.className = "text-hint error";
  } finally {
    verifyCodeBtn.disabled = false;
    verifyCodeBtn.textContent = "확인";
  }
});

// input에 다시 입력 시 힌트 메세지 초기화
const signupInfo = [
  [usernameInput, usernameHint],
  [nicknameInput, nicknameHint],
  [passwordInput, passwordHint],
  [emailInput, emailHint],
  [emailCodeInput, emailCodeHint],
];

signupInfo.forEach(([input, hint]) => {
  input.addEventListener("input", () => {
    hint.textContent = "";
    hint.className = "text-hint";
  });
});

// 회원가입 버튼 클릭 시 이벤트
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isEmailVerified) {
    emailCodeHint.textContent = "이메일 인증을 완료해주세요.";
    emailCodeHint.className = "text-hint error";
    return;
  }

  const id = usernameInput.value.trim();
  const pwd = passwordInput.value;
  const pwdCheck = document.getElementById("password-check").value;
  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();

  if (!id || !pwd || !nickname || !email) {
    passwordHint.textContent = "모든 항목을 입력해주세요.";
    passwordHint.className = "text-hint error";
    return;
  }

  // 비밀번호 일치 여부 확인
  if (pwd !== pwdCheck) {
    const passwordCheckHint = document.getElementById("password-check-hint");
    passwordCheckHint.textContent = "비밀번호가 일치하지 않습니다.";
    passwordCheckHint.className = "text-hint error";
    return;
  }

  // 회원가입 요청 시 버튼 비활성화
  submitBtn.disabled = true;

  try {
    await signup(id, pwd, email, nickname, emailUuid);
    showToast("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다");
    setTimeout(() => { location.href = "../../account/login/login.html"; }, 1500);
  } catch (error) {
    if (error.message === "DUPLICATE_ID") {
      usernameHint.textContent = "이미 사용 중인 아이디입니다.";
      usernameHint.className = "text-hint error";
    } else if (error.message === "DUPLICATE_NICKNAME") {
      const nicknameHint = document.getElementById("nickname-hint");
      nicknameHint.textContent = "이미 사용 중인 닉네임입니다.";
      nicknameHint.className = "text-hint error";
    } else {
      passwordHint.textContent = "회원가입에 실패했습니다. 다시 시도해주세요.";
      passwordHint.className = "text-hint error";
    }
    submitBtn.disabled = false;
  }
});
