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

### FB-001: Toast notifications millorades — ✅ IMPLEMENTAT
> "el missatge de confirmació apareix abaix a la dreta molt petit. Voldria que fos una mica més gran i amb colors i emojis. ha de ser visual i bonic (i adaptat al TEMA escollit)"
- Toasts més grans, amb colors i emojis
- Adaptat als colors del tema actiu

### FB-002: Botons d'acció tasques — redisseny — ✅ IMPLEMENTAT
> "No m'agraden els botons de pausar, finalitzar, cancelar.... es veuen poc integrats entre ells. Vull que tots els botons formin part de un unic element. No cal que tinguin text. Vull tots els botons un al costat de l'altre, amb colors adients i ben bonics"
- Grup de botons compacte, icon-only, colors integrats
- Un sol element visual cohesiu

### FB-003: Drag & Drop — ✅ RESOLT (funcionava post fix LazyInit v1.1.0)
> "He provat a arrossegar tasques pendents a la llista d'avui i no apareixen. desapareixen de la llista de pendent pero no es sumen a la de avui. Cal revisar aixo, es importantsissim!"
- Les tasques desapareixen de Pendent però no apareixen a Avui
- Probablement la data s'actualitza però la query del dashboard no la recull

### FB-004: Resum temps al DailyView — ✅ IMPLEMENTAT
> "La part del resum de temps del dia el voldria com surt a la secció de hores: amb colors i més gran. Però assegurant-te que surt no nomes el lloc on s'ha imputat sino el comentari."
- Resum amb barres de progrés i colors com WeeklySummary
- Mostrar projecte + comentari/descripció

### FB-005: Botó "Nova Entrada" — ✅ IMPLEMENTAT (FAB)
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

### FB-008: Tags — ✅ RESOLT (funcionaven post fix LazyInit v1.1.0)
> "Les etiquetes no funcionen.... en la configuració no m'apareix cap i al crear-ne alguna diu que si pero no apareix ni en aquesta secció de la configuració ni en cap desplegable al intentar crear una nota"
- Tags no es mostren a Configuració > Etiquetes
- Crear diu OK però no apareix
- No apareixen als desplegables de creació
- Probablement el backend retorna OK però el frontend no refresca

### FB-009: Hores — accions sempre visibles — ✅ IMPLEMENTAT
> "a la columna accions s'amagen les icones i queda lleig. Les icones s'han de veure sempre i no nomes al fer hover"
- Treure el group-hover i mostrar sempre editar/esborrar

### FB-010: Hores — filtre temporal millorat — ✅ IMPLEMENTAT
> "Vull que el filtre sigui mes amigable: poder filtrar per Avui, aquesta setmana, la setmana passada, aquest mes, aquest any i custom."
- Presets: Avui, Aquesta setmana, Setmana passada, Aquest mes, Aquest any
- Custom: rang de dates personalitzat
- Treure el navegador de setmanes actual

### FB-011: Colors a projectes i tags — ✅ IMPLEMENTAT
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
