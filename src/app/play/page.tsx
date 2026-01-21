"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	RotateCcw,
	Sparkles,
	XCircle,
} from "lucide-react";
import { saveCorrectQuestion } from "@/lib/quizCache";

type TriviaQuestion = {
	id?: string;
	category: string;
	difficulty?: string;
	question: string;
	correct_answer: string;
	incorrect_answers: string[];
};

type QuizQuestion = TriviaQuestion & {
	options: string[];
};

const QUESTION_COUNT = 5;

const QUIZ_CATEGORIES = [
	"musique",
	"culture_generale",
	"art_litterature",
	"tv_cinema",
	"actu_politique",
	"sport",
	"jeux_videos",
	"histoire",
	"geographie",
	"science",
	"gastronomie",
] as const;

const QUIZ_DIFFICULTIES = ["facile", "normal", "difficile"] as const;

type QuizTuple = {
	category: (typeof QUIZ_CATEGORIES)[number];
	difficulty: (typeof QUIZ_DIFFICULTIES)[number];
};

const randomPick = <T,>(items: readonly T[]): T => {
	return items[Math.floor(Math.random() * items.length)] as T;
};

const shuffle = <T,>(items: T[]): T[] => {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

const buildRandomTuples = (count: number): QuizTuple[] => {
	return Array.from({ length: count }, () => ({
		category: randomPick(QUIZ_CATEGORIES),
		difficulty: randomPick(QUIZ_DIFFICULTIES),
	}));
};

const fetchOneQuiz = async (tuple: QuizTuple) => {
	const res = await fetch(
		`/api/quiz?limit=1&category=${tuple.category}&difficulty=${tuple.difficulty}`,
		{ cache: "no-store" },
	);
	if (!res.ok) throw new Error("quiz_fetch_failed");
	const data = (await res.json()) as { results?: TriviaQuestion[] };
	const q = data.results?.[0];
	if (!q) return null;

	const decodedCorrect = decodeHtml(q.correct_answer);
	const decodedIncorrect = (q.incorrect_answers ?? []).map(decodeHtml);
	const options = shuffle([decodedCorrect, ...decodedIncorrect]);

	return {
		...q,
		question: decodeHtml(q.question),
		correct_answer: decodedCorrect,
		incorrect_answers: decodedIncorrect,
		options,
	} satisfies QuizQuestion;
};

const getCategoryUi = (category: string) => {
	const c = category.toLowerCase();
	if (c.includes("geographie")) return { badge: "bg-blue-600 text-white", label: "Géographie" };
	if (c.includes("tv_cinema")) return { badge: "bg-pink-500 text-white", label: "TV & Cinéma" };
	if (c.includes("histoire")) return { badge: "bg-yellow-400 text-black", label: "Histoire" };
	if (c.includes("art_litterature")) return { badge: "bg-purple-600 text-white", label: "Arts & Littérature" };
	if (c.includes("science")) return { badge: "bg-green-600 text-white", label: "Sciences" };
	if (c.includes("sport")) return { badge: "bg-orange-500 text-white", label: "Sports" };
	if (c.includes("musique")) return { badge: "bg-indigo-600 text-white", label: "Musique" };
	if (c.includes("jeux_videos")) return { badge: "bg-cyan-600 text-white", label: "Jeux Vidéo" };
	if (c.includes("actu_politique")) return { badge: "bg-rose-600 text-white", label: "Actu & Politique" };
	if (c.includes("gastronomie")) return { badge: "bg-amber-600 text-white", label: "Gastronomie" };
	return { badge: "bg-slate-600 text-white", label: "Culture G" };
};

const decodeHtml = (input: string) => {
	if (typeof window === "undefined") return input;
	const textarea = document.createElement("textarea");
	textarea.innerHTML = input;
	return textarea.value;
};

export default function PlayPage() {
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [score, setScore] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sessionTuples, setSessionTuples] = useState<QuizTuple[]>([]);

	const fetchQuestions = useCallback(async () => {
		setIsLoading(true);
		try {
			setError(null);

			const tuples = buildRandomTuples(QUESTION_COUNT);
			setSessionTuples(tuples);

			const fetched = await Promise.all(tuples.map(fetchOneQuiz));
			const cleaned = fetched.filter((q): q is QuizQuestion => q !== null);

			if (cleaned.length < QUESTION_COUNT) {
				const missing = QUESTION_COUNT - cleaned.length;
				const extraTuples = buildRandomTuples(missing);
				setSessionTuples((prev) => [...prev, ...extraTuples]);
				const extraFetched = await Promise.all(extraTuples.map(fetchOneQuiz));
				const extraCleaned = extraFetched.filter((q): q is QuizQuestion => q !== null);
				setQuestions(shuffle([...cleaned, ...extraCleaned]).slice(0, QUESTION_COUNT));
			} else {
				setQuestions(shuffle(cleaned).slice(0, QUESTION_COUNT));
			}

			setCurrentIndex(0);
			setSelectedOption(null);
			setIsCorrect(null);
			setIsFinished(false);
			setScore(0);
		} catch (e) {
			console.error("Erreur chargement questions:", e);
			setError("Impossible de charger les questions. Réessaie.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const t = setTimeout(() => {
			void fetchQuestions();
		}, 0);
		return () => clearTimeout(t);
	}, [fetchQuestions]);

	const handleNext = () => {
		if (currentIndex < QUESTION_COUNT - 1) {
			setCurrentIndex(currentIndex + 1);
			setSelectedOption(null);
			setIsCorrect(null);
		} else {
			setIsFinished(true);
		}
	};

	const resetGame = () => {
		setCurrentIndex(0);
		setSelectedOption(null);
		setIsCorrect(null);
		setScore(0);
		setIsFinished(false);
		void fetchQuestions();
	};

	const progressPct = useMemo(() => {
		const step = Math.max(1, QUESTION_COUNT);
		return Math.min(100, Math.round(((currentIndex + 1) / step) * 100));
	}, [currentIndex]);

	const metaLine = useMemo(() => {
		return `Question ${currentIndex + 1} / ${QUESTION_COUNT} · Score ${score} · Aléatoire`;
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
						<Link
							href="/"
							className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-bold"
							style={{ color: "var(--muted)" }}
						>
							<ChevronLeft size={18} /> Accueil
						</Link>
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
									Tu peux revoir tes bonnes réponses dans l’écran “Revoir”.
								</p>
							</div>

							<div className="mt-6 grid grid-cols-2 gap-3">
								<Link
									href="/review"
									className="w-full rounded-2xl px-5 py-4 font-bold transition-colors border text-center focus:outline-none focus:ring-4"
									style={{ borderColor: "var(--border)", color: "var(--text)", outlineColor: "var(--ring)", background: "transparent" }}
								>
									Revoir
								</Link>
								<button
									onClick={resetGame}
									className="w-full rounded-2xl px-5 py-4 font-bold transition-colors bg-slate-900 text-white hover:bg-black focus:outline-none focus:ring-4"
									style={{ boxShadow: "0 12px 28px rgba(0,0,0,0.18)", outlineColor: "var(--ring)" }}
								>
									<span className="inline-flex items-center justify-center gap-2">
										<RotateCcw size={20} /> Rejouer
									</span>
								</button>
							</div>

							<Link
								href="/"
								className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-bold w-full"
								style={{ color: "var(--muted)" }}
							>
								<ChevronLeft size={18} /> Accueil
							</Link>
						</div>
					</div>
				</div>
			</main>
		);
	}

	const currentQ = questions[currentIndex];
	const category = getCategoryUi(currentQ.category);
	const sessionModeLabel = sessionTuples.length > 0 ? "Mix" : "Aléatoire";
	const hasAnswered = selectedOption !== null;

	const onPickOption = (option: string) => {
		if (hasAnswered) return;
		const ok = option === currentQ.correct_answer;
		setSelectedOption(option);
		setIsCorrect(ok);
		if (ok) {
			setScore((s) => s + 1);
			saveCorrectQuestion({
				id: currentQ.id,
				category: currentQ.category,
				difficulty: currentQ.difficulty,
				question: currentQ.question,
				correct_answer: currentQ.correct_answer,
				incorrect_answers: currentQ.incorrect_answers,
				options: currentQ.options,
			});
		}
	};

	return (
		<main className="min-h-svh px-4 py-10 flex items-center justify-center">
			<div className="w-full max-w-md">
				<div className="mb-4 flex items-end justify-between">
					<div>
						<div className="font-black text-2xl tracking-tight">KnowIt!</div>
						<div className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
							{metaLine}
						</div>
					</div>
					<div
						className="text-xs font-bold px-3 py-1 rounded-full border"
						style={{ borderColor: "var(--border)", color: "var(--muted)" }}
					>
						{sessionModeLabel}
					</div>
				</div>

				<div className="mb-6 flex items-center justify-between">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm font-bold"
						style={{ color: "var(--muted)" }}
					>
						<ChevronLeft size={18} /> Accueil
					</Link>
					<Link
						href="/review"
						className="text-sm font-bold"
						style={{ color: "var(--muted)" }}
					>
						Revoir
					</Link>
				</div>

				<div className="mb-6">
					<div className="h-2.5 w-full rounded-full overflow-hidden bg-(--track)">
						<div
							className="h-full rounded-full transition-all duration-300"
							style={{ width: `${progressPct}%`, background: "var(--brand)" }}
						/>
					</div>
				</div>

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

						<div className="mt-7 grid grid-cols-2 gap-3">
							{currentQ.options.map((option) => {
								const isSelected = selectedOption === option;
								const isRight = option === currentQ.correct_answer;
								const showState = hasAnswered;

								const borderColor = showState
									? isRight
										? "color-mix(in oklab, var(--success) 45%, var(--border))"
										: isSelected
											? "color-mix(in oklab, var(--danger) 45%, var(--border))"
											: "var(--border)"
									: "var(--border)";

								const background = showState
									? isRight
										? "color-mix(in oklab, var(--success) 10%, transparent)"
										: isSelected
											? "color-mix(in oklab, var(--danger) 10%, transparent)"
											: "transparent"
									: "transparent";

								return (
									<button
										key={option}
										type="button"
										onClick={() => onPickOption(option)}
										disabled={hasAnswered}
										className="w-full h-full rounded-2xl px-4 py-4 font-bold transition-colors border text-left focus:outline-none focus:ring-4 disabled:opacity-95"
										style={{ borderColor, background, outlineColor: "var(--ring)", color: "var(--text)" }}
									>
										<span className="flex items-center justify-between gap-3">
											<span className="leading-snug">{option}</span>
											{showState && isRight && <CheckCircle2 size={20} color="var(--success)" />}
											{showState && isSelected && !isRight && <XCircle size={20} color="var(--danger)" />}
											{!showState && <ChevronRight size={18} style={{ color: "var(--muted)" }} />}
										</span>
									</button>
								);
							})}
						</div>

						{hasAnswered && (
							<div className="mt-5">
								<div
									className="p-4 rounded-2xl border text-center"
									style={{
										borderColor:
											isCorrect === true
												? "color-mix(in oklab, var(--success) 35%, var(--border))"
												: "color-mix(in oklab, var(--danger) 35%, var(--border))",
										background:
											isCorrect === true
												? "color-mix(in oklab, var(--success) 10%, transparent)"
												: "color-mix(in oklab, var(--danger) 10%, transparent)",
										color: "var(--text)",
									}}
								>
									<span className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--muted)" }}>
										{isCorrect ? "Bonne réponse" : "Mauvaise réponse"}
									</span>
								</div>

								<button
									onClick={handleNext}
									className="mt-4 w-full rounded-2xl px-5 py-5 font-bold transition-colors text-white focus:outline-none focus:ring-4"
									style={{
										background: "var(--brand)",
										boxShadow: "0 16px 40px rgba(99, 102, 241, 0.25)",
										outlineColor: "var(--ring)",
									}}
								>
									<span className="inline-flex items-center justify-center gap-2">
										{currentIndex < QUESTION_COUNT - 1 ? "Question suivante" : "Terminer"}{" "}
										<ChevronRight size={20} />
									</span>
								</button>
							</div>
						)}
					</div>
				</div>

				<div
					className="mt-6 text-center text-xs font-bold tracking-widest uppercase"
					style={{ color: "var(--muted)" }}
				>
					{`Question ${currentIndex + 1} sur ${QUESTION_COUNT}`}
				</div>
			</div>
		</main>
	);
}
