import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/session";
import { findUserById } from "@/lib/account";
import { EmailForm, PasswordForm } from "./settings-forms";

async function SettingsContent() {
  const sessionUser = await requireUser();
  if (!sessionUser) redirect("/login?callbackUrl=/settings");

  const user = await findUserById(sessionUser.id);
  if (!user) redirect("/login?callbackUrl=/settings");

  return (
    <>
      <AppHeader name={user.name || user.email} current="settings" />
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Pengaturan</h1>
        <p className="mt-3 text-muted">Ganti email masuk atau kata sandi akun ini.</p>
        <div className="mt-8 grid gap-7">
          <EmailForm email={user.email} />
          <PasswordForm />
        </div>
      </main>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="px-6 py-10 text-muted">Memuat pengaturan…</p>}>
      <SettingsContent />
    </Suspense>
  );
}
