/* Main app — auth gating, Supabase persistence, screen routing */

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 32, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Algo deu errado</div>
          <div style={{ fontSize: 13, opacity: 0.7, maxWidth: 280 }}>{String(this.state.error)}</div>
          <button
            style={{ marginTop: 8, padding: "12px 24px", borderRadius: 999, background: "#D4F455", color: "#111", fontWeight: 700, border: "none", fontSize: 15, cursor: "pointer" }}
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Run `cb` after the next paint. Prefers a double requestAnimationFrame for
   smooth timing, but GUARANTEES the callback runs via a setTimeout fallback —
   requestAnimationFrame is paused in in-app browsers ("navegador"), background
   tabs, and throttled/low-power contexts, and a transition that depends on it
   alone would hang forever (leaving the morph overlay stuck over the screen). */
function afterPaint(cb) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cb();
  };
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => requestAnimationFrame(run));
  }
  // Fallback: fires if rAF is throttled/paused so the transition always finishes.
  setTimeout(run, 80);
}

function LoadingScreen({ message }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    // Simulate a realistic load 0→100% over ~4.5s with eased, slightly
    // irregular increments so it doesn't feel mechanical.
    let raf;
    const start = performance.now();
    const DURATION = 4500;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      // easeInOutCubic for a natural ramp-up and settle
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(Math.min(100, Math.round(eased * 100)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="carregar">
      <div className="carregar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={message || "Carregando"}>
        <div className="carregar-fill" style={{ width: progress + "%" }} />
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="error-banner">
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Fechar">×</button>
    </div>
  );
}

function App() {
  const { groups, countries, total } = window.ALBUM;

  // Bloqueio caro se Supabase não estiver configurado
  if (!window.SUPABASE_CONFIGURED) {
    return (
      <div className="app-shell">
        <div className="config-warning">
          <h2>Supabase não configurado</h2>
          <p>
            Abra <code>supabase-client.js</code> e preencha
            <code>SUPABASE_URL</code> e <code>SUPABASE_ANON_KEY</code>
            com os valores do seu projeto.
          </p>
          <p className="hint">
            Dashboard Supabase → <b>Project Settings</b> → <b>API</b>
          </p>
        </div>
      </div>
    );
  }

  // ---- Auth state ----
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);

  // ---- Stickers state ----
  const [owned, setOwned] = useState({});
  const [stickersLoading, setStickersLoading] = useState(false);
  const [loadingFading, setLoadingFading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ---- Routing ----
  const [route, setRoute] = useState("home");

  // Bootstrap: read existing session + subscribe to changes
  useEffect(() => {
    let mounted = true;

    getSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      setAuthReady(true);
    }).catch(() => {
      if (!mounted) return;
      setAuthReady(true);
    });

    const sub = onAuthChange((s) => {
      if (!mounted) return;
      setSession(s);
      if (!s) {
        // Sessão expirada / logout
        setOwned({});
        setRoute("home");
      }
    });

    return () => {
      mounted = false;
      sub && sub.unsubscribe && sub.unsubscribe();
    };
  }, []);

  // Load stickers whenever we have a session (user_id changes)
  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    setStickersLoading(true);
    setErrorMsg("");
    // Hold the loading screen for at least 3s so the Carregar animation
    // always gets a chance to display, even if the fetch resolves instantly.
    const MIN_LOAD_MS = 3000;
    const startedAt = Date.now();
    const stopLoading = () => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_LOAD_MS - (Date.now() - startedAt));
      setTimeout(() => {
        if (cancelled) return;
        // Quick fade-out of the loading overlay into the home screen, then
        // unmount the overlay.
        setLoadingFading(true);
        setTimeout(() => {
          if (cancelled) return;
          setStickersLoading(false);
          setLoadingFading(false);
        }, 420);
      }, wait);
    };
    fetchStickers(session.user.id)
      .then((map) => {
        if (cancelled) return;
        setOwned(map);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg("Falha ao carregar suas figurinhas. Verifique a conexão.");
        console.error(err);
      })
      .finally(stopLoading);

    return () => { cancelled = true; };
  }, [session?.user?.id]);

  // Toggle sticker with optimistic update + rollback on error
  const toggleSticker = async (code) => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const wasOwned = !!owned[code];

    // Optimistic
    setOwned((prev) => {
      const next = { ...prev };
      if (wasOwned) delete next[code];
      else next[code] = true;
      return next;
    });

    try {
      if (wasOwned) await removeSticker(userId, code);
      else          await addSticker(userId, code);
    } catch (err) {
      // Rollback
      setOwned((prev) => {
        const next = { ...prev };
        if (wasOwned) next[code] = true;
        else delete next[code];
        return next;
      });
      setErrorMsg("Não foi possível salvar a alteração. Tente novamente.");
      console.error(err);
    }
  };

  // Shim para CountryDetailScreen: ela espera setOwned(prev => next).
  // Repassamos para nossa fn assíncrona — detectamos o código alterado pelo diff.
  const setOwnedShim = (updater) => {
    const next = typeof updater === "function" ? updater(owned) : updater;
    // Descobre o code que mudou:
    const allKeys = new Set([...Object.keys(owned), ...Object.keys(next)]);
    let changed = null;
    for (const k of allKeys) {
      if (!!owned[k] !== !!next[k]) { changed = k; break; }
    }
    if (changed) toggleSticker(changed);
  };

  const handleLogout = async () => {
    try { await signOut(); } catch (e) { /* ignore */ }
  };

  const totalOwned = useMemo(() => {
    let n = 0;
    countries.forEach(c => {
      const start = c.startAt ?? 1;
      for (let i = start; i < start + c.count; i++) if (owned[c.code + i]) n++;
    });
    return n;
  }, [owned, countries]);

  // Last-seen values per screen so number-flow animates from the value the user
  // last saw on that screen to the current value when they return.
  const lastSeenHome = useRef({ totalOwned: null, pct: null });
  const lastSeenAll = useRef({ totalOwned: null, pct: null });

  // Scroll position of .app-shell when leaving AllCountries → CountryDetail,
  // restored on back-nav so the cell reappears at the position the user remembers
  // (and so the reverse morph has a visible source).
  const savedAllScrollY = useRef(0);

  // ---- Celebration: detect newly completed countries on entering "all" ----
  // celebratedRef holds the set of country codes the user has already been
  // congratulated for. Persisted to localStorage so we don't replay the
  // celebration after a page reload. A country drops out of the set if its
  // completion regresses below 100 % (so re-completing celebrates again).
  const celebratedRef = useRef(null);
  const [celebration, setCelebration] = useState(null);

  // DEV preview: open the celebration screen with arbitrary args from the
  // browser console, e.g.  __previewCongrats(2, ["🇺🇾","🇧🇷"])
  useEffect(() => {
    window.__previewCongrats = (count = 2, flags = ["🇺🇾", "🇧🇷"]) => {
      setCelebration({ completedCount: count, countryEmojis: flags });
    };
    window.__resetCelebrated = () => {
      try { localStorage.removeItem("figurinhas:celebrated"); } catch {}
      celebratedRef.current = null;
    };
    return () => {
      try {
        delete window.__previewCongrats;
        delete window.__resetCelebrated;
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!countries || !countries.length) return;
    if (typeof window.countryProgress !== "function") return;

    // Lazy-init celebratedRef from localStorage (once).
    if (celebratedRef.current === null) {
      try {
        const raw = localStorage.getItem("figurinhas:celebrated");
        celebratedRef.current = raw ? new Set(JSON.parse(raw)) : new Set();
      } catch {
        celebratedRef.current = new Set();
      }
    }

    // Prune codes that are no longer complete (so re-completing celebrates again).
    let changed = false;
    Array.from(celebratedRef.current).forEach((code) => {
      const c = countries.find((x) => x.code === code);
      if (!c) return;
      const p = window.countryProgress(c, owned);
      if (p.pct !== 1 || p.total === 0) {
        celebratedRef.current.delete(code);
        changed = true;
      }
    });
    if (changed) {
      try {
        localStorage.setItem(
          "figurinhas:celebrated",
          JSON.stringify([...celebratedRef.current])
        );
      } catch {}
    }

    // Only fire when arriving at the AllCountries screen.
    if (route !== "all") return;
    if (celebration) return; // already showing one

    const newlyComplete = [];
    countries.forEach((c) => {
      const p = window.countryProgress(c, owned);
      if (
        p.pct === 1 &&
        p.total > 0 &&
        !celebratedRef.current.has(c.code)
      ) {
        newlyComplete.push(c);
      }
    });
    if (newlyComplete.length === 0) return;

    setCelebration({
      completedCount: newlyComplete.length,
      countryEmojis: newlyComplete.map((c) => c.flag),
    });
    newlyComplete.forEach((c) => celebratedRef.current.add(c.code));
    try {
      localStorage.setItem(
        "figurinhas:celebrated",
        JSON.stringify([...celebratedRef.current])
      );
    } catch {}
  }, [route, owned, countries, celebration]);

  // ---- Stamp shared-element transition (Home stamp ↔ Selos page) ----
  const [stampTransition, setStampTransition] = useState(null);
  const homeStampRef = useRef(null);
  const selosStampRef = useRef(null);
  // Cache stamp rects so each direction can animate without the other screen mounted.
  const selosStampRectCache = useRef(null);
  const homeStampRectCache = useRef(null);

  const handleOpenSelos = (rect) => {
    if (stampTransition) return;
    const from = { top: rect.top, left: rect.left, width: rect.width };
    homeStampRectCache.current = from;
    let to = selosStampRectCache.current;
    if (!to) {
      const tmp = document.createElement('div');
      tmp.style.cssText = 'position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top,0px);visibility:hidden';
      document.body.appendChild(tmp);
      const safeTop = parseFloat(getComputedStyle(tmp).paddingTop) || 0;
      document.body.removeChild(tmp);
      const shell = document.querySelector('.app-shell');
      const sl = shell ? shell.getBoundingClientRect().left : 0;
      const st = shell ? shell.getBoundingClientRect().top  : 0;
      to = { top: st + 32 + safeTop, left: sl + 16, width: 250 };
    }
    setStampTransition({ dir: "open", from, to, phase: "init" });
    afterPaint(() => {
      setStampTransition(m => m && { ...m, phase: "expand" });
    });
    window.setTimeout(() => {
      setRoute("selos");
      setStampTransition(null);
    }, 560);
  };

  const handleBackFromSelos = () => {
    if (stampTransition) return;
    const selosEl = selosStampRef.current;
    const sr = selosEl ? selosEl.getBoundingClientRect() : null;
    const from = sr
      ? { top: sr.top, left: sr.left, width: sr.width }
      : selosStampRectCache.current || { top: 32, left: 16, width: 250 };
    selosStampRectCache.current = from;
    const to = homeStampRectCache.current;
    // Mirror the open transition: keep selos screen visible during the animation,
    // then switch to home once the collapse starts (same frame as afterPaint).
    // This avoids the white flash caused by the old approach of switching routes
    // immediately and using a cream dim to cover the home screen.
    if (!to) { setRoute("home"); return; }
    setStampTransition({ dir: "close", from, to, phase: "init" });
    afterPaint(() => {
      setRoute("home");
      setStampTransition(m => m && { ...m, phase: "collapse" });
    });
    window.setTimeout(() => setStampTransition(null), 560);
  };

  // Safety net: always clear a stuck stamp morph
  useEffect(() => {
    if (!stampTransition) return;
    const safety = window.setTimeout(() => setStampTransition(null), 1400);
    return () => clearTimeout(safety);
  }, [stampTransition]);

  // ---- Shared-element transition (Country square → Country detail card) ----
  const [countryMorph, setCountryMorph] = useState(null);

  // ---- Reverse morph (back button: detail card → country square) ----
  const [reverseMorph, setReverseMorph] = useState(null);

  // ---- Morph safety nets ---------------------------------------------------
  // The open/close morphs are driven by a short chain of timers + rAF. The
  // overlay includes a full-screen solid #1A1A1A backdrop (z-index 100), so if
  // that chain ever stalls — paused requestAnimationFrame / throttled timers in
  // an in-app browser ("navegador"), a backgrounded tab, low-power mode — the
  // black backdrop would be left covering the screen, looking like an empty
  // black page. These effects guarantee the overlay is always torn down (and
  // the destination route reached) after a hard maximum, so the user can never
  // get stranded on a blank screen.
  useEffect(() => {
    if (!countryMorph) return;
    const code = countryMorph.code;
    const safety = setTimeout(() => {
      setRoute((r) => (r === "country:" + code ? r : "country:" + code));
      setCountryMorph(null);
      const cell = document.querySelector(`[data-country-code="${code}"]`);
      if (cell) cell.style.visibility = "";
    }, 1100);
    return () => clearTimeout(safety);
  }, [countryMorph]);

  useEffect(() => {
    if (!reverseMorph) return;
    const code = reverseMorph.code;
    const safety = setTimeout(() => {
      setReverseMorph(null);
      const cell = document.querySelector(`[data-country-code="${code}"]`);
      if (cell) cell.style.visibility = "";
    }, 1200);
    return () => clearTimeout(safety);
  }, [reverseMorph]);

  // ---- Detail-screen exit ("Ver Todos" footer button: slide-down + fade) ----
  const [detailExiting, setDetailExiting] = useState(false);

  // ---- AllCountries-screen exit (back button: slide-down + fade) ----
  const [allExiting, setAllExiting] = useState(false);
  const [allExitOffsetY, setAllExitOffsetY] = useState(0);

  const handleBackFromAll = () => {
    if (allExiting) return;
    const shell = document.querySelector(".app-shell");
    const sy = shell ? shell.scrollTop : 0;
    setAllExitOffsetY(sy);
    // Reset scroll so the HomeScreen overlay (rendered in flow behind) is
    // positioned at the visible viewport top. The list-screen, while exiting,
    // is position:absolute top:0 and uses --exit-sy to translate back into the
    // user's original visual position before the slide-right begins.
    if (shell) shell.scrollTop = 0;
    setAllExiting(true);
    window.setTimeout(() => {
      setRoute("home");
      setAllExiting(false);
      setAllExitOffsetY(0);
    }, 340);
  };

  const handleSelectCountryAnimated = (code, rect) => {
    if (countryMorph) return;
    const shell = document.querySelector(".app-shell");
    if (!shell || !rect) {
      setRoute("country:" + code);
      return;
    }
    const s = shell.getBoundingClientRect();
    const from = {
      x: rect.left - s.left,
      y: rect.top - s.top,
      w: rect.width,
      h: rect.height,
    };
    const shellRect = { top: s.top, left: s.left, width: s.width, height: s.height };
    // Save scroll position so we can restore it on back-nav (and so the
    // route swap can reset scrollTop=0 without losing the user's place).
    savedAllScrollY.current = shell.scrollTop;
    const cell = document.querySelector(`[data-country-code="${code}"]`);
    if (cell) cell.style.visibility = "hidden";

    setCountryMorph({ from, code, shellWidth: s.width, shellRect, phase: "init" });
    afterPaint(() => {
      setCountryMorph((m) => m && { ...m, phase: "expand" });
    });
    window.setTimeout(() => {
      // Reset shell scroll so the new detail screen lands at the top —
      // exactly where the morph element finished animating to.
      shell.scrollTop = 0;
      // Clear morph and set route in the same tick so they batch into one
      // render — avoids a window where the route has changed but the morph
      // backdrop still covers the screen (visible on slow/in-app browsers).
      setRoute("country:" + code);
      setCountryMorph(null);
      if (cell) cell.style.visibility = "";
    }, 480);
  };

  // Back button on detail screen: reverse-morph the card back to the cell.
  const handleBackFromCountry = () => {
    if (reverseMorph || detailExiting) return;
    const code = route.startsWith("country:") ? route.slice("country:".length) : null;
    if (!code) { setRoute("all"); return; }
    const shell = document.querySelector(".app-shell");
    const card = document.querySelector(".detail-card");
    if (!shell || !card) { setRoute("all"); return; }
    const s = shell.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const cardRect = {
      x: c.left - s.left,
      y: c.top - s.top,
      w: c.width,
      h: c.height,
    };
    const shellRect = { top: s.top, left: s.left, width: s.width, height: s.height };

    setReverseMorph({
      code,
      cardRect,
      shellWidth: s.width,
      shellRect,
      cellRect: null,
      phase: "init", // morph visible at card size, content visible
    });
    // Mount AllCountries behind the overlay so we can measure the cell rect.
    setRoute("all");

    // After AllCountries renders, restore the saved scroll position so the
    // cell sits where the user remembers — then measure it.
    afterPaint(() => {
        const shell2 = document.querySelector(".app-shell");
        if (shell2) shell2.scrollTop = savedAllScrollY.current || 0;
        const cell = document.querySelector(`[data-country-code="${code}"]`);
        if (!shell2 || !cell) {
          // No target rect — just drop the overlay.
          setReverseMorph(null);
          return;
        }
        const s2 = shell2.getBoundingClientRect();
        const r = cell.getBoundingClientRect();
        const cellRect = {
          x: r.left - s2.left,
          y: r.top - s2.top,
          w: r.width,
          h: r.height,
        };
        cell.style.visibility = "hidden";
        setReverseMorph((m) => m && { ...m, cellRect, phase: "fading" });

        // After content fades out, start the shrink.
        window.setTimeout(() => {
          setReverseMorph((m) => m && { ...m, phase: "shrink" });
        }, 90);

        // After shrink completes, drop the overlay and reveal the cell.
        window.setTimeout(() => {
          setReverseMorph(null);
          if (cell) cell.style.visibility = "";
        }, 90 + 280 + 30);
    });
  };

  // "Ver Todos" on detail screen: slide the detail-screen down + fade out.
  const handleSeeAllFromCountry = () => {
    if (detailExiting || reverseMorph) return;
    setDetailExiting(true);
    window.setTimeout(() => {
      setRoute("all");
      setDetailExiting(false);
    }, 380);
  };

  // ---- AllCountries entrance (Home → All): slide in from the right ----
  const [allEntering, setAllEntering] = useState(false);

  const handleSeeAllAnimated = () => {
    if (allEntering || allExiting) return;
    setAllEntering(true);
    setRoute("all");
    window.setTimeout(() => setAllEntering(false), 340);
  };

  // ---- Render gates ----
  if (!authReady) {
    return <div className="app-shell"><LoadingScreen message="Iniciando…" /></div>;
  }

  if (!session) {
    return <div className="app-shell"><AuthScreen /></div>;
  }

  let screen = null;
  if (route === "home") {
    screen = (
      <HomeScreen
        owned={owned}
        totalOwned={totalOwned}
        total={total}
        countries={countries}
        onSeeAll={handleSeeAllAnimated}
        onLogout={handleLogout}
        userEmail={session.user.email}
        lastSeen={lastSeenHome.current}
        ready={!stickersLoading}
        stampRef={homeStampRef}
        stampHidden={!!stampTransition}
        onStampTap={handleOpenSelos}
      />
    );
  } else if (route === "selos") {
    screen = (
      <StampScreen
        onBack={handleBackFromSelos}
        stampHidden={!!stampTransition}
        stampRef={selosStampRef}
      />
    );
  } else if (route === "all") {
    screen = (
      <AllCountriesScreen
        owned={owned}
        totalOwned={totalOwned}
        total={total}
        groups={groups}
        onBack={handleBackFromAll}
        onSelectCountry={handleSelectCountryAnimated}
        onMark={toggleSticker}
        lastSeen={lastSeenAll.current}
        exiting={allExiting}
        exitOffsetY={allExitOffsetY}
        entering={allEntering}
      />
    );
  } else if (route.startsWith("country:")) {
    const code = route.slice("country:".length);
    screen = (
      <CountryDetailScreen
        countryCode={code}
        owned={owned}
        setOwned={setOwnedShim}
        allCountries={countries}
        groups={groups}
        onBack={handleBackFromCountry}
        onSelectCountry={(c) => setRoute("country:" + c)}
        onSeeAll={handleSeeAllFromCountry}
        exiting={detailExiting}
      />
    );
  }

  // During detail-screen exit ("Ver Todos"), render AllCountries behind so
  // it fades through into view as the detail screen slides down + fades.
  const exitOverlay =
    detailExiting && route.startsWith("country:") ? (
      <AllCountriesScreen
        owned={owned}
        totalOwned={totalOwned}
        total={total}
        groups={groups}
        onBack={handleBackFromAll}
        onSelectCountry={handleSelectCountryAnimated}
        lastSeen={lastSeenAll.current}
      />
    ) : allExiting && route === "all" ? (
      // During AllCountries back-exit, render Home behind so it slides in
      // from the left as the list slides off to the right.
      <div className="list-exit-overlay">
        <HomeScreen
          owned={owned}
          totalOwned={totalOwned}
          total={total}
          countries={countries}
          onSeeAll={handleSeeAllAnimated}
          onLogout={handleLogout}
          userEmail={session.user.email}
          lastSeen={lastSeenHome.current}
          ready={!stickersLoading}
          stampRef={homeStampRef}
          stampHidden={!!stampTransition}
          onStampTap={handleOpenSelos}
        />
      </div>
    ) : null;

  return (
    <div className="app-shell">
      {exitOverlay}
      {screen}
      {countryMorph && (
        <SharedCountryMorph
          morph={countryMorph}
          allCountries={countries}
          groups={groups}
          owned={owned}
        />
      )}
      {reverseMorph && (
        <SharedCountryReverseMorph
          morph={reverseMorph}
          allCountries={countries}
          groups={groups}
          owned={owned}
        />
      )}
      {stampTransition && (
        <SharedStampMorph transition={stampTransition} />
      )}
      <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg("")} />
      {stickersLoading && (
        <div className={"carregar-overlay" + (loadingFading ? " fade-out" : "")}>
          <LoadingScreen message="Carregando suas figurinhas…" />
        </div>
      )}
      {celebration && window.CongratsScreen && (
        <window.CongratsScreen
          completedCount={celebration.completedCount}
          countryEmojis={celebration.countryEmojis}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

/* Shared-element morph: Home CTA pill → All-Countries dark header.
   Renders inside .app-shell (which is position:relative), animates from
   the captured button rect to a header-shaped block at the top. */
function SharedHeaderMorph({ morph, totalOwned, total }) {
  const { from, phase } = morph;
  const pct = total ? Math.round((totalOwned / total) * 100) : 0;
  const expanded = phase !== "init";

  const fromStyle = {
    top: from.y + "px",
    left: from.x + "px",
    width: from.w + "px",
    height: from.h + "px",
    borderRadius: "999px",
    background: "#FFFFFF",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
  };
  const toStyle = {
    top: "0px",
    left: "0px",
    width: "100%",
    height: "212px",
    borderRadius: "0 0 24px 24px",
    background: "#1A1A1A",
    boxShadow: "0 0 0 rgba(0,0,0,0)",
  };

  return (
    <div className="shared-morph-root">
      <div
        className={"shared-morph" + (expanded ? " expanded" : "")}
        style={expanded ? toStyle : fromStyle}
      >
        <div className="shared-morph-from">
          <span className="t">Ver Todos os Países</span>
          <span className="arr">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
        <div className="shared-morph-to">
          <div className="shared-morph-to-top">
            <span className="back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </span>
          </div>
          <h1>Todos os Países</h1>
          <div className="counter">
            <span className="big">{totalOwned} / {total}</span>
            <i></i>
            <span className="pct">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Shared-element morph: AllCountries country square → CountryDetail card.
   Starts at the captured cell rect (rounded square with flag bg + pct),
   expands to fill the destination as a light-gray rounded card with the
   FULL detail-card content (header + sticker grid). The destination
   height is measured at runtime so it matches the real card exactly. */
function SharedCountryMorph({ morph, allCountries, groups, owned }) {
  const { from, code, shellWidth, shellRect, phase } = morph;
  const expanded = phase !== "init";

  const toContentRef = useRef(null);
  const [destHeight, setDestHeight] = useState(null);

  React.useLayoutEffect(() => {
    if (toContentRef.current) {
      setDestHeight(toContentRef.current.offsetHeight);
    }
  }, []);

  const country = allCountries.find((c) => c.code === code);
  if (!country) return null;
  const p = window.countryProgress(country, owned);
  const pct = Math.round(p.pct * 100);
  const isComplete = pct === 100;
  const isZero = p.owned === 0;
  const groupOf = groups.find((g) => g.countries.some((c) => c.code === code));
  const groupLabel = !groupOf
    ? code
    : groupOf.id === "ESP" ? "Grupo Especial" : `Grupo ${groupOf.label}`;

  const fromStyle = {
    top: from.y + "px",
    left: from.x + "px",
    width: from.w + "px",
    height: from.h + "px",
    borderRadius: "18px",
    background: isComplete ? "#D4F455" : isZero ? "#ededea" : "#FFFFFF",
    boxShadow: isComplete
      ? "0 4px 14px rgba(212,244,85,0.45)"
      : "0 2px 12px rgba(0,0,0,0.06)",
  };
  const toStyle = {
    top: "0px",
    left: "0px",
    width: "100%",
    height: (destHeight || 600) + "px",
    borderRadius: "0 0 28px 28px",
    background: "#F2F2F0",
    boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
  };

  // Render in viewport-fixed coords matched to the shell's visible rect,
  // so the morph stays anchored to what the user sees even when the
  // AllCountries list is scrolled. (.app-shell is the scrolling container —
  // a position:absolute root would have scrolled offscreen.)
  const rootStyle = shellRect ? {
    position: "fixed",
    top: shellRect.top + "px",
    left: shellRect.left + "px",
    width: shellRect.width + "px",
    height: shellRect.height + "px",
    inset: "auto",
  } : undefined;

  return (
    <div className="country-morph-root" style={rootStyle}>
      <div className={"country-morph-backdrop" + (expanded ? " on" : "")} />
      <div
        className={"country-morph" + (expanded ? " expanded" : "")}
        style={expanded ? toStyle : fromStyle}
      >
        {/* FROM state — the country square content */}
        <div
          className={
            "country-morph-from" +
            (isComplete ? " complete" : isZero ? " zero" : "")
          }
        >
          <span className="flag-bg">{country.flag}</span>
          <span className="pct-fg">{isComplete ? "✓" : `${pct}%`}</span>
        </div>

        {/* TO state — the FULL detail-card content. Width is locked to the
            shell width so layout (and thus measured height) is correct even
            while the morph element is still shaped as a tiny cell. */}
        <div
          ref={toContentRef}
          className="country-morph-to"
          style={{ width: shellWidth + "px" }}
        >
          <div className="cm-static-row">
            <span className="cm-back-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </span>
            <span className="cm-flag">{country.flag}</span>
          </div>
          <div className="cm-info">
            <div className="cm-eyebrow">{groupLabel} · {country.code}</div>
            <h1 className="cm-name">{country.name}</h1>
            <div className="cm-sub">
              <span className="cm-group-tag">
                <b>{p.owned}</b> de {p.total} figurinhas
              </span>
              <span className={"cm-pct" + (isComplete ? " full" : "")}>
                {pct}
                <span className="sign">%</span>
              </span>
            </div>
            <div className="cm-progress"><div className="fill" style={{ width: `${pct}%` }} /></div>
            {isComplete && <div className="cm-badge">✓ Completo</div>}
          </div>
          <div className="cm-sticker-grid">
            {Array.from({ length: country.count }).map((_, i) => {
              const n = (country.startAt ?? 1) + i;
              const isOwned = !!owned[country.code + n];
              return (
                <span
                  key={n}
                  className={
                    "cm-sticker" +
                    (isOwned ? " owned" + (isComplete ? " accent" : "") : "")
                  }
                >
                  {n}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reverse-morph: detail card → country square (back button).
   Phase machine driven from App:
     init   — overlay covers the card at its current position, content visible.
     fading — content fades out (~180ms). Card shape unchanged.
     shrink — card morphs back to the cell rect, country-square content fades in.
*/
function SharedCountryReverseMorph({ morph, allCountries, groups, owned }) {
  const { code, cardRect, cellRect, shellWidth, shellRect, phase } = morph;

  const country = allCountries.find((c) => c.code === code);
  if (!country) return null;
  const p = window.countryProgress(country, owned);
  const pct = Math.round(p.pct * 100);
  const isComplete = pct === 100;
  const isZero = p.owned === 0;
  const groupOf = groups.find((g) => g.countries.some((c) => c.code === code));
  const groupLabel = !groupOf
    ? code
    : groupOf.id === "ESP" ? "Grupo Especial" : `Grupo ${groupOf.label}`;

  // Card-shape style (init + fading): matches the original detail-card.
  const cardStyle = {
    top: cardRect.y + "px",
    left: cardRect.x + "px",
    width: cardRect.w + "px",
    height: cardRect.h + "px",
    borderRadius: "0 0 28px 28px",
    background: "#F2F2F0",
    boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
  };
  const cellStyle = cellRect
    ? {
        top: cellRect.y + "px",
        left: cellRect.x + "px",
        width: cellRect.w + "px",
        height: cellRect.h + "px",
        borderRadius: "18px",
        background: isComplete ? "#D4F455" : isZero ? "#ededea" : "#FFFFFF",
        boxShadow: isComplete
          ? "0 4px 14px rgba(212,244,85,0.45)"
          : "0 2px 12px rgba(0,0,0,0.06)",
      }
    : cardStyle;

  const morphStyle = phase === "shrink" ? cellStyle : cardStyle;
  const toVisible = phase === "init";
  const fromVisible = phase === "shrink";

  const rootStyle = shellRect ? {
    position: "fixed",
    top: shellRect.top + "px",
    left: shellRect.left + "px",
    width: shellRect.width + "px",
    height: shellRect.height + "px",
    inset: "auto",
  } : undefined;

  return (
    <div className="country-morph-root" style={rootStyle}>
      <div
        className={
          "country-morph-backdrop" + (phase !== "shrink" ? " on" : "")
        }
      />
      <div className="country-morph reverse" style={morphStyle}>
        <div
          className={
            "country-morph-from" +
            (isComplete ? " complete" : isZero ? " zero" : "") +
            (fromVisible ? " on" : "")
          }
        >
          <span className="flag-bg">{country.flag}</span>
          <span className="pct-fg">{isComplete ? "✓" : `${pct}%`}</span>
        </div>

        <div
          className={"country-morph-to" + (toVisible ? " on" : "")}
          style={{ width: shellWidth + "px" }}
        >
          <div className="cm-static-row">
            <span className="cm-back-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </span>
            <span className="cm-flag">{country.flag}</span>
          </div>
          <div className="cm-info">
            <div className="cm-eyebrow">{groupLabel} · {country.code}</div>
            <h1 className="cm-name">{country.name}</h1>
            <div className="cm-sub">
              <span className="cm-group-tag">
                <b>{p.owned}</b> de {p.total} figurinhas
              </span>
              <span className={"cm-pct" + (isComplete ? " full" : "")}>
                {pct}
                <span className="sign">%</span>
              </span>
            </div>
            <div className="cm-progress"><div className="fill" style={{ width: `${pct}%` }} /></div>
            {isComplete && <div className="cm-badge">✓ Completo</div>}
          </div>
          <div className="cm-sticker-grid">
            {Array.from({ length: country.count }).map((_, i) => {
              const n = (country.startAt ?? 1) + i;
              const isOwned = !!owned[country.code + n];
              return (
                <span
                  key={n}
                  className={
                    "cm-sticker" +
                    (isOwned ? " owned" + (isComplete ? " accent" : "") : "")
                  }
                >
                  {n}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Selos page ===== */
function StampScreen({ onBack, stampHidden, stampRef }) {
  return (
    <div className="stamp-screen">
      <button
        ref={stampRef}
        className="stamp-screen-stamp"
        onClick={onBack}
        aria-label="Voltar"
        style={{ visibility: stampHidden ? "hidden" : undefined }}
      >
        <img src="FINAL 2-BG.png" alt="Selo de conclusão do álbum" className="stamp-screen-img" />
      </button>
    </div>
  );
}

/* ===== Shared-element morph: Home stamp ↔ Selos page ===== */
function SharedStampMorph({ transition }) {
  const { dir, from, to, phase } = transition;

  // home stamp: rotate(-13.81deg) / selos stamp: no rotation
  let stampPos, rotation;
  if (dir === "open") {
    const atDest = phase === "expand" && to;
    stampPos  = atDest ? to   : from;
    rotation  = atDest ? "rotate(0deg)" : "rotate(-13.81deg)";
  } else {
    const atDest = phase === "collapse" && to;
    stampPos  = atDest ? to   : from;
    rotation  = atDest ? "rotate(-13.81deg)" : "rotate(0deg)";
  }

  const bgVisible = dir === "open" ? phase === "expand" : phase !== "collapse";

  return (
    <div className="stamp-morph-root">
      <div className={"stamp-morph-bg" + (bgVisible ? " on" : "")} />
      <img
        src="FINAL 2-BG.png"
        className="stamp-morph-img"
        style={{
          top:       stampPos.top   + "px",
          left:      stampPos.left  + "px",
          width:     stampPos.width + "px",
          transform: rotation,
        }}
        alt=""
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);