#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const targetUrl = process.argv[2] ?? "http://127.0.0.1:3100/design/colors";
const artifactDir = process.env.PALETTE_ARTIFACT_DIR ?? join(tmpdir(), "bean-wiki-palette");
const chromeCandidates = [
  process.env.CHROME_BIN,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
].filter(Boolean);
const chromeBin = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chromeBin) {
  console.error("✗ palette browser check: Chrome executable not found");
  process.exit(1);
}

const getPort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForJson(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpSession {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
    this.errors = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }

      if (message.method === "Runtime.exceptionThrown") {
        this.errors.push(message.params.exceptionDetails.text);
      }
      if (
        message.method === "Log.entryAdded" &&
        message.params.entry.level === "error"
      ) {
        this.errors.push(message.params.entry.text);
      }

      const waiters = this.waiters.get(message.method);
      if (waiters?.length) waiters.shift()(message.params);
    });
  }

  call(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject(new Error(`Timed out waiting for ${method}`)),
        timeout,
      );
      const resolveOnce = (params) => {
        clearTimeout(timeoutId);
        resolve(params);
      };
      const waiters = this.waiters.get(method) ?? [];
      waiters.push(resolveOnce);
      this.waiters.set(method, waiters);
    });
  }

  async evaluate(expression) {
    const result = await this.call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text,
      );
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

const assertions = [];
function assert(condition, message) {
  if (!condition) assertions.push(message);
}

const port = await getPort();
const profileDir = mkdtempSync(join(tmpdir(), "bean-wiki-palette-chrome-"));
mkdirSync(artifactDir, { recursive: true });
const chrome = spawn(
  chromeBin,
  [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let session;
try {
  await waitForJson(`http://127.0.0.1:${port}/json/version`);
  const page = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(targetUrl)}`,
    { method: "PUT" },
  ).then((response) => response.json());
  session = new CdpSession(page.webSocketDebuggerUrl);
  await session.connect();
  await Promise.all([
    session.call("Page.enable"),
    session.call("Runtime.enable"),
    session.call("Log.enable"),
  ]);
  await session.call("Browser.grantPermissions", {
    origin: new URL(targetUrl).origin,
    permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
  });
  await session.call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const loaded = session.waitFor("Page.loadEventFired");
  await session.call("Page.navigate", { url: targetUrl });
  await loaded;
  await wait(600);

  const desktop = await session.evaluate(`(() => {
    const cards = [...document.querySelectorAll(".palette-card")];
    const codes = [...document.querySelectorAll(".palette-code-row code")];
    const widths = cards.map((card) => Math.round(card.getBoundingClientRect().width));
    const firstRect = cards[0]?.getBoundingClientRect();
    return {
      title: document.title,
      bodyLength: document.body.innerText.trim().length,
      hasOverlay: Boolean(document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay")),
      cardCount: cards.length,
      codeCount: codes.length,
      firstCode: codes[0]?.textContent,
      firstColor: getComputedStyle(document.querySelector(".palette-chip")).backgroundColor,
      pageBackground: getComputedStyle(document.body).backgroundColor,
      firstCardBox: firstRect ? {
        x: firstRect.left + window.scrollX,
        y: firstRect.top + window.scrollY,
        width: firstRect.width,
        height: firstRect.height
      } : null,
      minWidth: Math.min(...widths),
      maxWidth: Math.max(...widths),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  })()`);

  assert(desktop.bodyLength > 1000, "page body is unexpectedly empty");
  assert(!desktop.hasOverlay, "framework error overlay is visible");
  assert(desktop.cardCount === 47, `expected 47 cards, found ${desktop.cardCount}`);
  assert(desktop.codeCount === 47, `expected 47 HEX rows, found ${desktop.codeCount}`);
  assert(desktop.firstCode === "#A03D36", `unexpected first HEX ${desktop.firstCode}`);
  assert(desktop.maxWidth - desktop.minWidth <= 1, "desktop card widths are not uniform");
  assert(!desktop.horizontalOverflow, "desktop page has horizontal overflow");
  const lightCardShot = await session.call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      ...desktop.firstCardBox,
      scale: 1,
    },
  });
  const lightCardPath = join(artifactDir, "palette-card-desktop-light.png");
  writeFileSync(lightCardPath, Buffer.from(lightCardShot.data, "base64"));

  await session.evaluate(
    `document.querySelector(".palette-code-row button").click(); true`,
  );
  await wait(180);
  const copyStatus = await session.evaluate(
    `document.querySelector(".palette-copy-status").textContent`,
  );
  assert(copyStatus.includes("복사했습니다"), `copy interaction failed: ${copyStatus}`);

  const beforeTheme = desktop.firstColor;
  await session.evaluate(`document.querySelector(".theme-toggle").click(); true`);
  await wait(180);
  const afterTheme = await session.evaluate(`({
    swatch: getComputedStyle(document.querySelector(".palette-chip")).backgroundColor,
    pageBackground: getComputedStyle(document.body).backgroundColor,
    theme: document.documentElement.dataset.theme
  })`);
  assert(
    beforeTheme === afterTheme.swatch,
    "canonical swatch changed when the dark theme was enabled",
  );
  assert(afterTheme.theme === "dark", "theme toggle did not enable dark mode");
  assert(
    desktop.pageBackground !== afterTheme.pageBackground,
    "page surface did not change between light and dark themes",
  );

  const layout = await session.call("Page.getLayoutMetrics");
  const desktopShot = await session.call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.ceil(layout.contentSize.width),
      height: Math.ceil(layout.contentSize.height),
      scale: 1,
    },
  });
  const desktopPath = join(artifactDir, "palette-desktop-dark.png");
  writeFileSync(desktopPath, Buffer.from(desktopShot.data, "base64"));

  await session.call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await wait(180);
  const mobile = await session.evaluate(`(() => {
    const card = document.querySelector(".palette-card");
    card.scrollIntoView();
    const rect = card.getBoundingClientRect();
    return {
      cardWidth: Math.round(rect.width),
      cardBox: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      },
      viewportWidth: window.innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      copyButtonWidth: Math.round(document.querySelector(".palette-code-row button").getBoundingClientRect().width)
    };
  })()`);
  assert(!mobile.horizontalOverflow, "mobile page has horizontal overflow");
  assert(mobile.cardWidth <= mobile.viewportWidth, "mobile card exceeds viewport");
  assert(mobile.copyButtonWidth >= 44, "copy target is smaller than 44px");

  const mobileShot = await session.call("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  const mobilePath = join(artifactDir, "palette-mobile-dark.png");
  writeFileSync(mobilePath, Buffer.from(mobileShot.data, "base64"));
  const cardShot = await session.call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      ...mobile.cardBox,
      scale: 1,
    },
  });
  const cardPath = join(artifactDir, "palette-card-mobile-dark.png");
  writeFileSync(cardPath, Buffer.from(cardShot.data, "base64"));

  assert(session.errors.length === 0, `browser errors: ${session.errors.join("; ")}`);
  if (assertions.length) {
    console.error(`✗ palette browser check: ${assertions.length} problem(s)`);
    for (const problem of assertions) console.error(`  - ${problem}`);
    process.exitCode = 1;
  } else {
    console.log(
      `✓ palette browser check: 47 cards, fixed theme swatches, copy feedback, desktop/mobile layout`,
    );
    console.log(`  - ${desktopPath}`);
    console.log(`  - ${lightCardPath}`);
    console.log(`  - ${mobilePath}`);
    console.log(`  - ${cardPath}`);
  }
} finally {
  session?.close();
  chrome.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    wait(1200).then(() => chrome.kill("SIGKILL")),
  ]);
  rmSync(profileDir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}
