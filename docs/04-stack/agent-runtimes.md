---
id: agent-runtimes
title: Agent runtimes & sandboxes
sidebar_position: 17
description: E2B, Modal sandboxes, Daytona, CodeSandbox, Anthropic's code execution tool — secure environments where agents can actually run code.
---

# Agent runtimes & sandboxes

> **In one line:** Isolated, ephemeral environments where an agent can execute code, install packages, browse files, and run a shell — safely. When tool-use isn't enough and the agent needs a real machine.

:::tip[In plain English]
A "tool call" is the agent saying "please run `get_weather(NYC)`" and your code returning a JSON object. That works for narrow, pre-defined capabilities. But what if the agent needs to write and run a quick Python script, install a library it's never used before, parse a weird CSV the user uploaded, or compile and test a patch? You need to give it a real environment — a sandboxed Linux VM, a container, or a notebook kernel. That's an agent runtime. Critically: you don't want this running on your own server; the agent will eventually do something destructive. Hence "sandbox."
:::

## The major options (2026)

| Runtime | Type | Boot time | Languages | Persistence | Best for |
|---------|------|-----------|-----------|-------------|---------|
| **E2B** | Firecracker microVMs | ~150ms | Py / TS / Bash / any | session-scoped | Code-running agents, the dominant pick |
| **Modal sandboxes** | gVisor containers | sub-second | Python-first; any | session + filesystem | Python-heavy, GPU-friendly |
| **Daytona** | Dev container–style | ~1s | any | volume-persistent | Cloud dev environments, longer sessions |
| **Anthropic code execution tool** | Anthropic-managed | instant (managed) | Python + libs | session-scoped | Claude apps, zero infra |
| **OpenAI Code Interpreter / Assistants** | OpenAI-managed | instant | Python | session-scoped | OpenAI Assistants API |
| **Cloudflare Sandbox** | V8 isolates | ms | JS/TS (limited) | none | Edge-hosted, tight isolation |
| **CodeSandbox / StackBlitz** | Browser VMs | ~1s | JS/TS web | yes | Web-app-building agents |
| **Coderpad** | Container | sec | many | session | Interview-style code execution |
| **Fly Machines / AWS Fargate** | DIY container | sec | any | yes | Roll-your-own; cheap at scale |
| **Docker on your own machine** | DIY | varies | any | yes | Local dev; **never in prod** |

## Default pick for most teams

**E2B.** It exists exactly for "agent needs a sandboxed VM in under a second." Firecracker microVMs give real isolation, the SDK is clean in both Python and TypeScript, and the pricing model fits sub-second bursts.

If you're already on **Modal** for everything else (inference, scheduled jobs), use **Modal sandboxes** — one bill, one mental model, GPUs available in the same primitive.

If you're using Claude for code-running agents and don't want to operate anything: Anthropic's **code execution tool** (built into the API) is the zero-infra answer.

## When to deviate

- **Longer-lived dev environments** (the agent works on a repo for an hour): **Daytona**, **Fly Machines**, or **Modal volumes**.
- **Edge / tight perf budget**: **Cloudflare Sandbox** (V8 isolates) — limited to JS but extremely fast.
- **You're inside OpenAI Assistants**: just use Code Interpreter; don't bring your own runtime.
- **Browser-side coding agent** (Bolt-style, v0-style web app builders): **WebContainers** (StackBlitz) or **CodeSandbox**.
- **DIY at scale** where the per-sandbox economics matter more than the DX: **Fargate** or **Fly Machines** with your own pool.
- **Air-gapped / on-prem**: self-hosted Firecracker, **gVisor** containers, or **Kata Containers** — you become the platform team.

## Why agent runtimes exist

Three problems that tool-use alone can't solve:

1. **Open-ended computation.** The agent needs to write code you didn't anticipate. Pre-defined tools can't cover that surface.
2. **Untrusted output.** The model might generate `rm -rf /` or a malware download. Run it inside something disposable.
3. **Statefulness.** "Install pandas, then load this CSV, then make a chart, then save it" needs a persistent kernel for the duration of the conversation.

A sandbox solves all three: fresh VM per session, isolated network, ephemeral filesystem, hard CPU / memory caps.

## Minimum integration

**E2B — fresh sandbox in two lines:**

```python
from e2b_code_interpreter import Sandbox

sbx = Sandbox()                                              # ~150ms boot
result = sbx.run_code("import pandas as pd; pd.__version__") # runs in the VM
print(result.text)                                            # '2.2.3'

# Upload a file the user gave you
sbx.files.write("/data.csv", user_uploaded_bytes)
chart = sbx.run_code("""
import pandas as pd, matplotlib.pyplot as plt
df = pd.read_csv('/data.csv')
df.plot(); plt.savefig('/out.png')
""")
png = sbx.files.read("/out.png")
sbx.kill()                                                    # explicit teardown
```

**Modal sandbox — useful when you want GPUs too:**

```python
import modal
app = modal.App("agent-sb")

with modal.Sandbox.create(image=modal.Image.debian_slim().pip_install("pandas")) as sb:
    process = sb.exec("python", "-c", "import pandas; print(pandas.__version__)")
    print(process.stdout.read())
```

**Anthropic code execution — built into the API:**

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    tools=[{"type": "code_execution_20250522", "name": "code_execution"}],
    messages=[{"role": "user", "content": "Plot the trend in this CSV: ..."}],
)
# Claude writes + runs the code in Anthropic's sandbox; you get the result + image.
```

## What to put in a sandbox vs as a tool

- **Tool**: deterministic, narrow, well-typed actions. `get_weather`, `send_email`, `query_db`. You wrote the function; the agent picks arguments.
- **Sandbox**: open-ended computation, data analysis, code the agent writes on the fly, anything you'd ask a junior to "spike on a notebook."

Most production agents need both.

## Pricing & cost notes (May 2026)

| Provider | Pricing shape |
|----------|--------------|
| E2B | ~$0.000014/sec of CPU + ~$0.000004/sec of RAM-GB; free tier |
| Modal sandboxes | per-second CPU + RAM, GPU separate; $30/mo free credits |
| Daytona | $0.10–$0.50/hour per workspace, free tier |
| Anthropic code exec | included in tool-use pricing (extra tokens for outputs) |
| Cloudflare Sandbox | very cheap, included in Workers Paid |
| Fly Machines | $0.000002/sec CPU + RAM; tiny at scale |

For a typical "agent runs a 5-second script" call, sandbox cost is < $0.001. The cost is dominated by LLM tokens, not by the sandbox itself.

## Pitfalls

- **Running agent code on your application server.** One bad command and the agent has shell on your prod box. Always sandbox.
- **No network policy.** The default sandbox lets the agent hit any URL. Add an egress allow-list (especially for SSRF protection on internal IPs).
- **Forgetting to tear down.** Long-running sandboxes get billed. Set a hard timeout (5–15 min typical) and explicitly `kill()`.
- **Sharing a sandbox across users.** Cross-user state leakage. One sandbox per session, period.
- **No CPU / memory caps.** A fork bomb in the agent's script can blow your bill. Set limits at the runtime layer.
- **Putting secrets in env vars inside the sandbox.** The model can `printenv`. Inject only the secrets that specific operation needs.
- **Treating the sandbox as durable storage.** Files inside ephemeral VMs disappear on teardown. Persist intentionally to S3 or a DB.
- **No audit log of what the sandbox ran.** When something weird happens, you want the full command/output history. Most providers expose this — turn it on.

---

→ Next: [Batch inference](./batch-inference.md)
