export function getCategoryStyles(category: string) {
	const mapping: Record<string, string> = {
		Geography: "bg-blue-600 text-white",
		Entertainment: "bg-pink-500 text-white",
		History: "bg-yellow-400 text-black",
		"Arts & Literature": "bg-purple-600 text-white",
		"Science & Nature": "bg-green-600 text-white",
		"Sports & Leisure": "bg-orange-500 text-white",
	};

	return mapping[category] || "bg-slate-200 text-slate-800";
}
