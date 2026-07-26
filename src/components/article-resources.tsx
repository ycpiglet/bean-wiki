import { resourcesForCategory } from "@/content/resources";

export function ArticleResources({ category }: { category: string }) {
  const items = resourcesForCategory(category);
  if (!items.length) return null;

  return (
    <section className="article-resources">
      <div className="article-resources-heading">
        <span>더 깊게 읽기</span>
        <h2>논문·서적·표준·강의</h2>
        <p>
          이 글의 다음 단계로 읽기 좋은 자료입니다. 표준과 교육 과정은
          개정될 수 있으므로 링크된 기관의 최신판을 확인하세요.
        </p>
      </div>
      <ol>
        {items.map((resource) => (
          <li key={resource.id}>
            <div>
              <span>{resource.kind}</span>
              {resource.openAccess && <em>OPEN</em>}
            </div>
            <a href={resource.url} target="_blank" rel="noreferrer">
              {resource.title} ↗
            </a>
            <p>{resource.citation}</p>
            <small>{resource.description}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
