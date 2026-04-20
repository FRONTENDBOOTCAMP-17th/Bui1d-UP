# Bui1d-UP 6차 코드 리뷰 해결 가이드 (2026-04-16)

> **대상 문서**: [code-review-20260416.md](./code-review-20260416.md)
> **목적**: 초보 개발자가 리뷰 내용을 실제 수정으로 옮길 수 있도록 단계별로 안내합니다
> **원칙**: Tailwind CSS 우선, 커스텀 CSS 최소화, 함수는 자기 역할만 담당

---

## 1. 가장 먼저 고칠 것: 비밀번호 변경 API 요청 형태 복구

### 왜 가장 먼저인가요?

이건 스타일 문제가 아니라 **기능이 깨질 수 있는 문제**이기 때문입니다.

현재 코드:

```javascript
body: JSON.stringify({ password: newPassword });
```

고쳐야 할 코드:

```javascript
body: JSON.stringify({
  currentPassword: password,
  newPassword,
});
```

### 수정 위치

- `src/API/mypageAPI/changePassword.js`

### 수정 예시

```javascript
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("계정 인증에 문제가 있습니다. 다시 로그인해주세요.");
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(json?.errorCode ?? json?.message ?? "비밀번호 변경 실패");
  }

  return json;
};
```

### 핵심 포인트

- 함수 이름이 `changePassword`라면, 이 함수 안에서 **비밀번호 변경에 필요한 값**을 다 처리해야 합니다.
- 서버 명세와 다르게 보내면, 화면에서 아무리 열심히 검증해도 결국 깨집니다.

---

## 2. `mypage.js`에서 `login()` 의존 제거하기

### 지금 왜 구조가 안 좋은가요?

현재는 마이페이지가 로그인 함수를 가져와서 현재 비밀번호를 검사하고 있습니다.

```javascript
import { login } from "../API/accountAPI/login.js";
await login(userId, currentPwd);
```

이렇게 되면:

- 마이페이지가 로그인 함수 내부 동작을 알아야 하고
- 로그인 성공 시 토큰 저장까지 같이 일어나고
- 프로필에서 `id`를 못 가져오면 이상한 에러가 납니다

즉, **한 기능을 고치려다가 다른 기능까지 같이 알아야 하는 구조**가 됩니다.

### 어떻게 바꾸면 좋을까요?

정답은 간단합니다.

- 현재 비밀번호 검증은 `changePassword()` 응답으로 판단합니다.
- `mypage.js`는 입력값 모으기와 결과 표시만 담당합니다.

### 수정 방향

#### 수정 전

```javascript
await login(userId, currentPwd);
await changePassword(currentPwd, newPwd);
```

#### 수정 후

```javascript
await changePassword(currentPwd, newPwd);
```

그리고 에러가 왔을 때만 분기합니다.

```javascript
try {
  await changePassword(currentPwd, newPwd);
  showToast("비밀번호가 변경되었습니다.", "success");
} catch (error) {
  if (error.message === "PASSWORD_MISMATCH") {
    // 현재 비밀번호 안내 메시지 표시
  } else {
    showToast(error.message ?? "비밀번호 변경에 실패했습니다.", "error");
  }
}
```

### 꼭 기억할 점

**프론트에서 로그인 API를 한 번 더 때려서 현재 비밀번호를 확인하는 것은 좋은 해결책이 아닙니다.**

- 책임이 섞입니다.
- 네트워크 요청이 늘어납니다.
- 부수 효과가 생깁니다.

만약 서버가 정말 현재 비밀번호를 검증하지 않는다면, 그건 프론트 우회가 아니라 **백엔드 이슈로 공유해야 하는 문제**입니다.

---

## 3. landing 페이지를 Tailwind 중심으로 다시 만들기

### 지금 상태를 어떻게 봐야 하나요?

현재는 인라인 `<style>`을 `landing.css`로 옮긴 상태입니다.

이것도 분명 전보다 낫지만, 프로젝트 기준으로는 아직 부족합니다.

- 레이아웃
- 간격
- 색상
- 폰트 크기
- 정렬
- 반응형

이런 대부분을 Tailwind 클래스로 표현하는 것이 더 좋습니다.

### 목표

- HTML에서 구조와 스타일이 함께 읽히게 만들기
- CSS는 애니메이션, 아주 특수한 배경효과처럼 **유틸리티로 표현하기 어려운 것만** 남기기

### 바꾸는 방법

#### 1단계. HTML에 Tailwind 클래스 옮기기

예를 들어 현재 `.content` 관련 스타일은 아래처럼 HTML에서 바로 표현할 수 있습니다.

```html
<div class="relative z-20 flex h-full flex-col items-center justify-center px-5 text-center">
  <h1 class="mb-5 text-3xl font-bold md:text-5xl">나만의 영화 기록장</h1>
  <p class="mb-8 leading-6 text-zinc-300 md:text-base text-sm">
    본 영화를 기록하고, 추억하고, 공유하세요.<br />
    당신만의 영화 컬렉션을 만들어보세요.
  </p>
  <button
    id="loginBtn"
    class="rounded-md bg-red-600 px-7 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:bg-red-500"
  >
    로그인을 해주세요
  </button>
</div>
```

#### 2단계. 커스텀 CSS는 남겨야 할 것만 남기기

예를 들면 이런 것만 CSS에 둘 수 있습니다.

- `@keyframes move`
- 포스터 배경 특수 애니메이션

나머지:

- `display: flex`
- `padding`
- `margin`
- `font-size`
- `border-radius`
- `background`
- `text-align`

이런 것들은 먼저 Tailwind로 옮기는 습관을 들이면 좋습니다.

#### 3단계. 전역 선택자 줄이기

현재 CSS에는 이런 코드가 있습니다.

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}
```

이 방식은 너무 넓게 영향을 줍니다.

프로젝트 전체 폰트나 기본값은 공통 테마 파일에서 관리하고, landing 전용 파일에는 정말 필요한 범위만 남기는 편이 좋습니다.

---

## 4. `onclick` 대신 `addEventListener()`로 통일하기

### 왜 바꿔야 하나요?

현재 방식:

```html
<button type="button" onclick="handleNicknameChange()">닉네임 변경하기</button>
```

```javascript
window.handleNicknameChange = async function () { ... };
```

이 방식은 HTML이 JS 함수 이름을 직접 알아야 합니다.  
즉, HTML과 JS가 강하게 붙습니다.

### 추천 방식

#### HTML

```html
<button type="button" id="nickname-submit-btn">닉네임 변경하기</button>
```

#### JS

```javascript
const nicknameSubmitButton = document.getElementById("nickname-submit-btn");

nicknameSubmitButton.addEventListener("click", handleNicknameChange);

async function handleNicknameChange() {
  // ...
}
```

### 장점

- 함수가 전역(`window`)에 노출되지 않습니다.
- HTML은 구조만 담당합니다.
- JS 파일 안에서 이벤트 연결을 한눈에 볼 수 있습니다.

---

## 5. 현재 비밀번호 안내 문구를 정확하게 바꾸기

### 문제

`input.js`에서 현재 비밀번호가 정규식만 통과해도 `"확인되었습니다."`가 나옵니다.

하지만 이것은 "맞는 비밀번호"가 아니라 "형식이 맞는 문자열"일 뿐입니다.

### 추천 수정

#### 수정 전

```javascript
ok: "확인되었습니다.",
```

#### 수정 후

```javascript
ok: "형식이 맞습니다.",
```

또는

```javascript
ok: "",
```

### 왜 중요할까요?

초보 개발자일수록 아래 둘을 자주 섞습니다.

- 형식이 맞는가?
- 실제 정답인가?

이 둘은 전혀 다른 검사입니다.  
문구가 정확해야 사용자도 헷갈리지 않고, 개발자 본인도 로직을 덜 헷갈립니다.

---

## 6. 장식용 이미지는 장식용이라고 알려주기

### 수정 전

```html
<img src="../assets/icons/poster01.jpg" />
```

### 수정 후

```html
<img src="../assets/icons/poster01.jpg" alt="" aria-hidden="true" loading="lazy" />
```

### 왜 이렇게 하나요?

- `alt=""` : 스크린리더가 읽지 않도록 함
- `aria-hidden="true"` : 장식용 요소임을 더 분명히 전달
- `loading="lazy"` : 이미지가 많을 때 초기 로딩 부담 감소

배경을 꾸미는 이미지라면, "읽을 정보"가 아니라 "보이는 장식"이라고 알려주는 것이 맞습니다.

---

## 7. 추천 작업 순서

처음부터 한 번에 다 바꾸려고 하지 말고, 아래 순서대로 진행하면 됩니다.

1. `changePassword.js` 요청 body를 명세와 맞춥니다.
2. `mypage.js`에서 `login()` import와 관련 로직을 제거합니다.
3. 비밀번호 변경 실패 분기를 `changePassword()` 응답 기준으로 다시 만듭니다.
4. `mypage.html`의 `onclick` 버튼들에 `id`를 주고, JS에서 이벤트를 연결합니다.
5. `landing.html`의 구조를 Tailwind 클래스로 옮깁니다.
6. `landing.css`에는 애니메이션 같은 최소한의 코드만 남깁니다.
7. 장식용 이미지에 `alt=""`, `aria-hidden="true"`를 넣습니다.

---

## 8. 마지막 체크 질문

수정한 뒤에는 아래 질문에 스스로 답해보면 좋습니다.

1. 이 함수는 자기 일만 하나요?
2. 이 파일은 다른 파일의 내부 사정을 너무 많이 알고 있지 않나요?
3. 이 스타일은 Tailwind로 표현할 수 있는데 굳이 CSS로 쓴 것은 아닌가요?
4. 이 문구는 사용자가 오해하지 않게 정확한가요?

이 네 가지를 습관처럼 체크하면, 초보 단계에서도 코드 품질이 빠르게 좋아집니다.
