# IMPROVEMENTS — Workboard

Backlog viu de millores, fixes i refactors futurs pendents d'implementar.

Aquest document no és un changelog ni un històric. Aquí només hi ha treball pendent o proposat per al futur que encara no s'ha executat.

---

## Com llegir aquest document

Cada entrada ha d'explicar prou context perquè es pugui reprendre la feina més endavant sense dependre d'una conversa concreta.

Cada millora ha d'indicar clarament:

- **Què s'ha de fer**
- **Per què val la pena fer-ho**
- **On toca el codi**
- **Com s'hauria d'abordar**
- **Com s'hauria de validar**
- **Risc i dependències**

---

## Resum ràpid del backlog actual

### 1. Phase 3 — Controller / Query / Boundary Cleanup
Refactor backend de risc mitjà per reduir parsing fràgil, strings dispersos a queries i fuites de responsabilitat entre controller, servei i repositori.

### 2. Phase 4 — Architecture Deep Cleanup
Refactor backend de risc alt per revisar carregues eager, camins de lectura específics i fronteres de mòduls entre `entry`, `tag` i `timelog`.

---

## Item 1 — Phase 3: Controller / Query / Boundary Cleanup

### Estat
Pendent.

### Objectiu
Fer el backend més robust i mantenible reduint lògica fràgil a controllers i eliminant punts on les decisions de transport HTTP o els strings dispersos contaminen massa el nucli del comportament.

### Per què cal fer-ho

Després d'haver tancat les fases segures de frontend i configuració, el següent bloc de valor està al backend de complexitat mitjana:

- hi ha lògica de `PATCH` massa manual
- hi ha paths de sort i filtre massa stringly-typed
- hi ha constants o labels de domini repetides
- hi ha fronteres entre serveis que s'intueixen massa acoblades però encara es poden millorar sense entrar a cirurgia profunda

L'objectiu és guanyar claredat i seguretat sense tocar encara els punts de més risc arquitectònic.

### Què s'ha de fer

#### 3.1 Reemplaçar el parsing manual de PATCH per una estratègia explícita de DTOs

**Problema actual**
- El controller d'entries fa massa feina interpretant payloads parcials i decidint què significa cada camp.
- Això barreja decisions de transport HTTP amb regles de domini.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/entry/EntryController.java`
- DTOs relacionats amb entries
- possibles mappers o serveis de patch si calen

**Com fer-ho**
1. Identificar exactament com es representa avui un `PATCH` parcial per entries.
2. Definir una estratègia explícita perquè cada camp parcial tingui semàntica clara.
3. Fer que el controller només:
   - validi entrada HTTP
   - delegui a una unitat clara
   - retorni la resposta
4. Moure la interpretació del patch a una capa més explícita i testable.

**Criteri de qualitat**
- el controller ha de quedar més petit
- la semàntica dels camps parcials ha de quedar visible i provable
- no s'ha de perdre el comportament actual correcte dels `PATCH`

#### 3.2 Reduir paths stringly-typed de sort i specification

**Problema actual**
- Algunes decisions de sort, filtre o query depenen de strings literals repartits.
- Això és fràgil: un rename o una bifurcació funcional es pot trencar fàcilment.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/entry/EntryController.java`
- `src/main/java/com/workboard/entry/EntrySpecifications.java`
- qualsevol mapper o helper relacionat amb query params d'entries

**Com fer-ho**
1. Localitzar totes les claus textuals de sort i filtre que avui es comparen manualment.
2. Agrupar-les en una representació més explícita:
   - enums
   - constants acotades
   - mappers centrals de query param → criteri intern
3. Fer que controllers i specifications consumeixin aquesta font única.
4. Deixar clar què és input públic, què és representació interna i què és nom de camp de persistència.

**Criteri de qualitat**
- cap string important de sort/filtre repetit en paral·lel si representa el mateix concepte
- si un valor no és vàlid, la decisió de fallback ha de ser explícita i testada

#### 3.3 Consolidar labels o constants de domini repetides

**Problema actual**
- Hi ha regles textuals o etiquetes de negoci repetides entre serveis i exportadors.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/dashboard/DashboardService.java`
- `src/main/java/com/workboard/export/MarkdownExportService.java`
- altres serveis on apareguin labels o regles repetides

**Com fer-ho**
1. Detectar constants o labels duplicades que representin la mateixa regla de negoci.
2. Centralitzar només allò que tingui mínim dos consumidors reals.
3. Evitar una capa d'abstracció sobredissenyada: millor una font única simple que una jerarquia nova.

**Criteri de qualitat**
- mantenir la semàntica funcional exacta
- no crear "constants globals" sense ús real compartit

#### 3.4 Clarificar fronteres de servei / repositori on el risc sigui baix

**Problema actual**
- Hi ha punts on un mòdul sembla saber massa de l'altre o consumir repositoris aliens d'una manera massa directa.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/entry/EntryService.java`
- `src/main/java/com/workboard/timelog/TimeLogService.java`
- altres serveis que mostrin dependències creuades fàcils de netejar

**Com fer-ho**
1. Identificar només els acoblaments de baixa controvèrsia.
2. Corregir primer dependències fàcils d'aïllar.
3. Posposar qualsevol canvi que impliqui redisseny profund per a la Fase 4.

**Criteri de qualitat**
- cada ajust ha de ser petit, reversible i verificable
- si una neteja obre un canvi estructural gran, s'ha d'aturar i deixar-la per la fase següent

### Ordre recomanat dins de la fase

1. `PATCH` / DTO strategy
2. sort & specification cleanup
3. duplicated business labels/constants
4. low-risk boundary cleanup

### Validació recomanada

- diagnostics Java si són disponibles
- proves focalitzades sobre `EntryController` i serveis tocats
- proves focalitzades de query/filter/sort si existeixen
- `./mvnw test` o el subconjunt més estret rellevant
- `./mvnw -DskipTests package` abans de qualsevol handoff de validació si el canvi impacta l'artefacte servit

### Risc
Mitjà.

### Dependències

- Fases 1 i 2 ja tancades
- no cal obrir encara la revisió de fetches eager o cirurgia de mòduls profunda

### Senyal que aquesta fase està realment acabada

- el controller d'entries és més clar i amb menys interpretació manual
- el sistema de sort/filter té una font de veritat més explícita
- les constants o labels de domini duplicades rellevants s'han consolidat
- no hi ha regressions a `PATCH`, query o exportacions afectades

---

## Item 2 — Phase 4: Architecture Deep Cleanup

### Estat
Pendent.

### Objectiu
Atacar els punts més delicats d'arquitectura backend només quan la base segura ja està estabilitzada: càrregues eager, camins de lectura específics, fronteres entre mòduls i simplificació d'excepcions si la jerarquia ho justifica.

### Per què cal fer-ho

Aquesta fase no és necessària per al comportament actual del producte, però sí per preparar un backend més net i escalable si el projecte continua creixent.

És una fase de **risc alt** perquè toca punts on és fàcil introduir regressions subtils de rendiment, shape de resposta o acoblament funcional.

### Què s'ha de fer

#### 4.1 Revisit `EntryEntity.tags` eager loading

**Problema actual**
- L'entitat `EntryEntity` sembla carregar més graph del necessari.
- Això acobla la forma de l'entitat als camins de lectura actuals, encara que no tots necessitin les mateixes dades.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/entry/EntryEntity.java`
- repositoris i read paths que consumeixen entries
- mappers/responses que depenen de tags carregats directament

**Com fer-ho**
1. Mapar quins endpoints i quines pantalles realment necessiten tags carregats sempre.
2. Identificar quins camins de lectura poden treballar amb fetch específic en lloc d'un eager general.
3. Introduir read paths específics o fetch plans acotats allà on realment calguin.
4. Només al final, revisar si l'eager actual es pot reduir sense trencar res.

**Criteri de qualitat**
- no fer un canvi a cegues només per “eliminar eager”
- cada read path ha de seguir retornant el que necessita
- qualsevol millora de fetch ha de venir amb verificació funcional i, si es pot, observació de queries/impacte

#### 4.2 Reassess service boundaries across entry / tag / timelog modules

**Problema actual**
- Hi ha sospita d'acoblament entre serveis i repositoris de diferents mòduls.
- En aquesta fase sí que es pot replantejar millor qui és propietari de cada regla i cada dependència.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/entry/*`
- `src/main/java/com/workboard/tag/*`
- `src/main/java/com/workboard/timelog/*`
- qualsevol component compartit que avui faci de pont entre aquests mòduls

**Com fer-ho**
1. Identificar responsabilitats reals de cada mòdul.
2. Detectar on un servei sap massa del model intern d'un altre.
3. Reassignar dependències de forma gradual:
   - primer helpers i regles petites
   - després serveis si hi ha prou evidència
4. Evitar refactors massius de cop; treballar per costures petites.

**Criteri de qualitat**
- cada mòdul ha d'exposar menys detalls interns als altres
- cap canvi ha de dependre d'una reescriptura total del backend

#### 4.3 Simplify exception mapping if the hierarchy grows

**Problema actual**
- El `GlobalExceptionHandler` repeteix patrons de mapping de not-found i pot complicar-se si la jerarquia creix.

**Fitxers / zones candidates**
- `src/main/java/com/workboard/shared/GlobalExceptionHandler.java`
- excepcions específiques de domini

**Com fer-ho**
1. Revisar si la repetició actual és prou rellevant per justificar simplificació.
2. Si sí, centralitzar el shape compartit de resposta d'error sense perdre claredat.
3. No fer una abstracció d'errors innecessària si el guany és marginal.

**Criteri de qualitat**
- el handler ha de quedar més clar, no més “frameworky” o opac
- cada mapping ha de seguir sent fàcil d'entendre i de rastrejar

### Ordre recomanat dins de la fase

1. mapatge real dels read paths d'entries
2. revisió de fetch i tags eager
3. revisió de fronteres entre entry/tag/timelog
4. simplificació d'exception mapping només si encara compensa

### Validació recomanada

- proves focalitzades de controlador/servei a les àrees afectades
- validació completa de `./mvnw test` si la fase acaba tocant diversos mòduls centrals
- `./mvnw -DskipTests package`
- comprovació manual o automatitzada dels endpoints i pantalles que depenen de tags, entries i timelogs

### Risc
Alt.

### Dependències

- només s'hauria d'atacar després d'haver estabilitzat la Fase 3
- convé tenir clar quins endpoints i quines pantalles són més sensibles abans de tocar fetch strategy o fronteres de servei

### Senyal que aquesta fase està realment acabada

- `EntryEntity` ja no carrega més del necessari per defecte, o bé queda justificat explícitament per què alguns fetches encara han de ser eager
- les fronteres entre mòduls són més clares i amb menys dependències creuades opaques
- l'exception mapping és més simple només si això millora realment la llegibilitat
- el comportament extern i el packaging continuen intactes
