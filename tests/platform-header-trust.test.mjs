import assert from "node:assert/strict";
import test from "node:test";
import { platformHeaderTrustConfigured } from "../src/lib/platform-header-trust.ts";

const gatewaySecret = "0123456789abcdef";

for (const {
  name,
  AUTH_TRUST_PLATFORM_HEADERS,
  PLATFORM_GATEWAY_SECRET,
  expected,
} of [
  {
    name: "neither setting",
    AUTH_TRUST_PLATFORM_HEADERS: undefined,
    PLATFORM_GATEWAY_SECRET: undefined,
    expected: false,
  },
  {
    name: "opt-in only",
    AUTH_TRUST_PLATFORM_HEADERS: "1",
    PLATFORM_GATEWAY_SECRET: undefined,
    expected: false,
  },
  {
    name: "gateway secret only",
    AUTH_TRUST_PLATFORM_HEADERS: undefined,
    PLATFORM_GATEWAY_SECRET: gatewaySecret,
    expected: false,
  },
  {
    name: "opt-in and gateway secret",
    AUTH_TRUST_PLATFORM_HEADERS: "1",
    PLATFORM_GATEWAY_SECRET: gatewaySecret,
    expected: true,
  },
]) {
  test(`platform header trust is ${expected} with ${name}`, () => {
    assert.equal(
      platformHeaderTrustConfigured({
        AUTH_TRUST_PLATFORM_HEADERS,
        PLATFORM_GATEWAY_SECRET,
      }),
      expected,
    );
  });
}
