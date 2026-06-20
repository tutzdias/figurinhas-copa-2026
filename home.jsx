/* home2.jsx — alternate Home Screen for index2.html
   Aura-gradient design. Overrides window.HomeScreen at load. */

(function () {
  const { useEffect, useRef } = React;

  function HomeScreen2({ owned, totalOwned, total, onSeeAll, onLogout, userEmail, lastSeen, ready }) {
    const pct = total ? Math.round((totalOwned / total) * 100) : 0;

    // NumberFlow animates count + percentage from the value the user last saw
    // on this screen to the current value.
    const countRef = useRef(null);
    const pctRef = useRef(null);

    // Slow the Home count-up so it reads as a deliberate roll-up rather than
    // a quick snap. number-flow exposes EffectTiming props per layer; bumping
    // the durations stretches the whole animation. Easing keeps it smooth with
    // a soft settle at the end.
    const slowTiming = (el) => {
      if (!el) return;
      const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
      const apply = () => {
        el.transformTiming = { duration: 2000, easing: ease };
        el.spinTiming = { duration: 2000, easing: ease };
        el.opacityTiming = { duration: 900, easing: "ease-out" };
      };
      apply();
      // Re-apply once the custom element has upgraded, in case the pre-upgrade
      // property assignment was shadowed by the class accessors.
      if (window.customElements && customElements.whenDefined) {
        customElements.whenDefined("number-flow").then(apply);
      }
    };

    // Re-run when the values change (e.g. when stickers finish loading after
    // the Home screen has already mounted) so the number-flow elements update
    // from the last-seen value to the freshly-loaded one.
    //
    // While `ready` is false the loading overlay still covers the screen, so we
    // hold the numbers at 0 (no animation). The roll-up fires only once loading
    // ends and `ready` flips true — that way the user actually sees it.
    useEffect(() => {
      slowTiming(countRef.current);
      if (!ready) {
        window.flowUpdate(countRef.current, 0);
        return;
      }
      const from = lastSeen.totalOwned == null ? 0 : lastSeen.totalOwned;
      window.flowAnimate(countRef.current, from, totalOwned);
      lastSeen.totalOwned = totalOwned;
    }, [ready, totalOwned]); // eslint-disable-line
    useEffect(() => {
      slowTiming(pctRef.current);
      if (!ready) {
        window.flowUpdate(pctRef.current, 0);
        return;
      }
      const from = lastSeen.pct == null ? 0 : lastSeen.pct;
      window.flowAnimate(pctRef.current, from, pct);
      lastSeen.pct = pct;
    }, [ready, pct]); // eslint-disable-line

    return (
      <div className="home2" style={{ "--pct": pct }}>
        <div className="home2-aura" aria-hidden />

        <div className="home2-content">
          <div className="home2-top">
            <div className="home2-stamp">
              <div className="home2-stamp-line">
                ALBUM 2026 <span className="home2-version-dot">·</span> <span className="home2-version">v1.3.0</span>
              </div>
            </div>
            <button
              className="home2-logout"
              onClick={onLogout}
              title={userEmail || "Sair"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Sair
            </button>
          </div>

          <div className="home2-count">
            <number-flow ref={countRef} class="count-amount" />
            <span className="count-total">/{total}</span>
          </div>

          <div className="home2-spacer" />

          <div className="home2-label">Conclusão do Álbum</div>
          <div className="home2-pct">
            <number-flow ref={pctRef} class="home2-pct-num" />
            <span className="home2-pct-sign">%</span>
          </div>

          <button className="home2-cta" onClick={onSeeAll}>
            Ver Todos os Países
            <span className="arrow"><window.ArrowRightIcon /></span>
          </button>
        </div>
      </div>
    );
  }

  window.HomeScreen = HomeScreen2;
})();
