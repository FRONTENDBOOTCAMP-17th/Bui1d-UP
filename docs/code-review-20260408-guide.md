# Bui1d-UP 4차 코드 리뷰 해결 가이드 (2026-04-08)

> **대상**: `code-review-20260408.md`에서 지적된 문제들
> **난이도**: 초보자도 따라할 수 있도록 단계별 설명
> **순서**: 가장 중요한 것부터 하나씩 해결합니다

---

## 목차

- [해결 1] localStorage 토큰 키 통일하기
- [해결 2] upload/edit 페이지 파일 분리하기 (CSS, JS, HTML)
- [해결 3] DOM 요소를 안전하게 가져오기
- [해결 4] GENRE_MAP과 영화 카드를 공용 모듈로 만들기
- [해결 5] CSS 변수 사용하기
- [해결 6] 이미지 경로 수정하기

---

## [해결 1] localStorage 토큰 키 통일하기

### 문제가 뭔가요?

여러분의 프로젝트에서 로그인 토큰을 저장할 때 파일마다 다른 이름을 쓰고 있습니다:

```
login.js       → localStorage.setItem("accessToken", ...)   ← 저장할 때
genre_more.js  → localStorage.getItem("accessToken")         ← 읽을 때 ✅ 맞음
main_list.js   → localStorage.getItem("accessToken")         ← 읽을 때 ✅ 맞음
upload.html    → localStorage.getItem("token")               ← 읽을 때 ❌ 다른 이름!
edit.html      → localStorage.getItem("token")               ← 읽을 때 ❌ 다른 이름!
```

이것은 마치 택배를 "김철수" 이름으로 보냈는데, 받는 곳에서 "김영수"를 찾는 것과 같습니다. 이름이 다르니 택배를 찾을 수 없죠!

### 어떻게 고치나요?

**방법 A: 가장 간단한 수정** (지금 당장 할 수 있어요)

upload.html과 edit.html에서 `"token"`을 `"accessToken"`으로 바꿉니다:

```js
// upload.html, edit.html에서
// ❌ 변경 전
const token = localStorage.getItem("token");

// ✅ 변경 후
const token = localStorage.getItem("accessToken");
```

**방법 B: 더 좋은 방법** (상수로 관리)

토큰 키 이름을 한 곳에서 관리하면, 나중에 이름이 바뀌어도 한 곳만 수정하면 됩니다:

```js
// src/constants/storage-keys.js (새 파일)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER_ID: "userId",
  NICKNAME: "nickname",
};
```

```js
// login.js에서 사용
import { STORAGE_KEYS } from "@/constants/storage-keys.js";

localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
```

```js
// API 호출하는 곳에서 사용
import { STORAGE_KEYS } from "@/constants/storage-keys.js";

Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`
```

이렇게 하면 키 이름이 **한 곳에만** 정의되므로, 이름을 바꿔도 다른 파일을 고칠 필요가 없습니다. 이것이 **낮은 결합도**입니다.

---

## [해결 2] upload/edit 페이지 파일 분리하기

### 왜 분리해야 하나요?

지금 upload.html 파일 하나가 이렇게 생겼습니다:

```
upload.html (437줄)
├── 1~243줄:   <style> ... CSS 240줄
├── 244~345줄: <body> ... HTML 100줄
└── 346~437줄: <script> ... JS 90줄
```

이것은 마치 **수학 교과서, 영어 교과서, 과학 교과서를 한 권으로 합쳐놓은 것**과 같습니다. 수학 문제를 풀고 싶은데 437페이지를 뒤져야 하죠.

파일을 분리하면:
- CSS를 고치고 싶으면 → CSS 파일만 열면 됩니다
- JS를 고치고 싶으면 → JS 파일만 열면 됩니다
- 같은 CSS를 upload와 edit에서 공유할 수 있습니다

### 단계별로 해봅시다

#### Step 1: 공용 CSS 파일 만들기

upload.html과 edit.html의 CSS가 95% 같으므로, 하나의 CSS 파일로 만듭니다.

새 파일 `src/paragraph/paragraph.css`를 만드세요:

```css
/* src/paragraph/paragraph.css */
@reference "tailwindcss";

body {
  background: var(--background-base);
  color: var(--text-primary);
  font-family: Arial;
  padding: 30px;
}

.wrapper {
  max-width: 1200px;
  margin: auto;
}

.container {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-height: 500px;
}

input,
textarea {
  width: 100%;
  background: var(--background-surface);
  border: 1px solid transparent;
  padding: 10px;
  margin-top: 10px;
  color: var(--text-primary);
  border-radius: 5px;
}

input:focus,
textarea:focus {
  outline: none;
  border: 1px solid var(--color-primary);
}

textarea {
  height: 140px;
}

.preview {
  width: 150px;
  height: 200px;
  background: var(--background-surface);
  margin-top: 10px;
  object-fit: cover;
  display: block;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

#ratingRange {
  flex: 0 0 200px;
  width: 85%;
  accent-color: gold;
  cursor: pointer;
  margin-right: -10px;
}

#ratingValue {
  margin-left: 4px;
  font-weight: bold;
}

.genres {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 40px;
  margin-top: 10px;
  margin-bottom: 20px;
}

.genres label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.genres input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.genres span {
  white-space: nowrap;
}

.buttons {
  margin-top: 30px;
  text-align: right;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

.submit {
  background: var(--color-primary);
  color: var(--text-primary);
}

.cancel {
  background: #444;
  color: var(--text-primary);
  margin-right: 10px;
}

.top-header {
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid var(--background-surface);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.back-btn {
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  color: var(--text-primary);
}

.title {
  font-size: 20px;
  font-weight: bold;
}

/* 반응형 (모바일) */
@media (max-width: 767px) {
  .container {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .preview {
    width: 100%;
    height: auto;
  }

  .genres {
    grid-template-columns: repeat(1, 1fr);
  }

  .buttons {
    text-align: center;
  }

  button {
    width: 100%;
    margin-top: 10px;
  }

  .top-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

@media (min-width: 768px) and (max-width: 1080px) {
  .container {
    flex-direction: row;
    gap: 20px;
  }

  .preview {
    width: 120px;
    height: 160px;
  }

  .wrapper {
    padding: 0 20px;
  }

  input,
  textarea {
    font-size: 14px;
  }

  label {
    margin-top: 10px;
    display: block;
  }

  #ratingRange {
    flex: 0 0 180px;
  }

  .genres {
    gap: 10px 20px;
  }
}
```

#### Step 2: upload.js 만들기

새 파일 `src/paragraph/upload/upload.js`를 만드세요:

```js
// src/paragraph/upload/upload.js
import "../paragraph.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem("accessToken");  // ← "accessToken" 통일!

// DOM 요소를 getElementById로 안전하게 가져옵니다
const posterInput = document.getElementById("poster");
const fileInput = document.getElementById("file");
const previewImg = document.getElementById("preview");
const titleInput = document.getElementById("title");
const yearInput = document.getElementById("year");
const directorInput = document.getElementById("director");
const actorsInput = document.getElementById("actors");
const descriptionInput = document.getElementById("description");
const contentInput = document.getElementById("content");
const ratingRange = document.getElementById("ratingRange");
const ratingText = document.getElementById("ratingValue");

let rating = 0;

// 별점
ratingRange.addEventListener("input", () => {
  rating = ratingRange.value;
  ratingText.textContent = `⭐ ${Number(rating).toFixed(1)}`;
});

// 포스터 미리보기
posterInput.addEventListener("input", (e) => {
  previewImg.src = e.target.value;
});

// 등록
async function createMovie() {
  let imageUrl = "";

  if (fileInput.files[0]) {
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const imgRes = await fetch(`${API_BASE}/movies/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const imgData = await imgRes.json();
    imageUrl = imgData.data.imageUrl;
  }

  const genre = document.querySelector("input[type=checkbox]:checked")?.value;

  const body = {
    title: titleInput.value,
    genre: genre,
    content: contentInput.value,
    star: Number(rating),
    imageUrl: imageUrl || undefined,
    year: Number(yearInput.value) || undefined,
    director: directorInput.value
      ? directorInput.value.split(",").map((v) => v.trim())
      : undefined,
    cast: actorsInput.value
      ? actorsInput.value.split(",").map((v) => v.trim())
      : undefined,
    famousLine: descriptionInput.value || undefined,
  };

  try {
    const res = await fetch(`${API_BASE}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error();

    alert("등록 완료!");
    location.href = "/src/mypage/mypage.html";
  } catch (err) {
    alert("등록 실패");
  }
}

// 등록 버튼 이벤트 연결
document.getElementById("submit-btn").addEventListener("click", createMovie);
```

#### Step 3: upload.html 정리

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>포스트 등록</title>
    <link rel="stylesheet" href="../../styles/theme.css" />
  </head>
  <body>
    <div class="wrapper">
      <div class="top-header">
        <span class="back-btn" id="back-btn">← 나가기</span>
        <span class="title">새 영화 추가</span>
      </div>

      <div class="container">
        <div class="left">
          <label>포스터 URL</label>
          <input id="poster" placeholder="이미지 URL 입력" />
          <input type="file" id="file" />
          <img id="preview" class="preview" />

          <label>영화 제목</label>
          <input id="title" placeholder="영화 제목을 입력하세요" />

          <label>별점</label>
          <div class="rating-box">
            <input type="range" id="ratingRange" min="0" max="5" step="0.5" value="0" />
            <span id="ratingValue">⭐ 0.0</span>
          </div>

          <label>개봉 연도</label>
          <input id="year" placeholder="예: 2024" />

          <label>장르</label>
          <div class="genres">
            <label><input type="checkbox" value="animation" /><span>애니메이션</span></label>
            <label><input type="checkbox" value="comedy" /><span>코미디</span></label>
            <label><input type="checkbox" value="romance" /><span>로맨스</span></label>
            <label><input type="checkbox" value="action_thriller_crime" /><span>액션 / 스릴러 / 범죄</span></label>
            <label><input type="checkbox" value="horror" /><span>호러</span></label>
            <label><input type="checkbox" value="sf_fantasy" /><span>SF / 판타지</span></label>
            <label><input type="checkbox" value="drama" /><span>드라마</span></label>
            <label><input type="checkbox" value="documentary" /><span>다큐멘터리</span></label>
            <label><input type="checkbox" value="music_musical" /><span>음악 / 뮤지컬</span></label>
            <label><input type="checkbox" value="etc" /><span>기타</span></label>
          </div>

          <label>감독</label>
          <input id="director" placeholder="감독 이름 입력 (여러 명은 ,로 구분)" />

          <label>출연진</label>
          <input id="actors" placeholder="출연진 입력 (여러 명은 ,로 구분)" />
        </div>

        <div class="right">
          <label>명대사</label>
          <textarea id="description"></textarea>

          <label>내 리뷰</label>
          <textarea id="content"></textarea>
        </div>
      </div>

      <div class="buttons">
        <button class="cancel" id="cancel-btn">취소</button>
        <button class="submit" id="submit-btn">등록하기</button>
      </div>
    </div>

    <script type="module" src="./upload.js"></script>
  </body>
</html>
```

**핵심 변경 사항:**

1. `<style>` 태그 제거 → `paragraph.css`로 분리
2. `<script>` 태그 → `upload.js`로 분리, `type="module"` 추가
3. `onclick="createMovie()"` → `id="submit-btn"` + JS에서 이벤트 리스너
4. `<meta name="viewport">` 추가
5. `theme.css` 링크 추가

edit.html도 같은 방식으로 edit.js를 만들면 됩니다. CSS는 `paragraph.css`를 공유합니다!

---

## [해결 3] DOM 요소를 안전하게 가져오기

### 문제가 뭔가요?

지금 upload.html과 edit.html에서 이렇게 쓰고 있습니다:

```js
// ❌ 위험한 방법: HTML id를 전역 변수처럼 사용
poster.value = "영화 포스터 URL";
title.value = "영화 제목";
```

이것은 브라우저가 `id="poster"`인 요소를 자동으로 `window.poster`에 넣어주는 기능을 이용한 것인데, **실무에서는 절대 사용하지 않는 방법**입니다.

### 왜 위험한가요?

```html
<input id="title" />
```

```js
// title이라는 이름은 이미 document.title(페이지 제목)이 사용하고 있습니다!
console.log(title);
// 어떤 브라우저: <input id="title" />  ← input 요소
// 다른 브라우저: "포스트 수정"          ← 페이지 제목 문자열
// → 브라우저마다 결과가 다를 수 있습니다!
```

### 어떻게 고치나요?

항상 `document.getElementById()`를 사용해서 명확하게 가져오세요:

```js
// ✅ 안전한 방법: getElementById로 명확하게 가져오기
const posterInput = document.getElementById("poster");
const titleInput = document.getElementById("title");
const yearInput = document.getElementById("year");
const directorInput = document.getElementById("director");
const actorsInput = document.getElementById("actors");
const descriptionInput = document.getElementById("description");
const contentInput = document.getElementById("content");
const previewImg = document.getElementById("preview");

// 사용할 때
posterInput.value = "영화 포스터 URL";
titleInput.value = "영화 제목";
```

**변수 이름에 Input, Img 같은 접미사를 붙이면** HTML 요소라는 것이 명확해집니다:
- `posterInput` → "poster라는 input 요소구나"
- `previewImg` → "preview라는 img 요소구나"

---

## [해결 4] GENRE_MAP과 영화 카드를 공용 모듈로 만들기

### 문제가 뭔가요?

`GENRE_MAP`이 두 파일에 똑같이 복사되어 있습니다:

```js
// main_list.js에도 있고...
const GENRE_MAP = { animation: "애니메이션", comedy: "코미디", ... };

// genre_more.js에도 있습니다
const GENRE_MAP = { animation: "애니메이션", comedy: "코미디", ... };
```

영화 카드 HTML도 두 파일에 거의 같은 코드가 있습니다.

만약 장르 이름을 바꾸거나, 카드 디자인을 수정하면 **두 파일 모두 고쳐야** 합니다. 하나만 고치면 불일치가 발생하죠.

### 어떻게 고치나요?

#### Step 1: 공용 상수 파일 만들기

```js
// src/constants/genres.js (새 파일)
export const GENRE_MAP = {
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

export const GENRE_ORDER = Object.keys(GENRE_MAP);
```

#### Step 2: 공용 카드 컴포넌트 만들기

```js
// src/components/movie-card.js (새 파일)
export function renderMovieCard(post) {
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
```

#### Step 3: 기존 파일에서 import하여 사용

```js
// src/main/main_list/main_list.js (수정)
import { GENRE_MAP, GENRE_ORDER } from "@/constants/genres.js";
import { renderMovieCard } from "@/components/movie-card.js";

// 기존의 GENRE_MAP, GENRE_ORDER 정의를 삭제하고 import로 대체
// 기존의 renderSmallCard를 renderMovieCard로 대체
```

```js
// src/main/genre_more/genre_more.js (수정)
import { GENRE_MAP } from "@/constants/genres.js";
import { renderMovieCard } from "@/components/movie-card.js";

// 기존의 GENRE_MAP 정의를 삭제하고 import로 대체
// 기존의 renderCard를 renderMovieCard로 대체
```

**결과**: 장르 이름을 바꾸고 싶으면 `genres.js` **한 곳만** 수정하면 됩니다!

### 이것이 바로 "응집도는 높이고, 결합도는 낮추는" 방법입니다

```
변경 전:                            변경 후:
┌─────────────┐                    ┌─────────────┐
│ main_list.js │ GENRE_MAP 복사     │ main_list.js │ ──import──┐
│ renderCard() │ 복사               │              │           │
└─────────────┘                    └─────────────┘           │
                                                              ▼
┌─────────────┐                    ┌─────────────┐     ┌──────────┐
│ genre_more.js│ GENRE_MAP 복사     │ genre_more.js│──import──│genres.js │ ← 한 곳에서 관리
│ renderCard() │ 복사               │              │     │movie-card│
└─────────────┘                    └─────────────┘     └──────────┘
```

---

## [해결 5] CSS 변수 사용하기

### 문제가 뭔가요?

`theme.css`에 색상이 잘 정의되어 있는데, 새로 만든 CSS 파일에서 사용하지 않고 있습니다:

```css
/* theme.css에 이미 정의되어 있는데... */
:root {
  --background-base: #171717;
  --text-primary: #ffffff;
  --background-surface: #262626;
}

/* genre_more.css에서 직접 색상값을 쓰고 있습니다 */
body { background-color: #171717; }   /* --background-base랑 같은 값인데... */
.movie-card { background-color: #262626; } /* --background-surface랑 같은 값인데... */
```

### 어떻게 고치나요?

색상 값(`#171717`) 대신 변수 이름(`var(--background-base)`)을 사용하세요:

```css
/* genre_more.css - 수정 */
body {
  background-color: var(--background-base);     /* #171717 대신 */
  color: var(--text-primary);                    /* #ffffff 대신 */
}

.movie-card {
  background-color: var(--background-surface);   /* #262626 대신 */
}

.movie-card__title {
  color: var(--text-primary);                    /* #ffffff 대신 */
}

.movie-card__star {
  color: var(--color-star);                      /* #facc15 대신 */
}

.load-more-btn {
  color: var(--text-tertiary);                   /* #d4d4d4 대신 */
}
```

**같은 원칙을 main_list.css에도 적용하세요.**

### 변수를 쓰면 뭐가 좋나요?

나중에 디자이너가 "배경색을 #171717에서 #1a1a2e로 바꿔주세요"라고 하면:

- **변수 없이**: genre_more.css, main_list.css, header.css... **모든 파일**에서 `#171717`을 찾아 바꿔야 합니다
- **변수 사용**: `theme.css`에서 `--background-base: #1a1a2e;` **한 줄만** 바꾸면 끝!

---

## [해결 6] 이미지 경로 수정하기

### 문제가 뭔가요?

Vite 프로젝트에서 `public/` 폴더의 파일은 빌드 시 자동으로 루트(`/`)에 복사됩니다.

```
프로젝트 폴더/
├── public/
│   └── Bui1dBox.png     ← 이 파일은
└── dist/                 (빌드 후)
    └── Bui1dBox.png     ← 여기에 복사됩니다 (/Bui1dBox.png으로 접근)
```

그래서 경로를 쓸 때 `/public/`을 포함하면 안 됩니다.

### 어떻게 고치나요?

아래 파일들에서 수정합니다:

```html
<!-- src/account/login/login.html:62 -->
<!-- ❌ 변경 전 -->
<img src="/public/Bui1dBox.png" alt="빌드업 텍스트 로고" />

<!-- ✅ 변경 후 -->
<img src="/Bui1dBox.png" alt="빌드업 텍스트 로고" />
```

```html
<!-- src/account/signup/signup.html:58, 95 -->
<!-- ❌ 변경 전 -->
<img src="/public/Bui1dBox.png" alt="빌드업 텍스트 로고" />

<!-- ✅ 변경 후 -->
<img src="/Bui1dBox.png" alt="빌드업 텍스트 로고" />
```

**확인 방법**: 수정 후 `npm run build`를 실행하고, `npm run preview`로 빌드된 결과를 확인하세요. 이미지가 정상 표시되면 성공!

---

## 정리: 우선순위별 작업 순서

가장 중요한 것부터 하나씩 해결하세요:

| 순서 | 작업 | 난이도 | 예상 시간 |
|---|---|---|---|
| 1 | [해결 1] localStorage 토큰 키 통일 | 쉬움 | 5분 |
| 2 | [해결 6] 이미지 경로 `/public/` 제거 | 쉬움 | 5분 |
| 3 | [해결 5] CSS에서 `var(--변수)` 사용 | 쉬움 | 15분 |
| 4 | [해결 3] `getElementById`로 DOM 접근 | 보통 | 20분 |
| 5 | [해결 4] GENRE_MAP, 카드 공용 모듈화 | 보통 | 30분 |
| 6 | [해결 2] upload/edit 파일 분리 | 어려움 | 1시간 |

> 모든 것을 한꺼번에 할 필요는 없습니다. 1~3번은 빠르게 할 수 있으니 먼저 하고, 4~6번은 시간을 내서 천천히 해보세요!
