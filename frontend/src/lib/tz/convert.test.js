import { describe, it, expect } from "vitest";
import { utcToLocal, localToUtc } from "./convert";

describe("utcToLocal", () => {
  it("converts UTC to a fixed-offset timezone (Asia/Tokyo, UTC+9)", () => {
    expect(utcToLocal("20260315T103000Z", "Asia/Tokyo")).toBe(
      "20260315T193000",
    );
  });

  it("returns empty string unchanged", () => {
    expect(utcToLocal("", "Asia/Tokyo")).toBe("");
  });

  it("returns non-matching (legacy naive) input unchanged", () => {
    expect(utcToLocal("20260315T193000", "Asia/Tokyo")).toBe("20260315T193000");
  });
});

describe("localToUtc", () => {
  it("converts a fixed-offset timezone to UTC (Asia/Tokyo, UTC+9)", () => {
    expect(localToUtc("20260315T193000", "Asia/Tokyo")).toBe(
      "20260315T103000Z",
    );
  });

  it("returns non-matching input unchanged", () => {
    expect(localToUtc("not-a-date", "Asia/Tokyo")).toBe("not-a-date");
  });

  describe("DST transitions (America/New_York, 2026)", () => {
    // Spring forward: 2026-03-08 02:00 local -> 03:00 local (EST -05:00 -> EDT -04:00).
    it("uses EST just before the spring-forward transition", () => {
      expect(localToUtc("20260308T013000", "America/New_York")).toBe(
        "20260308T063000Z",
      );
    });

    it("uses EDT just after the spring-forward transition", () => {
      expect(localToUtc("20260308T033000", "America/New_York")).toBe(
        "20260308T073000Z",
      );
    });

    // Fall back: 2026-11-01 02:00 local -> 01:00 local (EDT -04:00 -> EST -05:00).
    it("uses EDT before the fall-back transition", () => {
      expect(localToUtc("20261101T003000", "America/New_York")).toBe(
        "20261101T043000Z",
      );
    });

    it("uses EST after the fall-back transition", () => {
      expect(localToUtc("20261101T033000", "America/New_York")).toBe(
        "20261101T083000Z",
      );
    });
  });
});

describe("round-trip", () => {
  it("utcToLocal(localToUtc(x)) === x across a DST transition", () => {
    const cases = [
      "20260308T013000",
      "20260308T033000",
      "20261101T003000",
      "20261101T033000",
    ];
    for (const naive of cases) {
      const utc = localToUtc(naive, "America/New_York");
      expect(utcToLocal(utc, "America/New_York")).toBe(naive);
    }
  });
});
