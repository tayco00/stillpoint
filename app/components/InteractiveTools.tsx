"use client";

import { useEffect } from "react";
import { BreathTool } from "./BreathTool";
import { CaptureTool } from "./CaptureTool";
import { EnergyTool } from "./EnergyTool";
import { RhythmSection } from "./RhythmSection";
import { useStillpointContext } from "./StillpointClient";

export function InteractiveTools() {
  const {
    data,
    recordBreath,
    setEnergy,
    setPreferredDuration,
    addNote,
    removeNote,
    setReflection,
    clearData,
    storageAvailable,
  } = useStillpointContext();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const useDuration = (duration: 25 | 45 | 60) => {
    setPreferredDuration(duration);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("#workspace")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <>
      <section className="tools-section" id="tools" aria-labelledby="tools-title">
        <div className="section-heading" data-reveal>
          <p><span>02–04</span> Kleine Werkzeuge</p>
          <h2 id="tools-title">Für alles,<br />was <em>dazwischen</em> kommt.</h2>
          <p className="section-lede">Kein System, das du pflegen musst. Drei Dinge, die genau dann helfen, wenn Fokus allein nicht reicht.</p>
        </div>
        <div className="tool-grid">
          <BreathTool onComplete={recordBreath} />
          <EnergyTool value={data.lastEnergy} onChange={setEnergy} onUseDuration={useDuration} />
          <CaptureTool notes={data.notes} onAdd={addNote} onRemove={removeNote} />
        </div>
      </section>

      <RhythmSection
        data={data}
        onReflectionChange={setReflection}
        onClear={clearData}
        storageAvailable={storageAvailable}
      />
    </>
  );
}
