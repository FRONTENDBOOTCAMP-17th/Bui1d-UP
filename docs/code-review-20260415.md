# Bui1d-UP 6차 코드 리뷰 (2026-04-15)

> **리뷰 날짜**: 2026-04-15
> **대상**: develop 브랜치 (이전 리뷰 `0aa442c` 이후 커밋 `168ff5c ~ d1b1af7`)
> **이전 리뷰**: [code-review-20260409.md](./code-review-20260409.md)
> **리뷰 범위**: 마이페이지, 랜딩, 업로드/수정, 헤더, 이메일/닉네임/비밀번호 변경 API, 회원탈퇴, 로그아웃, utils
> **목적**: 응집도(Cohesion)를 높이고 결합도(Coupling)를 낮추는 방향의 개선 안내
> **난이도**: 입문자 눈높이

---

## 목차

1. [이번 리뷰 요약](#1-이번-리뷰-요약)
2. [지난 리뷰 이후 좋아진 점 (축하해요!)](#2-지난-리뷰-이후-좋아진-점-축하해요)
3. [지난 리뷰에서 아직 해결되지 않은 항목](#3-지난-리뷰에서-아직-해결되지-않은-항목)
4. [새로 발견된 잘한 점](#4-새로-발견된-잘한-점)
5. [이번에 새로 발견한 "반드시 고쳐야 할 문제" (Critical)](#5-이번에-새로-발견한-반드시-고쳐야-할-문제-critical)
6. [이번에 새로 발견한 "개선하면 좋을 점" (Improvement)](#6-이번에-새로-발견한-개선하면-좋을-점-improvement)
7. [파일별 상세 리뷰](#7-파일별-상세-리뷰)
8. [CSS vs Tailwind 사용 현황 (업데이트)](#8-css-vs-tailwind-사용-현황-업데이트)
9. [이슈 우선순위 정리](#9-이슈-우선순위-정리)

---

## 1. 이번 리뷰 요약

| 구분 | 내용 |
|---|---|
| 새 파일 | 12개 (mypage.html/js, landing.html, upload.js, edit.js, utils/auth.js, utils/genres.js, mypageAPI 3개, withdraw.js, logout.js, delete.js) |
| 주요 변경 파일 | 8개 (header.js, main_list.js, detail.js, genre_more.js, signup.js, input.js, theme.css, login.html) |
| 지난 리뷰 해결 | 4개 (C-3, C-7, I-1, C-1 부분) |
| 지난 리뷰 미해결 | 6개 |
| 이번 Critical 이슈 | 9개 |
| 이번 Improvement 이슈 | 7개 |

**한줄 요약**: 마이페이지(아코디언 UI), 이메일/닉네임/비밀번호 변경 API, 랜딩 페이지를 새로 만든 것은 도전적이고 훌륭합니다. 특히 **`utils/auth.js`와 `utils/genres.js` 같은 공통 모듈을 만든 점**은 지난 리뷰의 개선점을 정확히 해결한 아주 잘한 결정이에요. 하지만 아쉽게도 **`upload.html`/`edit.html`의 `<style>` 300줄과 커스텀 CSS는 그대로 남아 있고**, 새로 추가된 `landing.html`도 같은 실수를 반복하고 있어요. 또한 `mypage.js`의 **중복 import 한 줄**이 페이지 실행을 막는 버그를 일으키므로 가장 먼저 고쳐야 합니다.

---

## 2. 지난 리뷰 이후 좋아진 점 (축하해요!)

### ✅ 해결된 항목

#### 2-1. ~~C-3. 토큰 키 이름 불일치~~ → **완벽 해결**

지난 리뷰에서 `"accessToken"`과 `"token"`이 섞여 있어 글 작성/수정 페이지가 항상 인증에 실패하는 버그가 있었죠. 이번에는 `src/utils/auth.js`라는 공통 모듈을 만들어서 한 곳에서만 관리하도록 바꾸었어요.

```javascript
// src/utils/auth.js (신규)
const TOKEN_KEY = "accessToken";

export function requireAuth() { ... }
export function isLoggedIn() { ... }
export function getToken() { ... }
export function redirectOnAuthFail(response) { ... }
```

그리고 `upload.js`, `edit.js`, `detail.js`, `main_list.js`, `mypage.js`, `genre_more.js`가 모두 이 함수를 import해서 씁니다.

> **왜 잘했나요?** 토큰 이름 같은 "결정"을 한 곳에만 적어두면, 나중에 이름을 바꿀 때 파일 한 개만 수정하면 되기 때문이에요. 이것을 **"단일 진실 공급원(Single Source of Truth)"** 원칙이라고 합니다. 지난 리뷰에서 제안한 내용을 정확하게 이해하고 적용했어요. 👍

#### 2-2. ~~C-7. signup.js에 폼 submit 핸들러가 없음~~ → **해결**

`src/account/signup/signup.js` 122번째 줄에 `signupForm.addEventListener("submit", ...)`가 추가되었어요. 이메일 인증 여부 확인, 비밀번호 일치 확인, 에러 코드별 메시지 처리까지 깔끔하게 작성되어 있습니다.

```javascript
// signup.js:122~172
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isEmailVerified) { ... }
  // ...
  try {
    await signup(id, pwd, email, nickname, emailUuid);
    location.href = "../../account/login/login.html";
  } catch (error) {
    if (error.message === "DUPLICATE_ID") { ... }
  }
});
```

에러 케이스별로 분기 처리한 점이 훌륭해요.

#### 2-3. ~~I-1. GENRE_MAP 중복 정의~~ → **해결**

`src/utils/genres.js`에 공통 `GENRE_MAP`을 만들고, `main_list.js`, `detail.js`, `genre_more.js`에서 각각 import해서 쓰고 있어요.

```javascript
// src/utils/genres.js (신규)
export const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  // ...
};
```

```javascript
// main_list.js, detail.js, genre_more.js
import { GENRE_MAP } from "@/utils/genres.js";
```

이제 장르를 하나 추가할 때 파일 하나만 수정하면 돼요.

#### 2-4. 부분 해결 — C-1. upload/edit 파일 분리 (JS만 분리됨)

지난 리뷰에서 `upload.html`과 `edit.html`이 HTML + CSS + JS를 전부 한 파일에 담고 있다고 지적했죠. 이번에 **JavaScript 부분**은 각각 `upload.js`, `edit.js`로 분리되었어요. 👍

```
src/paragraph/upload/
├── upload.html  (HTML + 여전히 <style> 280줄)  ← CSS는 아직 분리 안 됨
└── upload.js    (JS만)  ✅ 분리 완료

src/paragraph/edit/
├── edit.html    (HTML + 여전히 <style> 300줄)  ← CSS는 아직 분리 안 됨
└── edit.js      (JS만)  ✅ 분리 완료
```

JS 분리는 훌륭한 첫 걸음이에요. **남은 숙제는 CSS를 전부 Tailwind로 옮기는 일**입니다 (아래 C-1에서 다시 설명해요).

---

## 3. 지난 리뷰에서 아직 해결되지 않은 항목

아래 항목들은 지난 리뷰에서 지적되었지만, 이번 코드에도 여전히 남아 있어요. 자세한 내용은 이전 문서를 참고해주세요.

| 이전 번호 | 제목 | 현재 상태 | 이전 리뷰 링크 |
|---|---|---|---|
| C-1 (일부) | `upload/edit.html`에 `<style>` 300줄 여전히 존재 | **미해결** | [보기](./code-review-20260409.md#c-1-uploadhtml--edithtml-html-안에-css--js-전부-작성-응집도-최하) |
| C-2 | `upload.js`/`edit.js` API URL 하드코딩 | **미해결** | [보기](./code-review-20260409.md#c-2-api-url-하드코딩---환경변수를-사용하지-않음) |
| C-4 | `upload.html` ↔ `edit.html` 코드 90% 중복 | **미해결** | [보기](./code-review-20260409.md#c-4-uploadhtml과-edithtml의-코드-90-이상-중복) |
| C-5 | `main_list.js`의 토큰 `console.log` 노출 | **미해결** | [보기](./code-review-20260409.md#c-5-보안-문제---토큰이-console에-출력됨) |
| C-6 | `main_list.js`, `detail.js`의 `innerHTML` XSS 위험 | **미해결** | [보기](./code-review-20260409.md#c-6-xss크로스-사이트-스크립팅-위험---innerhtml에-사용자-데이터-삽입) |
| I-2 | 디버깅용 `console.log` 여러 파일에 남음 | **미해결** | [보기](./code-review-20260409.md#i-2-디버깅용-consolelog가-여러-파일에-남아-있음) |
| I-4 | `detail.js`의 `location.reload()` | **미해결** | [보기](./code-review-20260409.md#i-4-반응형-전환-시-페이지-새로고침) |
| I-5 | `onclick="..."` 속성 (upload/edit) | **미해결** + landing/mypage에도 퍼짐 | [보기](./code-review-20260409.md#i-5-이벤트-핸들러를-html에-직접-작성-onclick-속성) |

> 이번 리뷰에서는 **새로 발견된 항목만** 자세히 설명할게요. 위 항목들의 해결 방법은 이전 문서를 참고해주세요.

---

## 4. 새로 발견된 잘한 점

### 4-1. `utils/` 폴더를 만들어 공통 모듈을 정리한 것

```
src/utils/
├── auth.js      → 토큰 관리, 로그인 체크, 401/403 리다이렉트
└── genres.js    → 장르 맵핑 테이블
```

역할에 따라 파일을 분리하고, 한 파일이 하나의 일만 하도록 설계한 점이 훌륭해요. 이것이 바로 **높은 응집도 + 낮은 결합도**의 좋은 예시입니다.

### 4-2. `redirectOnAuthFail` 유틸 — 코드 재사용의 교과서

```javascript
// src/utils/auth.js
export function redirectOnAuthFail(response) {
  if (response.status === 401 || response.status === 403) {
    alert("로그인이 필요한 서비스입니다.");
    location.replace(LOGIN_PAGE);
    return true;
  }
  return false;
}
```

`main_list.js`, `detail.js`, `genre_more.js` 여러 API 파일이 이 한 함수로 인증 만료 처리를 통일했어요. 각 파일에 똑같은 if문을 복사-붙여넣기 하는 대신 이렇게 함수로 묶으면, 나중에 로그인 페이지 경로가 바뀌어도 한 곳만 고치면 됩니다. 👍

### 4-3. 마이페이지 아코디언 UI — 접근성까지 신경 쓴 점

`mypage.html`의 아코디언은 `aria-expanded`, `aria-controls`, `role="status"`, `aria-labelledby` 같은 **접근성 속성**을 꼼꼼하게 적용했어요.

```html
<button
  class="accordion-head ..."
  aria-expanded="false"
  aria-controls="accordion-body-email"
>
  <span class="font-semibold">이메일 변경</span>
  ...
</button>
```

시각 장애가 있는 사용자도 스크린 리더로 이 버튼이 "펼쳐짐/접힘" 상태를 들을 수 있어요. 이것은 많은 실무 프로젝트에서도 쉽게 빠뜨리는 부분인데, 입문자로서 이 정도 수준까지 고려한 것은 정말 대단합니다. 👏

### 4-4. 마이페이지 — Tailwind CSS로 반응형 레이아웃 처리

```html
<!-- LEFT -->
<div class="hidden md:flex w-1/2 flex-col justify-center items-start p-25 ...">
  <!-- 데스크탑에서만 보이는 영역 -->
</div>

<!-- 모바일 로고 -->
<div class="flex md:hidden items-center gap-3 mb-8">
  <!-- 모바일에서만 보이는 영역 -->
</div>
```

`hidden md:flex`와 `flex md:hidden` 같은 Tailwind의 반응형 프리픽스(`md:`)를 정확히 사용해서, 커스텀 `@media` 쿼리 없이도 반응형을 잘 처리했어요. 이것이 바로 **Tailwind CSS의 올바른 사용법**입니다.

### 4-5. 마이페이지 API — 에러 메시지 디자인이 깔끔합니다

`changeEmail.js`, `changeNickname.js`, `changePassword.js`가 모두 같은 패턴으로 작성되어 있고, 서버의 `errorCode`를 그대로 `throw`해서 호출하는 쪽에서 에러 타입별로 분기할 수 있도록 했어요.

```javascript
// changeEmail.js
if (!response.ok) {
  throw new Error(json.errorCode ?? "이메일 변경 실패");
}
```

### 4-6. 회원탈퇴 다이얼로그 — `<dialog>` 네이티브 요소 활용

```html
<dialog id="withdrawDialog" class="m-auto w-full max-w-sm ...">
  <form method="dialog">
    <!-- ... -->
  </form>
</dialog>
```

과거에는 모달을 만들 때 `div` + `position: fixed`로 직접 만들어야 했는데, 이제 HTML에 `<dialog>` 요소가 있어서 `showModal()` 한 줄로 접근성까지 포함한 모달을 만들 수 있어요. 이 요소를 알고 쓴 것은 훌륭합니다.

---

## 5. 이번에 새로 발견한 "반드시 고쳐야 할 문제" (Critical)

### 5-1. [C6-1] `mypage.js` 중복 import — **페이지가 아예 실행 안 되는 버그** (중요도: 높음)

**파일**: `src/mypage/mypage.js:4-8, 16`

```javascript
// mypage.js (현재)
import {
  setupInput,
  setupToggle,
  setupPasswordCheck,           // ← 4~8번째 줄에서 import
} from "../components/input.js";
import { getProfileNickname } from "../API/accountAPI/nickname.js";
// ... 중간에 다른 import ...
import { withdraw } from "../API/accountAPI/withdraw.js";
import { setupInput, setupToggle } from "../components/input.js";  // ← 16번째 줄, 중복!
```

**왜 문제인가요?**

ES Modules(자바스크립트의 `import`)에서 **같은 이름을 두 번 import하면 `SyntaxError: Identifier 'setupInput' has already been declared` 에러가 발생**해서 **파일 전체가 실행되지 않아요**. 즉, 마이페이지에 들어가도 아무 동작도 하지 않게 됩니다.

**추천 해결**:

```javascript
// 16번째 줄을 삭제합니다
// import { setupInput, setupToggle } from "../components/input.js";  ← 이 줄 삭제
```

> **해결 방법 자세히**: [code-review-20260415-guide.md#6-1](./code-review-20260415-guide.md#6-1-mypagejs-중복-import-제거)

---

### 5-2. [C6-2] `landing.html` — HTML 안에 CSS 280줄 + `<script>` 인라인 (중요도: 높음)

**파일**: `src/landing/landing.html`

이 파일은 **지난 리뷰의 C-1과 완전히 같은 문제**를 새로 만든 경우입니다.

```
landing.html (현재)
├── <style>  280줄 (커스텀 CSS, Tailwind 0)
├── <body>   100줄
└── <script> 10줄 (goLogin, goSignup, goHome 함수)
```

추가로 이런 문제도 있어요:

1. **`onclick` 속성 사용**: `onclick="goHome()"`, `onclick="goLogin()"`, `onclick="goSignup()"`
2. **같은 로고 SVG를 이곳저곳에 인라인**: 4개 페이지(login, signup, mypage, landing)가 각자 다른 방식으로 로고를 그리고 있어요.
3. **Tailwind CSS를 전혀 사용하지 않음**: 우리 프로젝트 방침과 어긋나요.

**왜 문제인가요?**

- 프로젝트 전체에서 **딱 한 곳을 제외하면 다른 페이지는 Tailwind로 잘 쓰고 있는데**, 랜딩 페이지만 오래된 방식으로 작성되어서 팀원이 코드를 읽을 때 "왜 여기만 다르지?" 하고 혼란스러워집니다.
- `@media (max-width: 1080px)`, `@media (max-width: 768px)` 같은 커스텀 반응형 CSS는 Tailwind의 `lg:`, `md:` 프리픽스로 더 간단하게 쓸 수 있어요.

> **해결 방법 자세히**: [code-review-20260415-guide.md#6-2](./code-review-20260415-guide.md#6-2-landinghtml을-tailwind로-전환)

---

### 5-3. [C6-3] `upload.html` / `edit.html`의 `<style>` 태그가 여전히 300줄 (중요도: 높음)

**파일**: `src/paragraph/upload/upload.html:7-298`, `src/paragraph/edit/edit.html:7-316`

JS는 분리했지만, CSS는 여전히 HTML 안에 들어 있어요. 그리고 **Tailwind가 전혀 사용되지 않고** 커스텀 CSS만 씁니다.

```html
<!-- upload.html (현재) -->
<head>
  <style>
    body { background: #0b0b0b; color: white; ... }
    .wrapper { max-width: 1200px; ... }
    /* ... 290줄 계속 ... */
  </style>
</head>
```

**왜 문제인가요?**

1. 프로젝트의 **색상 테마(`theme.css`)와 맞지 않는 하드코딩 값**(`#0b0b0b`, `#e50914`)을 써서, 다른 페이지와 색이 미묘하게 달라요.
2. `@media` 쿼리가 두 번(`max-width: 767px`, `min-width: 768px and max-width: 1080px`) 등장하는데, Tailwind의 `md:`, `lg:` 프리픽스로 훨씬 간단하게 쓸 수 있습니다.
3. `upload.html`과 `edit.html`의 `<style>` 내용이 **95% 동일**해서 한 쪽을 수정하면 다른 쪽도 수정해야 해요 (C-4 연계).

**추천 해결 방향**: `upload.html`과 `edit.html`을 Tailwind 클래스로 다시 쓰고, 중복되는 부분은 **공통 템플릿 함수**로 뽑아내세요.

> **해결 방법 자세히**: [code-review-20260415-guide.md#6-3](./code-review-20260415-guide.md#6-3-uploadedit-html을-tailwind로-전환하고-중복-제거)

---

### 5-4. [C6-4] `upload.js` / `edit.js`의 API URL 여전히 하드코딩 (중요도: 높음)

**파일**: `src/paragraph/upload/upload.js:4`, `src/paragraph/edit/edit.js:4`

```javascript
// upload.js (나쁜 예)
const API = "https://api.fullstackfamily.com/api/buildup/v1/movies";
// ...
const imgRes = await fetch(
  "https://api.fullstackfamily.com/api/buildup/v1/movies/images", ...
);
```

지난 리뷰에서 지적한 C-2가 그대로 남아 있어요. 다른 모든 API 파일은 `import.meta.env.VITE_API_BASE_URL`을 쓰고 있는데, 이 두 파일만 직접 URL을 씁니다.

**추천 해결**:

```javascript
// upload.js (좋은 예)
const API = `${import.meta.env.VITE_API_BASE_URL}/movies`;
// 이미지 업로드
const imgRes = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/movies/images`, ...
);
```

**더 좋은 방향**: API 호출 자체를 `src/API/paragraphAPI/upload.js`, `src/API/paragraphAPI/update.js` 같은 별도 파일로 옮겨서, `upload.js`는 UI만 담당하도록 하세요. 이것이 다른 페이지와 같은 구조가 됩니다.

> **해결 방법 자세히**: [code-review-20260415-guide.md#6-4](./code-review-20260415-guide.md#6-4-uploadjseditjs의-api-호출을-apiparagraphapi로-분리)

---

### 5-5. [C6-5] `main_list.js` 토큰 `console.log` — 지난 리뷰에서 지적했는데 그대로 (중요도: 높음)

**파일**: `src/API/main_list.js:4,6`

```javascript
// main_list.js (여전히 위험)
export const getMainList = async () => {
  try {
    console.log("Fetching main list from API...");
    console.log(`accessToken: ${localStorage.getItem("accessToken")}`);  // 🚨
    // ...
  }
};
```

지난 리뷰 C-5 참고. **토큰은 비밀번호와 같은 수준의 민감한 정보이므로 브라우저 콘솔에 찍으면 안 됩니다.** 지금 바로 삭제해주세요 (파일 하나만 수정하면 끝납니다).

> **해결 방법**: [code-review-20260409-guide.md](./code-review-20260409-guide.md) 의 C-5 섹션 참고

---

### 5-6. [C6-6] `header.html` — HTML 문법 오류 + 사용하지 않는 파일일 가능성 (중요도: 높음)

**파일**: `src/main/header/header.html:39, 43`

```html
<!-- header.html (문법 오류) -->
<a href="/upload.html" class="nav-btn nav-btn--red" id="btn-new-post">
  <img src="/Add_round.svg" alt="새 포스트" />
  <span class="btn-label">새 포스트</span>
<a/>   <!-- ← 닫는 태그가 잘못됨! </a> 가 되어야 함 -->
<a href="/mypage.html" class="nav-btn" id="btn-myinfo">
  <img src="/myinfo.png" alt="내 정보" />
  <span class="btn-label" id="nickname"></span>
<a/>   <!-- ← 여기도 </a> 가 되어야 함 -->
```

`<a/>`는 self-closing 문법이라 새 `<a>` 태그를 여는 의미로 해석될 수 있어요. 올바른 닫는 태그는 `</a>` (슬래시가 앞에) 입니다.

**더 큰 문제**: `header.html`은 실제로 **어느 곳에서도 로드되지 않는 것 같아요**. 헤더는 `header.js`의 `renderHeader()` 함수가 JS로 동적으로 삽입하고 있죠.

```javascript
// header.js:5
export function renderHeader(targetSelector = "body") {
  const html = `<header class="site-header">...</header>`;
  target.insertAdjacentHTML("afterbegin", html);
}
```

즉, `header.html`은 **사용되지 않는 죽은 파일**일 가능성이 높아요. 혼란을 주므로 삭제하거나, 만약 디자인 참고용이면 주석을 달아두세요.

> **해결 방법 자세히**: [code-review-20260415-guide.md#6-5](./code-review-20260415-guide.md#6-5-headerhtml-삭제-또는-수정)

---

### 5-7. [C6-7] `edit.js` — 선언 전 참조 버그 가능성 (중요도: 높음)

**파일**: `src/paragraph/edit/edit.js`

```javascript
// edit.js (구조)
async function getMovie() {
  // ... line 63:
  directorList = movie.director;          // ← 여기서 쓰는데
  directorList.forEach((name) => {
    directorContainer.appendChild(bubble); // ← 여기서도 쓰는데
  });
}
getMovie();  // line 111 → 여기서 실행!

// ... 많은 코드 ...

const directorContainer = document.getElementById("director-bubbles");  // line 310
let directorList = [];                                                    // line 312
```

`directorList`와 `directorContainer`는 200줄 아래에서 선언되는데, 그보다 위에서 `getMovie()`가 호출되고 있어요.

**왜 문제인가요?**

- `async function getMovie()`의 **본문 안**에서 `directorList`를 읽는 순간, 자바스크립트는 "이 변수가 선언은 되었는데 초기화 전"이라고 판단하고 **ReferenceError (Temporal Dead Zone)** 를 던질 수 있어요.
- 다만 `await fetch()` 때문에 실제 접근은 한참 후에 일어나고, 그 사이에 모듈 최상위 코드가 다 실행되어서 "운 좋게" 동작하고 있을 수 있습니다. 하지만 **이것은 매우 위태로운 순서 의존성**이에요. 네트워크가 매우 빠르면 버그가 튀어나올 수 있습니다.

**추천 해결**: 변수 선언을 함수 호출 **앞쪽**으로 이동하세요.

```javascript
// edit.js (권장 구조)
// 1) 먼저 변수와 DOM 참조를 선언
let directorList = [];
let actorsList = [];
const directorContainer = document.getElementById("director-bubbles");
const actorsContainer = document.getElementById("actors-bubbles");

// 2) 그다음 함수 정의
async function getMovie() { ... }

// 3) 마지막에 실행
getMovie();
```

> **해결 방법 자세히**: [code-review-20260415-guide.md#6-6](./code-review-20260415-guide.md#6-6-editjs-변수-선언-순서-고치기)

---

### 5-8. [C6-8] `delete.js` — 함수 이름 오타 (`deletePatagraph`) (중요도: 중간)

**파일**: `src/API/paragraphAPI/delete.js:1`, `src/main/detail/detail.js:5, 157`

```javascript
// delete.js
export const deletePatagraph = async (postId) => { ... };  // ← "Patagraph" 오타

// detail.js
import { deletePatagraph } from "../../API/paragraphAPI/delete.js";
// ...
const res = await deletePatagraph(postId);
```

`paragraph` (문단)이 정확한 단어인데 `patagraph`로 잘못 적혀 있어요. 지금은 import하는 쪽도 똑같이 틀려서 동작은 하지만, 코드 품질상 수정하는 게 좋아요. 나중에 다른 사람이 "paragraph"로 검색하면 이 함수를 못 찾을 거예요.

**추천 해결**:

```javascript
// delete.js
export const deleteParagraph = async (postId) => { ... };

// detail.js
import { deleteParagraph } from "../../API/paragraphAPI/delete.js";
const res = await deleteParagraph(postId);
```

---

### 5-9. [C6-9] `delete.js` — 에러를 `catch`만 하고 `throw`하지 않음 (중요도: 중간)

**파일**: `src/API/paragraphAPI/delete.js:20-22`

```javascript
// delete.js
export const deletePatagraph = async (postId) => {
  try {
    const response = await fetch(...);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);  // ← error만 찍고 함수는 조용히 undefined를 반환해버림
  }
};
```

**왜 문제인가요?**

- 에러가 발생해도 **호출하는 쪽은 `undefined`만 받기 때문에** "삭제 실패"와 "서버가 빈 응답을 준 성공"을 구별할 수 없어요.
- `detail.js`에서는 `if (res) { alert("삭제되었습니다"); }` 로 체크하고 있는데, 에러 발생 시에도 알림이 안 뜨기만 할 뿐 사용자는 왜 안 되는지 알 수 없습니다.

**추천 해결**:

```javascript
// delete.js
export const deleteParagraph = async (postId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/movies/${postId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`삭제 실패 (${response.status})`);
  }
  return response.json();
};
```

그리고 `detail.js`에서 `try-catch`로 처리합니다.

---

## 6. 이번에 새로 발견한 "개선하면 좋을 점" (Improvement)

### 6-1. [I6-1] `mypage.js`의 `window.handleXxx` + HTML `onclick` 패턴 (중요도: 중간)

**파일**: `src/mypage/mypage.html:236, 477, 554, 565`, `src/mypage/mypage.js:129, 221, 250, 274`

```html
<!-- mypage.html -->
<button onclick="handleEmailChange()">이메일 변경하기</button>
<button onclick="handlePasswordChange()">비밀번호 변경하기</button>
<button onclick="handleNicknameChange()">닉네임 변경하기</button>
<button onclick="openWithdrawDialog()">회원탈퇴</button>
```

```javascript
// mypage.js
window.handleEmailChange = async function () { ... };
window.handlePasswordChange = async function () { ... };
window.handleNicknameChange = async function () { ... };
window.openWithdrawDialog = function () { ... };
```

**왜 개선하면 좋을까요?**

- `window.handleXxx = function() {}` 은 **전역(window)을 오염시키는 안티 패턴**이에요.
- 이 패턴은 **지난 리뷰 I-5와 같은 문제**이고, "HTML은 구조만, JS는 동작만" 이라는 관심사 분리 원칙이 깨집니다.
- `signup.js`, `login.js`는 이미 `addEventListener` 방식으로 잘 쓰고 있는데, 마이페이지만 옛날 방식이라 팀원이 "왜 여기만 다르지?" 하고 헷갈립니다.

**추천 해결**:

```html
<!-- mypage.html -->
<button id="btn-change-email">이메일 변경하기</button>
```

```javascript
// mypage.js
document.getElementById("btn-change-email").addEventListener("click", async () => {
  // ...
});
```

---

### 6-2. [I6-2] `upload.js` / `edit.js` — `title.value`, `year.value` 같은 전역 접근 (중요도: 중간)

**파일**: `src/paragraph/upload/upload.js:93, 103, 113`, `src/paragraph/edit/edit.js:57, 59`

```javascript
// upload.js:93
if (!title.value.trim()) { ... }        // 어디의 title인지 명확하지 않음
if (!content.value.trim()) { ... }      // content도 마찬가지
if (!year.value.trim()) { ... }

// edit.js:57
poster.value = movie.imageUrl;          // poster는 어디서 선언됨?
title.value = movie.title;               // title은 어디서 선언됨?
```

실제로는 브라우저의 **"Named Access on Window"** 기능 때문에 동작합니다. HTML에 `<input id="title">`이 있으면 자바스크립트에서 그냥 `title`이라고 쓰면 `window.title`을 거쳐 그 입력 요소를 가리켜요.

**왜 개선하면 좋을까요?**

- 이 기능은 **브라우저마다 미묘하게 다르고**, `title`은 특히 `document.title` (탭 제목)과 헷갈립니다.
- 코드를 읽는 사람이 `title`이 무엇인지 추적하기 어려워요.
- 다른 파일에서는 `document.getElementById("title")`을 명시적으로 쓰고 있어서 **일관성도 깨집니다**.

**추천 해결**:

```javascript
// upload.js (파일 상단에 한 번만 선언)
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const yearInput = document.getElementById("year");
const posterInput = document.getElementById("poster");

// 사용할 때
if (!titleInput.value.trim()) { ... }
```

---

### 6-3. [I6-3] `mypage.js` `showToast` — Tailwind 동적 클래스는 JIT가 못 잡을 수 있음 (중요도: 중간)

**파일**: `src/mypage/mypage.js:56-72`

```javascript
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  toast.className = `${bgColor} px-6 py-3 rounded-lg ...`;  // ← 동적 조립
  // ...
}
```

**왜 개선하면 좋을까요?**

Tailwind CSS v4는 빌드 시점에 프로젝트의 HTML/JS 파일에서 **실제로 쓰이는 클래스만** CSS로 만들어요. 위 코드처럼 `${bgColor}` 식의 **템플릿 문자열 안에서만 등장**하면 Tailwind가 "이 클래스는 쓰이지 않는다"고 착각하고 **CSS에서 빼버릴 위험**이 있습니다. 그러면 개발 모드에서는 보이다가 배포 후 갑자기 토스트 배경색이 사라지는 버그로 이어져요.

**추천 해결**: 클래스 이름을 **통째로 문자열**에 넣어 Tailwind가 인식할 수 있게 합니다.

```javascript
function showToast(message, type = "success") {
  const classMap = {
    success: "bg-green-600 px-6 py-3 rounded-lg text-white text-sm font-medium",
    error:   "bg-red-600 px-6 py-3 rounded-lg text-white text-sm font-medium",
  };
  toast.className = `${classMap[type]} opacity-0 transition-opacity duration-300 whitespace-nowrap`;
  // ...
}
```

이렇게 하면 `bg-green-600`, `bg-red-600`이 모두 "문자열 안에 있는 완성된 클래스명"으로 감지됩니다.

---

### 6-4. [I6-4] `showToast`, `handleEmailChange` 같은 로직은 페이지별로 중복 가능 → 공통 유틸로 (중요도: 낮음)

**파일**: `src/mypage/mypage.js` 전체

마이페이지에서 쓰이는 토스트 알림 함수는 다른 페이지(upload, edit, detail)에서도 쓸 수 있을 거예요. 지금은 `alert()` 혹은 `console.error()`로만 처리되는 곳이 많습니다.

**추천 방향**: `src/utils/toast.js` 를 만들어서 공통 토스트 함수를 정의하고, 모든 페이지가 import해서 씁니다.

```javascript
// src/utils/toast.js
export function showToast(message, type = "success") { ... }
```

```javascript
// mypage.js, upload.js, edit.js 등
import { showToast } from "@/utils/toast.js";
showToast("이메일이 변경되었습니다.", "success");
```

이렇게 하면 `alert()`를 없애고 UX가 훨씬 깔끔해집니다.

---

### 6-5. [I6-5] `mypage.js` 프로필 로딩 시 Top-level `await` 사용 (중요도: 낮음)

**파일**: `src/mypage/mypage.js:46-53`

```javascript
// mypage.js (최상위에서 await)
try {
  const profile = await getProfileNickname();
  // ...
} catch (error) { ... }
```

`type="module"`이면 최상위 await가 동작하기는 하지만, **프로필 로드가 끝날 때까지 그 아래의 이벤트 리스너 등록이 전부 지연**됩니다. 즉, 페이지가 뜨고도 몇 초 동안 버튼이 눌리지 않을 수 있어요.

**추천 해결**: `loadProfile()` 함수로 감싸서 호출하고 기다리지 않습니다.

```javascript
async function loadProfile() {
  try {
    const profile = await getProfileNickname();
    welcomeNickname.textContent = profile.nickname;
    displayEmail.textContent = profile.email;
    displayNickname.textContent = profile.nickname;
  } catch (error) {
    console.error("프로필 로드 실패:", error.message);
  }
}
loadProfile();  // await 없이 호출
```

---

### 6-6. [I6-6] 에러 메시지에서 무관한 hint를 건드림 (중요도: 낮음)

**파일**: `src/mypage/mypage.js:262-268`

```javascript
// 닉네임 변경 실패 시...
} catch (error) {
  const currentPasswordHint = document.getElementById("current-password-hint");
  currentPasswordHint.textContent = "현재 비밀번호가 올바르지 않습니다.";  // ??
  currentPasswordHint.className = "text-hint error";
}
```

닉네임 변경이 실패했는데 **비밀번호 힌트**를 바꾸고 있어요. 복사-붙여넣기 실수로 보입니다.

**추천 해결**:

```javascript
} catch (error) {
  showToast(error.message ?? "닉네임 변경에 실패했습니다.", "error");
}
```

---

### 6-7. [I6-7] `landing.html`의 `<header>` 안에 `<header>` — 시맨틱 오용 위험 (중요도: 낮음)

`landing.html`의 `<header>` 태그가 전체 페이지를 감싸는 역할과 로고/로그인 버튼을 담는 역할을 동시에 하고 있어요. 페이지 레벨의 랜딩 화면이면 `<main>`을 쓰고, 상단 로고 영역만 `<header>`로 감싸는 것이 더 정확합니다.

---

## 7. 파일별 상세 리뷰

### 7-1. `src/mypage/mypage.html`

| 항목 | 상태 |
|---|---|
| Tailwind 사용 | 매우 좋음 (반응형 `md:` 활용) |
| 접근성 (aria-*) | 매우 좋음 |
| **`onclick` 속성** | **개선 필요 (I6-1)** |
| `<dialog>` 네이티브 활용 | 좋음 |

### 7-2. `src/mypage/mypage.js`

| 항목 | 상태 |
|---|---|
| **중복 import (line 16)** | **Critical (C6-1) — 버그** |
| 아코디언 애니메이션 | 좋음 |
| **window.handleXxx 패턴** | **개선 필요 (I6-1)** |
| **동적 Tailwind 클래스 (showToast)** | **개선 필요 (I6-3)** |
| Top-level await 프로필 로드 | 개선 권장 (I6-5) |
| 닉네임 에러에서 비밀번호 힌트 수정 | 개선 필요 (I6-6) |

### 7-3. `src/landing/landing.html`

| 항목 | 상태 |
|---|---|
| **`<style>` 280줄 인라인** | **Critical (C6-2)** |
| **`<script>` + `onclick`** | **Critical (C6-2)** |
| **Tailwind 미사용** | **Critical (C6-2)** |
| 반응형 디자인 구성 | 좋음 (내용 자체는) |
| 포스터 그리드 애니메이션 | 매우 좋음 (아이디어) |

### 7-4. `src/paragraph/upload/upload.html` & `edit.html`

| 항목 | 상태 |
|---|---|
| **`<style>` 300줄** | **Critical (C6-3)** |
| **Tailwind 0%** | **Critical (C6-3)** |
| **중복 (95%)** | **Critical (이전 C-4 미해결)** |
| **`onclick` 속성** | **이전 I-5 미해결** |

### 7-5. `src/paragraph/upload/upload.js`

| 항목 | 상태 |
|---|---|
| 파일 분리 | 좋음 (지난 리뷰 해결) |
| **API URL 하드코딩** | **Critical (C6-4)** |
| **`title.value` 전역 접근** | **개선 필요 (I6-2)** |
| `console.log("함수 실행됨")` | 개선 필요 |
| 드래그앤드롭 / 별점 / 버블 UI | 훌륭 |

### 7-6. `src/paragraph/edit/edit.js`

| 항목 | 상태 |
|---|---|
| 파일 분리 | 좋음 |
| **API URL 하드코딩** | **Critical (C6-4)** |
| **변수 선언 순서 (TDZ)** | **Critical (C6-7)** |
| **`title.value` 전역 접근** | **개선 필요 (I6-2)** |
| upload.js와 중복 | **Critical (C-4 미해결)** |

### 7-7. `src/utils/auth.js`

| 항목 | 상태 |
|---|---|
| 한 파일 한 책임 | 매우 좋음 |
| 함수 분리 | 매우 좋음 |
| TOKEN_KEY 상수화 | 매우 좋음 |

새로 만든 파일 중 가장 훌륭한 파일입니다. 👏

### 7-8. `src/utils/genres.js`

| 항목 | 상태 |
|---|---|
| 단일 상수 파일 | 매우 좋음 |

### 7-9. `src/API/mypageAPI/{changeEmail, changeNickname, changePassword}.js`

| 항목 | 상태 |
|---|---|
| 일관된 패턴 | 매우 좋음 |
| 토큰 체크 → 에러 throw | 좋음 |
| errorCode를 그대로 throw | 좋음 |
| VITE_API_BASE_URL 사용 | 좋음 |

### 7-10. `src/API/accountAPI/logout.js`

| 항목 | 상태 |
|---|---|
| 구조 | 좋음 |
| **`catch`에서 throw 안 함** | 개선 필요 (호출자가 성공/실패 구분 불가) |

```javascript
// logout.js (현재)
} catch (error) {
  console.error("Error logging out:", error);
  // throw 없음 → 호출자는 항상 성공으로 인식
}
```

### 7-11. `src/API/accountAPI/withdraw.js`

| 항목 | 상태 |
|---|---|
| 구조 | 좋음 |
| throw 처리 | 좋음 |
| 탈퇴 후 토큰 제거 | 좋음 |

### 7-12. `src/API/paragraphAPI/delete.js`

| 항목 | 상태 |
|---|---|
| **함수 이름 오타 (`deletePatagraph`)** | **Critical (C6-8)** |
| **catch에서 throw 안 함** | **Critical (C6-9)** |

### 7-13. `src/main/header/header.js`

| 항목 | 상태 |
|---|---|
| JS로 HTML 동적 생성 | 구조로는 좋음 |
| **`console.log("Nickname fetched successfully", ...)`** | 개선 필요 (디버깅 로그) |

### 7-14. `src/main/header/header.html`

| 항목 | 상태 |
|---|---|
| **`<a/>` 문법 오류** | **Critical (C6-6)** |
| **사용 여부 불명확** | **Critical (C6-6)** |

---

## 8. CSS vs Tailwind 사용 현황 (업데이트)

| 파일 | Tailwind 사용 | 커스텀 CSS | 판정 (이전 → 지금) |
|---|---|---|---|
| signup.html | 대부분 Tailwind | components/* | 좋음 → **좋음** |
| login.html | 대부분 Tailwind | components/* | 좋음 → **좋음** |
| **mypage.html** | **대부분 Tailwind** | components/* | 신규 → **좋음** 🎉 |
| main_list.html | 선언만 + 커스텀 | 186줄 | 개선 필요 → 개선 필요 |
| detail.html | 없음 | 348줄 | 개선 필요 → 개선 필요 |
| genre_more.html | 선언만 + 커스텀 | 커스텀 | 개선 필요 → 개선 필요 |
| header.js | 선언만 + 커스텀 | 134줄 | 개선 필요 → 개선 필요 |
| **landing.html** | **0%** | **280줄 `<style>`** | 신규 → **Critical** ❌ |
| upload.html | 0% | 280줄 `<style>` | Critical → Critical |
| edit.html | 0% | 300줄 `<style>` | Critical → Critical |

**변화 요약**:
- 👍 `mypage.html`은 Tailwind를 제대로 사용한 **모범 사례**가 되었어요.
- 😢 `landing.html`은 지난 리뷰의 나쁜 패턴을 그대로 복제했습니다.
- 😢 `upload`, `edit`은 JS만 분리되었을 뿐 CSS/Tailwind 전환은 진행되지 않았어요.

---

## 9. 이슈 우선순위 정리

| 순서 | 이슈 | 난이도 | 예상 시간 |
|---|---|---|---|
| 1 | **C6-1**: mypage.js 중복 import 삭제 (실제 버그) | 쉬움 | 1분 |
| 2 | **C6-8**: delete.js 함수 이름 오타 수정 | 쉬움 | 5분 |
| 3 | **C6-9**: delete.js에서 에러 throw 추가 | 쉬움 | 5분 |
| 4 | **C6-5**: main_list.js 토큰 console.log 삭제 (이전 C-5) | 쉬움 | 2분 |
| 5 | **C6-4**: upload.js/edit.js API URL을 VITE_API_BASE_URL로 교체 | 쉬움 | 10분 |
| 6 | **C6-6**: header.html 수정 또는 삭제 | 쉬움 | 5분 |
| 7 | **C6-7**: edit.js 변수 선언 순서 정리 | 쉬움 | 10분 |
| 8 | **I6-1**: mypage.js의 onclick → addEventListener 전환 | 보통 | 30분 |
| 9 | **I6-6**: mypage.js 닉네임 에러 메시지 수정 | 쉬움 | 2분 |
| 10 | **I6-3**: mypage.js showToast 정적 클래스로 변경 | 쉬움 | 10분 |
| 11 | **I6-2**: upload/edit.js 전역 접근 → 명시적 getElementById | 보통 | 30분 |
| 12 | **C6-3**: upload/edit HTML을 Tailwind로 전환 | 도전 | 3~4시간 |
| 13 | **C6-2**: landing.html을 Tailwind로 전환 | 도전 | 2~3시간 |
| 14 | C-4 (이전): upload/edit 공통 템플릿 추출 | 도전 | 2~3시간 |
| 15 | C-6 (이전): XSS 방어 escape 유틸 | 보통 | 30분 |

> **해결 방법의 자세한 설명은 [code-review-20260415-guide.md](./code-review-20260415-guide.md)를 참고하세요.**

---

## 10. 마무리 — 격려의 말

짧은 시간에 마이페이지, 랜딩, 업로드/수정 API 연결, 회원탈퇴, 로그아웃까지 **정말 많은 기능을 추가하셨습니다.** 👏

특히 지난 리뷰의 핵심 지적 사항이었던 **"토큰 키 통일"**, **"GENRE_MAP 중복 제거"**, **"signup submit 누락"** 을 모두 해결했고, 심지어 `utils/` 폴더를 만들어 **앞으로의 공통 코드를 담을 집도 마련**했습니다. 이 점은 정말 대단해요.

다만 아쉬운 것은 **"이미 지적된 나쁜 패턴을 새로운 파일에서도 반복"**하고 있다는 점이에요. 예를 들어:
- `landing.html`에 `<style>` 280줄을 작성 → `upload.html`에서 이미 지적된 패턴
- `mypage.js`에 `onclick` 속성 → `upload.html`에서 이미 지적된 패턴

**리뷰는 한 번만 지적하고 끝이 아니라, 다음 코드를 쓸 때도 "이 패턴은 지적받았었지" 하고 미리 피하는 것까지가 진짜 배움**이에요. 다음 리뷰까지는 마이페이지와 랜딩 페이지를 기준 삼아, **모든 페이지가 같은 품질**이 되도록 천천히 정리해 나가시면 됩니다.

가장 먼저 할 일은 **딱 한 줄 삭제(C6-1)** 입니다. 30초만에 할 수 있으니 지금 바로 해보세요! 🚀

---

**다음 리뷰 때까지의 미션**

1. **[30초]** `mypage.js` 중복 import 삭제 → 마이페이지 실제 동작 확인
2. **[20분]** C6-4 ~ C6-9 전부 해결 (쉬운 항목 6개)
3. **[1~2시간]** `mypage.js`의 모든 `onclick` 제거 → `addEventListener` 전환
4. **[도전]** `landing.html` 또는 `upload.html` 중 하나를 Tailwind로 전환하기
