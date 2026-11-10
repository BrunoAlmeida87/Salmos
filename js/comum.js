/* Funções compartilhadas pelas páginas: tema, tamanho da letra, leitura em voz alta,
 * modo "dois coros", renderização de salmos (inteiros ou trechos) e PWA.
 */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const guarda = {
    ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- tema ---------- */
  function aplicaTema(t) {
    if (t) document.documentElement.setAttribute("data-tema", t);
    else document.documentElement.removeAttribute("data-tema");
  }
  aplicaTema(guarda.ler("tema"));
  function alternaTema() {
    const escuroSistema = matchMedia("(prefers-color-scheme: dark)").matches;
    const atual = document.documentElement.getAttribute("data-tema") || (escuroSistema ? "escuro" : "claro");
    const novo = atual === "escuro" ? "claro" : "escuro";
    aplicaTema(novo);
    guarda.gravar("tema", novo);
  }

  /* ---------- tamanho da letra ---------- */
  const TAMANHOS = [0.9, 1, 1.12, 1.25, 1.4, 1.6];
  let tam = Math.min(TAMANHOS.length - 1, Math.max(0, parseInt(guarda.ler("tamanho") || "1", 10) || 1));
  function aplicaTamanho() {
    document.documentElement.style.setProperty("--escala", TAMANHOS[tam]);
    guarda.gravar("tamanho", tam);
  }
  aplicaTamanho();
  function mudaTamanho(delta) {
    tam = Math.min(TAMANHOS.length - 1, Math.max(0, tam + delta));
    aplicaTamanho();
  }

  /* ---------- referências "119:105-112" ---------- */
  function parseRef(ref) {
    const m = /^(\d+)(?::(\d+)-(\d+))?$/.exec(String(ref));
    if (!m) return null;
    const n = +m[1];
    if (n < 1 || n > 150) return null;
    const total = window.SALMOS[n - 1].length;
    const ini = m[2] ? Math.max(1, +m[2]) : 1;
    const fim = m[3] ? Math.min(total, +m[3]) : total;
    return { n, ini, fim, parcial: !!m[2] };
  }
  const rotuloRef = (ref) => {
    const r = parseRef(ref);
    if (!r) return String(ref);
    return "Salmo " + r.n + (r.parcial ? "," + r.ini + "-" + r.fim : "");
  };

  /* ---------- renderização de versículos ---------- */
  function renderVersos(caixa, ref) {
    const r = typeof ref === "object" ? ref : parseRef(ref);
    const versos = window.SALMOS[r.n - 1];
    caixa.textContent = "";
    for (let i = r.ini; i <= r.fim; i++) {
      const p = document.createElement("p");
      p.dataset.v = i;
      const s = document.createElement("sup");
      s.textContent = i;
      p.append(s, versos[i - 1]);
      caixa.appendChild(p);
    }
    return r.fim - r.ini + 1;
  }

  /* ---------- dois coros ---------- */
  let coros = guarda.ler("coros") === "1";
  function aplicaCoros(caixa, botao) {
    caixa.classList.toggle("coros", coros);
    if (botao) { botao.setAttribute("aria-pressed", coros); }
  }
  function alternaCoros(caixa, botao) {
    coros = !coros;
    guarda.gravar("coros", coros ? "1" : "0");
    aplicaCoros(caixa, botao);
  }

  /* ---------- leitura em voz alta ---------- */
  const voz = { falando: false, botao: null };
  function escolheVoz() {
    const vozes = speechSynthesis.getVoices();
    return vozes.find((v) => /pt[-_]BR/i.test(v.lang)) || vozes.find((v) => /^pt/i.test(v.lang)) || null;
  }
  function paraVoz() {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    voz.falando = false;
    document.querySelectorAll(".versos p.lendo").forEach((p) => p.classList.remove("lendo"));
    if (voz.botao) { voz.botao.textContent = "🔊 Ouvir"; voz.botao.setAttribute("aria-pressed", "false"); }
  }
  function ouvir(caixa, titulo, botao) {
    if (!("speechSynthesis" in window)) { alert("Seu navegador não oferece leitura em voz alta."); return; }
    if (voz.falando) { paraVoz(); return; }
    voz.falando = true; voz.botao = botao;
    botao.textContent = "⏹ Parar"; botao.setAttribute("aria-pressed", "true");
    const v = escolheVoz();
    const fala = (texto, el, fim) => {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR"; u.rate = 0.92;
      if (v) u.voice = v;
      u.onstart = () => { document.querySelectorAll(".versos p.lendo").forEach((p) => p.classList.remove("lendo")); if (el) el.classList.add("lendo"); };
      if (fim) u.onend = () => paraVoz();
      speechSynthesis.speak(u);
    };
    speechSynthesis.cancel();
    fala(titulo, null);
    const ps = [...caixa.querySelectorAll("p")];
    ps.forEach((p, i) => fala(p.textContent.replace(/^\d+/, ""), p, i === ps.length - 1));
  }
  window.addEventListener("pagehide", paraVoz);

  /* ---------- barra de ferramentas de leitura ---------- */
  function ligaFerramentas(caixa, obterTitulo) {
    const b = (id) => document.getElementById(id);
    if (b("menorLetra")) b("menorLetra").addEventListener("click", () => mudaTamanho(-1));
    if (b("maiorLetra")) b("maiorLetra").addEventListener("click", () => mudaTamanho(1));
    if (b("coros")) { aplicaCoros(caixa, b("coros")); b("coros").addEventListener("click", () => alternaCoros(caixa, b("coros"))); }
    if (b("ouvir")) {
      if (!("speechSynthesis" in window)) b("ouvir").hidden = true;
      else b("ouvir").addEventListener("click", () => ouvir(caixa, obterTitulo(), b("ouvir")));
    }
  }

  /* ---------- cabeçalho comum ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const t = $("btnTema");
    if (t) t.addEventListener("click", alternaTema);
    const pag = document.body.dataset.pagina;
    document.querySelectorAll(".menu a").forEach((a) => { if (a.dataset.pagina === pag) a.setAttribute("aria-current", "page"); });
    if ($("traducao")) $("traducao").textContent = window.TRADUCAO;
  });

  /* ---------- PWA ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  let pedidoInstalar = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pedidoInstalar = e;
    document.querySelectorAll("[data-instalar]").forEach((el) => (el.hidden = false));
  });
  const instalado = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  async function instalar() {
    if (pedidoInstalar) {
      pedidoInstalar.prompt();
      await pedidoInstalar.userChoice.catch(() => {});
      pedidoInstalar = null;
      return "";
    }
    if (ehIOS()) return "No iPhone: toque em Compartilhar (□↑) e depois em “Adicionar à Tela de Início”.";
    return "No menu do navegador (⋮), escolha “Instalar app” ou “Adicionar à tela inicial”.";
  }

  window.Comum = {
    $, guarda, parseRef, rotuloRef, renderVersos, ligaFerramentas, paraVoz, aplicaCoros,
    instalar, instalado, ehIOS,
    escapaRegex: (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    semAcento: (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
  };
})();
