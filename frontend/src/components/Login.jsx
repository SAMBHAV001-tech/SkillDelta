import { useState } from "react";
import api from "../services/api";
import logo from "../assets/logo.png";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);

    // Frontend Validation
    if (mode === "signup" && !name.trim()) return setError("Name is required");
    if (!email.trim() || !password.trim()) return setError("All fields are required");
    if (password.length < 6 && mode === "signup") return setError("Password must be at least 6 characters");

    try {
      // LOGIN
      if (mode === "login") {
        const form = new URLSearchParams();
        form.append("grant_type", "password");
        form.append("username", email);
        form.append("password", password);

        const res = await api.post("/auth/login", form, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        // ⭐ THIS MUST RUN OR user_id will be undefined
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user_id", res.data.user_id);

        window.location.href = "/dashboard";
        return;
      }

      // SIGNUP
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess("Account created! You can now login.");
      setMode("login");
      setPassword(""); // Clear password for security

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#13141c] font-sans p-6 text-gray-100">

      {/* Main Split Container */}
      <div className="flex flex-col md:flex-row bg-[#1c1d27] rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl md:h-[600px] border border-white/5">

        {/* LEFT PANE: Authentication Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center items-center bg-[#1c1d27] relative z-10">

          <div className="w-full max-w-sm">
            {/* Logo area */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <img src={logo} alt="SkillDelta Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-bold text-white tracking-tight">SkillDelta</h1>
            </div>

            <p className="text-gray-400 text-sm font-medium mb-10 text-center md:text-left">
              Track Your Skill Growth
            </p>

            <h2 className="text-2xl font-bold text-white mb-6 text-center md:text-left">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>

            {/* Error and Success Indicators */}
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

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
              >
                {mode === "login" ? "Login" : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-400 font-medium">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
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

        {/* RIGHT PANE: Decorative Graphic Area */}
        <div className="hidden md:flex flex-col w-1/2 bg-[#181922] border-l border-white/5 items-center justify-center p-12 relative overflow-hidden">

          {/* Decorative blob shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full filter blur-3xl opacity-50 transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/20 rounded-full filter blur-3xl opacity-50 transform -translate-x-10 translate-y-10"></div>

          {/* Floating UI Mockup element from user's image request */}
          <div className="bg-[#1c1d27]/80 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-white/10 max-w-xs w-full relative z-10 transform -rotate-2 hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SkillDelta Logo" className="w-5 h-5 object-contain" />
              <span className="font-bold text-white text-sm">SkillDelta</span>
            </div>

            <div className="mb-2">
              <span className="text-xl">🔥</span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
              Hello User,
            </h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">
              Here's your skill summary for today
            </p>

            <div className="mt-8 space-y-4">
              <div className="h-2 w-3/4 bg-white/10 rounded-full"></div>
              <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
              <div className="flex gap-2 mt-6">
                <div className="h-10 w-10 bg-red-500/20 rounded-full border border-red-500/30"></div>
                <div className="h-10 w-10 bg-orange-500/20 rounded-full border border-orange-500/30"></div>
                <div className="h-10 w-10 bg-white/5 rounded-full border border-white/10"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}