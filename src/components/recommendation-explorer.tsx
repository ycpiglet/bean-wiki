"use client";

import { useEffect, useMemo, useState } from "react";
import {
  editorialRecommendations,
  type RecommendationItem,
  type RecommendationKind,
} from "@/content/recommendations";

const labels: Record<RecommendationKind | "all", string> = {
  all: "전체",
  store: "매장",
  menu: "메뉴",
  bean: "원두",
  recipe: "레시피",
};

export function RecommendationExplorer() {
  const [external, setExternal] = useState<RecommendationItem[]>([]);
  const [filter, setFilter] = useState<RecommendationKind | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/recommendations", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .then((data: { items: RecommendationItem[] }) => setExternal(data.items))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const items = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return [...external, ...editorialRecommendations].filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;
      if (!normalized) return true;
      return [
        item.storeName,
        item.name,
        item.area,
        item.summary,
        ...item.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(normalized);
    });
  }, [external, filter, query]);

  return (
    <section className="recommendation-explorer">
      <div className="recommendation-toolbar">
        <div role="tablist" aria-label="추천 유형">
          {(Object.keys(labels) as (RecommendationKind | "all")[]).map((kind) => (
            <button
              type="button"
              role="tab"
              key={kind}
              aria-selected={filter === kind}
              className={filter === kind ? "is-active" : ""}
              onClick={() => setFilter(kind)}
            >
              {labels[kind]}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">추천 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="지역, 향미, 메뉴, 원두 검색"
          />
        </label>
      </div>

      {filter === "store" && external.filter((item) => item.kind === "store").length === 0 && (
        <aside className="integration-note">
          <strong>매장 데이터 연동 준비 완료</strong>
          <p>
            외부 커피체리 앱의 API 주소와 인증값을 연결하면 매장·메뉴·원두 평가가
            출처와 함께 이곳에 자동으로 표시됩니다.
          </p>
        </aside>
      )}

      <div className="recommendation-grid">
        {items.map((item) => (
          <article key={`${item.sourceName}-${item.id}`}>
            <div className="recommendation-card-head">
              <span>{labels[item.kind]}</span>
              {item.rating !== null && (
                <strong>{item.rating.toFixed(1)} <small>({item.reviewCount})</small></strong>
              )}
            </div>
            {item.storeName && <small>{item.area ? `${item.area} · ` : ""}{item.storeName}</small>}
            <h2>{item.name}</h2>
            <p>{item.summary}</p>
            <div className="recommendation-tags">
              {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <footer>
              <span>출처: {item.sourceName}</span>
              {item.sourceUrl && <a href={item.sourceUrl}>원문 보기 →</a>}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
