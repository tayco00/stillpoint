"use client";

import { FocusTimer } from "./FocusTimer";
import { useStillpointContext } from "./StillpointClient";

export function FocusWorkspace() {
  const { data, setIntention, recordSession, setPreferredDuration } = useStillpointContext();

  return (
    <div className="timer-stage" id="workspace">
      <div className="orbit orbit-one" aria-hidden="true" />
      <div className="orbit orbit-two" aria-hidden="true" />
      <FocusTimer
        key={data.preferredDuration}
        intention={data.intention}
        onIntentionChange={setIntention}
        onComplete={recordSession}
        onDurationChange={setPreferredDuration}
        initialDuration={data.preferredDuration}
      />
      <p className="stage-caption"><span>01</span> Mach nur das. Für jetzt.</p>
    </div>
  );
}
