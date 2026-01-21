# KnowIt!

Un quiz rapide, propre, et (vraiment) aléatoire.

- Site : https://know-it-five.vercel.app

## C’est quoi ? (pour découvrir)

KnowIt! te propose une mini-session de **5 questions** sous forme de **QCM**.
Tu choisis une réponse, tu vois immédiatement si c’est correct, puis tu passes à la suivante.

Le but est d'entrainer tes connaissances générales de manière ludique et rapide.

Ce qui rend l’expérience sympa :

- **5 questions = 5 “modes”** : à chaque partie, l’app tire **5 couples aléatoires** _(catégorie, difficulté)_.
- **Simple et rapide** : pas de configuration, tu joues direct.
- **Score clair** : résultat final sur 5.

Source des questions : **QuizzAPI** (données en français).

## Comment ça marche ? (en deux lignes)

1. Le client génère 5 couples _(catégorie, difficulté)_ au hasard.
2. Pour chaque couple, il demande **1 question** à l’API interne du site, qui elle-même interroge QuizzAPI.

## Navigation

- `/` : écran d’accueil (choix **Jouer** / **Revoir**)
- `/play` : le quiz (session de 5 QCM)
- `/review` : liste des questions répondues juste (cache local)

## Stack (pour les devs)

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** (avec tokens CSS)
- Icônes : **lucide-react**

## Architecture rapide

Le front ne parle pas directement à QuizzAPI : on passe par une route Next.js côté serveur.

- Accueil : [src/app/page.tsx](src/app/page.tsx)
- UI + logique du quiz : [src/app/play/page.tsx](src/app/play/page.tsx)
- Revoir (liste des bonnes réponses) : [src/app/review/page.tsx](src/app/review/page.tsx)
- Cache local (localStorage) : [src/lib/quizCache.ts](src/lib/quizCache.ts)
- Proxy API (QuizzAPI → format “trivia”) : [src/app/api/quiz/route.ts](src/app/api/quiz/route.ts)

### Route API : `/api/quiz`

Paramètres supportés :

- `limit` (1 à 20)
- `category` (slug QuizzAPI)
- `difficulty` (`facile` | `normal` | `difficile`)

Exemple :

`/api/quiz?limit=1&category=geographie&difficulty=facile`

Réponse (format simplifié) :

```json
{
	"results": [
		{
			"id": "...",
			"category": "geographie",
			"difficulty": "facile",
			"question": "...",
			"correct_answer": "...",
			"incorrect_answers": ["...", "...", "..."]
		}
	]
}
```

## Design / UI

- Le thème repose sur des **variables CSS** (tokens) définies dans [src/app/globals.css](src/app/globals.css).

## Cache local (bonnes réponses)

Quand tu réponds **juste**, la question est sauvegardée en **localStorage** (sur ton navigateur) pour pouvoir la retrouver dans `/review`.

- Stockage : `localStorage` (clé `knowit.correctQuestions.v1`)
- Dédoublonnage : par `id` (si fourni) sinon par empreinte
- Limite : 200 items

## Lancer en local

Pré-requis :

- **Node.js 18+** (Node 20 recommandé)
- **pnpm**

Commandes :

```bash
pnpm install # Ou npm, yarn
pnpm dev
```

Autres scripts utiles :

```bash
pnpm lint
pnpm build
pnpm start
```

## Structure du projet

- [src/app/page.tsx](src/app/page.tsx) : écran d’accueil
- [src/app/play/page.tsx](src/app/play/page.tsx) : quiz (client) + logique QCM
- [src/app/review/page.tsx](src/app/review/page.tsx) : écran “Revoir” (liste cache)
- [src/app/api/quiz/route.ts](src/app/api/quiz/route.ts) : proxy QuizzAPI
- [src/lib/quizCache.ts](src/lib/quizCache.ts) : lecture/écriture du cache localStorage
- [src/app/globals.css](src/app/globals.css) : tokens + styles globaux
- [public/manifest.json](public/manifest.json) : manifest (base PWA)

## Modifier / contribuer

Idées simples à ajouter :

- Afficher les 5 couples _(catégorie, difficulté)_ tirés au début
- Ajouter un mode “10 questions”
- Ajouter un écran de résumé (bonnes/mauvaises réponses)

PRs et suggestions bienvenues.
