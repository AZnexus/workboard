# GOVERNANCE — Workboard

Document canònic de decisions persistents, normes de treball i protocols del projecte.

Aquest és el fitxer que s'ha d'actualitzar quan canviï una regla estable del repositori. No s'han de crear documents paral·lels que dupliquin aquestes normes.

---

## Fonts de veritat del repo

- `README.md`: context del projecte, stack, execució i validació bàsica.
- `GOVERNANCE.md`: decisions vigents, protocols de treball i normes persistents.
- `CHANGELOG.md`: historial de versions publicades i canvis de release.

Les peticions puntuals, feedbacks temporals o notes de treball no han de viure en un fitxer històric llarg dins del repo. Quan una petició es converteix en una decisió persistent, s'ha de reflectir aquí. Quan es publica un canvi rellevant, s'ha de reflectir al `CHANGELOG.md`.

---

## Regla de manteniment

S'ha d'actualitzar aquest document en el mateix canvi en què es modifiqui qualsevol d'aquests punts:

- Protocol de commits
- Protocol de push o release
- Convencions d'API
- Regles de qualitat o validació
- Decisions tècniques persistents
- Criteris de producte o UX que continuen vigents

Si una norma deixa de ser vàlida, s'ha d'editar o eliminar d'aquest fitxer. No s'ha de deixar documentació deprecada convivint amb la vigent.

---

## Principis de producte

- **Idioma**: català (`ca-ES`) a la interfície i al contingut funcional del producte.
- **Velocitat d'ús**: entrar dades ha de ser ràpid, còmode i intuïtiu.
- **Integritat de dades**: no s'ha de perdre informació de l'usuari ni esborrar dades de forma insegura.
- **Claredat funcional**: si hi ha ambigüitat important en un requisit, cal aclarir-la abans d'implementar.
- **Qualitat de dependències**: quan s'introdueixen llibreries noves, es prioritzen opcions contrastades i àmpliament adoptades.
- **Validació amb l'usuari**: per defecte, l'usuari valida el resultat final complet, no microiteracions intermèdies, excepte si hi ha un bloqueig real.

---

## Protocol de commits

### Estructura

- Un commit per canvi coherent i acabat.
- No barrejar en un mateix commit un bugfix, un refactor no relacionat i canvis cosmètics sense relació.
- Els commits han de ser fàcils de revisar i de revertir si cal.
- El missatge del commit ha de permetre entendre **què és el canvi** i **on impacta** abans d'entrar al detall del diff.

### Format obligatori del missatge

Format obligatori:

```text
tipus(scope): resum curt i clar
```

Regles obligatòries del format:

- `tipus` és obligatori.
- `scope` és obligatori.
- El resum ha de ser curt, específic i descriptiu.
- El resum ha d'explicar què es fa, no posar un text genèric o ambigu.
- No s'accepten commits sense `scope`.
- No s'accepten commits amb prefixos de versió com a subject principal (`v2.3.16: ...`).
- La versió o release s'ha d'expressar com a tipus de commit, no com a prefix lliure.

### Tipus de commit permesos

- `feat`: funcionalitat nova
- `fix`: correcció d'error
- `refactor`: reestructuració interna sense canvi funcional extern
- `docs`: documentació
- `test`: proves
- `chore`: manteniment o tasques auxiliars sense impacte funcional directe
- `build`: canvis de build, empaquetat o assets generats
- `release`: preparació formal d'una release o bump de versió

### Regles de redacció del resum

- El resum ha de començar amb un verb clar d'acció.
- El resum ha de descriure el canvi principal, no la intenció difusa.
- Ha de ser prou concret perquè es pugui entendre en una llista de commits.
- No s'han d'usar textos comodí com `update stuff`, `misc fixes`, `changes`, `polish things` o similars.
- Si el commit agrupa diversos ajustos del mateix àmbit, el resum ha d'explicar el fil conductor real.

### Regles del scope

- El `scope` ha de descriure la zona principal afectada.
- Ha de ser curt i estable.
- Ha de correspondre a un mòdul, pàgina, capa o àrea funcional recognoscible.
- No s'han d'inventar scopes nous si ja n'hi ha un d'existent que descriu bé la mateixa àrea.

### Guia de nomenclatura de scopes

- Fer servir noms curts, en minúscules i sense espais.
- Prioritzar noms funcionals i reconeixibles per sobre de noms massa tècnics o massa interns.
- Reutilitzar sempre el mateix `scope` per a la mateixa àrea del producte.
- Només crear un `scope` nou si el canvi afecta una àrea estable i diferenciable que es repetirà en el temps.

Ordre de preferència per triar `scope`:

1. **Àrea funcional visible**: `dashboard`, `tasks`, `notes`, `meetings`, `timelogs`, `projects`, `tags`, `export`
2. **Capa tècnica clara**: `api`, `backend`, `frontend`, `build`
3. **Govern del repo**: `governance`, `versioning`

Si un canvi encaixa tant en una àrea funcional com en una capa tècnica, s'ha de prioritzar l'àrea funcional si això fa el commit més entenedor.

Exemples de `scope` vàlids:

- `dashboard`
- `tasks`
- `notes`
- `meetings`
- `timelogs`
- `tags`
- `projects`
- `export`
- `api`
- `backend`
- `frontend`
- `build`
- `governance`
- `release`

Si un canvi toca diverses àrees però forma un sol bloc coherent, s'ha de triar el `scope` dominant. Si realment són blocs diferents, s'han de separar en commits diferents.

### Exemples vàlids

- `feat(tasks): add dedicated task list page`
- `fix(tags): prevent duplicate tag insert on update`
- `refactor(api): simplify entry patch response mapping`
- `docs(governance): define mandatory commit naming pattern`
- `test(export): cover grouped markdown output`
- `build(frontend): regenerate packaged production assets`
- `release(versioning): bump project version and changelog`

### Exemples NO vàlids

- `v2.3.16: refine dashboard and global create chrome`
- `fix: update things`
- `feat: more work on tasks`
- `dashboard tweaks`
- `misc changes`
- `chore(frontend): stuff`

### Regles específiques per releases i versionat

- Un canvi que només actualitza versió i changelog ha d'usar `release(scope): ...`.
- El `scope` per a aquests commits ha d'identificar clarament l'àmbit del versionat. Per defecte: `versioning`.
- Exemple canònic:

```text
release(versioning): bump project version and changelog
```

- Si el commit només regenera assets empaquetats per una release, no és un `release` automàticament. En aquest cas s'ha d'usar `build(frontend): regenerate packaged production assets` o el tipus equivalent que descrigui realment el canvi.

### Regla de validació humana del subject

Abans de crear un commit, s'ha de poder respondre "sí" a aquestes tres preguntes només llegint el subject:

1. Sé quin tipus de canvi és?
2. Sé a quina àrea del projecte afecta?
3. Sé què ha fet, a nivell curt però concret?

Si alguna resposta és "no", el missatge s'ha de reescriure.

### Regles associades

- Si un canvi introdueix o modifica una norma persistent del projecte, el mateix commit o la mateixa sèrie coherent de commits ha d'actualitzar `GOVERNANCE.md`.
- Si un canvi prepara o formalitza una release, també ha d'actualitzar `CHANGELOG.md` i la versió corresponent quan toqui.
- Si un commit no compleix el patró `tipus(scope): resum curt i clar`, no s'ha de considerar acceptable.
- Els missatges de commit no poden incloure trailers ni línies d'atribució automàtica de tercers (`Co-authored-by`, `Ultraworked with ...` o equivalents) si l'única autoria vàlida del repo és la de l'usuari.

---

## Protocol de push

Només s'ha de fer push d'un estat verificat i coherent.

Abans de fer push:

1. Verificar els fitxers afectats.
2. Executar les comprovacions pertinents segons l'abast del canvi.
3. Confirmar que la documentació persistent està al dia si s'ha canviat alguna norma o decisió.
4. Assegurar que el commit representa un bloc coherent de feina.

Validacions mínimes segons el tipus de canvi:

- **Si afecta frontend**: `cd src/main/frontend && npx tsc --noEmit && npm run build`
- **Si afecta backend o empaquetat**: `./mvnw clean package`
- **Si afecta procés, normes o decisions**: revisar i actualitzar `GOVERNANCE.md`
- **Si afecta una release**: actualitzar `CHANGELOG.md`

No s'ha de fer push de canvis trencats, sense validar o amb documentació normativa desactualitzada.

---

## Versionat i releases

- El projecte segueix **Semantic Versioning**: `MAJOR.MINOR.PATCH`.
- `PATCH`: correccions acotades o ajustos menors.
- `MINOR`: millores funcionals o de UX rellevants sense ruptura global.
- `MAJOR`: canvis amplis o redefinicions importants del producte.

### Bones pràctiques de versionat

- No s'ha de pujar versió per inèrcia; la nova versió ha de correspondre al tipus real de canvi publicat.
- Els canvis interns o preparatoris sense release no han de simular una release en el missatge de commit.
- El versionat, el changelog i el commit de release han d'explicar la mateixa realitat del canvi publicat.
- Si es genera una release, s'ha de poder identificar fàcilment quin commit la formalitza.

Quan un canvi formi part d'una release:

- Actualitzar la versió corresponent al projecte.
- Documentar la release a `CHANGELOG.md`.
- Mantenir coherència entre versió publicada, changelog i artefacte generat.

---

## Decisions tècniques vigents

### API

- Les rutes públiques viuen sota `/api/v1/...`.
- Les actualitzacions d'entries es fan amb `PATCH`.
- Les respostes JSON segueixen `snake_case`.
- Les request payloads segueixen `camelCase`.
- No s'embolcallen les respostes dins de `{ data: ... }`, excepte on hi hagi una resposta paginada específica.

### Frontend

- Tailwind CSS v4 es configura des de CSS i no des d'un `tailwind.config.js` clàssic.
- Amb Radix UI Select no s'ha d'usar `value=""`; cal fer servir sentinels explícits com `"all"`.
- Si `shadcn` genera fitxers fora de l'estructura desitjada, s'han d'integrar manualment a la jerarquia real del projecte abans de commitejar-los.

### Dades i persistència

- Les migracions d'esquema es gestionen amb Flyway.
- Els canvis de model que afectin persistència han d'anar acompanyats de la migració corresponent.
- Les correccions de dades o d'integritat s'han de prioritzar per sobre de refactors no necessaris.

---

## Criteris de qualitat de canvi

- Un bug s'ha de corregir de forma mínima i segura abans de plantejar millores col·laterals.
- Un canvi visible a UI ha de validar tipus i build de frontend.
- Un canvi de backend o dades ha de validar package complet.
- Les normes del repo no poden dependre del context d'una conversa concreta; si són persistents, han de quedar aquí.

---

## Notes de transició

Aquest fitxer substitueix els antics `DECISIONS.md` i `PETICIONS.md`.

- Les decisions permanents s'han consolidat aquí.
- L'historial de versions continua a `CHANGELOG.md`.
- Les peticions puntuals ja no es mantenen com a document acumulatiu dins del repo.
