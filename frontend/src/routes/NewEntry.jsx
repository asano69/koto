// New entry creation page. The form itself lives in NoteForm.jsx, shared
// with EditEntry.jsx.
import NavBar from "../components/NavBar";
import NoteForm from "../components/NoteForm";

export default function NewEntry() {
  return (
    <div class="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 bg-[var(--color-bg)] px-6 py-12 text-[var(--color-text)]">
      <NavBar />
      <h1 class="font-serif text-4xl">New Entry</h1>
      <NoteForm />
    </div>
  );
}
