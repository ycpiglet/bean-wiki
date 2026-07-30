# Bean Wiki 에이전트 원고 운영

> 목적: 기획된 글을 여러 에이전트가 병렬·순차로 작성하고, 검증 후 커밋·배포까지
> 반복 가능하게 운영합니다. 콘텐츠 기준은 `docs/EDITORIAL.md`가 SSOT입니다.

## 현재 게시 흐름

- 에이전트가 파일을 수정하는 것만으로는 실제 웹에 반영되지 않습니다.
- 정적 콘텐츠는 `src/content/articles/*.html`과 생성 파일
  `src/content/articles/index.ts`에 반영됩니다.
- 라이브 반영은 `main`에 커밋이 올라가고 원격으로 push된 뒤, 연결된 Vercel
  프로젝트가 자동 빌드할 때 이루어집니다. 일반적으로 1~2분 지연이 생깁니다.

### 자동 퍼블리시 명령

```bash
npm run publish:content -- --message "docs(content): publish coffee taxonomy articles"
```

로컬 커밋까지만 수행합니다.

```bash
npm run publish:content:live -- --message "docs(content): publish coffee taxonomy articles"
```

검증, 스테이징, 커밋, `origin` push까지 수행합니다. push가 성공하면 연결된 Vercel
배포가 시작됩니다.

명령이 자동으로 실행하는 게이트:

- `npm run build:content`
- `npm run check-content`
- `npm run check:editorial`
- `git diff --check`

스테이징 대상은 콘텐츠 경로로 제한됩니다.

- `src/content/articles`
- `src/content/media`
- `src/content/resources.ts`
- `src/content/recommendations.ts`
- `src/content/redirects.json`
- `public/article-media`

## 역할 라인업

아래 이름은 프롬프트와 작업 분해에서 쓰는 기본 역할입니다. 한 역할은 자신의
담당 범위만 수정하고, 다른 역할의 작업을 임의로 되돌리지 않습니다.

| 역할 | 목적 | 주 수정 범위 |
| --- | --- | --- |
| `curriculum-steward` | 기획표와 기존 문서의 중복·순서·선수 개념 관리 | `src/content/topic-plan.ts`, `order.json`, related |
| `article-composer` | 새 문서 초안 작성, 큰 구조와 본문 완성 | 신규 `*.html` 단일 파일 |
| `evidence-curator` | 참고자료, 수치, 기관명, “더 깊게 읽기” 보강 | 참고 자료 섹션, `resources.ts` |
| `title-and-lede-editor` | 제목, summary, fact, 첫 섹션의 후킹 개선 | frontmatter, 첫 1~2개 섹션 |
| `naturalness-editor` | 번역투·AI스러운 반복·딱딱한 연결어 교정 | 문장 단위, 의미 보존 |
| `quiz-and-practice-builder` | 퀴즈, 자기 점검, 실습 루틴 작성 | 실습·퀴즈 섹션 |
| `wiki-link-architect` | 내부 링크, related, 역링크 친화 문장 보강 | `<a data-wikilink>`, related |
| `image-researcher` | 허용 라이선스 이미지 검색·증거·로컬 적용 | `public/article-media`, `src/content/media`, figure |
| `release-captain` | 검증, 충돌 확인, 커밋·push·배포 상태 확인 | git, npm scripts |

## 작업 토폴로지

### 여러 글을 새로 쓰는 배치

1. `curriculum-steward`가 대상 주제, slug, related 후보, 순서를 고정합니다.
2. 글마다 `article-composer`를 하나씩 병렬로 배정합니다. 각 composer는 서로 다른
   신규 파일만 만집니다.
3. `evidence-curator`, `quiz-and-practice-builder`, `wiki-link-architect`는 글 묶음을
   나누어 병렬 보강합니다. 같은 파일은 동시에 맡기지 않습니다.
4. `naturalness-editor`가 최종 문장 흐름을 훑습니다.
5. `release-captain`이 `npm run publish:content:live -- --message ...`로 배포합니다.

### 한 글을 깊게 개선하는 파이프라인

1. `evidence-curator`
2. `title-and-lede-editor`
3. `quiz-and-practice-builder`
4. `wiki-link-architect`
5. `naturalness-editor`
6. `image-researcher`
7. `release-captain`

한 파일에 여러 역할이 붙을 때는 위 순서대로 진행합니다. 동시에 같은 파일을 수정하지
않습니다.

## 에이전트 프롬프트 템플릿

### article-composer

```text
너는 Bean Wiki의 article-composer다. docs/EDITORIAL.md를 기준으로 {topicId}
원고를 작성하라. 쓰기 범위는 src/content/articles/{slug}.html 하나와
order.json 등록뿐이다. 기존 글과 중복하지 말고, frontmatter, 6~8개 h2,
표 또는 콜아웃, 실습, 흔한 오해, 참고 자료를 포함하라. 커밋하지 마라.
```

### evidence-curator

```text
너는 Bean Wiki의 evidence-curator다. 지정된 글의 참고자료, 기관명, 수치 표현,
검토일 성격을 점검하고 보강하라. 본문 구조를 크게 바꾸지 말고 근거성만 높여라.
새 자료를 정규 서지로 반복 사용할 가치가 있으면 src/content/resources.ts에 추가하라.
커밋하지 마라.
```

### naturalness-editor

```text
너는 Bean Wiki의 naturalness-editor다. 지정된 글을 합니다체로 자연스럽게 다듬되
사실관계와 구조를 바꾸지 마라. AI식 반복, 과한 일반론, 어색한 연결어를 줄이고
한 문단이 한 생각만 담도록 조정하라. 커밋하지 마라.
```

### quiz-and-practice-builder

```text
너는 Bean Wiki의 quiz-and-practice-builder다. 지정된 글에 독자가 바로 해볼 수 있는
실습과 4~6개 자기 점검 또는 퀴즈 문항을 추가하라. 정답 단정이 필요한 문항보다
개념 구분과 기록 습관을 확인하는 문항을 우선하라. 커밋하지 마라.
```

### wiki-link-architect

```text
너는 Bean Wiki의 wiki-link-architect다. 지정된 글의 내부 위키 링크와 related를
고도화하라. 존재하는 slug를 우선 사용하고, 없는 주제는 붉은 링크 후보로 남길지
새 기획 주제로 분리할지 제안하라. 커밋하지 마라.
```

### image-researcher

```text
너는 Bean Wiki의 image-researcher다. docs/IMAGE-RESEARCH.md를 기준으로 지정된
글에서 시각 자료가 꼭 필요한 위치를 고르고 research:images로 후보를 조사하라.
CC0·PD·CC BY·CC BY-SA이며 작가·라이선스 URL·원본 페이지가 확인된 자료만
실제 이미지를 열어 검토하라. SCA/WCR 공식 향미 휠처럼 NC·ND·유료 계약 자료는
복제하지 말고 공식 링크로 분리하라. 채택 자료는 apply:image로 이미지·증거
JSON·figure를 함께 생성하되 게시하거나 push하지 마라.
```

### release-captain

```text
너는 Bean Wiki의 release-captain이다. 현재 콘텐츠 변경을 검증하고 커밋/배포하라.
npm run publish:content:live -- --message "{commitMessage}"를 실행하고, 실패하면
검증 실패 원인과 수정 범위를 보고하라. 관련 없는 사용자 변경은 스테이징하지 마라.
```

## 커밋 원칙

- 새 글 여러 편이 같은 기획 배치라면 하나의 콘텐츠 커밋으로 묶어도 됩니다.
- 근거 자료 스키마 변경, 퍼블리시 스크립트 변경, UI 변경은 콘텐츠 커밋과 분리합니다.
- 커밋 메시지는 Conventional Commit을 사용합니다.
  - 예: `docs(content): publish botany article batch`
  - 예: `chore(editorial): add agent publishing workflow`

## 운영 체크리스트

- 같은 파일을 두 에이전트가 동시에 수정하지 않았는지 확인합니다.
- `order.json`에는 공개하려는 글만 넣습니다.
- 초안으로 숨길 글은 frontmatter에 `draft: true`를 사용합니다.
- 라이브 게시 전에는 `npm run publish:content -- --dry-run`으로 스테이징 대상을
  먼저 확인할 수 있습니다.
- 라이브 반영이 필요하면 `npm run publish:content:live -- --message ...`를 사용합니다.
