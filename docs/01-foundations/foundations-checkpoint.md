---
id: foundations-checkpoint
title: Foundations checkpoint
sidebar_position: 99
description: A self-test before you move on. If you can answer these without scrolling back, you have the foundations.
---

# Foundations checkpoint

If you can answer these in your head, you're ready for the rest of the guide. If you can't, the linked page is where to look.

## The model

1. **How many characters is a token, roughly, in English? In Japanese?** ([Tokens](./tokens.md))
2. **What's the difference between input and output token pricing, and which is usually more expensive?** ([Tokens](./tokens.md))
3. **Why does the same string tokenize to different counts on different providers?** ([Tokenizers](./tokenizers.md))
4. **What does an embedding represent, and what's the operation you use to compare two embeddings?** ([Embeddings](./embeddings.md))
5. **Why is attention cost roughly quadratic in context length, and what's one practical implication?** ([The transformer](./transformer.md))
6. **What's the difference between prefill and decode, and which one dominates time-to-first-token?** ([The transformer](./transformer.md))
7. **Name two things you'll do regularly (inference) and one thing you'll probably never do (training).** ([Training vs. inference](./training-vs-inference.md))
8. **What are the three model tiers, and what's the cascade pattern that exploits them?** ([Model families](./model-families.md))
9. **When is a reasoning model the right choice, and when is it overkill?** ([Model families](./model-families.md))

## Using the API

10. **What are the three message roles in a chat API, and what's added once you do tool calling?** ([Messages](./messages.md))
11. **A 200K context window — does that count input only, or input + output combined?** ([Context windows](./context-window.md))
12. **What's the "lost in the middle" effect and how do you mitigate it?** ([Context windows](./context-window.md))
13. **How does prompt caching reduce cost, and what's the one mistake that nukes your cache hit rate?** ([Prompt caching](./prompt-caching.md))
14. **Default `temperature` for: extracting JSON from email, brainstorming product names, code generation.** ([Sampling](./sampling.md))
15. **Why is `temperature=0` not the same as perfectly deterministic?** ([Sampling](./sampling.md))
16. **Why is streaming effectively non-optional for any user-facing AI feature?** ([Streaming](./streaming.md))
17. **What's the difference between "JSON mode" and "schema-constrained / structured outputs"?** ([Structured output](./structured-output.md))
18. **In a tool-use loop, what role does the function result get sent back as?** ([Tool use](./tool-use.md))
19. **What does `tool_choice="required"` enable that `auto` doesn't?** ([Function calling, deep](./function-calling-deep.md))
20. **Why are images surprisingly expensive in tokens, and what's a quick mitigation?** ([Multimodal inputs](./multimodal-inputs.md))

## Retrieval & memory

21. **Why does almost every modern retrieval system mix BM25 with vector search?** ([Hybrid search](./hybrid-search.md))
22. **What's Reciprocal Rank Fusion and why is it the default blend?** ([Hybrid search](./hybrid-search.md))
23. **Which knob has the biggest single-step impact on RAG quality — embedding model, chunking, or reranker?** ([Chunking strategies](./chunking-strategies.md))
24. **What's the "cheap retrieval → expensive rerank" pattern, and roughly how much recall does it add?** ([Reranking](./reranking.md))
25. **What's the single biggest cause of bad RAG quality, in practice?** ([RAG basics](./rag-basics.md))
26. **Name three patterns for giving an LLM "memory" beyond the current conversation.** ([Memory](./memory.md))
27. **What privacy obligation does stored long-term memory create?** ([Memory](./memory.md))

## Agents

28. **What's the *one* line of code that makes a chain into an agent?** ([Agent loop](./agent-loop.md))
29. **Name three failure modes of a long-running agent and how to mitigate each.** ([Agent loop](./agent-loop.md))
30. **When does an explicit planning step earn its cost vs being theater?** ([Planning and reflection](./planning-and-reflection.md))
31. **What's a good reason to add a second agent, and a bad one?** ([Multi-agent](./multi-agent.md))

## If you missed more than 5

Re-read the linked pages. Don't push through to chapter 2 with foundation gaps — every later decision (which model? when to RAG? when to agent?) compounds on the basics.

## If you got them all

You have a working mental model of how modern LLM systems are built. Ship something. Then come back for the next chapter.

Got them? → On to [Chapter 2: Roadmap](/docs/roadmap).
