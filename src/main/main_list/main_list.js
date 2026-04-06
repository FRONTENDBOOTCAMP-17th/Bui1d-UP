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

function renderGenreSection(genreKey, posts) {
  const label = GENRE_MAP[genreKey];
  const displayPosts = posts.slice(0, 4);
  return `
    <section class="genre-section">
      <div class="genre-section__header">
        <h2 class="genre-section__title">${label}</h2>
        <a href="/src/main/genre_more/genre_more.html?genre=${genreKey}" class="genre-section__more">
          전체보기 <span>›</span>
        </a>
      </div>
      <div class="genre-section__grid">
        ${displayPosts.map(renderSmallCard).join("")}
      </div>
    </section>
  `;
}

async function loadMainList() {
  const featuredEl = document.getElementById("featured-card");
  const latestGridEl = document.getElementById("latest-grid");
  const genreListEl = document.getElementById("genre-list");

  try {
    const data = await getMainList();
    const latest = data.latest ?? [];
    const genres = data.genres ?? {};

    // 전체: index 0 featured, index 1~ grid
    if (latest.length > 0) {
      featuredEl.innerHTML = renderFeaturedCard(latest[0]);
    }
    if (latest.length > 1) {
      latestGridEl.innerHTML = latest.slice(1).map(renderSmallCard).join("");
    }

    // 장르별 섹션
    const genreHtml = GENRE_ORDER.filter(
      (key) => genres[key] && genres[key].length > 0,
    )
      .map((key) => renderGenreSection(key, genres[key]))
      .join("");

    genreListEl.innerHTML = genreHtml;
  } catch (err) {
    featuredEl.innerHTML =
      "<p class='empty-message'>데이터를 불러오지 못했습니다.</p>";
    console.error(err);
  }
}

renderHeader("#header-container");
loadMainList();
