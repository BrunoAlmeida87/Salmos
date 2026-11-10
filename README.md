# Salmo do Dia

Site/aplicativo (PWA) que mostra um salmo por dia, acompanhando o calendário litúrgico e as campanhas da Igreja Católica no Brasil.

## O que tem
- **Salmo do dia** escolhido pelo tempo litúrgico, solenidades, festas e campanhas, sem repetir o da véspera nem o do último domingo.
- **Versículo em destaque**, **reflexão** e **oração** curtas.
- **Calendário litúrgico calculado** (Páscoa, Advento, ciclo A/B/C, cores), com as regras do Brasil: Epifania e Ascensão no domingo; Pedro e Paulo, Assunção e Todos os Santos transferidos para o domingo; São José, Anunciação e Imaculada transferidas quando caem em dias privilegiados.
- **Santos do dia**, incluindo os santos brasileiros.
- **Campanhas**: Campanha da Fraternidade, Maio Mariano, Mês Vocacional, Mês da Bíblia, Mês Missionário, Dia dos Pobres e outras.
- **Liturgia das Horas**: salmos de Laudes e Vésperas pelo saltério de 4 semanas.
- **Ferramentas de leitura**: ouvir em voz alta, aumentar e diminuir a letra, modo “dois coros”.
- **Compartilhamento**: link ou imagem pronta para WhatsApp e Instagram.
- **Instalável no celular** e funciona sem internet. Lembrete diário via agenda (.ics).
- Páginas **Todos os salmos** (com busca por palavra) e **Calendário anual** (imprimível).

## Manutenção
- **Campanha da Fraternidade**: edite `CAMPANHA_FRATERNIDADE` em `js/liturgia.js` quando a CNBB divulgar o tema.
- **Paróquia/diocese**: edite `js/paroquia.js` (festa do padroeiro, missões, retiros…).
- Ao publicar mudanças, aumente `VERSAO` em `sw.js` para os celulares atualizarem.

## Texto dos salmos
Almeida Corrigida Fiel (domínio público), numeração hebraica. Para trocar a tradução:

```
curl -o tools/pt_acf.json https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_acf.json
python3 tools/build_salmos.py tools/pt_acf.json "Nome da tradução"
```

> O salmo exibido é uma sugestão para oração pessoal; não substitui o salmo responsorial do lecionário.
