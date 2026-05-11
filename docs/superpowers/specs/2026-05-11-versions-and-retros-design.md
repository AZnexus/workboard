# Versions and RETROS Design

## Goal

Documentar dues millores futures relacionades però separades:

1. una millora prèvia de `Versions`
2. una millora posterior de `RETROS`

L'objectiu és deixar-les prou ben definides perquè es puguin afegir a `IMPROVEMENTS.md` i, més endavant, implementar-les sense haver de reconstruir el context funcional.

## Scope and order

- `Versions` i `RETROS` són **dues millores separades**.
- `Versions` s'ha d'implementar **abans** que `RETROS`.
- No s'han de barrejar en una sola implementació.
- La dependència existeix perquè `RETROS` ha de seleccionar una versió existent, no escriure-la com a text lliure.

---

## Improvement 1 — Versions

### Functional intent

Afegir una nova secció de `Versions` dins de `Configuració`, amb una experiència semblant a `Projectes` o `Etiquetes`.

### Agreed rules

- es podran crear i gestionar versions des de `Configuració`
- la versió es podrà assignar a les **tasques**
- la versió serà **opcional**
- una tasca podrà tenir **com a màxim una sola versió**
- una tasca podrà continuar tenint **N etiquetes**
- la diferència semàntica queda fixada així:
  - `versió` = 0 o 1 per tasca
  - `etiquetes` = 0..N per tasca

### Design note

`Versions` no es defineix només per donar suport a `RETROS`, però sí que queda explícit que aquesta millora prèvia facilita molt la implementació posterior de la secció de retros.

---

## Improvement 2 — RETROS

### Functional intent

Crear una nova secció `RETROS` com a espai **personal** de preparació de retros. No és una acta de reunió ni una eina col·laborativa per recollir les opinions de tothom.

L'espai existeix perquè l'usuari hi pugui capturar idees seves tan aviat com li vinguin al cap i no les perdi en documents externs o eines separades.

### Core model

Hi ha dos tipus de retro coneguts i limitats:

- `Retro d'equip`
- `Retro d'analistes`

No se'n preveuen més.

Les dues poden estar obertes alhora, però només una de cada tipus.

### Shared metadata

Cada retro té:

- `mes de la retro`
- `versió` (seleccionada des de `Versions`)
- `data de reunió`

`Mes de la retro` i `data de reunió` són dos camps diferents i no s'han de derivar automàticament l'un de l'altre.

### Shared content rules

La retro és personal:

- les sensacions són sempre de l'usuari
- els punts de `Mantenir/Potenciar` són sempre seus
- els punts de `Millorar/Mitigar` són sempre seus
- els `Comentaris/Propostes` de la retro d'analistes també són seus

No s'ha de modelar com una retro multiusuari ni com una acta formal.

### Retro d'equip

Inclou:

- `Sensacions`
- `Mantenir/Potenciar`
- `Millorar/Mitigar`
- `Floretes`

Regles específiques:

- `Floretes` només existeix aquí
- cada floreta té un destinatari i un text positiu
- el destinatari s'introdueix com a **nom lliure**
- el destinatari s'ha de mostrar com a **badge visual separat** del text

### Retro d'analistes

Comparteix la mateixa base que la retro d'equip, però:

- no té `Floretes`
- afegeix `Comentaris/Propostes`

### Block format

Els blocs `Mantenir/Potenciar`, `Millorar/Mitigar`, `Floretes` i `Comentaris/Propostes` es modelen com a **llistes d'ítems independents**, no com a un sol text llarg.

Cada ítem s'ha de poder:

- crear
- editar
- eliminar
- reordenar manualment

### Sensacions

- són personals
- són sempre de l'usuari
- han de reflectir com s'ha sentit durant la versió
- s'esperen com a resum curt de **3 o 4 paraules màxim**

### UX shape

- la secció `RETROS` té navegació pròpia
- el canvi entre `Retro d'equip` i `Retro d'analistes` es fa amb **selector segmentat / tabs**
- dins de cada retro hi ha **una sola pantalla llarga**
- les metadades van a dalt
- els blocs editables van a sota
- no hi ha tabs internes per bloc
- no hi ha mode lectura separat del mode edició

### Creation restrictions

- `RETROS` no es crea des del top bar
- no ha d'aparèixer al desplegable global de creació ràpida
- la seva lògica de creació queda confinada a la pròpia secció

### Lifecycle

Cada retro pot estar en dos estats conceptuals:

- oberta
- arxivada

Regles:

- la retro oberta és un workspace viu i editable
- la retro arxivada continua sent **editable**
- no queda bloquejada en mode lectura
- quan s'arxiva una retro, se'n crea automàticament una altra del **mateix tipus**
- la nova retro neix **completament buida**
- no hereta cap metadada ni cap ítem de l'anterior

### Search and history

La secció `RETROS` ha de permetre cercar retros arxivades amb:

- text lliure
- tipus de retro
- mes
- versió

La llista d'arxivades ha de mostrar només:

- tipus de retro
- mes
- versió
- data de reunió

### Register integration

Les retros arxivades també han d'aparèixer al registre general com un input més, amb entitat pròpia i sense una vista resumida especial.

---

## Candidate implementation zones

### Versions

- `src/main/frontend/src/pages/ConfigPage.tsx`
- futures pantalles/components de configuració de versions
- `src/main/frontend/src/components/entries/EntryForm.tsx`
- `src/main/java/com/workboard/entry/EntryEntity.java`
- `src/main/java/com/workboard/entry/EntryService.java`
- `src/main/java/com/workboard/entry/EntryController.java`
- `src/main/java/com/workboard/entry/EntryResponse.java`

### RETROS

- `src/main/frontend/src/config/navigation.tsx`
- `src/main/frontend/src/components/layout/TopBar.tsx` (per excloure RETROS de la creació global)
- `src/main/frontend/src/pages/NotesPage.tsx` (referència d'històric/actiu)
- `src/main/frontend/src/components/entries/EntryList.tsx` (referència de registre)
- `src/main/frontend/src/components/list/ListToolbar.tsx`
- `src/main/java/com/workboard/entry/EntryType.java`
- `src/main/java/com/workboard/entry/EntryController.java`
- `src/main/java/com/workboard/entry/EntrySearchCriteria.java`
- `src/main/java/com/workboard/entry/EntrySearchSpecifications.java`
- `src/main/java/com/workboard/entry/EntryRepository.java`

---

## Validation guidance

### Versions

- crear versions des de Configuració
- editar-les i llistar-les
- assignar-ne una a una tasca
- validar que la versió és opcional
- validar que una tasca no pot tenir més d'una versió
- validar que les etiquetes continuen sent múltiples

### RETROS

- canviar entre `Retro d'equip` i `Retro d'analistes`
- veure sempre una retro oberta per tipus
- editar metadades i blocs
- validar la diferència entre `Floretes` i `Comentaris/Propostes`
- validar ordre manual dels ítems
- arxivar una retro i comprovar la regeneració automàtica del següent espai buit
- cercar retros arxivades dins de `RETROS`
- trobar retros arxivades també al registre general

---

## Final design call

La direcció recomanada és:

- `Versions` com a millora simple i prèvia
- `RETROS` com a nou tipus integrat dins del sistema general d'inputs
- però amb **secció pròpia**, **selector segmentat** i **restricció explícita de no crear-se des del top bar**

Aquest disseny conserva la coherència amb el registre general i alhora respecta que RETROS és un espai molt específic i personal.
