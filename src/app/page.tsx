import Link from "next/link";
import { ChevronRight, BookOpen, Play } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-svh px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl border shadow-(--shadow) overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="p-6">
            <div className="font-black text-3xl tracking-tight">KnowIt!</div>
            <p className="mt-2 text-sm font-semibold" style={{ color: "var(--muted)" }}>
              5 questions · QCM · catégories & difficultés aléatoires.
            </p>

            <div className="mt-7 grid gap-3">
              <Link
                href="/play"
                className="w-full rounded-2xl px-5 py-5 font-bold transition-colors text-white focus:outline-none focus:ring-4"
                style={{
                  background: "var(--brand)",
                  boxShadow: "0 16px 40px rgba(99, 102, 241, 0.25)",
                  outlineColor: "var(--ring)",
                }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Play size={20} /> Jouer <ChevronRight size={20} />
                </span>
              </Link>

              <Link
                href="/review"
                className="w-full rounded-2xl px-5 py-5 font-bold transition-colors border focus:outline-none focus:ring-4"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  outlineColor: "var(--ring)",
                  background: "transparent",
                }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <BookOpen size={20} /> Revoir <ChevronRight size={20} />
                </span>
              </Link>
            </div>

            <div
              className="mt-6 rounded-2xl border p-4 text-sm font-semibold"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              Tes bonnes réponses sont sauvegardées en local pour pouvoir les relire.
            </div>
          </div>
        </div>

        <div
          className="mt-6 text-center text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--muted)" }}
        >
          know-it-five.vercel.app
        </div>
      </div>
    </main>
  );
}