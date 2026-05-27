/* CongratsScreen — celebration overlay shown when the user returns to
   "Todos os Países" after completing 1+ countries for the first time.

   Stages:
     0 — count-up (centered number on near-white bg)
     1 — green blob emerges from top-right
     2 — green covers the full screen
     3 — text reveal (stacked left, slide-in + fade) + CTA pill
     4 — fade out and call onClose

   Props:
     completedCount: number          — how many countries newly completed
     countryEmojis: string[]         — flag glyphs to show on stage 3
     onClose: () => void             — invoked when user dismisses
*/

function CongratsScreen({ completedCount, countryEmojis, onClose }) {
  const { useState, useEffect, useRef } = React;
  const [stage, setStage] = useState(0);
  const [num, setNum] = useState(0);
  const [closing, setClosing] = useState(false);
  const rafRef = useRef(null);

  // Stage 0: count up 0 → completedCount
  useEffect(() => {
    const dur = 900;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setNum(Math.round(eased * completedCount));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [completedCount]);

  // Sequence the visual stages
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1250); // blob emerges
    const t2 = setTimeout(() => setStage(2), 1900); // blob fills
    const t3 = setTimeout(() => setStage(3), 2350); // text reveal
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose && onClose(), 280);
  };

  const label = completedCount === 1 ? "País Completo" : "Países Completos";

  return (
    <div
      className={
        "congrats congrats-stage-" + stage + (closing ? " congrats-closing" : "")
      }
      role="dialog"
      aria-modal="true"
      aria-label={`${completedCount} ${label}`}
    >
      {/* Stage 0/1 centered count-up — fades out as blob takes over */}
      <div className="congrats-counter" aria-hidden={stage >= 2}>
        <span>{num}</span>
      </div>

      {/* Radial green blob, pinned to the top-right corner */}
      <div className="congrats-blob" aria-hidden="true" />

      {/* Stage 3 reveal — number, label, flags */}
      <div className="congrats-reveal" aria-hidden={stage < 3}>
        <div className="congrats-line congrats-line-num">{completedCount}</div>
        <div className="congrats-line congrats-line-label">{label}</div>
        <div className="congrats-line congrats-line-flags" aria-label="bandeiras">
          {countryEmojis.join("")}
        </div>
      </div>

      {/* CTA pill */}
      <div className="congrats-cta-wrap" aria-hidden={stage < 3}>
        <button className="congrats-cta" onClick={handleClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}

window.CongratsScreen = CongratsScreen;
