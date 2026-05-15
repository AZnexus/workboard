CREATE TABLE valuation_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    textile_template TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE improvement_valuation ADD COLUMN valuation_template_id INTEGER REFERENCES valuation_template(id);
ALTER TABLE improvement_valuation ADD COLUMN textile_customized INTEGER NOT NULL DEFAULT 0;

INSERT INTO valuation_template (name, textile_template, is_default, active, created_at, updated_at)
VALUES (
    'Plantilla base',
    'h1. Anàlisi

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


h3. Resum de tasques

* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
* Anàlisi, gestió, reunions
* Validació i proves

---


h1. Pre-anàlisi

XXXXXXXXXXXXXXXXXXXX

---

h2. DB

*@TAULA@*

o

_Sense afectació_

h2. APIS

h3. API-X

*1. Tasca X*
XXXXXXXXXXXXXXXXXX


h2. WEBS

h3. WEB-X

*1. Tasca X*
XXXXXXXXXXXXXXXXXX

---

h2. Valoració

*Anàlisi: Xh*

*BD: XXh*
* Tasca X: *Xh*

*API X: XXh*
* Tasca X: *Xh*

*WEB X: XXh*
* Tasca X: *Xh*

*Proves: XXh*
*Disseny: XXh* (Si Cal)

*Gestió:* (Analisi+BO+APIs+WEBs+Proves)/2 = *XXh*
*Gestió + jiras:*  Gestió/4 = *XXh*
*Seguiment: XXh* (Si creiem que hi haurà hores de seguiment amb tercers o BSM, cal ser previsor i apuntar-les)

**Total: XXh**',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

UPDATE improvement_valuation
SET valuation_template_id = (SELECT id FROM valuation_template WHERE is_default = 1 LIMIT 1)
WHERE valuation_template_id IS NULL;
