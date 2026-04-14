import { useState, useEffect, useRef } from "react";
import api, { BASE_URL } from "../services/api";
import logo from "../assets/logo.png";

const STATUS = {
  CHECKING: "checking", // Initial rapid ping
  WAKING:   "waking",   // Server not yet responding
  READY:    "ready",    // Server alive
};

// Fires a single lightweight ping; resolves true/false
const pingServer = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health/ping`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
};

export default function Login() {
  const [mode, setMode]       = useState("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [status, setStatus]         = useState(STATUS.CHECKING);
  const [elapsed, setElapsed]       = useState(0);
  const cancelledRef                = useRef(false);
  const pollTimerRef                = useRef(null);
  const elapsedTimerRef             = useRef(null);

  // ─── Rapid health poller ────────────────────────────────────────────────────
  useEffect(() => {
    cancelledRef.current = false;
    let attempt = 0;
    const MAX_ATTEMPTS  = 25;   // ~38 s max wait
    const POLL_INTERVAL = 1500; // 1.5 s between pings

    const showWaking = () => {
      if (cancelledRef.current) return;
      setStatus(STATUS.WAKING);
      elapsedTimerRef.current = setInterval(
        () => setElapsed((s) => s + 1), 1000
      );
    };

    // If not ready within 2 s, switch to "waking" state
    const wakingTimeout = setTimeout(showWaking, 2000);

    const poll = async () => {
      if (cancelledRef.current) return;

      const ok = await pingServer();

      if (cancelledRef.current) return;

      if (ok) {
        clearTimeout(wakingTimeout);
        clearInterval(elapsedTimerRef.current);
        setStatus(STATUS.READY);
        return;
      }

      attempt++;
      if (attempt >= MAX_ATTEMPTS) {
        // Give up — unlock the button and let the user try
        clearTimeout(wakingTimeout);
        clearInterval(elapsedTimerRef.current);
        setStatus(STATUS.READY);
        return;
      }

      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
    };

    poll(); // fire immediately

    return () => {
      cancelledRef.current = true;
      clearTimeout(wakingTimeout);
      clearTimeout(pollTimerRef.current);
      clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const isReady = status === STATUS.READY;

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!isReady || loading) return;
    setError(null);
    setSuccess(null);

    if (mode === "signup" && !name.trim())
      return setError("Name is required");
    if (!email.trim() || !password.trim())
      return setError("All fields are required");
    if (mode === "signup" && password.length < 6)
      return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      if (mode === "login") {
        const form = new URLSearchParams();
        form.append("grant_type", "password");
        form.append("username", email);
        form.append("password", password);

        const res = await api.post("/auth/login", form, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user_id", res.data.user_id);
        window.location.href = "/dashboard";
        return;
      }

      await api.post("/auth/register", { name, email, password });
      setSuccess("Account created! You can now log in.");
      setMode("login");
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Status banner ──────────────────────────────────────────────────────────
  const StatusBanner = () => {
    if (status === STATUS.CHECKING)
      return (
        <div className="mb-5 p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-300 text-sm flex items-center gap-3">
          <Spinner color="text-orange-400" />
          <span className="font-medium">Connecting to server…</span>
        </div>
      );

    if (status === STATUS.WAKING)
      return (
        <div className="mb-5 p-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-sm">
          <div className="flex items-center gap-3">
            <Spinner color="text-orange-400" />
            <div>
              <p className="font-bold text-orange-400 leading-tight">
                Waking up server… ({elapsed}s)
              </p>
              <p className="text-orange-300/75 text-xs mt-0.5">
                Fill in your details — the button unlocks automatically.
              </p>
            </div>
          </div>
          {/* Thin animated progress bar */}
          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (elapsed / 38) * 100)}%` }}
            />
          </div>
        </div>
      );

    return (
      <div className="mb-5 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold flex items-center gap-2">
        <span className="text-green-400 text-base">●</span>
        Server online — you&apos;re good to go!
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#13141c] font-sans p-6 text-gray-100">

      {/* ⚡ Top slim warming banner — auto hides when ready */}
      {status !== STATUS.READY && (
        <style>{`
          @keyframes sd-slide-in { from { opacity:0; transform:translateY(-8px) translateX(-50%) } to { opacity:1; transform:translateY(0) translateX(-50%) } }
          @keyframes sd-glow { 0%,100%{text-shadow:0 0 8px rgba(251,146,60,.6)} 50%{text-shadow:0 0 18px rgba(251,146,60,.9)} }
          .sd-banner { animation: sd-slide-in .35s ease, sd-glow 2s ease-in-out infinite; }
        `}</style>
      )}
      {status !== STATUS.READY && (
        <div
          className="sd-banner"
          style={{
            position:"fixed", top:"1.1rem", left:"50%",
            transform:"translateX(-50%)", zIndex:9999,
            display:"flex", alignItems:"center", gap:".5rem",
            background:"rgba(28,29,39,.93)",
            border:"1px solid rgba(251,146,60,.35)",
            borderRadius:"9999px", padding:".45rem 1.1rem",
            backdropFilter:"blur(10px)",
            boxShadow:"0 4px 20px rgba(0,0,0,.35),0 0 10px rgba(251,146,60,.12)",
            whiteSpace:"nowrap",
          }}
        >
          <Spinner color="text-orange-400" size="h-3.5 w-3.5" />
          <span style={{fontSize:".75rem", fontWeight:600, color:"rgb(251,146,60)"}}>
            Warming up SkillDelta… fill in your details below
          </span>
        </div>
      )}

      {/* ── Main card ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row bg-[#1c1d27] rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl md:h-[640px] border border-white/5">

        {/* LEFT: Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center items-center bg-[#1c1d27] relative z-10">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <img src={logo} alt="SkillDelta Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-bold text-white tracking-tight">SkillDelta</h1>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-6 text-center md:text-left">
              Track Your Skill Growth
            </p>

            {/* Server status */}
            <StatusBanner />

            <h2 className="text-2xl font-bold text-white mb-6 text-center md:text-left">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-semibold flex items-center gap-2">
                <span>✅</span> {success}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
              {mode === "signup" && (
                <div className="mb-4">
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-500">👤</span>
                    <input
                      className="w-full py-3.5 pl-12 pr-4 bg-black/20 rounded-2xl border border-white/5 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-white placeholder-gray-500"
                      placeholder="Full Name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-500">✉️</span>
                  <input
                    className="w-full py-3.5 pl-12 pr-4 bg-black/20 rounded-2xl border border-white/5 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-white placeholder-gray-500"
                    placeholder="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-500">🔒</span>
                  <input
                    className="w-full py-3.5 pl-12 pr-4 bg-black/20 rounded-2xl border border-white/5 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-white placeholder-gray-500"
                    placeholder="Password"
                    name="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit — ONLY this is locked while server wakes */}
              <button
                type="submit"
                disabled={!isReady || loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Spinner /> Signing in…</>
                ) : !isReady ? (
                  <><Spinner /> Connecting…</>
                ) : (
                  mode === "login" ? "Login" : "Sign Up"
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-400 font-medium">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <span
                    onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                    className="text-orange-400 cursor-pointer hover:text-orange-300 hover:underline font-bold transition-colors"
                  >
                    Sign up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                    className="text-orange-400 cursor-pointer hover:text-orange-300 hover:underline font-bold transition-colors"
                  >
                    Login
                  </span>
                </>
              )}
            </p>

          </div>
        </div>

        {/* RIGHT: Decorative */}
        <div className="hidden md:flex flex-col w-1/2 bg-[#181922] border-l border-white/5 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full filter blur-3xl opacity-50 transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/20 rounded-full filter blur-3xl opacity-50 transform -translate-x-10 translate-y-10" />

          <div className="bg-[#1c1d27]/80 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-white/10 max-w-xs w-full relative z-10 transform -rotate-2 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SkillDelta Logo" className="w-5 h-5 object-contain" />
              <span className="font-bold text-white text-sm">SkillDelta</span>
            </div>
            <span className="text-xl">🔥</span>
            <h3 className="text-xl font-bold tracking-tight text-white leading-tight mt-2">Hello User,</h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">Here&apos;s your skill summary for today</p>
            <div className="mt-8 space-y-4">
              <div className="h-2 w-3/4 bg-white/10 rounded-full" />
              <div className="h-2 w-1/2 bg-white/10 rounded-full" />
              <div className="flex gap-2 mt-6">
                <div className="h-10 w-10 bg-red-500/20 rounded-full border border-red-500/30" />
                <div className="h-10 w-10 bg-orange-500/20 rounded-full border border-orange-500/30" />
                <div className="h-10 w-10 bg-white/5 rounded-full border border-white/10" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Tiny reusable spinner ───────────────────────────────────────────────────
function Spinner({ color = "text-white", size = "h-4 w-4" }) {
  return (
    <svg
      className={`animate-spin ${size} ${color} flex-shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}