import { requireAuth, getToken, redirectOnAuthFail } from "@/utils/auth.js";
requireAuth();

const API = `${import.meta.env.VITE_API_BASE_URL}/movies`;
const token = getToken();

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

let rating = 0;

/*  별점 */
const ratingRange = document.getElementById("ratingRange");
const ratingText = document.getElementById("ratingValue");

ratingRange.addEventListener("input", () => {
  rating = ratingRange.value;
  ratingText.innerText = "⭐ " + Number(rating).toFixed(1);
});

/*  미리보기 */
document.getElementById("poster").addEventListener("input", (e) => {
  document.getElementById("preview").src = e.target.value;
});

/*  기존 데이터 불러오기 */

document.getElementById("file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById("preview");
  const poster = document.getElementById("poster");

  preview.src = URL.createObjectURL(file);

  /* URL 입력값 초기화 */
  poster.value = "";
});

async function getMovie() {
  const res = await fetch(`${API}/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (redirectOnAuthFail(res)) return;
    console.error("영화 데이터를 불러오지 못했습니다.", res.status);
    return;
  }

  const data = await res.json();
  const movie = data.data;

  poster.value = movie.imageUrl;
  preview.src = movie.imageUrl;
  title.value = movie.title;
  year.value = movie.year;
  // 감독 버블 생성
  if (movie.director) {
    directorList = movie.director;

    directorList.forEach((name) => {
      const bubble = document.createElement("span");
      bubble.className = "bubble";
      bubble.innerText = name;

      bubble.addEventListener("click", () => {
        directorList = directorList.filter((v) => v !== name);
        bubble.remove();
      });

      directorContainer.appendChild(bubble);
    });
  }

  // 출연진 버블 생성
  if (movie.cast) {
    actorsList = movie.cast;

    actorsList.forEach((name) => {
      const bubble = document.createElement("span");
      bubble.className = "bubble";
      bubble.innerText = name;

      bubble.addEventListener("click", () => {
        actorsList = actorsList.filter((v) => v !== name);
        bubble.remove();
      });

      actorsContainer.appendChild(bubble);
    });
  }
  description.value = movie.famousLine;
  content.value = movie.content;
  descCount.innerText = `${description.value.length}/500자`;
  contentCount.innerText = `${content.value.length}/1500자`;

  rating = movie.star;
  ratingRange.value = rating;
  ratingText.innerText = "⭐ " + rating;

  const genreRadio = document.querySelector(
    `input[name="genre"][value="${movie.genre}"]`,
  );
  if (genreRadio) genreRadio.checked = true;
}

getMovie();

/*  수정 */
async function updateMovie() {
  let imageUrl = "";

  const fileInput = document.getElementById("file");

  /* 파일 업로드 우선 */
  if (fileInput && fileInput.files[0]) {
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const imgRes = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/movies/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!imgRes.ok) {
      const errorData = await imgRes.json();
      console.error("이미지 업로드 실패:", errorData);
      alert("이미지 업로드 실패");
      return;
    }

    const imgData = await imgRes.json();
    imageUrl = imgData.data.imageUrl;
  } else {
    /* 파일 없으면 URL 사용 */
    imageUrl = document.getElementById("poster").value || "";
  }
  const genre = document.querySelector("input[name=genre]:checked")?.value;
  const body = {};

  // 값 있는 것만 추가
  if (title.value) body.title = title.value;
  if (genre) body.genre = genre;
  if (content.value) body.content = content.value;

  if (rating && rating !== 0) {
    body.star = Number(rating);
  }
  // 이미지
  if (imageUrl) body.imageUrl = imageUrl;
  else if (poster.value) body.imageUrl = poster.value;

  // 연도
  if (year.value) body.year = Number(year.value);

  // 감독
  if (directorList.length) {
    body.director = directorList;
  }

  // 출연진
  if (actorsList.length) {
    body.cast = actorsList;
  }

  // 명대사
  if (description.value) {
    body.famousLine = description.value;
  }

  try {
    const res = await fetch(`${API}/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("수정 실패:", errorData);
      alert(errorData.message || "수정 실패");
      return;
    }

    alert("수정 완료!");
    location.href = `/detail.html?id=${postId}`;
  } catch (err) {
    alert("수정 실패");
  }
}

window.updateMovie = updateMovie;

ratingText.innerText = "⭐ 0.0";

/* 글자수 카운트 */
const desc = document.getElementById("description");
const descCount = document.getElementById("descCount");

desc.addEventListener("input", () => {
  descCount.innerText = `${desc.value.length}/500자`;
});

const contentInput = document.getElementById("content");
const contentCount = document.getElementById("contentCount");

contentInput.addEventListener("input", () => {
  contentCount.innerText = `${contentInput.value.length}/1500자`;
});

document.getElementById("preview").onload = function () {
  const text = document.querySelector(".preview-text");
  if (text) text.style.display = "none";

  if (this.naturalWidth > this.naturalHeight) {
    this.style.aspectRatio = "16 / 9";
  } else {
    this.style.aspectRatio = "2 / 3";
  }
};

function resetForm(event) {
  event.preventDefault();
  event.stopPropagation();
  const scrollY = window.scrollY;

  if (!confirm("작성한 내용을 모두 지우시겠습니까?")) return;

  // 1. input 초기화
  document.querySelectorAll("input").forEach((input) => {
    if (input.type === "file") {
      input.value = "";
    } else if (input.type === "checkbox" || input.type === "radio") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  // 2. textarea 초기화
  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.value = "";
  });

  // 3. 이미지 초기화
  const preview = document.getElementById("preview");
  preview.src = "";

  const text = document.querySelector(".preview-text");
  if (text) text.style.display = "block";

  // 4. 별점 초기화
  const ratingRange = document.getElementById("ratingRange");
  const ratingText = document.getElementById("ratingValue");

  ratingRange.value = 0;
  rating = 0;
  ratingText.innerText = "⭐ 0.0";

  // 5. 글자 수 초기화
  document.getElementById("descCount").innerText = "0/500자";
  document.getElementById("contentCount").innerText = "0/1500자";
  window.scrollTo(0, scrollY);
}

const cancelBtn = document.getElementById("cancelBtn");
/* ===== 감독 버블 ===== */
const directorInput = document.getElementById("director");
const directorContainer = document.getElementById("director-bubbles");

let directorList = [];

directorInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const value = directorInput.value.trim();
    if (!value) return;

    directorList.push(value);

    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.innerText = value;

    bubble.addEventListener("click", () => {
      directorList = directorList.filter((v) => v !== value);
      bubble.remove();
    });

    directorContainer.appendChild(bubble);
    directorInput.value = "";
  }
});

/* ===== 출연진 버블 ===== */
const actorsInput = document.getElementById("actors");
const actorsContainer = document.getElementById("actors-bubbles");

let actorsList = [];

actorsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const value = actorsInput.value.trim();
    if (!value) return;

    actorsList.push(value);

    const bubble = document.createElement("span");
    bubble.className = "bubble";
    bubble.innerText = value;

    bubble.addEventListener("click", () => {
      actorsList = actorsList.filter((v) => v !== value);
      bubble.remove();
    });

    actorsContainer.appendChild(bubble);
    actorsInput.value = "";
  }
});

// 포커스 이동 막기
cancelBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});

// 실제 실행
cancelBtn.addEventListener("click", (e) => {
  resetForm(e);
});
