# Bui1d-UP 6차 코드 리뷰 (2026-04-16)

> **대상**: develop 브랜치 (커밋 `ccd9d73` ~ `62f2d4b` 변경분)
> **리뷰 범위**: landing, mypage, 공통 input, 비밀번호 변경 API, header 마크업
> **목적**: 초보 개발자 기준으로 **응집도는 높이고, 결합도는 낮추는 방향**을 설명합니다
> **스타일 원칙**: CSS는 정말 필요한 경우에만 최소한으로 사용하고, 기본은 **Tailwind CSS 우선**

---

## 1. 이번 리뷰 요약

이번 변경분에서 가장 좋은 점은 `landing.html`에 있던 큰 `<style>`과 `<script>`를 바깥 파일로 분리한 것입니다. 이 방향 자체는 맞습니다.

하지만 비밀번호 변경 기능에서는 반대로 **응집도가 낮아지고 결합도가 높아진 부분**이 생겼습니다.

- `changePassword()`가 자기 역할(비밀번호 변경 요청)만 하지 않고, API 명세와 다른 형태로 요청을 보내고 있습니다.
- `mypage.js`가 원래는 몰라도 되는 `login()` 함수까지 가져와서 현재 비밀번호를 검증하고 있습니다.
- landing 페이지는 파일 분리는 되었지만, 여전히 **커스텀 CSS 비중이 너무 높고 Tailwind 중심 구조가 아닙니다.**

한 줄로 요약하면:

> **분리 자체는 좋아졌지만, 비밀번호 변경 흐름은 더 단단하게 다시 묶어야 하고, landing 페이지는 Tailwind 중심으로 한 번 더 정리해야 합니다.**

---

## 2. 잘한 점

### 2-1. landing 페이지의 HTML / CSS / JS 분리

**파일**

- `src/landing/landing.html`
- `src/landing/landing.css`
- `src/landing/landing.js`

기존에는 HTML 안에 스타일과 스크립트가 모두 들어 있었는데, 이번에는 파일을 분리했습니다.

이것은 좋은 시작입니다.

- HTML은 화면 구조에 집중
- CSS는 스타일에 집중
- JS는 동작에 집중

이렇게 나누면 나중에 수정 위치를 찾기 쉬워집니다.

### 2-2. mypage 접근성 보강

**파일**

- `src/mypage/mypage.html`
- `src/components/input.js`

아래와 같은 보강은 좋았습니다.

- `aria-hidden="true"` 추가
- `hidden` 속성으로 접힌 영역 상태 표현
- `aria-labelledby`, `aria-describedby` 추가
- `aria-invalid` 상태 추가

화면만 보이는 것이 아니라, 보조기기 사용자도 상태를 이해할 수 있게 만든 점은 좋습니다.

### 2-3. header 닫는 태그 수정

**파일**

- `src/main/header/header.html:36`
- `src/main/header/header.html:40`

`<a/>`를 `</a>`로 고친 것은 작은 수정처럼 보여도 중요합니다. 잘못 닫힌 태그는 브라우저가 억지로 보정하면서 예상하지 못한 레이아웃 문제를 만들 수 있습니다.

---

## 3. 반드시 고쳐야 할 문제 (Critical)

### C-1. 비밀번호 변경 API 요청 body가 명세와 다릅니다

**파일**

- `src/API/mypageAPI/changePassword.js:18`
- `Backend-API.md:1451`

현재 코드:

```javascript
body: JSON.stringify({ password: newPassword });
```

API 문서:

```json
{
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass2@"
}
```

즉, 프론트 코드와 API 명세가 서로 다릅니다.

#### 왜 문제인가요?

- 서버가 `currentPassword`와 `newPassword`를 기대하는데, 프론트는 `password` 하나만 보내고 있습니다.
- 이 경우 서버가 정상 처리하지 못할 수 있습니다.
- 더 큰 문제는, "현재 비밀번호 검증" 책임이 원래 `changePassword()` 안에 있어야 하는데 그 책임이 밖으로 새고 있다는 점입니다.

#### 응집도 / 결합도 관점

- `changePassword()`의 응집도가 낮아졌습니다.
  - 이름은 "비밀번호 변경"인데
  - 실제로는 "새 비밀번호 하나만 전달"하고 있습니다.
- API 명세와 강하게 어긋나 있어 결합도도 나빠졌습니다.
  - 서버 명세가 조금만 엄격해져도 바로 깨집니다.

#### 정리

이 부분은 이번 변경분에서 **가장 먼저 복구해야 하는 기능 회귀(regression)** 입니다.

---

### C-2. mypage가 login API를 끌어와 현재 비밀번호를 검증하고 있습니다

**파일**

- `src/mypage/mypage.js:16`
- `src/mypage/mypage.js:35`
- `src/mypage/mypage.js:55`
- `src/mypage/mypage.js:261-275`
- `src/API/accountAPI/login.js:17-18`

현재 흐름은 아래와 같습니다.

1. 프로필 조회 후 `profile.id`를 `userId`에 저장
2. 비밀번호 변경 버튼 클릭
3. `login(userId, currentPwd)` 호출로 현재 비밀번호를 먼저 확인
4. 그 다음 `changePassword()` 호출

겉보기에는 안전해 보이지만, 구조적으로 좋지 않습니다.

#### 왜 문제인가요?

- `mypage.js`가 비밀번호 변경을 위해 **로그인 API 내부 동작까지 알아야** 합니다.
- `login()`은 원래 로그인 화면에서 쓰는 함수인데, 여기서는 "현재 비밀번호 검사 도구"처럼 재사용되고 있습니다.
- `login()`은 성공 시 `localStorage.setItem("accessToken", json.data.token)`까지 수행합니다.
  - 즉, 검사용 호출인데도 토큰 저장이라는 **부수 효과(side effect)** 가 같이 일어납니다.

#### 실제로 생길 수 있는 문제

- `getProfileNickname()`이 실패해서 `userId`가 `null`이면, `login(null, currentPwd)`가 호출됩니다.
- 이 경우 사용자는 "현재 비밀번호가 틀렸습니다"라는 메시지를 보게 될 수 있습니다.
- 하지만 진짜 원인은 비밀번호가 아니라, **프로필 로드 실패 또는 잘못된 의존 구조**일 수 있습니다.

#### 응집도 / 결합도 관점

- `mypage.js`의 결합도가 높아졌습니다.
  - 마이페이지가 로그인 기능 구현 세부사항에 의존합니다.
- `login()` 함수의 응집도도 흐려졌습니다.
  - 로그인 함수가 "인증"과 "현재 비밀번호 검사" 두 역할처럼 사용되고 있습니다.

#### 정리

현재 비밀번호 검증은 **로그인 API를 우회 호출해서 해결할 문제**가 아닙니다.  
비밀번호 변경 API가 그 책임을 가지도록 다시 정리해야 합니다.

---

### C-3. landing 페이지가 여전히 커스텀 CSS 중심입니다

**파일**

- `src/landing/landing.css:1-190`
- `src/landing/landing.html:12-116`

파일 분리는 되었지만, landing 화면은 거의 전체가 일반 CSS로 작성되어 있습니다.

특히 아래가 눈에 띕니다.

- 전역 선택자 `*`, `body`, `header`
- 커스텀 클래스 다수 (`container`, `overlay`, `content`, `poster-bg`, `start-btn` 등)
- 반응형도 `@media`로 직접 작성

#### 왜 문제인가요?

이번 프로젝트의 원칙은 **"CSS는 어쩔 수 없이 사용할 때만 최소한"** 입니다.  
그런데 이번 landing은 반대로 **"대부분을 CSS로 만들고 Tailwind는 거의 쓰지 않는 구조"** 입니다.

#### 응집도 / 결합도 관점

- 화면 구조와 스타일 규칙이 Tailwind 유틸리티로 드러나지 않아서, HTML만 봐서는 어떤 레이아웃인지 이해가 어렵습니다.
- 비슷한 버튼이나 레이아웃을 다른 페이지에서 재사용하기도 어렵습니다.
- 나중에 디자인 톤을 맞출 때 landing만 따로 관리해야 해서 결합도가 높아집니다.

#### 정리

지금 상태는 "인라인 스타일을 파일 밖으로 뺀 것"에 가깝습니다.  
**진짜 목표는 분리 + Tailwind 중심 재구성** 입니다.

---

## 4. 개선하면 좋은 점 (Improvement)

### I-1. mypage가 여전히 inline `onclick` + `window.handle...` 패턴을 사용합니다

**파일**

- `src/mypage/mypage.html:84`
- `src/mypage/mypage.html:246`
- `src/mypage/mypage.html:489`
- `src/mypage/mypage.html:571`
- `src/mypage/mypage.html:582`
- `src/mypage/mypage.js:135`
- `src/mypage/mypage.js:227`
- `src/mypage/mypage.js:305`

예시:

```html
<button type="button" onclick="handleEmailChange()">이메일 변경하기</button>
```

```javascript
window.handleEmailChange = async function () { ... };
```

이 패턴은 초반에는 편하지만, 페이지가 커질수록 HTML과 JS가 서로 강하게 묶입니다.

#### 더 좋은 방향

- HTML에는 `id` 또는 `data-action`만 둡니다.
- JS에서 `addEventListener()`로 연결합니다.

그러면 HTML은 구조에 집중하고, JS는 동작에 집중할 수 있습니다.

---

### I-2. 현재 비밀번호 입력창의 성공 메시지가 너무 강합니다

**파일**

- `src/components/input.js:25`

현재 코드:

```javascript
ok: "확인되었습니다.",
```

하지만 현재 비밀번호 입력창은 blur 시점에 **형식만 검사**합니다.  
즉, 실제로 맞는 비밀번호인지 아직 서버에 확인하지 않았습니다.

그래서 `"확인되었습니다."`는 사용자를 헷갈리게 할 수 있습니다.

#### 더 좋은 문구

- `"형식이 맞습니다."`
- 또는 아예 빈 문구 유지

초보 개발자일수록 **"형식 검증"과 "정답 검증"은 다르다**는 점을 꼭 구분해야 합니다.

---

### I-3. landing 배경 포스터 이미지 30장이 `alt` 없이 들어가 있습니다

**파일**

- `src/landing/landing.html:14-43`

배경 장식용 이미지라면 스크린리더가 읽지 않도록 처리하는 편이 좋습니다.

현재는:

```html
<img src="../assets/icons/poster01.jpg" />
```

장식용이라면:

```html
<img src="../assets/icons/poster01.jpg" alt="" aria-hidden="true" />
```

#### 왜 중요한가요?

- 장식 이미지를 의미 있는 정보처럼 읽어버리면 접근성이 떨어집니다.
- 이미지가 30장이기 때문에 소음이 더 커집니다.

---

## 5. 파일별 한 줄 리뷰

### `src/API/mypageAPI/changePassword.js`

역할이 다시 선명해져야 합니다. 이 함수는 로그인 검증을 기대하면 안 되고, **비밀번호 변경 API 명세를 정확히 따르는 함수**여야 합니다.

### `src/mypage/mypage.js`

마이페이지에서 너무 많은 일을 하고 있습니다. 특히 비밀번호 변경 로직이 로그인 로직까지 알아야 하는 현재 구조는 결합도가 높습니다.

### `src/landing/landing.html`

분리 방향은 좋지만, Tailwind 기반 구조로 한 단계 더 가야 합니다. 지금은 "HTML 분리"는 되었지만 "Tailwind 설계"는 아직 아닙니다.

### `src/landing/landing.css`

CSS 파일을 만든 것 자체는 좋지만, 이 정도 분량이면 이미 "보조 수단"이 아니라 "주 설계 방식"이 되어버렸습니다. 프로젝트 규칙과 맞지 않습니다.

### `src/components/input.js`

접근성 속성 추가는 좋습니다. 다만 문구 하나가 사용자 의미를 바꿀 수 있으니, 성공 메시지는 더 정확하게 써야 합니다.

---

## 6. 우선순위 제안

수정은 아래 순서로 진행하는 것을 권장합니다.

1. `changePassword()` 요청 body를 API 문서와 맞춥니다.
2. `mypage.js`에서 `login()` 의존을 제거합니다.
3. landing 페이지를 Tailwind 중심으로 재작성하고, CSS는 애니메이션처럼 꼭 필요한 부분만 남깁니다.
4. `onclick` 패턴을 `addEventListener()` 방식으로 통일합니다.
5. 접근성 문구와 장식 이미지 처리를 다듬습니다.

---

## 7. 마무리

이번 변경분은 "코드를 밖으로 분리한다"는 첫 단계는 잘 시작했습니다.  
이제 다음 단계는 **각 파일이 자기 역할만 하도록 다시 좁히는 것**입니다.

특히 초보 개발자에게 가장 중요한 기준은 아래 두 가지입니다.

- **이 함수가 자기 일만 하고 있는가?** → 응집도
- **이 파일이 다른 파일의 내부 사정을 너무 많이 알고 있지는 않은가?** → 결합도

이번 리뷰에서는 비밀번호 변경 흐름이 이 두 기준에서 가장 많이 흔들렸습니다.  
반대로 landing 분리는 좋은 출발이었으니, 여기서 Tailwind 중심으로 한 번 더 정리하면 팀 코드 품질이 확실히 올라갈 수 있습니다.
