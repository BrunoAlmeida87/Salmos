/* Conteúdo para cada dia: versículo em destaque, reflexão e oração.
 * Os textos de reflexão e oração são originais, escritos para este site.
 */
(function () {
  "use strict";

  // Versículo em destaque de cada salmo (numeração da tradução usada).
  const VERSICULO = {
    1: 3, 2: 11, 4: 8, 6: 2, 8: 1, 11: 1, 12: 6, 13: 5, 15: 1, 16: 11, 17: 8, 19: 1, 20: 7, 21: 13, 22: 1, 23: 1, 24: 1, 25: 4,
    27: 1, 29: 11, 30: 5, 31: 5, 32: 1, 33: 12, 34: 8, 36: 9, 38: 21, 40: 1, 41: 1, 42: 1, 43: 3, 45: 2, 46: 10, 47: 1, 48: 1,
    49: 15, 51: 10, 57: 7, 61: 2, 62: 1, 63: 1, 65: 1, 66: 1, 67: 1, 69: 13, 71: 5, 72: 11, 77: 11, 78: 4, 80: 3, 84: 1, 85: 10,
    86: 11, 87: 3, 89: 1, 90: 12, 91: 1, 92: 1, 93: 1, 95: 6, 96: 1, 97: 1, 98: 3, 99: 9, 100: 4, 102: 1, 103: 1, 104: 30,
    110: 4, 111: 4, 112: 1, 113: 3, 114: 7, 115: 1, 116: 12, 117: 1, 118: 24, 119: 105, 121: 2, 122: 1, 123: 1, 124: 8,
    125: 1, 126: 5, 127: 1, 128: 1, 130: 1, 131: 2, 133: 1, 134: 2, 136: 1, 138: 3, 139: 14, 142: 5, 143: 10, 145: 18,
    146: 5, 147: 3, 148: 13, 149: 4, 150: 6,
  };

  function versiculoDestaque(n) {
    const versos = window.SALMOS[n - 1];
    let v = VERSICULO[n];
    if (!v || v > versos.length) {
      // sem escolha manual: o versículo mais curto entre os 6 primeiros, para caber bem no cartão
      v = 1;
      versos.slice(0, 6).forEach((t, i) => { if (t.length < versos[v - 1].length && t.length > 30) v = i + 1; });
    }
    return { numero: v, texto: versos[v - 1].replace(/\s*\(Selá\.?\)/g, "") };
  }

  // Reflexões curtas por tempo litúrgico (variam ao longo dos dias).
  const REFLEXAO = {
    advento: [
      "O Advento é tempo de espera ativa: preparamos o coração para o Senhor que veio, que vem a cada dia e que virá na glória.",
      "Vigiar não é ter medo, é estar atento. Onde Deus pode estar chegando, hoje, de forma discreta na minha vida?",
      "Maria e João Batista são os companheiros do Advento: ela, que acolhe em silêncio; ele, que aponta o caminho.",
      "Endireitar os caminhos do Senhor começa por pequenos gestos: um perdão adiado, uma visita, uma oração mais sincera.",
    ],
    natal: [
      "Deus se fez pequeno para caber em nossas mãos. O Natal nos ensina que nenhuma vida é insignificante.",
      "A luz que brilhou em Belém continua a brilhar: onde houver ternura, partilha e paz, ali Cristo nasce de novo.",
      "Os magos seguiram uma estrela e encontraram uma criança. Às vezes a resposta de Deus é mais simples do que procuramos.",
    ],
    comum: [
      "O Tempo Comum é o tempo de crescer, como a cor verde lembra. É no dia a dia que a fé amadurece.",
      "Rezar os salmos é rezar com as palavras que o próprio Jesus rezou. Deixe que uma frase de hoje o acompanhe até a noite.",
      "Nenhum dia é “comum” para quem caminha com Deus. Ofereça a Ele o trabalho, o cansaço e as alegrias de hoje.",
      "Os salmos têm lugar para tudo: louvor, súplica, dor e gratidão. Diante de Deus não é preciso fingir.",
      "Seguir Jesus é aprender a olhar o mundo como Ele: com misericórdia e esperança.",
    ],
    quaresma: [
      "A Quaresma é um caminho de quarenta dias rumo à Páscoa: oração, jejum e esmola, para voltar a Deus de todo o coração.",
      "Converter-se é mudar a direção do olhar: de mim para Deus, de mim para o irmão que precisa.",
      "O jejum que agrada a Deus é repartir o pão com quem tem fome e não fechar os olhos ao próximo.",
      "Deus não se cansa de perdoar. Somos nós que nos cansamos de pedir perdão.",
    ],
    pascal: [
      "Cristo ressuscitou! O Tempo Pascal são cinquenta dias de festa: a morte não tem a última palavra.",
      "Como os discípulos de Emaús, reconhecemos o Ressuscitado ao partir o pão e ao ouvir a Palavra.",
      "A alegria pascal não ignora a cruz; ela a atravessa. Há esperança mesmo onde tudo parece perdido.",
      "O Espírito prometido por Jesus nos faz testemunhas: anunciar a ressurreição com a vida.",
    ],
    semanaSanta: [
      "Na Semana Santa acompanhamos Jesus no caminho da cruz. Fique perto d’Ele, como Maria e o discípulo amado.",
    ],
  };

  const ORACAO = {
    advento: "Vem, Senhor Jesus! Desperta em nós o desejo da tua vinda e prepara nosso coração para te acolher. Amém.",
    natal: "Menino Deus, que te fizeste um de nós, ensina-nos a viver na simplicidade, na paz e na alegria do teu amor. Amém.",
    comum: "Senhor, que este salmo seja a minha oração de hoje. Guia meus passos, fortalece minha fé e faze de mim sinal do teu amor. Amém.",
    quaresma: "Senhor, cria em mim um coração novo. Dá-me a graça da conversão e a coragem de partilhar com quem precisa. Amém.",
    pascal: "Senhor ressuscitado, enche-nos da tua alegria e do teu Espírito, para que sejamos testemunhas da vida nova. Aleluia! Amém.",
    semanaSanta: "Senhor Jesus, pela tua paixão e cruz, ensina-nos a amar até o fim e a confiar no Pai em todas as horas. Amém.",
  };

  function reflexaoDoDia(info) {
    const grupo = /Santa|Paixão|Ramos/.test(info.titulo) && info.estacao === "quaresma" ? "semanaSanta" : info.estacao;
    const lista = REFLEXAO[grupo];
    const n = Math.floor(info.data.getTime() / 86400000);
    return { texto: lista[n % lista.length], oracao: ORACAO[grupo] };
  }

  window.Conteudo = { versiculoDestaque, reflexaoDoDia };
})();
