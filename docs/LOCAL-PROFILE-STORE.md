# 로컬 프로필 저장소

운영 Bean Wiki는 `PROFILE_STORE_MODE`를 명시하지 않으면 읽기 전용으로
동작한다. 따라서 호스팅된 Supabase 프로젝트가 중지되어도 공개 문서, 검색,
커뮤니티와 GitHub 편집 경로는 계속 사용할 수 있다.

프로필·실력 측정·자격 심사를 포함한 전체 계정 기능은 로컬 Supabase로
개발한다. 별도의 클라우드 프로젝트나 API 키는 필요하지 않다.

## 전체 개발 모드

Docker가 실행 중인 상태에서 다음 명령을 사용한다.

```bash
npm run dev:full
```

이 명령은 다음을 자동으로 수행한다.

1. Bean Wiki 전용 로컬 Supabase를 `55321`/`55322` 포트에서 시작한다.
   Docker 포트는 loopback 전용 네트워크에 묶여 같은 LAN에 노출되지 않는다.
2. 로컬 API URL은 접속 확인용으로 출력하고, service-role 키는 출력하지 않은 채
   개발 서버에만 전달한다.
3. `developer@bean.wiki` 개발 계정을 관리자 목록에 추가한다.
4. 여러 워크트리가 함께 떠 있어도 파일 감시 한도를 넘기지 않도록 polling
   모드의 Next.js 개발 서버를 시작한다.

`/account`에서 **개발 계정으로 로그인**을 선택하면 프로필 수정, 실력 측정,
자격 등록과 `/admin/credentials` 심사를 모두 시험할 수 있다. 개발 계정은
`NODE_ENV=development`이면서 `BEAN_WIKI_DEV_AUTH=1`인 경우에만 존재한다.
외부에서 접근 가능한 개발 서버에는 이 모드를 사용하지 않는다.

GitHub에 실제 커밋하거나 PR을 만드는 편집 동작은 계속 실제 GitHub OAuth
연동이 필요하다. 로컬 개발 계정은 GitHub 토큰을 모방하지 않는다.

## 데이터베이스 명령

```bash
npm run profile-db:start
npm run profile-db:reset
npm run profile-db:test
npm run profile-db:stop
```

- 스키마가 바뀌었거나 로컬 DB가 어긋났으면 `profile-db:reset`을 실행한다.
- `profile-db:test`는 RLS, 권한, 프로필·퀴즈·자격 저장 계약을 검증한다.
- 로컬 데이터는 `profile-db:stop` 뒤에도 유지된다.

## 운영에서 다시 활성화

호스팅된 프로필 저장소를 다시 사용할 때만 운영 환경에 아래 값을 모두
설정하고 새로 배포한다.

```text
PROFILE_STORE_MODE=supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`PROFILE_STORE_MODE=disabled`는 환경과 관계없이 읽기 전용 모드를 강제한다.
알 수 없는 모드나 불완전한 자격증명은 안전하게 비활성 상태로 처리된다.
