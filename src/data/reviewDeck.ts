/**
 * Curated spaced-repetition deck for the /review page.
 *
 * Hand-authored, one concept per card, drawn from across the guide. Retrieval
 * practice + spacing are the two highest-utility study strategies in the
 * education literature, so a small high-signal deck beats a giant noisy one.
 * Add cards as the guide grows; `id` must stay stable (it keys the schedule).
 */

export interface ReviewCard {
  id: string;
  topic: string;
  /** Link back to the lesson this card reinforces. */
  href: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const REVIEW_DECK: ReviewCard[] = [
  {
    id: 'tokens-output-cost',
    topic: 'Tokens',
    href: '/docs/foundations/tokens',
    prompt: 'Which dominates a typical LLM bill, and why?',
    options: [
      'Input tokens — prompts are long',
      'Output tokens — they are billed several times higher than input',
      'They cost the same; only the count matters',
      'Neither; you are billed per request',
    ],
    correct: 1,
    explanation:
      'Output tokens are usually billed 3–5× higher than input, so a verbose model hurts more than a long prompt. Trim output and cache stable prefixes first.',
  },
  {
    id: 'context-lost-in-middle',
    topic: 'Context windows',
    href: '/docs/foundations/context-window',
    prompt: 'Where in a long context is a single fact recalled LEAST reliably?',
    options: ['At the very start', 'In the middle', 'At the very end', 'Recall is uniform'],
    correct: 1,
    explanation:
      'The "lost in the middle" effect: models recall the start and end of context well, but accuracy on mid-context facts can drop 20–40%. Put the question last and key rules first.',
  },
  {
    id: 'embeddings-meaning',
    topic: 'Embeddings',
    href: '/docs/foundations/embeddings',
    prompt: 'Two texts share no words but mean the same thing. A good embedding model will place their vectors…',
    options: [
      'Far apart — no shared words means low similarity',
      'Close together — embeddings capture meaning, not surface words',
      'At random — embeddings are unpredictable',
      'Opposite (cosine ≈ -1)',
    ],
    correct: 1,
    explanation:
      'Embeddings encode meaning, so "I can\'t log in" lands near "account locked" despite zero word overlap. That is what powers semantic search.',
  },
  {
    id: 'sampling-greedy',
    topic: 'Sampling',
    href: '/docs/foundations/sampling',
    prompt: 'What does temperature = 0 do to next-token selection?',
    options: [
      'Picks randomly across all tokens',
      'Always picks the highest-probability token (greedy / argmax)',
      'Flattens the distribution toward uniform',
      'Disables the model',
    ],
    correct: 1,
    explanation:
      'Temperature 0 collapses the distribution onto the single most-likely token — deterministic at the sampling step (though not perfectly reproducible due to batching/hardware).',
  },
  {
    id: 'rag-vs-longcontext',
    topic: 'RAG',
    href: '/docs/foundations/rag-basics',
    prompt: 'A 1M-token context exists. When is RAG still the better choice?',
    options: [
      'Never — just stuff everything into the context',
      'When the corpus is large and you do not know which parts matter — retrieval beats dumping on cost and quality',
      'Only for images',
      'Only when the model lacks tools',
    ],
    correct: 1,
    explanation:
      'Long context and RAG are complementary. Below ~200K tokens you can often stuff context; above that, or when relevance is unknown, retrieval wins on both cost and recall.',
  },
  {
    id: 'reranking-twostage',
    topic: 'Reranking',
    href: '/docs/foundations/reranking',
    prompt: 'What is the standard production retrieval shape in 2026?',
    options: [
      'Embed and return the single nearest vector',
      'Retrieve a wide candidate set (hybrid), then rerank to a small top-K',
      'Keyword search only',
      'Ask the model to recall from memory',
    ],
    correct: 1,
    explanation:
      'Retrieve ~50–100 candidates with hybrid (dense + BM25) search, then a cross-encoder reranker narrows to ~5–20. Reranking is often the single highest-ROI retrieval upgrade.',
  },
  {
    id: 'agent-definition',
    topic: 'Agents',
    href: '/docs/foundations/agent-loop',
    prompt: 'What fundamentally makes something an "agent" rather than a chain?',
    options: [
      'It uses a bigger model',
      'It loops — the model decides the next tool/action based on results, until done',
      'It runs on a GPU',
      'It has no prompt',
    ],
    correct: 1,
    explanation:
      'An agent is a loop where the model picks a tool, observes the result, and decides the next step. A chain is a fixed pipeline you wire in advance.',
  },
  {
    id: 'orchestration-writes',
    topic: 'Multi-agent',
    href: '/docs/patterns/agent-orchestration',
    prompt: 'What is the 2026 consensus shape for multi-agent systems?',
    options: [
      'Many peer agents freely editing shared state',
      'One orchestrator with single-threaded writes + isolated, read-only subagents returning compact summaries',
      'No orchestrator; agents vote on every action',
      'Always exactly two agents',
    ],
    correct: 1,
    explanation:
      'Parallel writers make conflicting implicit decisions. The shape that ships: one orchestrator owns context and writes; subagents are read-only and return ~1–2k-token summaries.',
  },
  {
    id: 'context-engineering-rot',
    topic: 'Context engineering',
    href: '/docs/foundations/context-engineering',
    prompt: 'What is "context rot"?',
    options: [
      'The context window shrinking over time',
      'Effective recall/reasoning degrading as the window fills — well before the advertised limit',
      'Old API keys expiring',
      'A type of prompt injection',
    ],
    correct: 1,
    explanation:
      'More tokens is not free: as context fills, usable recall degrades. Hence compaction, external notes, sub-agent summaries, and just-in-time retrieval.',
  },
  {
    id: 'agent-eval-trajectory',
    topic: 'Agent evaluation',
    href: '/docs/evaluation/agent-evaluation',
    prompt: 'An agent reaches the right answer but took a forbidden action on the way. Which eval layer catches that?',
    options: [
      'Outcome eval',
      'Trajectory eval (the sequence of steps / policy adherence)',
      'A bigger model',
      'A public benchmark',
    ],
    correct: 1,
    explanation:
      'Outcome scoring is blind to how the agent got there. Trajectory eval scores the path — efficiency, order, and not taking forbidden actions.',
  },
  {
    id: 'evals-component',
    topic: 'Evaluation',
    href: '/docs/evaluation/eval-types',
    prompt: 'A RAG bot "hallucinates." What should you eval FIRST to localize the bug?',
    options: [
      'The generation prompt',
      'The retriever alone (is the right doc even in the top-k?) — most "hallucination" is bad retrieval',
      'A public benchmark',
      'The model temperature',
    ],
    correct: 1,
    explanation:
      'Component evals localize failures. If recall@k is low, no prompt will save you — the right context simply is not there.',
  },
  {
    id: 'finetune-form-not-facts',
    topic: 'Fine-tuning',
    href: '/docs/decisions/prompt-vs-rag-vs-finetune',
    prompt: 'Fine-tuning is best for changing a model\'s…',
    options: [
      'Knowledge of facts (use it instead of RAG)',
      'Form — structure, tone, format, latency — not facts (RAG wins facts)',
      'Token vocabulary',
      'Pricing',
    ],
    correct: 1,
    explanation:
      'Default ladder: Prompt → RAG → Fine-tune. Fine-tune the interface (form), retrieve the content (facts).',
  },
  {
    id: 'rl-rlvr',
    topic: 'RL for LLMs',
    href: '/docs/fine-tuning/rl-for-llms',
    prompt: 'In RLVR (RL with Verifiable Rewards), where does the reward come from?',
    options: [
      'A learned reward model trained on human preferences',
      'An automatic verifier — a math checker, unit tests, a proof checker',
      'The user clicking thumbs-up',
      'Random sampling',
    ],
    correct: 1,
    explanation:
      'RLVR uses a cheap, hard-to-game verifier as the reward, which is why it dominates math/code/reasoning. The open challenge is open-ended tasks with no verifier.',
  },
  {
    id: 'mcp-vs-a2a',
    topic: 'MCP & A2A',
    href: '/docs/foundations/mcp',
    prompt: 'MCP and A2A are complementary 2026 protocols. Which is which?',
    options: [
      'MCP = agent ↔ agent; A2A = agent ↔ tools',
      'MCP = agent ↔ tools/data; A2A = agent ↔ agent',
      'They are the same protocol',
      'Both only handle authentication',
    ],
    correct: 1,
    explanation:
      'MCP connects an agent to tools and data (vertical); A2A lets one agent delegate to another (horizontal). Both are now Linux Foundation projects.',
  },
  {
    id: 'safety-injection',
    topic: 'Safety',
    href: '/docs/safety/prompt-injection',
    prompt: 'What is the core idea behind prompt injection?',
    options: [
      'The model runs out of tokens',
      'Untrusted input (a webpage, email, doc) carries instructions the model follows as if they were yours',
      'The API key leaks',
      'The model is too slow',
    ],
    correct: 1,
    explanation:
      'Untrusted content can smuggle instructions. Mitigate with isolation, guardrails, and tight tool scoping — never let the prompt be the authorization boundary.',
  },
  {
    id: 'cost-cascade',
    topic: 'Cost control',
    href: '/docs/patterns/cost-control',
    prompt: 'What is the "cascade" cost-control pattern?',
    options: [
      'Always call the biggest model for quality',
      'Answer with a cheap model first; escalate to a bigger one only when confidence is low or the schema fails',
      'Cache every response globally',
      'Disable streaming',
    ],
    correct: 1,
    explanation:
      'If ~95% of requests resolve on the cheap model, the blended cost drops dramatically. Sample the non-escalated outputs into evals so the cheap path does not silently regress.',
  },
];
