"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "../auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setPending(true);
    setError(undefined);
    const res = mode === "signup"
      ? await authClient.signUp.email({ email, password, name: String(f.get("name") || email) })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (res.error) return setError(res.error.message ?? "Could not sign in");
    router.push("/");
    router.refresh();
  }

  return (
    <main>
      <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <form onSubmit={onSubmit} method="post" className="form">
        {mode === "signup" && <label>Name <input name="name" autoComplete="name" /></label>}
        <label>Email <input name="email" type="email" required autoComplete="email" /></label>
        <label>Password <input name="password" type="password" required minLength={10} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" disabled={pending}>{pending ? "…" : mode === "signin" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="muted">
        {mode === "signin" ? "No account? " : "Already registered? "}
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </main>
  );
}
