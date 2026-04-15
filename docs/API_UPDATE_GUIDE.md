# Build-UP API 변경 및 추가 안내

## 변경 요약

1. **3-2 장르별 목록** — genre 파라미터 optional (없으면 전체 최신순)
2. **3-3 검색 API** — 제목 검색 (대소문자 무시, 부분 일치)
3. **6-1~6-3 비밀번호 재설정** — 이메일 인증코드 → 임시 토큰 → 비밀번호 변경

---

## 1. 장르별 목록 (수정)

```
GET /api/buildup/v1/movies
```

**변경점**: `genre` 파라미터가 **선택사항**이 되었습니다.

| 파라미터 | 필수 | 기본값 | 설명 |
|----------|------|--------|------|
| genre | 선택 | 없음 | 장르 키. 없으면 전체 최신순 |
| sort | 선택 | DESC | 정렬 방향 |
| offset | 선택 | 0 | 시작 위치 |
| limit | 선택 | 10 | 가져올 개수 |

### JavaScript 코드

```js
const token = localStorage.getItem("buildup-token");

// 전체 최신순 (genre 파라미터 없이)
const allResponse = await fetch(
  "https://api.fullstackfamily.com/api/buildup/v1/movies?limit=20",
  {
    headers: { Authorization: "Bearer " + token },
  }
);

// 특정 장르만 (기존과 동일)
const horrorResponse = await fetch(
  "https://api.fullstackfamily.com/api/buildup/v1/movies?genre=horror&limit=20",
  {
    headers: { Authorization: "Bearer " + token },
  }
);
```

---

## 2. 검색 API (신규)

```
GET /api/buildup/v1/movies/search?keyword=...&limit=20
```

**인증 필요** (JWT 토큰)

| 파라미터 | 필수 | 기본값 | 설명 |
|----------|------|--------|------|
| keyword | 필수 | - | 검색어 (제목 부분 일치, 대소문자 무시) |
| limit | 선택 | 20 | 결과 수 (최대 50) |

### JavaScript 코드

```js
const token = localStorage.getItem("buildup-token");

async function searchMovies(keyword) {
  const response = await fetch(
    `https://api.fullstackfamily.com/api/buildup/v1/movies/search?keyword=${encodeURIComponent(keyword)}&limit=20`,
    {
      headers: { Authorization: "Bearer " + token },
    }
  );
  const result = await response.json();

  if (result.success) {
    console.log("검색 결과:", result.data.totalResults, "건");
    result.data.movies.forEach(function (movie) {
      console.log(movie.postId, movie.title, movie.genre);
    });
  }
}

// 사용 예시
searchMovies("인터스텔라");   // 한글 검색
searchMovies("inception");   // 영어 검색 (대소문자 무시)
```

### 응답 예시

```json
{
  "success": true,
  "message": "검색 결과입니다.",
  "data": {
    "keyword": "인터스텔라",
    "totalResults": 1,
    "movies": [
      {
        "postId": 5,
        "title": "인터스텔라",
        "genre": "sf_fantasy",
        "year": 2014,
        "director": ["크리스토퍼 놀란"],
        "cast": ["매튜 맥커너히"],
        "star": 5.0,
        "imageUrl": "https://example.com/img.jpg",
        "createdAt": "2026-04-15T10:00:00"
      }
    ]
  }
}
```

### 에러

| 상황 | 코드 | 메시지 |
|------|------|--------|
| keyword 빈 문자열 | 400 | 검색어를 입력해주세요. |
| 인증 없음 | 401 | unauthorized |

---

## 3. 비밀번호 재설정 (신규 3개 API)

로그인하지 않은 상태에서 비밀번호를 재설정하는 흐름입니다.

```
1. POST /password/reset/send    → 이메일로 인증코드 전송
2. POST /password/reset/verify  → 인증코드 확인 → 임시 토큰 발급
3. POST /password/reset/change  → 임시 토큰 + 새 비밀번호 → 변경 완료
```

### 3-1. 인증코드 전송

```
POST /api/buildup/v1/password/reset/send
```

**인증 불필요**

```js
async function sendResetCode(email) {
  const response = await fetch(
    "https://api.fullstackfamily.com/api/buildup/v1/password/reset/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    }
  );
  const result = await response.json();

  if (result.success) {
    // UUID를 저장해두세요 (다음 단계에서 필요)
    const uuid = result.data.uuid;
    console.log("인증코드가 이메일로 전송되었습니다. UUID:", uuid);
    return uuid;
  } else {
    alert(result.message); // "등록되지 않은 이메일입니다." 등
  }
}
```

**응답**
```json
{
  "success": true,
  "message": "인증코드가 전송되었습니다.",
  "data": {
    "uuid": "abc123-def456-..."
  }
}
```

### 3-2. 인증코드 확인

```
POST /api/buildup/v1/password/reset/verify
```

**인증 불필요**

```js
async function verifyResetCode(uuid, code) {
  const response = await fetch(
    "https://api.fullstackfamily.com/api/buildup/v1/password/reset/verify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: uuid,
        code: code,  // 이메일로 받은 4자리 코드
      }),
    }
  );
  const result = await response.json();

  if (result.success) {
    // 임시 토큰을 저장 (15분 유효, 다음 단계에서 필요)
    const resetToken = result.data.resetToken;
    console.log("인증 성공! 임시 토큰:", resetToken);
    return resetToken;
  } else {
    alert(result.message); // "인증코드가 일치하지 않습니다." 등
  }
}
```

**응답**
```json
{
  "success": true,
  "message": "인증이 완료되었습니다.",
  "data": {
    "resetToken": "eyJ..."
  }
}
```

### 3-3. 비밀번호 변경

```
POST /api/buildup/v1/password/reset/change
```

**인증 불필요** (임시 토큰 사용)

```js
async function resetPassword(resetToken, newPassword) {
  const response = await fetch(
    "https://api.fullstackfamily.com/api/buildup/v1/password/reset/change",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resetToken: resetToken,
        newPassword: newPassword,
      }),
    }
  );
  const result = await response.json();

  if (result.success) {
    alert("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.");
    // 로그인 페이지로 이동
  } else {
    alert(result.message); // "만료된 토큰입니다." 등
  }
}
```

**응답**
```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

### 전체 흐름 예시

```js
// 1단계: 이메일 인증코드 발송
const uuid = await sendResetCode("user@example.com");

// 2단계: 사용자가 이메일에서 코드를 확인하고 입력
const resetToken = await verifyResetCode(uuid, "1234");

// 3단계: 새 비밀번호 설정
await resetPassword(resetToken, "NewPassword123!");
```

### 에러 정리

| API | 코드 | 메시지 |
|-----|------|--------|
| send | 404 | 등록되지 않은 이메일입니다. |
| verify | 404 | 인증 정보를 찾을 수 없습니다. |
| verify | 410 | 인증코드가 만료되었습니다. |
| verify | 400 | 인증코드가 일치하지 않습니다. |
| change | 401 | 유효하지 않은 토큰입니다. |
| change | 401 | 만료된 토큰입니다. |

---

## API 문서 페이지

https://www.fullstackfamily.com/buildup/api-docs
