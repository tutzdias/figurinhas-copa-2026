/* Screens — Home, AllCountries, CountryDetail */

const { useState, useMemo, useEffect, useRef } = React;

// ---------- helpers ----------
function countryProgress(country, owned) {
  let n = 0;
  for (let i = 1; i <= country.count; i++) {
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
function HomeScreen({ owned, totalOwned, total, countries, onSeeAll }) {
  const pct = total ? Math.round((totalOwned / total) * 100) : 0;
  const missing = total - totalOwned;
  const stats = useMemo(() => {
    let complete = 0, started = 0, notStarted = 0;
    countries.forEach(c => {
      const p = countryProgress(c, owned);
      const s = statusOf(p);
      if (s === "complete") complete++;
      else if (s === "in-progress") started++;
      else notStarted++;
    });
    return { complete, started, notStarted };
  }, [owned, countries]);

  const is100 = pct === 100 && total > 0;

  return (
    <div className="home screen-enter">
      <div className="home-bg" />
      <div className="home-trophy" aria-hidden>
        <div className="home-trophy-glow" />
        <img src="assets/trophy.webp" alt="" />
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
          <div className="home-eyebrow"><span className="dot" /> AO VIVO · ALBUM 2026</div>
          <div className="home-stamp">
            COPA<br/>MUNDIAL<br/>2026
          </div>
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

        <div className="home-stats">
          <div className="home-stat">
            <span className="stat-label">Faltantes</span>
            <span className="stat-value">{missing}</span>
          </div>
          <div className="home-stat">
            <span className="stat-label">Completos</span>
            <span className="stat-value">{stats.complete}<span className="sub">/ {countries.length}</span></span>
          </div>
          <div className="home-stat">
            <span className="stat-label">Iniciados</span>
            <span className="stat-value">{stats.started}<span className="sub">/ {countries.length}</span></span>
          </div>
        </div>

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
      <div className="list-header">
        <div className="list-header-top">
          <button className="icon-btn" onClick={onBack} aria-label="Voltar">
            <BackIcon />
          </button>
          <div className="home-stamp" style={{textAlign: "right"}}>
            CATÁLOGO<br/>901 figurinhas
          </div>
        </div>
        <h1 className="list-title">Ver Todos</h1>
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
        <div className="view-toggle">
          <button
            className={mode === "group" ? "active" : ""}
            onClick={() => setMode("group")}
            aria-label="Por grupo"
            title="Por grupo"
          >
            <GridIcon active={mode === "group"} />
          </button>
          <button
            className={mode === "az" ? "active" : ""}
            onClick={() => setMode("az")}
            aria-label="A–Z"
            title="A–Z"
          >
            <AzIcon active={mode === "az"} />
          </button>
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
              {!group.special && (
                <div className={"group-status " + (allComplete ? "complete" : anyOwned ? "in-progress" : "")}>
                  <span className="dot" />
                  {allComplete ? "Completo" : anyOwned ? "Em andamento" : "Não iniciado"}
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
          <span className={"pct" + (isComplete ? " full" : "")}>
            {pct}<span className="sign">%</span>
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
          const n = i + 1;
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
