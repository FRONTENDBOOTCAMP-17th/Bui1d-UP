# Bui1d-UP 4차 코드 리뷰 (2026-04-08)

> **대상**: develop 브랜치 (커밋 `770801c` ~ `2bd3221` 사이 변경분)
> **리뷰 범위**: 로그인/회원가입, 장르별 모아보기, 글 작성/수정 페이지, input 컴포넌트
> **목적**: 응집도(Cohesion)를 높이고 결합도(Coupling)를 낮추는 방향으로 개선점 안내
> **난이도**: 입문자 눈높이

---

## 목차

1. [이번 리뷰 요약](#1-이번-리뷰-요약)
2. [잘한 점](#2-잘한-점)
3. [반드시 고쳐야 할 문제 (Critical)](#3-반드시-고쳐야-할-문제-critical)
4. [개선하면 좋은 점 (Improvement)](#4-개선하면-좋은-점-improvement)
5. [파일별 상세 리뷰](#5-파일별-상세-리뷰)
6. [이전 리뷰 체크리스트 점검](#6-이전-리뷰-체크리스트-점검)

---

## 1. 이번 리뷰 요약

| 구분 | 내용 |
|---|---|
| 새 파일 | 12개 (login, signup, genre_more, upload, edit 등) |
| 수정 파일 | 2개 (input.js, package.json) |
| Critical 이슈 | 6개 |
| Improvement 이슈 | 6개 |

**한줄 요약**: 로그인/장르별 모아보기는 구조가 잘 잡혀 있습니다. 하지만 글 작성/수정 페이지(upload, edit)가 HTML 한 파일에 CSS+JS를 모두 넣어서 **응집도가 매우 낮고**, 다른 페이지와 다른 패턴으로 작성되어 **결합도 문제**가 있습니다.

---

## 2. 잘한 점

### 2-1. 로그인 페이지 - 관심사 분리가 훌륭합니다

```
src/account/login/
├── login.html    → 화면 구조 (HTML)
├── login.js      → 동작 로직 (JS)
└── (input.css)   → 공용 컴포넌트 CSS 참조
```

```
src/API/accountAPI/
└── login.js      → API 호출만 담당
```

**화면(HTML)**, **동작(JS)**, **API 호출(API 폴더)**이 깔끔하게 분리되어 있습니다. 이것이 **높은 응집도**의 좋은 예시입니다. 각 파일이 자기 역할에만 집중하고 있습니다.

### 2-2. input 컴포넌트 - 재사용 가능한 설계

```js
// src/components/input.js
setupInput("username");    // 아이디 필드 셋업
setupInput("password");    // 비밀번호 필드 셋업
setupToggle("password");   // 비밀번호 보기/숨기기
```

- `setupInput()`, `setupToggle()` 함수로 여러 입력 필드에 같은 동작을 적용할 수 있습니다
- 유효성 검사 규칙(`rules` 객체)이 한 곳에 정리되어 있어 관리가 쉽습니다
- clear 버튼, 포커스/블러 상태 관리가 체계적입니다
- CSS도 `input.css`로 분리되어 있어 어디서든 재사용 가능합니다

### 2-3. 장르별 모아보기 - 페이지네이션 구현

```js
// src/main/genre_more/genre_more.js
async function loadMore() {
  if (isLoading) return;    // 중복 요청 방지 (좋습니다!)
  isLoading = true;
  loadMoreBtn.disabled = true;
  // ...
}
```

- `isLoading` 플래그로 중복 요청을 방지한 것은 실무에서도 중요한 패턴입니다
- offset/limit 기반 페이지네이션이 잘 구현되어 있습니다
- 마지막 페이지 판단 로직(`data.length < LIMIT`)도 정확합니다

### 2-4. 로그인 에러 처리 - 사용자 친화적

```js
// src/account/login/login.js
if (err.message === "NOT_FOUND") {
  usernameHint.textContent = "존재하지 않는 아이디입니다.";
} else if (err.message === "UNAUTHORIZED") {
  passwordHint.textContent = "비밀번호가 올바르지 않습니다.";
}
```

에러 코드별로 정확한 위치에 메시지를 표시하는 것은 좋은 UX입니다. 아이디 에러는 아이디 필드에, 비밀번호 에러는 비밀번호 필드에 표시합니다.

### 2-5. 접근성(Accessibility) 고려

```html
<!-- login.html -->
<input aria-labelledby="username-label" aria-describedby="username-hint" />
<p class="text-hint" id="username-hint" aria-live="polite"></p>
```

`aria-labelledby`, `aria-describedby`, `aria-live="polite"` 등의 접근성 속성이 잘 적용되어 있습니다. 스크린 리더 사용자도 입력 필드와 힌트 메시지를 제대로 읽을 수 있습니다.

---

## 3. 반드시 고쳐야 할 문제 (Critical)

### 3-1. upload/edit 페이지의 토큰 키가 다릅니다 (로그인이 안 됩니다!)

**파일**: `src/paragraph/upload/upload.html`, `src/paragraph/edit/edit.html`

```js
// upload.html, edit.html (349줄, 356줄)
const token = localStorage.getItem("token");        // ← "token"을 읽음

// login.js (21줄)
localStorage.setItem("accessToken", token);          // ← "accessToken"으로 저장

// genre_more.js (14줄)
Authorization: `Bearer ${localStorage.getItem("accessToken")}` // ← "accessToken"을 읽음
```

**문제**: 로그인할 때 `"accessToken"`이라는 이름으로 저장하는데, upload/edit에서는 `"token"`이라는 이름으로 읽고 있습니다. **키 이름이 다르므로 토큰을 찾지 못해서 API 호출 시 인증 실패(401 에러)가 발생합니다.**

이것은 **높은 결합도**의 전형적인 문제입니다. 여러 파일이 같은 데이터(토큰)를 사용하는데, 이름을 각자 다르게 쓰고 있어서 하나를 바꾸면 다른 곳이 깨집니다.

> **해결 방법**: `code-review-20260408-guide.md` 가이드의 **[해결 1]** 참고

---

### 3-2. upload/edit 페이지에 CSS + JS가 HTML에 모두 들어있습니다 (낮은 응집도)

**파일**: `src/paragraph/upload/upload.html` (437줄), `src/paragraph/edit/edit.html` (492줄)

```
upload.html 한 파일의 구성:
├── <style>  ... 240줄의 CSS
├── <body>   ... 100줄의 HTML
└── <script> ... 90줄의 JavaScript
```

**문제가 뭔가요?**

1. **한 파일에 세 가지 역할이 섞여 있습니다** (스타일 + 구조 + 동작)
   - "CSS만 고치고 싶은데 437줄짜리 파일에서 어디가 CSS인지 찾아야 해요"
   - 이것은 **낮은 응집도**입니다

2. **upload.html과 edit.html의 CSS가 95% 동일합니다**
   - 약 240줄의 CSS가 두 파일에 복사-붙여넣기 되어 있습니다
   - 스타일을 수정하려면 두 파일 모두 고쳐야 합니다
   - 이것은 **높은 결합도**입니다

3. **다른 페이지들과 패턴이 다릅니다**
   - login, genre_more 등은 `HTML + JS + CSS` 파일로 분리되어 있는데
   - upload, edit만 HTML 하나에 다 넣었습니다

**비교해 봅시다:**

```
✅ 좋은 구조 (login 페이지)        ❌ 현재 구조 (upload 페이지)
src/account/login/                src/paragraph/upload/
├── login.html  (구조)            └── upload.html (구조+스타일+동작 전부!)
├── login.js    (동작)
└── (input.css 참조)
```

> **해결 방법**: `code-review-20260408-guide.md` 가이드의 **[해결 2]** 참고

---

### 3-3. upload/edit 페이지에서 API URL이 하드코딩되어 있습니다

**파일**: `src/paragraph/upload/upload.html:348`, `src/paragraph/edit/edit.html:355`

```js
// upload.html, edit.html
const API = "https://api.fullstackfamily.com/api/buildup/v1/movies";

// 다른 파일들은 환경변수 사용 (좋은 예)
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/movies/home`);
```

**문제**: API 서버 주소가 바뀌면(예: 테스트 서버 → 실제 서버) 이 파일들의 코드를 직접 수정해야 합니다. 다른 파일들은 `.env`의 환경변수를 잘 사용하고 있는데, upload/edit만 직접 URL을 적어놨습니다.

**원인**: `<script>` 태그에 `type="module"`이 없어서 `import.meta.env`를 사용할 수 없습니다. 이것은 3-2번(파일 분리)을 해결하면 자동으로 해결됩니다.

---

### 3-4. upload/edit 페이지에서 DOM ID를 전역 변수처럼 사용합니다

**파일**: `src/paragraph/upload/upload.html`, `src/paragraph/edit/edit.html`

```js
// edit.html (387~394줄) - getElementById 없이 바로 사용
poster.value = movie.imageUrl;     // poster = id="poster"인 요소
preview.src = movie.imageUrl;      // preview = id="preview"인 요소
title.value = movie.title;         // ⚠️ 위험! title은 document.title과 충돌합니다!
year.value = movie.year;
director.value = movie.director?.join(", ") || "";
```

**문제**: HTML에서 `id="poster"`를 주면 브라우저가 자동으로 `window.poster`라는 전역 변수를 만들어줍니다. 이걸 이용해서 `getElementById` 없이 바로 접근하고 있는데, 이것은 **매우 위험한 코딩 습관**입니다.

**특히 `title`이 문제입니다:**
- `window.title`은 원래 `document.title` (페이지 제목)을 가리킵니다
- `id="title"`인 input 요소가 있으면, 브라우저에 따라 어떤 것이 우선인지 달라집니다
- 의도치 않게 페이지 제목이 바뀌거나, input 값을 읽지 못할 수 있습니다

> **해결 방법**: `code-review-20260408-guide.md` 가이드의 **[해결 3]** 참고

---

### 3-5. 이미지 경로에 여전히 `/public/`이 포함되어 있습니다

**파일**: `src/account/login/login.html:62`, `src/account/signup/signup.html:58,95`

```html
<!-- 현재 (잘못된 경로) - 이전 리뷰에서 이미 지적한 문제입니다 -->
<img src="/public/Bui1dBox.png" alt="빌드업 텍스트 로고" />

<!-- 올바른 경로 -->
<img src="/Bui1dBox.png" alt="빌드업 텍스트 로고" />
```

Vite에서 `public/` 폴더의 파일은 빌드 시 루트(`/`)에 복사됩니다. `/public/Bui1dBox.png`이 아니라 `/Bui1dBox.png`이 올바른 경로입니다.

**개발 서버에서는 우연히 동작할 수 있지만, `npm run build`로 빌드하면 이미지가 깨집니다.**

---

### 3-6. 회원가입 페이지에 JavaScript 파일이 없습니다

**파일**: `src/account/signup/signup.html:307`

```html
<script type="module" src="./signup.js"></script>
```

signup.html에서 `signup.js`를 로드하려고 하는데, **이 파일이 존재하지 않습니다.** 브라우저 콘솔에서 404 에러가 발생하고 회원가입 폼은 아무 동작도 하지 않습니다.

회원가입 기능이 아직 구현 전이라면, HTML에 주석으로 표시해두면 좋습니다:

```html
<!-- TODO: signup.js 아직 미구현 -->
<script type="module" src="./signup.js"></script>
```

---

## 4. 개선하면 좋은 점 (Improvement)

### 4-1. GENRE_MAP이 두 파일에 복사되어 있습니다

**파일**: `src/main/main_list/main_list.js:5~16`, `src/main/genre_more/genre_more.js:5~16`

```js
// main_list.js에도 있고
const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  // ...
};

// genre_more.js에도 똑같이 있습니다
const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  // ...
};
```

**문제**: 장르 이름을 바꾸거나 새 장르를 추가하면 **두 파일 모두 수정해야 합니다.** 하나만 고치면 불일치가 발생합니다.

> **해결 방법**: `code-review-20260408-guide.md` 가이드의 **[해결 4]** 참고

---

### 4-2. 영화 카드 HTML이 두 파일에 중복됩니다

**파일**: `src/main/main_list/main_list.js:50~62`, `src/main/genre_more/genre_more.js:29~41`

```js
// main_list.js의 renderSmallCard
function renderSmallCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="movie-card">
      <div class="movie-card__poster">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" />` : ""}
      </div>
      ...
    </a>`;
}

// genre_more.js의 renderCard - 거의 동일합니다!
function renderCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="movie-card">
      <div class="movie-card__poster">
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" />` : ""}
      </div>
      ...
    </a>`;
}
```

> **해결 방법**: `code-review-20260408-guide.md` 가이드의 **[해결 4]** 참고

---

### 4-3. API 함수에서 alert()를 호출하지 마세요

**파일**: `src/API/accountAPI/login.js:18`

```js
// src/API/accountAPI/login.js
export const login = async (id, password) => {
  // ...
  alert(`로그인에 성공하였습니다!`);   // ← API 함수 안에 alert?
  return json.data;
};
```

**문제**: API 함수의 역할은 **서버와 데이터를 주고받는 것**입니다. 사용자에게 알림을 보여주는 것은 **화면(UI)의 역할**입니다.

만약 다른 페이지에서 같은 `login()` 함수를 쓰는데 알림 없이 조용히 로그인하고 싶다면? 이 alert 때문에 함수를 재사용할 수 없게 됩니다.

```js
// ❌ 나쁜 예: API 함수에 UI 로직
export const login = async (id, password) => {
  // ...
  alert("성공!");          // API 함수가 UI까지 담당
  return json.data;
};

// ✅ 좋은 예: API 함수는 데이터만, UI는 호출하는 쪽에서
export const login = async (id, password) => {
  // ...
  return json.data;         // 데이터만 반환
};

// login.js (호출하는 쪽)
const data = await login(id, password);
alert("로그인에 성공하였습니다!");  // UI 로직은 여기에
```

---

### 4-4. 새 CSS 파일에서 색상이 하드코딩되어 있습니다

**파일**: `src/main/genre_more/genre_more.css`, `src/main/main_list/main_list.css`

```css
/* genre_more.css */
body {
  background-color: #171717;   /* theme.css의 --background-base와 같은 값 */
  color: #ffffff;              /* theme.css의 --text-primary와 같은 값 */
}

.movie-card {
  background-color: #262626;   /* theme.css의 --background-surface와 같은 값 */
}
```

이전 리뷰에서 header.css의 같은 문제를 지적했었습니다. theme.css에 정의된 CSS 변수를 사용해야 합니다:

```css
/* 개선 */
body {
  background-color: var(--background-base);
  color: var(--text-primary);
}

.movie-card {
  background-color: var(--background-surface);
}
```

---

### 4-5. main_list.js에 디버깅용 console.log가 남아있습니다

**파일**: `src/API/main_list.js:3,4,19`

```js
export const getMainList = async () => {
  try {
    console.log("Fetching main list from API...");
    console.log(`accessToken: ${localStorage.getItem("accessToken")}`);  // ⚠️ 토큰 노출!
    // ...
    console.log("Main list response:", json);
```

**문제 2가지**:

1. **개발 중 디버깅 로그를 지우지 않았습니다** - 배포 시 사용자 브라우저 콘솔에 불필요한 메시지가 출력됩니다
2. **accessToken이 콘솔에 출력됩니다** - 보안상 토큰 값을 콘솔에 노출하면 안 됩니다. 다른 사람이 브라우저 개발자 도구를 열면 토큰을 볼 수 있습니다

---

### 4-6. edit.html에 CSS 속성이 중복 선언되어 있습니다

**파일**: `src/paragraph/edit/edit.html:155~159`

```css
#ratingValue {
  margin-left: 2px;       /* ← 첫 번째 선언 */
  font-weight: bold;
  margin-left: 4px;       /* ← 같은 속성을 다시 선언 (이게 적용됨) */
}
```

같은 속성을 두 번 쓰면 마지막 값만 적용됩니다. 의도한 값이 `4px`이라면 `2px` 줄을 지우세요.

---

## 5. 파일별 상세 리뷰

### `src/API/accountAPI/login.js` - 양호, 소폭 개선

| 항목 | 평가 |
|---|---|
| async/await 사용 | ✅ 잘함 |
| 에러 처리 | ✅ errorCode 활용 |
| 환경변수 사용 | ✅ `import.meta.env` |
| alert() 포함 | ❌ API 함수에서 제거 필요 |

### `src/API/genre_more.js` - 양호

| 항목 | 평가 |
|---|---|
| 파라미터 설계 | ✅ offset, limit 기본값 |
| URLSearchParams 사용 | ✅ 깔끔 |
| 에러 시 null 반환 | ⚠️ 호출 쪽에서 null 체크 필요 |
| 인증 토큰 처리 | ✅ accessToken 사용 |

### `src/account/login/login.html` - 양호, 경로 수정 필요

| 항목 | 평가 |
|---|---|
| 접근성 속성 | ✅ aria-* 잘 적용 |
| 반응형 레이아웃 | ✅ 모바일/데스크탑 분리 |
| input 컴포넌트 활용 | ✅ 재사용 |
| 이미지 경로 | ❌ `/public/` 포함 |
| Tailwind + CSS 변수 혼용 | ⚠️ 일관성 필요 |

### `src/account/login/login.js` - 잘 작성됨

| 항목 | 평가 |
|---|---|
| 모듈 import | ✅ 구조적 |
| 에러별 UI 피드백 | ✅ 사용자 친화적 |
| 토큰 저장 | ✅ localStorage 활용 |
| 페이지 이동 | ✅ |

### `src/account/signup/signup.html` - JS 미구현

| 항목 | 평가 |
|---|---|
| HTML 구조 | ✅ login과 일관성 있음 |
| 접근성 | ✅ aria-* 적용 |
| signup.js | ❌ 파일 미존재 |
| 이미지 경로 | ❌ `/public/` 포함 |

### `src/components/input.js` - 잘 설계됨

| 항목 | 평가 |
|---|---|
| 재사용성 | ✅ ID 기반으로 유연하게 동작 |
| 유효성 검사 | ✅ regex 패턴 분리 |
| 상태 관리 | ✅ is-error, is-success 클래스 토글 |
| export | ✅ setupInput, setupToggle |

### `src/main/genre_more/genre_more.js` - 잘 작성됨, 중복 개선 필요

| 항목 | 평가 |
|---|---|
| 페이지네이션 | ✅ offset/limit |
| 중복 요청 방지 | ✅ isLoading 플래그 |
| URL 파라미터 활용 | ✅ URLSearchParams |
| GENRE_MAP 중복 | ❌ main_list.js와 동일 |
| renderCard 중복 | ❌ main_list.js의 renderSmallCard와 유사 |

### `src/paragraph/upload/upload.html` - 대폭 개선 필요

| 항목 | 평가 |
|---|---|
| CSS/JS 분리 | ❌ 전부 인라인 |
| API URL | ❌ 하드코딩 |
| 토큰 키 | ❌ "token" (다른 곳은 "accessToken") |
| DOM 접근 | ❌ 전역 변수 의존 |
| script type | ❌ module 아님 |
| edit.html과 CSS 중복 | ❌ 95% 동일 |
| viewport meta | ❌ 누락 |

### `src/paragraph/edit/edit.html` - 대폭 개선 필요 (upload와 동일한 문제)

upload.html과 같은 문제를 모두 가지고 있으며, 추가로:

| 항목 | 평가 |
|---|---|
| CSS 속성 중복 선언 | ❌ margin-left 2번 |
| 장르 체크박스 | ⚠️ 첫 번째 체크된 것만 읽음 (단일 선택이면 radio 사용 권장) |

---

## 6. 이전 리뷰 체크리스트 점검

2차 리뷰(2026-04-06)에서 제안한 항목들의 반영 상태입니다:

| 항목 | 상태 | 비고 |
|---|---|---|
| `.env` 파일을 `.gitignore`에 추가 | ⚠️ 미확인 | 습관으로 권장 |
| 이미지 경로에 `/public/` 제거 | ❌ 미반영 | login.html, signup.html에서 여전히 사용 중 |
| CSS에서 `var(--변수)` 사용 | ❌ 미반영 | genre_more.css, main_list.css 하드코딩 |
| ESLint에서 React 설정 제거 | ✅ 반영됨 | eslint.config.js 정리 완료 |
| 파일명 kebab-case 통일 | ⚠️ 부분 반영 | 새 파일은 대체로 양호 |
| 공용 API client.js 만들기 | ❌ 미반영 | 여전히 각 API 파일에서 fetch 직접 호출 |

---

## 이번 리뷰 체크리스트

팀원들이 다음 PR을 올리기 전에 확인해 보세요:

- [ ] localStorage 키 이름이 프로젝트 전체에서 통일되어 있는가? (`"accessToken"`)
- [ ] HTML, CSS, JS가 각각 별도 파일로 분리되어 있는가?
- [ ] API URL에 환경변수(`import.meta.env.VITE_API_BASE_URL`)를 사용했는가?
- [ ] DOM 요소 접근 시 `document.getElementById()`를 사용했는가? (전역 변수 X)
- [ ] 이미지 경로에 `/public/`이 포함되어 있지 않은가?
- [ ] CSS에서 색상 값 대신 `var(--변수)`를 사용했는가?
- [ ] 디버깅용 `console.log`를 제거했는가?
- [ ] `<script>` 태그에 `type="module"`이 있는가?

---

> 로그인, 장르별 모아보기는 이전 리뷰의 피드백이 잘 반영되어 구조가 좋습니다! upload/edit 페이지도 같은 패턴으로 리팩토링하면 프로젝트 전체의 일관성이 크게 올라갑니다. 화이팅!
