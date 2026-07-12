// Ported from End/End.tsx. MUI Select/DatePicker -> native <select>/<input type="date">.
// Dates are naive (see CLAUDE.md): the date input's value round-trips
// through Date.UTC so no local-timezone shift is ever applied.

import { Show } from "solid-js";
import { EndType } from "../../../lib/rrule";

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

export default function End(props) {
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (newType === EndType.NEVER) {
      props.setEndDetails({ endingType: EndType.NEVER });
    } else if (newType === EndType.AFTER) {
      props.setEndDetails({ endingType: EndType.AFTER, occurrences: null });
    } else {
      props.setEndDetails({ endingType: EndType.ON, endDate: null });
    }
  };

  return (
    <div class="flex flex-col gap-2">
      <label class="flex flex-col gap-1 text-sm">
        <span>End</span>
        <select
          value={props.endDetails.endingType}
          onChange={handleTypeChange}
          class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
        >
          <option value={EndType.NEVER}>never</option>
          <option value={EndType.AFTER}>after</option>
          <option value={EndType.ON}>on</option>
        </select>
      </label>

      <Show when={props.endDetails.endingType === EndType.ON}>
        <label class="flex flex-col gap-1 text-sm">
          <span>{props.datePickerEndLabel}</span>
          <input
            type="date"
            value={toDateInputValue(props.endDetails.endDate)}
            min={toDateInputValue(props.minEndDate)}
            onInput={(e) =>
              props.setEndDetails({
                endingType: EndType.ON,
                endDate: fromDateInputValue(e.target.value),
              })
            }
            class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
          />
        </label>
      </Show>

      <Show when={props.endDetails.endingType === EndType.AFTER}>
        <label class="flex flex-col gap-1 text-sm">
          <span>Occurrences</span>
          <input
            type="number"
            value={props.endDetails.occurrences ?? ""}
            onInput={(e) => {
              const parsed = parseInt(e.target.value, 10);
              props.setEndDetails({
                endingType: EndType.AFTER,
                occurrences: Number.isNaN(parsed) ? null : parsed,
              });
            }}
            class="w-24 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
          />
        </label>
      </Show>
    </div>
  );
}
