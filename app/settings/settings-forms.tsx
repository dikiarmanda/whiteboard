"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  changeEmailAction,
  changePasswordAction,
  type AccountState,
} from "./actions";

const initial: AccountState = { error: "", message: "", nonce: 0 };

export function EmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(changeEmailAction, initial);

  useEffect(() => {
    if (state.nonce) router.refresh();
  }, [state.nonce, router]);

  return (
    <form action={action} className="panel py-7 pr-7">
      <h2 className="font-display text-2xl tracking-tight">Email</h2>
      <p className="mt-2 text-sm text-muted">Email ini dipakai untuk masuk.</p>
      <div className="mt-5">
        <label className="block text-sm font-semibold" htmlFor="email-baru">
          Email baru
        </label>
        <div className="mt-2">
          <input
            key={email}
            id="email-baru"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            defaultValue={email}
            className="field"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-semibold" htmlFor="email-sandi">
          Kata sandi saat ini
        </label>
        <div className="mt-2">
          <input
            id="email-sandi"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            className="field"
          />
        </div>
      </div>
      <AccountFeedback state={state} />
      <button type="submit" className="btn mt-6" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan email"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  useEffect(() => {
    if (state.nonce) formRef.current?.reset();
  }, [state.nonce]);

  return (
    <form ref={formRef} action={action} className="panel py-7 pr-7">
      <h2 className="font-display text-2xl tracking-tight">Kata sandi</h2>
      <p className="mt-2 text-sm text-muted">Minimal 8 karakter.</p>
      <div className="mt-5">
        <label className="block text-sm font-semibold" htmlFor="sandi-saat-ini">
          Kata sandi saat ini
        </label>
        <div className="mt-2">
          <input
            id="sandi-saat-ini"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            className="field"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-semibold" htmlFor="sandi-baru">
          Kata sandi baru
        </label>
        <div className="mt-2">
          <input
            id="sandi-baru"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={200}
            className="field"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-semibold" htmlFor="sandi-ulang">
          Ulangi kata sandi baru
        </label>
        <div className="mt-2">
          <input
            id="sandi-ulang"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={200}
            className="field"
          />
        </div>
      </div>
      <AccountFeedback state={state} />
      <button type="submit" className="btn mt-6" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan kata sandi"}
      </button>
    </form>
  );
}

function AccountFeedback({ state }: { state: AccountState }) {
  if (state.error) {
    return (
      <p className="mt-4 text-sm font-semibold text-danger" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p className="mt-4 text-sm font-semibold text-primary" role="status">
        {state.message}
      </p>
    );
  }
  return null;
}
