# Bui1d-UP 5차 코드 리뷰 (2026-04-09)

> **대상**: develop 브랜치 (커밋 `2bd3221` ~ `5fd310c` 사이 변경분)
> **리뷰 범위**: 회원가입, 로그인, 메인리스트, 상세페이지, 장르별 모아보기, 글 작성/수정, API 레이어, 헤더 컴포넌트
> **목적**: 응집도(Cohesion)를 높이고 결합도(Coupling)를 낮추는 방향으로 개선점 안내
> **난이도**: 입문자 눈높이

---

## 목차

1. [이번 리뷰 요약](#1-이번-리뷰-요약)
2. [잘한 점](#2-잘한-점)
3. [반드시 고쳐야 할 문제 (Critical)](#3-반드시-고쳐야-할-문제-critical)
4. [개선하면 좋은 점 (Improvement)](#4-개선하면-좋은-점-improvement)
5. [파일별 상세 리뷰](#5-파일별-상세-리뷰)
6. [CSS vs Tailwind 사용 현황](#6-css-vs-tailwind-사용-현황)

---

## 1. 이번 리뷰 요약

| 구분 | 내용 |
|---|---|
| 새 파일 | 8개 (signup.js, sendEmailCode.js, checkEmailCode.js, nickname.js, detail.js, signup.js API 등) |
| 수정 파일 | 5개 (login.js, input.js, signup.html, upload.html, edit.html) |
| Critical 이슈 | 7개 |
| Improvement 이슈 | 5개 |

**한줄 요약**: 로그인/회원가입/메인리스트는 **파일 분리가 잘 되어 있어** 훌륭합니다. 하지만 글 작성(upload)과 수정(edit) 페이지는 HTML 한 파일에 CSS+JS를 전부 넣어서 **응집도가 매우 낮고**, API URL도 직접 하드코딩하여 **결합도가 높습니다**. 또한 프로젝트 전체적으로 **Tailwind CSS 대신 커스텀 CSS를 주로 사용**하고 있어 통일이 필요합니다.

---

## 2. 잘한 점

### 2-1. 로그인 페이지 - 파일 분리의 교과서

```
src/account/login/
├── login.html    → 화면 구조 (HTML)
└── login.js      → 동작 로직 (JS)

src/API/accountAPI/
└── login.js      → API 호출만 담당
```

**화면(HTML)**, **동작(JS)**, **API 호출(API 폴더)**이 깔끔하게 분리되어 있습니다.

```javascript
// src/account/login/login.js - 좋은 예시
import { login } from "@/API/accountAPI/login.js";  // API는 import해서 사용

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // ...
  await login(id, pwd);  // API 함수만 호출, 어떻게 호출하는지는 몰라도 됨
});
```

> **왜 좋은가요?** login.js는 "화면에서 무슨 일이 일어나는지"만 신경 쓰고, API가 어떤 URL로 어떻게 통신하는지는 전혀 몰라도 됩니다. 이것이 **높은 응집도 + 낮은 결합도**의 좋은 예시입니다.

### 2-2. input 컴포넌트 - 재사용 가능한 설계

```javascript
// src/components/input.js
const rules = {
  username: { regex: /^[a-z0-9_]{4,20}$/, hint: "...", error: "...", ok: "..." },
  nickname: { regex: /^[^\n]{1,10}$/, ... },
  password: { regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,50}$/, ... },
};

export { setupInput, setupToggle, setupPasswordCheck };
```

검증 규칙을 **데이터(객체)**로 관리하고, `setupInput("username")` 한 줄로 어디서든 사용할 수 있습니다. 여러 페이지에서 같은 input 로직을 복사-붙여넣기 하지 않아도 됩니다.

### 2-3. 회원가입 - 이메일 인증 흐름이 깔끔합니다

```javascript
// src/account/signup/signup.js
import { sendEmailCode } from "../../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../../API/accountAPI/checkEmailCode.js";
```

이메일 발송 API, 인증 확인 API를 각각 별도 파일로 분리했습니다. 각 API 파일이 **딱 하나의 기능**만 담당하고 있어 이해하기 쉽습니다.

### 2-4. 메인리스트 - render 함수 분리가 잘 되어 있습니다

```javascript
// src/main/main_list/main_list.js
function renderFeaturedCard(post) { ... }   // 대형 카드 렌더링
function renderSmallCard(post) { ... }       // 소형 카드 렌더링
function renderGenreSection(genreKey, posts) { ... }  // 장르 섹션 렌더링
```

하나의 큰 함수로 모든 것을 처리하지 않고, **역할별로 함수를 나눈 것**이 좋습니다.

---

## 3. 반드시 고쳐야 할 문제 (Critical)

### C-1. upload.html / edit.html: HTML 안에 CSS + JS 전부 작성 (응집도 최하)

**파일**: `src/paragraph/upload/upload.html` (684줄), `src/paragraph/edit/edit.html` (701줄)

이 두 파일은 하나의 HTML 파일 안에 `<style>` 280줄 + `<script>` 280줄이 모두 들어 있습니다.

```
현재 구조 (나쁜 예)                    목표 구조 (좋은 예)
─────────────────                    ─────────────────
upload.html                          upload/
├── <style> 280줄                    ├── upload.html  (HTML만)
├── <html> 100줄                     ├── upload.css   (스타일만)
└── <script> 280줄                   └── upload.js    (동작만)
                                     API/paragraphAPI/
                                     └── upload.js    (API 호출만)
```

> **왜 문제인가요?**
> - HTML 파일이 700줄이 넘으면 수정할 때 **어디를 고쳐야 하는지 찾기 어렵습니다**
> - CSS를 고치다가 실수로 JS를 건드리거나, 반대의 실수가 생길 수 있습니다
> - 다른 페이지(login, main_list 등)와 **구조가 완전히 다르기 때문에** 팀원이 코드를 읽을 때 혼란스럽습니다

### C-2. API URL 하드코딩 - 환경변수를 사용하지 않음

**파일**: `src/paragraph/upload/upload.html:406`, `src/paragraph/edit/edit.html:429`

```javascript
// upload.html / edit.html (나쁜 예)
const API = "https://api.fullstackfamily.com/api/buildup/v1/movies";

// 이미지 업로드도 URL을 직접 씀
const imgRes = await fetch(
  "https://api.fullstackfamily.com/api/buildup/v1/movies/images", ...
);
```

```javascript
// login.js (좋은 예) - 다른 파일들은 환경변수를 사용 중
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/auth/login`, ...
);
```

> **왜 문제인가요?**
> - 서버 주소가 바뀌면 upload.html, edit.html 안의 URL을 **일일이 찾아서** 고쳐야 합니다
> - 다른 파일들은 `import.meta.env.VITE_API_BASE_URL`을 쓰고 있어서, `.env` 파일 하나만 수정하면 전체가 바뀝니다
> - 개발 서버 / 실제 서버 주소가 다를 때 매번 코드를 수정해야 합니다

### C-3. 토큰 키 이름 불일치 - "accessToken" vs "token"

**파일**: 프로젝트 전체

```javascript
// login.js, main_list.js, detail.js, genre_more.js (대부분의 파일)
localStorage.setItem("accessToken", json.data.token);   // 저장할 때
localStorage.getItem("accessToken");                     // 읽을 때

// upload.html, edit.html (글 작성/수정)
const accesstoken = localStorage.getItem("token");       // 다른 키 이름!
const token = localStorage.getItem("token");             // 다른 키 이름!
```

> **왜 문제인가요?**
> - 로그인에서 `"accessToken"`이라는 이름으로 저장하는데, upload/edit에서는 `"token"`이라는 이름으로 읽고 있습니다
> - **글 작성/수정 페이지에서 항상 인증 실패**가 발생합니다 (토큰이 `null`이 됨)
> - 이것은 실제 **버그**입니다

### C-4. upload.html과 edit.html의 코드 90% 이상 중복

두 파일을 비교해보면:
- CSS: **99% 동일** (300줄 복사-붙여넣기)
- HTML: **95% 동일** (제목과 버튼 텍스트만 다름)
- JS: **80% 동일** (별점, 드래그앤드롭, 글자수 카운트, 초기화 등)

```
upload.html: "새 영화 추가" + createMovie() + "등록하기"
edit.html:   "영화 수정"    + updateMovie() + "수정하기" + getMovie()
```

> **왜 문제인가요?**
> - 나중에 별점 UI를 바꾸려면 **두 파일을 동시에 수정**해야 합니다
> - 하나만 수정하고 다른 하나를 깜빡하면 **두 페이지의 동작이 달라집니다**
> - 중복된 코드는 버그가 **2배로 발생**합니다

### C-5. 보안 문제 - 토큰이 console에 출력됨

**파일**: `src/API/main_list.js:4`

```javascript
// 절대 하면 안 되는 코드!
console.log(`accessToken: ${localStorage.getItem("accessToken")}`);
```

> **왜 문제인가요?**
> - 브라우저 개발자 도구(F12)를 열면 **누구나 토큰을 볼 수 있습니다**
> - 토큰은 "내 계정의 비밀번호" 같은 것입니다. 이것이 노출되면 다른 사람이 내 계정으로 행동할 수 있습니다
> - 개발 중 디버깅용 console.log는 **배포 전에 반드시 삭제**해야 합니다

### C-6. XSS(크로스 사이트 스크립팅) 위험 - innerHTML에 사용자 데이터 삽입

**파일**: `src/main/main_list/main_list.js:34`, `src/main/detail/detail.js:65`

```javascript
// main_list.js (위험한 코드)
return `
  <div class="featured-card__info">
    <h2>${post.title}</h2>              <!-- 사용자가 입력한 값이 그대로 HTML에 삽입 -->
    <p>${post.director.join(", ")}</p>
  </div>
`;

// detail.js (위험한 코드)
quoteList.innerHTML = lines
  .map((line) => `<li>"${line.trim()}"</li>`)  <!-- 사용자 입력이 그대로 삽입 -->
  .join("");
```

> **왜 문제인가요?**
> - 만약 누군가 영화 제목에 `<script>alert('해킹!')</script>` 같은 코드를 입력하면, 그것이 **실제로 실행**될 수 있습니다
> - 이것을 XSS 공격이라고 합니다. 웹 보안에서 가장 흔한 공격 방식 중 하나입니다

### C-7. signup.js에 회원가입 submit 핸들러가 없음

**파일**: `src/account/signup/signup.js`

```javascript
// signup.js - 이메일 인증 로직은 있지만...
import { sendEmailCode } from "../../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../../API/accountAPI/checkEmailCode.js";

// 이메일 인증 코드 발송 ✅
sendCodeBtn.addEventListener("click", async () => { ... });

// 이메일 인증 코드 확인 ✅
verifyCodeBtn.addEventListener("click", async () => { ... });

// 회원가입 폼 제출?? ❌ 없음!
// form.addEventListener("submit", ...) 가 없습니다
```

`signup.js`(API 파일)에 `signup` 함수는 만들어뒀지만, 실제로 폼을 제출하는 코드가 없습니다. **회원가입 버튼을 눌러도 아무 일도 일어나지 않습니다.**

---

## 4. 개선하면 좋은 점 (Improvement)

### I-1. GENRE_MAP이 3개 파일에 중복 정의됨

**파일**: `main_list.js`, `detail.js`, `genre_more.js`

```javascript
// 세 파일 모두 이 코드가 반복됩니다
const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  romance: "로맨스",
  // ... 10개 항목
};
```

장르를 하나 추가하거나 이름을 바꾸면 **세 파일을 모두 수정**해야 합니다.

```javascript
// 해결: 한 곳에서 관리
// src/constants/genre.js
export const GENRE_MAP = { ... };

// 다른 파일에서 import
import { GENRE_MAP } from "@/constants/genre.js";
```

### I-2. 디버깅용 console.log가 여러 파일에 남아 있음

**파일**: `src/API/main_list.js:3-4,19`, `src/API/detail.js:3`, `src/API/accountAPI/login.js:17`

```javascript
// main_list.js
console.log("Fetching main list from API...");
console.log(`accessToken: ${localStorage.getItem("accessToken")}`);  // 보안 위험!
console.log("Main list response:", json);

// detail.js
console.log("Fetching detail for postId:", postId);

// login.js
console.log("LogIn response:", json);
```

개발 중에 console.log를 사용하는 것은 괜찮지만, **코드를 커밋하기 전에 삭제**해야 합니다.

### I-3. detail.css에 전역 리셋 스타일이 있음

**파일**: `src/main/detail/detail.css:1-16`

```css
/* detail.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0b0b0b;
  color: #fff;
  font-family: Arial, sans-serif;
}
```

> **왜 문제인가요?**
> - `theme.css`에 이미 전역 스타일이 있는데, detail.css에서 또 다른 값으로 덮어쓰고 있습니다
> - `body` 배경색이 theme.css는 `#171717`, detail.css는 `#0b0b0b`로 서로 다릅니다
> - **한 곳에서만 관리**해야 나중에 "배경색을 바꿔주세요" 할 때 한 군데만 수정하면 됩니다

### I-4. 반응형 전환 시 페이지 새로고침

**파일**: `src/main/detail/detail.js:99-101`

```javascript
window.matchMedia("(min-width: 768px)").addEventListener("change", () => {
  location.reload();  // 화면 크기 바뀌면 페이지 전체를 새로고침!
});
```

> **왜 문제인가요?**
> - 사용자가 브라우저 창 크기를 조절할 때마다 **페이지가 처음부터 다시 로드**됩니다
> - 스크롤 위치, 입력 중이던 데이터가 모두 사라집니다
> - CSS와 Tailwind의 반응형 기능을 활용하면 새로고침 없이 처리할 수 있습니다

### I-5. 이벤트 핸들러를 HTML에 직접 작성 (onclick 속성)

**파일**: `src/paragraph/upload/upload.html:399`, `src/paragraph/edit/edit.html:424`

```html
<!-- 나쁜 예: HTML에 JS를 직접 작성 -->
<button class="submit" onclick="createMovie()">등록하기</button>
<span class="back-btn" onclick="history.back()">← 나가기</span>
```

```javascript
// 좋은 예: JS 파일에서 이벤트를 연결
document.getElementById("submit-btn").addEventListener("click", createMovie);
```

> **왜?** HTML은 "화면 구조"만, JS는 "동작"만 담당해야 합니다. `onclick`을 HTML에 쓰면 HTML과 JS가 섞여서 **관심사 분리** 원칙이 깨집니다.

---

## 5. 파일별 상세 리뷰

### 5-1. `src/account/signup/signup.js`

| 항목 | 상태 |
|---|---|
| 파일 분리 | 좋음 (HTML/JS/API 분리) |
| import 사용 | 좋음 |
| 이벤트 핸들링 | 좋음 (addEventListener 사용) |
| **폼 제출 로직** | **없음 - Critical (C-7)** |

**signup 함수를 import 하고 폼 submit 이벤트를 추가해야 합니다.** 지금은 이메일 인증까지만 되고, 실제 회원가입은 불가능합니다.

### 5-2. `src/account/login/login.js`

| 항목 | 상태 |
|---|---|
| 파일 분리 | 매우 좋음 |
| 에러 처리 | 좋음 (NOT_FOUND / UNAUTHORIZED 구분) |
| 버튼 비활성화 | 좋음 (중복 클릭 방지) |
| **페이지 경로** | 상대 경로 사용 - 주의 필요 |

```javascript
// 상대 경로 (현재)
location.href = "../../main/main_list/main_list.html";

// 절대 경로 (더 안전)
location.href = "/src/main/main_list/main_list.html";
```

### 5-3. `src/components/input.js`

| 항목 | 상태 |
|---|---|
| 재사용성 | 매우 좋음 |
| 코드 구조 | 좋음 (rules 객체로 관리) |
| **setupPasswordCheck 중복** | 개선 필요 |

`setupPasswordCheck()`의 이벤트 리스너(input, click, blur, focus)가 `setupInput()`과 **거의 동일한 패턴**으로 반복됩니다. 한 가지 차이는 "정규식 검사 대신 비밀번호 일치 여부 검사"뿐입니다.

### 5-4. `src/main/main_list/main_list.js`

| 항목 | 상태 |
|---|---|
| render 함수 분리 | 매우 좋음 |
| API 호출 | 좋음 |
| 에러 처리 | 좋음 |
| **GENRE_MAP 중복** | 개선 필요 (I-1) |
| **XSS 위험** | Critical (C-6) |

### 5-5. `src/main/detail/detail.js`

| 항목 | 상태 |
|---|---|
| 구조화된 코드 | 좋음 (init, renderDetail 함수 분리) |
| 반응형 처리 | 좋음 (데스크탑/모바일 분기) |
| **location.reload()** | 개선 필요 (I-4) |
| **GENRE_MAP 중복** | 개선 필요 (I-1) |
| **전역 CSS 리셋** | 개선 필요 (I-3) |

### 5-6. `src/main/genre_more/genre_more.js`

| 항목 | 상태 |
|---|---|
| 페이지네이션 | 매우 좋음 (offset/limit 기반) |
| 로딩 상태 관리 | 좋음 (isLoading 플래그) |
| **GENRE_MAP 중복** | 개선 필요 (I-1) |

### 5-7. `src/paragraph/upload/upload.html`

| 항목 | 상태 |
|---|---|
| **파일 분리** | **Critical (C-1) - CSS/JS가 HTML 안에 있음** |
| **API URL** | **Critical (C-2) - 하드코딩** |
| **토큰 키 이름** | **Critical (C-3) - "token" 사용 (버그)** |
| **코드 중복** | **Critical (C-4) - edit.html과 90% 동일** |
| **onclick 사용** | **Improvement (I-5)** |
| CSS 사용 | Tailwind를 전혀 사용하지 않음 |

### 5-8. `src/paragraph/edit/edit.html`

upload.html과 동일한 문제를 모두 가지고 있습니다. (C-1, C-2, C-3, C-4, I-5)

### 5-9. API 파일들 (`src/API/`)

| 파일 | 상태 | 비고 |
|---|---|---|
| accountAPI/login.js | 좋음 | console.log 제거 필요 |
| accountAPI/signup.js | 좋음 | alert()은 API 파일이 아닌 UI에서 처리하는 게 적절 |
| accountAPI/sendEmailCode.js | 매우 좋음 | try-catch 없이 깔끔 |
| accountAPI/checkEmailCode.js | 좋음 | |
| accountAPI/nickname.js | 좋음 | |
| main_list.js | 주의 | console.log + 토큰 노출 (C-5) |
| detail.js | 주의 | console.log 제거 필요 |
| genre_more.js | 좋음 | |

---

## 6. CSS vs Tailwind 사용 현황

우리 프로젝트는 **Tailwind CSS를 기본 스타일링 도구로 사용**하기로 했습니다. CSS는 Tailwind로 표현할 수 없는 경우에만 최소한으로 사용해야 합니다.

### 현재 상태 점검표

| 파일 | Tailwind 사용 | 커스텀 CSS | 판정 |
|---|---|---|---|
| signup.html | 대부분 Tailwind | button.css, input.css만 | 좋음 |
| login.html | 대부분 Tailwind | button.css, input.css만 | 좋음 |
| main_list.html | `@import "tailwindcss"` 선언만 | 186줄 커스텀 CSS | **개선 필요** |
| detail.html | 없음 | 348줄 커스텀 CSS | **개선 필요** |
| genre_more.html | `@import "tailwindcss"` 선언만 | 커스텀 CSS 주력 | **개선 필요** |
| header.js | `@import "tailwindcss"` 선언만 | 134줄 커스텀 CSS | **개선 필요** |
| upload.html | 없음 | 280줄 `<style>` 태그 | **Critical** |
| edit.html | 없음 | 300줄 `<style>` 태그 | **Critical** |

### Tailwind로 바꿀 수 있는 대표적인 예시

```css
/* main_list.css (현재 - 커스텀 CSS) */
.movie-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  background-color: #262626;
}
```

```html
<!-- Tailwind로 변환하면 -->
<a class="flex flex-col no-underline text-inherit rounded-lg overflow-hidden bg-neutral-800">
```

> **중요**: CSS 파일에 `@import "tailwindcss"`를 선언만 하고 실제로는 커스텀 CSS만 쓰면, Tailwind의 장점을 전혀 활용하지 못합니다. **HTML 태그에 Tailwind 클래스를 직접 작성**하는 것이 핵심입니다.

---

## 7. 이슈 우선순위 정리

| 우선순위 | 이슈 | 난이도 | 예상 시간 |
|---|---|---|---|
| 1 | C-3: 토큰 키 이름 통일 (실제 버그) | 쉬움 | 5분 |
| 2 | C-5: console.log 토큰 노출 삭제 | 쉬움 | 5분 |
| 3 | C-7: signup 폼 submit 핸들러 추가 | 보통 | 30분 |
| 4 | C-1: upload/edit 파일 분리 | 보통 | 1-2시간 |
| 5 | C-2: API URL 환경변수로 변경 | 쉬움 | 10분 |
| 6 | C-4: upload/edit 중복 제거 | 보통 | 1시간 |
| 7 | I-1: GENRE_MAP 공통 파일로 추출 | 쉬움 | 15분 |
| 8 | I-2: console.log 전체 삭제 | 쉬움 | 10분 |
| 9 | C-6: XSS 방어 함수 추가 | 보통 | 30분 |
| 10 | CSS → Tailwind 전환 | 어려움 | 3-4시간 |

> **해결 방법의 자세한 설명은 [code-review-20260409-guide.md](./code-review-20260409-guide.md)를 참고하세요.**
