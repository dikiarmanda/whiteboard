import Link from "next/link";

export function PublicBar() {
  return (
    <header className="studio bg-studio text-paper">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Papan
        </Link>
      </div>
    </header>
  );
}
