import "./header.css";
import { getProfileNickname } from "../../API/accountAPI/nickname.js";
import { logout } from "../../API/accountAPI/logout.js";
import { showToast } from "@/utils/toast.js";

export function renderHeader(targetSelector = "body") {
  const html = `
  <header class="flex justify-between flex-wrap items-center w-full px-4 pt-3 pb-2.5 gap-2 border-b border-[#262626] bg-[#171717] sticky top-0 z-10 md:flex-nowrap md:px-[85px]">
    <a href="/src/main/main_list/main_list.html" class="flex-1 flex flex-row items-center gap-2 no-underline md:flex-none" aria-label="Bui1dBox 홈으로 이동">
      <img src="/logo.webp" alt="" class="h-12.5 w-auto" />
    </a>
    <div class="order-1 w-full flex flex-row items-center border border-[#737373] gap-2 px-3 py-2 bg-[#262626] rounded-lg box-border mx-2.5 md:order-[0] md:max-w-[50%]">
      <img src="/Search_icon.svg" alt="검색" class="w-4 h-4 opacity-50 shrink-0" />
      <input class="search-input flex-1 bg-transparent border-0 text-white text-sm outline-none" type="text" placeholder="작성한 글 검색..." />
    </div>
    <nav class="flex flex-row items-center gap-1 shrink-0 md:gap-3">
      <a href="/src/paragraph/upload/upload.html" class="flex items-center cursor-pointer border-0 p-1.5 gap-0.5 rounded-lg text-base text-white bg-[#dc2626] py-1.5 pl-2 pr-2.5 md:hover:bg-[#b91c1c]" id="btn-new-post">
        <img src="/Add_round.svg" alt="새 포스트" class="w-[22px] h-[22px]" />
        <span class="hidden text-[13px] font-medium md:inline md:whitespace-nowrap">새 포스트</span>
      </a>
      <a href="/src/mypage/mypage.html" class="flex items-center cursor-pointer border-0 p-1.5 gap-0.5 rounded-lg text-base text-white bg-transparent md:hover:bg-[#262626]" id="btn-myinfo">
        <img src="/myinfo.png" alt="내 정보" class="w-[22px] h-[22px]" />
        <span class="hidden text-[13px] font-medium md:inline md:whitespace-nowrap" id="nickname"></span>
      </a>
      <button class="flex items-center cursor-pointer border-0 p-1.5 gap-0.5 rounded-lg text-base text-white bg-transparent md:hover:bg-[#262626]" id="btn-logout">
        <img src="/logout.png" alt="로그아웃" class="w-[22px] h-[22px]" />
        <span class="hidden text-[13px] font-medium md:inline md:whitespace-nowrap">로그아웃</span>
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

    showToast("로그아웃되었습니다. 잠시 후 로그인 페이지로 이동합니다.");
    setTimeout(() => {
      window.location.href = "/src/account/login/login.html";
    }, 1500);
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
