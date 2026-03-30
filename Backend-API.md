# Bui1d-UP API 명세서

> **Base URL** : `https://api.example.com`

---

## 공통 사항

### 인증
보호된 엔드포인트는 요청 헤더에 JWT 토큰을 포함해야 합니다.
```
Authorization: Bearer {token}
```

### 공통 응답 형식
모든 응답은 아래 형식을 따릅니다.
```json
{
  "success": true | false,
  "message": "응답 메시지",
  "data": { }  // 선택적, 응답 데이터가 있을 경우
}
```

### 공통 에러 응답

| HTTP 상태 코드 | 설명 |
|---|---|
| 400 | 잘못된 요청 (필수 파라미터 누락 또는 형식 오류) |
| 401 | 인증 실패 (토큰 없음 또는 만료) |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 충돌 (중복 데이터) |
| 500 | 서버 내부 오류 |

**에러 응답 예시**
```json
{
  "success": false,
  "message": "에러 메시지"
}
```

---

## 1. 회원가입 / 로그인 API

### 1-1. 이메일 인증코드 전송

```
POST /api/email/code/send
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| email | string | ✅ | 인증을 받을 이메일 주소 |

```json
{
  "email": "example@gmail.com"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "verification code sent",
  "data": {
    "verificationId": "uuid-string"
  }
}
```

**에러 응답**
```json
// 400 - 이메일 형식 오류
{
  "success": false,
  "message": "invalid email format"
}

// 409 - 이미 가입된 이메일
{
  "success": false,
  "message": "email already exists"
}
```

---

### 1-2. 이메일 인증코드 확인

```
POST /api/email/code/check
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| verificationId | string | ✅ | 인증코드 전송 시 발급된 UUID |
| checkCode | string | ✅ | 이메일로 수신한 인증코드 |

```json
{
  "verificationId": "uuid-string",
  "checkCode": "1234"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "email_check_code Success"
}
```

**에러 응답**
```json
// 400 - 인증코드 불일치
{
  "success": false,
  "message": "invalid verification code"
}

// 410 - 인증코드 만료
{
  "success": false,
  "message": "verification code expired"
}
```

---

### 1-3. 아이디 중복 확인

```
POST /api/id/check
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | ✅ | 중복 확인할 아이디 |

```json
{
  "id": "example"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "id_check Success"
}
```

**에러 응답**
```json
// 409 - 이미 사용 중인 아이디
{
  "success": false,
  "message": "id already exists"
}
```

---

### 1-4. 회원가입

```
POST /api/signup
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | ✅ | 사용할 아이디 |
| password | string | ✅ | 사용할 비밀번호 |
| email | string | ✅ | 인증 완료된 이메일 주소 |
| nickname | string | ✅ | 사용할 닉네임 |

```json
{
  "id": "example",
  "password": "1234",
  "email": "example@gmail.com",
  "nickname": "user1"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "signup Success"
}
```

**에러 응답**
```json
// 400 - 필수 파라미터 누락
{
  "success": false,
  "message": "missing required fields"
}

// 409 - 이미 가입된 아이디 또는 이메일
{
  "success": false,
  "message": "id or email already exists"
}
```

---

### 1-5. 로그인

```
POST /api/login
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | string | ✅ | 아이디 |
| password | string | ✅ | 비밀번호 |

```json
{
  "id": "example",
  "password": "1234"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "login Success",
  "data": {
    "token": "jwt-token-string",
    "tokenType": "Bearer"
  }
}
```

**에러 응답**
```json
// 401 - 아이디 또는 비밀번호 불일치
{
  "success": false,
  "message": "invalid id or password"
}
```

---

### 1-6. 로그아웃

```
POST /api/logout
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "logout Success"
}
```

**에러 응답**
```json
// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized"
}
```

---

### 1-7. 회원 탈퇴

```
DELETE /api/withdraw
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| password | string | ✅ | 현재 비밀번호 (본인 확인용) |

```json
{
  "password": "1234"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "user Deleted"
}
```

**에러 응답**
```json
// 401 - 비밀번호 불일치
{
  "success": false,
  "message": "invalid password"
}
```

---

## 2. 홈 / 후기 목록 API

### 2-1. 홈 후기 목록 불러오기

```
GET /api/list
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "get_list Success",
  "data": {
    "nickname": "user1",
    "postList": [
      {
        "postId": 1,
        "postImage": "https://cdn.example.com/images/abc.jpg",
        "title": "왕과 사는 남자",
        "genre": "SF",
        "year": 2026,
        "director": ["장항준"],
        "cast": ["유지태", "유해진"]
      },
      {
        "postId": 2,
        "postImage": null,
        "title": "주토피아2",
        "genre": "애니메이션",
        "year": 2025,
        "director": ["자레드 부시", "바이런 하워드"],
        "cast": ["지니퍼 굿윈", "제이슨 베이트먼", "키 호이 콴"]
      }
    ]
  }
}
```

---

### 2-2. 후기 글 상세 조회

```
GET /api/detail/:post_id
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| post_id | number | ✅ | 조회할 게시글 ID |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "get_post_detail Success",
  "data": {
    "postId": 1,
    "postImage": "https://cdn.example.com/images/abc.jpg",
    "title": "왕과 사는 남자",
    "genre": "SF",
    "year": 2026,
    "director": ["장항준"],
    "cast": ["유해진", "박지훈", "유지태"],
    "famousLine": "네 이놈! 네놈이 감히 왕족을 능멸하는가",
    "content": "너무 재밌다",
    "star": 4.5
  }
}
```

**에러 응답**
```json
// 404 - 게시글을 찾을 수 없음
{
  "success": false,
  "message": "post not found"
}
```

---

## 3. 후기 글 작성 / 수정 / 삭제 API

### 3-1. 후기 글 작성

```
POST /api/movies
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |
| Content-Type | `multipart/form-data` (이미지 첨부 시) |

**Request Body (multipart/form-data)**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| title | string | ✅ | 영화 제목 |
| star | number | ✅ | 별점 (0.5 단위, 0.5 ~ 5.0) |
| content | string | ✅ | 후기 내용 |
| postImage | file | ❌ | 영화 포스터 이미지 |
| genre | string | ❌ | 장르 |
| year | number | ❌ | 개봉 연도 |
| director | string[] | ❌ | 감독 이름 배열 |
| cast | string[] | ❌ | 출연진 배열 |
| famousLine | string | ❌ | 명대사 |

```json
// 이미지 미포함 시 application/json
{
  "title": "왕과 사는 남자",
  "star": 4.5,
  "content": "너무 재밌다",
  "genre": "SF",
  "year": 2026,
  "director": ["장항준"],
  "cast": ["유해진", "박지훈", "유지태"],
  "famousLine": "네 이놈! 네놈이 감히 왕족을 능멸하는가"
}
```
> ⚠️ **이미지가 포함된 경우** `multipart/form-data` 형식으로 전송해야 합니다.

**Response (201 Created)**
```json
{
  "success": true,
  "message": "post_upload Success"
}
```

**에러 응답**
```json
// 400 - 필수 파라미터 누락
{
  "success": false,
  "message": "missing required fields"
}

// 401 - 인증 실패
{
  "success": false,
  "message": "unauthorized"
}
```

---

### 3-2. 후기 글 수정

```
PUT /api/movies/:post_id
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| post_id | number | ✅ | 수정할 게시글 ID |

**Request Body** - 변경할 필드만 포함해 전송

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| title | string | ❌ | 영화 제목 |
| star | number | ❌ | 별점 (0.5 단위, 0.5 ~ 5.0) |
| content | string | ❌ | 후기 내용 |
| genre | string | ❌ | 장르 |
| year | number | ❌ | 개봉 연도 |
| director | string[] | ❌ | 감독 이름 배열 |
| cast | string[] | ❌ | 출연진 배열 |
| famousLine | string | ❌ | 명대사 |

```json
{
  "star": 4.0,
  "content": "다시 보니 느낌이 다름"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "movie updated"
}
```

**에러 응답**
```json
// 401 - 인증 실패 또는 본인 글 아님
{
  "success": false,
  "message": "unauthorized"
}

// 404 - 게시글을 찾을 수 없음
{
  "success": false,
  "message": "post not found"
}
```

---

### 3-3. 후기 글 삭제

```
DELETE /api/movies/:post_id
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| post_id | number | ✅ | 삭제할 게시글 ID |

**Response (200 OK)**
```json
{
  "success": true,
  "message": "movie deleted"
}
```

**에러 응답**
```json
// 401 - 인증 실패 또는 본인 글 아님
{
  "success": false,
  "message": "unauthorized"
}

// 404 - 게시글을 찾을 수 없음
{
  "success": false,
  "message": "post not found"
}
```

---

## 4. 본인 정보 수정 API

### 4-1. 이메일 변경

```
PUT /api/users/email
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |
| Content-Type | `application/json` |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| email | string | ✅ | 변경할 이메일 주소 (인증 완료된 이메일) |

```json
{
  "email": "new@gmail.com"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "email_change Success"
}
```

**에러 응답**
```json
// 400 - 이메일 형식 오류
{
  "success": false,
  "message": "invalid email format"
}

// 409 - 이미 사용 중인 이메일
{
  "success": false,
  "message": "email already exists"
}
```

---

### 4-2. 비밀번호 변경

```
PUT /api/users/password
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| currentPassword | string | ✅ | 현재 비밀번호 (본인 확인용) |
| newPassword | string | ✅ | 변경할 새 비밀번호 |

```json
{
  "currentPassword": "1234",
  "newPassword": "5678"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "password_change Success"
}
```

**에러 응답**
```json
// 401 - 현재 비밀번호 불일치
{
  "success": false,
  "message": "invalid current password"
}
```

---

### 4-3. 닉네임 변경

```
PUT /api/users/nickname
```

**🔒 인증 필요**

**Request Headers**

| 필드 | 설명 |
|---|---|
| Authorization | `Bearer {token}` |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| nickname | string | ✅ | 변경할 닉네임 |

```json
{
  "nickname": "user2"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "nickname_change Success"
}
```

**에러 응답**
```json
// 409 - 이미 사용 중인 닉네임
{
  "success": false,
  "message": "nickname already exists"
}
```

---

## API 엔드포인트 요약

| 메서드 | 경로 | 설명 | 인증 필요 |
|---|---|---|---|
| POST | /api/email/code/send | 이메일 인증코드 전송 | ❌ |
| POST | /api/email/code/check | 이메일 인증코드 확인 | ❌ |
| POST | /api/id/check | 아이디 중복 확인 | ❌ |
| POST | /api/signup | 회원가입 | ❌ |
| POST | /api/login | 로그인 | ❌ |
| POST | /api/logout | 로그아웃 | ✅ |
| DELETE | /api/withdraw | 회원 탈퇴 | ✅ |
| GET | /api/list | 후기 목록 조회 | ❌ |
| GET | /api/detail/:post_id | 후기 상세 조회 | ❌ |
| POST | /api/movies | 후기 글 작성 | ✅ |
| PUT | /api/movies/:post_id | 후기 글 수정 | ✅ |
| DELETE | /api/movies/:post_id | 후기 글 삭제 | ✅ |
| PUT | /api/users/email | 이메일 변경 | ✅ |
| PUT | /api/users/password | 비밀번호 변경 | ✅ |
| PUT | /api/users/nickname | 닉네임 변경 | ✅ |
