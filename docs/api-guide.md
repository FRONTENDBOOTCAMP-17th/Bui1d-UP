# Build-UP API 사용 가이드

> 작성: FullStackFamily 강사
> API 문서 페이지: https://www.fullstackfamily.com/buildup/api-docs

---

## 1. 개요

Build-UP 프론트엔드 프로젝트를 위한 **백엔드 REST API**가 준비되어 있습니다.
별도의 백엔드 개발 없이, 아래 API를 호출하여 프론트엔드를 구현할 수 있습니다.

### Base URL

```
https://api.fullstackfamily.com/api/buildup/v1
```

### 인터랙티브 API 문서

아래 페이지에서 각 API를 직접 호출해보고 응답을 확인할 수 있습니다.

**https://www.fullstackfamily.com/buildup/api-docs**

---

## 2. 빠른 시작

### Step 1: 이메일 인증코드 전송

```javascript
const res = await fetch('https://api.fullstackfamily.com/api/buildup/v1/email/code/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'myemail@gmail.com' })
});
const data = await res.json();
const uuid = data.data.uuid;
const code = data.data.code; // 교육용으로 응답에 직접 포함
```

### Step 2: 인증코드 확인

```javascript
await fetch('https://api.fullstackfamily.com/api/buildup/v1/email/code/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ uuid: uuid, checkCode: code })
});
```

### Step 3: 회원가입

```javascript
await fetch('https://api.fullstackfamily.com/api/buildup/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'myname',
    password: 'MyPass123!',
    email: 'myemail@gmail.com',
    nickname: 'movie_fan',
    uuid: uuid
  })
});
```

### Step 4: 로그인

```javascript
const loginRes = await fetch('https://api.fullstackfamily.com/api/buildup/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'myname', password: 'MyPass123!' })
});
const loginData = await loginRes.json();
const token = loginData.data.token;
```

### Step 5: 인증 필요한 API 호출

```javascript
const profileRes = await fetch('https://api.fullstackfamily.com/api/buildup/v1/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 3. 테스트 계정

| 아이디 | 비밀번호 | 용도 |
|--------|----------|------|
| `testuser` | `Test1234!` | 일반 테스트 |
| `moviefan` | `Movie1234!` | 일반 테스트 |

> 직접 회원가입하여 본인 계정을 사용하는 것을 권장합니다.

---

## 4. API 목록

### 4.1 이메일 인증

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/email/code/send` | X | 인증코드 전송 → uuid + code |
| POST | `/email/code/check` | X | 인증코드 확인 (uuid + checkCode) |

### 4.2 인증

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/auth/signup` | X | 회원가입 (인증된 uuid 필요) |
| POST | `/auth/login` | X | 로그인 → token + user |
| POST | `/auth/logout` | O | 로그아웃 |
| POST | `/auth/withdraw` | O | 회원 탈퇴 |

### 4.3 영화

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/movies/home` | X | 홈 (최신 6건 + 장르별 5건) |
| GET | `/movies?genre=&offset=&limit=` | X | 장르별 목록 |
| GET | `/movies/{postId}` | X | 상세 |
| POST | `/movies` | O | 글 쓰기 → postId 반환 |
| PUT | `/movies/{postId}` | O | 글 수정 (본인만) |
| DELETE | `/movies/{postId}` | O | 글 삭제 (본인만) |

### 4.4 사용자

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/users/me` | O | 내 프로필 |
| PUT | `/users/email` | O | 이메일 변경 (uuid 필요) |
| PUT | `/users/password` | O | 비밀번호 변경 |
| PUT | `/users/nickname` | O | 닉네임 변경 |

---

## 5. 장르 키

모든 API에서 장르는 아래 **키(영문)**를 사용합니다.

| 키 | 장르명 |
|---|---|
| `animation` | 애니메이션 |
| `comedy` | 코미디 |
| `romance` | 로맨스 |
| `action_thriller_crime` | 액션 / 스릴러 / 범죄 |
| `horror` | 호러 |
| `sf_fantasy` | SF / 판타지 |
| `drama` | 드라마 |
| `documentary` | 다큐멘터리 |
| `music_musical` | 음악 / 뮤지컬 |
| `etc` | 기타 |

---

## 6. 검증 규칙

| 필드 | 규칙 |
|------|------|
| id (아이디) | 4~20자, 영문 소문자+숫자+_ |
| password | 8~50자, 대문자 1자 이상 + 숫자 + 특수문자 포함 |
| email | 이메일 형식 |
| nickname | 1~10자 |
| star (별점) | 0.5~5.0, 0.5 단위 |
| genre | 위 장르 키 중 하나 |

---

## 7. CORS 허용 Origin

- `http://localhost:5500` / `http://localhost:5502` (Live Server)
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Next.js)
- 각 `127.0.0.1` 포트도 동일 허용

---

## 8. 참고 사항

- **토큰 유효기간**: 2시간 (만료 시 재로그인)
- **이메일 인증**: 교육용으로 인증코드가 응답에 직접 포함됩니다 (실제 이메일 발송 없음)
- **인증코드 유효기간**: 30분
- **목록/상세 조회는 비로그인도 가능**합니다
- **글 쓰기/수정/삭제는 로그인 필요**, 수정/삭제는 본인 글만 가능
- **Seed 데이터**: 서버 시작 시 영화 20건이 자동 등록됩니다
