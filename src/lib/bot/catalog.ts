// Operator bot command catalogue.
//
// The bot NEVER generates SQL. It matches a message to one of the fixed commands
// below, each of which owns a reviewed, parameterised query. That is the whole
// security model: the blast radius of a prompt-injection or a creative
// paraphrase is "picked the wrong command from this list", not "ran arbitrary
// SQL as the operator".
//
// Adding a command is a reviewed change (see .claude/skills/add-bot-command) and
// scripts/check-bot-catalog.mjs enforces the invariants below.

import type { Role } from "@/lib/roles";
import { SCOPES } from "@/lib/api/scopes";

export type CommandMode = "read" | "write";

export type CommandParamSpec = {
  name: string;
  kind: "day" | "window_days" | "limit" | "status";
  required: boolean;
  default?: string | number;
};

export type BotCommand = {
  id: string;
  title: string;
  description: string;
  /**
   * Korean and English trigger patterns. Deterministic matching runs first
   * because it is free, auditable, and cannot be talked out of its decision.
   */
  patterns: RegExp[];
  /** Example utterances, shown in the catalogue reply and used by tests. */
  examples: string[];
  params: CommandParamSpec[];
  requiredRole: Role;
  requiredScope: string;
  mode: CommandMode;
  /**
   * Metric id from src/lib/metrics/catalog.ts when this command is a metric
   * read; null when it reads a table directly through a named handler.
   */
  metricId: string | null;
  handler: string;
};

export const BOT_COMMANDS: readonly BotCommand[] = [
  {
    id: "stats.today",
    title: "오늘의 이용 통계",
    description:
      "오늘(UTC) 조회수와 고유 세션 수, 어제 대비 변화를 함께 보여줍니다.",
    patterns: [
      /오늘.*(통계|지표|현황)/,
      /(통계|지표).*(내|알려|보여|뽑아)/,
      /\btoday'?s?\s+(stats|numbers|traffic)\b/i,
    ],
    examples: ["오늘의 유저 통계를 내줘", "오늘 통계 보여줘", "today's stats"],
    params: [{ name: "day", kind: "day", required: false }],
    requiredRole: "admin",
    requiredScope: SCOPES.metricsRead,
    mode: "read",
    metricId: "views.total",
    handler: "statsToday",
  },
  {
    id: "articles.top_read",
    title: "가장 많이 읽힌 문서",
    description:
      "지정한 기간의 문서별 조회수 순위입니다. 기본 7일, 최소 인원 기준 미달 행은 숨깁니다.",
    patterns: [
      /(어떤|무슨|어느).*(게시글|글|문서|아티클).*(많이|제일|가장).*(읽|봤|조회)/,
      /(인기|많이 읽힌|top).*(글|문서|게시글|article)/i,
      /\btop\s+(read|articles|pages)\b/i,
    ],
    examples: [
      "어떤 게시글이 가장 많이 읽혔지?",
      "이번 주 인기 문서 알려줘",
      "top read articles",
    ],
    params: [
      { name: "window_days", kind: "window_days", required: false, default: 7 },
      { name: "limit", kind: "limit", required: false, default: 10 },
    ],
    requiredRole: "editor",
    requiredScope: SCOPES.metricsRead,
    mode: "read",
    metricId: "articles.top_read",
    handler: "metric",
  },
  {
    id: "trending.now",
    title: "지금 뜨는 문서",
    description:
      "오늘의 조회 속도를 최근 7일 기준선과 비교합니다. 누적 순위가 아니라 상승률입니다.",
    patterns: [
      /(뭐|무엇|어떤 것|어떤 게).*(핫|뜨거|트렌드|인기 급상승|급상승)/,
      /(핫|트렌딩|trending).*(뭐|무엇|보여|알려)?/i,
      /\bwhat'?s\s+(hot|trending)\b/i,
    ],
    examples: ["뭐가 가장 핫하지?", "지금 트렌딩 보여줘", "what's hot"],
    params: [
      { name: "limit", kind: "limit", required: false, default: 10 },
    ],
    requiredRole: "editor",
    requiredScope: SCOPES.metricsRead,
    mode: "read",
    metricId: "trending.now",
    handler: "metric",
  },
  {
    id: "content.gaps",
    title: "콘텐츠 공백",
    description:
      "외부 앱이 /resolve로 찾다가 실패한 용어 순위입니다. 다음에 쓸 글의 후보입니다.",
    patterns: [
      /(뭘|무엇을|어떤 걸).*(써야|작성해야|만들어야)/,
      /(공백|빈|없는|부족한).*(문서|글|콘텐츠|주제)/,
      /(resolve|리졸브).*(실패|미스|miss)/i,
      /\bcontent\s+gaps?\b/i,
    ],
    examples: ["지금 뭘 써야 해?", "콘텐츠 공백 보여줘", "content gaps"],
    params: [
      { name: "window_days", kind: "window_days", required: false, default: 30 },
      { name: "limit", kind: "limit", required: false, default: 15 },
    ],
    requiredRole: "editor",
    requiredScope: SCOPES.metricsRead,
    mode: "read",
    metricId: "resolve.top_misses",
    handler: "contentGaps",
  },
  {
    id: "requests.queue",
    title: "콘텐츠 요청 큐",
    description:
      "아직 종결되지 않은 콘텐츠 요청 목록입니다. 사람 제안과 기계 요청을 함께 봅니다.",
    patterns: [
      /(대기|미처리|열린|남은).*(요청|큐|queue)/,
      /(요청).*(보여|알려|목록|리스트)/,
      /\b(open|pending)\s+requests?\b/i,
    ],
    examples: ["대기 중인 글 요청 보여줘", "요청 큐 알려줘", "open requests"],
    params: [
      { name: "status", kind: "status", required: false },
      { name: "limit", kind: "limit", required: false, default: 20 },
    ],
    requiredRole: "editor",
    requiredScope: SCOPES.metricsRead,
    mode: "read",
    metricId: null,
    handler: "requestsQueue",
  },
  {
    id: "clients.usage",
    title: "API 클라이언트 사용량",
    description:
      "클라이언트별 호출 수와 마지막 사용 시각입니다. 비밀값과 개별 요청 내용은 포함하지 않습니다.",
    patterns: [
      /(어느|어떤).*(앱|클라이언트|client).*(썼|사용|호출)/,
      /(api).*(사용량|호출량|usage)/i,
      /\bclient\s+usage\b/i,
    ],
    examples: [
      "어느 앱이 API를 얼마나 썼어?",
      "API 사용량 보여줘",
      "client usage",
    ],
    params: [
      { name: "window_days", kind: "window_days", required: false, default: 7 },
      { name: "limit", kind: "limit", required: false, default: 20 },
    ],
    requiredRole: "admin",
    requiredScope: SCOPES.metricsRead,
    mode: "read",
    metricId: null,
    handler: "clientsUsage",
  },
  {
    id: "requests.triage",
    title: "요청 상태 변경",
    description:
      "콘텐츠 요청의 상태를 바꿉니다. 쓰기 명령이므로 확인 토큰이 필요합니다.",
    patterns: [
      /(요청).*(승인|거절|반영|상태.*(변경|바꿔))/,
      /\b(accept|decline|triage)\s+request\b/i,
    ],
    examples: ["요청 cr_123 승인해줘", "decline request cr_123"],
    params: [
      { name: "status", kind: "status", required: true },
      { name: "limit", kind: "limit", required: false, default: 1 },
    ],
    requiredRole: "admin",
    requiredScope: SCOPES.contentRequestsTriage,
    mode: "write",
    metricId: null,
    handler: "requestsTriage",
  },
];

export const COMMAND_IDS: readonly string[] = BOT_COMMANDS.map((c) => c.id);

export function getCommand(id: string): BotCommand | null {
  return BOT_COMMANDS.find((command) => command.id === id) ?? null;
}

/** Commands the given role may run — used to build the help reply. */
export function commandsForRole(
  role: Role,
  rank: (a: Role, b: Role) => boolean,
): BotCommand[] {
  return BOT_COMMANDS.filter((command) => rank(role, command.requiredRole));
}
