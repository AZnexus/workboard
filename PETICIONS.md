# PETICIONS I REQUISITS — Workboard v1.x

> **IMPORTANT**: Aquest fitxer és la font de veritat per totes les peticions de l'usuari.
> S'ha d'actualitzar cada cop que l'usuari demana un canvi.
> Mai s'ha de perdre context encara que es compacti la conversa.

---

## Historial de versions

| Versió | Data | Descripció |
|--------|------|------------|
| 1.0.0 | 2026-04-20 | Release inicial amb 9 blocs de millores |
| 1.1.0 | En curs | Fixes crítics i millores pendents |
| 1.2.0 | En curs | Feedback v2 — UI/UX, tags, drag&drop, filtres, editor actes |

---

## BLOC 1: Desplegable QuickCapture

### Petició original
> "el desplegable de notes i demes al meu dia es desplega cap a dalt.... resulta confús. Hauria de desplegar-se sempre cap abaix"

### Estat: ⚠️ PARCIAL
- Es va posar `side="bottom"` al Select però en certes situacions (quan es selecciona la 2a opció i es torna a clicar) segueix obrint-se cap amunt.
- **Pendent**: Investigar si és un bug de Radix UI Select o cal forçar `side="bottom" align="start"`.

---

## BLOC 2: Prioritat a tasques

### Petició original
> "Voldria afegir algo nou a les tasques: Prioritat. Al crear una tasca pots definir una prioritat que va de 1 a 5. A les tasques d'avui s'ordenaran per prioritat."

### Requisits
- Camp prioritat 1-5 (1=crític, 5=baix) — nullable
- Badge visual P1-P5 amb colors (vermell→gris)
- Ordenació per prioritat a la columna "Avui"
- Filtre per prioritat a la llista d'entrades

### Estat: ✅ IMPLEMENTAT
- Migració V4, badge, ordenació, filtre. Tot funciona.

---

## BLOC 3: Botons d'acció contextuals

### Petició original
> "a les tasques pendents no hauria de sortir el boto de començar o finalitzar. nomes un botó per passar-la a tasca d'avui (Planificar). Un cop a la columna de tasques d'avui, allà sí que es podrà començar, pausar o finalitzar."
> "el botó de la X hauria de ser vermell i amb un hover deixar clar qué fa"

### Requisits
- Columna Pendent: NOMÉS botó "Planificar" (mou a avui)
- Columna Avui (OPEN): "Començar"
- Columna Avui (IN_PROGRESS): "Pausar" + "Finalitzar"
- Columna Avui (OPEN/IN_PROGRESS): ✕ vermell amb tooltip "Cancel·lar tasca"
- Columna Ahir: cap botó
- IMPORTANT: Botons d'acció NOMÉS per tasques (TASK), NO per actes/notes/recordatoris

### Estat: ✅ IMPLEMENTAT

---

## BLOC 4: Recordatoris al "El meu dia"

### Petició original
> "La seccio de coses a comentar em sembla correcte pero jo crec que hauria de ser un tipus mes de input. Si crees un input de tipus recordatori, aparegui en aquesta secció. En comptes de dir-li 'Coses a comentar' posem-li 'Recordatoris'."

### Requisits
- Secció "Recordatoris" al dashboard (columna esquerra)
- Mostra entries tipus REMINDER en estat OPEN (sense filtre de data)
- Botó ✕ per descartar (canvia a DONE)

### Estat: ✅ IMPLEMENTAT

---

## BLOC 5: Tags configurables

### Petició original
> "els tags configurables nous han de poder-se afegir a tots els inputs. Al crear un input hi haurà un seleccionable (multiseleccio) i que també li podras escriure el tag. Si el tag que escrius ja existeix, el selecciona. Si no existeix, et dona la opció de crear-lo."

### Requisits
- Entitat Tag amb nom + color
- CRUD complet de tags a Configuració > Etiquetes
- TagMultiSelect: multiselecció amb search + dropdown
- Creació inline: escrius un tag nou → opció "Crear X" → es crea i s'afegeix
- Badges amb color a les EntryCard

### Estat: ❌ TRENCAT
**Bugs detectats:**
1. **LazyInitializationException**: `EntryTagEntity.tagEntity` és LAZY i s'accedeix fora de transacció → el backend retorna error 500 a qualsevol llistat d'entries amb tags
2. **Botó "Crear" no funciona**: Dins el Dialog modal, el click al botó "Crear" no s'executa (event propagation issue)
3. **Configuració tags**: No hi ha indicador visual clar del color seleccionat
4. **Esborrar tag**: Diu OK però no desapareix de la llista (falta invalidació query cache)

---

## BLOC 6: Actes + Notes separades

### Petició original
> "En comptes de posar Reunions i notes crec que té mes sentit 'Actes' i 'notes' ja que per les reunions es fan actes. Les actes haurien de ser una secció gran de text on poder editar tot. Lo ideal seria que fos un petit editor de text en format markdown."
> "No hauria de poder seleccionar altres tipus d'inputs si cliques en el botó de nova acta, ja que es dóna per suposat que serà reunió."

### Requisits
- Sidebar: "Actes" (icon Users) i "Notes" (icon FileText) com a seccions separades
- Pàgina Actes: llista MEETING_NOTE agrupada per data
  - "Nova Acta" → popup centrat (Dialog), NO sheet lateral
  - Tipus fix a MEETING_NOTE (no permetre canviar)
  - NO mostrar botons d'estat (Començar/Pausar/etc) — només Editar/Esborrar
  - Body: editor de text GRAN amb plantilla pre-emplenada (no placeholder!)
  - La plantilla ha de ser contingut editable, NO placeholder que desapareix
  - Idealment editor amb format Markdown (negreta, llistes, etc.)
- Pàgina Notes: llista NOTE agrupada per data
  - "Nova Nota" → popup centrat (Dialog), NO sheet lateral
  - Tipus fix a NOTE
  - NO mostrar botons d'estat

### Estat: ❌ TRENCAT GREUMENT
**Bugs detectats:**
1. "Nova Acta" obre Sheet lateral en lloc de Dialog centrat
2. Permet canviar el tipus (hauria de ser fix MEETING_NOTE)
3. Actes/notes creades no apareixen a la llista (bug LazyInitialization del backend)
4. Plantilla markdown posada com a `placeholder` — desapareix al escriure
5. No hi ha editor ric — només textarea pla
6. "Nova Nota" també obre Sheet en lloc de Dialog

---

## BLOC 7: QuickCapture + Modal creació

### Petició original
> "el quickCaptura es manté per recordatoris, però també per notes. Es la forma de fer recordatoris o notes de forma super rapida sense necessitat d'especificar massa. Si es vol configurar cal fer-ho al popup amb un formulari mes elaborat."
> "Per les tasques o actes no té sentit el quickcapture."
> "per una nova [tasca] hauria de ser un popup que aparegui en mig de la pantalla"
> "Les quickCapture van sense botó. Simplement escrius i pitjes enter i es creen. El botó + per crear coses noves NO hauria d'estar a la mateixa línia del QuickCapture."

### Requisits
- QuickCapture: NOMÉS Recordatori + Nota ràpida
- Funciona amb Enter — sense botó explícit a la barra
- Botó "Nova Entrada" (o similar) SEPARAT i ben visible a la part superior, fora del QuickCapture
- Clicar botó → Dialog centrat amb EntryForm complet
- Dialog NO es pot tancar al clicar fora (protecció pèrdua dades)
- QuickCapture no ha de tenir el botó + al final de la línia

### Estat: ❌ PARCIAL/MAL DISSENYAT
**Bugs detectats:**
1. Botó + segueix al final de la línia del QuickCapture — hauria de ser separat i prominent
2. Dialog es tanca al clicar fora → es perd la informació (crític!)
3. Notes ràpides creades via QuickCapture no apareixen enlloc (bug backend)

---

## BLOC 8: Hores redisseny

### Petició original
> "la secció de timelogs. Estic segur que en quant tinguem bastantes dades posades allà serà horrible de veure. Hauriem d'ocupar tot el width. Per default hauria de sortir aquesta setmana. Paginació."

### Requisits
- Full-width (sense max-w-5xl)
- Filtres temporals: navegació per setmanes (fletxes prev/next)
- Per defecte: setmana actual
- Botó "Aquesta setmana" per tornar al default
- Paginació quan hi hagi molts registres
- Layout professional i polit

### Estat: ⚠️ FUNCIONAL PERÒ POC POLIT
- Full-width i filtres funcionen
- UI/UX poc professional: formulari d'afegir poc cuidat, layout no ben centrat
- Falta paginació real
- **Pendent**: Millorar UI/UX del formulari (centrat, ben proporcionat) i de la taula+resum

---

## BLOC 9: Temes impactants

### Petició original
> "els temes que has fet es nota molt que son fets per una IA. Els hi falta treball i detalls, com algun guiño, imatges de fons, icones específiques... no sé. Falta polir-los. A mes, en el requadre del seleccionable del tema vull que es vegi una miniatura del tema."

### Requisits
- Cada tema (Matrix, Dragon Ball, Cyberpunk, Nord, Monokai) ha de ser IMPACTANT:
  - Backgrounds visuals reals (no només gradients subtils)
  - Patrons SVG o imatges de fons temàtiques
  - Icones o detalls específics per tema ("guiños")
  - Fonts o estils que reforcin la identitat del tema
- Selector de temes: miniatura REAL del tema (no només swatches de color)
  - Ha de mostrar com es veu realment el tema aplicat

### Estat: ❌ INSUFICIENT
- Només s'han afegit efectes CSS molt subtils (scanlines, text-shadow, gradients lleugers)
- Les miniatures són simples rectangles de 4 colors — no representen el tema real
- Falta tot el que fa els temes "impactants": backgrounds reals, detalls temàtics, identitat visual forta

---

## BUGS TRANSVERSALS (detectats a les proves)

### BUG-001: LazyInitializationException (CRÍTIC)
- **Simptoma**: Error 500 al llistar entries amb tags
- **Causa**: `EntryTagEntity.tagEntity` és `FetchType.LAZY` → s'accedeix fora de la sessió Hibernate a `EntryResponse.from()`
- **Impacte**: Afecta TOTES les pàgines que llisten entries (Entrades, Actes, Notes, Dashboard)
- **Fix**: Canviar `tagEntity` a `FetchType.EAGER` o usar `@EntityGraph`/`JOIN FETCH`

### BUG-002: Dades perdudes al recarregar navegador
- **Simptoma**: Totes les dades desapareixen al recarregar
- **Causa probable**: BD SQLite en path temporal o en memòria
- **Investigar**: Verificar `spring.datasource.url` a application.properties

### BUG-003: Entrades/Notes/Actes no es mostren després de crear
- **Simptoma**: Toast diu "Creat" però la llista segueix buida
- **Causa**: Combinació de BUG-001 (backend falla al llistar) + possiblement invalidació cache React Query

---

## REGLES DE TREBALL

1. **No inventar ni suposar**: Si hi ha dubte, preguntar
2. **Còmode d'utilitzar**: Si necessito entrar dades, ha de ser super ràpid
3. **No perdre dades**: IMPORTANTÍSSIM no esborrar res
4. **Commits per bloc**: Un commit per cada bloc completat
5. **Qualitat llibreries**: Mínim 30K instal·lacions/estrelles
6. **Idioma**: Tot en català (ca-ES)
7. **API**: Routes `/api/v1/...`, PATCH per updates, JSON snake_case
8. **Frontend**: Tailwind v4, shadcn/ui new-york stone, Radix UI
9. **JAVA_HOME**: `$HOME/jdk-21.0.10+7`

---

## FEEDBACK v1.1.0 — Peticions noves (20/04/2026)

### FB-001: Toast notifications millorades
> "el missatge de confirmació apareix abaix a la dreta molt petit. Voldria que fos una mica més gran i amb colors i emojis. ha de ser visual i bonic (i adaptat al TEMA escollit)"
- Toasts més grans, amb colors i emojis
- Adaptat als colors del tema actiu

### FB-002: Botons d'acció tasques — redisseny
> "No m'agraden els botons de pausar, finalitzar, cancelar.... es veuen poc integrats entre ells. Vull que tots els botons formin part de un unic element. No cal que tinguin text. Vull tots els botons un al costat de l'altre, amb colors adients i ben bonics"
- Grup de botons compacte, icon-only, colors integrats
- Un sol element visual cohesiu

### FB-003: Drag & Drop TRENCAT (CRÍTIC)
> "He provat a arrossegar tasques pendents a la llista d'avui i no apareixen. desapareixen de la llista de pendent pero no es sumen a la de avui. Cal revisar aixo, es importantsissim!"
- Les tasques desapareixen de Pendent però no apareixen a Avui
- Probablement la data s'actualitza però la query del dashboard no la recull

### FB-004: Resum temps al DailyView
> "La part del resum de temps del dia el voldria com surt a la secció de hores: amb colors i més gran. Però assegurant-te que surt no nomes el lloc on s'ha imputat sino el comentari."
- Resum amb barres de progrés i colors com WeeklySummary
- Mostrar projecte + comentari/descripció

### FB-005: Botó "Nova Entrada" mal ubicat
> "El boto de Nova entrada està MOLT MAL UBICAT. no el volia al mateix lloc que el de creació rapida. Analitza a nivell de UI/UX on quedaria millor: potser a l'esquerra del tot o a la barra lateral o a la capcelera general"
- Moure'l fora de la línia del QuickCapture
- Analitzar millor ubicació (sidebar? header? floating?)

### FB-006: Desplegable Select sempre cap avall
> "Quan selecciono nota ràpida i torno a seleccionar el desplegable, apareix cap a munt"
- Forçar `side="bottom"` i `position="popper"` a tots els SelectContent

### FB-007: Separació visual QuickCapture vs Nova Entrada
> "Vull que quedi ben diferenciada la secció de afegir nota/recordatori rapids i la secció de crear nova entrada normal. De forma visual, amb dibuixos, colors, bordes de colors, .... algo molt visual i facil de intuir."
- Dues seccions clarament diferenciades visualment
- Colors, bordes, icones descriptives

### FB-008: Tags TRENCATS (CRÍTIC)
> "Les etiquetes no funcionen.... en la configuració no m'apareix cap i al crear-ne alguna diu que si pero no apareix ni en aquesta secció de la configuració ni en cap desplegable al intentar crear una nota"
- Tags no es mostren a Configuració > Etiquetes
- Crear diu OK però no apareix
- No apareixen als desplegables de creació
- Probablement el backend retorna OK però el frontend no refresca

### FB-009: Hores — accions sempre visibles
> "a la columna accions s'amagen les icones i queda lleig. Les icones s'han de veure sempre i no nomes al fer hover"
- Treure el group-hover i mostrar sempre editar/esborrar

### FB-010: Hores — filtre temporal millorat
> "Vull que el filtre sigui mes amigable: poder filtrar per Avui, aquesta setmana, la setmana passada, aquest mes, aquest any i custom."
- Presets: Avui, Aquesta setmana, Setmana passada, Aquest mes, Aquest any
- Custom: rang de dates personalitzat
- Treure el navegador de setmanes actual

### FB-011: Colors a projectes i tags
> "Vull que els projectes i tags tinguin assignat un color sempre i que es vegi a tot arreu on es cridin"
- Projectes amb color assignable (com els tags)
- Mostrar color a tot arreu (llistats, filtres, TimeLogs, etc.)

### FB-012: Hores — formulari més petit
> "La part d'afegir hores ocupa massa. No hauria d'ocupar tot el width, sino ser un requadre mes petit i bonic."
- Formulari més compacte, no full-width

### FB-013: Hores — layout taula/resum
> "Les imputacions no tenen tantes columnes com per ocupar tot aquell espai. Fes que com a molt ocupi la meitat de la pagina"
- Taula d'imputacions max 50% width
- Millor proporció amb resum setmanal

### FB-014: Actes — treure Estat i Ref Externa
> "No te sentit que si creo una acta nova em deixi escollir l'estat. Treu-lis el camp estat. El camp Ref externa no sé qué aporta. treu-la."
- Actes no tenen estat editable
- Treure camp "Ref Externa" de les actes

### FB-015: Actes — editor markdown fullscreen split
> "l'editor de markdown vull que el popup de acta sigui millor: que ocupi tota la finestra i que tingui una secció a l'esquerra amb el markdown i una secció a la dreta amb la visualització del markdown"
- Dialog fullscreen per actes
- Split view: editor markdown (esquerra) + preview renderitzat (dreta)

### FB-016: Notes — estat Active/Archived
> "les notes no haurien de tenir un estat com les tasks. Les notes haurien de tenir un estat de active i archived. Si una nota ja no aporta la posem a archived"
- Notes amb estat: ACTIVE / ARCHIVED (no OPEN/IN_PROGRESS/DONE/CANCELLED)
- Filtre a la secció Notes per veure archived
- Per defecte mostrar només ACTIVE

### FB-017: Temes — ✅ BEN FETS
> "Els temes ara estan MOLT BE, gracies"
