import Link from "next/link";
import { signOut } from "@/auth";

export function AppHeader({
  name,
  current,
}: {
  name: string;
  current: "boards" | "trash" | "settings";
}) {
  return (
    <header className="studio bg-studio text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-4 py-4 sm:px-6">
        <Link href="/boards" className="font-display text-2xl tracking-tight">
          Papan
        </Link>
        <nav className="flex gap-1 text-sm" aria-label="Papan">
          <Link
            href="/boards"
            className={current === "boards" ? "nav-link is-on" : "nav-link"}
            aria-current={current === "boards" ? "page" : undefined}
          >
            Semua board
          </Link>
          <Link
            href="/boards/trash"
            className={current === "trash" ? "nav-link is-on" : "nav-link"}
            aria-current={current === "trash" ? "page" : undefined}
          >
            Tempat sampah
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-8 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{backgroundColor: 'var(--color-primary)'}}>
              <span className="text-sm font-semibold">{name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="max-w-32 truncate text-paper/70">{name}</span>
          </div>
          <Link
            href="/settings"
            className={current === "settings" ? "nav-link is-on" : "nav-link"}
            aria-current={current === "settings" ? "page" : undefined}
          >
            Pengaturan
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn-quiet min-h-10">
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
