// Ported from Repeat/Inputs/SelectDayCalendar.tsx. MUI Select -> <select>.

import { For } from "solid-js";
import { safeParseInt } from "../../../../lib/rrule";

export default function SelectDayCalendar(props) {
  const days = () =>
    Array.from({ length: props.maxDaysInMonth }, (_, i) => i + 1);

  const handleChange = (e) => {
    const parsed = safeParseInt(e.target.value);
    if (parsed !== undefined) {
      props.onChange({ ...props.value, byMonthDay: [parsed] });
    }
  };

  return (
    <label class="flex flex-col gap-1 text-sm">
      <span>Select Day</span>
      <select
        disabled={props.disabled}
        value={props.value.byMonthDay[0] ?? ""}
        onChange={handleChange}
        class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <option value="" disabled>
          Select Day
        </option>
        <For each={days()}>{(day) => <option value={day}>{day}</option>}</For>
      </select>
    </label>
  );
}
