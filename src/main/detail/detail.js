import { getDetail } from "../../API/detail.js";
import { deletePatagraph } from "../../API/paragraphAPI/delete.js";

const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  romance: "로맨스",
  action_thriller_crime: "액션 / 스릴러 / 범죄",
  horror: "호러",
  sf_fantasy: "SF / 판타지",
  drama: "드라마",
  documentary: "다큐멘터리",
  music_musical: "음악 / 뮤지컬",
  etc: "기타",
};

const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

function renderDetail(movie) {
  const { title, star, year, genre, director, cast, famousLine, imageUrl } =
    movie;

  /* ── 배경 ── */
  const backdrop = document.getElementById("backdrop");
  const backdropImg = document.getElementById("backdropImg");

  if (isDesktop()) {
    // 데스크탑: CSS background-image
    backdrop.style.backgroundImage = imageUrl ? `url(${imageUrl})` : "none";
  } else {
    // 모바일: <img> 태그
    if (imageUrl) backdropImg.src = imageUrl;
  }

  /* ── hero 영역 (좌측 하단 / 모바일 이미지 아래) ── */
  document.getElementById("title").textContent = title ?? "";
  document.getElementById("year").textContent = year ?? "";
  document.getElementById("rating").textContent = star ?? "";

  /* ── 패널 ── */
  // 포스터 썸네일 (데스크탑 전용)
  const poster = document.getElementById("poster");
  if (imageUrl) poster.src = imageUrl;
  poster.alt = title ?? "영화 포스터";

  document.getElementById("panelTitle").textContent = title ?? "";
  document.getElementById("panelRating").textContent = star ?? "";
  document.getElementById("panelYear").textContent = year ?? "";
  document.getElementById("genre").textContent =
    GENRE_MAP[genre] ?? genre ?? "";
  document.getElementById("director").textContent = Array.isArray(director)
    ? director.join(", ")
    : (director ?? "");
  document.getElementById("cast").textContent = Array.isArray(cast)
    ? cast.join(", ")
    : (cast ?? "");

  /* ── 명대사 ── */
  const quoteList = document.getElementById("quoteList");
  const lines = famousLine
    ? famousLine.split("\n").filter((l) => l.trim())
    : [];

  if (lines.length) {
    quoteList.innerHTML = lines
      .map((line) => `<li>"${line.trim()}"</li>`)
      .join("");
  }
}

/* ── 패널 열기/닫기 헬퍼 ── */
function openPanel() {
  document.getElementById("detailPanel").classList.add("is-open");
  document.getElementById("backdropOverlay").classList.add("is-visible");
}

function closePanel() {
  document.getElementById("detailPanel").classList.remove("is-open");
  document.getElementById("backdropOverlay").classList.remove("is-visible");
}

/* ── 상세정보 버튼 토글 (데스크탑) ── */
function initDetailBtn() {
  document.getElementById("detailBtn").addEventListener("click", openPanel);
}

/* ── 닫기 버튼 & 오버레이 클릭 (데스크탑) ── */
function initCloseBtn() {
  document.getElementById("closeBtn").addEventListener("click", closePanel);
  document
    .getElementById("backdropOverlay")
    .addEventListener("click", closePanel);
}

/* ── 뒤로가기 ── */
document.getElementById("backBtn").addEventListener("click", (e) => {
  e.preventDefault();
  history.back();
});

/* ── 반응형 전환 시 패널 상태 초기화 ── */
window.matchMedia("(min-width: 768px)").addEventListener("change", () => {
  location.reload();
});

const postId = new URLSearchParams(location.search).get("postId");

/* ── 초기 로드 ── */
async function init() {
  if (!postId) {
    console.error("postId가 없습니다.");
    return;
  }

  document.getElementById("editLink").href =
    `../../paragraph/edit/edit.html?id=${postId}`;

  if (isDesktop()) {
    initCloseBtn();
    initDetailBtn();
  }

  const data = await getDetail(postId);
  if (!data?.data) {
    console.error("영화 데이터를 불러오지 못했습니다.");
    return;
  }

  renderDetail(data.data);
}

document.getElementById("delete_btn").addEventListener("click", async () => {
  if (!postId) {
    console.error("postId가 없습니다.");
    return;
  }

  if (!confirm("정말로 삭제하시겠습니까?")) return;

  const res = await deletePatagraph(postId);
  if (res) {
    alert("영화가 삭제되었습니다. 메인화면으로 이동합니다.");
    window.location.href = "../../main_list/main_list.html";
  }
});

init();
