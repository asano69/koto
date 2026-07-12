import { describe, it, expect } from "vitest";
import { Frequency } from "rrule";
import { validateRepeatDetails } from "./validate";
import { Weekday } from "./types";

const baseRepeatDetails = {
  interval: 1,
  bySetPos: [],
  byMonth: [],
  byMonthDay: [],
  byDay: [],
};

describe("validateRepeatDetails", () => {
  describe("base schema (DAILY / HOURLY)", () => {
    it("passes for valid DAILY input", () => {
      const errors = validateRepeatDetails(Frequency.DAILY, {
        ...baseRepeatDetails,
        interval: 1,
      });
      expect(errors).toEqual({});
    });

    it("passes for valid HOURLY input", () => {
      const errors = validateRepeatDetails(Frequency.HOURLY, {
        ...baseRepeatDetails,
        interval: 2,
      });
      expect(errors).toEqual({});
    });

    it("rejects when frequency is missing", () => {
      const errors = validateRepeatDetails(undefined, {
        ...baseRepeatDetails,
        interval: 1,
      });
      expect(errors.frequency).toBeDefined();
    });

    it("rejects when interval is missing", () => {
      const errors = validateRepeatDetails(Frequency.DAILY, {
        ...baseRepeatDetails,
        interval: null,
      });
      expect(errors.interval).toBeDefined();
    });
  });

  describe("weekly schema", () => {
    it("passes with byDay provided", () => {
      const errors = validateRepeatDetails(Frequency.WEEKLY, {
        ...baseRepeatDetails,
        interval: 1,
        byDay: [Weekday.MO, Weekday.FR],
      });
      expect(errors).toEqual({});
    });

    it("rejects when byDay is missing for WEEKLY", () => {
      const errors = validateRepeatDetails(Frequency.WEEKLY, {
        ...baseRepeatDetails,
        interval: 1,
      });
      expect(errors.byDay).toBeDefined();
    });

    it("requires interval for WEEKLY", () => {
      const errors = validateRepeatDetails(Frequency.WEEKLY, {
        ...baseRepeatDetails,
        interval: null,
        byDay: [Weekday.MO],
      });
      expect(errors.interval).toBeDefined();
    });
  });

  describe("monthly schema", () => {
    it("passes with byMonthDay", () => {
      const errors = validateRepeatDetails(Frequency.MONTHLY, {
        ...baseRepeatDetails,
        interval: 1,
        byMonthDay: [15],
      });
      expect(errors).toEqual({});
    });

    it("passes with bySetPos and byDay for on-the pattern", () => {
      const errors = validateRepeatDetails(Frequency.MONTHLY, {
        ...baseRepeatDetails,
        interval: 1,
        bySetPos: [2],
        byDay: [Weekday.TU],
      });
      expect(errors).toEqual({});
    });

    it("requires interval for MONTHLY", () => {
      const errors = validateRepeatDetails(Frequency.MONTHLY, {
        ...baseRepeatDetails,
        interval: null,
      });
      expect(errors.interval).toBeDefined();
    });
  });

  describe("yearly schema", () => {
    it("passes with byMonth", () => {
      const errors = validateRepeatDetails(Frequency.YEARLY, {
        ...baseRepeatDetails,
        byMonth: [6],
      });
      expect(errors).toEqual({});
    });

    it("passes with bySetPos and byDay", () => {
      const errors = validateRepeatDetails(Frequency.YEARLY, {
        ...baseRepeatDetails,
        bySetPos: [-1],
        byDay: [Weekday.FR],
        byMonth: [12],
      });
      expect(errors).toEqual({});
    });

    it("does not require interval for YEARLY", () => {
      const errors = validateRepeatDetails(Frequency.YEARLY, {
        ...baseRepeatDetails,
        interval: null,
      });
      expect(errors.interval).toBeUndefined();
    });
  });

  describe("frequency selection", () => {
    it("passes for MINUTELY", () => {
      const errors = validateRepeatDetails(Frequency.MINUTELY, {
        ...baseRepeatDetails,
        interval: 30,
      });
      expect(errors).toEqual({});
    });

    it("passes for SECONDLY", () => {
      const errors = validateRepeatDetails(Frequency.SECONDLY, {
        ...baseRepeatDetails,
        interval: 10,
      });
      expect(errors).toEqual({});
    });
  });
});
