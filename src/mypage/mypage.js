import { getProfileNickname } from "../API/accountAPI/nickname.js";
import { setupInput, setupToggle } from "../components/input.js";
import { changePassword } from "../API/mypageAPI/changePassword.js";
import { changeNickname } from "../API/mypageAPI/changeNickname.js";
import { withdraw } from "../API/accountAPI/withdraw.js";

setupInput("email");
setupInput("nickname");
setupToggle("current-password");
setupToggle("new-password");
setupToggle("password-check");
setupToggle("password");

const welcomeNickname = document.getElementById("welcome-nickname");
const displayEmail = document.getElementById("display-email");
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
window.handleEmailChange = async function () {
  const email = document.getElementById("email").value.trim();
  if (!email) {
    showToast("이메일을 입력해주세요.", "error");
    return;
  }
  showToast("이메일 변경 기능은 준비 중입니다.", "error");
};

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
    await changePassword(newPwd);
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("password-check").value = "";
    showToast("비밀번호가 변경되었습니다.", "success");
  } catch (error) {
    showToast(error.message ?? "비밀번호 변경에 실패했습니다.", "error");
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
    showToast(error.message ?? "닉네임 변경에 실패했습니다.", "error");
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
