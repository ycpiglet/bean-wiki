import { expect, test } from "@playwright/test";

const routes = [
  { name: "home", path: "/" },
  {
    name: "coffee-cherry-to-bean",
    path: "/wiki/coffee-cherry-to-bean",
  },
  { name: "analytics", path: "/analytics" },
  { name: "brand-colors", path: "/design/colors" },
] as const;

const themes = ["light", "dark"] as const;

const anonymousAccount = {
  providers: { google: false, github: false },
  user: null,
  github: null,
};

const emptyFeedback = {
  summary: { average: null, count: 0 },
  likes: { total: 0, human: 0, agent: 0, viewerLiked: false },
  views: 0,
  reviews: [],
  comments: [],
  viewer: { signedIn: false, canModerate: false },
};

for (const route of routes) {
  for (const theme of themes) {
    test(`${route.name} — ${theme}`, async ({ page }) => {
      await page.clock.setFixedTime(
        new Date("2026-07-30T12:00:00+09:00"),
      );
      await page.emulateMedia({
        colorScheme: theme,
        reducedMotion: "reduce",
      });
      await page.addInitScript((selectedTheme) => {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.localStorage.setItem("theme", selectedTheme);
      }, theme);

      await page.route("**/api/auth/me", async (request) => {
        await request.fulfill({ json: anonymousAccount });
      });
      await page.route("**/api/me", async (request) => {
        await request.fulfill({
          json: { user: null, profile: null, stats: {} },
        });
      });
      await page.route("**/api/articles/*/feedback", async (request) => {
        await request.fulfill({ json: emptyFeedback });
      });

      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      await page.addStyleTag({
        content: `
          *,
          *::before,
          *::after {
            animation-delay: 0s !important;
            animation-duration: 0s !important;
            caret-color: transparent !important;
            scroll-behavior: auto !important;
            transition-delay: 0s !important;
            transition-duration: 0s !important;
          }
        `,
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          Array.from(document.images, (image) =>
            image.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  image.addEventListener("load", () => resolve(), {
                    once: true,
                  });
                  image.addEventListener("error", () => resolve(), {
                    once: true,
                  });
                }),
          ),
        );
        window.scrollTo(0, 0);
      });

      let snapshotName = `${route.name}-${theme}.png`;
      if (route.name === "coffee-cherry-to-bean") {
        const actionArea = page.locator(".article-action-area");
        await expect(actionArea).toHaveCount(1);
        const actionsAtContentEnd =
          (await page.locator(".wiki-title .article-action-area").count()) === 0;
        if (actionsAtContentEnd) {
          snapshotName = `${route.name}-content-end-${theme}.png`;
          const actionsBeforeDiscussion = await actionArea.evaluate((element) => {
            const discussion = document.querySelector(".article-discussion");
            return Boolean(
              discussion &&
                (element.compareDocumentPosition(discussion) &
                  Node.DOCUMENT_POSITION_FOLLOWING),
            );
          });
          expect(actionsBeforeDiscussion).toBe(true);
          await expect(actionArea).toHaveScreenshot(
            `${route.name}-content-end-actions-${theme}.png`,
          );
        }
      }

      await expect(page).toHaveScreenshot(snapshotName, {
        fullPage: false,
      });
    });
  }
}
