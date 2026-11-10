(function () {
  "use strict";
  const L = window.Liturgia, C = window.Comum, $ = C.$;
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
  const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  let atual = deChave(location.hash.slice(1)) || hojeLocal();
  let mesExibido = L.utc(atual.getUTCFullYear(), atual.getUTCMonth(), 1);
  let infoAtual = null;

  /* ---------- renderização ---------- */
  const setCor = (el, cor) => el.style.setProperty("--lit", "var(--c-" + cor + ")");

  function itemCampanha(nome, desc, classe) {
    const div = document.createElement("div");
    div.className = "camp" + (classe ? " " + classe : "");
    const h = document.createElement("h3"); h.textContent = nome;
    div.appendChild(h);
    if (desc) { const p = document.createElement("p"); p.textContent = desc; div.appendChild(p); }
    return div;
  }

  function linkSalmo(ref) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "salmos.html#" + ref;
    a.textContent = C.rotuloRef(ref);
    li.appendChild(a);
    return li;
  }

  function render() {
    C.paraVoz();
    const info = L.informacoes(atual);
    infoAtual = info;
    setCor($("cartao"), info.cor);

    $("dataExtenso").textContent = L.SEMANA[atual.getUTCDay()] + ", " + extenso(atual);
    $("titulo").textContent = info.titulo;
    $("cor").querySelector("span").textContent = "Cor litúrgica: " + L.NOMES_COR[info.cor].toLowerCase();
    $("estacao").textContent = info.nomeEstacao;
    $("ano").textContent = "Ano " + info.ano;

    const dest = window.Conteudo.versiculoDestaque(info.psalm);
    $("destaqueTexto").textContent = dest.texto;
    $("destaqueRef").textContent = "Salmo " + info.psalm + "," + dest.numero;

    $("numSalmo").textContent = "Salmo " + info.psalm;
    $("porque").textContent = "Escolhido para hoje: " + info.razao;

    const box = $("versos");
    const total = C.renderVersos(box, String(info.psalm));
    const dp = box.querySelector('p[data-v="' + dest.numero + '"]');
    if (dp) dp.classList.add("marcado");
    const longo = total > LIMITE_RECOLHER;
    box.classList.toggle("recolhido", longo);
    $("expandir").hidden = !longo;
    $("expandir").textContent = "Ler salmo completo (" + total + " versículos)";

    const ref = window.Conteudo.reflexaoDoDia(info);
    $("reflexao").textContent = ref.texto;
    $("oracao").textContent = ref.oracao;

    // celebrações, santos e campanhas
    const camps = $("campanhas");
    camps.textContent = "";
    info.celebracoes.forEach((c) => {
      if (c.nome === info.titulo) return;
      const tipo = c.rank === "S" ? "Solenidade" : c.rank === "M" ? "Memória" : "Festa";
      camps.appendChild(itemCampanha(c.nome, c.aplicada ? tipo : tipo + " (neste ano, cede lugar à celebração do dia)"));
    });
    if (info.santos.length) camps.appendChild(itemCampanha("Santos do dia", info.santos.join(" · "), "santos"));
    info.camps.forEach((c) => camps.appendChild(itemCampanha(c.nome, c.desc, c.local ? "local" : "")));
    camps.hidden = !camps.children.length;

    // Liturgia das Horas
    const h = info.horas;
    $("horas").hidden = !h;
    if (h) {
      $("horasSemana").textContent = "Saltério: semana " + h.romano;
      $("laudes").textContent = ""; $("vesperas").textContent = "";
      h.laudes.forEach((r) => $("laudes").appendChild(linkSalmo(r)));
      h.vesperas.forEach((r) => $("vesperas").appendChild(linkSalmo(r)));
      $("vespTit").innerHTML = h.primeirasVesperas ? "I Vésperas do domingo <small>(tarde)</small>" : "Vésperas <small>(tarde)</small>";
    }

    $("seletor").value = L.chave(atual);
    document.title = "Salmo " + info.psalm + " · " + info.titulo;
    if (location.hash.slice(1) !== L.chave(atual)) history.replaceState(null, "", "#" + L.chave(atual));
    $("aviso").textContent = "";
    renderMes();
  }

  function renderMes() {
    const y = mesExibido.getUTCFullYear(), m = mesExibido.getUTCMonth();
    $("mesTitulo").textContent = maiuscula(L.MESES[m]) + " de " + y;
    const grade = $("grade");
    grade.textContent = "";
    ["D", "S", "T", "Q", "Q", "S", "S"].forEach((s) => {
      const c = document.createElement("div"); c.className = "cab"; c.textContent = s; c.setAttribute("aria-hidden", "true"); grade.appendChild(c);
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
      b.className = "dia" + (L.chave(dt) === hoje ? " hoje" : "") + (L.chave(dt) === sel ? " sel" : "") + (info.festaAplicada ? " festa" : "");
      b.setAttribute("aria-label", d + " de " + L.MESES[m] + ": Salmo " + info.psalm + ", " + info.titulo);
      const n = document.createElement("span"); n.textContent = d;
      const dot = document.createElement("i"); dot.className = "ponto c-" + info.cor;
      const s = document.createElement("small"); s.textContent = "Sl " + info.psalm;
      b.append(n, dot, s);
      b.addEventListener("click", () => { atual = dt; render(); window.scrollTo({ top: 0, behavior: "smooth" }); });
      grade.appendChild(b);
    }
  }

  /* ---------- navegação ---------- */
  function irPara(d) {
    atual = d;
    mesExibido = L.utc(d.getUTCFullYear(), d.getUTCMonth(), 1);
    render();
  }
  $("ant").addEventListener("click", () => irPara(L.soma(atual, -1)));
  $("prox").addEventListener("click", () => irPara(L.soma(atual, 1)));
  $("hoje").addEventListener("click", () => irPara(hojeLocal()));
  $("seletor").addEventListener("change", (e) => { const d = deChave(e.target.value); if (d) irPara(d); });
  $("mesAnt").addEventListener("click", () => { mesExibido = L.utc(mesExibido.getUTCFullYear(), mesExibido.getUTCMonth() - 1, 1); renderMes(); });
  $("mesProx").addEventListener("click", () => { mesExibido = L.utc(mesExibido.getUTCFullYear(), mesExibido.getUTCMonth() + 1, 1); renderMes(); });
  $("expandir").addEventListener("click", () => {
    const box = $("versos");
    const recolhido = box.classList.toggle("recolhido");
    $("expandir").textContent = recolhido ? "Ler salmo completo (" + box.children.length + " versículos)" : "Recolher";
  });
  window.addEventListener("hashchange", () => {
    const d = deChave(location.hash.slice(1));
    if (d && L.chave(d) !== L.chave(atual)) irPara(d);
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft") irPara(L.soma(atual, -1));
    if (e.key === "ArrowRight") irPara(L.soma(atual, 1));
  });
  // Ao voltar para o app aberto num dia seguinte, atualiza para hoje
  let ultimoHoje = L.chave(hojeLocal());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const h = L.chave(hojeLocal());
    if (h !== ultimoHoje) { const estavaEmHoje = L.chave(atual) === ultimoHoje; ultimoHoje = h; if (estavaEmHoje) irPara(hojeLocal()); else renderMes(); }
  });

  C.ligaFerramentas($("versos"), () => "Salmo " + infoAtual.psalm);

  /* ---------- compartilhar ---------- */
  const aviso = (t) => { $("aviso").textContent = t; };
  $("compartilhar").addEventListener("click", async () => {
    const info = infoAtual;
    const dest = window.Conteudo.versiculoDestaque(info.psalm);
    const texto = "“" + dest.texto + "” (Sl " + info.psalm + "," + dest.numero + ")\n" + info.titulo + " — " + extenso(atual);
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: "Salmo do Dia", text: texto, url }); return; }
      await navigator.clipboard.writeText(texto + "\n" + url);
      aviso("Texto e link copiados!");
    } catch (e) { if (e && e.name !== "AbortError") aviso(url); }
  });
  $("imagem").addEventListener("click", async () => {
    const info = infoAtual;
    const dest = window.Conteudo.versiculoDestaque(info.psalm);
    aviso("Gerando imagem…");
    const r = await window.Cartao.compartilhar({
      texto: dest.texto,
      referencia: "Salmo " + info.psalm + "," + dest.numero,
      titulo: info.titulo,
      data: L.SEMANA[atual.getUTCDay()] + ", " + extenso(atual),
      cor: info.cor,
    }, "salmo-" + info.chave + ".png");
    aviso(r === "baixado" ? "Imagem salva. Agora é só enviar pelo WhatsApp ou postar." : "");
  });

  /* ---------- instalar e lembrete ---------- */
  if (C.instalado()) $("instalar").closest("div").hidden = true;
  $("instalar").addEventListener("click", async () => { $("instalarAviso").textContent = await C.instalar(); });

  $("lembrete").addEventListener("click", () => {
    const [hh, mm] = ($("horaLembrete").value || "07:00").split(":");
    const n = new Date();
    const p2 = (x) => String(x).padStart(2, "0");
    const dataIni = n.getFullYear() + p2(n.getMonth() + 1) + p2(n.getDate());
    const carimbo = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const site = location.origin + location.pathname.replace(/index\.html$/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Salmo do Dia//PT-BR", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:salmo-do-dia-" + carimbo + "@salmo-do-dia",
      "DTSTAMP:" + carimbo,
      "DTSTART:" + dataIni + "T" + p2(hh) + p2(mm) + "00",
      "DURATION:PT10M",
      "RRULE:FREQ=DAILY",
      "SUMMARY:✝ Salmo do Dia",
      "DESCRIPTION:Hora de rezar o salmo de hoje: " + site,
      "URL:" + site,
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Salmo do Dia", "TRIGGER:PT0M", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lembrete-salmo-do-dia.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    $("lembreteAviso").textContent = "Abra o arquivo baixado para adicionar o lembrete diário à sua agenda.";
  });

  render();
})();
