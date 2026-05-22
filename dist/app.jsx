/* Main app — auth gating, Supabase persistence, screen routing */

function LoadingScreen({ message }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <div className="loading-text">{message || "Carregando…"}</div>
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
      .finally(() => {
        if (!cancelled) setStickersLoading(false);
      });

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

  // ---- Render gates ----
  if (!authReady) {
    return <div className="app-shell"><LoadingScreen message="Iniciando…" /></div>;
  }

  if (!session) {
    return <div className="app-shell"><AuthScreen /></div>;
  }

  if (stickersLoading) {
    return <div className="app-shell"><LoadingScreen message="Carregando suas figurinhas…" /></div>;
  }

  let screen = null;
  if (route === "home") {
    screen = (
      <HomeScreen
        owned={owned}
        totalOwned={totalOwned}
        total={total}
        countries={countries}
        onSeeAll={() => setRoute("all")}
        onLogout={handleLogout}
        userEmail={session.user.email}
      />
    );
  } else if (route === "all") {
    screen = (
      <AllCountriesScreen
        owned={owned}
        totalOwned={totalOwned}
        total={total}
        groups={groups}
        onBack={() => setRoute("home")}
        onSelectCountry={(code) => setRoute("country:" + code)}
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
        onBack={() => setRoute("all")}
        onSelectCountry={(c) => setRoute("country:" + c)}
        onSeeAll={() => setRoute("all")}
      />
    );
  }

  return (
    <div className="app-shell">
      {screen}
      <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg("")} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
