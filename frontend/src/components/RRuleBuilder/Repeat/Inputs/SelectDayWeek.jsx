// Ported from Repeat/Inputs/SelectDayWeek.tsx. MUI Select -> <select>.

import { For, createMemo } from "solid-js";
import { Weekday, AllWeekDayOptions, weekdayFullTextMapping } from "../../../../lib/rrule";

export default function SelectDayWeek(props) {
  // Collapse the byDay array into a single special value (DAY/WEEKDAY/
  // WEEKEND) when it matches one of those patterns, otherwise show the
  // single selected day.
  const selectedByDay = createMemo(() => {
    const byDay = props.value.byDay;
    if (byDay.length === 0) return "";
    if (byDay.length === 7) return AllWeekDayOptions.DAY;
    if (byDay.length === 5 && !byDay.includes(Weekday.SA) && !byDay.includes(Weekday.SU)) {
      return AllWeekDayOptions.WEEKDAY;
    }
    if (byDay.length === 2 && byDay.includes(Weekday.SA) && byDay.includes(Weekday.SU)) {
      return AllWeekDayOptions.WEEKEND;
    }
    return byDay[0];
  });

  const handleChange = (e) => {
    const changeVal = e.target.value;
    let setVal = [changeVal];
    if (changeVal === AllWeekDayOptions.DAY) {
      setVal = [Weekday.SU, Weekday.MO, Weekday.TU, Weekday.WE, Weekday.TH, Weekday.FR, Weekday.SA];
    } else if (changeVal === AllWeekDayOptions.WEEKDAY) {
      setVal = [Weekday.MO, Weekday.TU, Weekday.WE, Weekday.TH, Weekday.FR];
    } else if (changeVal === AllWeekDayOptions.WEEKEND) {
      setVal = [Weekday.SA, Weekday.SU];
    }
    props.onChange({ ...props.value, byDay: setVal });
  };

  return (
    <label class="flex flex-col gap-1 text-sm">
      <span>Select Day</span>
      <select
        disabled={props.disabled}
        value={selectedByDay()}
        onChange={handleChange}
        class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <option value="" disabled>Select Day</option>
        <For each={Object.keys(AllWeekDayOptions)}>
          {(key) => <option value={key}>{weekdayFullTextMapping[key]}</option>}
        </For>
      </select>
    </label>
  );
}
