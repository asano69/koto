// Ported from Repeat/RepeatMonthly.tsx.
// MUI Radio/RadioGroup -> plain <input type="radio">, MUI Stack/Box ->
// divs with Tailwind flex classes.

import { MonthBy } from "../../../lib/rrule";
import SelectDayCalendar from "./Inputs/SelectDayCalendar";
import SelectPosition from "./Inputs/SelectPosition";
import SelectDayWeek from "./Inputs/SelectDayWeek";
import IntervalTextInput from "./Inputs/IntervalTextInput";
import { useResponsiveRowLayout } from "./useResponsiveRowLayout";

const maxDaysInMonth = 31;

export default function RepeatMonthly(props) {
  const disabledOnBYSETPOS = () => props.radioValue() === MonthBy.BYMONTHDAY;
  const disabledOnBYMONTHDAY = () => props.radioValue() === MonthBy.BYSETPOS;

  const useColumnLayout = useResponsiveRowLayout({
    containerRef: props.containerRef,
    rowSpecs: [
      { fixedWidth: 120, selectCount: 1 },
      { fixedWidth: 120, selectMinWidths: [150, 120] },
    ],
    enabled: props.enableResponsiveLayout,
  });

  const handleRadioChange = (radioVal) => {
    props.setRadioValue(radioVal);
    if (radioVal === MonthBy.BYMONTHDAY) {
      props.onChange({ ...props.value, bySetPos: [], byDay: [], byMonth: [] });
    } else {
      props.onChange({ ...props.value, byMonthDay: [], byMonth: [] });
    }
  };

  const handleOnDayChange = (details) => {
    props.onChange(details);
    if (props.radioValue() !== MonthBy.BYMONTHDAY) {
      props.setRadioValue(MonthBy.BYMONTHDAY);
    }
  };

  const handleOnTheChange = (details) => {
    props.onChange(details);
    if (props.radioValue() !== MonthBy.BYSETPOS) {
      props.setRadioValue(MonthBy.BYSETPOS);
    }
  };

  return (
    <div class="flex w-full flex-col items-start gap-4">
      <IntervalTextInput value={props.value} onChange={props.onChange} unit="month" pluralizeUnit />

      <div class={useColumnLayout() ? "flex w-full flex-col items-start gap-2" : "flex w-full items-center gap-3"}>
        <label class="flex min-w-[120px] items-center gap-2">
          <input
            type="radio"
            name="monthly"
            value={MonthBy.BYMONTHDAY}
            checked={props.radioValue() === MonthBy.BYMONTHDAY}
            onChange={() => handleRadioChange(MonthBy.BYMONTHDAY)}
          />
          <span class={disabledOnBYMONTHDAY() ? "text-[var(--color-border-soft)]" : ""}>On Day</span>
        </label>
        <div class={useColumnLayout() ? "w-full min-w-[120px]" : "min-w-[120px]"}>
          <SelectDayCalendar
            value={props.value}
            onChange={handleOnDayChange}
            maxDaysInMonth={maxDaysInMonth}
            disabled={disabledOnBYMONTHDAY()}
          />
        </div>
      </div>

      <div class={useColumnLayout() ? "flex w-full flex-col items-start gap-2" : "flex w-full items-center gap-3"}>
        <label class="flex min-w-[120px] items-center gap-2">
          <input
            type="radio"
            name="monthly"
            value={MonthBy.BYSETPOS}
            checked={props.radioValue() === MonthBy.BYSETPOS}
            onChange={() => handleRadioChange(MonthBy.BYSETPOS)}
          />
          <span class={disabledOnBYSETPOS() ? "text-[var(--color-border-soft)]" : ""}>On The</span>
        </label>
        <div class={useColumnLayout() ? "w-full min-w-[150px]" : "min-w-[150px]"}>
          <SelectPosition value={props.value} onChange={handleOnTheChange} disabled={disabledOnBYSETPOS()} />
        </div>
        <div class={useColumnLayout() ? "w-full min-w-[120px]" : "min-w-[120px]"}>
          <SelectDayWeek value={props.value} onChange={handleOnTheChange} disabled={disabledOnBYSETPOS()} />
        </div>
      </div>
    </div>
  );
}
