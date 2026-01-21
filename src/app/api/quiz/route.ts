import { NextResponse } from "next/server";

type QuizzApiQuiz = {
	_id?: string;
	question: string;
	answer: string;
	badAnswers: string[];
	category: string;
	difficulty: string;
};

type QuizzApiResponse = {
	count: number;
	quizzes: QuizzApiQuiz[];
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const limit = Math.min(
		20,
		Math.max(1, Number(searchParams.get("limit") ?? "5")),
	);
	const category = searchParams.get("category");
	const difficulty = searchParams.get("difficulty");

	const upstream = new URL("https://quizzapi.jomoreschi.fr/api/v2/quiz");
	upstream.searchParams.set("limit", String(limit));
	if (category) upstream.searchParams.set("category", category);
	if (difficulty) upstream.searchParams.set("difficulty", difficulty);

	try {
		const res = await fetch(upstream, {
			headers: {
				Accept: "application/json",
				"User-Agent": "KnowIt/1.0",
			},
			cache: "no-store",
		});

		if (!res.ok) {
			return NextResponse.json(
				{ error: "upstream_error", status: res.status },
				{ status: 502 },
			);
		}

		const data = (await res.json()) as QuizzApiResponse;

		const results = (data.quizzes ?? []).map(q => ({
			id: q._id,
			category: q.category,
			difficulty: q.difficulty,
			question: q.question,
			correct_answer: q.answer,
			incorrect_answers: q.badAnswers ?? [],
		}));

		return NextResponse.json({ results });
	} catch {
		return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
	}
}
