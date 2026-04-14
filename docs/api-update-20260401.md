# Build-UP API 수정 안내 (2026-04-01)

> Bui1d-UP팀 요청에 따른 글쓰기/수정 API 변경 사항

---

## 변경 요약

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 글 쓰기/수정 Content-Type | `multipart/form-data` | `application/json` |
| 요청 구조 | `movie(JSON)` 래퍼 안에 필드 포함 | 래퍼 없이 flat JSON |
| 이미지 업로드 | `postImage` 파트로 함께 전송 | 별도 API로 먼저 업로드 후 URL 사용 |

---

## 이미지 포함 글쓰기 흐름

```
1단계: 이미지 업로드  →  imageUrl 받기
2단계: 글 쓰기        →  JSON에 imageUrl 포함
```

---

## API 사용법

### 1. 이미지 업로드

> 이미지가 없으면 이 단계를 건너뛰고 바로 글 쓰기로 이동합니다.

```
POST https://api.fullstackfamily.com/api/buildup/v1/movies/images
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**요청**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | file | O | 이미지 파일 (JPEG, PNG, WebP, GIF / 최대 5MB) |

**JavaScript 예시**

```javascript
const formData = new FormData();
formData.append("file", imageFile);  // input[type="file"]에서 가져온 File 객체

const response = await fetch("https://api.fullstackfamily.com/api/buildup/v1/movies/images", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    // Content-Type은 설정하지 않음! (FormData가 자동으로 boundary 포함)
  },
  body: formData,
});

const result = await response.json();
const imageUrl = result.data.imageUrl;
// imageUrl = "https://storage.fullstackfamily.com/content/buildup/movies/xxxxx.webp"
```

**성공 응답 (201)**

```json
{
  "success": true,
  "message": "image upload Success",
  "data": {
    "imageUrl": "https://storage.fullstackfamily.com/content/buildup/movies/5a9c89af.webp"
  }
}
```

**에러 응답**

| HTTP | errorCode | 설명 |
|------|-----------|------|
| 400 | INVALID_REQUEST | 파일이 비어있음 |
| 413 | FILE_TOO_LARGE | 5MB 초과 |
| 415 | UNSUPPORTED_FILE_TYPE | 허용되지 않는 형식 (JPEG, PNG, WebP, GIF 외) |

---

### 2. 글 쓰기

```
POST https://api.fullstackfamily.com/api/buildup/v1/movies
Authorization: Bearer {token}
Content-Type: application/json
```

**요청 본문 (flat JSON, movie 래퍼 없음)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | O | 영화 제목 (1~200자) |
| genre | string | O | 장르 키 |
| content | string | O | 리뷰 내용 |
| star | number | O | 별점 (0.5~5.0, 0.5 단위) |
| imageUrl | string | X | 이미지 업로드 API에서 받은 URL |
| year | number | X | 개봉 연도 (1900~2100) |
| director | string[] | X | 감독 목록 |
| cast | string[] | X | 출연진 목록 |
| famousLine | string | X | 명대사 (최대 500자) |

**장르 키 목록**

| 키 | 한글명 |
|----|--------|
| animation | 애니메이션 |
| comedy | 코미디 |
| romance | 로맨스 |
| action_thriller_crime | 액션 / 스릴러 / 범죄 |
| horror | 호러 |
| sf_fantasy | SF / 판타지 |
| drama | 드라마 |
| documentary | 다큐멘터리 |
| music_musical | 음악 / 뮤지컬 |
| etc | 기타 |

**JavaScript 예시 - 이미지 포함**

```javascript
// 1단계에서 받은 imageUrl 사용
const response = await fetch("https://api.fullstackfamily.com/api/buildup/v1/movies", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "인사이드 아웃 2",
    genre: "animation",
    content: "감정들의 새로운 모험!",
    star: 4.5,
    year: 2024,
    director: ["켈시 만"],
    cast: ["에이미 폴러", "마야 호크"],
    famousLine: "모든 감정에는 이유가 있어.",
    imageUrl: imageUrl,  // 이미지 업로드에서 받은 URL
  }),
});

const result = await response.json();
const postId = result.data.postId;
```

**JavaScript 예시 - 이미지 없이**

```javascript
const response = await fetch("https://api.fullstackfamily.com/api/buildup/v1/movies", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "범죄도시 4",
    genre: "action_thriller_crime",
    content: "마동석의 주먹이 돌아왔다!",
    star: 4.0,
  }),
});
```

**성공 응답 (201)**

```json
{
  "success": true,
  "message": "movie create Success",
  "data": {
    "postId": 10
  }
}
```

---

### 3. 글 수정

```
PUT https://api.fullstackfamily.com/api/buildup/v1/movies/{postId}
Authorization: Bearer {token}
Content-Type: application/json
```

**수정할 필드만 포함하면 됩니다 (부분 수정 가능).**

**JavaScript 예시 - 별점과 내용만 수정**

```javascript
await fetch(`https://api.fullstackfamily.com/api/buildup/v1/movies/${postId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    star: 5.0,
    content: "수정된 리뷰 내용",
  }),
});
```

**JavaScript 예시 - 이미지 변경**

```javascript
// 새 이미지 먼저 업로드
const formData = new FormData();
formData.append("file", newImageFile);
const uploadRes = await fetch("https://api.fullstackfamily.com/api/buildup/v1/movies/images", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
const { data: { imageUrl: newImageUrl } } = await uploadRes.json();

// 글 수정에 새 URL 포함
await fetch(`https://api.fullstackfamily.com/api/buildup/v1/movies/${postId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    imageUrl: newImageUrl,
  }),
});
```

**성공 응답 (200)**

```json
{
  "success": true,
  "message": "movie update Success"
}
```

---

## 터미널(curl)로 테스트하기

```bash
# 로그인
curl -X POST https://api.fullstackfamily.com/api/buildup/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"id":"testuser","password":"Test1234!"}'

# 토큰을 변수에 저장 (위 응답의 token 값)
TOKEN="여기에_토큰_붙여넣기"

# 이미지 업로드
curl -X POST https://api.fullstackfamily.com/api/buildup/v1/movies/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./poster.jpg"

# 글 쓰기 (이미지 URL 포함)
curl -X POST https://api.fullstackfamily.com/api/buildup/v1/movies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 영화",
    "genre": "comedy",
    "content": "재미있는 영화!",
    "star": 4.0,
    "imageUrl": "위에서_받은_URL"
  }'

# 글 수정 (별점만)
curl -X PUT https://api.fullstackfamily.com/api/buildup/v1/movies/10 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"star": 5.0}'
```

---

## 주의사항

1. **이미지 업로드 시 Content-Type을 직접 설정하지 마세요.** `FormData`가 자동으로 `multipart/form-data; boundary=...`를 생성합니다.
2. **글 쓰기/수정은 반드시 `Content-Type: application/json`으로 보내세요.** `multipart/form-data`가 아닙니다.
3. 이미지는 서버에서 자동으로 **WebP 형식**으로 변환됩니다.
4. 글 수정 시 보내지 않은 필드는 기존 값이 유지됩니다.

---

## API 문서 페이지

온라인 API 문서: https://www.fullstackfamily.com/buildup/api-docs
