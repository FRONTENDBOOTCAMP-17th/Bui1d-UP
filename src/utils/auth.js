const LOGIN_PAGE = "/src/account/login/login.html";
const TOKEN_KEY = "accessToken";

export function requireAuth() {
  if (!localStorage.getItem(TOKEN_KEY)) {
    alert("로그인이 필요한 서비스입니다.");
    location.replace(LOGIN_PAGE);
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
    alert("로그인이 필요한 서비스입니다.");
    location.replace(LOGIN_PAGE);
    return true;
  }
  return false;
}
