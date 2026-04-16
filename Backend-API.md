# Build-UP API 명세서

> **Base URL** : `https://api.example.com`

---

## 📌 공통 사항 (Common)

### 인증 (Authentication)

로그인 토큰이 필요한 엔드포인트는 요청 헤더에 JWT 토큰을 포함해야 함.

```
Authorization: Bearer {token}
```

**유효기간**

| 항목              | 유효기간 |
| ----------------- | -------- |
| 이메일 인증코드   | 30분     |
| 로그인 토큰 (JWT) | 2시간    |

### 변수명 표기 규칙

변수명은 **영문(camelCase)** 으로 작성하며, 설명은 **한글**로 병기함.
예시: `email (이메일)`, `checkCode (인증코드)`, `postId (게시글 ID)`

### 공통 응답 형식 (Response Format)

모든 응답은 아래 형식을 따름.

```json
{
  "success": true,
  "message": "응답 메시지",
  "data": {}
}
```

| 필드                | 타입    | 설명                                 |
| ------------------- | ------- | ------------------------------------ |
| success (성공 여부) | boolean | 요청 성공 시 `true`, 실패 시 `false` |
| message (메시지)    | string  | 응답 결과 메시지                     |
| data (데이터)       | object  | 응답 데이터 (없을 경우 생략)         |

---

### 공통 에러 코드 (Error Codes)

| HTTP 상태 코드 | 에러 코드       | 메시지                  | 설명                                          |
| -------------- | --------------- | ----------------------- | --------------------------------------------- |
| 400            | INVALID_REQUEST | "invalid request"       | 잘못된 요청 (필수 파라미터 누락, 형식 오류)   |
| 401            | UNAUTHORIZED    | "unauthorized"          | 인증 실패 (토큰 없음 또는 만료)               |
| 403            | FORBIDDEN       | "forbidden"             | 권한 없음 (본인 리소스 아님)                  |
| 404            | NOT_FOUND       | "not found"             | 리소스를 찾을 수 없음                         |
| 409            | DUPLICATE       | "already exists"        | 중복 데이터 (이미 존재하는 아이디, 이메일 등) |
| 410            | EXPIRED         | "expired"               | 만료된 데이터 (인증코드 만료 등)              |
| 500            | SERVER_ERROR    | "internal server error" | 서버 내부 오류                                |

**에러 응답 예시**

```json
{
  "success": false,
  "message": "에러 메시지",
  "errorCode": "에러 코드"
}
```

---

### 로그인 토큰 필요 여부 요약

> ✅ **토큰 필요** &nbsp;&nbsp;&nbsp; ❌ **토큰 불필요**

| 기능 이름                 | 메서드 | 경로                  |   토큰    |
| ------------------------- | :----: | --------------------- | :-------: |
| 이메일 인증코드 전송      |  POST  | /api/email/code/send  | ❌ 불필요 |
| 이메일 인증코드 확인      |  POST  | /api/email/code/check | ❌ 불필요 |
| 회원가입                  |  POST  | /api/signup           | ❌ 불필요 |
| 로그인                    |  POST  | /api/login            | ❌ 불필요 |
| 로그아웃                  |  POST  | /api/logout           |  ✅ 필요  |
| 탈퇴                      | DELETE | /api/withdraw         |  ✅ 필요  |
| 사용자 정보 호출          |  GET   | /api/users/user_info  |  ✅ 필요  |
| 홈 목록 불러오기          |  GET   | /api/list             |  ✅ 필요  |
| 장르별 목록 호출          |  GET   | /api/movies           |  ✅ 필요  |
| 글 불러오기 (자세히 보기) |  GET   | /api/detail/:post_id  |  ✅ 필요  |
| 글 쓰기                   |  POST  | /api/movies           |  ✅ 필요  |
| 글 수정하기               |  PUT   | /api/movies/:post_id  |  ✅ 필요  |
| 글 삭제하기               | DELETE | /api/movies/:post_id  |  ✅ 필요  |
| 이메일 변경               |  PUT   | /api/users/email      |  ✅ 필요  |
| 비밀번호 변경             |  PUT   | /api/users/password   |  ✅ 필요  |
| 닉네임 변경               |  PUT   | /api/users/nickname   |  ✅ 필요  |

---

## 1. 회원가입 / 로그인 API

### 1-1. 이메일 인증코드 전송

```
POST /api/email/code/send
```

**❌ 로그인 토큰 불필요**

> 💡 이메일 인증코드 전송 후 반환된 `UUID (고유식별자)`는
> 인증코드 확인 시 `checkCode (인증코드)`와 함께 전송해야 함.
> 연속 중복 전송은 프론트에서 차단함.
> 인증코드 유효시간은 **30분**이며, 만료 시 재전송 필요.

**Request Body**

| 변수명         | 타입   | 필수 | 설명                        |
| -------------- | ------ | ---- | --------------------------- |
| email (이메일) | string | ✅   | 인증코드를 받을 이메일 주소 |

```json
{
  "email": "example@gmail.com"
}
```

**Response (200 OK)**

| 변수명            | 타입   | 설명                                |
| ----------------- | ------ | ----------------------------------- |
| UUID (고유식별자) | string | 인증코드 확인 시 사용할 고유 식별자 |

```json
{
  "success": true,
  "message": "email_code_send Success",
  "data": {
    "UUID": "19481721214918418419841948156"
  }
}
```

**에러 응답**

```json
// 400 - 이메일 형식 오류 또는 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 409 - 이미 가입된 이메일
{
  "success": false,
  "message": "already exists",
  "errorCode": "DUPLICATE"
}
```

---

### 1-2. 이메일 인증코드 확인

```
POST /api/email/code/check
```

**❌ 로그인 토큰 불필요**

> 💡 인증코드 전송(`1-1`)에서 반환된 `UUID (고유식별자)`와
> 이메일로 수신한 `checkCode (인증코드 4자리)`를 함께 전송합니다.

**Request Body**

| 변수명               | 타입   | 필수 | 설명                                |
| -------------------- | ------ | ---- | ----------------------------------- |
| checkCode (인증코드) | string | ✅   | 이메일로 수신한 4자리 인증코드      |
| UUID (고유식별자)    | string | ✅   | 인증코드 전송 시 발급된 고유 식별자 |

```json
{
  "checkCode": "1234",
  "UUID": "19481721214918418419841948156"
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
// 400 - 인증코드 불일치 또는 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 410 - 인증코드 만료
{
  "success": false,
  "message": "expired",
  "errorCode": "EXPIRED"
}
```

---

### 1-3. 회원가입

```
POST /api/signup
```

**❌ 로그인 토큰 불필요**

> 💡 이메일 인증이 완료된 `UUID (고유식별자)`를 함께 전송해야 함.
> 인증코드 확인(`1-2`) 이후에만 회원가입 가능.

**Request Body**

| 변수명              | 타입   | 필수 | 설명                              |
| ------------------- | ------ | ---- | --------------------------------- |
| id (아이디)         | string | ✅   | 사용할 아이디                     |
| password (비밀번호) | string | ✅   | 사용할 비밀번호                   |
| email (이메일)      | string | ✅   | 인증 완료된 이메일 주소           |
| nickname (닉네임)   | string | ✅   | 사용할 닉네임                     |
| UUID (고유식별자)   | string | ✅   | 이메일 인증 시 발급된 고유 식별자 |

```json
{
  "id": "example",
  "password": "1234",
  "email": "example@gmail.com",
  "nickname": "user1",
  "UUID": "example_UUID"
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
// 400 - 필수값 누락 또는 형식 오류
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 409 - 이미 사용 중인 아이디 또는 이메일
{
  "success": false,
  "message": "already exists",
  "errorCode": "DUPLICATE"
}

// 410 - UUID 만료 (인증 유효시간 초과)
{
  "success": false,
  "message": "expired",
  "errorCode": "EXPIRED"
}
```

---

### 1-4. 로그인

```
POST /api/login
```

**❌ 로그인 토큰 불필요**

> 💡 로그인 성공 시 반환된 `token (인증 토큰)`을 이후 요청의 `Authorization` 헤더에 포함해야 함.
> 토큰 유효기간은 **2시간**이며, 만료 시 재로그인 필요.

**Request Body**

| 변수명              | 타입   | 필수 | 설명            |
| ------------------- | ------ | ---- | --------------- |
| id (아이디)         | string | ✅   | 가입한 아이디   |
| password (비밀번호) | string | ✅   | 가입한 비밀번호 |

```json
{
  "id": "example",
  "password": "1234"
}
```

**Response (200 OK)**

| 변수명            | 타입   | 설명                        |
| ----------------- | ------ | --------------------------- |
| token (인증 토큰) | string | 이후 요청에 사용할 JWT 토큰 |

```json
{
  "success": true,
  "message": "login Success",
  "data": {
    "token": "jwt-token-string"
  }
}
```

**에러 응답**

```json
// 400 - 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 아이디 또는 비밀번호 불일치
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 404 - 존재하지 않는 아이디
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

### 1-5. 로그아웃

```
POST /api/logout
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Request Body** - 없음

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
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}
```

---

### 1-6. 탈퇴

```
DELETE /api/withdraw
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Request Body**

| 변수명              | 타입   | 필수 | 설명                      |
| ------------------- | ------ | ---- | ------------------------- |
| password (비밀번호) | string | ✅   | 본인 확인용 현재 비밀번호 |

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
// 400 - 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 401 - 비밀번호 불일치
{
  "success": false,
  "message": "invalid password",
  "errorCode": "UNAUTHORIZED"
}
```

---

---

## 2. 사용자 정보 API

### 2-1. 사용자 정보 호출

```
GET /api/users/user_info
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Request Body** - 없음

**Response (200 OK)**

| 변수명            | 타입   | 설명                 |
| ----------------- | ------ | -------------------- |
| nickname (닉네임) | string | 현재 사용자의 닉네임 |

```json
{
  "success": true,
  "message": "user_info Success",
  "data": {
    "nickname": "bbalabuya"
  }
}
```

**에러 응답**

```json
// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 404 - 사용자를 찾을 수 없음
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

## 3. 홈 / 목록 API

### 3-1. 홈 목록 불러오기

```
GET /api/list
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Request Body** - 없음

> ⚠️ **주의사항**
>
> - `latest (최신글)` : 전체 글 중 최신순으로 최대 **6개** 반환
> - `genres (장르별)` : 각 장르별 최신순으로 최대 **5개씩** 반환
> - `latest`의 `genre` 값은 장르 키(예: sf_fantasy, horror)로 통일해서 반환함.
> - 장르 키 목록은 아래 표를 따름.

**장르 키 (Genre Keys)**

| 키 (key)              | 장르명               |
| --------------------- | -------------------- |
| animation             | 애니메이션           |
| comedy                | 코미디               |
| romance               | 로맨스               |
| action_thriller_crime | 액션 / 스릴러 / 범죄 |
| horror                | 호러                 |
| sf_fantasy            | SF / 판타지          |
| drama                 | 드라마               |
| documentary           | 다큐멘터리           |
| music_musical         | 음악 / 뮤지컬        |
| etc                   | 기타                 |

**Response (200 OK)**

| 변수명             | 타입     | 설명                                  |
| ------------------ | -------- | ------------------------------------- |
| latest (최신글)    | array    | 전체 최신순 게시글 (최대 6개)         |
| genres (장르별)    | object   | 장르 키별 최신순 게시글 (각 최대 5개) |
| postId (게시글 ID) | number   | 게시글 고유 ID                        |
| title (제목)       | string   | 영화 제목                             |
| genre (장르)       | string   | 장르 키 (장르 키 표 참고)             |
| year (개봉연도)    | number   | 개봉 연도                             |
| director (감독)    | string[] | 감독 이름 배열                        |
| cast (출연진)      | string[] | 출연진 이름 배열                      |

```json
{
  "success": true,
  "message": "Movies fetched successfully",
  "data": {
    "latest": [
      {
        "postId": 1,
        "title": "왕과 사는 남자",
        "genre": "sf_fantasy",
        "year": 2026,
        "director": ["장현준"],
        "cast": ["유지태", "유혜진"]
      },
      {
        "postId": 2,
        "title": "주토피아 2",
        "genre": "animation",
        "year": 2025,
        "director": ["자레드 부시"],
        "cast": ["지니퍼 굿윈"]
      },
      {
        "postId": 3,
        "title": "블랙 팬서 3",
        "genre": "action_thriller_crime",
        "year": 2026,
        "director": ["라이언 쿠글러"],
        "cast": ["레티티아 라이트"]
      },
      {
        "postId": 4,
        "title": "미키 17",
        "genre": "sf_fantasy",
        "year": 2025,
        "director": ["봉준호"],
        "cast": ["로버트 패틴슨"]
      },
      {
        "postId": 5,
        "title": "엘리오",
        "genre": "animation",
        "year": 2025,
        "director": ["에이드리언 몰리나"],
        "cast": ["요나스 키브렙"]
      },
      {
        "postId": 6,
        "title": "노스페라투",
        "genre": "horror",
        "year": 2024,
        "director": ["로버트 에거스"],
        "cast": ["빌 스카스가드"]
      }
    ],
    "genres": {
      "animation": [
        {
          "postId": 2,
          "title": "주토피아 2",
          "year": 2025,
          "director": ["자레드 부시"],
          "cast": ["지니퍼 굿윈"]
        },
        {
          "postId": 5,
          "title": "엘리오",
          "year": 2025,
          "director": ["에이드리언 몰리나"],
          "cast": ["요나스 키브렙"]
        }
      ],
      "comedy": [
        {
          "postId": 7,
          "title": "극한직업 2",
          "year": 2026,
          "director": ["이병헌"],
          "cast": ["류승룡", "이하늬"]
        },
        {
          "postId": 8,
          "title": "데드풀 & 울버린",
          "year": 2024,
          "director": ["션 레비"],
          "cast": ["라이언 레이놀즈"]
        }
      ],
      "romance": [
        {
          "postId": 9,
          "title": "과거의 우리",
          "year": 2025,
          "director": ["셀린 송"],
          "cast": ["그레타 리"]
        },
        {
          "postId": 10,
          "title": "어바웃 타임 리마스터",
          "year": 2024,
          "director": ["리차드 커티스"],
          "cast": ["도널 글리슨"]
        }
      ],
      "action_thriller_crime": [
        {
          "postId": 11,
          "title": "범죄도시 5",
          "year": 2026,
          "director": ["허명행"],
          "cast": ["마동석"]
        },
        {
          "postId": 12,
          "title": "존 윅 5",
          "year": 2026,
          "director": ["채드 스타헬스키"],
          "cast": ["키아누 리브스"]
        }
      ],
      "horror": [
        {
          "postId": 6,
          "title": "노스페라투",
          "year": 2024,
          "director": ["로버트 에거스"],
          "cast": ["빌 스카스가드"]
        },
        {
          "postId": 13,
          "title": "컨저링 4",
          "year": 2025,
          "director": ["마이클 차베즈"],
          "cast": ["베라 파미가"]
        }
      ],
      "sf_fantasy": [
        {
          "postId": 1,
          "title": "왕과 사는 남자",
          "year": 2026,
          "director": ["장현준"],
          "cast": ["유지태"]
        },
        {
          "postId": 4,
          "title": "미키 17",
          "year": 2025,
          "director": ["봉준호"],
          "cast": ["로버트 패틴슨"]
        }
      ],
      "drama": [
        {
          "postId": 14,
          "title": "오펜하이머",
          "year": 2023,
          "director": ["크리스토퍼 놀란"],
          "cast": ["킬리언 머피"]
        },
        {
          "postId": 15,
          "title": "파친코 2",
          "year": 2024,
          "director": ["리안 웰햄"],
          "cast": ["이민호", "김민하"]
        }
      ],
      "documentary": [
        {
          "postId": 16,
          "title": "우리의 지구 3",
          "year": 2025,
          "director": ["데이비드 아텐버러"],
          "cast": ["나레이션"]
        },
        {
          "postId": 17,
          "title": "나의 문어 선생님 2",
          "year": 2026,
          "director": ["제임스 리드"],
          "cast": ["크레이그 포스터"]
        }
      ],
      "music_musical": [
        {
          "postId": 18,
          "title": "위키드",
          "year": 2024,
          "director": ["존 추"],
          "cast": ["아리아나 그란데"]
        },
        {
          "postId": 19,
          "title": "조커: 폴리 아 되",
          "year": 2024,
          "director": ["토드 필립스"],
          "cast": ["호아킨 피닉스", "레이디 가가"]
        }
      ],
      "etc": [
        {
          "postId": 20,
          "title": "월간 영화 특집",
          "year": 2025,
          "director": ["편집팀"],
          "cast": ["기타 출연자"]
        },
        {
          "postId": 21,
          "title": "인디 단편선",
          "year": 2026,
          "director": ["김철수"],
          "cast": ["신인 배우"]
        }
      ]
    }
  }
}
```

**에러 응답**

```json
// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 500 - 서버 오류
{
  "success": false,
  "message": "internal server error",
  "errorCode": "SERVER_ERROR"
}
```

---

### 3-2. 장르별 목록 호출

```
GET /api/movies?genre=${genre}&sort=DESC&offset=${offset}&limit=20
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Query Parameters**

| 변수명            | 타입   | 필수 | 설명                                                                          |
| ----------------- | ------ | ---- | ----------------------------------------------------------------------------- |
| genre (장르)      | string | ❌   | 조회할 장르 키 (아래 장르 키 표 참고). **생략 시 전체 장르 최신순 20개 반환** |
| sort (정렬)       | string | ✅   | 정렬 방식 (`DESC` 고정 - 최신순)                                              |
| offset (시작위치) | number | ✅   | 페이지네이션 시작 위치 (0부터 시작)                                           |
| limit (호출개수)  | number | ✅   | 한 번에 호출할 개수 (20 고정)                                                 |

> ⚠️ **주의사항**
>
> - 한 번에 최대 **20개**씩 호출함.
> - `genre`를 생략하면 장르 구분 없이 업로드된 후기 최신 20개를 반환함.
> - `genre`를 명시할 경우 반드시 아래 장르 키 표의 값을 사용해야 함.

**장르 키 (Genre Keys)**

| 키 (key)              | 장르명               |
| --------------------- | -------------------- |
| animation             | 애니메이션           |
| comedy                | 코미디               |
| romance               | 로맨스               |
| action_thriller_crime | 액션 / 스릴러 / 범죄 |
| horror                | 호러                 |
| sf_fantasy            | SF / 판타지          |
| drama                 | 드라마               |
| documentary           | 다큐멘터리           |
| music_musical         | 음악 / 뮤지컬        |
| etc                   | 기타                 |

**요청 예시**

```
// 장르 지정
GET /api/movies?genre=horror&sort=DESC&offset=0&limit=20

// 장르 미지정 (전체 최신순)
GET /api/movies?sort=DESC&offset=0&limit=20
```

**Response (200 OK)**

`genre` 지정 시:

| 변수명             | 타입     | 설명                                |
| ------------------ | -------- | ----------------------------------- |
| ${genre} (장르명)  | array    | 해당 장르의 게시글 목록 (최대 20개) |
| postId (게시글 ID) | number   | 게시글 고유 ID                      |
| title (제목)       | string   | 영화 제목                           |
| genre (장르)       | string   | 장르명                              |
| year (개봉연도)    | number   | 개봉 연도                           |
| director (감독)    | string[] | 감독 이름 배열                      |
| cast (출연진)      | string[] | 출연진 이름 배열                    |

```json
{
  "success": true,
  "message": "Horror Movies fetched successfully",
  "data": {
    "horror": [
      {
        "postId": 6,
        "title": "노스페라투",
        "genre": "호러",
        "year": 2024,
        "director": ["로버트 에거스"],
        "cast": ["빌 스카스가드"]
      },
      {
        "postId": 13,
        "title": "컨저링 4",
        "genre": "호러",
        "year": 2025,
        "director": ["마이클 차베즈"],
        "cast": ["베라 파미가"]
      }
    ]
  }
}
```

`genre` 미지정 시 (전체 최신순):

| 변수명             | 타입     | 설명                                   |
| ------------------ | -------- | -------------------------------------- |
| recent (최신 목록) | array    | 전체 장르 최신 게시글 목록 (최대 20개) |
| postId (게시글 ID) | number   | 게시글 고유 ID                         |
| title (제목)       | string   | 영화 제목                              |
| genre (장르)       | string   | 장르명                                 |
| year (개봉연도)    | number   | 개봉 연도                              |
| director (감독)    | string[] | 감독 이름 배열                         |
| cast (출연진)      | string[] | 출연진 이름 배열                       |

```json
{
  "success": true,
  "message": "Recent Movies fetched successfully",
  "data": {
    "recent": [
      {
        "postId": 15,
        "title": "미키 17",
        "genre": "SF / 판타지",
        "year": 2025,
        "director": ["봉준호"],
        "cast": ["로버트 패틴슨"]
      },
      {
        "postId": 14,
        "title": "하얼빈",
        "genre": "드라마",
        "year": 2024,
        "director": ["우민호"],
        "cast": ["현빈"]
      }
    ]
  }
}
```

**에러 응답**

```json
// 400 - 유효하지 않은 genre 키
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 404 - 해당 장르에 게시글 없음
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

---

### 3-3. 검색 API

```
GET /api/movies?search=${keyword}&sort=DESC&offset=${offset}&limit=50
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Query Parameters**

| 변수명            | 타입   | 필수 | 설명                                     |
| ----------------- | ------ | ---- | ---------------------------------------- |
| search (검색어)   | string | ✅   | 검색할 키워드 (영화 제목 일부 또는 전체) |
| sort (정렬)       | string | ✅   | 정렬 방식 (`DESC` 고정 - 최신순)         |
| offset (시작위치) | number | ✅   | 페이지네이션 시작 위치 (0부터 시작)      |
| limit (호출개수)  | number | ✅   | 한 번에 호출할 개수 (20 고정)            |

> ⚠️ **주의사항**
>
> - 제목 기준으로 부분 일치 및 전체 일치 모두 검색함.
> - 검색어는 대소문자 구분 없이 처리함.
> - 한 번에 최대 **20개**씩 호출함.

**요청 예시**

```
GET /api/movies?search=노스페라투&sort=DESC&offset=0&limit=20
```

**Response (200 OK)**

| 변수명              | 타입     | 설명                              |
| ------------------- | -------- | --------------------------------- |
| results (검색 결과) | array    | 검색 결과 게시글 목록 (최대 20개) |
| postId (게시글 ID)  | number   | 게시글 고유 ID                    |
| title (제목)        | string   | 영화 제목                         |
| genre (장르)        | string   | 장르명                            |
| year (개봉연도)     | number   | 개봉 연도                         |
| director (감독)     | string[] | 감독 이름 배열                    |
| cast (출연진)       | string[] | 출연진 이름 배열                  |

```json
{
  "success": true,
  "message": "Search results fetched successfully",
  "data": {
    "results": [
      {
        "postId": 6,
        "title": "노스페라투",
        "genre": "호러",
        "year": 2024,
        "director": ["로버트 에거스"],
        "cast": ["빌 스카스가드"]
      }
    ]
  }
}
```

**에러 응답**

```json
// 400 - 검색어 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 404 - 검색 결과 없음
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

---

## 4. 게시글 API

### 4-1. 글 불러오기 (자세히 보기)

```
GET /api/detail/:post_id
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Path Parameters**

| 변수명              | 타입   | 필수 | 설명                    |
| ------------------- | ------ | ---- | ----------------------- |
| post_id (게시글 ID) | number | ✅   | 조회할 게시글의 고유 ID |

**Response (200 OK)**

| 변수명                    | 타입     | 설명                        |
| ------------------------- | -------- | --------------------------- |
| postImage (포스터 이미지) | file     | 업로드된 영화 포스터 이미지 |
| title (제목)              | string   | 영화 제목                   |
| genre (장르)              | string   | 장르 (장르 키 표 참고)      |
| year (개봉연도)           | number   | 개봉 연도                   |
| director (감독)           | string[] | 감독 이름 배열              |
| cast (출연진)             | string[] | 출연진 이름 배열            |
| famousLine (명대사)       | string   | 영화 명대사                 |
| content (후기내용)        | string   | 작성한 후기 내용            |
| star (별점)               | number   | 별점 (0.5 단위, 0.5 ~ 5.0)  |

```json
{
  "success": true,
  "message": "get_post_detail Success",
  "data": {
    "postImage": "{file}",
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
// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 404 - 게시글을 찾을 수 없음
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

### 4-2. 글 쓰기

```
POST /api/movies
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                     | 필수 | 설명                  |
| -------------------------- | ---- | --------------------- |
| Authorization (인증 토큰)  | ✅   | `Bearer {token}`      |
| Content-Type (콘텐츠 타입) | ✅   | `multipart/form-data` |

> ⚠️ **주의사항**
>
> - 이미지가 포함된 경우 반드시 `FormData`로 변환해서 전송해야 함.
> - `genre (장르)`는 정해진 장르 키 값 중에서 선택(select)해야 함.

**장르 키 (Genre Keys)**

| 키 (key)              | 장르명               |
| --------------------- | -------------------- |
| animation             | 애니메이션           |
| comedy                | 코미디               |
| romance               | 로맨스               |
| action_thriller_crime | 액션 / 스릴러 / 범죄 |
| horror                | 호러                 |
| sf_fantasy            | SF / 판타지          |
| drama                 | 드라마               |
| documentary           | 다큐멘터리           |
| music_musical         | 음악 / 뮤지컬        |
| etc                   | 기타                 |

**Request Body (multipart/form-data)**

| 변수명                    | 타입     | 필수    | 설명                             |
| ------------------------- | -------- | ------- | -------------------------------- |
| postImage (포스터 이미지) | file     | ✅      | 업로드할 영화 포스터 이미지      |
| title (제목)              | string   | ✅      | 영화 제목                        |
| star (별점)               | number   | ✅      | 별점 (0.5 단위, 0.5 ~ 5.0)       |
| genre (장르)              | string   | ✅      | 장르 키 (위 장르 키 표에서 선택) |
| content (후기내용)        | string   | ✅      | 작성할 후기 내용                 |
| year (개봉연도)           | number   | ☑️ 옵션 | 개봉 연도                        |
| director (감독)           | string[] | ☑️ 옵션 | 감독 이름 배열                   |
| cast (출연진)             | string[] | ☑️ 옵션 | 출연진 이름 배열                 |
| famousLine (명대사)       | string   | ☑️ 옵션 | 영화 명대사                      |

```json
{
  "postImage": "{file}",
  "title": "왕과 사는 남자",
  "star": 4.5,
  "genre": "sf_fantasy",
  "content": "너무 재밌다",
  "year": 2026,
  "director": ["장항준"],
  "cast": ["유해진", "박지훈", "유지태"],
  "famousLine": "네 이놈! 네놈이 감히 왕족을 능멸하는가"
}
```

**Response (201 Created)**

```json
{
  "success": true,
  "message": "post_upload Success"
}
```

**에러 응답**

```json
// 400 - 필수값 누락 또는 유효하지 않은 genre 키
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 500 - 이미지 업로드 실패
{
  "success": false,
  "message": "internal server error",
  "errorCode": "SERVER_ERROR"
}
```

---

### 4-3. 글 삭제하기

```
DELETE /api/movies/:post_id
```

**✅ 로그인 토큰 필요**

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Path Parameters**

| 변수명              | 타입   | 필수 | 설명                    |
| ------------------- | ------ | ---- | ----------------------- |
| post_id (게시글 ID) | number | ✅   | 삭제할 게시글의 고유 ID |

**Request Body** - 없음

**Response (200 OK)**

```json
{
  "success": true,
  "message": "movie deleted"
}
```

**에러 응답**

```json
// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 403 - 본인 게시글이 아님
{
  "success": false,
  "message": "forbidden",
  "errorCode": "FORBIDDEN"
}

// 404 - 게시글을 찾을 수 없음
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

### 4-4. 글 수정하기

```
PUT /api/movies/:post_id
```

**✅ 로그인 토큰 필요**

> ⚠️ **주의사항**
>
> - 변경된 필드만 선택적으로 전송함.
> - 이미지 포함 여부와 관계없이 항상 `Content-Type: multipart/form-data` 로 전송함.
> - `genre (장르)` 는 정해진 장르 키 값 중에서 선택해야 함. (3-2 장르 키 표 참고)

**Request Headers**

| 변수명                     | 필수 | 설명                                              |
| -------------------------- | ---- | ------------------------------------------------- |
| Authorization (인증 토큰)  | ✅   | `Bearer {token}`                                  |
| Content-Type (콘텐츠 타입) | ✅   | `multipart/form-data` (이미지 유무 관계없이 고정) |

**Path Parameters**

| 변수명              | 타입   | 필수 | 설명                    |
| ------------------- | ------ | ---- | ----------------------- |
| post_id (게시글 ID) | number | ✅   | 수정할 게시글의 고유 ID |

**Request Body** - 변경된 필드만 전송

| 변수명                    | 타입     | 필수    | 설명                              |
| ------------------------- | -------- | ------- | --------------------------------- |
| postImage (포스터 이미지) | file     | ☑️ 옵션 | 변경할 포스터 이미지              |
| title (제목)              | string   | ☑️ 옵션 | 변경할 영화 제목                  |
| star (별점)               | number   | ☑️ 옵션 | 변경할 별점 (0.5 단위, 0.5 ~ 5.0) |
| genre (장르)              | string   | ☑️ 옵션 | 변경할 장르 키                    |
| year (개봉연도)           | number   | ☑️ 옵션 | 변경할 개봉 연도                  |
| director (감독)           | string[] | ☑️ 옵션 | 변경할 감독 이름 배열             |
| cast (출연진)             | string[] | ☑️ 옵션 | 변경할 출연진 이름 배열           |
| famousLine (명대사)       | string   | ☑️ 옵션 | 변경할 명대사                     |
| content (후기내용)        | string   | ☑️ 옵션 | 변경할 후기 내용                  |

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
// 400 - 유효하지 않은 genre 키 또는 형식 오류
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 403 - 본인 게시글이 아님
{
  "success": false,
  "message": "forbidden",
  "errorCode": "FORBIDDEN"
}

// 404 - 게시글을 찾을 수 없음
{
  "success": false,
  "message": "not found",
  "errorCode": "NOT_FOUND"
}
```

---

## 5. 본인 정보 수정 API

### 5-1. 이메일 변경

```
PUT /api/users/email
```

**✅ 로그인 토큰 필요**

> ⚠️ **주의사항**
>
> - 변경할 이메일은 사전에 이메일 인증코드 전송(`1-1`) → 인증코드 확인(`1-2`) 절차를 완료해야 함.

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Request Body**

| 변수명         | 타입   | 필수 | 설명               |
| -------------- | ------ | ---- | ------------------ |
| email (이메일) | string | ✅   | 변경할 이메일 주소 |

```json
{
  "email": "example@gmail.com"
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
// 400 - 이메일 형식 오류 또는 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 409 - 이미 사용 중인 이메일
{
  "success": false,
  "message": "already exists",
  "errorCode": "DUPLICATE"
}
```

---

### 5-2. 비밀번호 변경

```
PUT /api/users/password
```

**✅ 로그인 토큰 필요**

> ⚠️ **주의사항**
>
> - 현재 비밀번호가 일치해야 변경 가능함.
> - `newPassword` : 대문자 1자 이상, 숫자, 특수문자를 반드시 포함해야 함.
> - 현재 비밀번호와 동일한 비밀번호로 변경 불가.

**Request Headers**

| 변수명                     | 필수 | 설명               |
| -------------------------- | ---- | ------------------ |
| Authorization (인증 토큰)  | ✅   | `Bearer {token}`   |
| Content-Type (콘텐츠 타입) | ✅   | `application/json` |

**Request Body**

| 변수명                          | 타입   | 필수 | 설명                                                     |
| ------------------------------- | ------ | ---- | -------------------------------------------------------- |
| currentPassword (현재 비밀번호) | string | ✅   | 사용자의 현재 비밀번호                                   |
| newPassword (새 비밀번호)       | string | ✅   | 변경할 비밀번호 (대문자 1자 이상 + 숫자 + 특수문자 포함) |

```json
{
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass2@"
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
// 400 - 비밀번호 형식 불충족 (대문자/숫자/특수문자 미포함), 필수값 누락, 또는 현재 비밀번호와 동일
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 403 - 현재 비밀번호 불일치
{
  "success": false,
  "message": "forbidden",
  "errorCode": "FORBIDDEN"
}
```

---

### 5-3. 닉네임 변경

```
PUT /api/users/nickname
```

**✅ 로그인 토큰 필요**

> ⚠️ **주의사항**
>
> - `nickname (닉네임)` : 최대 **10자** 제한

**Request Headers**

| 변수명                    | 필수 | 설명             |
| ------------------------- | ---- | ---------------- |
| Authorization (인증 토큰) | ✅   | `Bearer {token}` |

**Request Body**

| 변수명            | 타입   | 필수 | 설명                      |
| ----------------- | ------ | ---- | ------------------------- |
| nickname (닉네임) | string | ✅   | 변경할 닉네임 (최대 10자) |

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
// 400 - 닉네임 10자 초과 또는 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 토큰 없음 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}

// 409 - 이미 사용 중인 닉네임
{
  "success": false,
  "message": "already exists",
  "errorCode": "DUPLICATE"
}
```

---

## 6. 비밀번호 찾기 / 재설정 API

> 로그인하지 않은 상태에서 이메일 인증을 통해 비밀번호를 재설정하는 플로우입니다.
>
> **진행 순서:** 인증코드 전송(`6-1`) → 인증코드 확인(`6-2`) → 비밀번호 재설정(`6-3`)

> 🔐 **보안 설계 (UUID 기반 resetToken)**
>
> - `6-2` 인증 성공 시 서버는 무작위 UUID v4를 생성해 DB에 저장하고 클라이언트에 반환함.
> - UUID는 내용이 없는 불투명(opaque) 토큰이므로 디코딩해도 사용자 정보가 노출되지 않음.
> - 서버는 `reset_tokens` 테이블에서 UUID ↔ user_id ↔ 만료시각을 관리함.
> - `6-3`에서 사용 완료 즉시 해당 row를 삭제해 재사용을 원천 차단함.

---

### 6-1. 비밀번호 재설정용 인증코드 전송

```
POST /api/auth/password/reset/send
```

**🔓 로그인 토큰 불필요**

> ⚠️ **주의사항**
>
> - 가입된 이메일에만 인증코드를 전송함.
> - 가입되지 않은 이메일이어도 보안상 동일한 성공 응답을 반환함 (이메일 존재 여부 노출 방지).
> - 인증코드는 **5분간** 유효함.

**Request Headers**

| 변수명                     | 필수 | 설명               |
| -------------------------- | ---- | ------------------ |
| Content-Type (콘텐츠 타입) | ✅   | `application/json` |

**Request Body**

| 변수명         | 타입   | 필수 | 설명                  |
| -------------- | ------ | ---- | --------------------- |
| email (이메일) | string | ✅   | 가입 시 등록한 이메일 |

```json
{
  "email": "example@gmail.com"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "verification code sent"
}
```

**에러 응답**

```json
// 400 - 이메일 형식 오류 또는 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 500 - 서버 오류 (메일 발송 실패 등)
{
  "success": false,
  "message": "internal server error",
  "errorCode": "SERVER_ERROR"
}
```

---

### 6-2. 비밀번호 재설정용 인증코드 확인

```
POST /api/auth/password/reset/verify
```

**🔓 로그인 토큰 불필요**

> ⚠️ **주의사항**
>
> - 인증코드는 **5분간** 유효하며, 만료 시 재전송(`6-1`) 필요.
> - 인증 성공 시 서버는 UUID v4 형식의 `resetToken`을 생성해 DB에 저장하고 반환함.
> - `resetToken`은 **10분간** 유효하며, `6-3` 완료 즉시 서버에서 삭제됨.
> - 클라이언트는 `resetToken`을 `sessionStorage`에 임시 보관 후 `6-3` 페이지로 전달할 것.

**Request Headers**

| 변수명                     | 필수 | 설명               |
| -------------------------- | ---- | ------------------ |
| Content-Type (콘텐츠 타입) | ✅   | `application/json` |

**Request Body**

| 변수명          | 타입   | 필수 | 설명                       |
| --------------- | ------ | ---- | -------------------------- |
| email (이메일)  | string | ✅   | 인증코드를 전송받은 이메일 |
| code (인증코드) | string | ✅   | 이메일로 받은 인증코드     |

```json
{
  "email": "example@gmail.com",
  "code": "123456"
}
```

**Response (200 OK)**

| 변수명                   | 타입   | 설명                                                         |
| ------------------------ | ------ | ------------------------------------------------------------ |
| resetToken (재설정 토큰) | string | UUID v4 형식의 비밀번호 재설정용 토큰 (유효시간 10분, 1회용) |

```json
{
  "success": true,
  "message": "code verified",
  "data": {
    "resetToken": "a3f7c2d1-8e4b-4f3a-b1c2-d3e4f5a6b7c8"
  }
}
```

**에러 응답**

```json
// 400 - 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - 인증코드 불일치 또는 만료
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}
```

---

### 6-3. 비밀번호 재설정

```
PUT /api/auth/password/reset
```

**🔓 로그인 토큰 불필요** (대신 UUID `resetToken` 필요)

> ⚠️ **주의사항**
>
> - `6-2`에서 발급받은 UUID `resetToken`을 헤더에 포함해야 함.
> - 서버는 DB에서 UUID 조회 → 만료시각 확인 → 비밀번호 변경 → **row 즉시 삭제** 순서로 처리함.
> - `resetToken` 삭제 후 동일 토큰으로 재요청하면 401 반환 (재사용 불가).
> - `newPassword` : 대문자 1자 이상, 숫자, 특수문자를 반드시 포함해야 함.

**Request Headers**

| 변수명                      | 필수 | 설명                                         |
| --------------------------- | ---- | -------------------------------------------- |
| Authorization (재설정 토큰) | ✅   | `Bearer {resetToken}` (UUID, `6-2`에서 발급) |
| Content-Type (콘텐츠 타입)  | ✅   | `application/json`                           |

**Request Body**

| 변수명                    | 타입   | 필수 | 설명                                                     |
| ------------------------- | ------ | ---- | -------------------------------------------------------- |
| newPassword (새 비밀번호) | string | ✅   | 새로 설정할 비밀번호 (대문자 1자 이상 + 숫자 + 특수문자) |

```json
{
  "newPassword": "NewPass2@"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "password reset success"
}
```

**에러 응답**

```json
// 400 - 비밀번호 형식 불충족 또는 필수값 누락
{
  "success": false,
  "message": "invalid request",
  "errorCode": "INVALID_REQUEST"
}

// 401 - resetToken 없음, 만료, 또는 이미 사용됨
{
  "success": false,
  "message": "unauthorized",
  "errorCode": "UNAUTHORIZED"
}
```
