# DailyView Action Refinement Design

## Goal

Refinar les accions ràpides visibles a les targetes de `DailyView` perquè siguin més discretes, deixin més espai al contingut principal i facin entendre millor què passarà quan l'usuari activi l'acció de moviment.

## Scope

- **Només** aplica a `DailyView`.
- No canvia `TasksPage`, altres llistes ni l'`EntryCard` fora del context `today` / `backlog` del dashboard.
- No canvia el comportament funcional de pin, moviment o canvis d'estat; només la seva presentació i jerarquia visual dins la targeta.

## Problem Statement

Ara mateix les accions ràpides de les targetes de `DailyView` tenen massa pes visual respecte al títol i a les metadades. A més, la icona de moviment actual no comunica prou clarament la destinació de l'acció sense dependre del tooltip.

## Approved Direction

S'aplica l'opció 1 validada amb l'usuari:

- la fixació passa a ser una acció auxiliar petita i discreta, col·locada a **dalt a la dreta**
- l'acció de moviment passa a un **footer inferior esquerre**
- l'acció de moviment es mostra com **fletxa semàntica + microlabel curt**
- la UI ha de continuar deixant clar què farà l'acció, però sense robar espai a la zona principal de text

## Layout Behavior

### Task cards in `backlog`

- Mostren una acció de moviment al footer esquerre amb el text: `→ Avui`
- La fletxa apunta cap a la dreta per indicar entrada a la columna central `Avui`
- L'acció s'ha de percebre com una acció secundària però clarament disponible

### Task cards in `today`

- Mostren una acció de moviment al footer esquerre amb el text: `← Pendent`
- La fletxa apunta cap a l'esquerra per indicar retorn a la columna `Pendent`
- Aquesta acció només apareix per tasques que encara poden tornar a pendents, mantenint la lògica actual

### Pinned state

- La icona de `pin` deixa d'ocupar un lloc protagonista al footer
- Passa a la zona superior dreta de la targeta, com a acció auxiliar compacta
- Ha de continuar sent visible sempre, però amb menys massa visual que ara
- L'estat actiu ha de continuar sent recognoscible amb el color d'accent actual

### Status actions

- Les accions d'estat de les targetes de `today` es mantenen al costat dret del footer
- El canvi d'aquest item no les redissenya; només reequilibra la relació entre moviment, pin i contingut

## Visual Rules

- El bloc principal de contingut (`status`, `priority`, `title`, metadades) continua sent la zona dominant de la targeta
- El `pin` ha de ser visualment més petit i més silenciós que el grup d'accions d'estat
- L'acció de moviment s'ha de llegir com una microacció tipus `ghost`, no com un CTA principal
- La microlabel ha de ser breu i estable; no s'han d'usar frases llargues com `Moure a Avui`
- El footer ha de reservar espai clar per a les accions, evitant que el text de la targeta hi col·lisioni
- La llegibilitat de la targeta no ha d'empitjorar en mode compacte de `backlog`

## Interaction Rules

- L'acció de moviment continua tenint tooltip, però la UI no pot dependre del tooltip per entendre's
- La zona clicable ha de continuar sent còmoda encara que la representació visual sigui més discreta
- No s'introdueixen accions noves ni canvien els `mutate` actuals
- Drag and drop continua funcionant exactament igual

## Accessibility and Semantics

- Les etiquetes visibles `→ Avui` i `← Pendent` passen a ser la font principal de significat visual
- Els tooltips han de continuar reforçant l'acció existent
- La jerarquia visual ha de millorar sense amagar controls ni convertir-los en affordances invisibles

## Affected Areas

- `src/main/frontend/src/components/entries/EntryCard.tsx`
- `src/main/frontend/src/components/dashboard/DailyView.tsx`
- `src/main/frontend/src/components/dashboard/DailyView.test.tsx`
- potencialment algun test associat a `EntryCard` si cal validar les noves etiquetes visibles

## Validation

- comprovació visual de targetes de `Avui` i `Pendent`
- comprovació que el títol i metadades tenen més espai útil que abans
- comprovació que `→ Avui` i `← Pendent` s'entenen d'un cop d'ull
- comprovació que la icona de `pin` continua sent fàcil de localitzar
- comprovació que les accions segueixen sent fàcils de clicar
- proves existents de `DailyView` ajustades per reflectir les etiquetes visibles noves

## Out of Scope

- redisseny global de `EntryCard`
- canvis a les targetes fora de `DailyView`
- canvis de copy en altres accions com `Començar`, `Pausar`, `Finalitzar` o `Cancel·lar`
- reordenació de seccions del dashboard
