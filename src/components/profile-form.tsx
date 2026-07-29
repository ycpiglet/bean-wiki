"use client";

// Self-editable profile fields. Skill tier and admin status are absent by
// design — the server derives those and rejects them in the patch.
import { useState } from "react";
import type { CoffeeRole, Gender, Profile } from "@/lib/profile-store";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "undisclosed", label: "밝히지 않음" },
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
  { value: "other", label: "그 외 / 직접 서술" },
];

const ROLES: { value: CoffeeRole; label: string }[] = [
  { value: "enthusiast", label: "커피 애호가" },
  { value: "home_brewer", label: "홈브루어" },
  { value: "barista", label: "바리스타" },
  { value: "roaster", label: "로스터" },
  { value: "q_grader", label: "Q 그레이더 · 커퍼" },
  { value: "educator", label: "교육자 · 트레이너" },
  { value: "producer", label: "생산자 · 농장" },
  { value: "other", label: "기타" },
];

type State = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    nickname: profile.nickname ?? "",
    full_name: profile.full_name ?? "",
    gender: profile.gender,
    pronouns: profile.pronouns ?? "",
    role: profile.role,
    years_experience: profile.years_experience?.toString() ?? "",
    region: profile.region ?? "",
    website: profile.website ?? "",
    bio: profile.bio ?? "",
  });
  const [state, setState] = useState<State>({ kind: "idle" });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setState({ kind: "idle" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setState({ kind: "saving" });
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          years_experience: form.years_experience === "" ? null : Number(form.years_experience),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState({ kind: "saved" });
      } else {
        setState({
          kind: "error",
          message: Array.isArray(data.errors)
            ? data.errors.join(" ")
            : (data.message ?? `HTTP ${res.status}`),
        });
      }
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "network error",
      });
    }
  }

  return (
    <form className="acct-form" onSubmit={save}>
      <div className="acct-form-grid">
        <label>
          <span>닉네임</span>
          <input
            type="text"
            value={form.nickname}
            placeholder="위키에 표시할 이름"
            maxLength={24}
            onChange={(e) => set("nickname", e.target.value)}
          />
          <small>2~24자. 문서·커뮤니티에 이 이름이 보입니다.</small>
        </label>

        <label>
          <span>이름</span>
          <input
            type="text"
            value={form.full_name}
            placeholder="실명 (비공개)"
            maxLength={60}
            onChange={(e) => set("full_name", e.target.value)}
          />
          <small>자격 심사 확인용으로만 쓰이고 공개되지 않습니다.</small>
        </label>

        <label>
          <span>성별</span>
          <select value={form.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <small>선택 항목입니다. 공개되지 않습니다.</small>
        </label>

        <label>
          <span>호칭 (선택)</span>
          <input
            type="text"
            value={form.pronouns}
            placeholder="예: 그, 그녀, 이름으로"
            maxLength={30}
            onChange={(e) => set("pronouns", e.target.value)}
          />
        </label>

        <label>
          <span>커피와의 관계</span>
          <select value={form.role} onChange={(e) => set("role", e.target.value as CoffeeRole)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <small>자기 신고 값입니다. 검증된 자격은 아래에서 등록합니다.</small>
        </label>

        <label>
          <span>경력 (년)</span>
          <input
            type="number"
            min={0}
            max={80}
            value={form.years_experience}
            placeholder="0"
            onChange={(e) => set("years_experience", e.target.value)}
          />
        </label>

        <label>
          <span>활동 지역</span>
          <input
            type="text"
            value={form.region}
            placeholder="예: 서울, 부산"
            maxLength={60}
            onChange={(e) => set("region", e.target.value)}
          />
        </label>

        <label>
          <span>웹사이트</span>
          <input
            type="url"
            value={form.website}
            placeholder="https://"
            maxLength={200}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <label className="acct-form-wide">
        <span>소개</span>
        <textarea
          value={form.bio}
          rows={4}
          maxLength={500}
          placeholder="어떤 커피를 좋아하고, 무엇을 배우고 있는지 적어보세요."
          onChange={(e) => set("bio", e.target.value)}
        />
        <small>{form.bio.length}/500</small>
      </label>

      <div className="acct-form-actions">
        <button type="submit" className="acct-button" disabled={state.kind === "saving"}>
          {state.kind === "saving" ? "저장 중…" : "프로필 저장"}
        </button>
        {state.kind === "saved" && (
          <span className="acct-inline-ok" role="status">
            저장했습니다.
          </span>
        )}
        {state.kind === "error" && (
          <span className="acct-inline-err" role="alert">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
