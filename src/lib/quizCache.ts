export type CachedQuizQuestion = {
	id?: string;
	category: string;
	difficulty?: string;
	question: string;
	correct_answer: string;
	incorrect_answers: string[];
	options: string[];
	savedAt: number;
};

const STORAGE_KEY = "knowit.correctQuestions.v1";
const MAX_ITEMS = 200;

const isBrowser = () => typeof window !== "undefined";

const safeJsonParse = <T>(raw: string | null): T | null => {
	if (!raw) return null;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
};

const hashString = (value: string): string => {
	let hash = 5381;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash * 33) ^ value.charCodeAt(i);
	}
	return (hash >>> 0).toString(16);
};

const buildKey = (q: Omit<CachedQuizQuestion, "savedAt">): string => {
	const stableId = q.id?.trim();
	if (stableId) return `id:${stableId}`;
	return `h:${hashString(`${q.category}|${q.difficulty ?? ""}|${q.question}`)}`;
};

const normalize = (
	q: Omit<CachedQuizQuestion, "savedAt">,
): CachedQuizQuestion => {
	return {
		id: q.id,
		category: q.category,
		difficulty: q.difficulty,
		question: q.question,
		correct_answer: q.correct_answer,
		incorrect_answers: Array.isArray(q.incorrect_answers)
			? q.incorrect_answers
			: [],
		options: Array.isArray(q.options) ? q.options : [],
		savedAt: Date.now(),
	};
};

export const loadCorrectQuestions = (): CachedQuizQuestion[] => {
	if (!isBrowser()) return [];

	const raw = window.localStorage.getItem(STORAGE_KEY);
	const parsed = safeJsonParse<CachedQuizQuestion[]>(raw);
	if (!parsed || !Array.isArray(parsed)) return [];

	return parsed
		.filter(q => q && typeof q.question === "string")
		.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
		.slice(0, MAX_ITEMS);
};

export const saveCorrectQuestion = (
	question: Omit<CachedQuizQuestion, "savedAt">,
): void => {
	if (!isBrowser()) return;

	const next = normalize(question);
	const nextKey = buildKey(next);

	const existing = loadCorrectQuestions();
	const deduped = existing.filter(q => buildKey(q) !== nextKey);
	const merged = [next, ...deduped].slice(0, MAX_ITEMS);

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
};

export const clearCorrectQuestions = (): void => {
	if (!isBrowser()) return;
	window.localStorage.removeItem(STORAGE_KEY);
};
