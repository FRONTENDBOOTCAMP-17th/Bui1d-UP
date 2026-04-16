import { requireAuth, getToken, redirectOnAuthFail } from "@/utils/auth.js";
requireAuth();

import { showToast } from "@/utils/toast.js";

const API = `${import.meta.env.VITE_API_BASE_URL}/movies`;
const token = getToken();
const title = document.getElementById("title");
const year = document.getElementById("year");
const content = document.getElementById("content");
const description = document.getElementById("description");
const directorInput = document.getElementById("director");
const directorContainer = document.getElementById("director-bubbles");
let directorList = [];

const actorsInput = document.getElementById("actors");
const actorsContainer = document.getElementById("actors-bubbles");

let actorsList = [];
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

let rating = 0;
function isValidText(text) {
  const trimmed = text.trim();

  if (trimmed.length < 2) return false;
  if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmed)) return false;
  if (/^(.)\1+$/.test(trimmed)) return false;
  if (/^[bcdfghjklmnpqrstvwxyz]+$/i.test(trimmed)) return false;

  //  전체가 정상 텍스트인지 검사

  // 한글 + 공백 + 기본 문장부호만 허용
  const validKoreanSentence = /^[가-힣0-9\s.,!?]+$/.test(trimmed);

  // 영어 (모음 포함 + 정상 단어)
  const validEnglishSentence = /^(?=.*[aeiouAEIOU])[a-zA-Z0-9\s.,!?]+$/.test(
    trimmed,
  );

  return validKoreanSentence || validEnglishSentence;
}

/*  별점 */
const ratingRange = document.getElementById("ratingRange");
const ratingText = document.getElementById("ratingValue");

ratingRange.addEventListener("input", () => {
  rating = ratingRange.value;
  ratingText.innerText = "⭐ " + Number(rating).toFixed(1);
});
//  개봉연도 입력 제한 (숫자 + 4자리)
year.addEventListener("input", () => {
  // 숫자만 남기기
  year.value = year.value.replace(/[^0-9]/g, "");

  // 4자리까지만 허용
  if (year.value.length > 4) {
    year.value = year.value.slice(0, 4);
  }
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
      showToast("이미지 업로드 실패", "error");
      return;
    }

    const imgData = await imgRes.json();
    imageUrl = imgData.data.imageUrl;
  } else {
    /* 파일 없으면 URL 사용 */
    imageUrl = document.getElementById("poster").value || "";
  }
  // 이미지 필수 체크
  if (!imageUrl || !/^https?:\/\/.+/.test(imageUrl)) {
    alert("올바른 이미지 URL 또는 파일을 입력해주세요");
    return;
  }
  const genre = document.querySelector("input[name=genre]:checked")?.value;
  if (!isValidText(title.value)) {
    alert("영화 제목을 제대로 입력해주세요");
    return;
  }
  if (!isValidText(content.value)) {
    alert("후기를 제대로 입력해주세요");
    return;
  }
  if (!rating || rating === 0) {
    alert("별점을 입력해주세요");
    return;
  }
  //  명대사 검증
  if (description.value && !isValidText(description.value)) {
    alert("명대사를 제대로 입력해주세요");
    return;
  }
  //  개봉연도 숫자 검증
  //  개봉연도 필수 + 형식 검증
  if (!year.value) {
    alert("개봉 연도를 입력해주세요");
    return;
  }

  if (!/^\d{4}$/.test(year.value)) {
    alert("개봉 연도는 4자리 숫자로 입력해주세요 (예: 2024)");
    return;
  }
  //  입력창에 값 남아있으면 막기 (엔터 안 누른 경우)
  if (directorInput.value.trim()) {
    alert("감독 이름을 입력 후 Enter를 눌러주세요");
    return;
  }

  if (actorsInput.value.trim()) {
    alert("출연진 이름을 입력 후 Enter를 눌러주세요");
    return;
  }
  //  감독 전체 검증 (무조건 실행)
  for (const director of directorList) {
    if (!isValidText(director)) {
      alert("감독 이름에 올바르지 않은 값이 있습니다");
      return;
    }
  }

  //  출연진 전체 검증 (무조건 실행)
  for (const actor of actorsList) {
    if (!isValidText(actor)) {
      alert("출연진 이름에 올바르지 않은 값이 있습니다");
      return;
    }
  }
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
      showToast(errorData.message || "수정 실패", "error");
      return;
    }

    alert("수정 완료!");
    location.href = "/src/main/main_list/main_list.html";
  } catch (err) {
    showToast("수정 실패", "error");
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

directorInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const value = directorInput.value.trim();

    //  upload랑 동일한 검증 추가
    if (!isValidText(value)) {
      alert("감독 이름을 제대로 입력해주세요");
      return;
    }

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

actorsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const value = actorsInput.value.trim();

    //  upload랑 동일한 검증 추가
    if (!isValidText(value)) {
      alert("출연진 이름을 제대로 입력해주세요");
      return;
    }

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
