// New entry creation form. Reuses RRuleBuilder for the recurrence rule
// and saves directly to PocketBase via pb.js (see CLAUDE.md WIP note).
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import NavBar from "../components/NavBar";
import RRuleBuilder from "../components/RRuleBuilder/RRuleBuilder";
import { BuilderStoreProvider, useBuilderStoreContext } from "../lib/rrule";
import pb from "../lib/pb";

// Dates are naive (see CLAUDE.md), so this only ever reads the UTC fields
// of the Date, never the local timezone ones.
function toDateOnlyString(date) {
  if (!date) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// The store's rruleString includes a leading "DTSTART:" line, but dtstart
// is stored in its own field, so only the "RRULE:" line is kept here.
function extractRRuleLine(rruleString) {
  if (!rruleString) return "";
  const line = rruleString.split("\n").find((l) => l.startsWith("RRULE:"));
  return line ?? rruleString;
}

// New notes are appended after the current last one. Good enough for a
// single-user app; see README's note on why full LexoRank isn't needed.
async function nextPosition() {
  const last = await pb
    .collection("notes")
    .getFirstListItem("", { sort: "-position" })
    .catch(() => null);
  return last ? last.position + 1 : 0;
}

function NewEntryForm() {
  const navigate = useNavigate();
  const store = useBuilderStoreContext();
  const [label, setLabel] = createSignal("");
  const [description, setDescription] = createSignal("");
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
      const position = await nextPosition();
      await pb.collection("notes").create({
        label: label(),
        description: description(),
        dtstart: toDateOnlyString(store.startDate()),
        rrule: extractRRuleLine(store.rruleString()),
        position,
      });
      navigate("/");
    } catch {
      setError("Failed to save the entry.");
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

      <RRuleBuilder enableYearlyInterval />

      {error() && <p class="text-sm text-[#dc3545]">{error()}</p>}

      <button type="submit" class="btn" disabled={pending()}>
        {pending() ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export default function NewEntry() {
  return (
    <div class="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 bg-[var(--color-bg)] px-6 py-12 text-[var(--color-text)]">
      <NavBar />
      <h1 class="font-serif text-4xl">New Entry</h1>

      <BuilderStoreProvider>
        <NewEntryForm />
      </BuilderStoreProvider>
    </div>
  );
}
