// src/code-challenge/index.tsx
import { useCallback, useEffect, useRef, useState } from "react";

// src/code-challenge/styles.module.css
var styles_default = {
  challenge: "styles_challenge",
  header: "styles_header2",
  badge: "styles_badge2",
  solvedBadge: "styles_solvedBadge",
  prompt: "styles_prompt2",
  editor: "styles_editor",
  actions: "styles_actions",
  run: "styles_run",
  secondary: "styles_secondary",
  hint: "styles_hint",
  loading: "styles_loading",
  error: "styles_error",
  resultPass: "styles_resultPass2",
  resultFail: "styles_resultFail",
  resultHead: "styles_resultHead",
  testList: "styles_testList",
  testPass: "styles_testPass",
  testFail: "styles_testFail",
  testIcon: "styles_testIcon",
  testWhy: "styles_testWhy",
  solution: "styles_solution"
};

// src/code-challenge/index.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var PYODIDE_VERSION = "0.27.0";
var PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
var PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;
var COMPARE_SRC = `
  function close(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= tol;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      for (var i = 0; i < a.length; i++) { if (!close(a[i], b[i])) return false; }
      return true;
    }
    return false;
  }
  function eq(a, b) {
    if (typeof tol === 'number' && close(a, b)) return true;
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (_) { return a === b; }
  }
`;
var WORKER_SRC = `
self.onmessage = function (e) {
  var code = e.data.code, fnName = e.data.fnName, tests = e.data.tests, noMutate = e.data.noMutate, tol = e.data.tolerance;
${COMPARE_SRC}
  var fn;
  try {
    var factory = new Function(code + "\\nreturn typeof " + fnName + " === 'function' ? " + fnName + " : undefined;");
    fn = factory();
  } catch (err) {
    self.postMessage({ error: String(err && err.message || err) });
    return;
  }
  if (typeof fn !== 'function') {
    self.postMessage({ error: "Define a function named '" + fnName + "'." });
    return;
  }
  var results = tests.map(function (t) {
    var before = JSON.stringify(t.args);
    try {
      var got = fn.apply(null, t.args);
      var mutated = noMutate && JSON.stringify(t.args) !== before;
      return { args: t.args, expected: t.expected, label: t.label, got: got, pass: !mutated && eq(got, t.expected), mutated: mutated };
    } catch (err) {
      return { args: t.args, expected: t.expected, label: t.label, error: String(err && err.message || err), pass: false };
    }
  });
  self.postMessage({ results: results });
};
`;
var PY_WORKER_SRC = `
var pyodideReady = null;
var loadingAnnounced = false;

function getPyodide() {
  if (!pyodideReady) {
    if (!loadingAnnounced) { loadingAnnounced = true; self.postMessage({ loading: true }); }
    importScripts(${JSON.stringify(PYODIDE_SCRIPT_URL)});
    pyodideReady = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_INDEX_URL)} });
  }
  return pyodideReady;
}

// Deep-convert a Pyodide value (PyProxy or native scalar) to a plain JS value.
// Does NOT destroy the proxy \u2014 callers own the proxy lifecycle and free it in a
// finally block, so the same proxy can be converted more than once safely.
function toPlain(value) {
  if (value && typeof value.toJs === 'function') {
    return value.toJs({ dict_converter: Object.fromEntries });
  }
  return value;
}

self.onmessage = function (e) {
  var code = e.data.code, fnName = e.data.fnName, tests = e.data.tests, noMutate = e.data.noMutate, tol = e.data.tolerance;
${COMPARE_SRC}
  Promise.resolve()
    .then(getPyodide)
    .then(function (pyodide) {
      // Runtime is warm \u2014 tell the UI so it can (re)arm the infinite-loop guard
      // around just the test execution (not the one-time download).
      self.postMessage({ ready: true });
      // Define the learner's code in a fresh namespace each run.
      var ns;
      try {
        // Fresh namespace per run (an empty Python dict) so learner state never
        // leaks between runs. runPython resolves builtins automatically.
        ns = pyodide.toPy({});
        pyodide.runPython(code, { globals: ns });
      } catch (err) {
        self.postMessage({ error: String(err && err.message || err) });
        return;
      }
      var fn = ns.get(fnName);
      if (fn === undefined || fn === null || typeof fn !== 'function') {
        self.postMessage({ error: "Define a function named '" + fnName + "'." });
        if (fn && fn.destroy) fn.destroy();
        if (ns && ns.destroy) ns.destroy();
        return;
      }

      var results = tests.map(function (t) {
        var before = JSON.stringify(t.args);
        var pyArgs = [];
        var rawGot = null;
        try {
          // Convert each JS arg \u2192 a native Python object (so lists index, dicts
          // subscript, etc. \u2014 JS arrays would otherwise arrive as JsProxy).
          pyArgs = (t.args || []).map(function (a) { return pyodide.toPy(a); });
          rawGot = fn.apply(null, pyArgs);
          var got = toPlain(rawGot);
          // Mutation check: convert the (possibly mutated) Python args back to JS
          // and compare to the originals.
          var after = JSON.stringify(pyArgs.map(toPlain));
          var mutated = noMutate && after !== before;
          return { args: t.args, expected: t.expected, label: t.label, got: got, pass: !mutated && eq(got, t.expected), mutated: mutated };
        } catch (err) {
          return { args: t.args, expected: t.expected, label: t.label, error: String(err && err.message || err), pass: false };
        } finally {
          pyArgs.forEach(function (p) { if (p && p.destroy) { try { p.destroy(); } catch (_) {} } });
          if (rawGot && rawGot.destroy) { try { rawGot.destroy(); } catch (_) {} }
        }
      });
      if (fn && fn.destroy) fn.destroy();
      if (ns && ns.destroy) ns.destroy();
      self.postMessage({ results: results });
    })
    .catch(function (err) {
      self.postMessage({ error: String(err && err.message || err) });
    });
};
`;
function preview(v) {
  try {
    const s = JSON.stringify(v);
    return s === void 0 ? String(v) : s;
  } catch {
    return String(v);
  }
}
function CodeChallenge({
  id,
  language = "js",
  fnName,
  prompt,
  starter,
  solution,
  tests,
  hint,
  noMutate = false,
  timeoutMs = 2e3,
  tolerance
}) {
  const isPython = language === "python";
  const [code, setCode] = useState(starter);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [loadingRuntime, setLoadingRuntime] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const workerRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(`challenge-${id}`) === "solved") {
        setSolved(true);
      }
    } catch {
    }
  }, [id]);
  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);
  useEffect(() => cleanup, [cleanup]);
  const run = useCallback(() => {
    if (typeof window === "undefined") return;
    cleanup();
    setRunning(true);
    setError(null);
    setResults(null);
    setLoadingRuntime(false);
    let blobUrl;
    try {
      blobUrl = URL.createObjectURL(
        new Blob([isPython ? PY_WORKER_SRC : WORKER_SRC], {
          type: "application/javascript"
        })
      );
    } catch (err) {
      setError(`Could not start the runner: ${String(err)}`);
      setRunning(false);
      return;
    }
    const worker = new Worker(blobUrl);
    workerRef.current = worker;
    const armTimeout = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        cleanup();
        setRunning(false);
        setLoadingRuntime(false);
        setError(
          "Timed out \u2014 your code took too long (an infinite loop, maybe?). Check your loops and try again."
        );
      }, timeoutMs);
    };
    armTimeout();
    worker.onmessage = (ev) => {
      var _a;
      const data = ev.data;
      if (data.loading) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
        setLoadingRuntime(true);
        return;
      }
      if (data.ready) {
        setLoadingRuntime(false);
        armTimeout();
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      setRunning(false);
      setLoadingRuntime(false);
      URL.revokeObjectURL(blobUrl);
      if (data.error) {
        setError(data.error);
        worker.terminate();
        workerRef.current = null;
        return;
      }
      const res = (_a = data.results) != null ? _a : [];
      setResults(res);
      const allPass = res.length > 0 && res.every((r) => r.pass);
      if (allPass) {
        setSolved(true);
        try {
          window.localStorage.setItem(`challenge-${id}`, "solved");
        } catch {
        }
      }
      worker.terminate();
      workerRef.current = null;
    };
    worker.onerror = (ev) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setRunning(false);
      setLoadingRuntime(false);
      setError(ev.message || "Something went wrong running your code.");
      worker.terminate();
      workerRef.current = null;
    };
    worker.postMessage({ code, fnName, tests, noMutate, tolerance });
  }, [code, fnName, tests, noMutate, tolerance, timeoutMs, cleanup, id, isPython]);
  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart, selectionEnd } = el;
      const next = code.slice(0, selectionStart) + "  " + code.slice(selectionEnd);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 2;
      });
    }
  }
  const passCount = results ? results.filter((r) => r.pass).length : 0;
  return /* @__PURE__ */ jsxs("section", { className: styles_default.challenge, "aria-label": "Coding challenge", children: [
    /* @__PURE__ */ jsxs("header", { className: styles_default.header, children: [
      /* @__PURE__ */ jsxs("span", { className: styles_default.badge, children: [
        "\u2328\uFE0F Challenge \u2014 ",
        isPython ? "Python" : "JavaScript",
        " \xB7 practice (not graded)"
      ] }),
      solved && /* @__PURE__ */ jsx("span", { className: styles_default.solvedBadge, children: "\u2713 Solved" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: styles_default.prompt, children: prompt }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        className: styles_default.editor,
        value: code,
        spellCheck: false,
        onChange: (e) => setCode(e.target.value),
        onKeyDown: handleKeyDown,
        rows: Math.max(6, code.split("\n").length + 1),
        "aria-label": isPython ? "Your Python code" : "Your JavaScript code"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: styles_default.actions, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: styles_default.run,
          onClick: run,
          disabled: running,
          children: loadingRuntime ? "Loading Python\u2026" : running ? "Running\u2026" : "Run tests"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: styles_default.secondary,
          onClick: () => {
            setCode(starter);
            setResults(null);
            setError(null);
          },
          children: "Reset"
        }
      ),
      hint && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: styles_default.secondary,
          onClick: () => setShowHint((s) => !s),
          children: showHint ? "Hide hint" : "Hint"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: styles_default.secondary,
          onClick: () => setShowSolution((s) => !s),
          children: showSolution ? "Hide solution" : "Show solution"
        }
      )
    ] }),
    showHint && hint && /* @__PURE__ */ jsxs("div", { className: styles_default.hint, children: [
      "\u{1F4A1} ",
      hint
    ] }),
    loadingRuntime && /* @__PURE__ */ jsxs("div", { className: styles_default.loading, role: "status", "aria-live": "polite", children: [
      "\u23F3 Loading Python runtime\u2026 (downloading Pyodide ",
      PYODIDE_VERSION,
      " \u2014 this happens once, then it's cached for the rest of the page.)"
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: styles_default.error, children: [
      /* @__PURE__ */ jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }),
    results && !error && /* @__PURE__ */ jsxs(
      "div",
      {
        className: passCount === results.length ? styles_default.resultPass : styles_default.resultFail,
        children: [
          /* @__PURE__ */ jsx("div", { className: styles_default.resultHead, children: passCount === results.length ? `\u2713 All ${results.length} tests passed \u2014 nice.` : `${passCount} / ${results.length} tests passed` }),
          /* @__PURE__ */ jsx("ul", { className: styles_default.testList, children: results.map((r, i) => {
            var _a;
            return /* @__PURE__ */ jsxs("li", { className: r.pass ? styles_default.testPass : styles_default.testFail, children: [
              /* @__PURE__ */ jsx("span", { className: styles_default.testIcon, children: r.pass ? "\u2713" : "\u2717" }),
              " ",
              /* @__PURE__ */ jsxs("code", { children: [
                fnName,
                "(",
                ((_a = r.args) != null ? _a : []).map(preview).join(", "),
                ")"
              ] }),
              !r.pass && /* @__PURE__ */ jsx("span", { className: styles_default.testWhy, children: r.error ? ` \u2192 threw: ${r.error}` : r.mutated ? " \u2192 you mutated the input; return a new value instead" : ` \u2192 expected ${preview(r.expected)}, got ${preview(r.got)}` })
            ] }, i);
          }) })
        ]
      }
    ),
    showSolution && /* @__PURE__ */ jsx("pre", { className: styles_default.solution, children: /* @__PURE__ */ jsx("code", { children: solution }) })
  ] });
}
export {
  CodeChallenge as default
};
