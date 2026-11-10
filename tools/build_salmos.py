#!/usr/bin/env python3
"""Gera js/salmos.js a partir de um JSON de Bíblia no formato thiagobodruk/bible.

Uso: python3 tools/build_salmos.py tools/pt_acf.json "Almeida Corrigida Fiel (domínio público)"
Para trocar de tradução, baixe outro JSON desse repositório e rode de novo.
"""
import json, re, sys

src = sys.argv[1] if len(sys.argv) > 1 else "tools/pt_acf.json"
nome = sys.argv[2] if len(sys.argv) > 2 else "Almeida Corrigida Fiel (domínio público)"

bible = json.load(open(src, encoding="utf-8-sig"))
salmos = next(b for b in bible if b["abbrev"] == "sl")["chapters"]
assert len(salmos) == 150, len(salmos)

def limpa(v):
    v = re.sub(r"\s+", " ", v).strip()
    return re.sub(r"\s+([.,;:!?])", r"\1", v)

out = [[limpa(v) for v in ch] for ch in salmos]
with open("js/salmos.js", "w", encoding="utf-8") as f:
    f.write("// Gerado por tools/build_salmos.py — não editar à mão.\n")
    f.write("window.TRADUCAO = %s;\n" % json.dumps(nome, ensure_ascii=False))
    f.write("window.SALMOS = %s;\n" % json.dumps(out, ensure_ascii=False, separators=(",", ":")))
print("ok:", sum(len(c) for c in out), "versículos")
