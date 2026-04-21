# PETICIONS I REQUISITS — Workboard v1.x

> **IMPORTANT**: Aquest fitxer és la font de veritat per totes les peticions de l'usuari.
> S'ha d'actualitzar cada cop que l'usuari demana un canvi.
> Mai s'ha de perdre context encara que es compacti la conversa.

---

## PROTOCOL DE REVISIÓ (OBLIGATORI)

> **Cada cop que s'implementin canvis i l'usuari els hagi de validar**, l'agent HA DE:
> 1. Revisar AQUEST document sencer per no deixar-se cap petició
> 2. Generar una **taula de revisió** amb TOTES les peticions implementades
> 3. La taula ha de tenir: ID, descripció curta, què comprovar, i columna per a ✅/❌
> 4. L'usuari valida cada punt i reporta els que fallen
>
> **Mai s'ha d'ometre aquest pas.** Si es compacta la conversa, rellegir aquest document.

---

## Historial de versions

| Versió | Data | Descripció |
|--------|------|------------|
| 1.0.0 | 2026-04-20 | Release inicial amb 9 blocs de millores |
| 1.1.0 | 2026-04-20 | Fixes crítics (LazyInit, BD persistent) |
| 1.2.0 | 2026-04-20 | Tots els 16 feedbacks implementats (FB-001 a FB-016) |
| 1.3.0 | 2026-04-20 | 23 feedbacks nous implementats (FB-018 a FB-040) |

---

## BLOC 1: Desplegable QuickCapture

### Petició original
> "el desplegable de notes i demes al meu dia es desplega cap a dalt.... resulta confús. Hauria de desplegar-se sempre cap abaix"

### Estat: ✅ IMPLEMENTAT (v1.2.0 — FB-006)
- Fixat amb `position="popper"` + `sideOffset={4}` + `side="bottom"` a tots els SelectContent.

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

### Estat: ✅ IMPLEMENTAT (v1.1.0 + v1.2.0)
- LazyInitializationException fixat (FetchType.EAGER a v1.1.0)
- Tags funcionen correctament: CRUD, multiselecció, creació inline, badges amb color

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

### Estat: ✅ IMPLEMENTAT (v1.1.0 + v1.2.0)
- Dialog centrat per Actes i Notes
- Tipus fix (MEETING_NOTE / NOTE) sense permetre canvi
- Editor markdown amb preview
- Estat i Ref Externa amagats al crear actes (FB-014)
- Dialog fullscreen per actes (FB-015)

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

### Estat: ✅ IMPLEMENTAT (v1.2.0 — FB-005 + FB-007)
- QuickCapture: NOMÉS Recordatori + Nota ràpida, amb Enter
- Botó "Nova Entrada" com a FAB (Floating Action Button) ben separat
- Secció QuickCapture visualment diferenciada amb icona ⚡
- Dialog NO es tanca al clicar fora

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

### Estat: ✅ IMPLEMENTAT (v1.2.0 — FB-010, FB-012, FB-013)
- Filtre presets: Avui, Aquesta setmana, Setmana passada, Aquest mes, Aquest any, Custom
- Formulari compacte (no full-width)
- Taula + resum amb max-width proporcionat

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

### Estat: ✅ IMPLEMENTAT (v1.2.0 — FB-017)
- Temes impactants amb backgrounds visuals, patrons SVG, identitat forta
- Miniatures reals al selector de temes

---

## BUGS TRANSVERSALS (detectats a les proves) — TOTS RESOLTS ✅

### BUG-001: LazyInitializationException — ✅ RESOLT (v1.1.0)
- **Fix**: `EntryTagEntity.tagEntity` canviat a `FetchType.EAGER`

### BUG-002: Dades perdudes al recarregar navegador — ✅ RESOLT (v1.1.0)
- **Fix**: BD SQLite configurada amb path persistent

### BUG-003: Entrades/Notes/Actes no es mostren després de crear — ✅ RESOLT (v1.1.0)
- **Fix**: Derivat de BUG-001, resolt amb el fix LazyInit

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

### FB-001: Toast notifications millorades — ⚠️ REBUTJAT → veure FB-018
> "el missatge de confirmació apareix abaix a la dreta molt petit. Voldria que fos una mica més gran i amb colors i emojis. ha de ser visual i bonic (i adaptat al TEMA escollit)"
- Toasts més grans, amb colors i emojis
- Adaptat als colors del tema actiu

### FB-002: Botons d'acció tasques — redisseny — ⚠️ PARCIAL → veure FB-019
> "No m'agraden els botons de pausar, finalitzar, cancelar.... es veuen poc integrats entre ells. Vull que tots els botons formin part de un unic element. No cal que tinguin text. Vull tots els botons un al costat de l'altre, amb colors adients i ben bonics"
- Grup de botons compacte, icon-only, colors integrats
- Un sol element visual cohesiu

### FB-003: Drag & Drop — ⚠️ CONCEPTE ERRONI → veure FB-020
> "He provat a arrossegar tasques pendents a la llista d'avui i no apareixen. desapareixen de la llista de pendent pero no es sumen a la de avui. Cal revisar aixo, es importantsissim!"
- Les tasques desapareixen de Pendent però no apareixen a Avui
- Probablement la data s'actualitza però la query del dashboard no la recull

### FB-004: Resum temps al DailyView — ✅ IMPLEMENTAT
> "La part del resum de temps del dia el voldria com surt a la secció de hores: amb colors i més gran. Però assegurant-te que surt no nomes el lloc on s'ha imputat sino el comentari."
- Resum amb barres de progrés i colors com WeeklySummary
- Mostrar projecte + comentari/descripció

### FB-005: Botó "Nova Entrada" — ⚠️ PARCIAL → veure FB-021
> "El boto de Nova entrada està MOLT MAL UBICAT. no el volia al mateix lloc que el de creació rapida. Analitza a nivell de UI/UX on quedaria millor: potser a l'esquerra del tot o a la barra lateral o a la capcelera general"
- Moure'l fora de la línia del QuickCapture
- Analitzar millor ubicació (sidebar? header? floating?)

### FB-006: Desplegable Select sempre cap avall — ✅ IMPLEMENTAT
> "Quan selecciono nota ràpida i torno a seleccionar el desplegable, apareix cap a munt"
- Forçar `side="bottom"` i `position="popper"` a tots els SelectContent

### FB-007: Separació visual QuickCapture vs Nova Entrada — ✅ IMPLEMENTAT
> "Vull que quedi ben diferenciada la secció de afegir nota/recordatori rapids i la secció de crear nova entrada normal. De forma visual, amb dibuixos, colors, bordes de colors, .... algo molt visual i facil de intuir."
- Dues seccions clarament diferenciades visualment
- Colors, bordes, icones descriptives

### FB-008: Tags — ❌ TRENCAT → veure FB-022
> "Les etiquetes no funcionen.... en la configuració no m'apareix cap i al crear-ne alguna diu que si pero no apareix ni en aquesta secció de la configuració ni en cap desplegable al intentar crear una nota"
- Tags no es mostren a Configuració > Etiquetes
- Crear diu OK però no apareix
- No apareixen als desplegables de creació
- Probablement el backend retorna OK però el frontend no refresca

### FB-009: Hores — accions sempre visibles — ⚠️ PARCIAL → veure FB-023
> "a la columna accions s'amagen les icones i queda lleig. Les icones s'han de veure sempre i no nomes al fer hover"
- Treure el group-hover i mostrar sempre editar/esborrar

### FB-010: Hores — filtre temporal millorat — ⚠️ PARCIAL → veure FB-024
> "Vull que el filtre sigui mes amigable: poder filtrar per Avui, aquesta setmana, la setmana passada, aquest mes, aquest any i custom."
- Presets: Avui, Aquesta setmana, Setmana passada, Aquest mes, Aquest any
- Custom: rang de dates personalitzat
- Treure el navegador de setmanes actual

### FB-011: Colors a projectes i tags — ❌ TRENCAT → veure FB-025
> "Vull que els projectes i tags tinguin assignat un color sempre i que es vegi a tot arreu on es cridin"
- Projectes amb color assignable (com els tags)
- Mostrar color a tot arreu (llistats, filtres, TimeLogs, etc.)

### FB-012: Hores — formulari més petit — ✅ IMPLEMENTAT
> "La part d'afegir hores ocupa massa. No hauria d'ocupar tot el width, sino ser un requadre mes petit i bonic."
- Formulari més compacte, no full-width

### FB-013: Hores — layout taula/resum — ✅ IMPLEMENTAT
> "Les imputacions no tenen tantes columnes com per ocupar tot aquell espai. Fes que com a molt ocupi la meitat de la pagina"
- Taula d'imputacions max 50% width
- Millor proporció amb resum setmanal

### FB-014: Actes — treure Estat i Ref Externa — ✅ IMPLEMENTAT
> "No te sentit que si creo una acta nova em deixi escollir l'estat. Treu-lis el camp estat. El camp Ref externa no sé qué aporta. treu-la."
- Actes no tenen estat editable
- Treure camp "Ref Externa" de les actes

### FB-015: Actes — editor markdown fullscreen split — ✅ IMPLEMENTAT
> "l'editor de markdown vull que el popup de acta sigui millor: que ocupi tota la finestra i que tingui una secció a l'esquerra amb el markdown i una secció a la dreta amb la visualització del markdown"
- Dialog fullscreen per actes
- Split view: editor markdown (esquerra) + preview renderitzat (dreta)

### FB-016: Notes — estat Active/Archived — ✅ IMPLEMENTAT
> "les notes no haurien de tenir un estat com les tasks. Les notes haurien de tenir un estat de active i archived. Si una nota ja no aporta la posem a archived"
- Notes amb estat: ACTIVE / ARCHIVED (no OPEN/IN_PROGRESS/DONE/CANCELLED)
- Filtre a la secció Notes per veure archived
- Per defecte mostrar només ACTIVE

### FB-017: Temes — ✅ BEN FETS
> "Els temes ara estan MOLT BE, gracies"

---

## FEEDBACK v1.2.0 — Peticions noves (20/04/2026)

### FB-018: Toast — redisseny complet — ✅ IMPLEMENTAT (v1.3.0)
> "No m'agrada l'estil. Hauria de ser NOMES UN emoji/icona. El que vull es que el mateix toast sigui del color que toca. Amb un fons d'un color adequat al tema i que les lletres + icona siguin del color adequat. Si has afegit algo haurà de ser verd, si edites potser blau i si esborres vermell. Ha de ser bonic, minimalista i que aporti molt visualment. Fes-lo més gran."
- Toast amb fons de color semàntic (verd=crear, blau=editar, vermell=esborrar)
- Una sola icona, minimalista, gran, adaptat al tema
- Més gran que l'actual

### FB-019: Botons acció — colors i icones — ✅ IMPLEMENTAT (v1.3.0)
> "Play hauria de ser verd. Pausa es gris i no es correcte. El quadrat verd de finalitzar no dona sensació de finalitzar — potser un tic? Quedarien millor amb border colorit, ombra... algo més estètic."
- Play = verd
- Pausa = color adequat (analitzar UI/UX)
- Finalitzar = icona ✓ (tic) en lloc de quadrat
- Botons amb border, ombra, estètica millorada

### FB-020: Tasques noves SEMPRE a Pendent (CONCEPTUAL) — ✅ IMPLEMENTAT (v1.3.0)
> "Quan crees una tasca nova ja es posa amb data d'avui i automaticament es posa a Avui i no a Pendent. Una cosa es quan s'ha creat la tasca i l'altre quan es farà. Cada vegada que crei una tasca nova ha d'anar a pendent. SEMPRE!"
- Diferenciar `created_at` (automàtic) de `due_date` (quan fer-la)
- Tasques noves: due_date = NULL → van a Pendent
- Planificar = assignar due_date a avui → mou a Avui
- Cal afegir camp `due_date` al backend (migració DB) i frontend

### FB-021: Botó Nova Entrada també a dalt — ✅ IMPLEMENTAT (v1.3.0)
> "M'agrada que estigui separat i la nova ubicació es correcte però m'agradaria que també hi hagués un botó adalt"
- Mantenir FAB
- Afegir botó a la capçalera/toolbar

### FB-022: Tags NO funcionen — CRÍTIC — ✅ RESOLT (v1.3.0)
> "No funcionen els tags! Ni la creació ni el llistat ni apareixen enlloc. Revisa MOLT BE tot el codi."
- Error de backend: `Error parsing time stamp` a la taula tag
- La columna `created_at` és TEXT però Hibernate espera TIMESTAMP
- Cal migració per fixar el tipus de columna

### FB-023: Edit hover color a TimeLogs — ✅ IMPLEMENTAT (v1.3.0)
> "Si fas hover a edit no canvia de color. Passa de gris a blanc pero el blanc no queda bé."
- Canviar color hover del botó edit a un color adequat (blau?)

### FB-024: Filtre temporal — UI no salti — ✅ IMPLEMENTAT (v1.3.0)
> "Si pitjes Avui no apareix a sota el rang de data i en les altres si. Això genera que la UI es mogui i queda FATAL!"
- Mantenir espai fix per al rang de dates (visible o invisible)
- Tot ben integrat, sense salts de UI

### FB-025: Projectes NO funcionen — CRÍTIC — ✅ RESOLT (v1.3.0)
> "No funcionen els projectes. Error de que ja existeix però no apareix enlloc."
- Error backend: `no such column: pe1_0.color` — falta migració V6
- Cal afegir columna `color` a la taula project
- Això trenca TOTA la funcionalitat de projectes, hores i tags

### FB-026: Resum setmanal Hores — massa petit — ✅ IMPLEMENTAT (v1.3.0)
> "El resum setmanal s'ha fet molt petit i no m'agrada. Casi que es veu millor a El meu dia. Ha de tenir la seva secció específica."
- Replantejar layout de la pàgina Hores amb UI/UX adequat
- Resum setmanal amb secció pròpia, proporcionada i visual

### FB-027: Actes — Estat i Ref Externa a edició — ✅ IMPLEMENTAT (v1.3.0)
> "No apareixen al crear però al editar sí. Haurien de desaparèixer de totes."
- Amagar Estat i Ref Externa tant a creació com a edició d'actes

### FB-028: Actes — pàgina completa (no popup) — ✅ IMPLEMENTAT (v1.3.0)
> "Al editar un acta apareix a la dreta de la pantalla. Al crear obre un popup incòmode. Hauria de ser una pantalla nova que ocupi tot."
- Crear/editar acta → navegació a pàgina nova (no Dialog ni Sheet)
- Pantalla completa amb editor markdown a l'esquerra i preview a la dreta
- Botons crear/cancel·lar visibles

### FB-029: Text llarg — word wrap — ✅ IMPLEMENTAT (v1.3.0)
> "Si poso un text molt llarg es fa scroll horitzontal i queda FATAL! Ha de continuar abaix."
- `word-wrap: break-word` / `overflow-wrap: break-word` als contenidors de text
- Mai scroll horitzontal en textos

### FB-030: Estat "OBERT" → renombrar — ✅ IMPLEMENTAT (v1.3.0)
> "No m'agrada GENS l'estat 'OBERT'. Hauria de ser 'No iniciat', 'Pendent' o 'Nou'."
> "Tampoc m'agrada que 'En curs' sigui groc. Conceptualment potser hauria de ser verd?"
- OPEN → "Nou" o "Pendent" (analitzar)
- Revisar colors: IN_PROGRESS potser verd, DONE altre color
- Analitzar UI/UX per coherència

### FB-031: Borde entrada — full border vs línia esquerra — ✅ IMPLEMENTAT (v1.3.0)
> "La línia vertical a l'esquerra no m'agrada. Crec que hauria de ser tot el borde del color que toca."
- Full border del color del tipus en lloc de només línia esquerra
- Analitzar UI/UX per validar

### FB-032: Secció "Entrades" — renombrar — ✅ IMPLEMENTAT (v1.3.0)
> "El nom Entrades com a secció no es gens intuitiu."
- Buscar millor nom (Tasques? Registre? Activitat?)

### FB-033: Color picker — millorar UX — ✅ IMPLEMENTAT (v1.3.0)
> "La selecció de color del projecte i tag és horrible. Cal que es vegi MOLT BE quin has seleccionat."
- Border diferent al color seleccionat, més gran, visual clar
- Aplicar tant a projectes com a tags

### FB-034: Hores — projectes no carreguen — ✅ RESOLT (v1.3.0)
> "Intento crear una hora però error... No es carreguen els projectes al desplegable."
- Derivat de FB-025 (projectes trencats per falta migració)

### FB-035: Botó crear — només Tasca i Nota — ✅ IMPLEMENTAT (v1.3.0)
> "Quan clico el botó de crear permet escollir recordatori o acta i no té sentit des d'allà."
- Dialog de creació: només opcions Tasca i Nota
- Recordatoris es creen via QuickCapture
- Actes es creen des de la seva pàgina

### FB-036: Crear tasca — no seleccionar estat — ✅ IMPLEMENTAT (v1.3.0)
> "No té sentit que al crear una tasca puguis seleccionar l'estat. Ha d'estar en estat de nova."
- Amagar camp Estat al crear una tasca nova
- Estat per defecte = OPEN (que es mostrarà com "Nou")

### FB-037: Prioritats — renombrar — ✅ IMPLEMENTAT (v1.3.0)
> "Canviem les prioritats: P1-Inmediata, P2-Urgent, P3-Alta, P4-Normal (default), P5-Baixa"
- P1 = Immediata (vermell)
- P2 = Urgent (taronja)
- P3 = Alta (groc)
- P4 = Normal — DEFAULT SEMPRE (gris)
- P5 = Baixa (blau)

### FB-038: Layout general — massa centrat — ✅ IMPLEMENTAT (v1.3.0)
> "Has fet que a totes les finestres estigui el contingut centrat al mig amb molt de marges als costats. Es fa molt de scroll down i és absurd."
- Replantejar layouts per ocupar més width
- Reubicar elements per reduir scroll vertical

### FB-039: Filtres pàgina Entrades — ✅ IMPLEMENTAT (v1.3.0)
> "A la pantalla d'entrades caldrà actualitzar bé els filtres per poder filtrar per tot el que calgui."
- Revisar i ampliar filtres disponibles

### FB-040: Pin — botó amb icona PIN — ✅ IMPLEMENTAT (v1.3.0)
> "Per fixar una tasca no vull checkbox. Vull un botó amb la icona del PIN, més visual."
- Reemplaçar checkbox "Fixada" per icona 📌 toggle

---

## FEEDBACK v1.3.0 — Peticions noves (21/04/2026)

### FB-041: Prioritat default = P4 Normal (treure "Sense prioritat")
> "El desplegable de prioritats segueix mostrant 'Sense prioritat'. Aquest estat no hauria d'existir. El que ha de mostrar per defecta es el de prioritat Normal."
- Treure opció "Sense prioritat" del selector
- Default sempre = P4 Normal
- Aplicar tant a creació com a edició

### FB-042: Toasts — estil visual NO aplicat (FB-018 pendent)
> "El toast de creació de tasca es petit, sense color i lleig. Hauria de mostrar-se amb color i més vistós. El mateix passa amb el toast per esborrar."
> "Quan es crea un recordatori apareix un toast de creació petit i amb icona lletja de tic. Es diferent al que apareix quan es crea una tasca. Haurien de ser el mateix estil."
- Tots els toasts han de ser: grans, amb fons de color semàntic (verd=crear, blau=editar, vermell=esborrar)
- Mateixa mida i estil per TOTS els tipus d'entrada
- Eliminar emojis/icones lletges — icona neta i minimalista
- Sonner `toast.success/info/error` ha d'usar els classNames definits a App.tsx

### FB-043: Pin — separar del grup de botons d'acció
> "La icona del pin posa-la separada. No té sentit dins del grup de botons de cicle de vida (play/pausa/etc)."
- Treure Pin del grup de botons d'acció (play/pause/finish/cancel)
- Posar-lo en posició separada, pensat per UI/UX (ex: cantonada superior dreta de la card)

### FB-044: Nou estat "Pausada" — coherència d'estats
> "Una tasca nova que es posa en curs i després en pausa no hauria d'estar en estat Nou, sino Pausada. Afegim aquest nou estat."
- Afegir estat PAUSED al backend (enum EntryStatus)
- Migració DB si cal
- Botó Pausa → canvia a PAUSED (no a OPEN)
- Label: "Pausada", color adequat (ambre/groc)
- Des de PAUSED es pot tornar a IN_PROGRESS o DONE

### FB-045: Camp "Data" al crear — amagar / renombrar
> "Apareixen dos camps de data: Data i data planificada. Cal un rename de 'Data' per posar 'Data de creació' i no s'ha de poder editar. NO ES MOSTRI en el popup de creació. A l'edició apareix com a camp visual no editable."
- Al CREAR: amagar camp "Data" completament (es posa automàticament)
- Al EDITAR: mostrar com "Data de creació", disabled, només visual
- Mantenir camp "Data planificada" editable per tasques

### FB-046: Toast cancel·lació tasca
> "Quan cancel·les una tasca desapareix del meu dia sense cap confirmació en el toast."
- Mostrar toast vermell "Cancel·lada" quan es cancel·la una tasca

### FB-047: Error al canviar d'estat CANCELLED → IN_PROGRESS
> "He intentat passar una tasca de cancel·lat a en curs i em dóna error."
- Permetre transicions d'estat: CANCELLED → OPEN / IN_PROGRESS
- O bé definir transicions vàlides i mostrar botons coherents

### FB-048: Error al editar tasca (UNIQUE constraint entry_tag)
> "Intento editar una tasca i em dóna error. L'únic canvi que he intentat ha sigut treure-li el pin. Apareix error per consola: UNIQUE constraint failed: entry_tag.entry_id, entry_tag.tag"
- Bug backend: al fer update amb tags, intenta re-inserir tags existents
- Cal fer diff de tags (eliminar els que ja no hi són, afegir els nous) en lloc de re-inserir tots

### FB-049: Pàgina Hores — revisió estètica UI/UX
> "Segueix sense agradar-me gens l'estil visual de la pantalla de les hores. Està tot apretat, sense estil i sense armonia. Fes un bon anàlisi de UI/UX."
- Reorganitzar seccions de la pàgina
- Millorar espaiat, tipografia, harmonia visual
- Mantenir funcionalitat actual

### FB-050: Acta — borde input títol desigual
> "Quan creo un acta de reunió i poso el títol es resegueix el borde de color blau però de forma desigual."
- Revisar CSS del camp títol a ActaEditorPage: borde uniforme al focus

### FB-051: Notes — amagar estat al crear
> "Quan es crea una nota nova apareix el desplegable de l'estat. No vull que aparegui al crear perquè no té sentit. Totes les notes noves han de ser en estat nou."
- Amagar camp Estat al crear notes (com ja es fa amb tasques)
- Estat per defecte = OPEN
- A l'edició sí que es pot canviar

### FB-052: Exportació — format millorat
> "El que es pinta a l'exportació és estrany: tots barrejats. S'hauria de mostrar clarament i per punts el tipus d'input que s'ha creat i ben formatat."
- Agrupar per tipus: Tasques, Notes, Actes, Recordatoris, TimeLogs
- Format clar amb seccions separades i ben formatades

### FB-053: "El meu dia" — NO mostrar notes ni actes a AVUI
> "Quan crees un acta de reunió apareix a la secció d'AVUI del meu dia. No haurien d'aparèixer les actes ni les notes ràpides aquí."
- Columna AVUI del DailyView: NOMÉS tasques (TASK)
- Filtrar notes (NOTE) i actes (MEETING_NOTE) de la columna Avui

### FB-054: Nota → Tasca — botó visual de conversió
> "La possibilitat ja existeix (canviant tipus a l'edició). Simplement el que farem serà afinar-ho amb un botó per fer-ho més visual."
- Afegir icona/botó de conversió a la card de la nota (ex: icona de transformar)
- Al clicar: canvia type de NOTE a TASK, due_date=null → apareix a Pendent

### FB-055: Nova secció "Tasques" al sidebar
> "Caldria crear una nova secció similar a la de Notes però específica per les tasques."
- Nova pàgina Tasques (similar a Notes) amb llistat de tasques
- Filtres per estat, prioritat, etc.

### FB-056: Reordenar sidebar
> "El nou ordre serà: El meu dia - Hores - Tasques - Notes - Actes - Registre"
- Ordre: El meu dia → Hores → Tasques → Notes → Actes → Registre

### FB-057: Registre — falta botó Pausa a IN_PROGRESS
> "He anat al registre, li he posat start. Em canvia a 'En curs' correctament però no m'apareix el botó de pausa. Només apareix cancel, finalització i el pin."
- A la vista Registre (EntryList), quan status=IN_PROGRESS: mostrar botó Pausa
- Coherent amb DailyView

### FB-058: FB-021 — reubicar botó Nova Entrada
> "No m'agrada allà adalt. Hauria d'estar més aprop de la zona de captura ràpida, a l'esquerre. Per sobre o per sota de la captura ràpida. Ambdues zones diferenciades."
- Treure botó "+ Nova Entrada" del header/TopBar
- Posar-lo prop de la Captura Ràpida (per sobre o per sota)
- Mantenir diferenciació visual entre les dues zones
- Mantenir el FAB (botó rodó) a baix a la dreta

### FB-059: FB-031 — Borde color NO aplicat correctament
> "A la secció del meu dia no veig cap card amb borde de color. A la secció d'actes segueixen mostrant la barra vertical lletja a l'esquerra."
- Assegurar que TOTES les cards a TOTES les pàgines tenen border-2 del color del tipus
- Actes: treure barra vertical esquerra, posar full border
- Verificar: DailyView, EntryList, ActesPage, NotesPage

### FB-060: FB-023 — Aplicar hover color a TOTS els llocs
> "Aplica-ho també als altres llocs del projecte on hi hagi icones similars."
- Revisar tots els botons d'acció (edit/delete) a tot el projecte
- Hover: canvi a blau (no blanc) consistentment
