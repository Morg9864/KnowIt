"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

type TriviaQuestion = {
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type OpenTdbResponse = {
  results: TriviaQuestion[];
};

const QUESTION_COUNT = 5;

const getCategoryUi = (category: string) => {
  if (category.includes("Geography")) return { badge: "bg-blue-600 text-white", label: "Géographie" };
  if (category.includes("Entertainment"))
    return { badge: "bg-pink-500 text-white", label: "Divertissement" };
  if (category.includes("History")) return { badge: "bg-yellow-400 text-black", label: "Histoire" };
  if (category.includes("Arts"))
    return { badge: "bg-purple-600 text-white", label: "Arts & Littérature" };
  if (category.includes("Science"))
    return { badge: "bg-green-600 text-white", label: "Sciences & Nature" };
  if (category.includes("Sports"))
    return { badge: "bg-orange-500 text-white", label: "Sports & Loisirs" };
  return { badge: "bg-slate-600 text-white", label: "Culture G" };
};

const decodeHtml = (input: string) => {
  if (typeof window === "undefined") return input;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
};

export default function Home() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);

      const res = await fetch(
        `https://opentdb.com/api.php?amount=${QUESTION_COUNT}&type=multiple`,
        { cache: "no-store" },
      );
      const data: OpenTdbResponse = await res.json();

      const decodedQuestions = (data.results ?? []).map((q) => ({
        ...q,
        question: decodeHtml(q.question),
        correct_answer: decodeHtml(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHtml),
      }));

      setQuestions(decodedQuestions);
    } catch (e) {
      console.error("Erreur chargement questions:", e);
      setError("Impossible de charger les questions. Réessaie.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les questions au démarrage
  useEffect(() => {
    const t = setTimeout(() => {
      void fetchQuestions();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchQuestions]);

  const handleNext = (wasCorrect: boolean) => {
    if (wasCorrect) setScore(score + 1);

    if (currentIndex < QUESTION_COUNT - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore(0);
    setIsFinished(false);
    void fetchQuestions();
  };

  const progressPct = useMemo(() => {
    const step = Math.max(1, QUESTION_COUNT);
    return Math.min(100, Math.round(((currentIndex + 1) / step) * 100));
  }, [currentIndex]);

  const metaLine = useMemo(() => {
    return `Question ${currentIndex + 1} / ${QUESTION_COUNT} · Score ${score}`;
  }, [currentIndex, score]);

  if (isLoading) {
    return (
      <main className="min-h-svh px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl border shadow-(--shadow) p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div className="font-black text-xl tracking-tight">KnowIt!</div>
              <div
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                Chargement…
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="h-3 w-2/3 rounded-full bg-(--track)" />
              <div className="h-3 w-full rounded-full bg-(--track)" />
              <div className="h-3 w-5/6 rounded-full bg-(--track)" />
            </div>
            <div className="mt-7 h-12 rounded-2xl bg-(--track)" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-svh px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl border shadow-(--shadow) p-6 text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="font-black text-2xl tracking-tight">Oups</div>
            <p className="mt-2" style={{ color: "var(--muted)" }}>
              {error}
            </p>
            <button
              onClick={resetGame}
              className="mt-6 w-full rounded-2xl px-5 py-4 font-bold transition-colors bg-slate-900 text-white hover:bg-black focus:outline-none focus:ring-4"
              style={{ boxShadow: "0 12px 28px rgba(0,0,0,0.18)", outlineColor: "var(--ring)" }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-svh px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md text-center" style={{ color: "var(--muted)" }}>
          Aucune question reçue.
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="min-h-svh px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl border shadow-(--shadow) overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-black text-2xl tracking-tight">C’est fini</div>
                  <p className="mt-1" style={{ color: "var(--muted)" }}>
                    Petit entraînement, gros progrès.
                  </p>
                </div>
                <div className="rounded-2xl px-4 py-2 font-black text-xl bg-(--track)">
                  {score}/{QUESTION_COUNT}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles size={18} />
                  Score du jour
                </div>
                <p className="mt-2" style={{ color: "var(--muted)" }}>
                  Reviens demain pour un nouveau set de questions.
                </p>
              </div>

              <button
                onClick={resetGame}
                className="mt-6 w-full rounded-2xl px-5 py-4 font-bold transition-colors bg-slate-900 text-white hover:bg-black focus:outline-none focus:ring-4"
                style={{ boxShadow: "0 12px 28px rgba(0,0,0,0.18)", outlineColor: "var(--ring)" }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <RotateCcw size={20} /> Rejouer
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentQ = questions[currentIndex];
  const category = getCategoryUi(currentQ.category);

  return (
    <main className="min-h-svh px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="font-black text-2xl tracking-tight">KnowIt!</div>
            <div className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
              {metaLine}
            </div>
          </div>
          <div className="text-xs font-bold px-3 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Mode Solo
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-2.5 w-full rounded-full overflow-hidden bg-(--track)">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: "var(--brand)" }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border shadow-(--shadow) overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)", backdropFilter: "blur(10px)" }}
        >
          <div className="p-5 flex items-center justify-between gap-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${category.badge}`}>
              <span className="inline-block size-2 rounded-full bg-white/80" />
              {category.label}
            </div>
            <div className="text-xs font-bold" style={{ color: "var(--muted)" }}>
              {progressPct}%
            </div>
          </div>

          <div className="p-6">
            <p
              className="text-[1.25rem] sm:text-[1.35rem] font-semibold leading-relaxed text-center"
              style={{ color: "var(--text)" }}
            >
              {currentQ.question}
            </p>

            {showAnswer ? (
              <div className="mt-7 animate-in fade-in zoom-in duration-300">
                <div
                  className="p-5 rounded-2xl border text-center"
                  style={{
                    borderColor: "color-mix(in oklab, var(--success) 35%, var(--border))",
                    background: "color-mix(in oklab, var(--success) 10%, transparent)",
                  }}
                >
                  <span className="text-xs font-black tracking-widest uppercase" style={{ color: "color-mix(in oklab, var(--success) 80%, var(--text))" }}>
                    La réponse
                  </span>
                  <div
                    className="mt-2 text-2xl font-black"
                    style={{ color: "var(--text)" }}
                  >
                    {currentQ.correct_answer}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNext(false)}
                    className="rounded-2xl px-4 py-4 font-bold transition-colors border focus:outline-none focus:ring-4"
                    style={{
                      borderColor: "color-mix(in oklab, var(--danger) 35%, var(--border))",
                      background: "color-mix(in oklab, var(--danger) 10%, transparent)",
                      outlineColor: "var(--ring)",
                    }}
                  >
                    <span className="inline-flex items-center justify-center gap-2" style={{ color: "color-mix(in oklab, var(--danger) 85%, var(--text))" }}>
                      <XCircle size={20} /> Raté
                    </span>
                  </button>
                  <button
                    onClick={() => handleNext(true)}
                    className="rounded-2xl px-4 py-4 font-bold transition-colors text-white focus:outline-none focus:ring-4"
                    style={{
                      background: "var(--success)",
                      boxShadow: "0 14px 30px rgba(34, 197, 94, 0.25)",
                      outlineColor: "var(--ring)",
                    }}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} /> Bien vu
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full mt-8 rounded-2xl px-5 py-5 font-bold transition-colors text-white focus:outline-none focus:ring-4"
                style={{
                  background: "var(--brand)",
                  boxShadow: "0 16px 40px rgba(99, 102, 241, 0.25)",
                  outlineColor: "var(--ring)",
                }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Révéler la réponse <ChevronRight size={20} />
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>
          {`Question ${currentIndex + 1} sur ${QUESTION_COUNT}`}
        </div>
      </div>
    </main>
  );
}