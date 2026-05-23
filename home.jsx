/* home2.jsx — alternate Home Screen for index2.html
   Aura-gradient design. Overrides window.HomeScreen at load. */

(function () {
  const { useEffect, useRef } = React;

  function HomeScreen2({ owned, totalOwned, total, onSeeAll, onLogout, userEmail, lastSeen }) {
    const pct = total ? Math.round((totalOwned / total) * 100) : 0;

    // NumberFlow animates count + percentage from the value the user last saw
    // on this screen to the current value.
    const countRef = useRef(null);
    const pctRef = useRef(null);
    useEffect(() => {
      const from = lastSeen.totalOwned == null ? totalOwned : lastSeen.totalOwned;
      window.flowAnimate(countRef.current, from, totalOwned);
      lastSeen.totalOwned = totalOwned;
    }, []); // eslint-disable-line
    useEffect(() => {
      const from = lastSeen.pct == null ? pct : lastSeen.pct;
      window.flowAnimate(pctRef.current, from, pct);
      lastSeen.pct = pct;
    }, []); // eslint-disable-line

    return (
      <div className="home2" style={{ "--pct": pct }}>
        <div className="home2-aura" aria-hidden />

        <div className="home2-content">
          <div className="home2-top">
            <div className="home2-stamp">
              ALBUM 2026
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
