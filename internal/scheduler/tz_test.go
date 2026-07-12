package scheduler

import (
	"testing"
	"time"

	"github.com/asano69/kithara/internal/db"
)

func TestParseRuleAgainstLocalWallClockAcrossTimezones(t *testing.T) {
	original := time.Local
	defer func() { time.Local = original }()

	jst, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		t.Skipf("Asia/Tokyo zoneinfo not available: %v", err)
	}
	time.Local = jst

	// A note created "5 seconds from now" as measured on the local wall
	// clock -- this is what the frontend actually sends: naive digits
	// with no timezone (see NoteForm.jsx's toDtstartString).
	target := time.Now().Add(5 * time.Second)
	note := db.Note{
		ID:      "note1",
		Dtstart: target.Format("20060102T150405"),
		RRule:   "FREQ=MINUTELY;INTERVAL=1",
	}

	rule, err := parseRule(note)
	if err != nil {
		t.Fatalf("parseRule() error = %v", err)
	}

	// This mirrors exactly what scheduler.load()/fireDue() do today.
	now := time.Now().UTC()
	next := rule.After(now, false)
	if next.IsZero() {
		t.Fatal("expected a non-zero next occurrence")
	}

	if gap := next.Sub(now); gap < 0 || gap > 10*time.Second {
		t.Errorf("next occurrence is %v away from now; want ~5s (a large "+
			"gap close to the local UTC offset means DTSTART and 'now' "+
			"are being compared in mismatched timezones)", gap)
	}
}
