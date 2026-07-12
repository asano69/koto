// Ported from Repeat/RepeatHourly.tsx.

import IntervalTextInput from "./Inputs/IntervalTextInput";

export default function RepeatHourly(props) {
  return (
    <IntervalTextInput
      value={props.value}
      onChange={props.onChange}
      unit="hour"
      pluralizeUnit
    />
  );
}
