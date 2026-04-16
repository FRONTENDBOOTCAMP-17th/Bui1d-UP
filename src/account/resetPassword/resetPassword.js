import { sendResetCode } from "../../API/accountAPI/sendResetCode.js";
import { verifyResetCode } from "../../API/accountAPI/verifyResetCode.js";
import { resetPassword } from "../../API/accountAPI/resetPassword.js";
import { setupInput, setupToggle, setupPasswordCheck } from "../../components/input.js";
import { showToast } from "@/utils/toast.js";

setupInput("email");
setupInput("email-code");
setupInput("new-password");
setupToggle("new-password");
setupPasswordCheck();
setupToggle("password-check");

// 이메일 인증 상태
let emailUuid = null;
let isEmailVerified = false;
let resetToken = null;

const emailInput = document.getElementById("email");
const emailHint = document.getElementById("email-hint");
const emailCodeInput = document.getElementById("email-code");
const emailCodeHint = document.getElementById("email-code-hint");
const sendCodeBtn = document.getElementById("send-code-btn");
const verifyCodeBtn = document.getElementById("verify-code-btn");

const passwordInput = document.getElementById("new-password");
const passwordHint = document.getElementById("new-password-hint");
const passwordCheckInput = document.getElementById("password-check");
const passwordCheckHint = document.getElementById("password-check-hint");
const resetPasswordForm = document.getElementById("reset-password-form");
const submitBtn = resetPasswordForm.querySelector("button[type='submit']");

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
    emailUuid = await sendResetCode(email);
    isEmailVerified = false;
    resetToken = null;
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
    resetToken = await verifyResetCode(emailUuid, code);
    isEmailVerified = true;
    emailCodeHint.textContent = "이메일 인증이 완료되었습니다.";
    emailCodeHint.className = "text-hint success";
    passwordInput.focus();
  } catch (e) {
    isEmailVerified = false;
    resetToken = null;
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
const resetInfo = [
  [emailInput, emailHint],
  [emailCodeInput, emailCodeHint],
  [passwordInput, passwordHint],
];

resetInfo.forEach(([input, hint]) => {
  input.addEventListener("input", () => {
    hint.textContent = "";
    hint.className = "text-hint";
  });
});

// 비밀번호 재설정 버튼 클릭 시 이벤트
resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isEmailVerified || !resetToken) {
    emailCodeHint.textContent = "이메일 인증을 완료해주세요.";
    emailCodeHint.className = "text-hint error";
    emailCodeInput.focus();
    return;
  }

  const pwd = passwordInput.value;
  const pwdCheck = passwordCheckInput.value;

  // 비밀번호 일치 여부 확인
  if (pwd !== pwdCheck) {
    passwordCheckHint.textContent = "비밀번호가 일치하지 않습니다.";
    passwordCheckHint.className = "text-hint error";
    passwordCheckInput.focus();
    return;
  }

  // 비밀번호 재설정 요청 시 버튼 비활성화
  submitBtn.disabled = true;

  try {
    await resetPassword(resetToken, pwd);
    showToast("비밀번호가 재설정되었습니다. 다시 로그인해주세요.");
    setTimeout(() => { location.href = "../login/login.html"; }, 1500);
  } catch (error) {
    passwordHint.textContent =
      "비밀번호 재설정에 실패했습니다. 다시 시도해주세요.";
    passwordHint.className = "text-hint error";
  } finally {
    submitBtn.disabled = false;
  }
});
