"use client";

import { useMemo, useState } from "react";
import type { TopicTrack } from "@/content/topic-plan";
import type { Level } from "@/content/types";

type Priority = "전체" | "P0" | "P1" | "P2";
type LevelFilter = "전체" | Level;

export function TopicRoadmap({ tracks }: { tracks: TopicTrack[] }) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority>("전체");
  const [level, setLevel] = useState<LevelFilter>("전체");

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return tracks
      .map((track) => ({
        ...track,
        topics: track.topics.filter((topic) => {
          const matchesQuery =
            !needle ||
            `${topic.id} ${topic.title} ${topic.focus}`
              .toLocaleLowerCase("ko")
              .includes(needle);
          const matchesPriority =
            priority === "전체" || topic.priority === priority;
          const matchesLevel = level === "전체" || topic.level === level;
          return matchesQuery && matchesPriority && matchesLevel;
        }),
      }))
      .filter((track) => track.topics.length > 0);
  }, [level, priority, query, tracks]);

  const count = filtered.reduce((sum, track) => sum + track.topics.length, 0);

  return (
    <div className="roadmap-browser">
      <div className="roadmap-controls">
        <label>
          <span>주제 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="발효, 수면, 케냐, 열전달…"
          />
        </label>
        <div>
          <span>우선순위</span>
          {(["전체", "P0", "P1", "P2"] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={priority === option ? "is-active" : ""}
              onClick={() => setPriority(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div>
          <span>난이도</span>
          {(["전체", "입문", "중급", "전문"] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={level === option ? "is-active" : ""}
              onClick={() => setLevel(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="roadmap-count" aria-live="polite">기획 문서 {count}편</p>

      {filtered.map((track) => (
        <section className="roadmap-track" key={track.code}>
          <header>
            <span>{track.code}</span>
            <div>
              <h2>{track.name}</h2>
              <p>{track.description}</p>
            </div>
            <small>{track.sources}</small>
          </header>
          <div className="roadmap-grid">
            {track.topics.map((topic) => (
              <article key={topic.id}>
                <div>
                  <span>{topic.id}</span>
                  <em className={`priority-${topic.priority.toLowerCase()}`}>
                    {topic.priority}
                  </em>
                  <small>{topic.level}</small>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.focus}</p>
                <footer>근거 후보 · {topic.sources}</footer>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
