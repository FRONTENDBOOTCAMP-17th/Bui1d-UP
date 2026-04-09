import {
  setupInput,
  setupToggle,
  setupPasswordCheck,
} from "../../components/input.js";
import { sendEmailCode } from "../../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../../API/accountAPI/checkEmailCode.js";

// 기존 필드 연결
setupInput("username");
setupInput("nickname");
setupInput("password");
setupToggle("password");
setupPasswordCheck();
setupToggle("password-check");

// 이메일 필드 연결
setupInput("email");

// 인증 코드 필드 연결
setupInput("email-code");

// 이메일 인증 상태
let emailUuid = null;
let isEmailVerified = false;

const emailInput = document.getElementById("email");
const emailHint = document.getElementById("email-hint");
const emailCodeInput = document.getElementById("email-code");
const emailCodeHint = document.getElementById("email-code-hint");
const sendCodeBtn = document.getElementById("send-code-btn");
const verifyCodeBtn = document.getElementById("verify-code-btn");

// 인증코드 발송
sendCodeBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    emailHint.textContent = "이메일을 입력하세요.";
    emailHint.className = "text-hint error";
    return;
  }

  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = "발송 중...";

  try {
    emailUuid = await sendEmailCode(email);
    isEmailVerified = false;
    emailHint.textContent = "인증코드가 발송되었습니다. 이메일을 확인하세요.";
    emailHint.className = "text-hint success";
  } catch (e) {
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
  verifyCodeBtn.textContent = "확인 중...";

  try {
    await checkEmailCode(emailUuid, code);
    isEmailVerified = true;
    emailCodeHint.textContent = "이메일 인증이 완료되었습니다.";
    emailCodeHint.className = "text-hint success";
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
