import "./main_list.css";
import { renderHeader } from "../header/header.js";
import { getMainList } from "../../API/main_list.js";

const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  romance: "로맨스",
  action_thriller_crime: "액션 / 스릴러 / 범죄",
  horror: "호러",
  sf_fantasy: "SF/판타지",
  drama: "드라마",
  documentary: "다큐멘터리",
  music_musical: "음악/뮤지컬",
  etc: "기타",
};

const GENRE_ORDER = Object.keys(GENRE_MAP);

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

// 전체 섹션: featured(index 0) + header + grid(index 1~)
function renderLatestSection(latest) {
  return `
    <section class="genre-section">
      ${renderFeaturedCard(latest[0])}
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

// 장르별 데이터 존재시 섹션 렌더링
async function loadMainList() {
  const latestSectionEl = document.getElementById("latest-section");
  const genreListEl = document.getElementById("genre-list");

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

renderHeader("#header-container");
loadMainList();
