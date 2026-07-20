import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404 · NOT FOUND</span>
      <h1>아직 볶이지 않은 문서예요.</h1>
      <p>찾고 있는 커피 지식이 없거나 주소가 변경되었습니다.</p>
      <Link href="/">Bean Wiki 홈으로 돌아가기 →</Link>
    </main>
  );
}

