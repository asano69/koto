// Ported from Repeat/RepeatWeekly.tsx. MUI Button row -> plain toggle buttons.

import { For } from "solid-js";
import { Weekday, weekdayFullTextMapping, weekdayShortTextMapping } from "../../../lib/rrule";
import IntervalTextInput from "./Inputs/IntervalTextInput";

const weekdayKeys = Object.keys(Weekday).filter((d) => d !== Weekday.SA && d !== Weekday.SU);

function DayButton(props) {
  const selected = () => props.value.byDay.includes(props.day);
  const toggle = () => {
    const selectedDays = selected()
      ? props.value.byDay.filter((d) => d !== props.day)
      : [...props.value.byDay, props.day];
    props.onChange({ ...props.value, byDay: selectedDays });
  };

  return (
    <button
      type="button"
      aria-pressed={selected()}
      aria-label={weekdayFullTextMapping[props.day]}
      onClick={toggle}
      class={
        selected()
          ? "min-w-12 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-active-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
          : "min-w-12 flex-1 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-field)] px-2 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-hover-bg)]"
      }
    >
      {weekdayShortTextMapping[props.day]}
    </button>
  );
}

export default function RepeatWeekly(props) {
  return (
    <div class="flex flex-col items-start gap-2">
      <IntervalTextInput value={props.value} onChange={props.onChange} unit="week" pluralizeUnit />
      <div role="group" aria-label="Select days of the week" class="flex w-full flex-wrap gap-1">
        <div class="flex flex-[5] gap-1">
          <For each={weekdayKeys}>
            {(day) => <DayButton day={day} value={props.value} onChange={props.onChange} />}
          </For>
        </div>
        <div class="flex flex-[2] gap-1">
          <DayButton day={Weekday.SA} value={props.value} onChange={props.onChange} />
          <DayButton day={Weekday.SU} value={props.value} onChange={props.onChange} />
        </div>
      </div>
    </div>
  );
}
