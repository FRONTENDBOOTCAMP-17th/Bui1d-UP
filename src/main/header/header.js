import "./header.css";
import { getProfileNickname } from "../../API/accountAPI/nickname.js";
import { logout } from "../../API/accountAPI/logout.js";

export function renderHeader(targetSelector = "body") {
  const html = `
  <header class="site-header">
  <a href="/src/main/main_list/main_list.html" class="header-logo-link">
  <img src="/bui1d-boxLogo.png" alt="빌드업 로고" class="header-logo" />
  <img src="/public/Bui1dBox.png" alt="빌드업 텍스트 로고" class="header-text-logo" />
  </a>
  <div class="search-bar">
  <img src="/public/Search_icon.svg" alt="검색" class="search-icon" />
  <input class="search-input" type="text" placeholder="작성한 글 검색..." />
  </div>
  <nav class="header-nav">
  <a href="/src/paragraph/upload/upload.html" class="nav-btn nav-btn--red" id="btn-new-post">
  <img src="/Add_round.svg" alt="새 포스트" />
  <span class="btn-label">새 포스트</span>
  </a>
  <a href="/src/mypage/mypage.html" class="nav-btn" id="btn-myinfo">
  <img src="/myinfo.png" alt="내 정보" />
  <span class="btn-label" id="nickname"></span>
  </a>
  <button class="nav-btn" id="btn-logout">
  <img src="/logout.png" alt="로그아웃" />
  <span class="btn-label">로그아웃</span>
  </button>
  </nav>
  </header>
  `;

  const target = document.querySelector(targetSelector);
  target.insertAdjacentHTML("afterbegin", html);

  document.getElementById("btn-logout").addEventListener("click", userLogout);

  // 검색창: 현재 검색어 복원 + Enter 시 main_list 검색 모드로 이동
  const searchInput = target.querySelector(".search-input");
  const currentQuery = new URLSearchParams(window.location.search).get("query");
  if (currentQuery) searchInput.value = currentQuery;

  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const query = searchInput.value.trim();
    if (!query) return;
    window.location.href = `/src/main/main_list/main_list.html?query=${encodeURIComponent(query)}`;
  });

  // 페이지 로드 시 닉네임 가져오기
  callNickname();
}

const callNickname = async () => {
  const nickname = await getProfileNickname();
  if (!nickname) return;
  console.log("Nickname fetched successfully:", nickname);
  const nicknameEl = document.getElementById("nickname");
  nicknameEl.textContent = nickname.nickname;
};

const userLogout = async () => {
  try {
    await logout();

    alert("로그아웃되었습니다. 로그인 페이지로 이동합니다.");
    window.location.href = "/src/account/login/login.html";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
