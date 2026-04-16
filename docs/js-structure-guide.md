# JavaScript 파일 구조화 가이드

> Bui1d-UP 프로젝트의 현재 코드를 분석하고, JS 파일을 어떻게 나누고 정리하면 좋을지 정리한 가이드입니다.

---

## 목차

1. [현재 우리 프로젝트 구조 한눈에 보기](#1-현재-우리-프로젝트-구조-한눈에-보기)
2. [지금 잘하고 있는 것들](#2-지금-잘하고-있는-것들)
3. [개선하면 좋을 것들 (구체적 예시)](#3-개선하면-좋을-것들)
4. [개선된 폴더 구조 제안](#4-개선된-폴더-구조-제안)
5. [JS 파일을 나누는 기준](#5-js-파일을-나누는-기준)
6. [실전 리팩토링 예제](#6-실전-리팩토링-예제)
7. [새 페이지를 만들 때 체크리스트](#7-새-페이지를-만들-때-체크리스트)
8. [자주 하는 실수와 해결법](#8-자주-하는-실수와-해결법)

---

## 1. 현재 우리 프로젝트 구조 한눈에 보기

```
src/
├── account/                 # 로그인, 회원가입
│   ├── login/
│   │   ├── login.html
│   │   ├── login.js        ← 로그인 폼 처리
│   │   └── login.css
│   └── signup/
│       ├── signup.html
│       └── signup.css
│
├── main/                    # 메인 화면들
│   ├── header/
│   │   ├── header.html
│   │   ├── header.js       ← 공통 헤더 컴포넌트
│   │   └── header.css
│   ├── main_list/
│   │   ├── main_list.html
│   │   ├── main_list.js    ← 메인 리스트 (장르별 카드)
│   │   └── main_list.css
│   ├── genre_more/
│   │   ├── genre_more.html
│   │   ├── genre_more.js   ← 장르 전체보기 + 페이지네이션
│   │   └── genre_more.css
│   └── detail/
│       ├── detail.html
│       └── detail.css
│
├── paragraph/               # 글쓰기, 수정
│   ├── upload/
│   └── edit/
│
├── mypage/                  # 마이페이지
│
├── components/              # 재사용 UI 컴포넌트
│   └── input.js            ← 입력 필드 유효성 검사
│
├── API/                     # 백엔드 API 호출
│   ├── accountAPI/
│   │   └── login.js        ← 로그인 API
│   ├── main_list.js        ← 메인 리스트 API
│   └── genre_more.js       ← 장르 목록 API
│
├── assets/                  # 아이콘, 이미지
└── styles/
    └── theme.css           ← 색상 변수
```

### 현재 구조의 핵심 패턴

우리 프로젝트는 **"한 페이지 = 한 폴더"** 방식입니다.

```
login/
├── login.html   ← 화면 (뼈대)
├── login.js     ← 동작 (두뇌)
└── login.css    ← 스타일 (옷)
```

이것은 **기능별 폴더 구조 (Feature-based Structure)** 라고 부릅니다. 좋은 선택입니다!

---

## 2. 지금 잘하고 있는 것들

코드를 분석해보니, 이미 여러 가지를 잘 하고 있습니다. 자신감을 가져도 됩니다!

### (1) API 코드를 별도 폴더로 분리했다

```
src/API/
├── accountAPI/login.js     ← 로그인 요청만 담당
├── main_list.js            ← 메인 리스트 데이터 요청만 담당
└── genre_more.js           ← 장르 목록 요청만 담당
```

"화면을 그리는 코드"와 "서버에 데이터를 요청하는 코드"가 섞여있지 않습니다. 이 분리는 아주 중요합니다.

**왜 좋은가?**
- API 주소가 바뀌면 API 파일만 고치면 됩니다
- 화면 디자인이 바뀌어도 API 코드를 건드릴 필요가 없습니다

### (2) ES Modules (import/export) 를 사용한다

```js
// main_list.js에서 API 함수를 가져다 쓰는 모습
import { getMainList } from "../../API/main_list.js";
```

`import`/`export`를 쓰면 각 파일이 **독립적인 역할**을 가질 수 있습니다. 전역 변수로 엉키는 문제를 방지합니다.

### (3) 재사용 컴포넌트를 만들었다

```js
// components/input.js의 setupInput은 여러 페이지에서 재사용
import { setupInput, setupToggle } from "../../components/input.js";

setupInput("username");  // 로그인 페이지에서 사용
setupInput("password");  // 같은 함수를 다른 입력 필드에 재사용!
```

`input.js`의 유효성 검사 로직을 한 번 만들어두고, 로그인/회원가입 등 여러 페이지에서 가져다 씁니다.

### (4) 헤더를 공통 컴포넌트로 만들었다

```js
// header.js
export function renderHeader(targetSelector) {
  // 헤더 HTML을 만들어서 원하는 위치에 삽입
}

// main_list.js, genre_more.js 등 여러 페이지에서
renderHeader("#header-container");
```

---

## 3. 개선하면 좋을 것들

### 문제 1: 같은 코드가 여러 파일에 반복된다 (중복 코드)

`GENRE_MAP`이 **두 파일에 똑같이** 존재합니다.

```js
// main_list.js (5~16줄)
const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  // ...
};

// genre_more.js (5~16줄) ← 완전히 같은 코드!
const GENRE_MAP = {
  animation: "애니메이션",
  comedy: "코미디",
  // ...
};
```

**왜 문제인가?**
- 장르를 하나 추가하면 **두 파일 모두** 수정해야 합니다
- 한쪽만 고치면 데이터가 **불일치**하는 버그가 생깁니다
- 파일이 늘어날수록 수정 포인트가 계속 늘어납니다

또한, 영화 카드를 그리는 `renderSmallCard`(main_list.js)와 `renderCard`(genre_more.js)도 거의 같은 코드입니다.

```js
// main_list.js (50~62줄) - renderSmallCard
function renderSmallCard(post) {
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

// genre_more.js (29~41줄) - renderCard ← 이름만 다르고 같은 코드!
function renderCard(post) {
  return `
    <a href="/src/main/detail/detail.html?postId=${post.postId}" class="movie-card">
      ...
    </a>
  `;
}
```

### 문제 2: API 파일마다 인증 헤더를 반복 작성한다

모든 API 파일에서 같은 패턴이 반복됩니다.

```js
// API/main_list.js
const response = await fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,  // 반복!
  },
});

// API/genre_more.js ← 같은 코드 반복!
const response = await fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,  // 반복!
  },
});
```

**왜 문제인가?**
- 인증 방식이 바뀌면 **모든 API 파일을 하나씩** 고쳐야 합니다
- 헤더를 빼먹으면 API 호출이 실패하는 버그가 생깁니다
- 토큰 갱신 로직을 추가하려면 모든 파일에 넣어야 합니다

### 문제 3: 상수(Constants)가 흩어져 있다

`LIMIT`, `GENRE_MAP`, `GENRE_ORDER` 같은 값이 각 파일에 흩어져 있습니다.

```js
// genre_more.js
const LIMIT = 20;  // 여기에도

// main_list.js
const GENRE_ORDER = Object.keys(GENRE_MAP);  // 여기에도
```

### 문제 4: localStorage 접근이 여러 곳에 퍼져 있다

```js
// login.js에서 저장
localStorage.setItem("accessToken", token);
localStorage.setItem("userId", user.id);
localStorage.setItem("nickname", user.nickname);

// API/main_list.js에서 읽기
localStorage.getItem("accessToken");

// API/genre_more.js에서도 읽기
localStorage.getItem("accessToken");
```

토큰 키 이름(`"accessToken"`)이 문자열로 여기저기 흩어져 있어서, 오타가 나면 찾기 어렵습니다.

---

## 4. 개선된 폴더 구조 제안

```
src/
├── API/                         # 서버 통신 (지금처럼 유지)
│   ├── client.js               ← [신규] 공통 fetch 래퍼
│   ├── accountAPI/
│   │   ├── login.js
│   │   └── signup.js
│   ├── main_list.js
│   ├── genre_more.js
│   ├── detail.js
│   ├── mypageAPI/
│   └── paragraphAPI/
│
├── components/                  # 재사용 UI 조각
│   ├── input.js                ← 입력 필드 (지금처럼)
│   └── movieCard.js            ← [신규] 영화 카드 컴포넌트
│
├── constants/                   ← [신규] 상수 모음
│   └── genre.js                ← GENRE_MAP, GENRE_ORDER
│
├── utils/                       ← [신규] 유틸리티 함수
│   └── auth.js                 ← 토큰 저장/읽기/삭제
│
├── account/                     # 페이지별 폴더 (지금처럼)
├── main/
├── paragraph/
├── mypage/
├── landing/
│
├── assets/
└── styles/
```

**달라진 점은 3개 폴더뿐입니다:**

| 새 폴더 | 역할 | 들어가는 것 |
|---------|------|------------|
| `constants/` | 여러 파일에서 쓰는 고정값 | `GENRE_MAP`, `GENRE_ORDER`, `LIMIT` |
| `utils/` | 여러 파일에서 쓰는 도구 함수 | 토큰 관리, 날짜 포맷 등 |
| `components/movieCard.js` | 영화 카드 UI | `renderSmallCard` |

---

## 5. JS 파일을 나누는 기준

파일을 나눌 때 가장 중요한 질문은 이것입니다:

> **"이 코드가 바뀌는 이유가 같은가?"**

같은 이유로 바뀌는 코드끼리 한 파일에 넣고, 다른 이유로 바뀌는 코드는 분리합니다.

### 기준 1: 역할별로 나누기

하나의 페이지 기능을 구현할 때, JS 코드는 크게 4가지 역할을 합니다.

```
┌─────────────────────────────────────────────────────┐
│                    페이지 (page)                      │
│  "화면을 조립하고, 사용자 이벤트를 처리한다"             │
│                                                       │
│  예: main_list.js, login.js                           │
│  - HTML 요소 가져오기 (getElementById)                 │
│  - 이벤트 리스너 등록 (addEventListener)               │
│  - 데이터 로드 → 렌더링 함수 호출                       │
└────────────┬──────────────────────┬───────────────────┘
             │ import               │ import
             ▼                      ▼
┌────────────────────┐  ┌────────────────────────────┐
│  컴포넌트 (component)│  │      API (api)              │
│  "HTML 조각을 만든다" │  │  "서버에 데이터를 요청한다"   │
│                      │  │                              │
│  예: movieCard.js    │  │  예: API/main_list.js        │
│  - 데이터 → HTML 반환 │  │  - fetch 호출                │
│  - 재사용 가능        │  │  - 에러 처리                  │
└────────────────────┘  └──────────────┬───────────────┘
                                       │ import
                                       ▼
                        ┌────────────────────────────┐
                        │     유틸리티 (util)          │
                        │  "자주 쓰는 도구 함수"       │
                        │                              │
                        │  예: auth.js, client.js      │
                        │  - 토큰 관리                  │
                        │  - 공통 fetch 설정            │
                        └────────────────────────────┘
```

### 기준 2: "2번 이상 쓰이면 분리"

```
[ 1번만 쓰임 ]  →  그 파일 안에 그냥 두기
[ 2번 이상 ]    →  별도 파일로 분리하기
```

지금 `renderSmallCard`가 `main_list.js`와 `genre_more.js` 두 곳에서 쓰이니까 → `components/movieCard.js`로 분리!

### 기준 3: 파일 하나가 너무 길면 쪼개기

경험적으로 **150줄**이 넘으면 나눌 수 있는지 생각해봅니다.

```
150줄 이하  →  한 파일로 OK
150~300줄  →  "역할이 두 개 이상 섞여있지 않나?" 확인
300줄 이상  →  거의 확실히 나눠야 함
```

지금 우리 파일들은 모두 150줄 이하라서 파일 크기는 적절합니다!

### 기준 4: 이름으로 역할을 알 수 있게

```
좋은 예:
  API/main_list.js        → "API 폴더 안에 있으니 서버 요청이겠구나"
  components/movieCard.js → "컴포넌트 폴더니까 재사용 UI겠구나"
  utils/auth.js           → "유틸리티니까 도구 함수겠구나"

나쁜 예:
  helpers.js              → "뭘 도와주는 건데?"
  stuff.js                → "뭐가 들어있는 거야?"
  misc.js                 → "잡동사니?"
```

---

## 6. 실전 리팩토링 예제

지금 코드를 어떻게 개선할 수 있는지, 구체적인 코드로 보여드리겠습니다.

### 예제 1: 상수 분리하기

**Before** - `GENRE_MAP`이 두 파일에 중복

```js
// main_list.js
const GENRE_MAP = { animation: "애니메이션", comedy: "코미디", ... };

// genre_more.js  ← 복붙!
const GENRE_MAP = { animation: "애니메이션", comedy: "코미디", ... };
```

**After** - 한 곳에서 관리

```js
// constants/genre.js  ← 새 파일
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

```js
// main_list.js  ← import 해서 사용
import { GENRE_MAP, GENRE_ORDER } from "../../constants/genre.js";

// genre_more.js  ← 같은 파일에서 import
import { GENRE_MAP } from "../../constants/genre.js";
```

장르를 추가하거나 이름을 바꿀 때, `constants/genre.js` **한 파일만** 수정하면 됩니다!

### 예제 2: 중복 컴포넌트 분리하기

**Before** - 영화 카드가 두 파일에 중복

```js
// main_list.js에 있는 renderSmallCard
function renderSmallCard(post) { ... }

// genre_more.js에 있는 renderCard  ← 같은 코드, 이름만 다름
function renderCard(post) { ... }
```

**After** - 한 곳에서 관리

```js
// components/movieCard.js  ← 새 파일
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

```js
// main_list.js
import { renderMovieCard } from "../../components/movieCard.js";
// renderSmallCard 대신 renderMovieCard 사용

// genre_more.js
import { renderMovieCard } from "../../components/movieCard.js";
// renderCard 대신 renderMovieCard 사용
```

### 예제 3: API 공통 코드 묶기

**Before** - 매 API 파일에서 같은 헤더를 반복

```js
// API/main_list.js
const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});
if (!response.ok) throw new Error("...");
const json = await response.json();
return json.data;

// API/genre_more.js  ← 같은 패턴 반복!
const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});
if (!response.ok) throw new Error("...");
const json = await response.json();
return json.data;
```

**After** - 공통 fetch 함수 만들기

```js
// API/client.js  ← 새 파일

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 인증 헤더가 포함된 fetch 요청을 보냅니다.
 * 모든 API 파일에서 이 함수를 사용합니다.
 */
export async function request(path, options = {}) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `요청 실패 (${response.status})`);
  }

  const json = await response.json();
  return json.data;
}
```

```js
// API/main_list.js  ← 훨씬 간단해짐!
import { request } from "./client.js";

export const getMainList = async () => {
  return request("/movies/home");
};
```

```js
// API/genre_more.js  ← 마찬가지로 간단!
import { request } from "./client.js";

export const getGenreMore = async (genre, offset = 0, limit = 20) => {
  const params = new URLSearchParams({ offset, limit });
  if (genre) params.set("genre", genre);
  return request(`/movies?${params}`);
};
```

### 예제 4: 토큰 관리 유틸리티

**Before** - localStorage 키 이름이 문자열로 흩어져 있음

```js
// login.js
localStorage.setItem("accessToken", token);      // 여기서 저장
localStorage.setItem("nickname", user.nickname);

// API/main_list.js
localStorage.getItem("accessToken");              // 여기서 읽기

// 만약 "accessToken"을 "access_token"으로 바꾸고 싶다면?
// → 모든 파일을 검색해서 하나씩 바꿔야 합니다!
```

**After** - 한 파일에서 관리

```js
// utils/auth.js  ← 새 파일

const KEYS = {
  TOKEN: "accessToken",
  USER_ID: "userId",
  NICKNAME: "nickname",
};

export function saveLogin(token, user) {
  localStorage.setItem(KEYS.TOKEN, token);
  localStorage.setItem(KEYS.USER_ID, user.id);
  localStorage.setItem(KEYS.NICKNAME, user.nickname);
}

export function getToken() {
  return localStorage.getItem(KEYS.TOKEN);
}

export function getNickname() {
  return localStorage.getItem(KEYS.NICKNAME);
}

export function clearLogin() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export function isLoggedIn() {
  return !!getToken();
}
```

```js
// login.js  ← 훨씬 깔끔!
import { saveLogin } from "../../utils/auth.js";

// 기존: 3줄의 localStorage.setItem
// 변경: 1줄!
saveLogin(token, user);
```

---

## 7. 새 페이지를 만들 때 체크리스트

새로운 페이지(예: `detail` 상세 페이지)를 만들 때 이 순서를 따라해보세요.

### Step 1: 폴더와 파일 만들기

```
src/main/detail/
├── detail.html       ← 화면 구조
├── detail.js         ← 페이지 로직
└── detail.css        ← 스타일
```

### Step 2: vite.config.js에 엔트리 등록하기

```js
// vite.config.js의 input에 추가 (이미 되어있음)
detail: path.resolve(__dirname, "src/main/detail/detail.html"),
```

### Step 3: API 파일 만들기

```
src/API/detail.js     ← 서버에서 영화 상세 정보 가져오기
```

### Step 4: 기존 것 재사용하기

새 파일을 만들기 전에 먼저 확인하세요!

```
이미 있는 것 재사용 가능?
├── GENRE_MAP 필요?         → constants/genre.js에서 import
├── 영화 카드 필요?          → components/movieCard.js에서 import
├── 헤더 필요?              → main/header/header.js에서 import
├── 입력 필드 필요?          → components/input.js에서 import
├── API 호출 필요?          → API/client.js의 request() 사용
└── 토큰 확인 필요?          → utils/auth.js에서 import
```

### Step 5: 페이지 JS 작성 패턴

```js
// detail.js

// 1단계: import (외부 모듈 가져오기)
import "./detail.css";
import { renderHeader } from "../header/header.js";
import { getDetail } from "../../API/detail.js";

// 2단계: DOM 요소 가져오기
const titleEl = document.getElementById("movie-title");
const posterEl = document.getElementById("movie-poster");

// 3단계: 렌더링 함수 정의
function renderDetail(movie) {
  titleEl.textContent = movie.title;
  posterEl.src = movie.imageUrl;
}

// 4단계: 데이터 로드 함수 정의
async function loadDetail() {
  const postId = new URLSearchParams(location.search).get("postId");
  try {
    const data = await getDetail(postId);
    if (!data) throw new Error("데이터 없음");
    renderDetail(data);
  } catch (err) {
    titleEl.textContent = "영화 정보를 불러올 수 없습니다.";
    console.error(err);
  }
}

// 5단계: 이벤트 리스너 등록

// 6단계: 초기화 실행
renderHeader("#header-container");
loadDetail();
```

이 순서를 지키면 모든 페이지가 **같은 구조**를 가지게 되어, 나중에 코드를 읽을 때 "어디에 뭐가 있는지" 바로 파악할 수 있습니다.

---

## 8. 자주 하는 실수와 해결법

### 실수 1: 하나의 JS 파일에 모든 것을 넣는다

```js
// BAD: 하나의 파일에 API + 렌더링 + 이벤트 + 상수 + 유틸리티가 전부 있음
const GENRE_MAP = { ... };                    // 상수
const token = localStorage.getItem("...");    // 유틸리티
const res = await fetch("/api/movies");       // API 호출
document.getElementById("...").innerHTML = `  // 렌더링
  <div>...</div>
`;
form.addEventListener("submit", () => { });   // 이벤트
```

```js
// GOOD: 역할별로 나누고, 페이지 파일에서 조합
import { GENRE_MAP } from "../constants/genre.js";       // 상수
import { getMainList } from "../API/main_list.js";       // API
import { renderMovieCard } from "../components/movieCard.js"; // 컴포넌트

const data = await getMainList();
document.getElementById("grid").innerHTML =
  data.map(renderMovieCard).join("");
```

### 실수 2: 파일을 너무 잘게 쪼갠다

```
// BAD: 파일이 너무 많으면 오히려 헷갈림
utils/
├── addOne.js           ← export const addOne = (n) => n + 1;
├── isEven.js           ← export const isEven = (n) => n % 2 === 0;
├── capitalize.js       ← export const capitalize = (s) => s[0].toUpperCase() + s.slice(1);
└── formatDate.js       ← export const formatDate = (d) => ...
```

```
// GOOD: 관련 있는 것끼리 한 파일에
utils/
├── auth.js             ← 토큰 관련 함수 3~4개
└── format.js           ← 포맷팅 관련 함수 2~3개
```

**핵심 규칙: 한 파일에 함수가 1개뿐이라면, 너무 잘게 나눈 것입니다.**

### 실수 3: import 경로가 너무 복잡하다

```js
// BAD: ../를 몇 번 써야 하는지 세다가 틀림
import { GENRE_MAP } from "../../../constants/genre.js";
```

```js
// GOOD: vite.config.js에 설정된 @ 별칭 활용
import { GENRE_MAP } from "@/constants/genre.js";
```

우리 프로젝트는 이미 `@`가 `src/`를 가리키도록 설정되어 있습니다! (vite.config.js 참조)
적극적으로 활용하세요.

### 실수 4: 네이밍 컨벤션이 섞인다

```
// BAD: snake_case와 camelCase가 혼재
main_list.js     ← snake_case
movieCard.js     ← camelCase
genre_more.js    ← snake_case
```

```
// GOOD: 하나의 규칙으로 통일 (camelCase 권장)
mainList.js
movieCard.js
genreMore.js
```

또는 현재 프로젝트처럼 snake_case로 통일해도 됩니다. **중요한 건 섞지 않는 것**입니다.

우리 프로젝트에서는 이미 페이지 폴더에 snake_case를 쓰고 있으니, 
**페이지 폴더/파일은 snake_case**, **컴포넌트/유틸은 camelCase**로 구분하는 것도 하나의 방법입니다.

---

## 한줄 요약

| 원칙 | 설명 |
|------|------|
| 같은 코드가 2번 나오면 | → 별도 파일로 분리 |
| 역할이 다르면 | → 다른 파일에 |
| 상수는 한 곳에 | → `constants/` 폴더 |
| API 공통 로직은 한 곳에 | → `API/client.js` |
| 재사용 UI는 한 곳에 | → `components/` 폴더 |
| 도구 함수는 한 곳에 | → `utils/` 폴더 |
| import 경로가 길면 | → `@/` 별칭 사용 |

이 가이드의 개선 제안을 한꺼번에 적용할 필요는 없습니다.
**하나씩, 새 기능을 만들 때마다 조금씩** 적용해보세요!
