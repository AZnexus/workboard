# Changelog — Workboard

Historial de versions del projecte. Cada versió documenta els canvis incorporats.

---

## v1.5.3 — 2026-04-21

- Botó Nou estil subtil (border blau, fons blau/10) coherent amb Captura Ràpida
- Captura Ràpida ocupa tot l'espai disponible (flex-1, sense max-width)

---

## v1.5.2 — 2026-04-21

- Botó `+ Nou` blau amb icona Sparkles daurada, opcions amb colors (blau/verd/violeta)
- Captura Ràpida més ample (max-w 720px)

---

## v1.5.1 — 2026-04-21

- Data al costat del títol "El meu dia" en la mateixa línia, separada amb `·`, text-lg muted

---

## v1.5.0 — 2026-04-21

Header global de creació — accions de creació accessibles des de qualsevol pàgina.

### Noves funcionalitats
- **Header global redissenyat** (56px): botó `+ Nou` amb dropdown (Nova Tasca, Nova Nota, Nova Acta) + Captura Ràpida + Cerca
- **Modal global d'EntryForm** muntat a AppShell amb context compartit (`useGlobalCreate`)
- **Captura Ràpida al header** amb mode `compact` (accent ambre, icona Zap)
- **Títol "El meu dia"** a DailyView amb data a sota en text petit

### Canvis
- Eliminats botons de creació locals de: DailyView, TasksPage, NotesPage, ActesPage
- Data moguda del header global a DailyView (només rellevant allà)
- Nou component `DropdownMenu` de shadcn/ui

---

## v1.4.2 — 2026-04-21

- Eliminat botó flotant (+) de la cantonada inferior dreta (redundant amb secció Crear Entrada)

---

## v1.4.1 — 2026-04-21

- Swap ordre seccions: Crear Entrada a l'esquerra, Captura Ràpida a la dreta

---

## v1.4.0 — 2026-04-21

Poliment visual de la DailyView i EntryForm.

### Millores visuals
- Captura Ràpida i Crear Entrada en la mateixa fila (flex-row)
- Emoji ✨ al títol de "Crear Entrada" en lloc de icona Plus
- Botons reanomenats: "Nova Tasca" / "Nova Nota" (abans "Crear Tasca"/"Crear Nota")
- Secció Crear Entrada no ocupa tot el width (shrink-0)
- Títol dinàmic al popup: "Nova Tasca", "Nova Nota", "Editar Tasca", "Editar Nota"
- Selector de tipus amagat quan es ve des dels botons (fixedType)
- Prioritats amb colors degradat (P1 vermell → P5 verd) al desplegable
- Botó Fixar integrat al costat de Ref Externa

---

## v1.3.0 — 2026-04-21

Versió major de funcionalitats noves i poliment visual post-feedback v1.2.0.

### Noves funcionalitats
- **FB-044**: Nou estat `PAUSED` ("Pausada") — Pausa → PAUSED en lloc de OPEN, botó Reprendre
- **FB-047**: Permetre transicions d'estat des de CANCELLED
- **FB-052**: Exportació Markdown agrupada per tipus (Tasques/Notes/Actes/Recordatoris)
- **FB-054**: Botó conversió Nota → Tasca a la pàgina de Notes
- **FB-055**: Nova pàgina "Tasques" al sidebar amb tabs Actives/Tancades
- **FB-056**: Sidebar reordenat: El meu dia → Hores → Tasques → Notes → Actes → Registre
- **FB-057**: Botó Pausa al Registre quan status=IN_PROGRESS
- **FB-058**: Secció "Crear Entrada" amb botons separats "Crear Tasca" (blau) i "Crear Nota" (verd)

### Millores visuals
- **FB-041**: Prioritat default P4 Normal, tret "Sense prioritat"
- **FB-042**: Toasts grans amb fons de color semàntic (verd/blau/vermell)
- **FB-043**: Pin separat del grup de botons d'acció
- **FB-045**: Camp Data: amagat al crear, "Data de creació" (disabled) a edició
- **FB-046**: Toast vermell al cancel·lar tasca
- **FB-049**: TimeLogsPage redisseny complet UI/UX — formulari estàtic, resum dinàmic segons filtre
- **FB-050**: ActaEditorPage borde títol uniforme al focus
- **FB-051**: Amagar estat al crear notes
- **FB-053**: DailyView columna AVUI: només tasques (filtrades notes i actes)
- **FB-059**: Full border color a TOTES les cards a TOTES les pàgines
- **FB-060**: Hover blau a tots els botons edit d'acció
- Dialog formulari més ample (max-w-2xl), form compacte sense scroll
- Resum d'hores dinàmic: Diari/Setmanal/Mensual/Anual segons filtre amb dates correctes

### Bugs corregits
- **FB-048**: UNIQUE constraint violation al fer update de tags — flush() entre clearTags i insert
- Tasques PAUSED es mantenen a la llista Avui del dashboard

---

## v1.2.0 — 2026-04-20

Implementació de 16 ítems de feedback (FB-001 a FB-016).

### Canvis principals
- Feedback complet de la v1.0.0 aplicat
- Protocol de revisió documentat a PETICIONS.md

---

## v1.0.0 — 2026-04-19

Primera release estable.

### Funcionalitats
- CRUD complet d'entrades (Tasques, Notes, Actes, Recordatoris)
- TimeLog amb registre d'hores per projecte
- Dashboard "El meu dia" amb 5 columnes i drag & drop
- Captura ràpida amb selector de tipus
- Gestió de projectes amb colors
- Tags configurables amb colors i multi-select
- Exportació Markdown
- Backup de base de dades
- Temes visuals (Matrix, Dragon Ball, Cyberpunk, Monokai, etc.)
- Prioritats P1-P5 amb filtre i ordenació
- SPA empaquetada com a fat JAR (`java -jar workboard.jar`)
