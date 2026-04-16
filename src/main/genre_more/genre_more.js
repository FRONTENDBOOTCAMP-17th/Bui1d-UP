import { requireAuth } from "@/utils/auth.js";
requireAuth();

import "./genre_more.css";
import { renderHeader } from "../header/header.js";
import { getGenreMore } from "../../API/genre_more.js";
import { GENRE_MAP } from "@/utils/genres.js";

const LIMIT = 20;

const params = new URLSearchParams(window.location.search);
const genre = params.get("genre");

let offset = 0;
let isLoading = false;

const gridEl = document.getElementById("genre-more-grid");
const loadMoreBtn = document.getElementById("load-more-btn");

function renderCard(post) {
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

async function loadMore() {
  if (isLoading) return;
  isLoading = true;
  loadMoreBtn.disabled = true;

  const data = await getGenreMore(genre, offset, LIMIT);

  if (!data || data.length === 0) {
    loadMoreBtn.textContent = "더 이상 없습니다";
    loadMoreBtn.disabled = true;
    isLoading = false;
    return;
  }

  gridEl.insertAdjacentHTML("beforeend", data.map(renderCard).join(""));
  offset += LIMIT;

  // 받아온 개수가 LIMIT보다 적으면 마지막 페이지
  if (data.length < LIMIT) {
    loadMoreBtn.textContent = "더 이상 없습니다";
    loadMoreBtn.disabled = true;
  } else {
    loadMoreBtn.disabled = false;
  }

  isLoading = false;
}

document.getElementById("genre-title").textContent = genre
  ? (GENRE_MAP[genre] ?? genre)
  : "전체";

// 뒤로가기 버튼
document.getElementById("back-btn").addEventListener("click", () => {
  history.back();
});

loadMoreBtn.addEventListener("click", loadMore);

renderHeader("body"); // 헤더 렌더링
loadMore(); // 초기 로드
