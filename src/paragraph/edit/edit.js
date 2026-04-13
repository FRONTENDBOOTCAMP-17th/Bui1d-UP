import { requireAuth, getToken, redirectOnAuthFail } from "@/utils/auth.js";
requireAuth();

const API = "https://api.fullstackfamily.com/api/buildup/v1/movies";
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
  director.value = movie.director?.join(", ") || "";
  actors.value = movie.cast?.join(", ") || "";
  description.value = movie.famousLine;
  content.value = movie.content;
  descCount.innerText = `${description.value.length}/500자`;
  contentCount.innerText = `${content.value.length}/1500자`;

  rating = movie.star;
  ratingRange.value = rating;
  ratingText.innerText = "⭐ " + rating;

  document.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    if (movie.genre === cb.value) {
      cb.checked = true;
    }
  });
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
      "https://api.fullstackfamily.com/api/buildup/v1/movies/images",
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
  const genre = document.querySelector(
    "input[type=checkbox]:checked",
  )?.value;
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
  if (director.value) {
    body.director = director.value.split(",").map((v) => v.trim());
  }

  // 출연진
  if (actors.value) {
    body.cast = actors.value.split(",").map((v) => v.trim());
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

const dropZone = document.getElementById("preview");
const fileInput = document.getElementById("file");

/* 드래그 중 */
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

/* 드래그 나감 */
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

/* 드롭 */
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (!file) return;

  const preview = document.getElementById("preview");
  const poster = document.getElementById("poster");

  preview.src = URL.createObjectURL(file);

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;

  poster.value = "";
});

document.getElementById("preview").onload = () => {
  const text = document.querySelector(".preview-text");
  if (text) text.style.display = "none";
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
    } else if (input.type === "checkbox") {
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

// 포커스 이동 막기
cancelBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});

// 실제 실행
cancelBtn.addEventListener("click", (e) => {
  resetForm(e);
});
