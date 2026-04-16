# Bui1d-UP 6차 리뷰 — 해결 가이드 (2026-04-15)

> **리뷰 날짜**: 2026-04-15
> **대상**: develop 브랜치
> **원본 리뷰**: [code-review-20260415.md](./code-review-20260415.md)
> **이전 해결 가이드**: [code-review-20260409-guide.md](./code-review-20260409-guide.md)

이 문서는 원본 리뷰에서 지적한 **새로 발견된** Critical/Improvement 항목에 대해
**수정 전 → 수정 후** 코드와 **왜 그렇게 고쳐야 하는지**를 설명해요.

지난 리뷰에서 이미 지적되었지만 아직 해결되지 않은 항목은 **이전 해결 가이드를 참고**해주세요.

---

## 목차 (쉬운 순서대로)

- [6-1. mypage.js 중복 import 제거](#6-1-mypagejs-중복-import-제거) ⭐ 가장 먼저!
- [6-8. delete.js 함수 이름 오타 수정 + 에러 throw](#6-8-deletejs-함수-이름-오타-수정--에러-throw)
- [6-4. upload.js/edit.js의 API URL을 환경변수로](#6-4-uploadjseditjs의-api-호출을-apiparagraphapi로-분리) (또는 API 파일로 분리)
- [6-5. header.html 삭제 또는 수정](#6-5-headerhtml-삭제-또는-수정)
- [6-6. edit.js 변수 선언 순서 고치기](#6-6-editjs-변수-선언-순서-고치기)
- [6-I1. mypage.js onclick → addEventListener](#6-i1-mypagejs-onclick--addeventlistener)
- [6-I2. upload/edit.js 전역 접근을 명시적 getElementById로](#6-i2-uploadeditjs-전역-접근을-명시적-getelementbyid로)
- [6-I3. mypage.js showToast 정적 Tailwind 클래스 매핑](#6-i3-mypagejs-showtoast-정적-tailwind-클래스-매핑)
- [6-3. upload/edit HTML을 Tailwind로 전환하고 중복 제거](#6-3-uploadedit-html을-tailwind로-전환하고-중복-제거) (도전 과제)
- [6-2. landing.html을 Tailwind로 전환](#6-2-landinghtml을-tailwind로-전환) (도전 과제)

---

## 6-1. mypage.js 중복 import 제거

### 문제

`src/mypage/mypage.js` 파일 16번째 줄에 `setupInput, setupToggle`이 **두 번째로** import되고 있습니다. ES Modules에서 같은 이름을 두 번 import하면 `SyntaxError`가 나서 페이지 전체가 실행되지 않아요.

### 해결 방법

**Step 1.** `src/mypage/mypage.js` 파일을 엽니다.

**Step 2.** 16번째 줄을 **삭제**합니다.

```javascript
// 수정 전 (src/mypage/mypage.js 1~16번째 줄)
import { requireAuth } from "@/utils/auth.js";
requireAuth();

import {
  setupInput,
  setupToggle,
  setupPasswordCheck,
} from "../components/input.js";
import { getProfileNickname } from "../API/accountAPI/nickname.js";
import { changeNickname } from "../API/mypageAPI/changeNickname.js";
import { changePassword } from "../API/mypageAPI/changePassword.js";
import { changeEmail } from "../API/mypageAPI/changeEmail.js";
import { sendEmailCode } from "../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../API/accountAPI/checkEmailCode.js";
import { withdraw } from "../API/accountAPI/withdraw.js";
import { setupInput, setupToggle } from "../components/input.js";  // ← 이 줄 삭제!
```

```javascript
// 수정 후
import { requireAuth } from "@/utils/auth.js";
requireAuth();

import {
  setupInput,
  setupToggle,
  setupPasswordCheck,
} from "../components/input.js";
import { getProfileNickname } from "../API/accountAPI/nickname.js";
import { changeNickname } from "../API/mypageAPI/changeNickname.js";
import { changePassword } from "../API/mypageAPI/changePassword.js";
import { changeEmail } from "../API/mypageAPI/changeEmail.js";
import { sendEmailCode } from "../API/accountAPI/sendEmailCode.js";
import { checkEmailCode } from "../API/accountAPI/checkEmailCode.js";
import { withdraw } from "../API/accountAPI/withdraw.js";
```

**Step 3.** 브라우저에서 `/src/mypage/mypage.html`을 열어 개발자 도구(F12) 콘솔에 `SyntaxError`가 없는지 확인합니다.

> **쉽게 말하면**: 같은 책을 책장에 두 번 꽂으려 하면 "이 책은 이미 있어!" 하고 책장이 거부하는 것과 같아요. 한 번만 꽂아두면 됩니다.

---

## 6-8. delete.js 함수 이름 오타 수정 + 에러 throw

### 문제

`src/API/paragraphAPI/delete.js`의 함수 이름이 `deletePatagraph`로 오타가 있고, `catch` 블록에서 에러를 `console.error`만 하고 조용히 넘겨서 호출자가 실패를 감지할 수 없어요.

### 해결 방법

**Step 1.** `src/API/paragraphAPI/delete.js`를 아래 내용으로 교체합니다.

```javascript
// 수정 전 (src/API/paragraphAPI/delete.js)
export const deletePatagraph = async (postId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/movies/${postId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
```

```javascript
// 수정 후
export const deleteParagraph = async (postId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/movies/${postId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`영화 삭제에 실패했습니다. (status: ${response.status})`);
  }

  return response.json();
};
```

**Step 2.** `src/main/detail/detail.js`에서 import 이름과 사용 부분을 함께 고칩니다.

```javascript
// 수정 전 (detail.js:5)
import { deletePatagraph } from "../../API/paragraphAPI/delete.js";

// 수정 전 (detail.js:149~162)
document.getElementById("delete_btn").addEventListener("click", async () => {
  if (!postId) {
    console.error("postId가 없습니다.");
    return;
  }
  if (!confirm("정말로 삭제하시겠습니까?")) return;

  const res = await deletePatagraph(postId);
  if (res) {
    alert("영화가 삭제되었습니다. 메인화면으로 이동합니다.");
    window.location.href = "../../main_list/main_list.html";
  }
});
```

```javascript
// 수정 후
import { deleteParagraph } from "../../API/paragraphAPI/delete.js";

// ...

document.getElementById("delete_btn").addEventListener("click", async () => {
  if (!postId) return;
  if (!confirm("정말로 삭제하시겠습니까?")) return;

  try {
    await deleteParagraph(postId);
    alert("영화가 삭제되었습니다. 메인화면으로 이동합니다.");
    window.location.href = "/src/main/main_list/main_list.html";
  } catch (error) {
    alert(error.message ?? "삭제에 실패했습니다.");
  }
});
```

> **쉽게 말하면**:
> - 오타는 지도 위의 엉뚱한 지명과 같아요. 길을 찾는 사람이 헤맵니다.
> - `catch` 안에서 `console.error`만 하면 "조용히 실패"하는 거라, 사용자는 왜 안 되는지 알 수 없어요. 에러는 반드시 **위로 전달(throw)** 하거나 **UI로 알려야** 합니다.

---

## 6-4. upload.js/edit.js의 API 호출을 API/paragraphAPI로 분리

### 문제

`src/paragraph/upload/upload.js:4`와 `src/paragraph/edit/edit.js:4`가 API URL을 직접 하드코딩하고 있고, 이미지 업로드도 마찬가지입니다.

### 해결 방법 (쉬운 버전: URL만 환경변수로)

**Step 1.** `upload.js`와 `edit.js`의 상단에서 API 상수를 환경변수로 바꿉니다.

```javascript
// 수정 전 (upload.js:4)
const API = "https://api.fullstackfamily.com/api/buildup/v1/movies";

// 수정 후
const API = `${import.meta.env.VITE_API_BASE_URL}/movies`;
```

**Step 2.** 이미지 업로드 부분도 수정합니다.

```javascript
// 수정 전 (upload.js:68~77)
const imgRes = await fetch(
  "https://api.fullstackfamily.com/api/buildup/v1/movies/images",
  {
    method: "POST",
    headers: { Authorization: `Bearer ${accesstoken}` },
    body: formData,
  },
);

// 수정 후
const imgRes = await fetch(`${API}/images`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accesstoken}` },
  body: formData,
});
```

`edit.js:125`도 똑같이 고쳐주세요.

### 해결 방법 (권장 버전: API 파일로 분리)

**Step 1.** `src/API/paragraphAPI/createMovie.js`를 새로 만듭니다.

```javascript
// src/API/paragraphAPI/createMovie.js
const BASE = `${import.meta.env.VITE_API_BASE_URL}/movies`;

function authHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

export async function uploadMovieImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/images`, {
    method: "POST",
    headers: authHeader(),
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "이미지 업로드 실패");
  }

  const json = await res.json();
  return json.data.imageUrl;
}

export async function createMovie(body) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "영화 등록 실패");
  }

  return res.json();
}
```

**Step 2.** `upload.js`는 이제 API 호출 로직이 없어지고 UI만 담당합니다.

```javascript
// upload.js (단순화)
import { requireAuth } from "@/utils/auth.js";
import { createMovie, uploadMovieImage } from "@/API/paragraphAPI/createMovie.js";
requireAuth();

// ... DOM 참조 ...

async function handleSubmit() {
  try {
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    let imageUrl = "";
    if (file) {
      imageUrl = await uploadMovieImage(file);
    } else {
      imageUrl = document.getElementById("poster").value || "";
    }

    const body = {
      title: titleInput.value,
      genre: document.querySelector("input[name=genre]:checked")?.value,
      content: contentInput.value,
      star: Number(rating),
      imageUrl,
      // ... 나머지 ...
    };

    await createMovie(body);
    alert("등록 완료!");
    location.href = "/src/main/main_list/main_list.html";
  } catch (error) {
    alert(error.message ?? "등록 실패");
  }
}

document.getElementById("submit-btn").addEventListener("click", handleSubmit);
```

`edit.js`도 비슷한 방식으로 `src/API/paragraphAPI/updateMovie.js`를 만들어서 옮기면 돼요.

> **쉽게 말하면**: `upload.js`는 **화면의 주방장**이고, `createMovie.js`는 **장을 봐오는 심부름꾼**이에요. 주방장이 장도 봐오고 요리도 하면 주방이 너무 바쁘고, 심부름꾼이 주문까지 받으면 헷갈리죠. 각자 할 일만 하도록 나누세요.

---

## 6-5. header.html 삭제 또는 수정

### 문제

`src/main/header/header.html`의 `<a>` 태그 닫는 부분이 `<a/>`로 잘못 작성되어 있고, 실제로는 `header.js`의 `renderHeader()` 함수가 HTML을 동적으로 만들어 삽입하기 때문에 `header.html` 자체가 사용되지 않아요.

### 해결 방법 A — 삭제 (권장)

```bash
# 터미널에서
rm src/main/header/header.html
```

### 해결 방법 B — 디자인 참고용으로 남기는 경우

문법을 올바르게 고치고 파일 상단에 주석으로 **"사용하지 않는 디자인 참고용"** 임을 명시합니다.

```html
<!-- 수정 전 (header.html:36~47) -->
<a href="/upload.html" class="nav-btn nav-btn--red" id="btn-new-post">
  <img src="/Add_round.svg" alt="새 포스트" />
  <span class="btn-label">새 포스트</span>
<a/>
<a href="/mypage.html" class="nav-btn" id="btn-myinfo">
  <img src="/myinfo.png" alt="내 정보" />
  <span class="btn-label" id="nickname"></span>
<a/>
```

```html
<!-- 수정 후 -->
<!--
  이 파일은 실제로 로드되지 않는 "디자인 참고용" 스냅샷입니다.
  실제 헤더는 header.js의 renderHeader()가 동적으로 삽입합니다.
-->
<a href="/upload.html" class="nav-btn nav-btn--red" id="btn-new-post">
  <img src="/Add_round.svg" alt="새 포스트" />
  <span class="btn-label">새 포스트</span>
</a>
<a href="/mypage.html" class="nav-btn" id="btn-myinfo">
  <img src="/myinfo.png" alt="내 정보" />
  <span class="btn-label" id="nickname"></span>
</a>
```

> **쉽게 말하면**: 쓰지 않는 파일이 프로젝트에 남아 있으면 "이것도 봐야 하나?" 하고 혼란을 줘요. 쓸 거면 정확하게 쓰고, 안 쓸 거면 지우세요.

---

## 6-6. edit.js 변수 선언 순서 고치기

### 문제

`src/paragraph/edit/edit.js`에서 `getMovie()`가 **파일 앞쪽에서 호출**되지만, 그 안에서 사용하는 `directorList`, `actorsList`, `directorContainer`, `actorsContainer`는 **파일 뒤쪽에서 선언**됩니다. `await fetch()` 때문에 지금은 운 좋게 동작하지만, 매우 위태로운 상태예요.

### 해결 방법

**Step 1.** 파일 상단으로 DOM 참조와 배열 선언을 옮깁니다.

```javascript
// 수정 후 edit.js 구조 (권장)
import { requireAuth, getToken, redirectOnAuthFail } from "@/utils/auth.js";
requireAuth();

const API = `${import.meta.env.VITE_API_BASE_URL}/movies`;
const token = getToken();

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

// === DOM 참조 (한 곳에 모음) ===
const posterInput = document.getElementById("poster");
const previewImg = document.getElementById("preview");
const titleInput = document.getElementById("title");
const yearInput = document.getElementById("year");
const ratingRange = document.getElementById("ratingRange");
const ratingText = document.getElementById("ratingValue");
const descInput = document.getElementById("description");
const descCount = document.getElementById("descCount");
const contentInput = document.getElementById("content");
const contentCount = document.getElementById("contentCount");
const directorInput = document.getElementById("director");
const directorContainer = document.getElementById("director-bubbles");
const actorsInput = document.getElementById("actors");
const actorsContainer = document.getElementById("actors-bubbles");
const cancelBtn = document.getElementById("cancelBtn");
const fileInput = document.getElementById("file");

// === 상태 (한 곳에 모음) ===
let rating = 0;
let directorList = [];
let actorsList = [];

// === 함수 정의 ===
async function getMovie() {
  // ... 이제 위 변수들을 안전하게 사용할 수 있어요 ...
}

function addDirectorBubble(name) { ... }
function addActorBubble(name) { ... }
// ...

// === 이벤트 리스너 등록 ===
ratingRange.addEventListener("input", ...);
posterInput.addEventListener("input", ...);
fileInput.addEventListener("change", ...);
// ...

// === 실행 ===
getMovie();
```

> **쉽게 말하면**: 요리를 할 때도 **재료를 먼저 꺼내놓고** 요리를 시작하잖아요? 코드도 같아요. 변수부터 다 꺼내놓고, 함수를 정의하고, 마지막에 실행하는 순서가 깔끔합니다.

---

## 6-I1. mypage.js onclick → addEventListener

### 문제

`mypage.html`에 `onclick="handleEmailChange()"`, `onclick="handlePasswordChange()"`, `onclick="handleNicknameChange()"`, `onclick="openWithdrawDialog()"`, `onclick="history.back()"`이 있고, `mypage.js`에서 `window.handleXxx = function() {}` 식으로 전역에 함수를 등록하고 있어요.

### 해결 방법

**Step 1.** `mypage.html`의 버튼에 `id`를 추가하고 `onclick`을 제거합니다.

```html
<!-- 수정 전 -->
<button onclick="history.back()" class="...">뒤로가기</button>
<!-- ... -->
<button onclick="handleEmailChange()" class="...">이메일 변경하기</button>
<!-- ... -->
<button onclick="handlePasswordChange()" class="...">비밀번호 변경하기</button>
<!-- ... -->
<button onclick="handleNicknameChange()" class="...">닉네임 변경하기</button>
<!-- ... -->
<button onclick="openWithdrawDialog()" class="...">회원탈퇴</button>
```

```html
<!-- 수정 후 -->
<button id="btn-back" class="...">뒤로가기</button>
<!-- ... -->
<button id="btn-change-email" class="...">이메일 변경하기</button>
<!-- ... -->
<button id="btn-change-password" class="...">비밀번호 변경하기</button>
<!-- ... -->
<button id="btn-change-nickname" class="...">닉네임 변경하기</button>
<!-- ... -->
<button id="btn-open-withdraw" class="...">회원탈퇴</button>
```

**Step 2.** `mypage.js`의 `window.handleXxx = ...`를 일반 함수로 바꾸고, 파일 아래쪽에서 `addEventListener`로 연결합니다.

```javascript
// 수정 전
window.handleEmailChange = async function () {
  if (!isEmailVerified) { ... }
  // ...
};

window.handlePasswordChange = async function () { ... };
window.handleNicknameChange = async function () { ... };
window.openWithdrawDialog = function () {
  withdrawDialog.showModal();
};
```

```javascript
// 수정 후
async function handleEmailChange() {
  if (!isEmailVerified) {
    showToast("인증을 먼저 완료해주세요.", "error");
    return;
  }
  // ... 기존 내용 그대로 ...
}

async function handlePasswordChange() { /* 기존 내용 */ }
async function handleNicknameChange() { /* 기존 내용 */ }
function openWithdrawDialog() { withdrawDialog.showModal(); }

// === 이벤트 바인딩 (파일 하단) ===
document.getElementById("btn-back").addEventListener("click", () => history.back());
document.getElementById("btn-change-email").addEventListener("click", handleEmailChange);
document.getElementById("btn-change-password").addEventListener("click", handlePasswordChange);
document.getElementById("btn-change-nickname").addEventListener("click", handleNicknameChange);
document.getElementById("btn-open-withdraw").addEventListener("click", openWithdrawDialog);
```

> **쉽게 말하면**: HTML은 **종이 설계도**, JS는 **전선**이에요. 설계도에 전선을 직접 그려 넣으면(=`onclick`) 나중에 전선만 다시 연결하기가 힘들어요. 전선은 전선대로 JS 파일에 모아두세요.

---

## 6-I2. upload/edit.js 전역 접근을 명시적 getElementById로

### 문제

`upload.js`, `edit.js`에서 `title.value`, `year.value`, `content.value`, `poster.value`처럼 변수 선언 없이 사용하는 부분이 있어요. 이것은 브라우저의 **Named Access on Window** 기능 덕분에 우연히 동작합니다.

### 해결 방법

파일 상단에 DOM 참조를 **이름을 명확히** 선언하세요.

```javascript
// 수정 전 (upload.js:92~114)
const genre = document.querySelector("input[name=genre]:checked")?.value;
if (!title.value.trim()) { ... }
if (!content.value.trim()) { ... }

const body = {
  title: title.value,
  genre: genre,
  content: content.value,
  star: Number(rating),
  imageUrl: imageUrl || "",
  year: year.value ? Number(year.value) : undefined,
  // ...
};
```

```javascript
// 수정 후 — 파일 상단
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const yearInput = document.getElementById("year");
const descInput = document.getElementById("description");

// 그리고 아래에서는...
const genre = document.querySelector("input[name=genre]:checked")?.value;
if (!titleInput.value.trim()) { ... }
if (!contentInput.value.trim()) { ... }

const body = {
  title: titleInput.value,
  genre,
  content: contentInput.value,
  star: Number(rating),
  imageUrl: imageUrl || "",
  year: yearInput.value ? Number(yearInput.value) : undefined,
  famousLine: descInput.value || undefined,
  // ...
};
```

> **쉽게 말하면**: `title`이라는 이름은 탭 이름(`document.title`), 영화 제목, 책 제목 등 너무 많은 뜻이 있어요. `titleInput`이라고 쓰면 "아, 이건 입력 요소구나" 하고 바로 알 수 있습니다.

---

## 6-I3. mypage.js showToast 정적 Tailwind 클래스 매핑

### 문제

`mypage.js`의 `showToast` 함수가 `${bgColor}` 같은 템플릿 문자열로 Tailwind 클래스를 조립하는데, Tailwind v4 JIT가 실제 사용을 감지하지 못해 **빌드 시 해당 클래스가 빠질 위험**이 있어요.

### 해결 방법

클래스 전체 문자열을 미리 맵으로 만들어 두세요.

```javascript
// 수정 전 (mypage.js:56~72)
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  toast.className = `${bgColor} px-6 py-3 rounded-lg text-white text-sm font-medium opacity-0 transition-opacity duration-300 whitespace-nowrap`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() =>
    toast.classList.replace("opacity-0", "opacity-100"),
  );
  setTimeout(() => {
    toast.classList.replace("opacity-100", "opacity-0");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 2000);
}
```

```javascript
// 수정 후
const TOAST_STYLES = {
  success:
    "bg-green-600 px-6 py-3 rounded-lg text-white text-sm font-medium opacity-0 transition-opacity duration-300 whitespace-nowrap",
  error:
    "bg-red-600 px-6 py-3 rounded-lg text-white text-sm font-medium opacity-0 transition-opacity duration-300 whitespace-nowrap",
};

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = TOAST_STYLES[type] ?? TOAST_STYLES.success;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() =>
    toast.classList.replace("opacity-0", "opacity-100"),
  );
  setTimeout(() => {
    toast.classList.replace("opacity-100", "opacity-0");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 2000);
}
```

> **쉽게 말하면**: Tailwind는 **검색 엔진** 같아서, 코드 파일을 훑어보며 "여기 `bg-green-600`이 있네" 하고 찾아요. 이 클래스가 `"bg-" + color` 식으로 잘려 있으면 검색에 걸리지 않아 빠져버립니다. 완성된 상태로 적어두세요.

---

## 6-3. upload/edit HTML을 Tailwind로 전환하고 중복 제거

### 문제

`upload.html`과 `edit.html`이 300줄 가까운 커스텀 `<style>`을 가지고 있고, 서로 95% 동일합니다.

### 해결 방법 (단계별)

이 작업은 큰 도전 과제예요. 아래 순서대로 천천히 진행하세요.

**Step 1. 공통 HTML을 템플릿 함수로 추출**

`src/paragraph/_template.js` 같은 파일을 만들어 폼 HTML을 반환하는 함수를 정의합니다.

```javascript
// src/paragraph/_template.js
export function renderMovieForm({ title, submitLabel, backHref }) {
  return `
    <div class="max-w-6xl mx-auto p-8 text-white">
      <div class="flex items-center gap-4 border-b border-neutral-800 pb-3 mb-5">
        <button id="btn-back" class="text-neutral-400 hover:text-white text-sm">← 나가기</button>
        <span class="text-xl font-bold">${title}</span>
      </div>

      <div class="flex flex-col md:flex-row gap-10">
        <!-- 좌측 -->
        <div class="flex-1 flex flex-col gap-2.5 max-w-md">
          <label class="block mt-2.5">포스터 URL</label>
          <input id="poster" class="w-full bg-neutral-900 rounded-md px-2.5 py-2.5 text-white border border-transparent focus:border-red-600 outline-none" placeholder="이미지 URL 입력" />
          <input type="file" id="file" class="mt-2" />
          <div class="relative w-full max-w-xs">
            <img id="preview" class="w-full aspect-[2/3] bg-neutral-800 object-cover rounded-md block" />
            <span class="preview-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">이미지를 드래그하세요</span>
          </div>
          <!-- ... 제목, 별점, 연도, 장르, 감독, 출연진 ... -->
        </div>

        <!-- 우측 -->
        <div class="flex-1 flex flex-col gap-2.5 md:min-h-[500px]">
          <!-- 명대사, 후기 -->
        </div>
      </div>

      <div class="mt-8 text-right">
        <button type="button" id="btn-cancel" class="bg-neutral-700 text-white px-5 py-2.5 rounded-md mr-2.5">취소</button>
        <button type="button" id="btn-submit" class="bg-red-600 text-white px-5 py-2.5 rounded-md">${submitLabel}</button>
      </div>
    </div>
  `;
}
```

**Step 2. upload.html / edit.html 단순화**

```html
<!-- upload.html (수정 후) -->
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>포스트 등록</title>
    <link rel="stylesheet" href="/src/styles/theme.css" />
  </head>
  <body class="bg-neutral-950 text-white min-h-screen">
    <div id="form-root"></div>
    <script type="module" src="./upload.js"></script>
  </body>
</html>
```

**Step 3. upload.js에서 템플릿 주입**

```javascript
// upload.js (수정 후)
import { requireAuth } from "@/utils/auth.js";
import { renderMovieForm } from "../_template.js";
import { createMovie, uploadMovieImage } from "@/API/paragraphAPI/createMovie.js";
requireAuth();

document.getElementById("form-root").innerHTML = renderMovieForm({
  title: "새 영화 추가",
  submitLabel: "등록하기",
});

// 이제 DOM 참조를 선언하고 이벤트 바인딩 ...
```

**Step 4. edit.html / edit.js도 같은 방식으로 단순화**

```javascript
// edit.js (수정 후)
import { requireAuth } from "@/utils/auth.js";
import { renderMovieForm } from "../_template.js";
import { getMovie, updateMovie } from "@/API/paragraphAPI/updateMovie.js";
requireAuth();

document.getElementById("form-root").innerHTML = renderMovieForm({
  title: "영화 수정",
  submitLabel: "수정하기",
});

// 공통: DOM 참조, 이벤트 바인딩, 별점, 드래그앤드롭, 버블 UI
// 차이: getMovie() 호출로 기존 데이터 채우기
```

> **쉽게 말하면**: 쌍둥이 페이지가 있을 때, **두 페이지를 각자 꾸미는 대신** 하나의 공통 디자인을 만들고 "이 부분만 다르게" 전달하세요. 이것이 프로그래밍에서 말하는 **DRY(Don't Repeat Yourself)** 원칙입니다.

---

## 6-2. landing.html을 Tailwind로 전환

### 문제

`landing.html`에 `<style>` 280줄, `<script>` 인라인, `onclick` 속성이 모두 있고 Tailwind를 전혀 사용하지 않아요.

### 해결 방법 (핵심 부분만)

**Step 1.** `landing.html` 구조를 단순화하고 Tailwind 클래스로 교체합니다.

```html
<!-- 수정 후 landing.html (요약) -->
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bui1dBox</title>
    <link rel="stylesheet" href="/src/styles/theme.css" />
  </head>
  <body class="bg-black text-white font-sans">
    <section class="relative h-screen overflow-hidden bg-black">
      <!-- 포스터 배경 그리드 -->
      <div class="poster-bg pointer-events-none absolute -top-[15%] -left-[15%] w-[130%] h-[130%] grid grid-cols-6 auto-rows-[220px] gap-4 -rotate-[10deg] scale-[1.15]">
        <img src="../assets/icons/poster01.jpg" class="w-full h-[220px] object-cover rounded-xl opacity-70 transition-all hover:opacity-100 hover:scale-105" alt="" />
        <!-- ... poster02~30 ... -->
      </div>

      <!-- 어두운 오버레이 -->
      <div class="absolute inset-0 bg-black/70 pointer-events-none z-[1]"></div>

      <!-- 헤더 -->
      <header class="absolute top-5 left-5 right-5 md:left-10 md:right-10 flex justify-between items-center z-[9999]">
        <button id="btn-home" class="flex items-center gap-2" aria-label="홈으로">
          <img src="/bui1d-boxLogo.png" alt="Bui1dBox 로고" class="h-10" />
          <img src="/Bui1dBox.png" alt="Bui1dBox" class="h-6 hidden sm:block" />
        </button>
        <button id="btn-signup" class="border border-white bg-transparent text-white px-3.5 py-1.5 rounded-md hover:bg-white hover:text-black transition">
          회원가입
        </button>
      </header>

      <!-- 중앙 콘텐츠 -->
      <div class="relative z-[2] h-full flex flex-col justify-center items-center text-center px-5 animate-fade-up">
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-5">나만의 영화 기록장</h1>
        <p class="text-sm md:text-base text-neutral-300 mb-8 leading-relaxed">
          본 영화를 기록하고, 추억하고, 공유하세요.<br />
          당신만의 영화 컬렉션을 만들어보세요.
        </p>
        <button id="btn-start" class="bg-red-600 hover:bg-red-500 hover:scale-105 hover:shadow-[0_10px_20px_rgba(255,0,0,0.3)] px-7 py-3 rounded-md text-white text-base transition-all duration-300">
          로그인을 해주세요
        </button>
        <p class="text-xs text-neutral-400 mt-4 opacity-80">이미 500명 이상이 사용 중입니다</p>
      </div>
    </section>

    <script type="module" src="./landing.js"></script>
  </body>
</html>
```

**Step 2.** 애니메이션과 반복되는 포스터 렌더링은 `landing.js`로 옮깁니다.

```javascript
// src/landing/landing.js (새 파일)
// 30개 포스터를 반복문으로 렌더링
const grid = document.querySelector(".poster-bg");
grid.innerHTML = "";
for (let i = 1; i <= 30; i++) {
  const num = String(i).padStart(2, "0");
  const img = document.createElement("img");
  img.src = `../assets/icons/poster${num}.jpg`;
  img.alt = "";
  img.className =
    "w-full h-[220px] object-cover rounded-xl opacity-70 transition-all hover:opacity-100 hover:scale-105";
  grid.appendChild(img);
}

// 이벤트 바인딩
document.getElementById("btn-home").addEventListener("click", () => {
  location.href = "./";
});
document.getElementById("btn-signup").addEventListener("click", () => {
  location.href = "/src/account/signup/signup.html";
});
document.getElementById("btn-start").addEventListener("click", () => {
  location.href = "/src/account/login/login.html";
});
```

**Step 3.** 커스텀 애니메이션(`@keyframes move`, `@keyframes fadeUp`)만 `src/landing/landing.css`에 최소한으로 남깁니다.

```css
/* src/landing/landing.css — 최소 커스텀 */
@reference "tailwindcss";

.poster-bg {
  animation: move 45s ease-in-out infinite alternate;
}

@keyframes move {
  0%   { transform: rotate(-10deg) translateY(200px) scale(1.2); }
  100% { transform: rotate(-10deg) translateY(-200px) scale(1.2); }
}

.animate-fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 1s ease forwards;
}

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
```

> **쉽게 말하면**: **색깔/여백/크기는 Tailwind**가 맡고, **애니메이션 키프레임처럼 Tailwind로 표현이 복잡한 것만 CSS 파일에 최소로 둡니다.** 이게 우리 프로젝트의 원칙이에요.

---

## 수정 우선순위 체크리스트

| 순서 | 항목 | 난이도 | 예상 시간 |
|------|------|--------|-----------|
| 1 | **6-1** mypage.js 중복 import 삭제 | 🟢 매우 쉬움 | 1분 |
| 2 | **6-5** main_list.js console.log 토큰 삭제 (이전 C-5) | 🟢 매우 쉬움 | 2분 |
| 3 | **6-8** delete.js 함수 이름 오타 + 에러 throw | 🟢 쉬움 | 5분 |
| 4 | **6-4** upload/edit API URL 환경변수로 | 🟢 쉬움 | 10분 |
| 5 | **6-5** header.html 삭제 또는 수정 | 🟢 쉬움 | 5분 |
| 6 | **6-I1** mypage.js onclick → addEventListener | 🟡 보통 | 30분 |
| 7 | **6-6** edit.js 변수 선언 순서 정리 | 🟡 보통 | 15분 |
| 8 | **6-I3** mypage.js showToast 정적 클래스 매핑 | 🟡 보통 | 10분 |
| 9 | **6-I2** upload/edit 전역 접근 → getElementById | 🟡 보통 | 30분 |
| 10 | **6-3** upload/edit HTML을 Tailwind로 전환 + 중복 제거 | 🔴 도전 | 3~4시간 |
| 11 | **6-2** landing.html을 Tailwind로 전환 | 🔴 도전 | 2~3시간 |
| 12 | 이전 C-6: XSS escape 유틸 | 🟡 보통 | 30분 |

---

## 마지막으로

한 번에 전부 하려고 하지 마세요. **1~5번까지(합쳐서 30분이면 충분)** 만 오늘 끝내도, 마이페이지가 정상 동작하고 토큰이 안전해집니다. 그것만으로도 프로젝트 품질이 크게 올라가요.

그 다음 주말에 6~9번을 정리하고, 긴 시간을 낼 수 있을 때 10~11번의 Tailwind 전환에 도전하세요.

**당신은 이미 지난 리뷰 이후 많은 것을 개선했습니다.** 이번에도 할 수 있어요! 💪
