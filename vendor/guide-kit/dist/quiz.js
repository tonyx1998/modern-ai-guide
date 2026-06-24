// src/quiz/index.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import Link from "@docusaurus/Link";

// src/quiz/styles.module.css
var styles_default = {
  quiz: "styles_quiz",
  header: "styles_header",
  badge: "styles_badge",
  title: "styles_title",
  requiredHint: "styles_requiredHint",
  questions: "styles_questions",
  question: "styles_question",
  prompt: "styles_prompt",
  questionNumber: "styles_questionNumber",
  options: "styles_options",
  option: "styles_option",
  optionLetter: "styles_optionLetter",
  optionText: "styles_optionText",
  tag: "styles_tag",
  optionChosen: "styles_optionChosen",
  optionRight: "styles_optionRight",
  optionWrong: "styles_optionWrong",
  explanationRight: "styles_explanationRight",
  explanationWrong: "styles_explanationWrong",
  revisitInline: "styles_revisitInline",
  submitRow: "styles_submitRow",
  submit: "styles_submit",
  result: "styles_result",
  resultPass: "styles_resultPass",
  resultRetry: "styles_resultRetry",
  scoreLine: "styles_scoreLine",
  scoreNumber: "styles_scoreNumber",
  scoreVerdict: "styles_scoreVerdict",
  revisitHeading: "styles_revisitHeading",
  revisitList: "styles_revisitList",
  revisitWhy: "styles_revisitWhy",
  resultActions: "styles_resultActions",
  resetButton: "styles_resetButton",
  quizMicro: "styles_quizMicro",
  headerMicro: "styles_headerMicro",
  badgeMicro: "styles_badgeMicro",
  microTitle: "styles_microTitle",
  submitRowMicro: "styles_submitRowMicro",
  submitMicro: "styles_submitMicro",
  resultMicro: "styles_resultMicro",
  microRevisit: "styles_microRevisit",
  resetButtonMicro: "styles_resetButtonMicro"
};

// src/quiz/index.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var QuizContext = createContext(null);
function storageKey(id) {
  return `quiz-${id}`;
}
function rotationKey(id) {
  return `quiz-rot-${id}`;
}
function loadStored(id) {
  var _a;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.answers && typeof parsed.answers === "object") {
      return {
        answers: parsed.answers,
        activePrompts: Array.isArray(parsed.activePrompts) ? parsed.activePrompts : [],
        passed: parsed.passed === true,
        completedAt: (_a = parsed.completedAt) != null ? _a : ""
      };
    }
  } catch {
  }
  return null;
}
function saveStored(id, result) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(id), JSON.stringify(result));
    window.dispatchEvent(
      new CustomEvent("quiz:saved", { detail: { id, passed: result.passed } })
    );
  } catch {
  }
}
function clearStored(id) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(id));
    window.dispatchEvent(
      new CustomEvent("quiz:saved", { detail: { id, passed: false } })
    );
  } catch {
  }
}
function readRotation(id) {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(rotationKey(id));
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function bumpRotation(id) {
  const next = readRotation(id) + 1;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(rotationKey(id), String(next));
    } catch {
    }
  }
  return next;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededShuffle(arr, seed) {
  const rng = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function setQuizPending(id, pending) {
  var _a;
  if (typeof document === "undefined") return;
  const win = window;
  const set = (_a = win.__quizPending) != null ? _a : /* @__PURE__ */ new Set();
  if (pending) set.add(id);
  else set.delete(id);
  win.__quizPending = set;
  document.body.classList.toggle("quiz-required-pending", set.size > 0);
}
function Quiz({
  id,
  title,
  sampleSize,
  passingScore = 0.6,
  variant = "checkpoint",
  required,
  children
}) {
  const isMicro = variant === "micro";
  const isRequired = required != null ? required : !isMicro;
  const [registered, setRegistered] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [restoredActivePrompts, setRestoredActivePrompts] = useState(null);
  useEffect(() => {
    setRotation(readRotation(id));
    const stored = loadStored(id);
    if (stored) {
      setAnswers(stored.answers);
      setSubmitted(true);
      if (stored.activePrompts.length > 0) {
        setRestoredActivePrompts(stored.activePrompts);
      }
    }
    setRestored(true);
  }, [id]);
  const activeQuestions = useMemo(() => {
    if (registered.length === 0) return [];
    let chosen = [];
    if (restoredActivePrompts) {
      const byPrompt = new Map(registered.map((q) => [q.prompt, q]));
      chosen = restoredActivePrompts.map((p) => byPrompt.get(p)).filter((q) => !!q);
    } else if (!sampleSize || sampleSize >= registered.length) {
      chosen = registered;
    } else {
      const seed = hashString(id) ^ rotation * 2654435769;
      chosen = seededShuffle(registered, seed).slice(0, sampleSize);
    }
    return chosen.map((q, i) => ({ ...q, position: i }));
  }, [registered, restoredActivePrompts, sampleSize, rotation, id]);
  const activePrompts = useMemo(
    () => new Set(activeQuestions.map((q) => q.prompt)),
    [activeQuestions]
  );
  const ctx = useMemo(
    () => ({
      registerQuestion(q) {
        setRegistered((prev) => {
          if (prev.some((p) => p.prompt === q.prompt)) return prev;
          return [...prev, { ...q, registrationOrder: prev.length }];
        });
      },
      recordAnswer(prompt, choice) {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [prompt]: choice }));
      },
      answers,
      submitted,
      activePrompts,
      activeQuestions
    }),
    [answers, submitted, activePrompts, activeQuestions]
  );
  const allAnswered = activeQuestions.length > 0 && activeQuestions.every((q) => typeof answers[q.prompt] === "number");
  const score = useMemo(() => {
    let correct = 0;
    activeQuestions.forEach((q) => {
      if (answers[q.prompt] === q.correct) correct += 1;
    });
    return correct;
  }, [activeQuestions, answers]);
  const ratio = activeQuestions.length > 0 ? score / activeQuestions.length : 0;
  const passed = submitted && ratio >= passingScore;
  useEffect(() => {
    if (!isRequired) return;
    setQuizPending(id, !passed);
    return () => setQuizPending(id, false);
  }, [id, isRequired, passed]);
  function submit() {
    if (!allAnswered) return;
    setSubmitted(true);
    let correct = 0;
    activeQuestions.forEach((q) => {
      if (answers[q.prompt] === q.correct) correct += 1;
    });
    const didPass = activeQuestions.length > 0 && correct / activeQuestions.length >= passingScore;
    saveStored(id, {
      answers,
      activePrompts: activeQuestions.map((q) => q.prompt),
      passed: didPass,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  function reset() {
    setSubmitted(false);
    setAnswers({});
    clearStored(id);
    setRestoredActivePrompts(null);
    setRotation(bumpRotation(id));
  }
  const missed = useMemo(
    () => activeQuestions.filter((q) => answers[q.prompt] !== q.correct),
    [activeQuestions, answers]
  );
  return /* @__PURE__ */ jsx(QuizContext.Provider, { value: ctx, children: /* @__PURE__ */ jsxs(
    "section",
    {
      className: `${styles_default.quiz} ${isMicro ? styles_default.quizMicro : ""}`,
      "aria-label": title != null ? title : "Quiz",
      children: [
        /* @__PURE__ */ jsxs("header", { className: `${styles_default.header} ${isMicro ? styles_default.headerMicro : ""}`, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles_default.badge} ${isMicro ? styles_default.badgeMicro : ""}`, children: isMicro ? "\u{1F914} Quick check" : isRequired ? "Required checkpoint" : "Checkpoint" }),
          !isMicro && /* @__PURE__ */ jsx("h3", { className: styles_default.title, children: title != null ? title : "Quick check" }),
          !isMicro && isRequired && /* @__PURE__ */ jsx("span", { className: styles_default.requiredHint, children: "Pass to unlock the Next button below" }),
          isMicro && title && /* @__PURE__ */ jsx("span", { className: styles_default.microTitle, children: title })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles_default.questions, children }),
        restored && !submitted && /* @__PURE__ */ jsx("div", { className: `${styles_default.submitRow} ${isMicro ? styles_default.submitRowMicro : ""}`, children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `${styles_default.submit} ${isMicro ? styles_default.submitMicro : ""}`,
            onClick: submit,
            disabled: !allAnswered,
            children: allAnswered ? isMicro ? "Check" : "Check my answers" : isMicro ? `Pick one` : `Answer all ${activeQuestions.length} to continue`
          }
        ) }),
        submitted && /* @__PURE__ */ jsx(
          ResultSummary,
          {
            score,
            total: activeQuestions.length,
            missed,
            passed,
            passingScore,
            required: isRequired,
            isMicro,
            onReset: reset
          }
        )
      ]
    }
  ) });
}
function ResultSummary({
  score,
  total,
  missed,
  passed,
  passingScore,
  required,
  isMicro,
  onReset
}) {
  const ratio = total > 0 ? score / total : 0;
  const verdict = isMicro ? passed ? total === 1 ? "Got it." : "Nice \u2014 both right." : "Worth re-reading the section above." : passed ? ratio >= 0.8 ? "Solid \u2014 you can move on with confidence." : "Passed. Worth a quick glance at the revisit links below." : `Below the ${Math.round(passingScore * 100)}% threshold. ${required ? "Re-read the linked sections, then retake to unlock Next." : "Re-read the linked sections, then retake when ready."}`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: [
        styles_default.result,
        passed ? styles_default.resultPass : styles_default.resultRetry,
        isMicro ? styles_default.resultMicro : ""
      ].filter(Boolean).join(" "),
      role: "status",
      children: [
        /* @__PURE__ */ jsxs("div", { className: styles_default.scoreLine, children: [
          !isMicro && /* @__PURE__ */ jsxs("span", { className: styles_default.scoreNumber, children: [
            score,
            " / ",
            total
          ] }),
          /* @__PURE__ */ jsxs("span", { className: styles_default.scoreVerdict, children: [
            isMicro ? passed ? "\u2713 " : "\u2717 " : "",
            verdict
          ] })
        ] }),
        missed.length > 0 && !isMicro && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: styles_default.revisitHeading, children: passed ? "Glance back at:" : "Revisit these before retaking:" }),
          /* @__PURE__ */ jsx("ul", { className: styles_default.revisitList, children: missed.map(
            (q) => q.revisit ? /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx(Link, { to: revisitTo(q.revisit.to), children: q.revisit.label }),
              /* @__PURE__ */ jsxs("span", { className: styles_default.revisitWhy, children: [
                " ",
                '\u2014 missed: "',
                truncate(q.prompt, 80),
                '"'
              ] })
            ] }, q.prompt) : /* @__PURE__ */ jsxs("li", { className: styles_default.revisitWhy, children: [
              'Missed: "',
              truncate(q.prompt, 80),
              '"'
            ] }, q.prompt)
          ) })
        ] }),
        missed.length > 0 && isMicro && missed[0].revisit && /* @__PURE__ */ jsx("div", { className: styles_default.microRevisit, children: /* @__PURE__ */ jsxs(Link, { to: revisitTo(missed[0].revisit.to), children: [
          "\u2192 Re-read: ",
          missed[0].revisit.label
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: styles_default.resultActions, children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `${styles_default.resetButton} ${isMicro ? styles_default.resetButtonMicro : ""}`,
            onClick: onReset,
            children: isMicro ? "Try again" : passed ? "Retake with new questions" : "Retake"
          }
        ) })
      ]
    }
  );
}
function truncate(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "\u2026";
}
function revisitTo(to) {
  const hashIdx = to.indexOf("#");
  const base = hashIdx === -1 ? to : to.slice(0, hashIdx);
  const hash = hashIdx === -1 ? "" : to.slice(hashIdx);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}revisit=1${hash}`;
}
function Question(props) {
  var _a;
  const ctx = useContext(QuizContext);
  useEffect(() => {
    if (ctx) ctx.registerQuestion(props);
  }, []);
  if (!ctx) {
    return /* @__PURE__ */ jsxs("div", { className: styles_default.question, children: [
      /* @__PURE__ */ jsx("strong", { children: props.prompt }),
      /* @__PURE__ */ jsx("p", { style: { color: "var(--ifm-color-warning-dark)" }, children: "(Question must live inside a <Quiz>.)" })
    ] });
  }
  const isActive = ctx.activePrompts.has(props.prompt);
  if (!isActive && ctx.activePrompts.size > 0) {
    return null;
  }
  if (ctx.activePrompts.size === 0) {
    return null;
  }
  const active = ctx.activeQuestions.find((q) => q.prompt === props.prompt);
  const position = (_a = active == null ? void 0 : active.position) != null ? _a : -1;
  const chosen = ctx.answers[props.prompt];
  const submitted = ctx.submitted;
  return /* @__PURE__ */ jsxs("div", { className: styles_default.question, children: [
    /* @__PURE__ */ jsxs("div", { className: styles_default.prompt, children: [
      /* @__PURE__ */ jsx("span", { className: styles_default.questionNumber, children: position >= 0 ? `Q${position + 1}.` : "" }),
      " ",
      props.prompt
    ] }),
    /* @__PURE__ */ jsx("ul", { className: styles_default.options, role: "radiogroup", children: props.options.map((opt, i) => {
      const isChosen = chosen === i;
      const isCorrect = i === props.correct;
      const showRight = submitted && isCorrect;
      const showWrong = submitted && isChosen && !isCorrect;
      return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          role: "radio",
          "aria-checked": isChosen,
          disabled: submitted,
          onClick: () => ctx.recordAnswer(props.prompt, i),
          className: [
            styles_default.option,
            isChosen ? styles_default.optionChosen : "",
            showRight ? styles_default.optionRight : "",
            showWrong ? styles_default.optionWrong : ""
          ].filter(Boolean).join(" "),
          children: [
            /* @__PURE__ */ jsxs("span", { className: styles_default.optionLetter, children: [
              String.fromCharCode(65 + i),
              "."
            ] }),
            /* @__PURE__ */ jsx("span", { className: styles_default.optionText, children: opt.text }),
            showRight && /* @__PURE__ */ jsx("span", { className: styles_default.tag, "aria-label": "correct", children: "\u2713" }),
            showWrong && /* @__PURE__ */ jsx("span", { className: styles_default.tag, "aria-label": "incorrect", children: "\u2717" })
          ]
        }
      ) }, i);
    }) }),
    submitted && props.explanation && /* @__PURE__ */ jsxs(
      "div",
      {
        className: chosen === props.correct ? styles_default.explanationRight : styles_default.explanationWrong,
        children: [
          props.explanation,
          props.revisit && chosen !== props.correct && /* @__PURE__ */ jsxs(Fragment, { children: [
            " ",
            /* @__PURE__ */ jsxs(Link, { to: revisitTo(props.revisit.to), className: styles_default.revisitInline, children: [
              "\u2192 Revisit: ",
              props.revisit.label
            ] })
          ] })
        ]
      }
    )
  ] });
}
var quiz_default = Quiz;
export {
  Question,
  Quiz,
  quiz_default as default
};
