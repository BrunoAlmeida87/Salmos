(function () {
  "use strict";
  const L = window.Liturgia, C = window.Comum, $ = C.$;
  const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const params = new URLSearchParams(location.search);
  let ano = parseInt(params.get("ano"), 10) || new Date().getFullYear();

  function render() {
    $("anoTitulo").textContent = "Calendário " + ano;
    document.title = "Calendário " + ano + " · Salmo do Dia";
    const grade = $("anoGrade");
    grade.textContent = "";
    const comFestas = $("comFestas").checked;
    const hoje = (() => { const n = new Date(); return L.chave(L.utc(n.getFullYear(), n.getMonth(), n.getDate())); })();

    for (let m = 0; m < 12; m++) {
      const box = document.createElement("section");
      box.className = "mini";
      const h = document.createElement("h2");
      h.textContent = maiuscula(L.MESES[m]);
      box.appendChild(h);
      const g = document.createElement("div");
      g.className = "grade";
      ["D", "S", "T", "Q", "Q", "S", "S"].forEach((s) => { const c = document.createElement("div"); c.className = "cab"; c.textContent = s; g.appendChild(c); });
      const primeiro = L.utc(ano, m, 1);
      for (let i = 0; i < primeiro.getUTCDay(); i++) { const v = document.createElement("div"); v.className = "dia vazio"; g.appendChild(v); }
      const dias = new Date(Date.UTC(ano, m + 1, 0)).getUTCDate();
      const festas = [];
      for (let d = 1; d <= dias; d++) {
        const dt = L.utc(ano, m, d);
        const info = L.informacoes(dt);
        const a = document.createElement("a");
        a.href = "./#" + info.chave;
        a.className = "dia" + (info.festaAplicada ? " festa" : "") + (info.chave === hoje ? " hoje" : "");
        a.title = info.titulo + " — Salmo " + info.psalm;
        const n = document.createElement("span"); n.textContent = d;
        const dot = document.createElement("i"); dot.className = "ponto c-" + info.cor;
        const s = document.createElement("small"); s.textContent = "Sl " + info.psalm;
        a.append(n, dot, s);
        g.appendChild(a);
        const solene = info.celebracoes.find((c) => c.aplicada && c.rank !== "M");
        if (solene && !/Oitava da Páscoa/.test(solene.nome)) festas.push([d, solene.nome]);
        else { const cd = info.camps.find((c) => c.psalm && info.razao === c.nome); if (cd) festas.push([d, cd.nome]); }
      }
      box.appendChild(g);
      if (comFestas && festas.length) {
        const ul = document.createElement("ul");
        ul.className = "lista-festas";
        festas.forEach(([d, nome]) => {
          const li = document.createElement("li");
          const b = document.createElement("b"); b.textContent = d;
          li.append(b, nome.split(" · ")[0]);
          ul.appendChild(li);
        });
        box.appendChild(ul);
      }
      grade.appendChild(box);
    }
  }
  function muda(delta) {
    ano += delta;
    history.replaceState(null, "", "?ano=" + ano);
    render();
  }
  $("anoAnt").addEventListener("click", () => muda(-1));
  $("anoProx").addEventListener("click", () => muda(1));
  $("comFestas").addEventListener("change", render);
  $("imprimir").addEventListener("click", () => window.print());
  render();
})();
