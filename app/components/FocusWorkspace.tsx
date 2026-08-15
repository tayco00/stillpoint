"use client";

import { useState } from "react";
import { FocusTimer } from "./FocusTimer";
import { SessionRitual } from "./SessionContinuity";
import { useStillpointContext } from "./StillpointClient";

export function FocusWorkspace() {
  const {
    data,
    setIntention,
    recordSession,
    completeSessionReview,
    setPreferredDuration,
  } = useStillpointContext();
  const [ritualOpen, setRitualOpen] = useState(false);

  const completeSession = (minutes: number) => {
    recordSession(minutes);
    setRitualOpen(true);
  };

  const saveReview = (outcome: string, nextStep: string) => {
    completeSessionReview(outcome, nextStep);
    setRitualOpen(false);
  };

  return (
    <div className="timer-stage" id="workspace">
      <div className="orbit orbit-one" aria-hidden="true" />
      <div className="orbit orbit-two" aria-hidden="true" />
      <FocusTimer
        key={data.preferredDuration}
        intention={data.intention}
        onIntentionChange={setIntention}
        onComplete={completeSession}
        onDurationChange={setPreferredDuration}
        initialDuration={data.preferredDuration}
      />
      <SessionRitual
        open={ritualOpen}
        intention={data.intention}
        onSave={saveReview}
        onDismiss={() => setRitualOpen(false)}
      />
    </div>
  );
}
