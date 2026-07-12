// Resolves the timezone used to interpret naive wall-clock dtstart
// strings, from the "settings" collection's "TZ" record. Kept separate
// from convert.js so that module stays pure and framework-independent.
import pb from "../pb";

// Falls back to the browser's own timezone if "TZ" isn't set — more
// appropriate than a server-local default for a single-user app.
export async function loadTimezone() {
  try {
    const record = await pb.collection("settings").getFirstListItem('key="TZ"');
    return record.value || browserTimezone();
  } catch {
    return browserTimezone();
  }
}

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
