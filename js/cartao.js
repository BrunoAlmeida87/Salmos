/* Gera uma imagem (1080×1350, formato de post) com o versículo do dia, para WhatsApp/Instagram. */
(function () {
  "use strict";

  const CORES = {
    verde: ["#24543a", "#3f7d4e"],
    roxo: ["#3b2657", "#6b4a8e"],
    branco: ["#7a5c1e", "#c4a24c"],
    vermelho: ["#6e1a16", "#b3362d"],
    rosa: ["#8a3653", "#d0708f"],
  };
  const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  function quebraLinhas(ctx, texto, largura) {
    const palavras = texto.split(/\s+/);
    const linhas = [];
    let linha = "";
    palavras.forEach((p) => {
      const teste = linha ? linha + " " + p : p;
      if (ctx.measureText(teste).width > largura && linha) { linhas.push(linha); linha = p; }
      else linha = teste;
    });
    if (linha) linhas.push(linha);
    return linhas;
  }

  function desenha({ texto, referencia, titulo, data, cor }) {
    const W = 1080, H = 1350, M = 96;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const [escuro, claro] = CORES[cor] || CORES.verde;

    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, escuro); g.addColorStop(1, claro);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // moldura e cruz
    ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.fillRect(W / 2 - 6, 110, 12, 70); ctx.fillRect(W / 2 - 28, 128, 56, 12);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = "500 30px " + SANS;
    ctx.fillText(data.toUpperCase(), W / 2, 240);
    ctx.font = "italic 34px " + SERIF;
    quebraLinhas(ctx, titulo, W - 2 * M).slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 290 + i * 44));

    // versículo: escolhe o maior tamanho de fonte que caiba
    const topo = 420, base = H - 300;
    let tam = 72, linhas;
    do {
      ctx.font = "500 " + tam + "px " + SERIF;
      linhas = quebraLinhas(ctx, "“" + texto + "”", W - 2 * M);
      tam -= 2;
    } while (linhas.length * tam * 1.38 > base - topo && tam > 30);
    tam += 2;
    const alt = tam * 1.38;
    let y = topo + (base - topo - linhas.length * alt) / 2 + tam;
    ctx.fillStyle = "#fff";
    linhas.forEach((l) => { ctx.fillText(l, W / 2, y); y += alt; });

    ctx.font = "600 40px " + SANS;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.fillText(referencia, W / 2, H - 220);

    ctx.font = "500 28px " + SANS;
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText("✝ Salmo do Dia · " + location.host + location.pathname.replace(/index\.html$/, ""), W / 2, H - 110);
    return c;
  }

  async function compartilhar(dados, nomeArquivo) {
    const canvas = desenha(dados);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const arquivo = new File([blob], nomeArquivo, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try { await navigator.share({ files: [arquivo], title: "Salmo do Dia" }); return "compartilhado"; }
      catch (e) { if (e.name === "AbortError") return "cancelado"; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return "baixado";
  }

  window.Cartao = { desenha, compartilhar };
})();
