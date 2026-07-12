// Ported from Repeat/RepeatDaily.tsx.

import IntervalTextInput from "./Inputs/IntervalTextInput";

export default function RepeatDaily(props) {
  return (
    <IntervalTextInput
      value={props.value}
      onChange={props.onChange}
      unit="day"
      pluralizeUnit
    />
  );
}
