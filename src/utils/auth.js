import { showToast } from "./toast.js";

const LOGIN_PAGE = "/src/account/login/login.html";
const TOKEN_KEY = "accessToken";

export function requireAuth() {
  if (!localStorage.getItem(TOKEN_KEY)) {
    showToast(
      "로그인이 필요한 서비스입니다. 잠시 후 로그인 페이지로 이동합니다.",
      "error",
    );
    setTimeout(() => location.replace(LOGIN_PAGE), 1500);
    throw new Error("사용자 인증 에러가 발생하였습니다.", "error");
  }
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 응답상태가 올바르지 않은 경우 로그인 페이지로 보내기
export function redirectOnAuthFail(response) {
  if (response.status === 401 || response.status === 403) {
    showToast("로그인이 필요한 서비스입니다.", "error");
    setTimeout(() => location.replace(LOGIN_PAGE), 1500);
    return true;
  }
  return false;
}
