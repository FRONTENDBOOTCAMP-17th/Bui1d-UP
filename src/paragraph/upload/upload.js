import { requireAuth, getToken } from "@/utils/auth.js";
requireAuth();

import { showToast } from "@/utils/toast.js";

const API = `${import.meta.env.VITE_API_BASE_URL}/movies`;
const accesstoken = getToken();

let rating = 0;
const posterInput = document.getElementById("poster");
const previewImg = document.getElementById("preview");
const title = document.getElementById("title");
const year = document.getElementById("year");
const content = document.getElementById("content");

/* URL 입력 시 미리보기 */
posterInput.addEventListener("input", () => {
  const url = posterInput.value.trim();

  if (url) {
    previewImg.src = url;
  }
});

/*  별점 */
const ratingRange = document.getElementById("ratingRange");
const ratingText = document.getElementById("ratingValue");

ratingRange.addEventListener("input", () => {
  rating = ratingRange.value;
  ratingText.innerText = "⭐ " + Number(rating).toFixed(1);
});

/*  포스터 미리보기 */
document.getElementById("file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById("preview");
  const poster = document.getElementById("poster");

  preview.src = URL.createObjectURL(file);
  poster.value = "";
});

/*  업로드 API */

async function createMovie() {
  console.log("함수 실행됨");
  let imageUrl = "";

  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (file) {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!validTypes.includes(file.type)) {
      showToast("이미지 파일만 업로드 가능합니다.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("5MB 이하 파일만 업로드 가능합니다.", "error");
      return;
    }
  }

  if (fileInput && fileInput.files[0]) {
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const imgRes = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/movies/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        body: formData,
      },
    );

    if (!imgRes.ok) {
      const errorData = await imgRes.json();
      console.error("이미지 업로드 실패:", errorData);
      showToast("이미지 업로드 실패", "error");
      return;
    }

    const imgData = await imgRes.json();
    imageUrl = imgData.data.imageUrl;
  } else {
    /* 파일 없으면 URL 사용 */
    imageUrl = document.getElementById("poster").value || "";
  }
  const genre = document.querySelector("input[name=genre]:checked")?.value;
  if (!title.value.trim()) {
    showToast("영화 제목을 입력해주세요", "error");
    return;
  }

  if (!genre) {
    showToast("장르를 선택해주세요", "error");
    return;
  }

  if (!content.value.trim()) {
    showToast("후기를 입력해주세요", "error");
    return;
  }

  if (!rating || rating === 0) {
    showToast("별점을 입력해주세요", "error");
    return;
  }
  const body = {
    title: title.value,
    genre: genre,
    content: content.value,
    star: Number(rating),

    imageUrl: imageUrl || "",
    year: year.value ? Number(year.value) : undefined,

    director: directorList.length ? directorList : undefined,
    cast: actorsList.length ? actorsList : undefined,

    famousLine: description.value || undefined,
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accesstoken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("등록 실패:", errorData);
      showToast(errorData.message || "등록 실패", "error");
      return;
    }

    showToast("등록 완료!");
    setTimeout(() => { location.href = "/src/main/main_list/main_list.html"; }, 1500);
  } catch (err) {
    showToast("등록 실패", "error");
  }
}

window.createMovie = createMovie;

ratingText.innerText = "⭐ 0.0";
window.addEventListener("DOMContentLoaded", () => {
  /* 명대사 글자수 */
  const desc = document.getElementById("description");
  const descCount = document.getElementById("descCount");

  desc.addEventListener("input", () => {
    descCount.innerText = `${desc.value.length}/500자`;
  });

  /* 후기 글자수 */
  const contentInput = document.getElementById("content");
  const contentCount = document.getElementById("contentCount");

  contentInput.addEventListener("input", () => {
    contentCount.innerText = `${contentInput.value.length}/1500자`;
  });
  const poster = document.getElementById("poster");
  const preview = document.getElementById("preview");

  if (poster && poster.value) {
    preview.src = poster.value;
  }
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

// 1. mousedown에서 포커스만 막기
cancelBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});

// 2. click에서 실제 실행
cancelBtn.addEventListener("click", (e) => {
  resetForm(e);
});
