/* Screens — Home, AllCountries, CountryDetail */

const { useState, useMemo, useEffect, useRef } = React;

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
function HomeScreen({ owned, totalOwned, total, countries, onSeeAll, onLogout, userEmail }) {
  const pct = total ? Math.round((totalOwned / total) * 100) : 0;

  const is100 = pct === 100 && total > 0;

  return (
    <div className="home screen-enter">
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
            <span className="num">{totalOwned}</span>
            <span className="total">/{total}</span>
          </div>
        </div>

        <div className="home-divider" />

        <div className="home-percent-block">
          <div className="home-label">Conclusão do Álbum</div>
          <div className={"home-percent" + (is100 ? " celebrate" : "")}>
            <span className="pct-num">{pct}</span>
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
function AllCountriesScreen({ owned, totalOwned, total, groups, onBack, onSelectCountry }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("group"); // "group" | "az"

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
    <div className="list-screen screen-enter">
      <div className="list-sticky">
      <div className="list-header">
        <div className="list-header-top">
          <button className="icon-btn" onClick={onBack} aria-label="Voltar">
            <BackIcon />
          </button>
        </div>
        <h1 className="list-title">Todos os Países</h1>
        <div className="list-counter">
          <span className="big">{totalOwned} / {total}</span>
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
                  Completo
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
                    onClick={() => onSelectCountry(c.code)}
                  >
                    <div className={"country-circle" + (isComplete ? " complete" : isZero ? " zero" : "")}>
                      <span className="flag-bg">{c.flag}</span>
                      <span className="pct-fg">
                        {isComplete ? "✓" : `${pPct}%`}
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

      <div style={{ height: 32 }} />
    </div>
  );
}

// ---------- COUNTRY DETAIL ----------
function CountryDetailScreen({ countryCode, owned, setOwned, allCountries, groups, onBack, onSelectCountry, onSeeAll }) {
  const idx = allCountries.findIndex(c => c.code === countryCode);
  const country = allCountries[idx];
  const prev = idx > 0 ? allCountries[idx - 1] : null;
  const next = idx < allCountries.length - 1 ? allCountries[idx + 1] : null;

  // recompute progress for THIS country
  const p = countryProgress(country, owned);
  const pct = Math.round(p.pct * 100);
  const isComplete = pct === 100;

  // Micro-interaction: blur swap on percentage change
  const [displayedPct, setDisplayedPct] = useState(pct);
  const [pctBlur, setPctBlur] = useState(false);
  const lastCountry = useRef(countryCode);
  useEffect(() => {
    if (lastCountry.current !== countryCode) {
      lastCountry.current = countryCode;
      setDisplayedPct(pct);
      setPctBlur(false);
      return;
    }
    if (displayedPct === pct) return;
    setPctBlur(true);
    const t1 = setTimeout(() => {
      setDisplayedPct(pct);
      const t2 = setTimeout(() => setPctBlur(false), 60);
      return () => clearTimeout(t2);
    }, 320);
    return () => clearTimeout(t1);
  }, [pct, countryCode]);

  const toggleSticker = (n) => {
    const key = country.code + n;
    setOwned(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  // Find group label
  const groupOf = groups.find(g => g.countries.some(c => c.code === country.code));
  const groupLabel = groupOf.id === "ESP" ? "Grupo Especial" : `Grupo ${groupOf.label}`;

  return (
    <div className="detail-screen screen-enter" key={countryCode}>
      <div className="detail-card">
      <div className="detail-header">
        <div className="detail-topbar">
          <button className="back-btn" onClick={onBack} aria-label="Voltar">
            <BackIcon />
          </button>
          <span className="country-flag-large">{country.flag}</span>
        </div>

        <div className="detail-eyebrow">{groupLabel} · {country.code}</div>
        <h1 className="detail-name">{country.name}</h1>

        <div className="detail-sub">
          <span className="group-tag">
            <b>{p.owned}</b> de {p.total} figurinhas
          </span>
          <span className={"pct" + (isComplete ? " full" : "") + (pctBlur ? " blur" : "")}>
            {displayedPct}<span className="sign">%</span>
          </span>
        </div>

        <div className="progress-bar"><div className="fill" style={{ width: `${pct}%` }} /></div>

        {isComplete && (
          <div className="complete-badge">
            ✓ Completo
          </div>
        )}
      </div>

      <div className="sticker-grid">
        {Array.from({ length: country.count }).map((_, i) => {
          const n = (country.startAt ?? 1) + i;
          const isOwned = !!owned[country.code + n];
          return (
            <button
              key={n}
              className={"sticker" + (isOwned ? " owned" + (isComplete ? " accent" : "") : "")}
              onClick={() => toggleSticker(n)}
            >
              {n}
            </button>
          );
        })}
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

Object.assign(window, { HomeScreen, AllCountriesScreen, CountryDetailScreen, countryProgress, statusOf });
