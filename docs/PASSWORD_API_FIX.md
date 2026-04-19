# 비밀번호 변경 API 버그 수정 안내

> 2026-04-19 서버 수정 완료

## 수정 내용

### 버그 1: 필드명 불일치

| 항목 | 수정 전 (서버) | 수정 후 (서버) |
|------|---------------|---------------|
| 현재 비밀번호 | 없음 | `currentPassword` (필수) |
| 새 비밀번호 | `password` | `newPassword` (필수) |

### 버그 2: 현재 비밀번호 미검증

수정 전에는 현재 비밀번호를 확인하지 않아 아무 값이나 넣어도 비밀번호가 변경되었습니다.
수정 후에는 `currentPassword`가 실제 비밀번호와 일치하지 않으면 400 에러를 반환합니다.

---

## API 명세

```
PUT /api/buildup/v1/users/password
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `currentPassword` | string | O | 현재 비밀번호 |
| `newPassword` | string | O | 새 비밀번호 (8~50자, 대문자+숫자+특수문자 포함) |

### 응답

**성공 (200)**
```json
{
  "success": true,
  "message": "password change Success"
}
```

**현재 비밀번호 불일치 (400)**
```json
{
  "success": false,
  "message": "현재 비밀번호가 일치하지 않습니다.",
  "errorCode": "INVALID_REQUEST"
}
```

**새 비밀번호 규칙 위반 (400)**
```json
{
  "success": false,
  "message": "newPassword: 비밀번호는 대문자 1자 이상, 숫자, 특수문자를 포함해야 합니다.",
  "errorCode": "INVALID_REQUEST"
}
```

---

## 프론트엔드 수정 가이드

`src/API/mypageAPI/changePassword.js` 수정이 필요합니다.

### 수정 전

```js
body: JSON.stringify({
  currentPassword: password,
  password: newPassword,     // ← 서버가 인식하지 않는 필드명
}),
```

### 수정 후

```js
body: JSON.stringify({
  currentPassword: password,
  newPassword: newPassword,  // ← password → newPassword로 변경
}),
```

---

## 검색 API 관련 안내

검색 API(`GET /movies/search?keyword=...`)는 서버에 문제가 없습니다.

검색 대상은 **본인이 작성한 영화 후기의 제목**입니다.

- '부산행'으로 검색 → 본인이 '부산행'이라는 제목의 후기를 작성한 적이 있어야 결과가 나옵니다
- 다른 사용자의 후기는 검색 대상에 포함되지 않습니다
- 전체 목록(`/movies`)도 본인 글만 표시하기 때문에, 검색 결과가 목록과 동일하게 보일 수 있습니다

검색이 안 되는 경우 확인할 사항:
1. 검색어가 정확히 제목에 포함되어 있는지 (예: "부산행"이라는 제목의 후기가 있는지)
2. API 호출 시 `keyword` 파라미터가 올바르게 전달되고 있는지 (개발자 도구 Network 탭 확인)
3. 전체 목록 API와 검색 API의 URL이 다른지 확인 (`/movies` vs `/movies/search?keyword=...`)
