/* Main app — screen routing + localStorage persistence */

const STORAGE_KEY = "copa2026_stickers";

function App() {
  const { groups, countries, total } = window.ALBUM;

  const [owned, setOwned] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
    } catch (e) { /* quota */ }
  }, [owned]);

  // Routing: "home" | "all" | "country:<CODE>"
  const [route, setRoute] = useState("home");

  const totalOwned = useMemo(() => {
    let n = 0;
    countries.forEach(c => {
      for (let i = 1; i <= c.count; i++) if (owned[c.code + i]) n++;
    });
    return n;
  }, [owned, countries]);

  let screen = null;
  if (route === "home") {
    screen = (
      <HomeScreen
        owned={owned}
        totalOwned={totalOwned}
        total={total}
        countries={countries}
        onSeeAll={() => setRoute("all")}
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
        setOwned={setOwned}
        allCountries={countries}
        groups={groups}
        onBack={() => setRoute("all")}
        onSelectCountry={(c) => setRoute("country:" + c)}
        onSeeAll={() => setRoute("all")}
      />
    );
  }

  return <div className="app-shell">{screen}</div>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
