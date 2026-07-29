"use client";

// Register an expertise credential (SCA certificate, Q Grader, …). Submitting
// marks it 심사 대기; an admin has to verify it before the badge appears, so the
// status shown here is the honest state, never an assumed pass.
import { useState } from "react";
import { CREDENTIAL_LABEL, type Credential, type CredentialKind } from "@/lib/profile-store";

const KINDS = Object.entries(CREDENTIAL_LABEL) as [CredentialKind, string][];

const STATUS_LABEL: Record<Credential["status"], string> = {
  pending: "심사 대기",
  verified: "인증됨",
  rejected: "반려",
};

type State = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

export function CredentialPanel({ initial }: { initial: Credential[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [form, setForm] = useState({
    kind: "sca_barista" as CredentialKind,
    title: "",
    issuer: "",
    credential_id: "",
    issued_on: "",
    evidence_url: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/profile/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.credential) {
        setItems((prev) => [data.credential as Credential, ...prev]);
        setForm({
          kind: "sca_barista",
          title: "",
          issuer: "",
          credential_id: "",
          issued_on: "",
          evidence_url: "",
        });
        setOpen(false);
        setState({ kind: "idle" });
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

  async function withdraw(id: string) {
    if (!window.confirm("이 자격 등록을 철회할까요?")) return;
    const res = await fetch(`/api/profile/credentials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      {items.length === 0 ? (
        <p className="acct-note">
          등록한 자격이 없습니다. SCA 자격증이나 Q 그레이더 같은 증빙을 등록하면 관리자
          확인 후 프로필에 배지가 붙습니다.
        </p>
      ) : (
        <ul className="acct-cred-list">
          {items.map((c) => (
            <li key={c.id}>
              <div>
                <strong>{c.title}</strong>
                <span className="acct-note">
                  {CREDENTIAL_LABEL[c.kind]}
                  {c.issuer ? ` · ${c.issuer}` : ""}
                  {c.issued_on ? ` · ${c.issued_on}` : ""}
                </span>
                {c.status === "rejected" && c.review_note && (
                  <span className="acct-inline-err">반려 사유: {c.review_note}</span>
                )}
              </div>
              <div className="acct-cred-actions">
                <span className={`acct-status is-${c.status}`}>{STATUS_LABEL[c.status]}</span>
                {c.status !== "verified" && (
                  <button type="button" className="acct-mini" onClick={() => withdraw(c.id)}>
                    철회
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!open ? (
        <button type="button" className="acct-button" onClick={() => setOpen(true)}>
          자격 등록하기
        </button>
      ) : (
        <form className="acct-form" onSubmit={submit}>
          <div className="acct-form-grid">
            <label>
              <span>자격 종류</span>
              <select
                value={form.kind}
                onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as CredentialKind }))}
              >
                {KINDS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>자격 이름</span>
              <input
                type="text"
                required
                value={form.title}
                placeholder="예: SCA Barista Skills Intermediate"
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label>
              <span>발급 기관</span>
              <input
                type="text"
                value={form.issuer}
                placeholder="예: SCA, CQI"
                onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
              />
            </label>
            <label>
              <span>자격 번호</span>
              <input
                type="text"
                value={form.credential_id}
                placeholder="증서에 적힌 번호"
                onChange={(e) => setForm((f) => ({ ...f, credential_id: e.target.value }))}
              />
            </label>
            <label>
              <span>취득일</span>
              <input
                type="date"
                value={form.issued_on}
                onChange={(e) => setForm((f) => ({ ...f, issued_on: e.target.value }))}
              />
            </label>
            <label>
              <span>증빙 링크</span>
              <input
                type="url"
                value={form.evidence_url}
                placeholder="https:// 자격 확인 페이지 또는 증서 이미지"
                onChange={(e) => setForm((f) => ({ ...f, evidence_url: e.target.value }))}
              />
              <small>SCA 자격은 credentials.sca.coffee 검증 링크가 가장 확실합니다.</small>
            </label>
          </div>
          <div className="acct-form-actions">
            <button type="submit" className="acct-button" disabled={state.kind === "sending"}>
              {state.kind === "sending" ? "제출 중…" : "심사 요청"}
            </button>
            <button type="button" className="acct-button is-quiet" onClick={() => setOpen(false)}>
              취소
            </button>
            {state.kind === "error" && (
              <span className="acct-inline-err" role="alert">
                {state.message}
              </span>
            )}
          </div>
        </form>
      )}
    </>
  );
}
