/* Auth screen — login + signup */

function AuthScreen() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const translateError = (msg) => {
    if (!msg) return "Algo deu errado. Tente novamente.";
    const m = msg.toLowerCase();
    if (m.includes("invalid login") || m.includes("invalid credentials")) return "E-mail ou senha inválidos.";
    if (m.includes("already registered") || m.includes("user already") || m.includes("already exists")) return "Este e-mail já está cadastrado.";
    if (m.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
    if (m.includes("email") && m.includes("valid")) return "Informe um e-mail válido.";
    if (m.includes("network") || m.includes("fetch")) return "Falha de conexão. Verifique sua internet.";
    return msg;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        // onAuthChange in App will route to Home
      } else {
        const { data, error } = await signUp(email.trim(), password);
        if (error) throw error;
        if (data?.session) {
          // logged in immediately (email confirmation off)
        } else {
          setInfo("Conta criada! Verifique seu e-mail para confirmar e depois entre.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(translateError(err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen screen-enter">
      <div className="auth-bg" />
      <div className="auth-trophy" aria-hidden>
        <div className="home-trophy-glow" />
        <img src="assets/trophy.webp" alt="" />
      </div>

      <div className="auth-content">
        <div className="auth-stamp">COPA<br/>DO MUNDO<br/>2026</div>
        <h1 className="auth-title">
          Catalogador<br/>de Figurinhas
        </h1>
        <p className="auth-sub">
          {mode === "signin" ? "Entre para acessar suas figurinhas" : "Crie sua conta para começar"}
        </p>

        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="auth-field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              disabled={loading}
            />
          </label>
          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </label>

          {error && <div className="auth-msg error">{error}</div>}
          {info && <div className="auth-msg info">{info}</div>}

          <button type="submit" className="auth-primary" disabled={loading}>
            {loading
              ? (mode === "signin" ? "Entrando…" : "Criando conta…")
              : (mode === "signin" ? "Entrar" : "Criar conta")}
          </button>

          <button
            type="button"
            className="auth-secondary"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}
            disabled={loading}
          >
            {mode === "signin" ? "Criar uma conta nova" : "Já tenho conta — Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
