"use client";

import { useState } from "react";

const STORAGE_KEY = "bean-wiki-inquiries-v1";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [reference, setReference] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = `BW-${Date.now().toString(36).toUpperCase()}`;
    const inquiry = {
      id,
      category: form.get("category"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
      createdAt: new Date().toISOString(),
    };
    try {
      const current = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "[]",
      );
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([inquiry, ...current]),
      );
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([inquiry]));
    }
    setReference(id);
    setSent(true);
    event.currentTarget.reset();
  }

  if (sent) {
    return (
      <div className="contact-success" role="status">
        <span>문의 기록 저장 완료</span>
        <h2>의견을 남겨 주셔서 감사합니다.</h2>
        <p>
          접수 번호는 <strong>{reference}</strong>입니다. 현재 미리보기 단계에서는
          이 브라우저에만 저장되며 운영진에게 자동 전송되지는 않습니다.
        </p>
        <button type="button" onClick={() => setSent(false)}>
          다른 문의 작성
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-field">
        <label htmlFor="contact-category">문의 유형</label>
        <select id="contact-category" name="category" required defaultValue="">
          <option value="" disabled>선택해 주세요</option>
          <option value="content">내용 수정·오류 제보</option>
          <option value="source">출처·저작권 문의</option>
          <option value="feature">기능 제안</option>
          <option value="community">커뮤니티 신고</option>
          <option value="partnership">교육·협업 제안</option>
          <option value="other">기타</option>
        </select>
      </div>
      <div className="contact-field">
        <label htmlFor="contact-email">답변 받을 이메일</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="coffee@example.com"
        />
      </div>
      <div className="contact-field">
        <label htmlFor="contact-subject">제목</label>
        <input
          id="contact-subject"
          name="subject"
          required
          minLength={3}
          maxLength={100}
          placeholder="문의 내용을 한 줄로 알려 주세요"
        />
      </div>
      <div className="contact-field">
        <label htmlFor="contact-message">상세 내용</label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={9}
          placeholder="관련 문서 주소, 확인한 출처, 재현 방법을 함께 적으면 더 빠르게 검토할 수 있습니다."
        />
      </div>
      <label className="contact-consent">
        <input type="checkbox" required />
        <span>문의 처리를 위한 입력 정보의 브라우저 저장에 동의합니다.</span>
      </label>
      <button type="submit" className="primary-button">문의 기록 남기기</button>
    </form>
  );
}
