# Bui1d-UP 코드 리뷰 (2026-04-06)

> **대상**: develop 브랜치 최신 코드 (커밋 `005c72e` 기준)
> **목적**: 응집도(Cohesion)를 높이고 결합도(Coupling)를 낮추는 방향으로 개선점 안내
> **난이도**: 입문자 눈높이

---

## 목차

1. [전체 구조 평가](#1-전체-구조-평가)
2. [잘한 점](#2-잘한-점)
3. [반드시 고쳐야 할 문제 (Critical)](#3-반드시-고쳐야-할-문제-critical)
4. [개선하면 좋은 점 (Improvement)](#4-개선하면-좋은-점-improvement)
5. [파일별 상세 리뷰](#5-파일별-상세-리뷰)
6. [응집도와 결합도 가이드](#6-응집도와-결합도-쉽게-이해하기)

---

## 1. 전체 구조 평가

```
src/
├── API/                    # API 호출 함수 모음
│   ├── accountAPI/         # 로그인/회원가입
│   ├── mypageAPI/          # 마이페이지 관련
│   ├── paragraphAPI/       # 글 작성/수정
│   ├── main_list.js        # 메인 목록 조회
│   ├── detail.js           # 상세 조회
│   └── genre_more.js       # 장르별 더보기
├── assets/icons/           # SVG 아이콘
├── components/             # 공용 컴포넌트 (button)
├── main/                   # 메인 화면 (header, main_list, detail, genre_more)
├── account/                # 로그인/회원가입
├── landing/                # 랜딩 페이지
├── mypage/                 # 마이페이지
├── paragraph/              # 글 작성/수정
└── styles/theme.css        # 디자인 토큰
```

**기능(Feature) 기반으로 폴더를 나눈 구조는 좋습니다.** 각 페이지가 자기 폴더 안에 HTML, CSS, JS를 갖고 있어서 "이 기능은 이 폴더만 보면 된다"는 점이 명확합니다.

---

## 2. 잘한 점

### theme.css - 디자인 토큰 중앙 관리

```css
/* src/styles/theme.css */
:root {
  --background-base: #171717;
  --color-primary: #dc2626;
  --text-primary: #ffffff;
  /* ... */
}
```

디자인에서 쓰는 색상을 한 곳에 모아둔 것은 아주 좋은 습관입니다. 나중에 "빨간색을 파란색으로 바꿔주세요"라는 요청이 오면 이 파일 하나만 수정하면 됩니다. 이것이 **낮은 결합도**의 좋은 예시입니다.

### Button 컴포넌트 - 접근성과 재사용성

```html
<button type="button" aria-label="새 리뷰 작성">
  <span class="icon icon-add" aria-hidden="true"></span>
  <span class="hidden min-[768px]:inline text-sm">새 리뷰 작성</span>
</button>
```

- `aria-label`, `aria-hidden` 같은 접근성 속성을 잘 활용했습니다.
- 반응형 처리(모바일에서 아이콘만, 데스크탑에서 텍스트 포함)도 잘 되어 있습니다.
- CSS 마스크 기법으로 아이콘 색상이 텍스트 색상에 자동 연동되는 부분도 훌륭합니다.

### API 함수 분리

```js
// src/API/main_list.js
export const getMainList = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/movies/home`);
  // ...
};
```

API 호출 로직을 별도 파일로 분리한 것은 **높은 응집도**의 좋은 예입니다. 화면(UI)과 데이터 가져오기(API)를 섞지 않고 분리했습니다.

### Header - JS로 재사용 가능한 컴포넌트화

`renderHeader()` 함수로 만들어서 여러 페이지에서 호출할 수 있게 한 시도가 좋습니다.

---

## 3. 반드시 고쳐야 할 문제 (Critical)

### 3-1. `.env` 파일 관리 습관 들이기

**파일**: `.env`

```
VITE_API_BASE_URL=https://api.fullstackfamily.com/api/buildup/v1
```

현재는 **공개 API 주소만 있어서 보안 문제는 없습니다.** `VITE_` 접두어가 붙은 변수는 Vite가 클라이언트 번들에 포함시키므로 어차피 브라우저에서 누구나 볼 수 있는 값입니다.

다만 `.env` 파일은 일반적으로 `.gitignore`에 넣는 것이 업계 관행입니다. 나중에 비밀 키(JWT Secret, 외부 API Key 등)가 추가될 수 있기 때문입니다.

**습관으로 권장**:

```bash
# 1. .gitignore에 추가
echo ".env" >> .gitignore

# 2. 팀원이 참고할 수 있는 예시 파일 생성
cp .env .env.example
# .env.example 안에는 실제 값 대신 설명을 적습니다:
# VITE_API_BASE_URL=https://your-api-url.com
```

> **참고**: `VITE_` 접두어 변수 = 브라우저에 노출되는 값. 비밀 키에는 절대 `VITE_`를 붙이면 안 됩니다.

---

### 3-2. Vite에서 이미지 경로가 잘못되어 있습니다

**파일**: `src/main/header/header.html`, `src/main/header/header.js`

```html
<!-- 현재 (잘못된 경로) -->
<img src="/public/Bui1dBox.png" />
<img src="/public/Search_icon.svg" />

<!-- 올바른 경로 -->
<img src="/Bui1dBox.png" />
<img src="/Search_icon.svg" />
```

**Vite의 `public/` 폴더 규칙**: `public/` 폴더 안의 파일은 빌드 시 자동으로 루트(`/`)에 복사됩니다. 그래서 경로에 `/public/`을 쓰면 안 됩니다.

| 실제 파일 위치 | 올바른 HTML 경로 |
|---|---|
| `public/Bui1dBox.png` | `/Bui1dBox.png` |
| `public/Search_icon.svg` | `/Search_icon.svg` |

> **지금은 개발 서버에서 우연히 동작할 수도 있지만**, `npm run build`로 빌드하면 이미지가 깨집니다.

---

### 3-3. Header HTML이 두 곳에 중복되어 있습니다 (응집도 위반)

**파일**: `src/main/header/header.html` + `src/main/header/header.js`

같은 헤더 HTML이 두 곳에 존재하는데, **내용이 서로 다릅니다**:

| 항목 | header.html | header.js |
|---|---|---|
| 로고 링크 | `/main_list.html` | `/src/main/main_list/main_list.html` |
| 텍스트 로고 경로 | `/public/Bui1dBox.png` | `/public/Bui1dBox.png` |

**문제**: 헤더를 수정할 때 두 파일을 모두 고쳐야 하고, 하나만 고치면 불일치가 발생합니다. 이것은 **낮은 응집도**의 전형적인 예입니다.

**해결 방법**: 하나를 **정본(Source of Truth)**으로 정하세요.

```
권장: header.js만 유지하고, header.html은 미리보기/테스트용으로만 사용
```

`header.html`을 유지하려면 상단에 주석을 달아두세요:

```html
<!-- 주의: 이 파일은 미리보기 전용입니다. 실제 헤더는 header.js를 수정하세요. -->
```

---

### 3-4. ESLint 설정에 React 플러그인이 포함되어 있습니다

**파일**: `eslint.config.js`

```js
import react from "eslint-plugin-react";           // React 안 쓰는데?
import reactHooks from "eslint-plugin-react-hooks"; // 이것도?
```

이 프로젝트는 **바닐라 HTML/CSS/JS + Vite** 프로젝트입니다. React를 사용하지 않는데 React 관련 ESLint 플러그인이 설치되어 있으면:

- `npm install` 할 때 불필요한 패키지가 설치됩니다
- ESLint 실행 시 경고나 에러가 발생할 수 있습니다
- 팀원이 "이 프로젝트 React 쓰는 건가?" 하고 혼동합니다

**해결 방법**:

```js
// eslint.config.js - React 관련 부분 제거
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "error",
      eqeqeq: "error",
      curly: "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
```

---

## 4. 개선하면 좋은 점 (Improvement)

### 4-1. package.json - 같은 패키지가 두 번 들어가 있습니다

**파일**: `package.json`

```json
{
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",   // 여기에도 있고
    "tailwindcss": "^4.2.2"          // 여기에도 있고
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.2.2",   // 또 있고
    "tailwindcss": "^4.2.2"          // 또 있습니다
  }
}
```

Tailwind는 **빌드 도구**이므로 `devDependencies`에만 있으면 됩니다. `dependencies`는 실제 서비스 운영 시 필요한 라이브러리용입니다.

**해결 방법**:

```bash
npm uninstall tailwindcss @tailwindcss/vite
npm install -D tailwindcss @tailwindcss/vite
```

또한 `scripts`에 Tailwind CLI 명령(`tailwind`, `watch`)이 있는데, Vite 플러그인을 이미 쓰고 있으므로 이 스크립트는 불필요합니다:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

### 4-2. Header CSS에서 색상 하드코딩

**파일**: `src/main/header/header.css`

```css
/* 현재: 색상값이 직접 적혀 있음 */
.nav-btn {
  color: #ffffff;           /* theme.css의 --text-primary와 같은 값 */
}
.nav-btn--red {
  background-color: #dc2626; /* theme.css의 --color-primary와 같은 값 */
}
.search-bar {
  border: 1px solid #737373; /* theme.css의 --text-secondary와 같은 값 */
  background-color: #262626; /* theme.css의 --background-surface와 같은 값 */
}
```

theme.css에 이미 정의된 색상인데 직접 16진수 값을 쓰고 있습니다. 나중에 theme.css의 색상을 바꿔도 헤더는 안 바뀝니다.

**해결 방법**:

```css
/* 개선: CSS 변수 사용 */
.nav-btn {
  color: var(--text-primary);
}
.nav-btn--red {
  background-color: var(--color-primary);
}
.search-bar {
  border: 1px solid var(--text-secondary);
  background-color: var(--background-surface);
}
```

> **이것이 결합도를 낮추는 방법입니다.** 색상 정보가 theme.css라는 한 곳에만 있고, 다른 파일은 "이름"으로 참조합니다. 이름이 같으면 값은 자동으로 따라옵니다.

---

### 4-3. API 호출 패턴을 공유 유틸리티로 만들기

**파일**: `src/API/main_list.js`

현재 main_list.js에 잘 작성된 API 호출 패턴이 있습니다. 앞으로 다른 API 파일들도 만들게 될 텐데, 이 패턴을 매번 복사하면 **결합도가 높아집니다** (한 곳을 고치면 여러 곳을 다 고쳐야 함).

**권장: 공용 fetch 함수를 만드세요**

```js
// src/API/client.js (새 파일)
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function api(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API 에러: ${response.status}`);
  }

  return response.json();
}
```

```js
// src/API/main_list.js (개선 후)
import { api } from "./client.js";

export const getMainList = () => api("/movies/home");
```

이렇게 하면:
- API 주소가 바뀌어도 `client.js` 하나만 수정
- 인증 토큰 추가가 필요해도 `client.js`에만 추가
- 각 API 파일은 자기 엔드포인트만 알면 됨 (**높은 응집도**)

---

### 4-4. 이미지/로고 파일명 통일

`public/` 폴더의 파일명이 일관성이 없습니다:

| 현재 파일명 | 문제 |
|---|---|
| `Bui1dBox.png` | 대문자 시작 |
| `Bui1dBoxTextLogo.png` | camelCase |
| `bui1d-boxLogo.png` | kebab + camelCase 혼합 |
| `bui1d-boxFullLogo.png` | kebab + camelCase 혼합 |
| `Add_round.svg` | 대문자 + snake_case |
| `Search_icon.svg` | 대문자 + snake_case |
| `logout.png` | 소문자 |
| `myinfo.png` | 소문자 |

**권장**: 하나의 규칙을 정하고 통일하세요. 웹에서는 **kebab-case**(소문자 + 하이픈)가 가장 일반적입니다:

```
bui1d-box-logo.png
bui1d-box-text-logo.png
add-round.svg
search-icon.svg
```

---

### 4-5. header.css에서 Tailwind import 방식

**파일**: `src/main/header/header.css`

```css
@import "tailwindcss";  /* 전체 Tailwind를 다시 import */
```

theme.css에서 이미 `@import "tailwindcss"`를 하고 있습니다. 각 CSS 파일마다 따로 import하면 빌드 시 Tailwind CSS가 중복 포함될 수 있습니다.

**참고**: button.css에서는 `@reference "tailwindcss"`를 올바르게 사용하고 있습니다. `@reference`는 Tailwind의 클래스 이름만 참조하고 실제 CSS는 포함하지 않으므로, 컴포넌트 CSS에서는 `@reference`가 적절합니다.

```css
/* header.css - 개선 */
@reference "tailwindcss";  /* @import 대신 @reference 사용 */
```

---

## 5. 파일별 상세 리뷰

### `vite.config.js` - 잘 구성됨

```js
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, "index.html"),
      landing: path.resolve(__dirname, "src/landing/landing.html"),
      // ...10개 페이지
    },
  },
},
```

멀티 페이지 설정이 잘 되어 있습니다. `@` alias 설정도 좋습니다. 나중에 `import { api } from "@/API/client.js"` 처럼 깔끔한 경로를 쓸 수 있습니다.

### `src/components/button.css` - 잘 작성됨

- `@reference "tailwindcss"` 올바르게 사용
- CSS 변수(`var(--color-primary)`)로 색상 참조 - theme.css와 잘 연동
- `:focus-visible` 상태 처리로 키보드 접근성 확보
- `:disabled` 상태에 `pointer-events: none` 적용
- CSS 마스크 기반 아이콘 시스템이 깔끔함

### `src/components/button.html` - 개선 가능

Tailwind 클래스와 커스텀 CSS를 섞어 사용 중입니다. 학습 단계에서는 괜찮지만, 팀 내 규칙을 정하는 것이 좋습니다:

```html
<!-- 현재: Tailwind + 커스텀 CSS 혼합 -->
<button class="border-0 py-2 px-4 rounded-lg button-primary">

<!-- 방법 A: Tailwind 위주 -->
<button class="border-0 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700">

<!-- 방법 B: 커스텀 CSS 위주 -->
<button class="button-primary">
```

**권장**: "레이아웃/간격은 Tailwind, 색상/테마는 커스텀 CSS"처럼 역할을 나누면 혼란이 줄어듭니다.

### `src/API/main_list.js` - 잘 작성됨, 보완 가능

```js
export const getMainList = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/movies/home`);
    if (!response.ok) {
      throw new Error("Failed to fetch main list");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching main list:", error);
    return null;
  }
};
```

잘된 점:
- `async/await` 사용
- `response.ok` 체크
- `try/catch` 에러 처리
- 환경변수로 API 주소 관리

보완할 점:
- 에러 시 `null`을 반환하면, 호출하는 쪽에서 `null` 체크를 매번 해야 합니다
- 에러를 던지고 호출하는 쪽에서 처리하는 것도 고려해 보세요

### `src/main/header/header.js` - 개선 필요

```js
export function renderHeader(targetSelector = "body") {
  const html = `...`;
  const target = document.querySelector(targetSelector);
  target.insertAdjacentHTML("afterbegin", html);
}
```

`target`이 `null`이면 에러가 발생합니다. 안전하게 처리하세요:

```js
const target = document.querySelector(targetSelector);
if (!target) {
  console.error(`renderHeader: "${targetSelector}" 요소를 찾을 수 없습니다.`);
  return;
}
target.insertAdjacentHTML("afterbegin", html);
```

---

## 6. 응집도와 결합도 쉽게 이해하기

### 응집도(Cohesion) = "한 모듈이 하나의 역할에 집중하는 정도"

**높은 응집도 (좋음)**: 한 파일/폴더가 하나의 일만 합니다.

```
src/API/main_list.js     → "메인 목록 API 호출"만 담당
src/components/button.css → "버튼 스타일"만 담당
src/styles/theme.css      → "디자인 토큰"만 담당
```

**낮은 응집도 (나쁨)**: 한 파일에 여러 역할이 섞여 있습니다.

```
// 나쁜 예: API 호출 + HTML 생성 + 이벤트 처리가 한 파일에
function loadMainPage() {
  fetch("/api/movies/home").then(res => res.json()).then(data => {
    document.body.innerHTML = `<div>${data.map(m => `<h2>${m.title}</h2>`)}</div>`;
    document.querySelector("h2").addEventListener("click", () => { ... });
  });
}
```

### 결합도(Coupling) = "모듈 사이의 의존 정도"

**낮은 결합도 (좋음)**: A를 수정해도 B는 안 고쳐도 됩니다.

```css
/* header.css - CSS 변수로 색상 참조 */
.nav-btn { color: var(--text-primary); }

/* theme.css에서 색상을 바꾸면 header는 자동으로 바뀜 */
```

**높은 결합도 (나쁨)**: A를 수정하면 B, C, D도 수정해야 합니다.

```css
/* header.css - 직접 색상값 사용 */
.nav-btn { color: #ffffff; }
/* theme.css에서 #ffffff를 #f0f0f0으로 바꿔도 header는 안 바뀜 → 직접 찾아서 고쳐야 함 */
```

### 이 프로젝트에서 실천하는 법

| 원칙 | 현재 상태 | 개선 방향 |
|---|---|---|
| 색상은 한 곳에서 관리 | theme.css 있지만 header.css가 하드코딩 | header.css에서 `var(--변수)` 사용 |
| API 호출 패턴 공유 | main_list.js에만 있음 | `client.js` 공용 함수 만들기 |
| 컴포넌트 HTML은 한 곳 | header.html + header.js 중복 | 하나를 정본으로 지정 |
| 파일명 규칙 통일 | camelCase/kebab/snake 혼합 | kebab-case로 통일 |

---

## 체크리스트

팀원들이 다음 PR을 올리기 전에 확인해 보세요:

- [ ] `.env` 파일이 `.gitignore`에 추가되었는가? (권장 습관)
- [ ] 이미지 경로에 `/public/`이 포함되어 있지 않은가?
- [ ] 새로 만든 CSS에서 색상을 직접 쓰지 않고 `var(--변수)`를 사용했는가?
- [ ] header HTML 수정 시 `header.js`를 기준으로 수정했는가?
- [ ] ESLint 설정에서 React 관련 설정이 제거되었는가?
- [ ] 새 파일명이 팀 규칙(kebab-case 권장)을 따르는가?

---

> 전체적으로 프로젝트 초기 세팅이 탄탄하게 되어 있고, 특히 디자인 토큰(theme.css)과 API 분리가 좋습니다. 위의 개선점들을 하나씩 적용하면 훨씬 견고한 프로젝트가 될 것입니다. 화이팅!
