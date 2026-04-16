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
    <div class="genre-section__header">
      <h2 class="genre-section__title">${title}</h2>
      <a href="${href}" class="genre-section__more">
        전체보기 <span>›</span>
      </a>
    </div>
  `;
}

// 맨 위 포스터
function renderFeaturedCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="featured-card">
      <div class="featured-card__poster">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" />` : ""}
      </div>
      <div class="featured-card__info">
        <h2 class="featured-card__title">${post.title}</h2>
        <p class="featured-card__meta">
          ${post.year ? `${post.year} · ` : ""}${GENRE_MAP[post.genre] ?? post.genre ?? ""}${post.star != null ? ` · ★ ${post.star}` : ""}
        </p>
        ${post.director?.length ? `<p class="featured-card__crew">감독: ${post.director.join(", ")}</p>` : ""}
        ${post.cast?.length ? `<p class="featured-card__crew">출연: ${post.cast.join(", ")}</p>` : ""}
      </div>
    </a>
  `;
}

function renderSmallCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="movie-card">
      <div class="movie-card__poster">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" />` : ""}
      </div>
      <div class="movie-card__info">
        <p class="movie-card__title">${post.title}</p>
        ${post.star != null ? `<span class="movie-card__star">★ ${post.star}</span>` : ""}
      </div>
    </a>
  `;
}

// 전체 섹션: featured(index 0)는 배너로 분리, 나머지는 content-section으로 감싸기
function renderLatestSection(latest) {
  return `
    ${renderFeaturedCard(latest[0])}
    <section class="genre-section content-section">
      ${renderSectionHeader("전체", "/src/main/genre_more/genre_more.html")}
      <div class="genre-section__grid">
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
    <section class="genre-section">
      ${renderSectionHeader(label, `/src/main/genre_more/genre_more.html?genre=${genreKey}`)}
      <div class="genre-section__grid">
        ${displayPosts.map(renderSmallCard).join("")}
      </div>
    </section>
  `;
}

// 검색 결과 섹션 초기 뼈대
function renderSearchSection(query) {
  return `
    <section class="genre-section">
      <div class="genre-section__header">
        <h2 class="genre-section__title">"${query}" 검색 결과</h2>
      </div>
      <div class="genre-section__grid" id="search-grid"></div>
      <div class="load-more-wrap">
        <button class="load-more-btn" id="search-load-more">더보기</button>
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
    gridEl.innerHTML = "<p class='empty-message'>검색 중 오류가 발생했습니다.</p>";
    return;
  }

  if (results.length === 0 && searchOffset === 0) {
    gridEl.innerHTML = "<p class='empty-message'>검색 결과가 없습니다.</p>";
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

  // 검색 모드
  if (searchQuery) {
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
    }

    // 장르별 섹션
    genreListEl.innerHTML = GENRE_ORDER.filter(
      (key) => genres[key] && genres[key].length > 0,
    )
      .map((key) => renderGenreSection(key, genres[key]))
      .join("");
  } catch (err) {
    latestSectionEl.innerHTML =
      "<p class='empty-message'>데이터를 불러오지 못했습니다.</p>";
    console.error(err);
  }
}

renderHeader("body");
loadMainList();
