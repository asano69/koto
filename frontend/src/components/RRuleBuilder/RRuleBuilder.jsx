// Ported from RRuleBuilder/RRuleBuilder.tsx.
// MUI LocalizationProvider + DatePicker -> native <input type="date">.
// No dateAdapter prop is needed: Stage 1 dropped the luxon adapter, so
// the store already works with plain Dates (see CLAUDE.md, "dates are naive").

import { onMount, Show } from "solid-js";
import { Frequency } from "rrule";
import { useBuilderStoreContext } from "../../lib/rrule/builderStoreContext";
import RepeatSelect from "./Repeat/Repeat";
import End from "./End/End";

function toDateInputValue(date) {
  if (!date) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromDateInputValue(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export default function RRuleBuilder(props) {
  const store = useBuilderStoreContext();

  const showStartDate = () => props.showStartDate ?? true;
  const enableResponsiveLayout = () => props.enableResponsiveLayout ?? true;
  const enableYearlyInterval = () => props.enableYearlyInterval ?? false;
  const startLabel = () => props.lang?.startDatePickerLabel ?? "Start Date";
  const endLabel = () => props.lang?.endDatePickerLabel ?? "End Date";

  // Runs once on mount, mirroring the original's "init the store" effect.
  onMount(() => {
    if (!showStartDate()) {
      store.setStartDate(null);
    }
    if (props.onChange) {
      store.setOnChange(props.onChange);
    }

    if (props.rruleString) {
      store.setStoreFromRRuleString(props.rruleString);
    } else {
      store.setFrequency(props.defaultFrequency ?? Frequency.WEEKLY);
      if (props.initialStartDate && showStartDate()) {
        store.setStartDate(props.initialStartDate);
      }
    }
  });

  return (
    <div class="flex flex-col gap-4">
      <Show when={showStartDate()}>
        <label class="flex flex-col gap-1 text-sm">
          <span>{startLabel()}</span>
          <input
            type="date"
            value={toDateInputValue(store.startDate())}
            onInput={(e) => store.setStartDate(fromDateInputValue(e.target.value))}
            class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
          />
        </label>
      </Show>

      <RepeatSelect
        frequencySelected={store.frequency()}
        onFrequencyChange={store.setFrequency}
        repeatDetails={store.repeatDetails}
        setRepeatDetails={store.setRepeatDetails}
        radioValue={store.radioValue}
        setRadioValue={store.setRadioValue}
        enableYearlyInterval={enableYearlyInterval()}
        enableResponsiveLayout={enableResponsiveLayout()}
      />

      <End
        endDetails={store.endDetails}
        setEndDetails={store.setEndDetails}
        minEndDate={store.minEndDate()}
        datePickerEndLabel={endLabel()}
      />
    </div>
  );
}
