"use client";

// Admin queue: approve or reject self-declared credentials. Approving is what
// turns a submission into a public badge, so the evidence link is front and
// centre and a rejection asks for a reason the submitter will see.
import { useState } from "react";
import { CREDENTIAL_LABEL, type Credential } from "@/lib/profile-store";

export function CredentialReview({ initial }: { initial: Credential[] }) {
  const [items, setItems] = useState(initial);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(id: string, status: "verified" | "rejected") {
    if (status === "rejected" && !notes[id]?.trim()) {
      setError("반려할 때는 사유를 적어주세요. 제출자에게 그대로 표시됩니다.");
      return;
    }
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, note: notes[id] ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setItems((prev) => prev.filter((c) => c.id !== id));
      else setError(data.message ?? `HTTP ${res.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "network error");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <p className="acct-note">심사 대기 중인 자격이 없습니다.</p>;
  }

  return (
    <>
      {error && (
        <p className="acct-inline-err" role="alert">
          {error}
        </p>
      )}
      <ul className="acct-cred-list">
        {items.map((c) => (
          <li key={c.id} className="acct-review-item">
            <div>
              <strong>{c.title}</strong>
              <span className="acct-note">
                {CREDENTIAL_LABEL[c.kind]}
                {c.issuer ? ` · ${c.issuer}` : ""}
                {c.credential_id ? ` · No. ${c.credential_id}` : ""}
                {c.issued_on ? ` · ${c.issued_on}` : ""}
              </span>
              <span className="acct-note">신청자: {c.account_key}</span>
              {c.evidence_url ? (
                <a href={c.evidence_url} target="_blank" rel="noreferrer">
                  증빙 확인 ↗
                </a>
              ) : (
                <span className="acct-inline-err">증빙 링크 없음</span>
              )}
              <textarea
                rows={2}
                placeholder="심사 메모 (반려 시 필수, 제출자에게 표시됨)"
                value={notes[c.id] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
              />
            </div>
            <div className="acct-cred-actions">
              <button
                type="button"
                className="acct-button"
                disabled={busy === c.id}
                onClick={() => review(c.id, "verified")}
              >
                승인
              </button>
              <button
                type="button"
                className="acct-button is-quiet"
                disabled={busy === c.id}
                onClick={() => review(c.id, "rejected")}
              >
                반려
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
