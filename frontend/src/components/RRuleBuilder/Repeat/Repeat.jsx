// Ported from Repeat/Repeat.tsx. MUI Select -> <select>.

import { For, Switch, Match, createSignal } from "solid-js";
import { Frequency } from "rrule";
import { frequencyTextMapping } from "../../../lib/rrule";
import RepeatHourly from "./RepeatHourly";
import RepeatDaily from "./RepeatDaily";
import RepeatWeekly from "./RepeatWeekly";
import RepeatMonthly from "./RepeatMonthly";
import RepeatYearly from "./RepeatYearly";

const frequencyOptions = [
  Frequency.YEARLY,
  Frequency.MONTHLY,
  Frequency.WEEKLY,
  Frequency.DAILY,
  Frequency.HOURLY,
];

export default function RepeatSelect(props) {
  // Only Monthly/Yearly need the measured container for responsive
  // layout, but the ref lives here so it wraps the whole select+detail
  // block (matches the original's responsiveContainerRef placement).
  const [containerEl, setContainerEl] = createSignal();

  const handleFrequencyChange = (e) => {
    props.onFrequencyChange(Number(e.target.value));
  };

  return (
    <div ref={setContainerEl} class="flex flex-col gap-2">
      <select
        value={props.frequencySelected}
        onChange={handleFrequencyChange}
        class="w-full rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
      >
        <For each={frequencyOptions}>
          {(option) => (
            <option value={option}>{frequencyTextMapping[option]}</option>
          )}
        </For>
      </select>

      <Switch>
        <Match when={props.frequencySelected === Frequency.HOURLY}>
          <RepeatHourly
            value={props.repeatDetails}
            onChange={props.setRepeatDetails}
          />
        </Match>
        <Match when={props.frequencySelected === Frequency.DAILY}>
          <RepeatDaily
            value={props.repeatDetails}
            onChange={props.setRepeatDetails}
          />
        </Match>
        <Match when={props.frequencySelected === Frequency.WEEKLY}>
          <RepeatWeekly
            value={props.repeatDetails}
            onChange={props.setRepeatDetails}
          />
        </Match>
        <Match when={props.frequencySelected === Frequency.MONTHLY}>
          <RepeatMonthly
            value={props.repeatDetails}
            onChange={props.setRepeatDetails}
            radioValue={props.radioValue}
            setRadioValue={props.setRadioValue}
            containerRef={containerEl}
            enableResponsiveLayout={props.enableResponsiveLayout}
          />
        </Match>
        <Match when={props.frequencySelected === Frequency.YEARLY}>
          <RepeatYearly
            value={props.repeatDetails}
            onChange={props.setRepeatDetails}
            enableYearlyInterval={props.enableYearlyInterval}
            radioValue={props.radioValue}
            setRadioValue={props.setRadioValue}
            containerRef={containerEl}
            enableResponsiveLayout={props.enableResponsiveLayout}
          />
        </Match>
      </Switch>
    </div>
  );
}
