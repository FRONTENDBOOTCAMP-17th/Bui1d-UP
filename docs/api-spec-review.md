# Build-UP API 명세서 리뷰

> 원본: [Backend-API.md](../Backend-API.md)
> 리뷰어: FullStackFamily 강사
> 리뷰 일자: 2026-03-31

---

## 총평

전반적으로 잘 작성된 명세서입니다. 공통 응답 형식, 에러 코드 체계, 토큰 필요 여부 요약표 등 구조가 체계적이고, 장르 키 테이블이 반복적으로 제공되어 개발 시 참고하기 좋습니다.

아래는 구현 시 문제가 될 수 있는 항목들입니다.

---

## 1. 반드시 수정해야 할 문제 (Critical)

### 1.1 DELETE + Body 호환성 문제

**위치**: 1-6. 탈퇴 (`DELETE /api/withdraw`)

```
DELETE /api/withdraw
Body: { "password": "1234" }
```

`fetch`로 `DELETE` 요청에 Body를 보내면 일부 환경에서 무시되거나 에러가 발생합니다.

**수정 제안**: `POST /api/withdraw`로 변경

```javascript
// 문제 있는 코드 (DELETE + Body)
fetch('/api/withdraw', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '1234' })  // 일부 브라우저에서 무시됨
});

// 권장하는 코드 (POST)
fetch('/api/withdraw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '1234' })
});
```

---

### 1.2 비밀번호 규칙과 예시 불일치

**위치**: 5-2. 비밀번호 변경

규칙에는 "대문자 1자 이상, 숫자, 특수문자를 반드시 포함"이라고 하면서, 예시는:
```json
{ "password": "5678" }
```

이 예시는 규칙을 전혀 만족하지 않습니다 (숫자만 있음).

**수정 제안**: 예시를 규칙에 맞게 변경
```json
{ "password": "MyPass1234!" }
```

---

### 1.3 회원가입 비밀번호 규칙 누락

**위치**: 1-3. 회원가입

비밀번호 변경(5-2)에서는 "대문자+숫자+특수문자" 규칙이 있는데, 회원가입에서는 비밀번호 규칙이 전혀 없습니다. 예시도 `"password": "1234"`로 4자리 숫자만 사용.

**문제**: 가입 시에는 `1234`로 가입 가능한데, 비밀번호 변경 시에는 `MyPass1234!` 형식이 필수 → 사용자 혼란

**수정 제안**: 회원가입에서도 동일한 비밀번호 규칙 적용. 최소 길이(8자 이상 등)도 명시.

---

### 1.4 장르 키 vs 장르명 혼용

**위치**: 3-2. 장르별 목록 호출, 4-1. 글 불러오기

장르별 목록에서 요청은 장르 **키**(`horror`)를 사용하는데, 응답의 genre 필드는 장르 **한글명**(`"호러"`)으로 반환합니다.

```json
// 요청: 장르 키 사용
GET /api/movies?genre=horror

// 응답: 장르 한글명 반환 (?!)
{ "genre": "호러" }
```

반면 홈 목록(3-1)에서는 `"genre": "sf_fantasy"` 처럼 장르 키로 반환합니다.

**문제**: 같은 데이터인데 API마다 다른 형식 → 프론트에서 변환 로직 필요

**수정 제안**: 모든 API에서 장르 **키**(`horror`, `sf_fantasy`)로 통일. 한글 표시는 프론트에서 매핑.

---

### 1.5 홈 목록이 로그인 필수인 이유 불분명

**위치**: 3-1. 홈 목록 불러오기, 3-2. 장르별 목록 호출

영화 목록 조회에 로그인이 필수(`✅ 토큰 필요`)로 되어 있습니다.

**문제**: 비로그인 사용자는 홈 화면에서 아무것도 볼 수 없음. 일반적인 서비스에서 목록 조회는 비로그인도 허용하는 것이 보통.

**수정 제안**: 읽기 전용 API (목록 조회, 상세 조회)는 `❌ 토큰 불필요`로 변경. 글쓰기/수정/삭제만 토큰 필요.

---

### 1.6 postImage 응답 타입이 `file`

**위치**: 4-1. 글 불러오기 (자세히 보기)

```
| postImage (포스터 이미지) | file | 업로드된 영화 포스터 이미지 |
```

JSON 응답에서 `file` 타입은 존재하지 않습니다. 이미지는 **URL 문자열**로 반환해야 합니다.

**수정 제안**:
```json
{
  "postImage": "https://api.example.com/images/posts/1/poster.jpg"
}
```

타입을 `string (URL)`로 변경.

---

## 2. 개선하면 좋은 항목 (Important)

### 2.1 사용자 정보에 닉네임만 반환

**위치**: 2-1. 사용자 정보 호출

```json
{
  "data": { "nickname": "bbalabuya" }
}
```

닉네임만 반환하면 프론트에서 사용자 식별 정보가 부족합니다.

**수정 제안**: `id`, `email`, `nickname` 등 주요 정보를 함께 반환
```json
{
  "data": {
    "id": "example",
    "email": "example@gmail.com",
    "nickname": "bbalabuya"
  }
}
```

---

### 2.2 로그인 응답에 사용자 정보 없음

**위치**: 1-4. 로그인

```json
{
  "data": { "token": "jwt-token-string" }
}
```

토큰만 반환하면 프론트에서 사용자 정보를 위해 즉시 `/api/users/user_info`를 추가 호출해야 합니다.

**수정 제안**: 로그인 응답에 기본 사용자 정보 포함
```json
{
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": "example",
      "nickname": "user1"
    }
  }
}
```

---

### 2.3 글 쓰기 성공 시 생성된 ID 미반환

**위치**: 4-2. 글 쓰기

```json
{ "success": true, "message": "post_upload Success" }
```

생성된 게시글의 `postId`가 없으면 프론트에서 글 작성 후 상세 페이지로 이동할 수 없습니다.

**수정 제안**:
```json
{
  "success": true,
  "message": "post_upload Success",
  "data": { "postId": 22 }
}
```

---

### 2.4 페이지네이션 메타 정보 없음

**위치**: 3-2. 장르별 목록 호출

`offset`과 `limit`으로 페이지네이션하는데, 응답에 전체 개수(`totalCount`)가 없습니다.
프론트에서 "더보기" 버튼 표시 여부를 판단할 수 없습니다.

**수정 제안**: 응답에 페이지네이션 메타 추가
```json
{
  "data": { "horror": [...] },
  "meta": {
    "totalCount": 45,
    "offset": 0,
    "limit": 20,
    "hasMore": true
  }
}
```

---

### 2.5 URL 경로 스타일 혼재

| API | 경로 | 스타일 |
|-----|------|--------|
| 사용자 정보 | `/api/users/user_info` | snake_case |
| 장르별 목록 | `/api/movies` | 복수형 |
| 상세 조회 | `/api/detail/:post_id` | 단수형 + snake_case |
| 이메일 인증 | `/api/email/code/send` | 동사형 |

**문제**: 경로 스타일이 통일되지 않음

**수정 제안**: RESTful 관례를 따르면:
```
GET  /api/users/me          (사용자 정보 → user_info 대신)
GET  /api/movies/:post_id   (상세 조회 → detail 대신)
POST /api/auth/email/verify  (이메일 인증)
```

---

### 2.6 이메일 변경 시 인증 검증 부재

**위치**: 5-1. 이메일 변경

이메일 인증(1-1, 1-2)을 완료해야 한다고 하지만, 변경 요청에 `UUID`를 포함하지 않습니다.

```json
// 현재: UUID 없이 이메일만 전송
{ "email": "new@gmail.com" }
```

**문제**: 서버에서 이메일 인증 완료 여부를 어떻게 확인하는지 불분명

**수정 제안**: 회원가입처럼 `UUID`를 함께 전송
```json
{
  "email": "new@gmail.com",
  "UUID": "인증완료된_UUID"
}
```

---

### 2.7 로그인 에러 코드 중복

**위치**: 1-4. 로그인

```
401 UNAUTHORIZED - "아이디 또는 비밀번호 불일치"
404 NOT_FOUND   - "존재하지 않는 아이디"
```

보안 관점에서 "아이디가 존재하지 않음"과 "비밀번호 불일치"를 구분하면 안 됩니다. 공격자가 아이디 존재 여부를 알 수 있기 때문입니다.

**수정 제안**: 둘 다 `401 UNAUTHORIZED` + "아이디 또는 비밀번호가 일치하지 않습니다"로 통일

---

## 3. 사소한 문제 (Minor)

### 3.1 탈퇴 시 비밀번호 불일치 에러 코드

**위치**: 1-6. 탈퇴

```
401 UNAUTHORIZED - "비밀번호 불일치"
```

비밀번호 불일치는 인증 실패가 아니라 비즈니스 로직 실패이므로 `400 INVALID_REQUEST`가 더 적합합니다.

### 3.2 UUID 필드명 컨벤션 위반

명세서에서 "변수명은 camelCase"라고 규칙을 정했으나, `UUID`는 전체 대문자입니다.
`uuid` 또는 `verificationId`가 camelCase 규칙에 부합합니다.

### 3.3 Base URL 미결정

```
Base URL: https://api.example.com
```

아직 실제 서버 URL이 정해지지 않았습니다. 구현 시 확정 필요.

### 3.4 이미지 크기/형식 제한 미명시

글 쓰기(4-2)에서 이미지 업로드가 있지만 허용 형식(JPEG, PNG 등), 최대 크기 등이 없습니다.

---

## 4. 수정 요약표

| # | 우선순위 | 항목 | 현재 | 수정 제안 |
|---|---------|------|------|----------|
| 1 | Critical | DELETE + Body | `DELETE /api/withdraw` | `POST /api/withdraw` |
| 2 | Critical | 비밀번호 예시 | `"password": "5678"` | `"password": "MyPass1234!"` |
| 3 | Critical | 가입 비밀번호 규칙 | 없음 | 변경 규칙과 동일하게 적용 |
| 4 | Critical | 장르 키/한글명 혼용 | API마다 다름 | 장르 키로 통일 |
| 5 | Critical | 목록 조회 로그인 필수 | 토큰 필요 | 토큰 불필요로 변경 |
| 6 | Critical | postImage 타입 | `file` | `string (URL)` |
| 7 | Important | 사용자 정보 부족 | 닉네임만 | id, email, nickname |
| 8 | Important | 로그인 응답 | 토큰만 | 토큰 + 사용자 정보 |
| 9 | Important | 글쓰기 응답 | ID 없음 | postId 반환 |
| 10 | Important | 페이지네이션 메타 | 없음 | totalCount, hasMore 추가 |
| 11 | Important | URL 스타일 혼재 | 혼합 | RESTful 통일 |
| 12 | Important | 이메일 변경 UUID | 없음 | UUID 포함 |
| 13 | Important | 로그인 에러 구분 | 401+404 | 401로 통일 |
| 14 | Minor | 탈퇴 비밀번호 에러 | 401 | 400 |
| 15 | Minor | UUID 대문자 | `UUID` | `uuid` |
| 16 | Minor | Base URL | example.com | 실제 URL 확정 |
| 17 | Minor | 이미지 제한 | 없음 | 형식/크기 명시 |
