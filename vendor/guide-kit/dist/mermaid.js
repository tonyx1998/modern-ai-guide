// src/mermaid.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function parseFlow(src) {
  const lines = src.split("\n").map((l) => l.replace(/\r/g, "").trim()).filter(Boolean);
  let dir = "TB";
  const nodes = /* @__PURE__ */ new Map();
  const edges = [];
  const groups = [];
  let cur = null;
  const shapeOf = (o) => o === "{" ? "diamond" : o === "((" ? "circle" : o === "(" ? "round" : "rect";
  const ensure = (id) => {
    if (!nodes.has(id)) nodes.set(id, { id, label: id, shape: "rect", group: cur });
    return nodes.get(id);
  };
  const def = (id, br) => {
    const n = ensure(id);
    if (br) {
      const m = br.match(/^(\(\(|\(|\[|\{)([\s\S]*?)(\)\)|\)|\]|\})$/);
      if (m) {
        n.label = m[2].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
        n.shape = shapeOf(m[1]);
      }
    }
    if (cur != null) n.group = cur;
    return n;
  };
  const tok = `([A-Za-z0-9_]+)((?:\\[[\\s\\S]*?\\])|(?:\\{[\\s\\S]*?\\})|(?:\\(\\([\\s\\S]*?\\)\\))|(?:\\([\\s\\S]*?\\)))?`;
  for (const raw of lines) {
    if (/^(flowchart|graph)\s/i.test(raw)) {
      const dm = raw.match(/(LR|RL|TB|TD|BT)/i);
      if (dm) dir = dm[1].toUpperCase().replace("TD", "TB");
      continue;
    }
    if (/^subgraph/i.test(raw)) {
      const m = raw.match(/^subgraph\s+([A-Za-z0-9_]+)\s*(?:\[([\s\S]*?)\])?/);
      const gid = m ? m[1] : "g" + groups.length;
      groups.push({ id: gid, title: m && m[2] ? m[2].replace(/^"|"$/g, "") : gid, nodes: [] });
      cur = gid;
      continue;
    }
    if (/^end$/i.test(raw)) {
      cur = null;
      continue;
    }
    if (/^(direction|classDef|class|style|linkStyle|%%)/i.test(raw)) continue;
    const op = raw.match(/(-\.->|-->|==>|---|-\.-)/);
    if (op) {
      const dashed = op[1].includes("-.");
      const parts = raw.split(op[1]);
      let left = parts[0].trim();
      let right = parts.slice(1).join(op[1]).trim();
      let label = null;
      const lm = right.match(/^\|([^|]*)\|\s*/);
      if (lm) {
        label = lm[1].replace(/^"|"$/g, "").trim();
        right = right.slice(lm[0].length).trim();
      }
      const lt = left.match(new RegExp("^" + tok + "\\s*$"));
      const rt = right.match(new RegExp("^" + tok));
      if (lt && rt) {
        const a = def(lt[1], lt[2]);
        const b = def(rt[1], rt[2]);
        edges.push({ from: a.id, to: b.id, label, dashed });
      }
      continue;
    }
    const sm = raw.match(new RegExp("^" + tok + "\\s*$"));
    if (sm && sm[2]) def(sm[1], sm[2]);
  }
  for (const n of nodes.values()) if (n.group) {
    const g = groups.find((x) => x.id === n.group);
    if (g) g.nodes.push(n.id);
  }
  return { type: "flow", dir, nodes: [...nodes.values()], edges, groups };
}
function parseSeq(src) {
  const lines = src.split("\n").map((l) => l.replace(/\r/g, "").trim()).filter(Boolean);
  const parts = [];
  const msgs = [];
  for (const line of lines) {
    if (/^sequenceDiagram/i.test(line)) continue;
    let m = line.match(/^participant\s+([A-Za-z0-9_]+)\s+as\s+(.+)$/i) || line.match(/^participant\s+([A-Za-z0-9_]+)/i);
    if (m) {
      parts.push({ id: m[1], label: m[2] ? m[2].trim() : m[1] });
      continue;
    }
    m = line.match(/^Note\s+(over|left of|right of)\s+([A-Za-z0-9_, ]+):\s*(.+)$/i);
    if (m) {
      msgs.push({ type: "note", over: m[2].split(",").map((s) => s.trim()), text: m[3].trim() });
      continue;
    }
    m = line.match(/^([A-Za-z0-9_]+)\s*(->>|-->>|->|-->|-x|--x)\s*([A-Za-z0-9_]+)\s*:\s*(.+)$/);
    if (m) {
      const exists = (id) => parts.some((p) => p.id === id);
      if (!exists(m[1])) parts.push({ id: m[1], label: m[1] });
      if (!exists(m[3])) parts.push({ id: m[3], label: m[3] });
      msgs.push({ type: "msg", from: m[1], to: m[3], dashed: m[2].includes("--"), text: m[4].trim() });
    }
  }
  return { type: "seq", parts, msgs };
}
function parseMermaid(src) {
  const s = (src || "").trim();
  if (/^sequenceDiagram/i.test(s)) return parseSeq(s);
  if (/^(flowchart|graph)/i.test(s)) return parseFlow(s);
  return null;
}
function fkLines(label) {
  return String(label).split(/<br\s*\/?>|\n/).map((s) => s.trim()).filter((s) => s.length);
}
function fkText(label) {
  return String(label).replace(/<br\s*\/?>/g, " ").replace(/\s+/g, " ").trim();
}
function fkWrap(text, maxChars) {
  maxChars = Math.max(6, Math.floor(maxChars));
  if (text.length <= maxChars) return [text];
  const out = [];
  let cur = "";
  const flush = () => {
    if (cur) {
      out.push(cur);
      cur = "";
    }
  };
  for (let word of text.split(" ")) {
    while (word.length > maxChars) {
      flush();
      out.push(word.slice(0, maxChars));
      word = word.slice(maxChars);
    }
    const t = cur ? cur + " " + word : word;
    if (t.length > maxChars && cur) {
      flush();
      cur = word;
    } else cur = t;
  }
  flush();
  return out.slice(0, 3);
}
function fkAnchor(n, side) {
  if (side === "r") return [n.x + n.w, n.y + n.h / 2];
  if (side === "l") return [n.x, n.y + n.h / 2];
  if (side === "t") return [n.x + n.w / 2, n.y];
  return [n.x + n.w / 2, n.y + n.h];
}
function fkCurve(p1, p2, bend) {
  const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  return `M ${p1[0]} ${p1[1]} Q ${mx + nx * bend} ${my + ny * bend} ${p2[0]} ${p2[1]}`;
}
function fkSideBend(p1, p2, side, mag) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  if (side === "up") return ny > 0 ? -mag : mag;
  if (side === "down") return ny > 0 ? mag : -mag;
  if (side === "left") return nx > 0 ? -mag : mag;
  return nx > 0 ? mag : -mag;
}
function fkTone(n, isSink) {
  const t = String(n.label).toLowerCase();
  if (n.shape === "diamond") return { tone: "amber", emph: true };
  if (/\b(win|ship|valid|reused|final answer|answer|success|done|good)\b/.test(t) && isSink) return { tone: "green", emph: true };
  if (/\b(fail|failure|stop|wrong|can't|cannot|error|miss)\b/.test(t)) return { tone: "rose", emph: true };
  return { tone: "violet", emph: false };
}
function fkLayout(spec) {
  const dir = spec.dir || "TB";
  const horiz = dir === "LR" || dir === "RL";
  const N = /* @__PURE__ */ new Map();
  spec.nodes.forEach((n, idx) => {
    const lines = fkLines(n.label).flatMap((s) => fkWrap(s, 20));
    const longest = Math.max(1, ...lines.map((s) => s.length));
    let w = Math.max(70, Math.round(longest * 6.9 + 26));
    let h = Math.max(40, lines.length * 16 + 20);
    if (n.shape === "diamond") {
      w += 30;
      h += 16;
    }
    if (n.shape === "circle") {
      const d = Math.max(w, h);
      w = d;
      h = d;
    }
    N.set(n.id, { ...n, w, h, lines, idx });
  });
  const ids = spec.nodes.map((n) => n.id);
  const valid = spec.edges.filter((e) => N.has(e.from) && N.has(e.to));
  const adj = new Map(ids.map((i) => [i, []]));
  valid.forEach((e) => adj.get(e.from).push(e.to));
  const state = /* @__PURE__ */ new Map();
  const back = /* @__PURE__ */ new Set();
  const dfs = (u) => {
    state.set(u, 1);
    for (const v of adj.get(u)) {
      if (state.get(v) === 1) back.add(u + "|" + v);
      else if (!state.get(v)) dfs(v);
    }
    state.set(u, 2);
  };
  ids.forEach((i) => {
    if (!state.get(i)) dfs(i);
  });
  const fed = valid.filter((e) => !back.has(e.from + "|" + e.to));
  const fout = new Map(ids.map((i) => [i, []]));
  const indeg = new Map(ids.map((i) => [i, 0]));
  fed.forEach((e) => {
    fout.get(e.from).push(e.to);
    indeg.set(e.to, indeg.get(e.to) + 1);
  });
  const rank = new Map(ids.map((i) => [i, 0]));
  let q = ids.filter((i) => indeg.get(i) === 0);
  const ind = new Map(indeg);
  while (q.length) {
    const u = q.shift();
    for (const v of fout.get(u)) {
      rank.set(v, Math.max(rank.get(v), rank.get(u) + 1));
      ind.set(v, ind.get(v) - 1);
      if (ind.get(v) === 0) q.push(v);
    }
  }
  let maxRank = 0;
  rank.forEach((r) => {
    maxRank = Math.max(maxRank, r);
  });
  const layers = Array.from({ length: maxRank + 1 }, () => []);
  ids.forEach((i) => layers[rank.get(i)].push(i));
  {
    const aU = new Map(ids.map((i) => [i, []]));
    const aD = new Map(ids.map((i) => [i, []]));
    fed.forEach((e) => {
      aD.get(e.from).push(e.to);
      aU.get(e.to).push(e.from);
    });
    const pos = /* @__PURE__ */ new Map();
    layers.forEach((L) => L.forEach((id, i) => pos.set(id, i)));
    for (let it = 0; it < 8; it++) {
      const down = it % 2 === 0;
      const seq = down ? layers.map((_, r) => r) : layers.map((_, r) => r).reverse();
      for (const r of seq) {
        const nb = down ? aU : aD;
        const bary = (id) => {
          const ns = nb.get(id);
          return ns.length ? ns.reduce((s, n) => s + pos.get(n), 0) / ns.length : pos.get(id);
        };
        layers[r] = layers[r].map((id, i) => ({ id, b: bary(id), i })).sort((a, b) => a.b - b.b || a.i - b.i).map((k) => k.id);
        layers[r].forEach((id, i) => pos.set(id, i));
      }
    }
  }
  const M = 22, baseMain = horiz ? 64 : 56;
  const hasLabels = valid.some((e) => e.label);
  const crossGap = horiz ? 24 : hasLabels ? 62 : 32;
  const gapArr = layers.map(() => baseMain);
  valid.forEach((e) => {
    if (!e.label) return;
    const ra = rank.get(e.from), rb = rank.get(e.to), lo = Math.min(ra, rb);
    if (horiz && Math.abs(rb - ra) === 1) {
      const w = fkText(e.label).length * 6.5 + 28;
      if (w > gapArr[lo]) gapArr[lo] = w;
    }
  });
  const layerMain = layers.map((L) => Math.max(0, ...L.map((id) => horiz ? N.get(id).w : N.get(id).h)));
  const layerCross = layers.map((L) => L.reduce((s, id) => s + (horiz ? N.get(id).h : N.get(id).w), 0) + (L.length - 1) * crossGap);
  const maxCross = Math.max(0, ...layerCross);
  let mainPos = M, lastGap = baseMain;
  layers.forEach((L, r) => {
    let cross = M + (maxCross - layerCross[r]) / 2;
    L.forEach((id) => {
      const n = N.get(id);
      if (horiz) {
        n.x = mainPos + (layerMain[r] - n.w) / 2;
        n.y = cross;
        cross += n.h + crossGap;
      } else {
        n.y = mainPos + (layerMain[r] - n.h) / 2;
        n.x = cross;
        cross += n.w + crossGap;
      }
    });
    mainPos += layerMain[r] + gapArr[r];
    lastGap = gapArr[r];
  });
  const span = mainPos - lastGap + M;
  return { nodes: [...N.values()], edges: valid, back, rank, maxRank, horiz, W: horiz ? span : maxCross + 2 * M, H: horiz ? maxCross + 2 * M : span };
}
function fkLayoutBest(spec) {
  let L = fkLayout(spec);
  if (L.W > 1150 && spec.nodes.length > 3) {
    const f = fkLayout({ ...spec, dir: spec.dir === "LR" || spec.dir === "RL" ? "TB" : "LR" });
    if (f.W < L.W * 0.85) L = f;
  }
  return L;
}
function Defs({ id }) {
  return /* @__PURE__ */ jsxs("defs", { children: [
    /* @__PURE__ */ jsx("marker", { id: id + "-a", viewBox: "0 0 10 10", refX: "8.5", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx("path", { d: "M0 0L10 5L0 10z", fill: "var(--line)" }) }),
    /* @__PURE__ */ jsx("marker", { id: id + "-aon", viewBox: "0 0 10 10", refX: "8.5", refY: "5", markerWidth: "7.2", markerHeight: "7.2", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx("path", { d: "M0 0L10 5L0 10z", fill: "var(--violet)" }) })
  ] });
}
function Node({ n, tone, emph, op = 1, active = false }) {
  const ue = emph || active;
  const fill = ue ? `var(--${tone}-bg)` : "var(--panel-2)";
  const stroke = ue ? `var(--${tone})` : "var(--line)";
  const tc = ue ? `var(--${tone})` : "var(--ink)";
  const sw = active ? 2.2 : ue ? 1.8 : 1.4;
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  const sy = cy - (n.lines.length - 1) * 16 / 2 + 5;
  let shape;
  if (n.shape === "diamond") shape = /* @__PURE__ */ jsx("polygon", { points: `${cx},${n.y} ${n.x + n.w},${cy} ${cx},${n.y + n.h} ${n.x},${cy}`, fill, stroke, strokeWidth: sw });
  else if (n.shape === "circle") shape = /* @__PURE__ */ jsx("circle", { cx, cy, r: n.w / 2, fill, stroke, strokeWidth: sw });
  else shape = /* @__PURE__ */ jsx("rect", { x: n.x, y: n.y, width: n.w, height: n.h, rx: n.shape === "round" ? n.h / 2 : 11, fill, stroke, strokeWidth: sw });
  return /* @__PURE__ */ jsxs("g", { style: { opacity: op, transition: "opacity .45s var(--ease), filter .3s", filter: active ? `drop-shadow(0 0 6px var(--${tone}))` : "none" }, children: [
    shape,
    n.lines.map((ln, k) => /* @__PURE__ */ jsx("text", { x: cx, y: sy + k * 16, textAnchor: "middle", fontSize: "12.5", fontWeight: ue ? 600 : 500, fill: tc, children: ln }, k))
  ] });
}
function FlowFigure({ spec, id, step = null }) {
  const L = useMemo(() => fkLayoutBest(spec), [spec]);
  const byId = useMemo(() => new Map(L.nodes.map((n) => [n.id, n])), [L]);
  const outC = new Map(L.nodes.map((n) => [n.id, 0]));
  L.edges.forEach((e) => {
    if (outC.has(e.from)) outC.set(e.from, outC.get(e.from) + 1);
  });
  const geos = L.edges.map((e, k) => {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (!a || !b) return null;
    const isBack = L.back.has(e.from + "|" + e.to);
    const rd = L.rank.get(e.to) - L.rank.get(e.from);
    const span = Math.abs(rd);
    const skip = !isBack && rd > 1;
    let p1, p2, bend = 0;
    if (L.horiz) {
      if (isBack) {
        p1 = fkAnchor(a, "t");
        p2 = fkAnchor(b, "t");
        bend = fkSideBend(p1, p2, "up", 38 + span * 16);
      } else if (skip) {
        p1 = fkAnchor(a, "r");
        p2 = fkAnchor(b, "l");
        bend = fkSideBend(p1, p2, "up", 46 + (span - 1) * 18);
      } else {
        p1 = fkAnchor(a, "r");
        p2 = fkAnchor(b, "l");
        bend = Math.abs(b.y - a.y) > 6 ? b.y > a.y ? 16 : -16 : 0;
      }
    } else {
      if (isBack) {
        p1 = fkAnchor(a, "l");
        p2 = fkAnchor(b, "l");
        bend = fkSideBend(p1, p2, "left", 50 + span * 16);
      } else if (skip) {
        p1 = fkAnchor(a, "b");
        p2 = fkAnchor(b, "t");
        bend = fkSideBend(p1, p2, "right", 64 + (span - 1) * 22);
      } else {
        p1 = fkAnchor(a, "b");
        p2 = fkAnchor(b, "t");
        bend = Math.abs(b.x - a.x) > 6 ? b.x > a.x ? -16 : 16 : 0;
      }
    }
    const d = fkCurve(p1, p2, bend);
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    const apex = [mx + nx * bend, my + ny * bend];
    let lx, ly;
    if (!isBack && !skip && !L.horiz && b.y > a.y + a.h) {
      ly = (a.y + a.h + b.y) / 2;
      const tt = (ly - p1[1]) / (dy || 1);
      lx = p1[0] + dx * tt;
    } else if (!isBack && !skip && L.horiz && b.x > a.x + a.w) {
      lx = (a.x + a.w + b.x) / 2;
      const tt = (lx - p1[0]) / (dx || 1);
      ly = p1[1] + dy * tt;
    } else {
      lx = mx + nx * bend * 0.58;
      ly = my + ny * bend * 0.58;
    }
    const label = e.label ? fkText(e.label) : null;
    const lines = label ? fkWrap(label, 20) : null;
    const lw = lines ? Math.max(1, ...lines.map((s) => s.length)) : 0;
    return { k, d, mid: [lx, ly], apex, nx, ny, tone: a.shape === "diamond" ? "amber" : null, label, lines, lw, tr: L.rank.get(e.to) };
  }).filter(Boolean);
  {
    const boxes = L.nodes.map((n) => [n.x, n.y, n.w, n.h]);
    const placed = [];
    const ol = (cx, cy, w, h, x, y, bw, bh) => cx - w / 2 < x + bw && cx + w / 2 > x && cy - h / 2 < y + bh && cy + h / 2 > y;
    const hit = (cx, cy, w, h) => boxes.some((b) => ol(cx, cy, w, h, b[0], b[1], b[2], b[3])) || placed.some((b) => ol(cx, cy, w, h, b[0], b[1], b[2], b[3]));
    geos.forEach((g) => {
      if (!g.label) return;
      const w = g.lw * 7 + 12, h = g.lines.length * 14 + 6;
      if (hit(g.mid[0], g.mid[1], w, h)) {
        const tx = g.ny, ty = -g.nx;
        const dirs = [[g.nx, g.ny], [-g.nx, -g.ny], [tx, ty], [-tx, -ty]];
        let best = null;
        for (let s = 1; s <= 18 && !best; s++) for (const [ux, uy] of dirs) {
          const cx = g.mid[0] + ux * s * 8, cy = g.mid[1] + uy * s * 8;
          if (!hit(cx, cy, w, h)) {
            best = [cx, cy];
            break;
          }
        }
        if (best) g.mid = best;
      }
      placed.push([g.mid[0] - (g.lw * 7 + 12) / 2, g.mid[1] - (g.lines.length * 14 + 6) / 2, g.lw * 7 + 12, g.lines.length * 14 + 6]);
    });
  }
  let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
  geos.forEach((g) => {
    mnX = Math.min(mnX, g.apex[0]);
    mxX = Math.max(mxX, g.apex[0]);
    mnY = Math.min(mnY, g.apex[1]);
    mxY = Math.max(mxY, g.apex[1]);
  });
  L.nodes.forEach((n) => {
    mnX = Math.min(mnX, n.x);
    mnY = Math.min(mnY, n.y);
    mxX = Math.max(mxX, n.x + n.w);
    mxY = Math.max(mxY, n.y + n.h);
  });
  geos.forEach((g) => {
    if (!g.label) return;
    const w = g.lw * 7 + 12, h = g.lines.length * 14 + 6;
    mnX = Math.min(mnX, g.mid[0] - w / 2);
    mxX = Math.max(mxX, g.mid[0] + w / 2);
    mnY = Math.min(mnY, g.mid[1] - h / 2);
    mxY = Math.max(mxY, g.mid[1] + h / 2);
  });
  const pad = 10, vbW = mxX - mnX + 2 * pad, vbH = mxY - mnY + 2 * pad;
  return /* @__PURE__ */ jsxs("svg", { style: { width: Math.round(vbW * 1.2) + "px", maxWidth: "100%" }, viewBox: `${Math.round(mnX - pad)} ${Math.round(mnY - pad)} ${Math.round(vbW)} ${Math.round(vbH)}`, role: "img", children: [
    /* @__PURE__ */ jsx(Defs, { id }),
    geos.map((g) => {
      const rev = step == null || g.tr <= step;
      const act = step != null && g.tr === step;
      const col = act ? "var(--violet)" : g.tone ? `var(--${g.tone})` : "var(--line)";
      return /* @__PURE__ */ jsx("path", { d: g.d, fill: "none", stroke: col, strokeWidth: act ? 2.4 : g.tone ? 1.9 : 1.5, strokeDasharray: g.dashed ? "5 5" : void 0, markerEnd: `url(#${id}-${act || g.tone ? "aon" : "a"})`, style: { opacity: rev ? 1 : 0.13, transition: "opacity .45s var(--ease), stroke .3s" } }, "p" + g.k);
    }),
    L.nodes.map((n) => {
      const { tone, emph } = fkTone(n, outC.get(n.id) === 0);
      const r = L.rank.get(n.id);
      let op = 1, active = false;
      if (step != null) {
        if (r > step) op = 0.26;
        else if (r === step) active = true;
      }
      return /* @__PURE__ */ jsx(Node, { n, tone, emph, op, active }, n.id);
    }),
    geos.filter((g) => g.label).map((g) => {
      const w = g.lw * 7 + 12, h = g.lines.length * 14 + 6;
      const rev = step == null || g.tr <= step;
      return /* @__PURE__ */ jsxs("g", { style: { opacity: rev ? 1 : 0, transition: "opacity .4s var(--ease)" }, children: [
        /* @__PURE__ */ jsx("rect", { x: g.mid[0] - w / 2, y: g.mid[1] - h / 2, width: w, height: h, rx: "5", fill: "var(--panel)", stroke: "var(--line-soft)" }),
        g.lines.map((ln, li) => /* @__PURE__ */ jsx("text", { x: g.mid[0], y: g.mid[1] - (g.lines.length - 1) * 7 + li * 14 + 3.5, textAnchor: "middle", fontSize: "10.5", fill: g.tone ? `var(--${g.tone})` : "var(--ink-soft)", fontWeight: "500", children: ln }, li))
      ] }, "l" + g.k);
    })
  ] });
}
function BandsFigure({ spec }) {
  const tones = ["violet", "cyan", "green", "amber", "rose"];
  const W = 686, padX = 16, innerL = padX + 16, innerR = W - padX - 16;
  const titleH = 32, chipH = 32, gx = 10, gy = 10, padB = 14, gapY = 16, top = 8;
  let y = top;
  const bands = spec.groups.map((g, gi) => {
    const members = g.nodes.map((id) => spec.nodes.find((n) => n.id === id)).filter(Boolean);
    const chips = members.map((m) => {
      const lines = fkLines(m.label);
      const w = Math.max(64, Math.round(Math.max(1, ...lines.map((s) => s.length)) * 6.7 + 24));
      return { lines, w };
    });
    const rows = [[]];
    let cx = innerL;
    chips.forEach((c) => {
      const row = rows[rows.length - 1];
      if (row.length && cx + c.w > innerR) {
        rows.push([]);
        cx = innerL;
      }
      c.x = cx;
      rows[rows.length - 1].push(c);
      cx += c.w + gx;
    });
    rows.forEach((row) => {
      const used = row.reduce((s, c) => s + c.w, 0) + (row.length - 1) * gx;
      const off = (innerR - innerL - used) / 2;
      row.forEach((c) => {
        c.x += off;
      });
    });
    const h = titleH + rows.length * chipH + (rows.length - 1) * gy + padB;
    const band = { tone: tones[gi % tones.length], title: g.title, y, h, rows };
    y += h + gapY;
    return band;
  });
  return /* @__PURE__ */ jsx("svg", { style: { width: Math.round(W * 1.2) + "px", maxWidth: "100%" }, viewBox: `0 0 ${W} ${Math.round(y)}`, role: "img", children: bands.map((b, gi) => /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("rect", { x: padX, y: b.y, width: W - padX * 2, height: b.h, rx: "14", fill: `var(--${b.tone}-bg)`, stroke: `var(--${b.tone})`, strokeWidth: "1.3", opacity: "0.55" }),
    /* @__PURE__ */ jsx("text", { x: innerL, y: b.y + 22, fontSize: "13", fontWeight: "700", fill: `var(--${b.tone})`, children: b.title }),
    b.rows.map((row, ri) => row.map((c, ci) => {
      const cy = b.y + titleH + ri * (chipH + gy);
      const mx = c.x + c.w / 2;
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("rect", { x: c.x, y: cy, width: c.w, height: chipH, rx: "8", fill: "var(--panel)", stroke: `var(--${b.tone})`, strokeWidth: "1.1" }),
        c.lines.map((ln, k) => /* @__PURE__ */ jsx("text", { x: mx, y: cy + chipH / 2 + 1 - (c.lines.length - 1) * 7 + k * 14, textAnchor: "middle", fontSize: "11", fill: "var(--ink)", children: ln }, k))
      ] }, ri + "-" + ci);
    }))
  ] }, gi)) });
}
function SeqFigure({ spec, id, step = null }) {
  const parts = spec.parts;
  const W = 686, headY = 20, headH = 30, startY = 80, lineGap = 13, boxW = 124;
  const ptw = (p) => p.label.length * 7;
  const M = Math.max(70, Math.ceil(Math.max(0, ...parts.map(ptw)) / 2) + 12);
  const gap = parts.length > 1 ? (W - 2 * M) / (parts.length - 1) : 0;
  const X = {};
  parts.forEach((p, i) => {
    X[p.id] = M + i * gap;
  });
  let y = startY;
  const drawn = spec.msgs.map((m) => {
    const text = fkText(m.text);
    let lines;
    if (m.type === "note") lines = [text];
    else {
      const span = Math.max(Math.abs(X[m.to] - X[m.from]), gap) - 10;
      lines = fkWrap(text, Math.max(8, Math.floor(span / 6.1)));
    }
    const item = { ...m, text, lines, y: y + (lines.length - 1) * lineGap };
    y = item.y + 26;
    return item;
  });
  const H = y + 8;
  return /* @__PURE__ */ jsxs("svg", { style: { width: Math.round(W * 1.2) + "px", maxWidth: "100%" }, viewBox: `0 0 ${W} ${Math.round(H)}`, role: "img", children: [
    /* @__PURE__ */ jsx(Defs, { id }),
    parts.map((p) => {
      const fs = Math.min(12, Math.max(9, Math.floor(12 * (boxW - 14) / Math.max(1, ptw(p)))));
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("rect", { x: X[p.id] - boxW / 2, y: headY, width: boxW, height: headH, rx: "8", fill: "var(--panel-3)", stroke: "var(--line)" }),
        /* @__PURE__ */ jsx("text", { x: X[p.id], y: headY + 20, textAnchor: "middle", fontSize: fs, fontWeight: "700", fill: "var(--ink)", children: p.label }),
        /* @__PURE__ */ jsx("line", { x1: X[p.id], y1: headY + headH, x2: X[p.id], y2: H - 10, stroke: "var(--line)", strokeWidth: "1.3", strokeDasharray: "3 5" })
      ] }, p.id);
    }),
    drawn.map((m, k) => {
      const vis = step == null || k <= step;
      const op = vis ? 1 : 0.12;
      if (m.type === "note") {
        const xs = m.over.map((o) => X[o]).filter((v) => v != null);
        const cx = xs.reduce((s, v) => s + v, 0) / (xs.length || 1);
        const w = Math.max(120, m.text.length * 6.6 + 20);
        return /* @__PURE__ */ jsxs("g", { style: { opacity: op, transition: "opacity .35s" }, children: [
          /* @__PURE__ */ jsx("rect", { x: cx - w / 2, y: m.y - 13, width: w, height: 20, rx: "5", fill: "var(--green-bg)", stroke: "var(--green)", strokeWidth: "1" }),
          /* @__PURE__ */ jsx("text", { x: cx, y: m.y + 1, textAnchor: "middle", fontSize: "10.5", fill: "var(--green)", fontWeight: "600", children: m.text })
        ] }, k);
      }
      const x1 = X[m.from], x2 = X[m.to], dir = x2 >= x1 ? 1 : -1;
      const act = step != null && k === step;
      const tone = act ? "var(--violet)" : m.dashed ? "var(--cyan)" : "var(--ink-soft)";
      return /* @__PURE__ */ jsxs("g", { style: { opacity: op, transition: "opacity .35s" }, children: [
        m.lines.map((ln, li) => /* @__PURE__ */ jsx("text", { x: (x1 + x2) / 2, y: m.y - 6 - (m.lines.length - 1 - li) * lineGap, textAnchor: "middle", fontSize: "10.5", fill: act ? "var(--violet)" : m.dashed ? "var(--cyan)" : "var(--ink-soft)", fontWeight: m.dashed || act ? 600 : 500, children: ln }, li)),
        /* @__PURE__ */ jsx("line", { x1, y1: m.y, x2: x2 - dir * 4, y2: m.y, stroke: tone, strokeWidth: act ? 2.3 : 1.7, strokeDasharray: m.dashed ? "5 4" : void 0, markerEnd: `url(#${id}-${m.dashed || act ? "aon" : "a"})` })
      ] }, k);
    })
  ] });
}
var UID = 0;
function usePlayer(steps) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI((p) => {
      if (p + 1 >= steps) {
        setPlaying(false);
        return p;
      }
      return p + 1;
    }), 1100);
    return () => clearTimeout(t);
  }, [playing, i, steps]);
  return { i, playing, toggle: () => setPlaying((p) => !p), next: () => {
    setPlaying(false);
    setI((p) => Math.min(steps - 1, p + 1));
  }, prev: () => {
    setPlaying(false);
    setI((p) => Math.max(0, p - 1));
  }, replay: () => {
    setI(0);
    setPlaying(true);
  }, goto: (n) => {
    setPlaying(false);
    setI(n);
  } };
}
function Controls({ p, steps }) {
  return /* @__PURE__ */ jsxs("div", { className: "aieg-ctrls", children: [
    /* @__PURE__ */ jsx("button", { className: "pri", onClick: p.toggle, children: p.playing ? "\u275A\u275A Pause" : "\u25B6 Play" }),
    /* @__PURE__ */ jsx("button", { onClick: p.prev, "aria-label": "Previous", children: "\u2039" }),
    /* @__PURE__ */ jsx("button", { onClick: p.next, "aria-label": "Next", children: "\u203A" }),
    /* @__PURE__ */ jsx("button", { onClick: p.replay, "aria-label": "Replay", children: "\u21BB" }),
    /* @__PURE__ */ jsx("div", { className: "pips", children: Array.from({ length: steps }).map((_, n) => /* @__PURE__ */ jsx("button", { className: "pip " + (n === p.i ? "on" : n < p.i ? "done" : ""), onClick: () => p.goto(n), "aria-label": "step " + (n + 1) }, n)) })
  ] });
}
function DiagramFigure({ source }) {
  const spec = useMemo(() => parseMermaid(source), [source]);
  const id = useMemo(() => "aieg" + ++UID, []);
  if (!spec) return null;
  const grouped = spec.groups && spec.groups.length;
  const groupedCount = grouped ? spec.groups.reduce((a, g) => a + g.nodes.length, 0) : 0;
  const pureBands = grouped && (!spec.edges || spec.edges.length === 0) && groupedCount >= spec.nodes.length * 0.8;
  const isSeq = spec.type === "seq";
  const isFlow = !isSeq && !pureBands;
  const animate = isSeq || isFlow && (spec.nodes.some((n) => n.shape === "diamond") || hasCycle(spec));
  const stepCount = useMemo(() => {
    if (!animate) return 1;
    if (isSeq) return Math.max(1, spec.msgs.length);
    return fkLayoutBest(spec).maxRank + 1;
  }, [spec, animate]);
  const player = usePlayer(stepCount);
  const started = player.playing || player.i > 0;
  const step = animate ? started ? player.i : stepCount - 1 : null;
  let body;
  if (isSeq) body = /* @__PURE__ */ jsx(SeqFigure, { spec, id, step });
  else if (pureBands) body = /* @__PURE__ */ jsx(BandsFigure, { spec });
  else body = /* @__PURE__ */ jsx(FlowFigure, { spec, id, step });
  return /* @__PURE__ */ jsxs("div", { className: "aieg-fig", children: [
    body,
    animate && stepCount > 1 && /* @__PURE__ */ jsx(Controls, { p: player, steps: stepCount })
  ] });
}
function hasCycle(spec) {
  const ids = spec.nodes.map((n) => n.id);
  const adj = new Map(ids.map((i) => [i, []]));
  spec.edges.forEach((e) => {
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
  });
  const st = /* @__PURE__ */ new Map();
  let found = false;
  const dfs = (u) => {
    st.set(u, 1);
    for (const v of adj.get(u) || []) {
      if (st.get(v) === 1) found = true;
      else if (!st.get(v)) dfs(v);
    }
    st.set(u, 2);
  };
  ids.forEach((i) => {
    if (!st.get(i)) dfs(i);
  });
  return found;
}
function isSupported(value) {
  return parseMermaid(value) != null;
}
function GuideMermaid({ value, Fallback }) {
  const spec = parseMermaid(value);
  if (!spec) {
    return Fallback ? /* @__PURE__ */ jsx(Fallback, { value }) : null;
  }
  return /* @__PURE__ */ jsx(DiagramFigure, { source: value });
}
export {
  GuideMermaid as default,
  isSupported
};
