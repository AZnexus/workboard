# Millores Templates Phase Design

## Goal

Afegir una nova fase al mòdul `Millores` per convertir la plantilla Textile de `Valoració` en una entitat configurable del producte, editable des de `Configuració`, amb suport per crear noves plantilles, escollir una plantilla per defecte global i seleccionar la plantilla en crear una nova `Valoració`.

La plantilla inicial actual passa a ser la **plantilla de referència** i la **default inicial**.

---

## Why this phase exists

Fins ara, el sistema de `Valoració` s'ha construït sobre:

- blocs guiats per a l'edició
- càlculs automàtics
- Textile generat des d'una plantilla hardcodejada al codi

Aquest model resol la primera experiència usable, però no compleix encara la necessitat funcional acordada:

- editar la plantilla
- crear noves plantilles
- triar la plantilla per defecte
- escollir plantilla en crear una `Valoració`

La nova fase no elimina la comoditat dels blocs guiats. El que fa és separar clarament:

- **contingut estructurat per treballar còmodament**
- **plantilla Textile configurable que decideix la forma final del document**

---

## Source of truth after this phase

Després d'aquesta fase, el sistema tindrà dues capes clares:

1. **Contingut guiat de la valoració**
   - blocs i subseccions per ajudar a escriure de forma còmoda
   - base per al càlcul automàtic i la generació de Textile

2. **Plantilla Textile**
   - document base editable des de `Configuració`
   - defineix ordre, format, títols, text fix i placeholders
   - s'aplica a la `Valoració` seleccionada en crear-la

La plantilla **no** substitueix el model guiat, però sí que controla la forma final del Textile.

---

## Core product decisions closed in this conversation

### 1. La plantilla és Textile real

Una plantilla és un document Textile base, no un simple conjunt de labels interns.

### 2. La plantilla actual es conserva

La plantilla definida a `docs/project/IMPROVEMENTS.md` és la base funcional inicial i serà la **default inicial**.

### 3. La `Valoració` continua tenint blocs guiats

L'experiència d'escriptura continuarà sent còmoda i guiada per blocs, perquè això ajuda l'analista a omplir la informació sense picar tot el Textile a mà.

### 4. El Textile final sempre es pot editar a mà

La plantilla genera el Textile i el preomple, però l'usuari ha de poder editar **tot** el Textile final manualment, inclosa la secció `Valoració`.

### 5. Hi ha d'haver regeneració explícita

Si l'usuari personalitza el Textile manualment, el sistema no l'ha de sobreescriure en silenci. Cal una acció explícita de:

- **Regenerar des de blocs**

### 6. El desglossament de `Valoració` es genera automàticament

La secció `Valoració` no s'ha de picar duplicada manualment bloc per bloc. El desglossament ha de sortir automàticament a partir del contingut estructurat de `DB`, `APIs` i `WEBs`.

### 7. Placeholders desconeguts

Si una plantilla nova inclou placeholders no coneguts pel model actual, el sistema ha de crear un **bloc automàtic** perquè l'usuari el pugui omplir.

Aquest bloc s'ha de mostrar clarament com a contingut pendent d'emplenar si és buit.

---

## Guided editor model after this phase

## Fixed top-level sections

Es mantenen com a seccions base del model guiat:

- `Anàlisi`
- `Resum de tasques`
- `Pre-anàlisi`
- `DB`
- `APIs`
- `WEBs`
- `Valoració`

Aquestes seccions continuen sent la base funcional mínima del producte.

## Structured section behavior

### `DB`

- és una secció única a nivell superior
- pot contenir informació estructurada suficient per generar:
  - el bloc `DB` del document
  - el seu desglossament dins de `Valoració`

### `APIs`

- és una secció amb **N subseccions**
- cada subsecció representa una API concreta
- cada subsecció pot contenir elements concrets de feina
- aquest contingut alimenta:
  - la secció `APIs` del document
  - el desglossament corresponent dins de `Valoració`

### `WEBs`

- és una secció amb **N subseccions**
- cada subsecció representa un WEB concret
- cada subsecció pot contenir elements concrets de feina
- aquest contingut alimenta:
  - la secció `WEBs` del document
  - el desglossament corresponent dins de `Valoració`

## Important clarification

Les hores globals de valoració continuen concentrades a la secció `Valoració`, tal com marca la plantilla inicial. El que es genera automàticament és el **desglossament dels ítems** a partir del contingut de `DB`, `APIs` i `WEBs`, no un model nou d'hores disperses fora d'aquesta secció.

---

## Role of the template

La plantilla defineix:

- l'ordre de les seccions al Textile final
- els títols i subtítols Textile
- els separadors
- el text fix
- els placeholders que el sistema omple
- la forma en què es presenta la secció `Valoració`

La plantilla **no** és l'origen del contingut dels blocs guiats. El seu paper és decidir com aquell contingut es transforma en el document final.

---

## Placeholder contract

La plantilla default inicial s'haurà d'adaptar per funcionar amb un contracte clar de placeholders.

### Known placeholders in v1

La fase introdueix un primer contracte explícit de placeholders coneguts. Com a mínim cal suportar:

- `{{analysis}}`
- `{{taskSummary}}`
- `{{preAnalysis}}`
- `{{db}}`
- `{{apis}}`
- `{{webs}}`
- `{{valuation}}`

### Meaning of these placeholders

- `{{analysis}}` → contingut del bloc `Anàlisi`
- `{{taskSummary}}` → contingut del bloc `Resum de tasques`
- `{{preAnalysis}}` → contingut del bloc `Pre-anàlisi`
- `{{db}}` → fragment Textile complet de la secció `DB`
- `{{apis}}` → fragment Textile complet de la secció `APIs`, incloent les seves subseccions
- `{{webs}}` → fragment Textile complet de la secció `WEBs`, incloent les seves subseccions
- `{{valuation}}` → fragment Textile complet de la secció `Valoració`, incloent:
  - text lliure de valoració
  - desglossament automàtic dels ítems
  - línies de càlcul i totals

### Why `valuation` is a full fragment

La plantilla inicial ja mostra que la secció `Valoració` té una estructura pròpia i un desglossament derivat del contingut anterior. Per a aquesta fase, la manera més estable de preservar aquest comportament és tractar `{{valuation}}` com un fragment complet generat pel sistema, no com un conjunt dispers de placeholders petits sense context.

---

## Unknown placeholders

Si una plantilla conté un placeholder que no pertany al contracte conegut:

- el sistema ha de detectar-lo
- ha de crear un **bloc automàtic** amb aquell nom
- l'usuari l'ha de poder omplir des de l'editor
- si és buit, s'ha d'indicar clarament que falta contingut

### Example

Si una plantilla conté:

```text
{{risks}}
```

el sistema ha de crear un bloc addicional anomenat `risks` perquè l'usuari l'empleni.

### Scope limit for this phase

En aquesta fase, els placeholders desconeguts es consideren **blocs simples**. La capacitat de definir des de plantilla noves famílies de seccions repetibles equivalents a `APIs` o `WEBs` queda fora d'aquest primer slice i es podrà abordar en una ampliació posterior si encara cal.

Aquest límit es fixa per evitar una DSL massa gran en el primer lliurable sense perdre la flexibilitat principal que necessita l'usuari ara.

---

## Manual Textile editing

La `Valoració` ha de poder alternar entre:

- **mode blocs**
- **mode Textile manual**

### Rules

- el Textile generat s'ha de poder editar manualment de punta a punta
- si l'usuari modifica el Textile manualment, la valoració queda marcada com a **Textile personalitzat**
- el sistema no ha de regenerar el Textile automàticament per sobre d'una versió personalitzada
- l'usuari ha de tenir una acció explícita per **Regenerar des de blocs**

### Behavioral consequence

- els blocs guiats continuen sent la base de treball còmoda
- el Textile personalitzat passa a ser la sortida final fins que l'usuari decideixi regenerar-lo

---

## Template management in Configuració

Cal afegir una nova secció de `Configuració` per gestionar plantilles de `Valoració`.

### Minimum required capabilities

- veure la llista de plantilles existents
- crear una plantilla nova
- editar una plantilla existent
- duplicar una plantilla existent si cal
- marcar una plantilla com a **default global**

### Required invariants

- sempre hi ha d'haver una sola plantilla per defecte global
- la plantilla inicial de referència és la primera default del sistema
- una plantilla en ús per valoracions existents no s'ha d'eliminar de forma destructiva sense protecció

---

## Choosing a template when creating a Valuation

En crear una `Valoració` nova:

- el sistema proposa la plantilla **default global**
- l'usuari pot seleccionar-ne una altra
- la valoració queda vinculada a la plantilla triada en crear-la

La plantilla triada és la base per:

- generar el primer Textile
- construir els blocs automàtics derivats dels placeholders desconeguts
- determinar la sortida final del document mentre no hi hagi personalització manual

---

## Migration rules

- la plantilla actual passa a existir com a entitat persistent inicial
- les valoracions ja entregades es deixen tal com estan
- no hi ha migració automàtica a noves plantilles
- si una valoració existent s'ha de passar a una altra plantilla, ha de ser una acció manual

---

## Relationship with current Phase 4/5 implementation

La fase de plantilles modifica el model conceptual de la sortida Textile, però no invalida la feina feta fins ara.

El que canvia és:

- la plantilla deixa d'estar hardcodejada
- el model actual deixa de ser l'única forma possible de renderitzar el document
- la sortida passa a ser template-driven

El que es conserva és:

- l'edició guiada per blocs com a ajuda a l'analista
- els càlculs automàtics
- la capacitat de regenerar la sortida
- la necessitat de guardar tant el Textile com el model estructurat

---

## Acceptance criteria for this phase

La fase es considerarà ben definida i implementada quan compleixi això:

1. Existeix una entitat de plantilla editable des de `Configuració`
2. La plantilla actual existeix com a default inicial
3. Es poden crear noves plantilles
4. Es pot canviar la plantilla per defecte
5. En crear una `Valoració`, es pot escollir plantilla
6. La plantilla genera el Textile inicial segons placeholders coneguts
7. Els placeholders desconeguts creen blocs automàtics editables
8. El desglossament de `Valoració` es genera automàticament des de `DB`, `APIs` i `WEBs`
9. El Textile final es pot editar manualment sencer
10. Existeix acció explícita de **Regenerar des de blocs**
11. No hi ha migració automàtica destructiva de valoracions existents

---

## Explicit scope exclusions

Per evitar ambigüitats, aquesta fase **no** promet encara:

- una DSL completa per definir des de plantilla noves seccions repetibles arbitràries equivalents a `APIs` o `WEBs`
- regeneració inversa fiable des de Textile manual cap a blocs guiats complexos
- migracions automàtiques massives entre plantilles

Aquestes capacitats es podran afegir després si es demostren necessàries.
