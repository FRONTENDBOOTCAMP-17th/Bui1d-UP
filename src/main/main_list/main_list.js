import { requireAuth } from "@/utils/auth.js";
requireAuth();

import "./main_list.css";
import { renderHeader } from "../header/header.js";
import { getMainList } from "../../API/main_list.js";
import { searchMovies } from "../../API/search.js";
import { GENRE_MAP } from "@/utils/genres.js";

const GENRE_ORDER = Object.keys(GENRE_MAP);
const searchQuery = new URLSearchParams(window.location.search).get("query");

const SEARCH_LIMIT = 20;
let searchOffset = 0;
let searchIsLoading = false;

function renderSectionHeader(title, href) {
  return `
    <div class="flex items-center justify-between py-3 px-[15px] m-0 md:py-4 md:px-6">
      <h2 class="text-[22px] font-bold text-white md:text-[28px]">${title}</h2>
      <a href="${href}" class="text-[15px] text-[#a3a3a3] no-underline flex items-center gap-0.5 md:text-base">
        전체보기 <span>›</span>
      </a>
    </div>
  `;
}

// 맨 위 포스터
function renderFeaturedCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="featured-card block relative no-underline text-inherit w-full md:h-[calc(100vh-75px)]">
      <div class="featured-card__poster relative w-full bg-[#404040] overflow-hidden aspect-[16/9]">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="w-full h-full block object-cover md:object-contain" />` : ""}
      </div>
      <div class="absolute bottom-[50px] left-6 max-w-[60%] p-0 bg-transparent z-[2] md:left-12 md:max-w-[45%]">
        <h2 class="text-base font-bold m-0 mb-1.5 text-white md:text-[40px]">${post.title}</h2>
        <p class="text-xs text-[#d4d4d4] m-0 mb-1 md:text-lg">
          ${post.year ? `${post.year} · ` : ""}${GENRE_MAP[post.genre] ?? post.genre ?? ""}${post.star != null ? ` · ★ ${post.star}` : ""}
        </p>
        ${post.director?.length ? `<p class="text-[9px] text-[#a3a3a3] m-0 overflow-hidden text-ellipsis whitespace-nowrap md:text-sm">감독: ${post.director.join(", ")}</p>` : ""}
        ${post.cast?.length ? `<p class="text-[9px] text-[#a3a3a3] m-0 overflow-hidden text-ellipsis whitespace-nowrap md:text-sm">출연: ${post.cast.join(", ")}</p>` : ""}
      </div>
    </a>
  `;
}

function renderSmallCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="flex flex-col no-underline text-inherit rounded-lg overflow-hidden bg-[#262626]">
      <div class="bg-[#404040] overflow-hidden">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="w-full block aspect-[16/9] object-contain" />` : ""}
      </div>
      <div class="p-2">
        <p class="text-[13px] font-medium text-white m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">${post.title}</p>
        ${post.star != null ? `<span class="text-xs text-[#facc15]">★ ${post.star}</span>` : ""}
      </div>
    </a>
  `;
}

// 전체 섹션: featured(index 0)는 배너로 분리, 나머지는 content-section으로 감싸기
function renderLatestSection(latest) {
  return `
    ${renderFeaturedCard(latest[0])}
    <section class="mt-0 relative z-1 bg-[#171717]">
      ${renderSectionHeader("전체", "/src/main/genre_more/genre_more.html")}
      <div class="grid grid-cols-2 gap-2 px-5 md:grid-cols-5 md:overflow-hidden md:gap-3 md:px-6 md:[grid-template-rows:1fr]">
        ${latest.slice(1).map(renderSmallCard).join("")}
      </div>
    </section>
  `;
}

// 아래 장르별 2열 카드 섹션
function renderGenreSection(genreKey, posts) {
  const label = GENRE_MAP[genreKey];
  const displayPosts = posts.slice(0, 4);
  return `
    <section class="mt-0">
      ${renderSectionHeader(label, `/src/main/genre_more/genre_more.html?genre=${genreKey}`)}
      <div class="grid grid-cols-2 gap-2 px-5 md:grid-cols-5 md:overflow-hidden md:gap-3 md:px-6 md:[grid-template-rows:1fr]">
        ${displayPosts.map(renderSmallCard).join("")}
      </div>
    </section>
  `;
}

// 검색 결과 섹션 초기 뼈대
function renderSearchSection(query) {
  return `
    <section class="mt-0">
      <div class="flex items-center justify-between py-3 px-[15px] m-0 md:py-4 md:px-6">
        <h2 class="text-[22px] font-bold text-white md:text-[28px]">"${query}" 검색 결과</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 px-5 md:grid-cols-5 md:overflow-hidden md:gap-3 md:px-6 md:[grid-template-rows:1fr]" id="search-grid"></div>
      <div class="flex justify-center my-6 mb-4">
        <button class="bg-transparent border border-[#525252] text-[#d4d4d4] py-2.5 px-8 rounded-[20px] text-[13px] font-medium cursor-pointer" id="search-load-more">더보기</button>
      </div>
    </section>
  `;
}

// 검색 결과 페이지네이션 로드
async function loadSearchResults() {
  if (searchIsLoading) return;
  searchIsLoading = true;

  const loadMoreBtn = document.getElementById("search-load-more");
  if (loadMoreBtn) loadMoreBtn.disabled = true;

  const results = await searchMovies(searchQuery, searchOffset, SEARCH_LIMIT);
  searchIsLoading = false;

  const gridEl = document.getElementById("search-grid");

  if (results === null) {
    gridEl.innerHTML =
      "<p class='text-[#e5e5e5] text-center py-20 text-lg'>검색 중 오류가 발생했습니다.</p>";
    return;
  }

  if (results.length === 0 && searchOffset === 0) {
    gridEl.innerHTML = "<p class='text-[#e5e5e5] text-center py-20 text-lg'>검색 결과가 없습니다.</p>";
    if (loadMoreBtn) {
      loadMoreBtn.textContent = "더 이상 없습니다";
      loadMoreBtn.disabled = true;
    }
    return;
  }

  gridEl.insertAdjacentHTML("beforeend", results.map(renderSmallCard).join(""));
  searchOffset += SEARCH_LIMIT;

  if (loadMoreBtn) {
    if (results.length < SEARCH_LIMIT) {
      loadMoreBtn.textContent = "더 이상 없습니다";
      loadMoreBtn.disabled = true;
    } else {
      loadMoreBtn.disabled = false;
    }
  }
}

// 장르별 데이터 존재시 섹션 렌더링
async function loadMainList() {
  const searchSectionEl = document.getElementById("search-section");
  const latestSectionEl = document.getElementById("latest-section");
  const genreListEl = document.getElementById("genre-list");
  const sectionsWrapEl = document.getElementById("sections-wrap");

  // 검색 모드
  if (searchQuery) {
    sectionsWrapEl.style.display = "none";
    searchSectionEl.innerHTML = renderSearchSection(searchQuery);
    document
      .getElementById("search-load-more")
      .addEventListener("click", loadSearchResults);
    await loadSearchResults();
    return;
  }

  // 일반 홈 모드
  try {
    const data = await getMainList();
    if (!data) throw new Error("데이터 없음");
    const latest = data.latest ?? [];
    const genres = data.genres ?? {};

    // 전체 섹션
    if (latest.length > 0) {
      latestSectionEl.innerHTML = renderLatestSection(latest);
    } else {
      // 배너가 없을 때 negative margin을 제거
      sectionsWrapEl.style.marginTop = "0";
      latestSectionEl.innerHTML =
        "<p class='text-[#e5e5e5] text-center py-20 text-lg'>작성한 영화후기가 없습니다. 지금 후기를 작성해보세요!</p>";
    }

    // 장르별 섹션
    genreListEl.innerHTML = GENRE_ORDER.filter(
      (key) => genres[key] && genres[key].length > 0,
    )
      .map((key) => renderGenreSection(key, genres[key]))
      .join("");
  } catch (err) {
    sectionsWrapEl.style.marginTop = "0";
    latestSectionEl.innerHTML =
      "<p class='text-[#e5e5e5] text-center py-20 text-lg'>데이터를 불러오지 못했습니다.</p>";
    console.error(err);
  }
}

renderHeader("body");
loadMainList();
