# Bui1d-UP 5차 코드 리뷰 해결 가이드 (2026-04-09)

> **대상 문서**: [code-review-20260409.md](./code-review-20260409.md)
> **목적**: 리뷰에서 발견된 문제를 **초보자도 따라할 수 있도록** 단계별로 해결하는 방법을 안내합니다
> **원칙**: CSS는 최소한으로, Tailwind CSS를 우선 사용합니다

---

## 목차

1. [C-3 해결: 토큰 키 이름 통일 (5분)](#1-c-3-해결-토큰-키-이름-통일)
2. [C-5 해결: console.log 토큰 노출 삭제 (5분)](#2-c-5-해결-consolelog-토큰-노출-삭제)
3. [C-7 해결: signup 폼 submit 핸들러 추가 (30분)](#3-c-7-해결-signup-폼-submit-핸들러-추가)
4. [C-1 해결: upload/edit 파일 분리 (1-2시간)](#4-c-1-해결-uploadedit-파일-분리)
5. [C-2 해결: API URL 환경변수로 변경 (10분)](#5-c-2-해결-api-url-환경변수로-변경)
6. [C-4 해결: upload/edit 중복 코드 제거 (1시간)](#6-c-4-해결-uploadedit-중복-코드-제거)
7. [I-1 해결: GENRE_MAP 공통 파일로 추출 (15분)](#7-i-1-해결-genre_map-공통-파일로-추출)
8. [I-2 해결: console.log 전체 삭제 (10분)](#8-i-2-해결-consolelog-전체-삭제)
9. [C-6 해결: XSS 방어 함수 추가 (30분)](#9-c-6-해결-xss-방어-함수-추가)
10. [CSS를 Tailwind로 전환하기 (참고)](#10-css를-tailwind로-전환하기)

---

## 1. C-3 해결: 토큰 키 이름 통일

### 이것이 왜 중요한가요?

로그인할 때 `"accessToken"`이라는 이름으로 토큰을 저장합니다. 그런데 글 작성/수정 페이지에서는 `"token"`이라는 이름으로 토큰을 읽으려고 합니다. **이름이 다르니까 토큰을 찾을 수 없어서 항상 `null`이 됩니다.**

비유하자면, 열쇠를 "서랍 A"에 넣었는데 "서랍 B"를 열어보고 "열쇠가 없다!"고 하는 것과 같습니다.

### 어디를 고쳐야 하나요?

`upload.html`과 `edit.html`에서 `"token"`을 `"accessToken"`으로 바꿉니다.

### 수정 전 (upload.html)

```javascript
const accesstoken = localStorage.getItem("token");  // ❌ 잘못된 키 이름
```

### 수정 후 (upload.html)

```javascript
const accesstoken = localStorage.getItem("accessToken");  // ✅ 올바른 키 이름
```

### 수정 전 (edit.html)

```javascript
const token = localStorage.getItem("token");  // ❌ 잘못된 키 이름
```

### 수정 후 (edit.html)

```javascript
const token = localStorage.getItem("accessToken");  // ✅ 올바른 키 이름
```

> **팁**: VS Code에서 `Ctrl + H` (찾기 및 바꾸기)를 사용하면 쉽게 바꿀 수 있습니다.

---

## 2. C-5 해결: console.log 토큰 노출 삭제

### 어디를 고쳐야 하나요?

`src/API/main_list.js`에서 토큰을 출력하는 줄을 삭제합니다.

### 수정 전

```javascript
export const getMainList = async () => {
  try {
    console.log("Fetching main list from API...");           // 삭제
    console.log(`accessToken: ${localStorage.getItem("accessToken")}`);  // 🚨 반드시 삭제!
    const response = await fetch(/* ... */);
    // ...
    console.log("Main list response:", json);                // 삭제
    return json.data;
  } catch (error) {
    console.error("Error fetching main list:", error);       // 이건 유지 (에러 로그는 괜찮음)
    return null;
  }
};
```

### 수정 후

```javascript
export const getMainList = async () => {
  try {
    const response = await fetch(/* ... */);
    // ...
    return json.data;
  } catch (error) {
    console.error("Error fetching main list:", error);  // 에러 로그는 유지해도 됩니다
    return null;
  }
};
```

> **규칙**: `console.log()`는 개발 중에 임시로만 사용하고, 커밋하기 전에 삭제합니다.  
> `console.error()`는 실제 에러를 기록하는 용도이므로 유지해도 됩니다.

---

## 3. C-7 해결: signup 폼 submit 핸들러 추가

### 현재 무엇이 빠져 있나요?

`signup.js`에는 이메일 인증 로직만 있고, **회원가입 버튼을 누르면 실행될 코드**가 없습니다.

### 어디에 코드를 추가하나요?

`src/account/signup/signup.js` 파일의 맨 아래에 추가합니다.

### 추가할 코드

```javascript
// signup.js 맨 위에 import 추가
import { signup } from "../../API/accountAPI/signup.js";

// signup.js 맨 아래에 추가
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();  // 폼의 기본 동작(페이지 새로고침)을 막습니다

  // 1. 이메일 인증이 완료되었는지 확인
  if (!isEmailVerified) {
    emailCodeHint.textContent = "이메일 인증을 먼저 완료해주세요.";
    emailCodeHint.className = "text-hint error";
    return;
  }

  // 2. 입력값 가져오기
  const id = document.getElementById("username").value.trim();
  const nick = document.getElementById("nickname").value.trim();
  const pwd = document.getElementById("password").value;
  const pwdCheck = document.getElementById("password-check").value;
  const email = emailInput.value.trim();

  // 3. 기본 검증
  if (!id || !nick || !pwd || !email) {
    alert("모든 필드를 입력해주세요.");
    return;
  }

  // 4. 비밀번호 일치 확인
  if (pwd !== pwdCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  // 5. 회원가입 API 호출
  try {
    await signup(id, pwd, email, nick, emailUuid);
    location.href = "../login/login.html";
  } catch (error) {
    alert("회원가입에 실패했습니다. 다시 시도해주세요.");
  }
});
```

### 흐름 설명

```
1. 사용자가 폼을 채움
2. 이메일 인증 버튼 클릭 → 인증 코드 발송
3. 인증 코드 입력 → 확인 → isEmailVerified = true
4. "회원가입" 버튼 클릭 → submit 이벤트 발생
5. isEmailVerified 체크 → 입력값 검증 → signup API 호출
6. 성공 → 로그인 페이지로 이동
```

---

## 4. C-1 해결: upload/edit 파일 분리

### 지금 어떤 상태인가요?

```
upload.html (684줄)
├── <style>...</style>     (280줄 - CSS)
├── <html>...</html>       (100줄 - 화면)
└── <script>...</script>   (280줄 - 동작)
```

### 목표 구조

```
src/paragraph/upload/
├── upload.html       (화면 구조만 - 약 100줄)
├── upload.css        (스타일만 - 약 50줄, 나머지는 Tailwind로 전환)
└── upload.js         (동작 로직만 - 약 150줄)

src/API/paragraphAPI/
└── upload.js         (API 호출만 - 약 30줄)
```

### 단계별 진행 방법

#### 단계 1: CSS를 별도 파일로 분리

1. `src/paragraph/upload/upload.css` 파일을 새로 만듭니다
2. `upload.html`의 `<style>...</style>` 사이의 내용을 **잘라내기(Ctrl+X)** 합니다
3. `upload.css`에 **붙여넣기(Ctrl+V)** 합니다
4. `upload.html`의 `<head>`에 CSS 파일을 연결합니다:

```html
<head>
  <meta charset="UTF-8" />
  <title>포스트 등록</title>
  <!-- CSS 파일 연결 -->
  <link rel="stylesheet" href="../../styles/theme.css" />
  <link rel="stylesheet" href="./upload.css" />
</head>
```

#### 단계 2: JS를 별도 파일로 분리

1. `src/paragraph/upload/upload.js` 파일을 새로 만듭니다
2. `upload.html`의 `<script>...</script>` 사이의 내용을 **잘라내기(Ctrl+X)** 합니다
3. `upload.js`에 **붙여넣기(Ctrl+V)** 합니다
4. `upload.html`에 JS 파일을 연결합니다:

```html
<!-- body 닫기 태그 바로 위에 -->
<script type="module" src="./upload.js"></script>
</body>
```

> **주의**: `type="module"`을 꼭 써야 합니다! 이것이 있어야 `import`/`export`를 사용할 수 있습니다.

#### 단계 3: API 호출을 별도 파일로 분리

1. `src/API/paragraphAPI/upload.js`를 엽니다 (이미 빈 파일이 있습니다)
2. 아래 코드를 작성합니다:

```javascript
// src/API/paragraphAPI/upload.js

// 이미지 업로드
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/movies/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("이미지 업로드 실패");
  }

  const json = await response.json();
  return json.data.imageUrl;
};

// 영화 등록
export const createMovie = async (movieData) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/movies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(movieData),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "등록 실패");
  }

  return await response.json();
};
```

3. `src/paragraph/upload/upload.js`에서 API를 import해서 사용합니다:

```javascript
// src/paragraph/upload/upload.js 맨 위
import { uploadImage, createMovie } from "../../API/paragraphAPI/upload.js";
```

### 분리 전후 비교

```
분리 전:
upload.html (684줄) → 한 파일에서 모든 것을 처리
  ├── CSS 코드를 수정하다가 JS를 건드릴 수 있음
  ├── 팀원이 읽기 어려움
  └── API URL이 HTML 안에 숨어 있어 찾기 어려움

분리 후:
upload.html (100줄) → 화면 구조만
upload.css  (50줄)  → 스타일만
upload.js   (150줄) → 동작 로직만
API/paragraphAPI/upload.js (30줄) → API 호출만
  ├── 각 파일이 자기 역할에 집중 (높은 응집도)
  ├── CSS를 고칠 때 JS를 걱정할 필요 없음 (낮은 결합도)
  └── 다른 페이지(login, main_list)와 같은 패턴
```

---

## 5. C-2 해결: API URL 환경변수로 변경

### 환경변수가 뭔가요?

프로젝트 루트에 `.env` 파일이 있습니다. 여기에 서버 주소 같은 **설정값**을 저장합니다.

```
# .env 파일
VITE_API_BASE_URL=https://api.fullstackfamily.com/api/buildup/v1
```

코드에서는 `import.meta.env.VITE_API_BASE_URL`로 이 값을 읽어옵니다.

### 수정 전 (upload.html의 script)

```javascript
const API = "https://api.fullstackfamily.com/api/buildup/v1/movies";

// 이미지 업로드할 때도 URL을 직접 작성
const imgRes = await fetch(
  "https://api.fullstackfamily.com/api/buildup/v1/movies/images", ...
);
```

### 수정 후

```javascript
// 환경변수를 사용합니다 (다른 API 파일들과 같은 방식)
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/movies`, ...
);

const imgRes = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/movies/images`, ...
);
```

> **주의**: `import.meta.env`를 사용하려면 `<script type="module">`이어야 합니다. C-1에서 JS를 별도 파일로 분리하면 자동으로 해결됩니다.

---

## 6. C-4 해결: upload/edit 중복 코드 제거

### 중복이 왜 문제인가요?

upload와 edit에는 **동일한 기능**이 반복됩니다:
- 별점 슬라이더
- 이미지 미리보기
- 드래그앤드롭
- 글자수 카운트
- 폼 초기화

이 기능들을 **공용 파일**로 빼면, 한 곳만 수정해도 양쪽 모두 반영됩니다.

### 공용 파일 만들기

`src/paragraph/common.js` 파일을 새로 만듭니다:

```javascript
// src/paragraph/common.js
// upload와 edit에서 공통으로 사용하는 기능들

/**
 * 별점 슬라이더를 설정합니다
 * @param {Function} onRatingChange - 별점이 바뀔 때 호출할 함수
 */
export function setupRating(onRatingChange) {
  const range = document.getElementById("ratingRange");
  const text = document.getElementById("ratingValue");

  range.addEventListener("input", () => {
    const value = Number(range.value);
    text.textContent = `⭐ ${value.toFixed(1)}`;
    onRatingChange(value);
  });
}

/**
 * 이미지 미리보기를 설정합니다 (URL 입력 + 파일 선택 + 드래그앤드롭)
 */
export function setupImagePreview() {
  const posterInput = document.getElementById("poster");
  const previewImg = document.getElementById("preview");
  const fileInput = document.getElementById("file");
  const previewText = document.querySelector(".preview-text");

  // URL 입력 시 미리보기
  posterInput.addEventListener("input", () => {
    const url = posterInput.value.trim();
    if (url) previewImg.src = url;
  });

  // 파일 선택 시 미리보기
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    previewImg.src = URL.createObjectURL(file);
    posterInput.value = "";
  });

  // 이미지 로드 시 안내 텍스트 숨기기
  previewImg.addEventListener("load", () => {
    if (previewText) previewText.style.display = "none";
  });

  // 드래그앤드롭
  previewImg.addEventListener("dragover", (e) => {
    e.preventDefault();
    previewImg.classList.add("dragover");
  });

  previewImg.addEventListener("dragleave", () => {
    previewImg.classList.remove("dragover");
  });

  previewImg.addEventListener("drop", (e) => {
    e.preventDefault();
    previewImg.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    previewImg.src = URL.createObjectURL(file);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    posterInput.value = "";
  });
}

/**
 * 글자수 카운트를 설정합니다
 * @param {string} textareaId - textarea의 id
 * @param {string} countId - 글자수 표시 요소의 id
 * @param {number} maxLength - 최대 글자수
 */
export function setupCharCount(textareaId, countId, maxLength) {
  const textarea = document.getElementById(textareaId);
  const countEl = document.getElementById(countId);

  textarea.addEventListener("input", () => {
    countEl.textContent = `${textarea.value.length}/${maxLength}자`;
  });
}

/**
 * 폼을 초기화합니다 (취소 버튼용)
 */
export function setupFormReset() {
  const cancelBtn = document.getElementById("cancelBtn");

  cancelBtn.addEventListener("mousedown", (e) => e.preventDefault());

  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!confirm("작성한 내용을 모두 지우시겠습니까?")) return;

    const scrollY = window.scrollY;

    // input 초기화
    document.querySelectorAll("input").forEach((input) => {
      if (input.type === "file") input.value = "";
      else if (input.type === "checkbox") input.checked = false;
      else input.value = "";
    });

    // textarea 초기화
    document.querySelectorAll("textarea").forEach((t) => { t.value = ""; });

    // 이미지 초기화
    const preview = document.getElementById("preview");
    preview.src = "";

    const text = document.querySelector(".preview-text");
    if (text) text.style.display = "block";

    // 별점 초기화
    const range = document.getElementById("ratingRange");
    const ratingText = document.getElementById("ratingValue");
    range.value = 0;
    ratingText.textContent = "⭐ 0.0";

    // 글자수 초기화
    document.getElementById("descCount").textContent = "0/500자";
    document.getElementById("contentCount").textContent = "0/1500자";

    window.scrollTo(0, scrollY);
  });
}
```

### upload.js에서 사용하기

```javascript
// src/paragraph/upload/upload.js
import { uploadImage, createMovie } from "../../API/paragraphAPI/upload.js";
import {
  setupRating,
  setupImagePreview,
  setupCharCount,
  setupFormReset,
} from "../common.js";

// 공용 기능 초기화
let rating = 0;
setupRating((value) => { rating = value; });
setupImagePreview();
setupCharCount("description", "descCount", 500);
setupCharCount("content", "contentCount", 1500);
setupFormReset();

// upload만의 고유 로직: 등록하기
document.getElementById("submit-btn").addEventListener("click", async () => {
  // 유효성 검사 + API 호출 로직
});
```

### 구조 다이어그램

```
common.js (공용 기능)
├── setupRating()        ← upload.js, edit.js 둘 다 사용
├── setupImagePreview()  ← upload.js, edit.js 둘 다 사용
├── setupCharCount()     ← upload.js, edit.js 둘 다 사용
└── setupFormReset()     ← upload.js, edit.js 둘 다 사용

upload.js (등록 전용)
├── import { 공용 기능들 } from "../common.js"
├── import { createMovie } from "../../API/paragraphAPI/upload.js"
└── 등록하기 버튼 클릭 → createMovie() 호출

edit.js (수정 전용)
├── import { 공용 기능들 } from "../common.js"
├── import { getMovie, updateMovie } from "../../API/paragraphAPI/edit.js"
├── 페이지 로드 → getMovie()로 기존 데이터 채우기
└── 수정하기 버튼 클릭 → updateMovie() 호출
```

> **핵심**: 공통 기능은 `common.js`에 한 번만 작성하고, 각 페이지는 **자기만의 고유 로직**만 가지고 있으면 됩니다.

---

## 7. I-1 해결: GENRE_MAP 공통 파일로 추출

### 어디를 고쳐야 하나요?

현재 `GENRE_MAP`이 3개 파일에 중복되어 있습니다:
- `src/main/main_list/main_list.js`
- `src/main/detail/detail.js`
- `src/main/genre_more/genre_more.js`

### 단계 1: 공통 파일 만들기

`src/constants/genre.js` 파일을 새로 만듭니다:

```javascript
// src/constants/genre.js

/** 서버에서 사용하는 장르 키 → 화면에 표시할 한글 이름 */
export const GENRE_MAP = {
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

/** 장르 표시 순서 */
export const GENRE_ORDER = Object.keys(GENRE_MAP);
```

### 단계 2: 각 파일에서 import

```javascript
// main_list.js (수정 전)
const GENRE_MAP = {
  animation: "애니메이션",
  // ... 10줄 반복
};
const GENRE_ORDER = Object.keys(GENRE_MAP);

// main_list.js (수정 후) - 2줄로 끝!
import { GENRE_MAP, GENRE_ORDER } from "@/constants/genre.js";
```

```javascript
// detail.js (수정 후)
import { GENRE_MAP } from "@/constants/genre.js";
```

```javascript
// genre_more.js (수정 후)
import { GENRE_MAP } from "@/constants/genre.js";
```

> **효과**: 장르를 추가하거나 이름을 변경할 때 `genre.js` **한 파일만 수정**하면 전체에 반영됩니다.

---

## 8. I-2 해결: console.log 전체 삭제

### 삭제해야 할 목록

| 파일 | 줄 | 코드 |
|---|---|---|
| `src/API/main_list.js` | 3 | `console.log("Fetching main list from API...");` |
| `src/API/main_list.js` | 4 | `console.log(\`accessToken: ...\`);` |
| `src/API/main_list.js` | 19 | `console.log("Main list response:", json);` |
| `src/API/detail.js` | 3 | `console.log("Fetching detail for postId:", postId);` |
| `src/API/accountAPI/login.js` | 17 | `console.log("LogIn response:", json);` |
| `src/paragraph/upload/upload.html` | 446 | `console.log("함수 실행됨");` |

### 구분하기: 삭제해야 할 것 vs 유지해도 되는 것

```javascript
// ❌ 삭제해야 함 - 개발 중 확인용
console.log("함수 실행됨");
console.log("Main list response:", json);
console.log(`accessToken: ${localStorage.getItem("accessToken")}`);

// ✅ 유지해도 됨 - 실제 에러 기록용
console.error("Error fetching main list:", error);
console.error("이미지 업로드 실패:", errorData);
```

> **VS Code 팁**: `Ctrl + Shift + F`(전체 파일 검색)에서 `console.log`를 검색하면 모든 파일에서 한번에 찾을 수 있습니다.

---

## 9. C-6 해결: XSS 방어 함수 추가

### XSS가 뭔가요?

XSS(Cross-Site Scripting)는 **악성 코드를 웹 페이지에 삽입하는 공격**입니다.

예를 들어, 누군가 영화 제목에 이런 값을 입력한다고 가정해 봅시다:

```
<img src=x onerror="alert('해킹!')">
```

`innerHTML`로 이 값을 삽입하면, 브라우저가 이것을 **진짜 HTML 태그로 인식**하고 `alert('해킹!')`을 실행합니다.

### 해결 방법: 이스케이프 함수 만들기

`src/utils/sanitize.js` 파일을 새로 만듭니다:

```javascript
// src/utils/sanitize.js

/**
 * HTML 특수문자를 이스케이프합니다.
 * 사용자 입력값을 innerHTML에 넣기 전에 반드시 이 함수를 거쳐야 합니다.
 *
 * 예시:
 *   escapeHTML('<script>alert("해킹")</script>')
 *   → '&lt;script&gt;alert(&quot;해킹&quot;)&lt;/script&gt;'
 *   → 브라우저가 일반 텍스트로 표시함 (실행되지 않음)
 */
export function escapeHTML(str) {
  if (!str) return "";

  return str
    .replace(/&/g, "&amp;")     // & → &amp;
    .replace(/</g, "&lt;")      // < → &lt;
    .replace(/>/g, "&gt;")      // > → &gt;
    .replace(/"/g, "&quot;")    // " → &quot;
    .replace(/'/g, "&#39;");    // ' → &#39;
}
```

### 사용 방법

```javascript
// main_list.js (수정 전 - 위험)
function renderSmallCard(post) {
  return `
    <p class="movie-card__title">${post.title}</p>
  `;
}

// main_list.js (수정 후 - 안전)
import { escapeHTML } from "@/utils/sanitize.js";

function renderSmallCard(post) {
  return `
    <p class="movie-card__title">${escapeHTML(post.title)}</p>
  `;
}
```

### 어디에 적용해야 하나요?

`innerHTML`이나 템플릿 리터럴로 **사용자가 입력한 데이터**를 HTML에 삽입하는 모든 곳:

| 파일 | 적용 대상 |
|---|---|
| `main_list.js` | `post.title`, `post.director`, `post.cast`, `post.genre` |
| `detail.js` | `title`, `director`, `cast`, `famousLine` |
| `genre_more.js` | `post.title` |

> **규칙**: `innerHTML`에 변수를 넣을 때는 항상 `escapeHTML()`로 감싸세요. `textContent`는 자동으로 이스케이프되므로 안전합니다.

---

## 10. CSS를 Tailwind로 전환하기

### 기본 원칙

우리 프로젝트에서는 **Tailwind CSS를 기본 스타일링 도구로 사용**합니다. 커스텀 CSS는 Tailwind로 표현할 수 없는 경우(복잡한 애니메이션, ::after 가상 요소 등)에만 최소한으로 사용합니다.

### Tailwind가 처음이라면?

Tailwind는 **미리 만들어진 클래스 이름**을 HTML에 직접 쓰는 방식입니다.

```html
<!-- 전통 CSS 방식: CSS 파일에 스타일을 작성하고, 클래스 이름으로 연결 -->
<div class="movie-card">...</div>

<!-- Tailwind 방식: HTML에 스타일을 직접 작성 -->
<div class="flex flex-col rounded-lg overflow-hidden bg-neutral-800">...</div>
```

### 자주 쓰는 변환 표

| CSS | Tailwind 클래스 |
|---|---|
| `display: flex` | `flex` |
| `flex-direction: column` | `flex-col` |
| `align-items: center` | `items-center` |
| `justify-content: space-between` | `justify-between` |
| `gap: 8px` | `gap-2` |
| `padding: 16px` | `p-4` |
| `margin-bottom: 20px` | `mb-5` |
| `border-radius: 8px` | `rounded-lg` |
| `background-color: #262626` | `bg-neutral-800` |
| `color: #ffffff` | `text-white` |
| `color: #a3a3a3` | `text-neutral-400` |
| `font-size: 14px` | `text-sm` |
| `font-size: 22px` | `text-[22px]` |
| `font-weight: 700` | `font-bold` |
| `overflow: hidden` | `overflow-hidden` |
| `text-decoration: none` | `no-underline` |
| `cursor: pointer` | `cursor-pointer` |
| `width: 100%` | `w-full` |

### 반응형 처리

```css
/* CSS 방식 */
@media (min-width: 768px) {
  .genre-section__grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

```html
<!-- Tailwind 방식 -->
<div class="grid grid-cols-2 min-[768px]:grid-cols-5 gap-2">
```

### 전환 예시: movie-card

```css
/* main_list.css (현재) */
.movie-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  background-color: #262626;
}

.movie-card__poster {
  background-color: #404040;
  overflow: hidden;
}

.movie-card__info {
  padding: 8px;
}

.movie-card__title {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-card__star {
  font-size: 12px;
  color: #facc15;
}
```

```html
<!-- Tailwind로 변환 -->
<a href="..." class="flex flex-col no-underline text-inherit rounded-lg overflow-hidden bg-neutral-800">
  <div class="bg-neutral-700 overflow-hidden">
    <img class="aspect-video object-contain" src="..." alt="..." />
  </div>
  <div class="p-2">
    <p class="text-[13px] font-medium text-white mb-1 overflow-hidden text-ellipsis whitespace-nowrap">영화 제목</p>
    <span class="text-xs text-yellow-400">★ 4.5</span>
  </div>
</a>
```

### 전환할 때 CSS를 유지해야 하는 경우

Tailwind로 표현하기 어려운 것들은 CSS 파일에 남겨둡니다:

```css
/* 이것들은 CSS로 유지 (Tailwind로 표현하기 복잡함) */

/* 1. 그라데이션 오버레이 */
.backdrop::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

/* 2. 슬라이드 인 애니메이션 */
.detail-panel {
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-panel.is-open {
  transform: translateX(0);
}

/* 3. 스크롤바 스타일링 */
.detail-panel {
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;
}
```

> **요약**: "단순한 레이아웃/크기/색상" → Tailwind 클래스로, "복잡한 애니메이션/가상 요소" → CSS 파일에 최소한으로 유지

---

## 체크리스트

모든 수정이 끝나면 아래를 확인하세요:

- [ ] upload/edit에서 `localStorage.getItem("token")` → `"accessToken"`으로 변경 (C-3)
- [ ] `main_list.js`의 토큰 console.log 삭제 (C-5)
- [ ] `signup.js`에 폼 submit 핸들러 추가 (C-7)
- [ ] upload/edit의 CSS, JS를 별도 파일로 분리 (C-1)
- [ ] upload/edit의 API URL을 환경변수로 변경 (C-2)
- [ ] upload/edit의 공통 기능을 `common.js`로 추출 (C-4)
- [ ] `GENRE_MAP`을 `constants/genre.js`로 추출 (I-1)
- [ ] 불필요한 `console.log` 전체 삭제 (I-2)
- [ ] `escapeHTML()` 함수를 만들고 `innerHTML`에 적용 (C-6)
- [ ] 커스텀 CSS를 Tailwind 클래스로 전환 시작 (점진적으로)

> **한 번에 모두 하지 않아도 됩니다!** 우선순위가 높은 것(C-3, C-5)부터 하나씩 진행하세요.
