(function () {
  "use strict";
  const L = window.Liturgia;
  const $ = (id) => document.getElementById(id);
  const LIMITE_RECOLHER = 24; // salmos com mais versículos começam recolhidos

  /* ---------- datas ---------- */
  function hojeLocal() {
    const n = new Date();
    return L.utc(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function deChave(k) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k || "");
    if (!m) return null;
    const d = L.utc(+m[1], +m[2] - 1, +m[3]);
    return L.chave(d) === k ? d : null;
  }
  const extenso = (d) => d.getUTCDate() + " de " + L.MESES[d.getUTCMonth()] + " de " + d.getUTCFullYear();

  let atual = deChave(location.hash.slice(1)) || hojeLocal();
  let mesExibido = L.utc(atual.getUTCFullYear(), atual.getUTCMonth(), 1);

  /* ---------- tema ---------- */
  function aplicaTema(t) {
    if (t) document.documentElement.setAttribute("data-tema", t);
    else document.documentElement.removeAttribute("data-tema");
  }
  try { aplicaTema(localStorage.getItem("tema")); } catch (e) {}
  $("btnTema").addEventListener("click", () => {
    const escuroSistema = matchMedia("(prefers-color-scheme: dark)").matches;
    const atualTema = document.documentElement.getAttribute("data-tema") || (escuroSistema ? "escuro" : "claro");
    const novo = atualTema === "escuro" ? "claro" : "escuro";
    aplicaTema(novo);
    try { localStorage.setItem("tema", novo); } catch (e) {}
  });

  /* ---------- renderização ---------- */
  function setCor(el, cor) { el.style.setProperty("--lit", "var(--c-" + cor + ")"); }

  function render() {
    const info = L.informacoes(atual);
    const cartao = $("cartao");
    setCor(cartao, info.cor);

    $("dataExtenso").textContent = L.SEMANA[atual.getUTCDay()] + ", " + extenso(atual);
    $("titulo").textContent = info.titulo;
    $("cor").querySelector("span").textContent = "Cor litúrgica: " + L.NOMES_COR[info.cor].toLowerCase();
    $("estacao").textContent = info.nomeEstacao;
    $("ano").textContent = "Ano " + info.ano;

    $("numSalmo").textContent = "Salmo " + info.psalm;
    $("porque").textContent = "Escolhido para hoje: " + info.razao;

    const versos = window.SALMOS[info.psalm - 1];
    const box = $("versos");
    box.textContent = "";
    versos.forEach((v, i) => {
      const p = document.createElement("p");
      const s = document.createElement("sup");
      s.textContent = i + 1;
      p.append(s, v);
      box.appendChild(p);
    });
    const longo = versos.length > LIMITE_RECOLHER;
    box.classList.toggle("recolhido", longo);
    $("expandir").hidden = !longo;
    $("expandir").textContent = "Ler salmo completo (" + versos.length + " versículos)";

    const camps = $("campanhas");
    camps.textContent = "";
    const itens = [];
    info.celebracoes.forEach((c) => { if (c.nome !== info.titulo) itens.push({ nome: c.nome, desc: c.rank === "S" ? "Solenidade" : c.rank === "F" ? "Festa" : "Memória" }); });
    info.camps.forEach((c) => itens.push({ nome: c.nome, desc: c.desc }));
    itens.forEach((c) => {
      const div = document.createElement("div");
      div.className = "camp";
      const h = document.createElement("h3"); h.textContent = c.nome;
      const p = document.createElement("p"); p.textContent = c.desc;
      div.append(h, p);
      camps.appendChild(div);
    });
    camps.hidden = itens.length === 0;

    $("seletor").value = L.chave(atual);
    document.title = "Salmo " + info.psalm + " · " + info.titulo;
    if (location.hash.slice(1) !== L.chave(atual)) history.replaceState(null, "", "#" + L.chave(atual));
    $("aviso").textContent = "";
    renderMes();
  }

  function renderMes() {
    const y = mesExibido.getUTCFullYear(), m = mesExibido.getUTCMonth();
    $("mesTitulo").textContent = L.MESES[m][0].toUpperCase() + L.MESES[m].slice(1) + " de " + y;
    const grade = $("grade");
    grade.textContent = "";
    ["D", "S", "T", "Q", "Q", "S", "S"].forEach((s) => {
      const c = document.createElement("div"); c.className = "cab"; c.textContent = s; grade.appendChild(c);
    });
    for (let i = 0; i < mesExibido.getUTCDay(); i++) {
      const v = document.createElement("div"); v.className = "dia vazio"; grade.appendChild(v);
    }
    const dias = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const hoje = L.chave(hojeLocal()), sel = L.chave(atual);
    for (let d = 1; d <= dias; d++) {
      const dt = L.utc(y, m, d);
      const info = L.informacoes(dt);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dia" + (L.chave(dt) === hoje ? " hoje" : "") + (L.chave(dt) === sel ? " sel" : "");
      b.setAttribute("aria-label", d + " de " + L.MESES[m] + ": Salmo " + info.psalm + ", " + info.titulo);
      const n = document.createElement("span"); n.textContent = d;
      const dot = document.createElement("i"); dot.className = "ponto c-" + info.cor;
      const s = document.createElement("small"); s.textContent = "Sl " + info.psalm;
      b.append(n, dot, s);
      b.addEventListener("click", () => { atual = dt; render(); window.scrollTo({ top: 0, behavior: "smooth" }); });
      grade.appendChild(b);
    }
  }

  /* ---------- eventos ---------- */
  function vai(dias) {
    atual = L.soma(atual, dias);
    mesExibido = L.utc(atual.getUTCFullYear(), atual.getUTCMonth(), 1);
    render();
  }
  $("ant").addEventListener("click", () => vai(-1));
  $("prox").addEventListener("click", () => vai(1));
  $("hoje").addEventListener("click", () => { atual = hojeLocal(); mesExibido = L.utc(atual.getUTCFullYear(), atual.getUTCMonth(), 1); render(); });
  $("seletor").addEventListener("change", (e) => {
    const d = deChave(e.target.value);
    if (d) { atual = d; mesExibido = L.utc(d.getUTCFullYear(), d.getUTCMonth(), 1); render(); }
  });
  $("mesAnt").addEventListener("click", () => { mesExibido = L.utc(mesExibido.getUTCFullYear(), mesExibido.getUTCMonth() - 1, 1); renderMes(); });
  $("mesProx").addEventListener("click", () => { mesExibido = L.utc(mesExibido.getUTCFullYear(), mesExibido.getUTCMonth() + 1, 1); renderMes(); });
  $("expandir").addEventListener("click", () => {
    const box = $("versos");
    const recolhido = box.classList.toggle("recolhido");
    $("expandir").textContent = recolhido ? "Ler salmo completo (" + box.children.length + " versículos)" : "Recolher";
  });
  window.addEventListener("hashchange", () => {
    const d = deChave(location.hash.slice(1));
    if (d && L.chave(d) !== L.chave(atual)) { atual = d; mesExibido = L.utc(d.getUTCFullYear(), d.getUTCMonth(), 1); render(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft") vai(-1);
    if (e.key === "ArrowRight") vai(1);
  });

  $("compartilhar").addEventListener("click", async () => {
    const info = L.informacoes(atual);
    const texto = "Salmo " + info.psalm + " — " + info.titulo + " (" + extenso(atual) + ")";
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: "Salmo do Dia", text: texto, url }); return; }
      await navigator.clipboard.writeText(texto + "\n" + url);
      $("aviso").textContent = "Link copiado!";
    } catch (e) { if (e && e.name !== "AbortError") $("aviso").textContent = url; }
  });

  $("traducao").textContent = window.TRADUCAO;
  render();
})();
