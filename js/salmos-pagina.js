(function () {
  "use strict";
  const C = window.Comum, $ = C.$;
  const S = window.SALMOS;

  // índice sem acentos para a busca
  const INDICE = S.map((versos) => versos.map((v) => C.semAcento(v)));

  /* ---------- lista e busca ---------- */
  const lista = $("lista");
  for (let n = 1; n <= 150; n++) {
    const a = document.createElement("a");
    a.href = "#" + n;
    a.textContent = n;
    a.setAttribute("aria-label", "Salmo " + n);
    lista.appendChild(a);
  }

  function destaca(texto, termo) {
    // devolve nós de texto com <mark> nos trechos encontrados (sem acento / sem caixa)
    const frag = document.createDocumentFragment();
    const base = C.semAcento(texto);
    let i = 0, pos;
    while (termo && (pos = base.indexOf(termo, i)) !== -1) {
      frag.append(texto.slice(i, pos));
      const m = document.createElement("mark");
      m.textContent = texto.slice(pos, pos + termo.length);
      frag.append(m);
      i = pos + termo.length;
    }
    frag.append(texto.slice(i));
    return frag;
  }

  function busca() {
    const bruto = $("busca").value.trim();
    const termo = C.semAcento(bruto);
    const res = $("resultados");
    res.textContent = "";
    $("contagem").textContent = "";
    lista.hidden = !!termo;
    if (!termo) return;

    const num = /^(\d{1,3})(?:[,:.](\d+))?$/.exec(termo);
    if (num && +num[1] >= 1 && +num[1] <= 150) {
      const a = document.createElement("a");
      a.className = "resultado";
      a.href = "#" + num[1];
      const b = document.createElement("b"); b.textContent = "Salmo " + num[1];
      a.append(b, " — " + S[+num[1] - 1][0]);
      res.appendChild(a);
      return;
    }
    if (termo.length < 3) { $("contagem").textContent = "Digite pelo menos 3 letras."; return; }

    const achados = [];
    INDICE.forEach((versos, si) => versos.forEach((v, vi) => { if (v.includes(termo)) achados.push([si, vi]); }));
    $("contagem").textContent = achados.length
      ? achados.length + (achados.length === 1 ? " versículo encontrado" : " versículos encontrados") + (achados.length > 80 ? " (mostrando 80)" : "")
      : "Nada encontrado. Tente outra palavra.";
    achados.slice(0, 80).forEach(([si, vi]) => {
      const a = document.createElement("a");
      a.className = "resultado";
      a.href = "#" + (si + 1) + ":" + (vi + 1) + "-" + (vi + 1);
      const b = document.createElement("b"); b.textContent = "Sl " + (si + 1) + "," + (vi + 1);
      a.append(b, " ", destaca(S[si][vi], termo));
      res.appendChild(a);
    });
  }
  let espera;
  $("busca").addEventListener("input", () => { clearTimeout(espera); espera = setTimeout(busca, 150); });

  /* ---------- leitor ---------- */
  let atual = null;
  C.ligaFerramentas($("versos"), () => (atual ? C.rotuloRef(atual.ref) : ""));

  function abre(ref) {
    C.paraVoz();
    const r = C.parseRef(ref);
    if (!r) { mostraIndice(); return; }
    atual = { ref, r };
    $("indice").hidden = true;
    $("leitor").hidden = false;
    const trecho = r.parcial && !(r.ini === 1 && r.fim === S[r.n - 1].length);
    $("leitorTitulo").textContent = "Salmo " + r.n + (trecho ? (r.ini === r.fim ? "," + r.ini : "," + r.ini + "-" + r.fim) : "");
    $("leitorSub").textContent = S[r.n - 1].length + " versículos";
    C.renderVersos($("versos"), r);
    $("verInteiro").hidden = !trecho;
    if (trecho) { const a = $("verInteiro").querySelector("a"); a.href = "#" + r.n; a.textContent = "Ler o salmo " + r.n + " inteiro"; }
    $("anterior").href = "#" + (r.n > 1 ? r.n - 1 : 150);
    $("seguinte").href = "#" + (r.n < 150 ? r.n + 1 : 1);
    document.title = "Salmo " + r.n + " · Salmo do Dia";
    $("aviso").textContent = "";
    window.scrollTo(0, 0);
  }
  function mostraIndice() {
    C.paraVoz();
    atual = null;
    $("leitor").hidden = true;
    $("indice").hidden = false;
    document.title = "Todos os Salmos";
  }
  function rota() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h) abre(h); else mostraIndice();
  }
  window.addEventListener("hashchange", rota);
  $("voltar").addEventListener("click", (e) => { e.preventDefault(); history.pushState(null, "", location.pathname); rota(); });

  $("compartilhar").addEventListener("click", async () => {
    if (!atual) return;
    const titulo = $("leitorTitulo").textContent;
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: titulo, text: titulo + " — " + S[atual.r.n - 1][atual.r.ini - 1], url }); return; }
      await navigator.clipboard.writeText(titulo + "\n" + url);
      $("aviso").textContent = "Link copiado!";
    } catch (e) { if (e && e.name !== "AbortError") $("aviso").textContent = url; }
  });

  rota();
})();
