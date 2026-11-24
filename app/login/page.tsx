import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PublicBar } from "@/components/public-bar";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (session?.user) redirect("/boards");

  const params = await searchParams;
  const raw = Array.isArray(params.callbackUrl) ? params.callbackUrl[0] : params.callbackUrl;
  const callbackUrl =
    raw && (raw.startsWith("/boards") || raw.startsWith("/board/")) ? raw : "/boards";

  return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicBar />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <Suspense fallback={<p className="text-muted">Memuat formulir…</p>}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
        <p className="mt-6 text-sm text-muted">
          <Link href="/" className="font-semibold text-stamp">
            Kembali ke beranda
          </Link>
        </p>
      </main>
    </div>
  );
}
