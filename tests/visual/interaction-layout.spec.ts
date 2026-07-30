import { expect, test } from "@playwright/test";

const anonymousAccount = {
  providers: { google: false, github: false },
  user: null,
  github: null,
};

const feedback = {
  summary: { average: 4.4, count: 18 },
  likes: { total: 56, human: 52, agent: 4, viewerLiked: false },
  views: 1_234,
  reviews: [],
  comments: [
    {
      id: "comment-1",
      displayName: "테스트 독자",
      body: "유익한 글이었습니다.",
      parentId: null,
      actorType: "human",
      createdAt: "2026-07-30T12:00:00+09:00",
      updatedAt: "2026-07-30T12:00:00+09:00",
      deletedAt: null,
      isMine: false,
    },
    {
      id: "comment-2",
      displayName: "테스트 독자",
      body: "용어 설명도 이해하기 쉬웠어요.",
      parentId: null,
      actorType: "human",
      createdAt: "2026-07-30T13:00:00+09:00",
      updatedAt: "2026-07-30T13:00:00+09:00",
      deletedAt: null,
      isMine: false,
    },
  ],
  viewer: { signedIn: false, canModerate: false },
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/auth/me", async (request) => {
    await request.fulfill({ json: anonymousAccount });
  });
  await page.route("**/api/articles/*/feedback", async (request) => {
    await request.fulfill({ json: feedback });
  });
});

test("Daily Discovery article title keeps the display type role", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const title = page.locator(".home-fact-panel.is-current strong a");
  const body = page.locator(".home-fact-panel.is-current p");
  await expect(title).toBeVisible();

  const [titleSize, bodySize] = await Promise.all([
    title.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
    body.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
  ]);

  expect(titleSize).toBeGreaterThanOrEqual(32);
  expect(titleSize).toBeGreaterThan(bodySize * 1.8);
});

test("article reactions and actions follow the quiz and precede discussion", async ({
  page,
}) => {
  await page.goto("/wiki/coffee-cherry-to-bean", {
    waitUntil: "networkidle",
  });

  await expect(page.locator(".wiki-title .article-action-area")).toHaveCount(0);
  await expect(page.locator(".article-engagement-counts")).toContainText(
    "1,234",
  );
  await expect(page.locator(".article-engagement-counts")).toContainText("56");
  await expect(page.locator(".article-engagement-counts")).toContainText("2");

  const sectionOrder = await page
    .locator(".article-quiz, .article-action-area, .article-discussion")
    .evaluateAll((elements) =>
      elements.map((element) =>
        element.classList.contains("article-quiz")
          ? "quiz"
          : element.classList.contains("article-action-area")
            ? "actions"
            : "discussion",
      ),
    );
  expect(sectionOrder).toEqual(["quiz", "actions", "discussion"]);

  const actionArea = page.locator(".article-action-area");
  await expect(actionArea.getByRole("button", { name: "좋아요" })).toBeVisible();
  await expect(actionArea.getByRole("link", { name: "댓글 쓰기" })).toBeVisible();
  await expect(actionArea.getByRole("button", { name: "좋아요" })).not.toContainText(
    "56",
  );
});
