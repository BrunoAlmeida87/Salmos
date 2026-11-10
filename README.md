# Salmo do Dia

Site estático que mostra um salmo por dia, acompanhando o calendário litúrgico e as campanhas da Igreja Católica no Brasil.

- **Calendário litúrgico calculado** a partir da data (Páscoa, Advento, Tempo Comum, ciclo A/B/C), sem precisar de atualização anual.
- **Solenidades e festas** (incluindo Nossa Senhora Aparecida) e **campanhas/meses temáticos** (Campanha da Fraternidade, Mês da Bíblia, Mês Missionário, Maio Mariano, Mês Vocacional etc.).
- Calendário mensal navegável, link por data (`#2026-11-10`), compartilhamento e tema claro/escuro.

## Atualização anual

Edite `CAMPANHA_FRATERNIDADE` em `js/liturgia.js` quando a CNBB divulgar o tema do ano.

## Texto dos salmos

Almeida Corrigida Fiel (domínio público), numeração hebraica. Para trocar a tradução:

```
curl -o tools/pt_acf.json https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_acf.json
python3 tools/build_salmos.py tools/pt_acf.json "Nome da tradução"
```

> O salmo exibido é uma sugestão para oração pessoal; não substitui o salmo responsorial do lecionário.
