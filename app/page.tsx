import Link from "next/link";
import { Suspense } from "react";
import { PublicBar } from "@/components/public-bar";
import { SketchPreview } from "@/components/sketch-preview";
import { getSession } from "@/lib/session";

async function LandingAction() {
  const session = await getSession();
  if (session?.user) {
    return (
      <Link href="/boards" className="btn mt-8">
        Buka papan
      </Link>
    );
  }
  return (
    <Link href="/login" className="btn mt-8">
      Masuk
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="flex flex-col">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{backgroundColor: 'rgb(124 58 237 / 0.1)', color: 'var(--color-primary)'}}>
              <span className="h-2 w-2 rounded-full" style={{backgroundColor: 'var(--color-primary)'}} />
              Ruang Kreatif Digital
            </div>
            <h1 className="mt-8 max-w-2xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Ide yang bertahan lama.
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
              Sketsa, diagram, dan catatan visual tersimpan aman di akun Anda, siap dibuka kembali dari
              perangkat apa pun.
            </p>
            <Suspense
              fallback={
                <Link href="/login" className="btn mt-8">
                  Masuk
                </Link>
              }
            >
              <LandingAction />
            </Suspense>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{backgroundColor: 'rgb(124 58 237 / 0.1)', color: 'var(--color-primary)'}}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Auto-save</h3>
                  <p className="mt-1 text-sm text-muted">Tersimpan otomatis saat menggambar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{backgroundColor: 'rgb(249 115 22 / 0.1)', color: 'var(--color-secondary)'}}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Aman</h3>
                  <p className="mt-1 text-sm text-muted">Hanya Anda yang bisa akses</p>
                </div>
              </div>
            </div>
            <p className="mt-12 text-sm text-muted">Akun dibuat oleh pengelola.</p>
          </section>
          <section className="relative lg:pl-8" aria-hidden="true">
            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full blur-3xl" style={{backgroundColor: 'rgb(124 58 237 / 0.2)'}} />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full blur-3xl" style={{backgroundColor: 'rgb(249 115 22 / 0.15)'}} />
            <div className="relative panel py-6 pr-6">
              <div className="grid-paper relative aspect-[4/3]">
                <span className="dogear" />
                <SketchPreview />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
