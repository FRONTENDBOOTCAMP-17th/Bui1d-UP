import { requireAuth } from "@/utils/auth.js";
requireAuth();

import { showToast } from "@/utils/toast.js";

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
import { login } from "../API/accountAPI/login.js";

setupInput("email");
setupInput("email-code");
setupInput("current-password");
setupInput("new-password");
setupPasswordCheck();
setupInput("nickname");
setupInput("password");

setupToggle("current-password");
setupToggle("new-password");
setupToggle("password");
setupToggle("password-check");

// 이메일 인증 상태
let emailUuid = null;
let isEmailVerified = false;

// 현재 비밀번호 검증에 사용할 로그인 아이디 (프로필 로드 후 저장)
let userId = null;

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
  // 현재 비밀번호 검증 시 login() 호출에 필요한 아이디 저장
  userId = profile.id;
} catch (error) {
  console.error("에러가 발생하였습니다:", error.message);
}

// 아코디언
const accordions = document.querySelectorAll(".accordion-components");

accordions.forEach((accordion) => {
  const head = accordion.querySelector(".accordion-head");
  const body = accordion.querySelector(".accordion-body");

  // 초기 상태: 모두 닫힘
  body.setAttribute("inert", "");

  const openAccordion = (targetHead, targetBody) => {
    targetHead.setAttribute("aria-expanded", "true");
    targetHead.classList.add("open");
    targetBody.classList.add("open");
    targetBody.removeAttribute("inert");
  };

  const closeAccordion = (targetHead, targetBody) => {
    targetHead.setAttribute("aria-expanded", "false");
    targetHead.classList.remove("open");
    targetBody.classList.remove("open");
    targetBody.setAttribute("inert", "");
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
async function handleEmailChange() {
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
}

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
async function handlePasswordChange() {
  const currentPwdInput = document.getElementById("current-password");
  const newPwdInput = document.getElementById("new-password");
  const checkPwdInput = document.getElementById("password-check");

  const currentPwd = currentPwdInput.value;
  const newPwd = newPwdInput.value;
  const checkPwd = checkPwdInput.value;

  // 빈 값 체크
  if (!currentPwd || !newPwd || !checkPwd) {
    showToast("모든 항목을 입력해주세요.", "error");
    return;
  }

  // 현재 비밀번호 형식 체크 (blur 없이 버튼 클릭 시 미검사 방지)
  const passwordRule = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,50}$/;
  if (!passwordRule.test(currentPwd)) {
    const currentPasswordHint = document.getElementById(
      "current-password-hint",
    );
    currentPwdInput.classList.remove("is-success");
    currentPwdInput.classList.add("is-error");
    currentPasswordHint.textContent =
      "형식이 맞지 않습니다. (8~50자, 영문 대문자+숫자+특수문자)";
    currentPasswordHint.className = "text-hint error";
    return;
  }

  // 새 비밀번호 일치 여부 체크
  if (newPwd !== checkPwd) {
    showToast("새 비밀번호가 일치하지 않습니다.", "error");
    return;
  }
  // 서버의 PUT /users/password가 현재 비밀번호를 검증하지 않으므로
  // 로그인 API로 현재 비밀번호 일치 여부를 프론트에서 먼저 검증
  try {
    await login(userId, currentPwd);
  } catch {
    // 로그인 실패 = 현재 비밀번호 불일치
    const currentPasswordHint = document.getElementById(
      "current-password-hint",
    );
    currentPwdInput.classList.remove("is-success");
    currentPwdInput.classList.add("is-error");
    currentPasswordHint.textContent = "현재 비밀번호가 올바르지 않습니다.";
    currentPasswordHint.className = "text-hint error";
    return;
  }

  // 현재 비밀번호 검증 통과 후 실제 비밀번호 변경 요청
  try {
    await changePassword(currentPwd, newPwd);
    [
      { id: "current-password", hint: "현재 비밀번호를 입력하세요." },
      {
        id: "new-password",
        hint: "8~50자, 영문 대문자+숫자+특수문자를 포함해야 합니다.",
      },
      { id: "password-check", hint: "비밀번호를 다시 입력하세요." },
    ].forEach(({ id, hint }) => {
      const input = document.getElementById(id);
      const hintEl = document.getElementById(`${id}-hint`);
      const clearBtn = document.getElementById(`${id}-clear`);
      input.value = "";
      input.classList.remove("is-success", "is-error");
      hintEl.textContent = hint;
      hintEl.className = "text-hint";
      clearBtn.classList.remove("show");
    });
    showToast("비밀번호가 변경되었습니다.", "success");
  } catch (error) {
    // 그 외 에러 (토큰 만료, 형식 오류 등)
    showToast(error.message ?? "비밀번호 변경에 실패했습니다.", "error");
  }
}

// 닉네임 변경
async function handleNicknameChange() {
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
    const nicknameHint = document.getElementById("nickname-hint");
    nicknameHint.textContent = "닉네임 변경에 실패했습니다.";
    nicknameHint.className = "text-hint error";
  }
}

// 회원탈퇴
const withdrawDialog = document.getElementById("withdrawDialog");
const withdrawPasswordInput = document.getElementById("password");
const withdrawPasswordHint = document.getElementById("password-hint");

function resetWithdrawInput() {
  withdrawPasswordInput.value = "";
  withdrawPasswordInput.classList.remove("is-error", "is-success");
  withdrawPasswordHint.textContent =
    "8~50자, 대문자·숫자·특수문자를 포함해야 합니다.";
  withdrawPasswordHint.className = "text-hint";
  document.getElementById("password-clear").classList.remove("show");
}

function openWithdrawDialog() {
  resetWithdrawInput();
  withdrawDialog.showModal();
}

document
  .getElementById("btnBack")
  .addEventListener("click", () => history.back());
document
  .getElementById("btnEmailChange")
  .addEventListener("click", handleEmailChange);
document
  .getElementById("btnPasswordChange")
  .addEventListener("click", handlePasswordChange);
document
  .getElementById("btnNicknameChange")
  .addEventListener("click", handleNicknameChange);
document
  .getElementById("btnWithdrawOpen")
  .addEventListener("click", openWithdrawDialog);

document.getElementById("withdrawCancel").addEventListener("click", () => {
  withdrawDialog.close();
});

document
  .getElementById("withdrawConfirm")
  .addEventListener("click", async () => {
    const password = withdrawPasswordInput.value;
    if (!password) {
      withdrawPasswordInput.classList.remove("is-success");
      withdrawPasswordInput.classList.add("is-error");
      withdrawPasswordHint.textContent = "비밀번호를 입력해주세요.";
      withdrawPasswordHint.className = "text-hint error";
      return;
    }
    try {
      await withdraw(password);
      withdrawDialog.close();
      showToast("탈퇴되었습니다.");
      setTimeout(() => {
        location.href = "../landing/landing.html";
      }, 1500);
    } catch {
      withdrawPasswordInput.classList.remove("is-success");
      withdrawPasswordInput.classList.add("is-error");
      withdrawPasswordHint.textContent = "현재 비밀번호가 올바르지 않습니다.";
      withdrawPasswordHint.className = "text-hint error";
    }
  });
