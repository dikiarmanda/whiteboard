"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { error: "" };

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="panel py-8 pr-8">
      <h1 className="font-display text-4xl tracking-tight">Masuk</h1>
      <p className="mt-3 max-w-sm leading-7 text-muted">
        Gunakan akun yang sudah dibuat pengelola. Pendaftaran tidak dibuka.
      </p>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label className="mt-8 block text-sm font-semibold" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="field mt-2"
        placeholder="nama@contoh.com"
      />
      <label className="mt-4 block text-sm font-semibold" htmlFor="password">
        Kata sandi
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="field mt-2"
      />
      {state.error ? (
        <p className="mt-4 text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn mt-6 w-full sm:w-auto" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
