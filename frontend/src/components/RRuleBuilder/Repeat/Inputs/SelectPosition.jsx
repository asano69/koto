// Ported from Repeat/Inputs/SelectPosition.tsx.
// The original was a MUI multi-select. Per the plan in CLAUDE.md, this was
// changed to a row of toggle buttons (same UX as the weekday buttons in
// RepeatWeekly) since <select multiple> has poor usability.

import { For } from "solid-js";
import { OnThe, onTheTextMapping, addOrRemoveFromArray, safeParseInt } from "../../../../lib/rrule";

const positions = Object.values(OnThe).map((v) => safeParseInt(v));

export default function SelectPosition(props) {
  const toggle = (pos) => {
    if (props.disabled) return;
    props.onChange({ ...props.value, bySetPos: addOrRemoveFromArray(props.value.bySetPos, pos) });
  };

  return (
    <div role="group" aria-label="Select Position" class="flex flex-col gap-1 text-sm">
      <span>Select Position</span>
      <div class="flex flex-wrap gap-1">
        <For each={positions}>
          {(pos) => (
            <button
              type="button"
              disabled={props.disabled}
              aria-pressed={props.value.bySetPos.includes(pos)}
              onClick={() => toggle(pos)}
              class={
                props.value.bySetPos.includes(pos)
                  ? "rounded-md border border-[var(--color-border)] bg-[var(--color-active-bg)] px-2 py-1 text-sm text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
                  : "rounded-md border border-[var(--color-border-soft)] bg-[var(--color-field)] px-2 py-1 text-sm text-[var(--color-text)] enabled:hover:bg-[var(--color-hover-bg)] disabled:cursor-not-allowed disabled:opacity-40"
              }
            >
              {onTheTextMapping[pos]}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
