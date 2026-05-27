/* Screens — Home, AllCountries, CountryDetail */

const { useState, useMemo, useEffect, useRef } = React;

// ---------- NumberFlow helper ----------
// Safely call <number-flow>'s .update(value); waits for custom-element upgrade if needed.
function flowUpdate(el, value) {
  if (!el) return;
  if (typeof el.update === "function") {
    el.update(value);
    return;
  }
  if (window.customElements && customElements.whenDefined) {
    customElements.whenDefined("number-flow").then(() => {
      if (typeof el.update === "function") el.update(value);
    });
  }
}

// Animate from `from` to `to`. If equal, just sets the value (no animation).
function flowAnimate(el, from, to) {
  if (!el) return;
  flowUpdate(el, from);
  if (from !== to) {
    requestAnimationFrame(() => flowUpdate(el, to));
  }
}

// ---------- helpers ----------
function countryProgress(country, owned) {
  const start = country.startAt ?? 1;
  let n = 0;
  for (let i = start; i < start + country.count; i++) {
    if (owned[country.code + i]) n++;
  }
  return { owned: n, total: country.count, pct: country.count ? n / country.count : 0 };
}

function statusOf(p) {
  if (p.owned === 0) return "not-started";
  if (p.owned === p.total) return "complete";
  return "in-progress";
}

// ---------- HOME ----------
function HomeScreen({ owned, totalOwned, total, countries, onSeeAll, onLogout, userEmail, lastSeen }) {
  const pct = total ? Math.round((totalOwned / total) * 100) : 0;

  const is100 = pct === 100 && total > 0;

  // Animate figurinhas + percentage when user returns with changed values
  const numRef = useRef(null);
  const pctRef = useRef(null);
  useEffect(() => {
    const from = lastSeen.totalOwned == null ? totalOwned : lastSeen.totalOwned;
    flowAnimate(numRef.current, from, totalOwned);
    lastSeen.totalOwned = totalOwned;
  }, []); // eslint-disable-line
  useEffect(() => {
    const from = lastSeen.pct == null ? pct : lastSeen.pct;
    flowAnimate(pctRef.current, from, pct);
    lastSeen.pct = pct;
  }, []); // eslint-disable-line

  return (
    <div className="home">
      <div className="home-bg" />
      <div className="home-video" aria-hidden>
        <video src="uploads/Fixes___remove_the_music__th.mp4" autoPlay loop muted playsInline />
      </div>
      {is100 && (
        <div className="confetti" aria-hidden>
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} style={{
              left: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 8) * 0.3}s`,
              animationDuration: `${3 + (i % 5) * 0.4}s`,
            }} />
          ))}
        </div>
      )}

      <div className="home-content">
        <div className="home-topbar">
          <div className="home-eyebrow">ALBUM 2026</div>
          <button className="home-logout" onClick={onLogout} title={userEmail || "Sair"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sair
          </button>
        </div>

        <div className="home-headline">
          <div className="home-label">Figurinhas Adquiridas</div>
          <div className="home-figurinhas">
            <number-flow ref={numRef} class="num" />
            <span className="total">/{total}</span>
          </div>
        </div>

        <div className="home-divider" />

        <div className="home-percent-block">
          <div className="home-label">Conclusão do Álbum</div>
          <div className={"home-percent" + (is100 ? " celebrate" : "")}>
            <number-flow ref={pctRef} class="pct-num" />
            <span className="pct-sign">%</span>
          </div>
        </div>

        <div className="home-stats" />

        <button className="home-cta" onClick={onSeeAll}>
          Ver Todos os Países
          <span className="arrow"><ArrowRightIcon /></span>
        </button>
      </div>
    </div>
  );
}

// ---------- ALL COUNTRIES ----------
function AllCountriesScreen({ owned, totalOwned, total, groups, onBack, onSelectCountry, lastSeen, exiting, exitOffsetY, entering }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("group"); // "group" | "az"

  // Toggle animation: only animate after the user actually changes mode,
  // not on the first render (which collides with the morph entrance).
  const modeAnimRef = useRef(null);
  const prevModeRef = useRef(mode);
  if (prevModeRef.current !== mode) {
    modeAnimRef.current = mode;
    prevModeRef.current = mode;
  }

  const pct = total ? Math.round((totalOwned / total) * 100) : 0;

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (mode === "az") {
      const all = [];
      groups.forEach(g => g.countries.forEach(c => all.push({ ...c, group: g.id, groupLabel: g.label })));
      const filtered = all
        .filter(c => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
        .sort((a, b) => a.code.localeCompare(b.code));
      return [{ id: "AZ", label: "A–Z", countries: filtered, special: true }];
    }
    return groups
      .map(g => ({
        ...g,
        countries: g.countries.filter(c => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)),
      }))
      .filter(g => g.countries.length > 0);
  }, [groups, query, mode]);

  const nothing = filteredGroups.length === 0 || filteredGroups.every(g => g.countries.length === 0);

  return (
    <div
      className={"list-screen" + (exiting ? " list-exiting" : "") + (entering ? " list-entering" : "")}
      style={exiting ? { "--exit-sy": (exitOffsetY || 0) + "px" } : undefined}
    >
      <div className="list-sticky">
      <div className="list-header">
        <div className="list-header-top">
          <button className="icon-btn" onClick={onBack} aria-label="Voltar">
            <BackIcon />
          </button>
        </div>
        <h1 className="list-title">Todos os Países</h1>
        <div className="list-counter">
          <span className="big">
            {totalOwned} / {total}
          </span>
          <span className="sep" />
          <span className="pct">{pct}%</span>
        </div>
      </div>

      <div className="list-controls">
        <div className="search-wrap">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar país ou sigla…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="view-toggle" data-mode={mode}>
          <div className="view-toggle-indicator" aria-hidden />
          <button
            className={"view-toggle-opt" + (mode === "group" ? " active" : "")}
            onClick={() => setMode("group")}
            aria-label="Por grupo"
            title="Por grupo"
            aria-pressed={mode === "group"}
          >
            <GridIcon active={mode === "group"} />
          </button>
          <button
            className={"view-toggle-opt" + (mode === "az" ? " active" : "")}
            onClick={() => setMode("az")}
            aria-label="A–Z"
            title="A–Z"
            aria-pressed={mode === "az"}
          >
            <AzIcon active={mode === "az"} />
          </button>
        </div>
      </div>
      </div>

      {nothing && <div className="empty">Nenhum país encontrado.</div>}

      <div key={modeAnimRef.current || "init"} className={"groups-wrap" + (modeAnimRef.current ? " groups-enter-" + modeAnimRef.current : "")}>
      {filteredGroups.map(group => {
        // group status (complete if all countries 100%)
        const allP = group.countries.map(c => countryProgress(c, owned));
        const allComplete = allP.length > 0 && allP.every(p => p.pct === 1);
        const anyOwned = allP.some(p => p.owned > 0);
        const groupLabel =
          group.special ? "A–Z" :
          (group.id === "ESP" ? "Grupo Especial" : `Grupo ${group.label}`);

        return (
          <div key={group.id} className="group-section">
            <div className="group-header">
              <div className="group-label">{groupLabel}</div>
              {!group.special && allComplete && (
                <div className="group-status complete">
                  <span className="dot" />
                  <span>Completo</span>
                </div>
              )}
            </div>
            <div className="country-grid">
              {group.countries.map(c => {
                const p = countryProgress(c, owned);
                const pPct = Math.round(p.pct * 100);
                const isComplete = pPct === 100;
                const isZero = p.owned === 0;
                return (
                  <button
                    key={c.code}
                    className="country-cell"
                    data-country-code={c.code}
                    onClick={(e) => onSelectCountry(c.code, e.currentTarget.getBoundingClientRect())}
                  >
                    <div className={"country-circle" + (isComplete ? " complete" : isZero ? " zero" : "")}>
                      <span className="flag-bg">{c.flag}</span>
                      <span className="pct-fg">
                        {isComplete ? c.flag : `${pPct}%`}
                      </span>
                    </div>
                    <span className="country-label">{c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

// ---------- COUNTRY DETAIL ----------
function CountryPane({ code, allCountries, groups, owned, onToggle, numberFlowRef, interactive }) {
  const country = allCountries.find(c => c.code === code);
  if (!country) return null;
  const p = countryProgress(country, owned);
  const pct = Math.round(p.pct * 100);
  const isComplete = pct === 100;
  const groupOf = groups.find(g => g.countries.some(c => c.code === code));
  const groupLabel = groupOf.id === "ESP" ? "Grupo Especial" : `Grupo ${groupOf.label}`;

  return (
    <React.Fragment>
      <div className="detail-header">
        <div className="detail-info">
          <div className="detail-eyebrow">{groupLabel} · {country.code}</div>
          <h1 className="detail-name">{country.name}</h1>

          <div className="detail-sub">
            <span className="group-tag">
              <b>{p.owned}</b> de {p.total} figurinhas
            </span>
            <span className={"pct" + (isComplete ? " full" : "")}>
              {numberFlowRef
                ? <number-flow ref={numberFlowRef} />
                : <span>{pct}</span>}
              <span className="sign">%</span>
            </span>
          </div>

          <div className="progress-bar"><div className="fill" style={{ width: `${pct}%` }} /></div>

          {isComplete && (
            <div className="complete-badge">✓ Completo</div>
          )}
        </div>
      </div>

      <div className="sticker-grid">
        {Array.from({ length: country.count }).map((_, i) => {
          const n = (country.startAt ?? 1) + i;
          const isOwned = !!owned[country.code + n];
          return (
            <button
              key={n}
              className={"sticker" + (isOwned ? " owned" + (isComplete ? " accent" : "") : "")}
              onClick={interactive ? () => onToggle(country.code, n) : undefined}
              tabIndex={interactive ? 0 : -1}
            >
              {n}
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );
}

function CountryDetailScreen({ countryCode, owned, setOwned, allCountries, groups, onBack, onSelectCountry, onSeeAll, exiting }) {
  const idx = allCountries.findIndex(c => c.code === countryCode);
  const country = allCountries[idx];
  const prev = idx > 0 ? allCountries[idx - 1] : null;
  const next = idx < allCountries.length - 1 ? allCountries[idx + 1] : null;
  const pct = Math.round(countryProgress(country, owned).pct * 100);

  // NumberFlow for current pane's percentage
  const numberFlowRef = useRef(null);
  useEffect(() => {
    flowUpdate(numberFlowRef.current, pct);
  }, [pct, countryCode]);

  // Slide-out + slide-in transition driven by arrow taps
  const [exitingCode, setExitingCode] = useState(null);
  const [direction, setDirection] = useState(null);
  const prevCodeRef = useRef(countryCode);

  useEffect(() => {
    if (prevCodeRef.current === countryCode) return;
    const oldIdx = allCountries.findIndex(c => c.code === prevCodeRef.current);
    const dir = idx > oldIdx ? "next" : "prev";
    setExitingCode(prevCodeRef.current);
    setDirection(dir);
    prevCodeRef.current = countryCode;
    const t = setTimeout(() => {
      setExitingCode(null);
      setDirection(null);
    }, 420);
    return () => clearTimeout(t);
  }, [countryCode]); // eslint-disable-line

  const handleToggleSticker = (code, n) => {
    const key = code + n;
    setOwned(p => {
      const nx = { ...p };
      if (nx[key]) delete nx[key];
      else nx[key] = true;
      return nx;
    });
  };

  return (
    <div className={"detail-screen" + (exiting ? " detail-exiting" : "")}>
      <div className="detail-card">
        <div className="detail-static-row">
          <button className="back-btn" onClick={onBack} aria-label="Voltar">
            <BackIcon />
          </button>
          <span className="country-flag-large">{country.flag}</span>
        </div>
        <div className="detail-slide-stage">
          {exitingCode && (
            <div
              key={"exit-" + exitingCode}
              className={"detail-pane exiting exiting-" + direction}
              aria-hidden
            >
              <CountryPane
                code={exitingCode}
                allCountries={allCountries}
                groups={groups}
                owned={owned}
                onToggle={handleToggleSticker}
                numberFlowRef={null}
                interactive={false}
              />
            </div>
          )}
          <div
            key={countryCode}
            className={"detail-pane current" + (direction ? " entering-" + direction : "")}
          >
            <CountryPane
              code={countryCode}
              allCountries={allCountries}
              groups={groups}
              owned={owned}
              onToggle={handleToggleSticker}
              numberFlowRef={numberFlowRef}
              interactive={true}
            />
          </div>
        </div>
      </div>

      <div className="detail-footer">
        <button
          className="nav-arrow"
          disabled={!prev}
          onClick={() => prev && onSelectCountry(prev.code)}
          aria-label="País anterior"
        >
          <ArrowLeftIcon />
        </button>
        <button className="view-all" onClick={onSeeAll}>Ver Todos</button>
        <button
          className="nav-arrow"
          disabled={!next}
          onClick={() => next && onSelectCountry(next.code)}
          aria-label="Próximo país"
        >
          <ArrowRightLargeIcon />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomeScreen, AllCountriesScreen, CountryDetailScreen, countryProgress, statusOf,
  flowUpdate, flowAnimate,
});
