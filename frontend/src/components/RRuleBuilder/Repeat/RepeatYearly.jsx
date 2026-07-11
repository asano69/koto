// Ported from Repeat/RepeatYearly.tsx.

import { createMemo } from "solid-js";
import { YearlyBy } from "../../../lib/rrule";
import SelectMonth from "./Inputs/SelectMonth";
import SelectDayCalendar from "./Inputs/SelectDayCalendar";
import SelectPosition from "./Inputs/SelectPosition";
import SelectDayWeek from "./Inputs/SelectDayWeek";
import IntervalTextInput from "./Inputs/IntervalTextInput";
import { useResponsiveRowLayout } from "./useResponsiveRowLayout";

export default function RepeatYearly(props) {
  const maxDaysInMonth = createMemo(() => {
    const month = props.value.byMonth[0];
    if (!month) return 31;
    if (month === 2) return 29; // always allow Feb 29 for safety
    const year = new Date().getFullYear();
    // day 0 of next month = last day of `month`; byMonth is 1-based
    return new Date(year, month, 0).getDate();
  });

  const disabledOnBYSETPOS = () => props.radioValue() === YearlyBy.BYMONTH;
  const disabledOnBYMONTH = () => props.radioValue() === YearlyBy.BYSETPOS;

  const useColumnLayout = useResponsiveRowLayout({
    containerRef: props.containerRef,
    rowSpecs: [
      { fixedWidth: 98, selectMinWidths: [120, 120] },
      { fixedWidth: 134, selectMinWidths: [150, 120, 120] },
    ],
    enabled: props.enableResponsiveLayout,
  });

  const handleRadioChange = (radioVal) => {
    props.setRadioValue(radioVal);
    if (radioVal === YearlyBy.BYMONTH) {
      props.onChange({ ...props.value, bySetPos: [], byDay: [], byMonth: [] });
    } else {
      props.onChange({ ...props.value, byMonthDay: [], byMonth: [] });
    }
  };

  const handleOnChange = (details) => {
    props.onChange(details);
    if (props.radioValue() !== YearlyBy.BYMONTH) {
      props.setRadioValue(YearlyBy.BYMONTH);
    }
  };

  const handleOnTheChange = (details) => {
    props.onChange(details);
    if (props.radioValue() !== YearlyBy.BYSETPOS) {
      props.setRadioValue(YearlyBy.BYSETPOS);
    }
  };

  return (
    <div class="flex w-full flex-col items-start gap-4">
      {props.enableYearlyInterval && (
        <IntervalTextInput value={props.value} onChange={props.onChange} unit="year" pluralizeUnit />
      )}

      <div class={useColumnLayout() ? "flex w-full flex-col items-start gap-2" : "flex w-full items-center gap-3"}>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="yearly"
            value={YearlyBy.BYMONTH}
            checked={props.radioValue() === YearlyBy.BYMONTH}
            onChange={() => handleRadioChange(YearlyBy.BYMONTH)}
          />
          <span class={disabledOnBYMONTH() ? "text-[var(--color-border-soft)]" : ""}>On</span>
        </label>
        <div class={useColumnLayout() ? "w-full min-w-[120px]" : "min-w-[120px]"}>
          <SelectMonth value={props.value} onChange={handleOnChange} disabled={disabledOnBYMONTH()} />
        </div>
        <div class={useColumnLayout() ? "w-full min-w-[120px]" : "min-w-[120px]"}>
          <SelectDayCalendar
            value={props.value}
            onChange={handleOnChange}
            maxDaysInMonth={maxDaysInMonth()}
            disabled={disabledOnBYMONTH()}
          />
        </div>
      </div>

      <div class={useColumnLayout() ? "flex w-full flex-col items-start gap-2" : "flex w-full items-center gap-3"}>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="yearly"
            value={YearlyBy.BYSETPOS}
            checked={props.radioValue() === YearlyBy.BYSETPOS}
            onChange={() => handleRadioChange(YearlyBy.BYSETPOS)}
          />
          <span class={disabledOnBYSETPOS() ? "text-[var(--color-border-soft)]" : ""}>On The</span>
        </label>
        <div class={useColumnLayout() ? "w-full min-w-[150px]" : "min-w-[150px]"}>
          <SelectPosition value={props.value} onChange={handleOnTheChange} disabled={disabledOnBYSETPOS()} />
        </div>
        <div class={useColumnLayout() ? "w-full min-w-[120px]" : "min-w-[120px]"}>
          <SelectDayWeek value={props.value} onChange={handleOnTheChange} disabled={disabledOnBYSETPOS()} />
        </div>
        <div class="flex items-center gap-2">
          <span class={disabledOnBYSETPOS() ? "text-[var(--color-border-soft)]" : ""}>of</span>
          <div class={useColumnLayout() ? "w-full min-w-[120px]" : "min-w-[120px]"}>
            <SelectMonth value={props.value} onChange={handleOnTheChange} disabled={disabledOnBYSETPOS()} />
          </div>
        </div>
      </div>
    </div>
  );
}
