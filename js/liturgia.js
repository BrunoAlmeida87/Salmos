/* Calendário litúrgico católico (rito romano, Brasil) e escolha do salmo do dia.
 * Tudo é calculado a partir da data (Páscoa, Advento etc.), então funciona em qualquer ano.
 * Os números dos salmos seguem a numeração hebraica (a das Bíblias católicas atuais no Brasil).
 */
(function () {
  "use strict";

  const DIA = 86400000;
  const utc = (y, m, d) => new Date(Date.UTC(y, m, d));
  const soma = (dt, n) => new Date(dt.getTime() + n * DIA);
  const dif = (a, b) => Math.round((a - b) / DIA);
  const dow = (dt) => dt.getUTCDay();
  const chave = (dt) => dt.toISOString().slice(0, 10);

  const SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  /* ---------- datas-chave ---------- */

  function pascoa(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return utc(y, mes - 1, dia);
  }

  function advento1(y) {
    const v = utc(y, 11, 24);
    const quartoDom = soma(v, -dow(v));
    return soma(quartoDom, -21);
  }

  // No Brasil a Epifania é celebrada no domingo entre 2 e 8 de janeiro.
  function epifania(y) {
    const j2 = utc(y, 0, 2);
    return soma(j2, (7 - dow(j2)) % 7);
  }
  function batismo(y) {
    const e = epifania(y);
    return e.getUTCDate() >= 7 ? soma(e, 1) : soma(e, 7);
  }
  function sagradaFamilia(y) {
    const n = utc(y, 11, 25);
    return dow(n) === 0 ? utc(y, 11, 30) : soma(n, 7 - dow(n));
  }
  function enesimoDia(y, m, diaSemana, n) {
    const primeiro = utc(y, m, 1);
    return soma(primeiro, (7 - dow(primeiro) + diaSemana) % 7 + 7 * (n - 1));
  }
  function domingoMaisProximo(dt) {
    const d = dow(dt);
    return soma(dt, d <= 3 ? -d : 7 - d);
  }

  // Ano litúrgico (A, B, C) do ano que começa no Advento de y.
  const cicloDominical = (yAdvento) => ["A", "B", "C"][yAdvento % 3];

  /* ---------- festas e solenidades ---------- */
  // rank: S solenidade, F festa, M memória. psalm: salmo proposto. cor: cor litúrgica.
  const FIXAS = {
    "0-1": ["Santa Maria, Mãe de Deus · Dia Mundial da Paz", "S", 67, "branco"],
    "0-20": ["São Sebastião", "M", 91, "vermelho"],
    "0-25": ["Conversão de São Paulo", "F", 117, "branco"],
    "1-2": ["Apresentação do Senhor · Dia da Vida Consagrada", "F", 24, "branco"],
    "1-11": ["Nossa Senhora de Lourdes · Dia Mundial do Doente", "M", 30, "branco"],
    "1-22": ["Cátedra de São Pedro", "F", 23, "branco"],
    "2-19": ["São José, esposo de Maria", "S", 112, "branco"],
    "2-25": ["Anunciação do Senhor", "S", 40, "branco"],
    "3-25": ["São Marcos, evangelista", "F", 96, "vermelho"],
    "4-1": ["São José Operário · Dia do Trabalhador", "M", 90, "branco"],
    "4-13": ["Nossa Senhora de Fátima", "M", 113, "branco"],
    "4-31": ["Visitação de Nossa Senhora", "F", 113, "branco"],
    "5-13": ["Santo Antônio de Lisboa", "M", 112, "branco"],
    "5-24": ["Natividade de São João Batista", "S", 139, "branco"],
    "5-29": ["São Pedro e São Paulo, apóstolos", "S", 34, "vermelho"],
    "6-3": ["São Tomé, apóstolo", "F", 117, "vermelho"],
    "6-11": ["São Bento, abade", "M", 34, "branco"],
    "6-16": ["Nossa Senhora do Carmo", "M", 45, "branco"],
    "6-22": ["Santa Maria Madalena", "F", 63, "branco"],
    "6-25": ["São Tiago, apóstolo", "F", 126, "vermelho"],
    "6-26": ["São Joaquim e Sant’Ana", "M", 128, "branco"],
    "7-4": ["São João Maria Vianney · Dia do Padre", "M", 23, "branco"],
    "7-6": ["Transfiguração do Senhor", "F", 97, "branco"],
    "7-10": ["São Lourenço, diácono e mártir", "F", 112, "vermelho"],
    "7-15": ["Assunção de Nossa Senhora", "S", 45, "branco"],
    "7-24": ["São Bartolomeu, apóstolo", "F", 145, "vermelho"],
    "7-28": ["Santo Agostinho", "M", 63, "branco"],
    "8-8": ["Natividade de Nossa Senhora", "F", 13, "branco"],
    "8-14": ["Exaltação da Santa Cruz", "F", 78, "vermelho"],
    "8-15": ["Nossa Senhora das Dores", "M", 31, "branco"],
    "8-21": ["São Mateus, apóstolo e evangelista", "F", 19, "vermelho"],
    "8-27": ["São Vicente de Paulo", "M", 112, "branco"],
    "8-29": ["Santos Arcanjos Miguel, Gabriel e Rafael", "F", 138, "branco"],
    "8-30": ["São Jerônimo · Dia da Bíblia", "M", 1, "branco"],
    "9-1": ["Santa Teresinha do Menino Jesus", "M", 131, "branco"],
    "9-4": ["São Francisco de Assis", "M", 142, "branco"],
    "9-7": ["Nossa Senhora do Rosário", "M", 113, "branco"],
    "9-12": ["Nossa Senhora Aparecida, Padroeira do Brasil", "S", 87, "branco"],
    "9-18": ["São Lucas, evangelista", "F", 145, "vermelho"],
    "9-28": ["São Simão e São Judas, apóstolos", "F", 19, "vermelho"],
    "10-1": ["Todos os Santos", "S", 24, "branco"],
    "10-2": ["Commemoração de todos os Fiéis Defuntos (Finados)", "F", 23, "roxo"],
    "10-9": ["Dedicação da Basílica do Latrão", "F", 46, "branco"],
    "10-30": ["Santo André, apóstolo", "F", 19, "vermelho"],
    "11-3": ["São Francisco Xavier", "M", 117, "branco"],
    "11-8": ["Imaculada Conceição de Nossa Senhora", "S", 98, "branco"],
    "11-13": ["Santa Luzia", "M", 27, "vermelho"],
    "11-25": ["Natal do Senhor", "S", 98, "branco"],
    "11-26": ["Santo Estêvão, primeiro mártir", "F", 31, "vermelho"],
    "11-27": ["São João, apóstolo e evangelista", "F", 97, "branco"],
    "11-28": ["Santos Inocentes, mártires", "F", 124, "vermelho"],
  };

  function festasMoveis(y) {
    const p = pascoa(y);
    const m = {};
    const poe = (dt, nome, rank, psalm, cor, extra) => { m[chave(dt)] = Object.assign({ nome, rank, psalm, cor }, extra || {}); };
    poe(soma(p, -46), "Quarta-feira de Cinzas", "S", 51, "roxo", { privilegiado: true });
    poe(soma(p, -7), "Domingo de Ramos e da Paixão do Senhor", "S", 22, "vermelho", { privilegiado: true });
    poe(soma(p, -6), "Segunda-feira Santa", "S", 27, "roxo", { privilegiado: true });
    poe(soma(p, -5), "Terça-feira Santa", "S", 71, "roxo", { privilegiado: true });
    poe(soma(p, -4), "Quarta-feira Santa", "S", 69, "roxo", { privilegiado: true });
    poe(soma(p, -3), "Quinta-feira Santa · Ceia do Senhor", "S", 116, "branco", { privilegiado: true });
    poe(soma(p, -2), "Sexta-feira da Paixão do Senhor", "S", 31, "vermelho", { privilegiado: true });
    poe(soma(p, -1), "Sábado Santo · Vigília Pascal", "S", 16, "branco", { privilegiado: true });
    poe(p, "Domingo da Páscoa · Ressurreição do Senhor", "S", 118, "branco", { privilegiado: true });
    const oitava = [16, 33, 111, 8, 118, 118];
    ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].forEach((n, i) => {
      poe(soma(p, i + 1), n + (i < 5 ? "-feira" : "") + " na Oitava da Páscoa", "S", oitava[i], "branco", { privilegiado: true });
    });
    poe(soma(p, 7), "2º Domingo da Páscoa · Domingo da Divina Misericórdia", "S", 118, "branco", { privilegiado: true });
    poe(soma(p, 42), "Ascensão do Senhor", "S", 47, "branco", { privilegiado: true });
    poe(soma(p, 49), "Domingo de Pentecostes", "S", 104, "vermelho", { privilegiado: true });
    poe(soma(p, 50), "Nossa Senhora, Mãe da Igreja", "M", 87, "branco");
    poe(soma(p, 56), "Santíssima Trindade", "S", 33, "branco");
    poe(soma(p, 60), "Corpus Christi · Santíssimo Corpo e Sangue de Cristo", "S", 111, "branco");
    poe(soma(p, 68), "Sagrado Coração de Jesus", "S", 103, "branco");
    poe(soma(p, 69), "Imaculado Coração de Maria", "M", 113, "branco");
    const a1 = advento1(y);
    poe(soma(a1, -7), "Nosso Senhor Jesus Cristo, Rei do Universo", "S", 93, "branco");
    poe(epifania(y), "Epifania do Senhor", "S", 72, "branco");
    poe(batismo(y), "Batismo do Senhor", "F", 29, "branco");
    poe(sagradaFamilia(y), "Sagrada Família de Jesus, Maria e José", "F", 128, "branco");
    return m;
  }

  const cacheMoveis = {};
  const moveisDe = (y) => cacheMoveis[y] || (cacheMoveis[y] = festasMoveis(y));

  /* ---------- Campanha da Fraternidade (edite aqui a cada ano) ---------- */
  const CAMPANHA_FRATERNIDADE = {
    2025: { tema: "Fraternidade e Ecologia Integral", lema: "Deus viu que tudo era muito bom (Gn 1,31)" },
    2026: { tema: "Fraternidade e Moradia", lema: "Ele veio morar entre nós (Jo 1,14)" },
  };

  /* ---------- campanhas e dias temáticos ---------- */
  // pool: salmos para os dias comuns do período (só valem em Tempo Comum e Tempo Pascal, fora de domingos).
  // psalm: salmo para um dia específico.
  function campanhas(dt, ctx) {
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate();
    const lista = [];
    const add = (c) => lista.push(c);
    const domingo = dow(dt) === 0;

    if (m === 0 && d >= 18 && d <= 25)
      add({ nome: "Semana de Oração pela Unidade dos Cristãos", desc: "De 18 a 25 de janeiro, rezamos para que todos os que creem em Cristo sejam um só.", pool: [133, 122, 46, 85, 117, 67, 100, 133] });

    if (ctx.estacao === "quaresma") {
      const cf = CAMPANHA_FRATERNIDADE[y];
      add({
        nome: "Campanha da Fraternidade " + y,
        desc: cf
          ? "Tema: " + cf.tema + ". Lema: “" + cf.lema + "”. Quaresma é tempo de oração, jejum e partilha."
          : "Campanha promovida pela CNBB na Quaresma, com tema e lema definidos a cada ano. Tempo de oração, jejum e partilha.",
      });
    }
    if (ctx.estacao === "pascal" && domingo && dif(dt, ctx.pascoa) === 28)
      add({ nome: "Dia Mundial de Oração pelas Vocações", desc: "Domingo do Bom Pastor: rezamos pelas vocações sacerdotais, religiosas e leigas." });

    if (m === 4) {
      add({ nome: "Maio, mês de Maria", desc: "Mês dedicado a Nossa Senhora, com terço e coroação nas comunidades.", pool: [45, 113, 87, 131, 121, 98, 123] });
      if (domingo && d >= 8 && d <= 14) add({ nome: "Dia das Mães", desc: "Damos graças a Deus pela vida das mães e pedimos a bênção sobre elas.", psalm: 113 });
    }
    if (m === 5 && ctx.estacao !== "quaresma")
      add({ nome: "Junho, mês do Sagrado Coração", desc: "Mês da devoção ao Coração de Jesus, e tempo de festas juninas nas comunidades.", pool: [103, 23, 33, 34, 36, 145] });
    if (m === 6) {
      const avos = domingoMaisProximo(utc(y, 6, 26));
      if (chave(dt) === chave(avos))
        add({ nome: "Dia Mundial dos Avós e Idosos", desc: "Domingo próximo à memória de São Joaquim e Sant’Ana: gratidão e atenção aos avós e idosos.", psalm: 92 });
      add({ nome: "Julho, mês do Preciosíssimo Sangue", desc: "Tradicionalmente dedicado à devoção ao Sangue de Cristo.", pool: [116, 22, 51, 130, 103, 40] });
    }
    if (m === 7) {
      add({ nome: "Agosto, mês vocacional", desc: "Mês de oração pelas vocações: ministério ordenado, vida consagrada, família, catequese e leigos.", pool: [40, 16, 23, 100, 116, 139, 84, 27] });
      if (domingo && d >= 8 && d <= 14) add({ nome: "Dia dos Pais", desc: "Rezamos pelos pais e pela paternidade responsável, a começar pelo exemplo de São José.", psalm: 128 });
      const pais = enesimoDia(y, 7, 0, 2);
      const df = dif(dt, pais);
      if (df >= 0 && df <= 6)
        add({ nome: "Semana Nacional da Família", desc: "Semana dedicada a rezar e refletir sobre a vocação e a missão da família.", pool: [127, 128, 133, 131, 112, 25, 34] });
    }
    if (m === 8) {
      add({ nome: "Setembro, mês da Bíblia", desc: "Mês dedicado ao estudo e à oração com a Palavra de Deus, que termina em 30/09, memória de São Jerônimo.", pool: [1, 19, 12, 33, 147, 111, 25, 119] });
      add({ nome: "Tempo da Criação", desc: "De 1º de setembro a 4 de outubro: cuidado com a casa comum.", sec: true });
    }
    if (m === 9 && d <= 4) add({ nome: "Tempo da Criação", desc: "Até 4 de outubro, memória de São Francisco: cuidado com a casa comum.", sec: true });
    if (m === 9) {
      add({ nome: "Outubro, mês missionário e do Rosário", desc: "Mês de oração e partilha pelas missões e de devoção ao Santo Rosário.", pool: [67, 96, 117, 98, 100, 19, 113, 126] });
      if (d <= 8) add({ nome: "Semana Nacional da Vida", desc: "De 1º a 8 de outubro: defesa e promoção da vida em todas as suas fases.", sec: true });
      const fimOut = utc(y, 9, 31);
      const ult = soma(fimOut, -dow(fimOut));
      if (domingo && chave(dt) === chave(soma(ult, -7)))
        add({ nome: "Dia Mundial das Missões", desc: "Penúltimo domingo de outubro: oração e coleta em favor das missões em todo o mundo.", psalm: 96 });
      if (domingo && chave(dt) === chave(ult))
        add({ nome: "Dia Nacional da Juventude (DNJ)", desc: "Último domingo de outubro: a Igreja reza e se reúne com os jovens.", psalm: 71 });
    }
    if (m === 10 && domingo && chave(dt) === chave(soma(ctx.advento1, -14)))
      add({ nome: "Dia Mundial dos Pobres", desc: "33º Domingo do Tempo Comum: a Igreja convida a olhar e servir os pobres.", psalm: 41 });
    if (m === 10 && dow(dt) === 4 && chave(dt) === chave(enesimoDia(y, 10, 4, 4)))
      add({ nome: "Dia de Ação de Graças", desc: "Quarta quinta-feira de novembro: um dia para agradecer a Deus por todos os dons.", psalm: 100 });
    if (ctx.estacao === "comum" && domingo && ctx.numSemana === 3)
      add({ nome: "Domingo da Palavra de Deus", desc: "3º Domingo do Tempo Comum, dedicado à celebração e divulgação da Bíblia.", psalm: 19 });
    return lista;
  }

  /* ---------- salmos por estação ---------- */
  const POOL = {
    advento: [25, 80, 85, 122, 126, 130, 24, 27, 40, 146, 123, 62, 63, 72],
    natal: [98, 96, 97, 2, 110, 148, 117, 67, 29, 147],
    quaresma: [51, 25, 130, 32, 6, 38, 102, 143, 91, 42, 43, 27, 31, 86, 90, 116, 126, 139, 4, 77],
    pascal: [118, 66, 98, 100, 33, 47, 103, 111, 136, 145, 148, 149, 150, 23, 30, 92, 16, 4, 67, 8, 97, 113, 117, 146, 138],
    comum: [1, 8, 11, 12, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 29, 30, 32, 33, 34, 36, 40, 41, 42, 43, 45, 46, 47, 48, 49, 57, 61, 62, 63, 65, 66, 67, 84, 85, 86, 91, 92, 93, 95, 96, 97, 98, 99, 100, 103, 111, 112, 113, 114, 115, 116, 117, 121, 122, 123, 125, 126, 127, 128, 130, 131, 133, 134, 138, 139, 145, 146, 147, 148, 149, 150],
  };
  const ADV_DOMINGOS = [80, 85, 126, 24];
  const QUA_DOMINGOS = [25, 116, 19, 122, 51];
  const PAS_DOMINGOS = [118, 118, 4, 23, 100, 98, 47];
  const NATAL_DIAS = { "12-29": 96, "12-30": 128, "12-31": 90 };
  const ADV_FINAL = [72, 25, 85, 24, 40, 80, 122, 89]; // 17 a 24 de dezembro

  function mdc(a, b) { return b ? mdc(b, a % b) : a; }
  function escolhe(pool, n) {
    let passo = 7;
    while (mdc(passo, pool.length) !== 1) passo++;
    return pool[((n * passo) % pool.length + pool.length) % pool.length];
  }

  const ordinal = (n, fem) => n + (fem ? "ª" : "º");

  /* ---------- função principal ---------- */
  function informacoes(dt) {
    const y = dt.getUTCFullYear();
    const nomeDia = SEMANA[dow(dt)];
    const domingo = dow(dt) === 0;
    const k = chave(dt);
    const p = pascoa(y);
    const a1 = advento1(y);
    const natalAnterior = utc(y - 1, 11, 25);
    const batis = batismo(y);
    const cinzas = soma(p, -46);
    const pentecostes = soma(p, 49);

    let estacao, cor, titulo, psalmBase, indiceEstacao, numSemana = 0, motivo;

    if (dt >= a1) {
      if (dt >= utc(y, 11, 25)) {
        estacao = "natal"; cor = "branco";
        indiceEstacao = dif(dt, utc(y, 11, 25));
        titulo = domingo ? "Domingo do Tempo do Natal" : nomeDia + " no Tempo do Natal";
      } else {
        estacao = "advento"; cor = "roxo";
        const sem = Math.floor(dif(dt, a1) / 7) + 1;
        numSemana = sem; indiceEstacao = dif(dt, a1);
        titulo = domingo ? ordinal(sem) + " Domingo do Advento" : nomeDia + " da " + ordinal(sem, true) + " semana do Advento";
        if (domingo && sem === 3) cor = "rosa";
        if (domingo) psalmBase = ADV_DOMINGOS[sem - 1];
        else if (dt.getUTCMonth() === 11 && dt.getUTCDate() >= 17) psalmBase = ADV_FINAL[dt.getUTCDate() - 17];
      }
    } else if (dt <= batis) {
      estacao = "natal"; cor = "branco";
      indiceEstacao = dif(dt, natalAnterior);
      titulo = domingo ? "Domingo do Tempo do Natal" : nomeDia + " no Tempo do Natal";
    } else if (dt < cinzas) {
      estacao = "comum"; cor = "verde";
      const dom0 = soma(batis, -dow(batis));
      numSemana = 1 + dif(soma(dt, -dow(dt)), dom0) / 7;
      indiceEstacao = dif(dt, batis);
      titulo = domingo ? ordinal(numSemana) + " Domingo do Tempo Comum" : nomeDia + " da " + ordinal(numSemana, true) + " semana do Tempo Comum";
    } else if (dt < p) {
      estacao = "quaresma"; cor = "roxo";
      indiceEstacao = dif(dt, cinzas);
      const primDom = soma(cinzas, 4);
      if (dt < primDom) titulo = nomeDia + " depois das Cinzas";
      else {
        const sem = Math.floor(dif(dt, primDom) / 7) + 1;
        numSemana = sem;
        titulo = domingo ? ordinal(sem) + " Domingo da Quaresma" : nomeDia + " da " + ordinal(sem, true) + " semana da Quaresma";
        if (domingo && sem === 4) cor = "rosa";
        if (domingo && sem <= 5) psalmBase = QUA_DOMINGOS[sem - 1];
      }
      if (dt.getTime() === soma(cinzas, 1).getTime()) psalmBase = 1;
      if (dt.getTime() === soma(cinzas, 2).getTime()) psalmBase = 51;
      if (dt.getTime() === soma(cinzas, 3).getTime()) psalmBase = 86;
    } else if (dt <= pentecostes) {
      estacao = "pascal"; cor = "branco";
      indiceEstacao = dif(dt, p);
      const sem = Math.floor(dif(dt, p) / 7) + 1;
      numSemana = sem;
      titulo = nomeDia + " da " + ordinal(sem, true) + " semana da Páscoa";
      if (domingo) {
        const n = dif(dt, p) / 7 + 1; // 1 = Páscoa
        titulo = n === 1 ? "Domingo da Páscoa" : ordinal(n) + " Domingo da Páscoa";
        psalmBase = PAS_DOMINGOS[n - 1];
      }
    } else {
      estacao = "comum"; cor = "verde";
      const sundayA1 = soma(a1, -7);
      numSemana = 34 - dif(sundayA1, soma(dt, -dow(dt))) / 7;
      indiceEstacao = dif(dt, pentecostes);
      titulo = domingo ? ordinal(numSemana) + " Domingo do Tempo Comum" : nomeDia + " da " + ordinal(numSemana, true) + " semana do Tempo Comum";
    }

    const nomesEstacao = { advento: "Advento", natal: "Tempo do Natal", comum: "Tempo Comum", quaresma: "Quaresma", pascal: "Tempo Pascal" };
    const ctx = { estacao, numSemana, pascoa: p, advento1: a1 };
    const camps = campanhas(dt, ctx);

    // festa do dia?
    let festa = null;
    const fx = FIXAS[dt.getUTCMonth() + "-" + dt.getUTCDate()];
    const mv = moveisDe(y)[k];
    if (mv) festa = mv;
    else if (fx) festa = { nome: fx[0], rank: fx[1], psalm: fx[2], cor: fx[3] };
    // Solenidade fixa que cai em dia privilegiado (ex.: Domingo de Ramos): só informativa.
    const fxInfo = fx && mv ? { nome: fx[0] } : null;

    const privilegiadoSemFesta = (estacao === "advento" || estacao === "quaresma" || estacao === "pascal") && domingo;
    const semanaSanta = dt >= soma(p, -7) && dt < p;
    let aplicaFesta = false;
    if (festa) {
      if (festa.privilegiado) aplicaFesta = true;
      else if (festa.rank === "S") aplicaFesta = !privilegiadoSemFesta && !semanaSanta;
      else if (festa.rank === "F") aplicaFesta = !privilegiadoSemFesta && estacao !== "quaresma" && !semanaSanta;
      else aplicaFesta = !domingo && (estacao === "comum" || estacao === "pascal");
      if (estacao === "quaresma" && (k === chave(utc(y, 2, 19)) || k === chave(utc(y, 2, 25))) && !semanaSanta && !domingo) aplicaFesta = true;
    }
    const cabecalho = festa && aplicaFesta && festa.rank !== "M" ? festa.nome : null;
    if (festa && aplicaFesta) {
      cor = festa.cor || cor;
      if (festa.rank !== "M") titulo = festa.nome;
    }

    // escolha do salmo
    let psalm, razao;
    const campDia = camps.find((c) => c.psalm);
    const campPool = camps.find((c) => c.pool);
    if (festa && aplicaFesta) {
      psalm = festa.psalm;
      razao = festa.nome;
    } else if (campDia) {
      psalm = campDia.psalm; razao = campDia.nome;
    } else if (psalmBase) {
      psalm = psalmBase; razao = nomesEstacao[estacao] + (domingo ? " (salmo do domingo)" : "");
    } else if (estacao === "natal" && NATAL_DIAS[(dt.getUTCMonth() + 1) + "-" + dt.getUTCDate()] && dt.getUTCMonth() === 11) {
      psalm = NATAL_DIAS[(dt.getUTCMonth() + 1) + "-" + dt.getUTCDate()]; razao = "Oitava do Natal";
    } else if (campPool && !domingo && (estacao === "comum" || estacao === "pascal")) {
      psalm = escolhe(campPool.pool, dt.getUTCDate() + 3 * dt.getUTCMonth()); razao = campPool.nome;
    } else {
      psalm = escolhe(POOL[estacao], indiceEstacao + y); razao = nomesEstacao[estacao];
    }

    // memória "informativa" (quando não aplicada) entra como chip
    const celebracoes = [];
    if (festa) celebracoes.push({ nome: festa.nome, rank: festa.rank });
    if (fxInfo) celebracoes.push({ nome: fxInfo.nome, rank: "F" });

    return {
      data: dt, chave: k,
      titulo, cabecalho,
      estacao, nomeEstacao: nomesEstacao[estacao], cor, numSemana,
      ano: cicloDominical(dt >= a1 ? y : y - 1),
      psalm, razao, camps, celebracoes, festaAplicada: !!(festa && aplicaFesta),
    };
  }

  const NOMES_COR = { verde: "Verde", roxo: "Roxo", branco: "Branco", vermelho: "Vermelho", rosa: "Rosa" };

  window.Liturgia = { informacoes, utc, soma, chave, SEMANA, MESES, NOMES_COR, pascoa, advento1 };
})();
