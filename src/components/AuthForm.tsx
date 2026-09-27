"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthForm.module.css";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: normalizedEmail,
          password,
          callbackURL: "/home",
        });
        if (result.error) {
          throw new Error("Unable to create the account. Check the details and try again.");
        }
        setNotice("Check your email for a verification link to finish creating your account.");
        return;
      }

      const result = await authClient.signIn.email({ email: normalizedEmail, password });
      if (result.error) {
        const message = (result.error.message ?? "").toLowerCase();
        if (message.includes("verif")) {
          throw new Error("Verify your email from the link we sent before signing in.");
        }
        throw new Error("We couldn't sign you in with those details.");
      }
      router.replace("/home");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="auth-title">
      <div className={styles.modeSwitch} role="group" aria-label="Account access">
        <button
          className={mode === "sign-in" ? styles.selectedMode : styles.mode}
          type="button"
          aria-pressed={mode === "sign-in"}
          onClick={() => changeMode("sign-in")}
        >
          Log in
        </button>
        <button
          className={mode === "sign-up" ? styles.selectedMode : styles.mode}
          type="button"
          aria-pressed={mode === "sign-up"}
          onClick={() => changeMode("sign-up")}
        >
          Create account
        </button>
      </div>

      <div className={styles.heading}>
        <p className={styles.eyebrow}>{mode === "sign-in" ? "WELCOME BACK" : "GET STARTED"}</p>
        <h2 id="auth-title">{mode === "sign-in" ? "Log in to Baseline" : "Create your account"}</h2>
      </div>

      <form
        className={styles.form}
        aria-label={mode === "sign-in" ? "Log in form" : "Create account form"}
        onSubmit={submit}
      >
        {mode === "sign-up" && (
          <label className={styles.field}>
            <span>Name</span>
            <input
              autoComplete="name"
              name="name"
              maxLength={120}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}
        <label className={styles.field}>
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <input
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            name="password"
            type="password"
            aria-label="Password"
            minLength={12}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {mode === "sign-up" && <small>Use at least 12 characters.</small>}
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {notice && <p className={styles.notice} role="status">{notice}</p>}

        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "Please wait..." : mode === "sign-in" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className={styles.switchPrompt}>
        {mode === "sign-in" ? "New to Baseline?" : "Already have an account?"}{" "}
        <button type="button" onClick={() => changeMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
          {mode === "sign-in" ? "Create an account" : "Log in"}
        </button>
      </p>
    </section>
  );
}