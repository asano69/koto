import { describe, it, expect, vi } from "vitest";
import { Frequency } from "rrule";
import { createBuilderStore, baseRepeatDetails } from "./builderStore";
import { EndType } from "./endTypes";
import { Weekday, MonthBy, YearlyBy } from "./types";

describe("builderStore", () => {
  describe("initial state", () => {
    it("has correct defaults", () => {
      const store = createBuilderStore();
      expect(store.frequency()).toBe(Frequency.WEEKLY);
      expect(store.startDate()).toBeNull();
      expect({ ...store.repeatDetails }).toEqual(baseRepeatDetails);
      expect({ ...store.endDetails }).toEqual({ endingType: EndType.NEVER });
      expect({ ...store.validationErrors }).toEqual({});
      expect(store.radioValue()).toBeNull();
    });
  });

  describe("setFrequency", () => {
    it("updates frequency", () => {
      const store = createBuilderStore();
      store.setFrequency(Frequency.MONTHLY);
      expect(store.frequency()).toBe(Frequency.MONTHLY);
    });

    it("resets repeat details when frequency changes", () => {
      const store = createBuilderStore();
      store.setRepeatDetails({ ...baseRepeatDetails, byDay: [Weekday.MO] });
      store.setFrequency(Frequency.DAILY);
      expect({ ...store.repeatDetails }).toEqual(baseRepeatDetails);
    });

    it("clears validation errors when frequency changes", () => {
      const store = createBuilderStore();
      // WEEKLY with no byDay selected produces a validation error to clear.
      store.validateForm();
      expect(Object.keys(store.validationErrors).length).toBeGreaterThan(0);

      store.setFrequency(Frequency.MONTHLY);
      expect({ ...store.validationErrors }).toEqual({});
    });
  });

  describe("setStartDate", () => {
    it("sets start date", () => {
      const store = createBuilderStore();
      const date = new Date(Date.UTC(2025, 5, 15));
      store.setStartDate(date);
      expect(store.startDate()).toEqual(date);
    });

    it("sets minEndDate when start date is provided", () => {
      const store = createBuilderStore();
      const date = new Date(Date.UTC(2025, 5, 15));
      store.setStartDate(date);
      expect(store.minEndDate()).toBeTruthy();
      expect(store.minEndDate().getTime()).toBe(
        new Date(Date.UTC(2025, 5, 16)).getTime(),
      );
    });

    it("adjusts end date when start date is on or after it", () => {
      const store = createBuilderStore();
      const startDate = new Date(Date.UTC(2025, 5, 20));
      const endDate = new Date(Date.UTC(2025, 5, 15));
      store.setEndDetails({ endingType: EndType.ON, endDate });
      store.setStartDate(startDate);

      const endDets = store.endDetails;
      expect(endDets.endingType).toBe(EndType.ON);
      expect(endDets.endDate).toBeTruthy();
      expect(endDets.endDate.getTime()).toBeGreaterThan(startDate.getTime());
    });
  });

  describe("setRepeatDetails", () => {
    it("updates repeat details", () => {
      const store = createBuilderStore();
      store.setRepeatDetails({
        ...baseRepeatDetails,
        byDay: [Weekday.MO, Weekday.WE],
      });
      expect([...store.repeatDetails.byDay]).toEqual([Weekday.MO, Weekday.WE]);
    });
  });

  describe("setEndDetails", () => {
    it("updates end details", () => {
      const store = createBuilderStore();
      store.setEndDetails({ endingType: EndType.AFTER, occurrences: 10 });
      const endDets = store.endDetails;
      expect(endDets.endingType).toBe(EndType.AFTER);
      expect(endDets.occurrences).toBe(10);
    });
  });

  describe("buildRRuleString", () => {
    it("generates an RRULE string", () => {
      const store = createBuilderStore();
      store.buildRRuleString();
      expect(store.rruleString()).toBeDefined();
      expect(store.rruleString()).toContain("RRULE:");
    });

    it("calls onChange when rrule string is built", () => {
      const onChange = vi.fn();
      const store = createBuilderStore();
      store.setOnChange(onChange);
      store.buildRRuleString();
      expect(onChange).toHaveBeenCalledWith(expect.stringContaining("RRULE:"));
    });
  });

  describe("validateForm", () => {
    it("returns true for valid WEEKLY form", () => {
      const store = createBuilderStore();
      store.setRepeatDetails({ ...baseRepeatDetails, byDay: [Weekday.MO] });
      const isValid = store.validateForm();
      expect(isValid).toBe(true);
      expect({ ...store.validationErrors }).toEqual({});
    });

    it("returns false and sets errors for invalid WEEKLY form", () => {
      const store = createBuilderStore();
      // WEEKLY requires byDay — leave it empty
      store.setRepeatDetails({ ...baseRepeatDetails, byDay: [] });
      const isValid = store.validateForm();
      expect(isValid).toBe(false);
      expect(Object.keys(store.validationErrors).length).toBeGreaterThan(0);
    });
  });

  describe("setStoreFromRRuleString", () => {
    it("parses a WEEKLY rrule string", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString(
        "RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR",
      );
      expect(store.frequency()).toBe(Frequency.WEEKLY);
      expect(store.repeatDetails.interval).toBe(2);
      expect([...store.repeatDetails.byDay]).toEqual([
        Weekday.MO,
        Weekday.WE,
        Weekday.FR,
      ]);
    });

    it("parses a MONTHLY rrule string with BYMONTHDAY", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString(
        "RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15",
      );
      expect(store.frequency()).toBe(Frequency.MONTHLY);
      expect([...store.repeatDetails.byMonthDay]).toEqual([15]);
      expect(store.radioValue()).toBe(MonthBy.BYMONTHDAY);
    });

    it("parses a MONTHLY rrule string with BYSETPOS", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString("RRULE:FREQ=MONTHLY;BYSETPOS=-1;BYDAY=FR");
      expect(store.frequency()).toBe(Frequency.MONTHLY);
      expect([...store.repeatDetails.bySetPos]).toEqual([-1]);
      expect([...store.repeatDetails.byDay]).toEqual([Weekday.FR]);
      expect(store.radioValue()).toBe(MonthBy.BYSETPOS);
    });

    it("parses a YEARLY rrule string with BYMONTH", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString(
        "RRULE:FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=15",
      );
      expect(store.frequency()).toBe(Frequency.YEARLY);
      expect([...store.repeatDetails.byMonth]).toEqual([6]);
      expect(store.radioValue()).toBe(YearlyBy.BYMONTH);
    });

    it("parses a YEARLY rrule string with BYSETPOS", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString(
        "RRULE:FREQ=YEARLY;BYSETPOS=2;BYDAY=TU;BYMONTH=3",
      );
      expect(store.frequency()).toBe(Frequency.YEARLY);
      expect(store.radioValue()).toBe(YearlyBy.BYSETPOS);
    });

    it("parses COUNT for EndType.AFTER", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString("RRULE:FREQ=DAILY;COUNT=5");
      const afterDets = store.endDetails;
      expect(afterDets.endingType).toBe(EndType.AFTER);
      expect(afterDets.occurrences).toBe(5);
    });

    it("parses UNTIL for EndType.ON", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString("RRULE:FREQ=DAILY;UNTIL=20261231T000000Z");
      const onDets = store.endDetails;
      expect(onDets.endingType).toBe(EndType.ON);
      expect(onDets.endDate).toBeTruthy();
    });

    it("parses DTSTART", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString(
        "DTSTART:20250615T000000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO",
      );
      expect(store.startDate()).toBeTruthy();
    });

    it("handles invalid rrule strings gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const store = createBuilderStore();
      store.setStoreFromRRuleString("NOT_VALID");
      // Should still have default frequency — state unchanged
      expect(store.frequency()).toBe(Frequency.WEEKLY);
      consoleSpy.mockRestore();
    });

    it("clears validation errors on rehydration", () => {
      const store = createBuilderStore();
      store.setStoreFromRRuleString("RRULE:FREQ=DAILY;INTERVAL=1");
      expect({ ...store.validationErrors }).toEqual({});
    });

    it("triggers buildRRuleString after rehydration", () => {
      const onChange = vi.fn();
      const store = createBuilderStore();
      store.setOnChange(onChange);
      store.setStoreFromRRuleString("RRULE:FREQ=DAILY;INTERVAL=3");
      expect(onChange).toHaveBeenCalled();
      expect(store.rruleString()).toContain("RRULE:");
    });
  });

  describe("independent instances", () => {
    it("keeps state independent across separate createBuilderStore() calls", () => {
      const storeA = createBuilderStore();
      const storeB = createBuilderStore();
      storeA.setFrequency(Frequency.DAILY);
      // storeB should still have the default WEEKLY
      expect(storeA.frequency()).toBe(Frequency.DAILY);
      expect(storeB.frequency()).toBe(Frequency.WEEKLY);
    });
  });
});
