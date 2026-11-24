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
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <h1 className="max-w-xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Gambar yang masih ada besok.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted">
            Sketsa, diagram, dan catatan visual tersimpan di akun Anda, lalu bisa dibuka lagi dari
            perangkat lain.
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
          <p className="mt-6 text-sm text-muted">Akun dibuat oleh pengelola.</p>
        </section>
        <section className="panel py-4 pr-4" aria-hidden="true">
          <div className="grid-paper relative aspect-[4/3]">
            <span className="dogear" />
            <SketchPreview />
          </div>
        </section>
      </main>
    </div>
  );
}
