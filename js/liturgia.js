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
  const md = (dt) => dt.getUTCMonth() + "-" + dt.getUTCDate();

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
    return soma(v, -dow(v) - 21);
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
  const domingoEmOuDepois = (dt) => soma(dt, (7 - dow(dt)) % 7);
  function domingoMaisProximo(dt) {
    const d = dow(dt);
    return soma(dt, d <= 3 ? -d : 7 - d);
  }

  // Ano litúrgico (A, B, C) do ano que começa no Advento de y.
  const cicloDominical = (yAdvento) => ["A", "B", "C"][yAdvento % 3];

  /* ---------- solenidades, festas e memórias com salmo próprio ----------
   * rank: S solenidade · FS festa do Senhor (pode ocupar domingo do Tempo Comum) · F festa · M memória.
   * As três solenidades transferidas para o domingo no Brasil (Pedro e Paulo, Assunção, Todos os Santos)
   * e as que mudam de data quando caem em dias privilegiados são tratadas em festasDoAno().
   */
  const FIXAS = {
    "0-1": ["Santa Maria, Mãe de Deus · Dia Mundial da Paz", "S", 67, "branco"],
    "0-20": ["São Sebastião, mártir", "M", 91, "vermelho"],
    "0-25": ["Conversão de São Paulo", "F", 117, "branco"],
    "1-2": ["Apresentação do Senhor · Dia da Vida Consagrada", "FS", 24, "branco"],
    "1-11": ["Nossa Senhora de Lourdes · Dia Mundial do Doente", "M", 30, "branco"],
    "1-22": ["Cátedra de São Pedro", "F", 23, "branco"],
    "2-19": ["São José, esposo de Maria", "S", 112, "branco"],
    "2-25": ["Anunciação do Senhor", "S", 40, "branco"],
    "3-25": ["São Marcos, evangelista", "F", 96, "vermelho"],
    "4-1": ["São José Operário · Dia do Trabalhador", "M", 90, "branco"],
    "4-3": ["São Filipe e São Tiago, apóstolos", "F", 19, "vermelho"],
    "4-13": ["Nossa Senhora de Fátima", "M", 45, "branco"],
    "4-14": ["São Matias, apóstolo", "F", 16, "vermelho"],
    "4-31": ["Visitação de Nossa Senhora", "F", 113, "branco"],
    "5-9": ["São José de Anchieta, presbítero", "M", 96, "branco"],
    "5-13": ["Santo Antônio de Lisboa", "M", 112, "branco"],
    "5-24": ["Natividade de São João Batista", "S", 139, "branco"],
    "5-29": ["São Pedro e São Paulo, apóstolos", "S", 34, "vermelho"],
    "6-3": ["São Tomé, apóstolo", "F", 117, "vermelho"],
    "6-9": ["Santa Paulina do Coração Agonizante de Jesus", "M", 131, "branco"],
    "6-11": ["São Bento, abade", "M", 34, "branco"],
    "6-16": ["Nossa Senhora do Carmo", "M", 45, "branco"],
    "6-22": ["Santa Maria Madalena", "F", 63, "branco"],
    "6-25": ["São Tiago, apóstolo", "F", 126, "vermelho"],
    "6-26": ["São Joaquim e Sant’Ana", "M", 128, "branco"],
    "6-29": ["Santa Marta, Santa Maria e São Lázaro", "M", 34, "branco"],
    "7-4": ["São João Maria Vianney · Dia do Padre", "M", 23, "branco"],
    "7-6": ["Transfiguração do Senhor", "FS", 97, "branco"],
    "7-10": ["São Lourenço, diácono e mártir", "F", 112, "vermelho"],
    "7-13": ["Santa Dulce dos Pobres", "M", 41, "branco"],
    "7-15": ["Assunção de Nossa Senhora", "S", 45, "branco"],
    "7-22": ["Nossa Senhora Rainha", "M", 113, "branco"],
    "7-24": ["São Bartolomeu, apóstolo", "F", 145, "vermelho"],
    "7-28": ["Santo Agostinho", "M", 63, "branco"],
    "7-29": ["Martírio de São João Batista", "M", 71, "vermelho"],
    "8-8": ["Natividade de Nossa Senhora", "F", 13, "branco"],
    "8-14": ["Exaltação da Santa Cruz", "FS", 78, "vermelho"],
    "8-15": ["Nossa Senhora das Dores", "M", 31, "branco"],
    "8-21": ["São Mateus, apóstolo e evangelista", "F", 19, "vermelho"],
    "8-27": ["São Vicente de Paulo", "M", 112, "branco"],
    "8-29": ["Santos Arcanjos Miguel, Gabriel e Rafael", "F", 138, "branco"],
    "8-30": ["São Jerônimo · Dia da Bíblia", "M", 1, "branco"],
    "9-1": ["Santa Teresinha do Menino Jesus", "M", 131, "branco"],
    "9-2": ["Santos Anjos da Guarda", "M", 91, "branco"],
    "9-3": ["Santos Mártires de Cunhaú e Uruaçu", "M", 124, "vermelho"],
    "9-4": ["São Francisco de Assis", "M", 142, "branco"],
    "9-7": ["Nossa Senhora do Rosário", "M", 113, "branco"],
    "9-12": ["Nossa Senhora Aparecida, Padroeira do Brasil", "S", 87, "branco"],
    "9-15": ["Santa Teresa de Jesus (d’Ávila)", "M", 63, "branco"],
    "9-18": ["São Lucas, evangelista", "F", 145, "vermelho"],
    "9-25": ["Santo Antônio de Sant’Ana Galvão (Frei Galvão)", "M", 112, "branco"],
    "9-28": ["São Simão e São Judas, apóstolos", "F", 19, "vermelho"],
    "10-1": ["Todos os Santos", "S", 24, "branco"],
    "10-2": ["Comemoração de todos os Fiéis Defuntos (Finados)", "FS", 23, "roxo"],
    "10-9": ["Dedicação da Basílica do Latrão", "FS", 46, "branco"],
    "10-21": ["Apresentação de Nossa Senhora", "M", 45, "branco"],
    "10-30": ["Santo André, apóstolo", "F", 19, "vermelho"],
    "11-3": ["São Francisco Xavier", "M", 117, "branco"],
    "11-8": ["Imaculada Conceição de Nossa Senhora", "S", 98, "branco"],
    "11-12": ["Nossa Senhora de Guadalupe, Padroeira da América Latina", "F", 67, "branco"],
    "11-13": ["Santa Luzia, virgem e mártir", "M", 27, "vermelho"],
    "11-25": ["Natal do Senhor", "S", 98, "branco"],
    "11-26": ["Santo Estêvão, primeiro mártir", "F", 31, "vermelho"],
    "11-27": ["São João, apóstolo e evangelista", "F", 97, "branco"],
    "11-28": ["Santos Inocentes, mártires", "F", 124, "vermelho"],
  };

  /* ---------- outros santos do dia (só informativos) ---------- */
  const SANTOS = {
    "0-2": "São Basílio Magno e São Gregório Nazianzeno", "0-3": "Santíssimo Nome de Jesus", "0-7": "São Raimundo de Penyafort",
    "0-13": "Santo Hilário", "0-17": "Santo Antão, abade", "0-21": "Santa Inês, virgem e mártir", "0-22": "São Vicente, diácono e mártir",
    "0-24": "São Francisco de Sales", "0-26": "São Timóteo e São Tito, bispos", "0-27": "Santa Ângela Merici", "0-28": "São Tomás de Aquino",
    "0-31": "São João Bosco",
    "1-3": "São Brás e Santo Oscar", "1-5": "Santa Águeda, virgem e mártir", "1-6": "São Paulo Miki e companheiros, mártires",
    "1-8": "São Jerônimo Emiliani e Santa Josefina Bakhita", "1-10": "Santa Escolástica", "1-14": "São Cirilo e São Metódio",
    "1-17": "Sete Santos Fundadores dos Servitas", "1-21": "São Pedro Damião", "1-23": "São Policarpo, bispo e mártir",
    "2-4": "São Casimiro", "2-7": "Santas Perpétua e Felicidade, mártires", "2-8": "São João de Deus", "2-9": "Santa Francisca Romana",
    "2-17": "São Patrício", "2-18": "São Cirilo de Jerusalém", "2-23": "São Turíbio de Mogrovejo",
    "3-2": "São Francisco de Paula", "3-4": "Santo Isidoro", "3-5": "São Vicente Ferrer", "3-7": "São João Batista de La Salle",
    "3-11": "Santo Estanislau", "3-13": "São Martinho I", "3-21": "Santo Anselmo", "3-23": "São Jorge, mártir · Santo Adalberto",
    "3-24": "São Fidélis de Sigmaringa", "3-28": "São Pedro Chanel · São Luís Maria Grignion de Montfort", "3-29": "Santa Catarina de Sena",
    "3-30": "São Pio V",
    "4-2": "Santo Atanásio", "4-12": "São Nereu, Santo Aquiles e São Pancrácio", "4-18": "São João I", "4-20": "São Bernardino de Sena",
    "4-21": "São Cristóvão Magallanes e companheiros", "4-22": "Santa Rita de Cássia", "4-25": "São Beda · São Gregório VII · Santa Maria Madalena de Pazzi",
    "4-26": "São Filipe Néri", "4-27": "Santo Agostinho de Cantuária",
    "5-1": "São Justino, mártir", "5-2": "São Marcelino e São Pedro, mártires", "5-3": "São Carlos Lwanga e companheiros", "5-5": "São Bonifácio",
    "5-6": "São Norberto", "5-11": "São Barnabé, apóstolo", "5-19": "São Romualdo", "5-21": "São Luís Gonzaga",
    "5-22": "São Paulino de Nola · São João Fisher e São Tomás More", "5-27": "São Cirilo de Alexandria", "5-28": "Santo Irineu",
    "5-30": "Santos Protomártires de Roma",
    "6-4": "Santa Isabel de Portugal", "6-5": "Santo Antônio Maria Zacarias", "6-6": "Santa Maria Goretti", "6-13": "Santo Henrique",
    "6-14": "São Camilo de Lélis", "6-15": "São Boaventura", "6-20": "Santo Apolinário", "6-21": "São Lourenço de Brindes",
    "6-23": "Santa Brígida", "6-24": "São Charbel Makhlouf", "6-30": "São Pedro Crisólogo", "6-31": "Santo Inácio de Loyola",
    "7-1": "Santo Afonso Maria de Ligório", "7-2": "Santo Eusébio · São Pedro Juliano Eymard", "7-7": "São Sisto II e companheiros · São Caetano",
    "7-8": "São Domingos de Gusmão", "7-9": "Santa Teresa Benedita da Cruz (Edith Stein)", "7-11": "Santa Clara de Assis",
    "7-12": "Santa Joana Francisca de Chantal", "7-14": "São Maximiliano Maria Kolbe", "7-16": "Santo Estêvão da Hungria",
    "7-19": "São João Eudes", "7-20": "São Bernardo, abade", "7-21": "São Pio X", "7-23": "Santa Rosa de Lima", "7-25": "São Luís de França · São José de Calasanz",
    "7-27": "Santa Mônica",
    "8-3": "São Gregório Magno", "8-9": "São Pedro Claver", "8-12": "Santíssimo Nome de Maria", "8-13": "São João Crisóstomo",
    "8-16": "São Cornélio e São Cipriano", "8-17": "São Roberto Belarmino", "8-19": "São Januário", "8-20": "Santo André Kim e companheiros",
    "8-23": "São Pio de Pietrelcina (Padre Pio)", "8-26": "São Cosme e São Damião", "8-28": "São Venceslau · São Lourenço Ruiz e companheiros",
    "9-6": "São Bruno", "9-9": "São Dionísio e companheiros · São João Leonardi", "9-11": "São João XXIII", "9-14": "São Calisto I",
    "9-16": "Santa Edwiges · Santa Margarida Maria Alacoque", "9-17": "Santo Inácio de Antioquia", "9-19": "São Pedro de Alcântara · São Paulo da Cruz",
    "9-22": "São João Paulo II", "9-23": "São João de Capistrano", "9-24": "Santo Antônio Maria Claret",
    "10-3": "São Martinho de Lima", "10-4": "São Carlos Borromeu", "10-10": "São Leão Magno", "10-11": "São Martinho de Tours",
    "10-12": "São Josafá", "10-15": "Santo Alberto Magno", "10-16": "Santa Margarida da Escócia · Santa Gertrudes",
    "10-17": "Santa Isabel da Hungria", "10-18": "Dedicação das Basílicas de São Pedro e São Paulo", "10-19": "São Roque González e companheiros, mártires",
    "10-22": "Santa Cecília", "10-23": "São Clemente I · São Columbano", "10-24": "Santo André Dung-Lac e companheiros",
    "11-4": "São João Damasceno", "11-6": "São Nicolau", "11-7": "Santo Ambrósio", "11-9": "São João Diego", "11-11": "São Dâmaso I",
    "11-14": "São João da Cruz", "11-21": "São Pedro Canísio", "11-23": "São João Câncio", "11-29": "São Tomás Becket", "11-31": "São Silvestre I",
  };

  function festasDoAno(y) {
    const p = pascoa(y);
    const m = {};
    const poe = (dt, nome, rank, psalm, cor, extra) => { m[chave(dt)] = Object.assign({ nome, rank, psalm, cor }, extra || {}); };
    const fixa = (mes, dia) => { const f = FIXAS[mes + "-" + dia]; return { nome: f[0], rank: f[1], psalm: f[2], cor: f[3] }; };
    const remove = (dt) => { m[chave(dt)] = { removida: true }; };

    // Transferências (no Brasil, regras do Diretório Litúrgico)
    const ramos = soma(p, -7), oitavaFim = soma(p, 7);
    const naSemanaSantaOuOitava = (dt) => dt >= ramos && dt <= oitavaFim;
    const domingoQuaresma = (dt) => dow(dt) === 0 && dt > soma(p, -46) && dt < p;

    // São José: na Semana Santa, antecipa para o sábado antes de Ramos; em domingo da Quaresma, passa para segunda.
    const sj = utc(y, 2, 19);
    if (naSemanaSantaOuOitava(sj)) { remove(sj); poe(soma(ramos, -1), "São José, esposo de Maria (antecipada)", "S", 112, "branco"); }
    else if (domingoQuaresma(sj)) { remove(sj); poe(soma(sj, 1), "São José, esposo de Maria (transferida)", "S", 112, "branco"); }
    // Anunciação: na Semana Santa ou Oitava, vai para a segunda depois do 2º Domingo da Páscoa; em domingo da Quaresma, segunda.
    const an = utc(y, 2, 25);
    if (naSemanaSantaOuOitava(an)) { remove(an); poe(soma(oitavaFim, 1), "Anunciação do Senhor (transferida)", "S", 40, "branco"); }
    else if (domingoQuaresma(an)) { remove(an); poe(soma(an, 1), "Anunciação do Senhor (transferida)", "S", 40, "branco"); }
    // Imaculada Conceição em domingo do Advento: segunda-feira.
    const ic = utc(y, 11, 8);
    if (dow(ic) === 0) { remove(ic); poe(soma(ic, 1), "Imaculada Conceição de Nossa Senhora (transferida)", "S", 98, "branco"); }
    // Pedro e Paulo, Assunção e Todos os Santos: no Brasil, celebradas no domingo seguinte quando caem em dia de semana.
    [[5, 29], [7, 15], [10, 1]].forEach(([mes, dia]) => {
      const dt = utc(y, mes, dia);
      if (dow(dt) !== 0) {
        remove(dt);
        const f = fixa(mes, dia);
        poe(domingoEmOuDepois(dt), f.nome, "S", f.psalm, f.cor, { transferidaDe: dia + " de " + MESES[mes] });
      }
    });
    // Se Todos os Santos ficou no domingo 2/11, Finados passa para segunda 3/11.
    if (chave(domingoEmOuDepois(utc(y, 10, 1))) === chave(utc(y, 10, 2))) {
      const f = fixa(10, 2);
      poe(utc(y, 10, 3), f.nome, f.rank, f.psalm, f.cor);
    }

    // Tempo pascal e Semana Santa
    poe(soma(p, -46), "Quarta-feira de Cinzas", "S", 51, "roxo", { privilegiado: true });
    poe(ramos, "Domingo de Ramos e da Paixão do Senhor", "S", 22, "vermelho", { privilegiado: true });
    poe(soma(p, -6), "Segunda-feira Santa", "S", 27, "roxo", { privilegiado: true });
    poe(soma(p, -5), "Terça-feira Santa", "S", 71, "roxo", { privilegiado: true });
    poe(soma(p, -4), "Quarta-feira Santa", "S", 69, "roxo", { privilegiado: true });
    poe(soma(p, -3), "Quinta-feira Santa · Ceia do Senhor", "S", 116, "branco", { privilegiado: true, triduo: true });
    poe(soma(p, -2), "Sexta-feira da Paixão do Senhor", "S", 31, "vermelho", { privilegiado: true, triduo: true });
    poe(soma(p, -1), "Sábado Santo · Vigília Pascal", "S", 16, "roxo", { privilegiado: true, triduo: true });
    poe(p, "Domingo da Páscoa · Ressurreição do Senhor", "S", 118, "branco", { privilegiado: true, triduo: true });
    const oitava = [16, 33, 111, 8, 118, 117];
    ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"].forEach((n, i) => {
      poe(soma(p, i + 1), n + " na Oitava da Páscoa", "S", oitava[i], "branco", { privilegiado: true, oitava: true });
    });
    poe(oitavaFim, "2º Domingo da Páscoa · Domingo da Divina Misericórdia", "S", 118, "branco", { privilegiado: true });
    poe(soma(p, 42), "Ascensão do Senhor", "S", 47, "branco", { privilegiado: true });
    poe(soma(p, 49), "Domingo de Pentecostes", "S", 104, "vermelho", { privilegiado: true });
    poe(soma(p, 50), "Nossa Senhora, Mãe da Igreja", "M", 87, "branco");
    poe(soma(p, 56), "Santíssima Trindade", "S", 33, "branco");
    poe(soma(p, 60), "Corpus Christi · Santíssimo Corpo e Sangue de Cristo", "S", 111, "branco");
    const coracao = soma(p, 68);
    poe(coracao, "Sagrado Coração de Jesus", "S", 103, "branco");
    poe(soma(p, 69), "Imaculado Coração de Maria", "M", 113, "branco");
    if (chave(coracao) === chave(utc(y, 5, 24))) {
      const f = fixa(5, 24);
      poe(utc(y, 5, 23), f.nome + " (antecipada)", "S", f.psalm, f.cor);
    }

    const a1 = advento1(y);
    poe(soma(a1, -7), "Nosso Senhor Jesus Cristo, Rei do Universo", "S", 93, "branco");
    poe(epifania(y), "Epifania do Senhor", "S", 72, "branco");
    poe(batismo(y), "Batismo do Senhor", "FS", 29, "branco");
    poe(sagradaFamilia(y), "Sagrada Família de Jesus, Maria e José", "FS", 128, "branco");
    return m;
  }
  const cacheAno = {};
  const festasDe = (y) => cacheAno[y] || (cacheAno[y] = festasDoAno(y));

  /* ---------- Campanha da Fraternidade (edite aqui a cada ano) ---------- */
  const CAMPANHA_FRATERNIDADE = {
    2024: { tema: "Fraternidade e Amizade Social", lema: "Vós sois todos irmãos e irmãs (Mt 23,8)" },
    2025: { tema: "Fraternidade e Ecologia Integral", lema: "Deus viu que tudo era muito bom (Gn 1,31)" },
    2026: { tema: "Fraternidade e Moradia", lema: "Ele veio morar entre nós (Jo 1,14)" },
  };

  /* ---------- campanhas e dias temáticos ----------
   * pool: salmos para os dias comuns do período (valem em Tempo Comum e Tempo Pascal, fora de domingos).
   * psalm: salmo para um dia específico.
   */
  function campanhas(dt, ctx) {
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate();
    const lista = [];
    const add = (c) => lista.push(c);
    const domingo = dow(dt) === 0;
    const k = chave(dt);

    if (m === 0 && d >= 18 && d <= 25)
      add({ nome: "Semana de Oração pela Unidade dos Cristãos", desc: "De 18 a 25 de janeiro, rezamos para que todos os que creem em Cristo sejam um só.", pool: [133, 122, 46, 85, 117, 67, 100] });

    if (ctx.estacao === "quaresma") {
      const cf = CAMPANHA_FRATERNIDADE[y];
      add({
        nome: "Campanha da Fraternidade " + y,
        desc: cf
          ? "Tema: " + cf.tema + ". Lema: “" + cf.lema + "”. Quaresma é tempo de oração, jejum e partilha."
          : "Campanha promovida pela CNBB na Quaresma, com tema e lema definidos a cada ano. Tempo de oração, jejum e partilha.",
      });
      if (k === chave(soma(ctx.pascoa, -7)))
        add({ nome: "Coleta Nacional da Solidariedade", desc: "No Domingo de Ramos, o gesto concreto da Campanha da Fraternidade: a coleta que sustenta projetos sociais em todo o Brasil." });
    }
    if (ctx.estacao === "pascal" && domingo && dif(dt, ctx.pascoa) === 28)
      add({ nome: "Dia Mundial de Oração pelas Vocações", desc: "Domingo do Bom Pastor: rezamos pelas vocações sacerdotais, religiosas e leigas." });
    if (ctx.estacao === "pascal" && dif(dt, ctx.pascoa) >= 40 && dif(dt, ctx.pascoa) <= 48)
      add({ nome: "Semana de Oração pela Unidade (novena de Pentecostes)", desc: "Entre a Ascensão e Pentecostes, a Igreja reza com Maria pedindo um novo Pentecostes.", sec: true });
    if (k === chave(soma(ctx.pascoa, 42)))
      add({ nome: "Dia Mundial das Comunicações Sociais", desc: "No domingo da Ascensão, a Igreja reza pelos que trabalham nos meios de comunicação." });

    if (m === 4) {
      add({ nome: "Maio, mês de Maria", desc: "Mês dedicado a Nossa Senhora, com terço e coroação nas comunidades.", pool: [45, 113, 87, 131, 121, 98, 123] });
      if (domingo && d >= 8 && d <= 14) add({ nome: "Dia das Mães", desc: "Damos graças a Deus pela vida das mães e pedimos a bênção sobre elas.", psalm: 113 });
    }
    if (m === 5 && ctx.estacao !== "quaresma")
      add({ nome: "Junho, mês do Sagrado Coração", desc: "Mês da devoção ao Coração de Jesus, e tempo de festas juninas nas comunidades.", pool: [103, 23, 33, 34, 36, 145] });
    if (m === 6) {
      if (k === chave(domingoMaisProximo(utc(y, 6, 26))))
        add({ nome: "Dia Mundial dos Avós e Idosos", desc: "Domingo próximo à memória de São Joaquim e Sant’Ana: gratidão e atenção aos avós e idosos.", psalm: 92 });
      add({ nome: "Julho, mês do Preciosíssimo Sangue", desc: "Tradicionalmente dedicado à devoção ao Sangue de Cristo.", pool: [116, 22, 51, 130, 103, 40] });
    }
    if (m === 7) {
      add({ nome: "Agosto, mês vocacional", desc: "Mês de oração pelas vocações: ministério ordenado, vida consagrada, família, catequese e leigos.", pool: [40, 16, 23, 100, 116, 139, 84, 27] });
      const domVoc = ["Dia do Padre (vocação ao ministério ordenado)", "Dia dos Pais (vocação à vida familiar)", "Dia dos Religiosos e Religiosas (vida consagrada)", "Dia do Catequista", "Dia dos Leigos e Leigas"];
      if (domingo) add({ nome: "Domingo vocacional: " + domVoc[Math.floor((d - 1) / 7)], desc: "Cada domingo de agosto é dedicado a uma vocação na Igreja.", sec: true });
      if (domingo && d >= 8 && d <= 14) add({ nome: "Dia dos Pais", desc: "Rezamos pelos pais e pela paternidade responsável, a começar pelo exemplo de São José.", psalm: 128 });
      const df = dif(dt, enesimoDia(y, 7, 0, 2));
      if (df >= 0 && df <= 6)
        add({ nome: "Semana Nacional da Família", desc: "Semana dedicada a rezar e refletir sobre a vocação e a missão da família.", pool: [127, 128, 133, 131, 112, 25, 34] });
    }
    if (m === 8) {
      add({ nome: "Setembro, mês da Bíblia", desc: "Mês dedicado ao estudo e à oração com a Palavra de Deus, que termina em 30/09, memória de São Jerônimo.", pool: [1, 19, 12, 33, 147, 111, 25, 119] });
      add({ nome: "Tempo da Criação", desc: "De 1º de setembro a 4 de outubro: cuidado com a casa comum.", sec: true });
      if (d === 1) add({ nome: "Dia Mundial de Oração pelo Cuidado da Criação", desc: "Abertura do Tempo da Criação.", psalm: 8 });
    }
    if (m === 9 && d <= 4) add({ nome: "Tempo da Criação", desc: "Até 4 de outubro, memória de São Francisco: cuidado com a casa comum.", sec: true });
    if (m === 9) {
      add({ nome: "Outubro, mês missionário e do Rosário", desc: "Mês de oração e partilha pelas missões e de devoção ao Santo Rosário.", pool: [67, 96, 117, 98, 100, 19, 113, 126] });
      if (d <= 8) add({ nome: "Semana Nacional da Vida", desc: "De 1º a 8 de outubro: defesa e promoção da vida em todas as suas fases.", sec: true });
      const fimOut = utc(y, 9, 31);
      const ult = soma(fimOut, -dow(fimOut));
      if (k === chave(soma(ult, -7)))
        add({ nome: "Dia Mundial das Missões", desc: "Penúltimo domingo de outubro: oração e coleta em favor das missões em todo o mundo.", psalm: 96 });
      if (k === chave(ult))
        add({ nome: "Dia Nacional da Juventude (DNJ)", desc: "Último domingo de outubro: a Igreja reza e se reúne com os jovens.", psalm: 71 });
    }
    if (m === 10 && k === chave(soma(ctx.advento1, -14)))
      add({ nome: "Dia Mundial dos Pobres", desc: "33º Domingo do Tempo Comum: a Igreja convida a olhar e servir os pobres.", psalm: 41 });
    if (m === 10 && k === chave(enesimoDia(y, 10, 4, 4)))
      add({ nome: "Dia de Ação de Graças", desc: "Quarta quinta-feira de novembro: um dia para agradecer a Deus por todos os dons.", psalm: 100 });
    if (m === 10 && d === 20)
      add({ nome: "Dia da Consciência Negra", desc: "A Igreja no Brasil reza pela superação do racismo e pela dignidade do povo negro.", sec: true });
    if (k === chave(soma(ctx.advento1, -7)))
      add({ nome: "Dia Nacional dos Cristãos Leigos e Leigas", desc: "Na solenidade de Cristo Rei, a Igreja no Brasil celebra a missão dos leigos.", sec: true });
    if (ctx.estacao === "advento")
      add({ nome: "Campanha para a Evangelização", desc: "No Advento, a coleta do 3º domingo sustenta a missão evangelizadora da Igreja no Brasil." + (domingo && ctx.numSemana === 3 ? " Hoje é o dia da coleta." : ""), sec: !(domingo && ctx.numSemana === 3) });
    if (ctx.estacao === "comum" && domingo && ctx.numSemana === 3)
      add({ nome: "Domingo da Palavra de Deus", desc: "3º Domingo do Tempo Comum, dedicado à celebração e divulgação da Bíblia.", psalm: 19 });

    // Campanhas da paróquia/diocese (js/paroquia.js)
    (window.PAROQUIA || []).forEach((c) => {
      if (!c || !c.data) return;
      const ate = c.ate || c.data;
      const alvo = /^\d{4}-/.test(c.data) ? k : k.slice(5); // "AAAA-MM-DD" ou "MM-DD" (todo ano)
      const ok = alvo >= c.data && alvo <= ate;
      if (ok) add({ nome: c.nome, desc: c.desc || "", psalm: c.salmo, local: true });
    });
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
  const NATAL_DIAS = { "11-29": 96, "11-30": 148, "11-31": 90 };
  const ADV_FINAL = [72, 25, 85, 40, 33, 80, 122, 89]; // 17 a 24 de dezembro

  function mdc(a, b) { return b ? mdc(b, a % b) : a; }
  function passoPara(pool) { let p = 7; while (mdc(p, pool.length) !== 1) p++; return p; }
  const naRotacao = (pool, n) => pool[(((n * passoPara(pool)) % pool.length) + pool.length) % pool.length];

  /* ---------- Liturgia das Horas: saltério de 4 semanas (Laudes e Vésperas) ----------
   * Só os salmos (os cânticos bíblicos não estão incluídos). Referências "119:145-152" = salmo:versículos.
   * O sábado à tarde já são as I Vésperas do domingo seguinte.
   */
  const SALTERIO = {
    1: [[[63, 149], [110, 114]], [[5, 29], [11, 15]], [[24, 33], [20, 21]], [[36, 47], [27]], [[57, 48], [30, 32]], [[51, 100], [41, 46]], [["119:145-152", 117], null]],
    2: [[[118, 150], [110, 115]], [[42, "19:1-6"], [45]], [[43, 65], [49]], [[77, 97], [62, 67]], [[80, 81], [72]], [[51, "147:12-20"], ["116:1-9", 121]], [[92, 8], null]],
    3: [[[93, 148], [110, 111]], [[84, 96], [123, 124]], [[85, 67], [125, 131]], [[86, 98], [126, 127]], [[87, 99], [132]], [[51, 100], [135]], [["119:145-152", 117], null]],
    4: [[[118, 150], [110, 112]], [[90, 135], [136]], [[101, "144:1-10"], [137, 138]], [[108, 146], [139]], [["143:1-11", "147:1-11"], [144]], [[51, "147:12-20"], [145]], [[92, 8], null]],
  };
  const I_VESPERAS = { 1: [141, 142], 2: ["119:105-112", 16], 3: [113, "116:10-19"], 4: [122, 130] };
  const ROMANO = ["", "I", "II", "III", "IV"];

  function horasDoDia(semana, diaSemana) {
    if (!semana) return null;
    const [laudes, vesperas] = SALTERIO[semana][diaSemana];
    return { semana, romano: ROMANO[semana], laudes, vesperas: vesperas || I_VESPERAS[(semana % 4) + 1], primeirasVesperas: !vesperas };
  }

  const ordinal = (n, fem) => n + (fem ? "ª" : "º");
  const NOMES_ESTACAO = { advento: "Advento", natal: "Tempo do Natal", comum: "Tempo Comum", quaresma: "Quaresma", pascal: "Tempo Pascal" };

  /* ---------- função principal (sem a regra de não repetir) ---------- */
  function calcula(dt) {
    const y = dt.getUTCFullYear();
    const nomeDia = SEMANA[dow(dt)];
    const domingo = dow(dt) === 0;
    const k = chave(dt);
    const p = pascoa(y);
    const a1 = advento1(y);
    const batis = batismo(y);
    const cinzas = soma(p, -46);
    const pentecostes = soma(p, 49);

    let estacao, cor, titulo, psalmBase, indiceEstacao, numSemana = 0, semanaSalterio = null;

    if (dt >= a1 && dt < utc(y, 11, 25)) {
      estacao = "advento"; cor = "roxo";
      const sem = Math.floor(dif(dt, a1) / 7) + 1;
      numSemana = sem; indiceEstacao = dif(dt, a1); semanaSalterio = sem;
      titulo = domingo ? ordinal(sem) + " Domingo do Advento" : nomeDia + " da " + ordinal(sem, true) + " semana do Advento";
      if (domingo && sem === 3) cor = "rosa";
      if (domingo) psalmBase = ADV_DOMINGOS[sem - 1];
      else if (dt.getUTCMonth() === 11 && dt.getUTCDate() >= 17) psalmBase = ADV_FINAL[dt.getUTCDate() - 17];
    } else if (dt >= a1 || dt <= batis) {
      estacao = "natal"; cor = "branco";
      indiceEstacao = dif(dt, dt >= a1 ? utc(y, 11, 25) : utc(y - 1, 11, 25));
      titulo = domingo ? "Domingo do Tempo do Natal" : nomeDia + " do Tempo do Natal";
      if (dt.getUTCMonth() === 11 && dt.getUTCDate() > 25) titulo = ordinal(dt.getUTCDate() - 24) + " dia da Oitava do Natal";
    } else if (dt < cinzas) {
      estacao = "comum"; cor = "verde";
      const dom0 = soma(batis, -dow(batis));
      numSemana = 1 + dif(soma(dt, -dow(dt)), dom0) / 7;
      indiceEstacao = dif(dt, batis);
      semanaSalterio = ((numSemana - 1) % 4) + 1;
      titulo = domingo ? ordinal(numSemana) + " Domingo do Tempo Comum" : nomeDia + " da " + ordinal(numSemana, true) + " semana do Tempo Comum";
    } else if (dt < p) {
      estacao = "quaresma"; cor = "roxo";
      indiceEstacao = dif(dt, cinzas);
      const primDom = soma(cinzas, 4);
      if (dt < primDom) { titulo = nomeDia + " depois das Cinzas"; semanaSalterio = 4; }
      else {
        const sem = Math.floor(dif(dt, primDom) / 7) + 1;
        numSemana = sem;
        semanaSalterio = sem === 6 ? 2 : ((sem - 1) % 4) + 1;
        titulo = domingo ? ordinal(sem) + " Domingo da Quaresma" : nomeDia + " da " + ordinal(sem, true) + " semana da Quaresma";
        if (domingo && sem === 4) cor = "rosa";
        if (domingo && sem <= 5) psalmBase = QUA_DOMINGOS[sem - 1];
      }
      if (dif(dt, cinzas) === 1) psalmBase = 1;
      if (dif(dt, cinzas) === 2) psalmBase = 51;
      if (dif(dt, cinzas) === 3) psalmBase = 86;
    } else if (dt <= pentecostes) {
      estacao = "pascal"; cor = "branco";
      indiceEstacao = dif(dt, p);
      const sem = Math.floor(dif(dt, p) / 7) + 1;
      numSemana = sem;
      semanaSalterio = sem >= 2 ? ((sem - 1) % 4) + 1 : null;
      titulo = nomeDia + " da " + ordinal(sem, true) + " semana da Páscoa";
      if (domingo) {
        titulo = sem === 1 ? "Domingo da Páscoa" : ordinal(sem) + " Domingo da Páscoa";
        psalmBase = PAS_DOMINGOS[sem - 1];
      }
    } else {
      estacao = "comum"; cor = "verde";
      numSemana = 34 - dif(soma(a1, -7), soma(dt, -dow(dt))) / 7;
      indiceEstacao = dif(dt, pentecostes);
      semanaSalterio = ((numSemana - 1) % 4) + 1;
      titulo = domingo ? ordinal(numSemana) + " Domingo do Tempo Comum" : nomeDia + " da " + ordinal(numSemana, true) + " semana do Tempo Comum";
    }

    const ctx = { estacao, numSemana, pascoa: p, advento1: a1 };
    const camps = campanhas(dt, ctx);

    // festa do dia
    const doAno = festasDe(y)[k];
    let festa = null;
    if (doAno && !doAno.removida) festa = doAno;
    else if (!doAno && FIXAS[md(dt)]) { const f = FIXAS[md(dt)]; festa = { nome: f[0], rank: f[1], psalm: f[2], cor: f[3] }; }
    // Memória que coincide com um dia já ocupado (ex.: dia móvel): só informativa
    const memoriaFixa = doAno && !doAno.removida && FIXAS[md(dt)] ? FIXAS[md(dt)][0] : null;

    const domPrivilegiado = domingo && (estacao === "advento" || estacao === "quaresma" || estacao === "pascal");
    const semanaSanta = dt >= soma(p, -7) && dt <= soma(p, 7);
    let aplica = false;
    if (festa) {
      if (festa.privilegiado) aplica = true;
      else if (semanaSanta || domPrivilegiado) aplica = false;
      else if (festa.rank === "S") aplica = true;
      else if (festa.rank === "FS") aplica = estacao !== "quaresma" || !domingo;
      else if (festa.rank === "F") aplica = !domingo && estacao !== "quaresma" && !(estacao === "advento" && dt.getUTCDate() >= 17 && dt.getUTCMonth() === 11);
      else aplica = !domingo && (estacao === "comum" || estacao === "pascal");
      if (festa.rank === "F" && estacao === "natal" && dt.getUTCMonth() === 11) aplica = true; // Oitava do Natal
    }
    if (festa && aplica) {
      cor = festa.cor || cor;
      if (festa.rank !== "M") titulo = festa.nome;
    }

    let psalm, razao, rotacao = null;
    const campDia = camps.find((c) => c.psalm);
    const campPool = camps.find((c) => c.pool);
    if (festa && aplica && (festa.rank !== "M" || !campDia || !campDia.local)) {
      psalm = festa.psalm; razao = festa.nome;
    } else if (campDia && !(festa && aplica && festa.rank !== "M")) {
      psalm = campDia.psalm; razao = campDia.nome;
    } else if (psalmBase) {
      psalm = psalmBase; razao = NOMES_ESTACAO[estacao] + (domingo ? " (salmo do domingo)" : "");
    } else if (estacao === "natal" && NATAL_DIAS[md(dt)]) {
      psalm = NATAL_DIAS[md(dt)]; razao = "Oitava do Natal";
    } else if (campPool && !domingo && (estacao === "comum" || estacao === "pascal")) {
      rotacao = { pool: campPool.pool, n: dt.getUTCDate() + 3 * dt.getUTCMonth() };
      razao = campPool.nome;
    } else {
      rotacao = { pool: POOL[estacao], n: indiceEstacao + y };
      razao = NOMES_ESTACAO[estacao];
    }
    if (rotacao) psalm = naRotacao(rotacao.pool, rotacao.n);

    // Liturgia das Horas: Tríduo, Oitavas e Natal têm salmos próprios
    let horas = null;
    if (!(festa && aplica && (festa.triduo || festa.oitava)) && estacao !== "natal") horas = horasDoDia(semanaSalterio, dow(dt));

    const celebracoes = [];
    if (festa) celebracoes.push({ nome: festa.nome, rank: festa.rank, aplicada: aplica });
    if (memoriaFixa && (!festa || memoriaFixa !== festa.nome)) celebracoes.push({ nome: memoriaFixa, rank: "M", aplicada: false });
    const santos = SANTOS[md(dt)] ? SANTOS[md(dt)].split(" · ") : [];

    return {
      data: dt, chave: k, titulo,
      estacao, nomeEstacao: NOMES_ESTACAO[estacao], cor, numSemana,
      ano: cicloDominical(dt >= a1 ? y : y - 1),
      psalm, razao, rotacao, camps, celebracoes, santos, horas,
      festaAplicada: !!(festa && aplica),
    };
  }

  /* ---------- regra de não repetir o salmo da véspera nem o do último domingo ----------
   * Os dias "de rotação" são calculados em sequência a partir do último dia com salmo fixo,
   * para que o resultado seja sempre o mesmo, em qualquer ordem de navegação.
   */
  const cache = new Map();
  const bruto = new Map();
  function calc(dt) {
    const k = chave(dt);
    if (!bruto.has(k)) bruto.set(k, calcula(dt));
    return bruto.get(k);
  }
  function finaliza(dt) {
    const info = Object.assign({}, calc(dt));
    if (info.rotacao) {
      const ontemK = chave(soma(dt, -1));
      const evitar = new Set([cache.has(ontemK) ? cache.get(ontemK).psalm : calc(soma(dt, -1)).psalm]);
      const dom = soma(dt, dow(dt) ? -dow(dt) : -7);
      evitar.add(informacoes(dom).psalm);
      const amanha = calc(soma(dt, 1));
      if (!amanha.rotacao) evitar.add(amanha.psalm);
      let n = info.rotacao.n, t = 0;
      while (evitar.has(info.psalm) && t++ < info.rotacao.pool.length) info.psalm = naRotacao(info.rotacao.pool, ++n);
    }
    cache.set(chave(dt), info);
    return info;
  }
  function informacoes(dt) {
    const k = chave(dt);
    if (cache.has(k)) return cache.get(k);
    const cadeia = [dt];
    let d = soma(dt, -1);
    while (calc(d).rotacao && cadeia.length < 400) { cadeia.push(d); d = soma(d, -1); }
    for (let i = cadeia.length - 1; i >= 0; i--) if (!cache.has(chave(cadeia[i]))) finaliza(cadeia[i]);
    return cache.get(k);
  }

  const NOMES_COR = { verde: "Verde", roxo: "Roxo", branco: "Branco", vermelho: "Vermelho", rosa: "Rosa" };

  window.Liturgia = { informacoes, utc, soma, chave, dif, SEMANA, MESES, NOMES_COR, NOMES_ESTACAO, pascoa, advento1 };
})();
