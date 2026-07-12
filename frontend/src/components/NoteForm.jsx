// Shared form used by both the "new entry" and "edit entry" routes. Reuses
// RRuleBuilder for the recurrence rule and saves directly to PocketBase.
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import RRuleBuilder from "./RRuleBuilder/RRuleBuilder";
import { BuilderStoreProvider, useBuilderStoreContext } from "../lib/rrule";
import pb from "../lib/pb";

// Combines the RRuleBuilder's date-only startDate with a separately
// entered time-of-day into an RFC 5545 floating-time DATE-TIME string:
// "YYYYMMDDTHHMMSS" (no trailing "Z", which is what would make it UTC
// instead of floating). This is naive on purpose (see CLAUDE.md, "don't
// use timezones"): it's just the wall-clock time the notification should
// fire at, same as a journal entry's date.
function toDtstartString(date, time) {
  if (!date) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const [hh, mm] = (time || "00:00").split(":");
  return `${y}${m}${d}T${hh.padStart(2, "0")}${mm.padStart(2, "0")}00`;
}

// The store's rruleString includes a leading "DTSTART:" line, but dtstart
// is stored in its own field. rrule-go's StrToRRule() expects the bare
// rule value (no "RRULE:" prefix), so that's stripped here too.
function extractRRuleLine(rruleString) {
  if (!rruleString) return "";
  const line = rruleString.split("\n").find((l) => l.startsWith("RRULE:"));
  return (line ?? rruleString).replace(/^RRULE:/, "");
}

// Reconstructs the "DTSTART:...\nRRULE:..." string RRuleBuilder expects,
// from the separately stored dtstart/rrule fields, so an existing note's
// recurrence can be loaded back into the builder for editing. The stored
// dtstart is floating (no "Z"); appending "Z" here makes RRule.parseString
// read it back as the same Y/M/D/H/M/S values via its UTC accessors,
// matching how buildRRuleString.js serialized it in the first place.
function toBuilderRRuleString(dtstart, rrule) {
  if (!dtstart || !rrule) return "";
  return `DTSTART:${dtstart}Z\nRRULE:${rrule}`;
}

// Extracts "HH:MM" from a stored dtstart string ("YYYYMMDDTHHMMSS").
function extractTime(dtstart) {
  const match = /^\d{8}T(\d{2})(\d{2})\d{2}$/.exec(dtstart ?? "");
  return match ? `${match[1]}:${match[2]}` : "09:00";
}

// New notes are appended after the current last one. Good enough for a
// single-user app; see README's note on why full LexoRank isn't needed.
async function nextPosition() {
  try {
    const last = await pb
      .collection("notes")
      .getFirstListItem("", { sort: "-position" });
    return last.position + 1;
  } catch {
    return 1;
  }
}

function NoteFormFields(props) {
  const store = useBuilderStoreContext();
  const navigate = useNavigate();
  const [label, setLabel] = createSignal(props.note?.label ?? "");
  const [description, setDescription] = createSignal(
    props.note?.description ?? "",
  );
  const [time, setTime] = createSignal(extractTime(props.note?.dtstart));
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store.validateForm()) {
      setError(
        "Please complete the recurrence rule (e.g. select at least one weekday).",
      );
      return;
    }

    setError("");
    setPending(true);
    try {
      const data = {
        label: label(),
        description: description(),
        dtstart: toDtstartString(store.startDate(), time()),
        rrule: extractRRuleLine(store.rruleString()),
      };
      if (props.note) {
        await pb.collection("notes").update(props.note.id, data);
      } else {
        data.position = await nextPosition();
        await pb.collection("notes").create(data);
      }
      navigate("/");
    } catch (err) {
      console.error("save note failed:", err?.response ?? err);
      setError(err?.response?.message ?? "Failed to save the entry.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="flex w-full flex-col gap-6">
      <label class="flex flex-col gap-1 text-sm">
        <span>Label</span>
        <input
          type="text"
          value={label()}
          onInput={(e) => setLabel(e.target.value)}
          required
          autofocus
          class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
        />
      </label>

      <label class="flex flex-col gap-1 text-sm">
        <span>Description</span>
        <textarea
          value={description()}
          onInput={(e) => setDescription(e.target.value)}
          rows="3"
          class="rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
        />
      </label>

      <RRuleBuilder
        enableYearlyInterval
        rruleString={toBuilderRRuleString(props.note?.dtstart, props.note?.rrule)}
      />

      <label class="flex flex-col gap-1 text-sm">
        <span>Notify at</span>
        <input
          type="time"
          value={time()}
          onInput={(e) => setTime(e.target.value)}
          required
          class="w-32 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 py-1 text-[var(--color-text)]"
        />
      </label>

      {error() && <p class="text-sm text-[#dc3545]">{error()}</p>}

      <button type="submit" class="btn" disabled={pending()}>
        {pending() ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

// props.note: pass an existing PocketBase note record to edit it, or omit
// to create a new one.
export default function NoteForm(props) {
  return (
    <BuilderStoreProvider>
      <NoteFormFields note={props.note} />
    </BuilderStoreProvider>
  );
}
