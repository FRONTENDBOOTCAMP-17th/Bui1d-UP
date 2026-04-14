import { requireAuth } from "@/utils/auth.js";
requireAuth();

import {
  setupInput,
  setupToggle,
  setupPasswordCheck,
} from "../components/input.js";
import { getProfileNickname } from "../API/accountAPI/nickname.js";
import { changeNickname } from "../API/mypageAPI/changeNickname.js";
import { changePassword } from "../API/mypageAPI/changePassword.js";
import { changeEmail } from "../API/mypageAPI/changeEmail.js";
import { sendEmailCode } from "../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../API/accountAPI/checkEmailCode.js";
import { withdraw } from "../API/accountAPI/withdraw.js";
import { setupInput, setupToggle } from "../components/input.js";

setupInput("email");
setupInput("email-code");
setupInput("current-password");
setupInput("new-password");
setupPasswordCheck();
setupInput("nickname");

setupToggle("current-password");
setupToggle("new-password");
setupToggle("password");
setupToggle("password-check");

// 이메일 인증 상태
let emailUuid = null;
let isEmailVerified = false;

const welcomeNickname = document.getElementById("welcome-nickname");
const displayEmail = document.getElementById("display-email");

const emailInput = document.getElementById("email");
const emailHint = document.getElementById("email-hint");
const emailCodeInput = document.getElementById("email-code");
const emailCodeHint = document.getElementById("email-code-hint");
const sendCodeBtn = document.getElementById("send-code-btn");
const verifyCodeBtn = document.getElementById("verify-code-btn");
const displayNickname = document.getElementById("display-nickname");

// 프로필 불러오기
try {
  const profile = await getProfileNickname();
  welcomeNickname.textContent = profile.nickname;
  displayEmail.textContent = profile.email;
  displayNickname.textContent = profile.nickname;
} catch (error) {
  console.error("에러가 발생하였습니다:", error.message);
}

// 토스트 - 추후 수정 필요
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  toast.className = `${bgColor} px-6 py-3 rounded-lg text-white text-sm font-medium opacity-0 transition-opacity duration-300 whitespace-nowrap`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() =>
    toast.classList.replace("opacity-0", "opacity-100"),
  );
  setTimeout(() => {
    toast.classList.replace("opacity-100", "opacity-0");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 2000);
}

// 아코디언
const accordions = document.querySelectorAll(".accordion-components");

accordions.forEach((accordion) => {
  const head = accordion.querySelector(".accordion-head");
  const body = accordion.querySelector(".accordion-body");

  // 초기 상태: 모두 닫힘
  body.style.transform = "scaleY(0)";
  body.hidden = true;

  const openAccordion = (targetHead, targetBody) => {
    targetHead.setAttribute("aria-expanded", "true");
    targetHead.classList.add("open");
    targetBody.hidden = false;
    requestAnimationFrame(() => {
      targetBody.style.transform = "scaleY(1)";
    });
  };

  const closeAccordion = (targetHead, targetBody) => {
    targetHead.setAttribute("aria-expanded", "false");
    targetHead.classList.remove("open");
    targetBody.style.transform = "scaleY(0)";
    targetBody.addEventListener("transitionend", function handler() {
      targetBody.hidden = true;
      targetBody.removeEventListener("transitionend", handler);
    });
  };

  head.addEventListener("click", () => {
    const currentlyOpen = head.getAttribute("aria-expanded") === "true";

    // 다른 아코디언 닫기
    accordions.forEach((other) => {
      if (other !== accordion) {
        const otherHead = other.querySelector(".accordion-head");
        const otherBody = other.querySelector(".accordion-body");
        if (otherHead.getAttribute("aria-expanded") === "true") {
          closeAccordion(otherHead, otherBody);
        }
      }
    });

    // 현재 아코디언 토글
    if (currentlyOpen) {
      closeAccordion(head, body);
    } else {
      openAccordion(head, body);
    }
  });
});

// 핸들러
// 이메일 변경
window.handleEmailChange = async function () {
  if (!isEmailVerified) {
    showToast("인증을 먼저 완료해주세요.", "error");
    return;
  }
  const email = emailInput.value.trim();
  try {
    await changeEmail(email, emailUuid);
    showToast("이메일이 변경되었습니다.", "success");
    document.getElementById("email").value = "";
    document.getElementById("email-code").value = "";
    emailUuid = null;
    isEmailVerified = false;
    displayEmail.textContent = email;
  } catch (error) {
    showToast(error.message ?? "이메일 변경에 실패했습니다.", "error");
  }
};

// 이메일 인증코드 발송
sendCodeBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    emailHint.textContent = "이메일을 입력하세요.";
    emailHint.className = "text-hint error";
    return;
  }

  // 새로 입력한 이메일 = 현재 이메일(display해둔 주소와 비교)
  if (email === displayEmail.textContent) {
    emailHint.textContent = "지금 사용하는 이메일과 동일한 주소입니다.";
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
  } catch (e) {
    console.error(e);
    emailHint.textContent = "인증코드 발송에 실패했습니다.";
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

// 비밀번호 변경
window.handlePasswordChange = async function () {
  const currentPwd = document.getElementById("current-password").value;
  const newPwd = document.getElementById("new-password").value;
  const checkPwd = document.getElementById("password-check").value;

  if (!currentPwd || !newPwd || !checkPwd) {
    showToast("모든 항목을 입력해주세요.", "error");
    return;
  }
  if (newPwd !== checkPwd) {
    showToast("새 비밀번호가 일치하지 않습니다.", "error");
    return;
  }
  try {
    await changePassword(currentPwd, newPwd);
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("password-check").value = "";
    showToast("비밀번호가 변경되었습니다.", "success");
  } catch (error) {
    const currentPasswordHint = document.getElementById(
      "current-password-hint",
    );
    currentPasswordHint.textContent = "현재 비밀번호가 올바르지 않습니다.";
    currentPasswordHint.className = "text-hint error";
  }
};

// 닉네임 변경
window.handleNicknameChange = async function () {
  const nickname = document.getElementById("nickname").value.trim();
  if (!nickname) {
    showToast("닉네임을 입력해주세요.", "error");
    return;
  }
  try {
    await changeNickname(nickname);
    displayNickname.textContent = nickname;
    welcomeNickname.textContent = nickname;
    document.getElementById("nickname").value = "";
    showToast("닉네임이 변경되었습니다.", "success");
  } catch (error) {
    const currentPasswordHint = document.getElementById(
      "current-password-hint",
    );
    currentPasswordHint.textContent = "현재 비밀번호가 올바르지 않습니다.";
    currentPasswordHint.className = "text-hint error";
  }
};

// 회원탈퇴
const withdrawDialog = document.getElementById("withdrawDialog");

window.openWithdrawDialog = function () {
  withdrawDialog.showModal();
};

document.getElementById("withdrawCancel").addEventListener("click", () => {
  withdrawDialog.close();
});

document
  .getElementById("withdrawConfirm")
  .addEventListener("click", async () => {
    const password = document.getElementById("password").value;
    if (!password) {
      showToast("비밀번호를 입력해주세요.", "error");
      return;
    }
    try {
      await withdraw(password);
      withdrawDialog.close();
      showToast("탈퇴되었습니다.");
      setTimeout(() => {
        location.href = "../landing/landing.html";
      }, 1500);
    } catch (error) {
      showToast(error.message ?? "회원탈퇴에 실패했습니다.", "error");
    }
  });
