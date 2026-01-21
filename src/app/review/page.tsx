"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import {
	clearCorrectQuestions,
	loadCorrectQuestions,
	type CachedQuizQuestion,
} from "@/lib/quizCache";

const formatSavedAt = (ts: number) => {
	try {
		return new Intl.DateTimeFormat("fr-FR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(ts));
	} catch {
		return new Date(ts).toLocaleString();
	}
};

export default function ReviewPage() {
	const [items, setItems] = useState<CachedQuizQuestion[]>(() =>
		loadCorrectQuestions(),
	);

	const countLabel = useMemo(() => {
		const n = items.length;
		if (n === 0) return "Aucune bonne réponse en cache";
		if (n === 1) return "1 bonne réponse en cache";
		return `${n} bonnes réponses en cache`;
	}, [items.length]);

	const onClear = () => {
		const ok = window.confirm("Vider l’historique des bonnes réponses ?");
		if (!ok) return;
		clearCorrectQuestions();
		setItems([]);
	};

	return (
		<main className="min-h-svh px-4 py-10 flex items-center justify-center">
			<div className="w-full max-w-2xl">
				<div className="mb-4 flex items-end justify-between gap-4">
					<div>
						<div className="font-black text-2xl tracking-tight">Revoir</div>
						<div className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
							{countLabel}
						</div>
					</div>
					<div className="flex items-center gap-3">
						{items.length > 0 && (
							<button
								type="button"
								onClick={onClear}
								className="rounded-2xl px-4 py-2 font-bold transition-colors border focus:outline-none focus:ring-4"
								style={{
									borderColor: "var(--border)",
									color: "var(--text)",
									outlineColor: "var(--ring)",
									background: "transparent",
								}}
							>
								<span className="inline-flex items-center gap-2">
									<Trash2 size={18} /> Vider
								</span>
							</button>
						)}
						<Link
							href="/"
							className="rounded-2xl px-4 py-2 font-bold transition-colors border focus:outline-none focus:ring-4"
							style={{
								borderColor: "var(--border)",
								color: "var(--text)",
								outlineColor: "var(--ring)",
								background: "transparent",
							}}
						>
							<span className="inline-flex items-center gap-2">
								<ChevronLeft size={18} /> Accueil
							</span>
						</Link>
					</div>
				</div>

				{items.length === 0 ? (
					<div
						className="rounded-3xl border shadow-(--shadow) p-6 text-center"
						style={{ background: "var(--card)", borderColor: "var(--border)" }}
					>
						<div className="font-black text-xl">Rien à revoir</div>
						<p className="mt-2 text-sm font-semibold" style={{ color: "var(--muted)" }}>
							Joue une partie et réponds juste pour alimenter cette liste.
						</p>
						<Link
							href="/play"
							className="mt-6 inline-flex items-center justify-center rounded-2xl px-5 py-4 font-bold transition-colors text-white focus:outline-none focus:ring-4"
							style={{
								background: "var(--brand)",
								boxShadow: "0 16px 40px rgba(99, 102, 241, 0.25)",
								outlineColor: "var(--ring)",
							}}
						>
							Jouer
						</Link>
					</div>
				) : (
					<div className="grid gap-3">
						{items.map((q) => (
							<div
								key={q.id ?? `${q.savedAt}:${q.question}`}
								className="rounded-3xl border shadow-(--shadow) overflow-hidden"
								style={{ background: "var(--card)", borderColor: "var(--border)" }}
							>
								<div className="p-5">
									<div className="flex items-start justify-between gap-4">
										<div className="font-bold leading-snug" style={{ color: "var(--text)" }}>
											{q.question}
										</div>
										<div
											className="text-xs font-bold whitespace-nowrap"
											style={{ color: "var(--muted)" }}
										>
											{`${formatSavedAt(q.savedAt)}`}
										</div>
									</div>
									<div className="mt-3 font-semibold" style={{ color: "var(--text)" }}>
										— {q.correct_answer}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
