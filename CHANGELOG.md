# Changelog — Workboard

Historial de versions del projecte. Cada versió documenta els canvis incorporats.

---

## v2.3.7 — 2026-04-24

- **Quick Capture**: Captura ràpida compacta ampliada amb amplada fluida perquè la barra de text arribi aproximadament fins a mitja pàgina
- **TopBar**: Agrupació `Nou` + captura ràpida preservada mentre la cerca continua ancorada a la dreta
- **Validació**: Build/package local refets per incloure el nou ajust d’amplada a la release

---

## v2.3.2 — 2026-04-23

- **Sidebar**: Rail lateral actiu corregit perquè sigui integrat i fidel al patró del showcase, sense efecte flotant
- **Sidebar**: Lockup `Work.board` fet més protagonista amb millor jerarquia visual
- **Sidebar**: Mode col·lapsat refinat perquè el logo principal tingui més presència i la composició es vegi orgànica
- **Validació**: Nova comprovació runtime/visual del sidebar en estat expandit i col·lapsat abans del tancament

---

## v2.3.3 — 2026-04-23

- **Sidebar**: Fletxa del mode col·lapsat recentrada perquè quedi alineada amb el logo principal i no interfereixi visualment amb el lockup
- **Sidebar**: Lockup `Work.board` ajustat perquè el punt i la mida del wordmark es vegin naturals sense truncar-se en runtime
- **Sidebar**: Rail actiu refinat amb costat esquerre pla i accent integrat, fidel al patró del showcase
- **Validació**: Build frontend i comprovació runtime real del sidebar en estat expandit i col·lapsat abans del versionat

---

## v2.3.4 — 2026-04-23

- **Sidebar**: Lockup `Work.board` refinat amb més aire visual al punt i millor proporció del wordmark dins del header
- **Sidebar**: Icona principal del brand reforçada perquè tingui més presència al costat del títol i també en estat col·lapsat
- **Sidebar**: Botó de plegar integrat dins del header perquè no sembli flotant ni ofegui el wordmark
- **Sidebar**: Ítem actiu canviat a accent lateral corbat i integrat amb les cantonades del requadre, alineat amb la referència demanada
- **Validació**: Comprovació runtime del sidebar en estat expandit i col·lapsat, més build frontend i package Maven abans del release

---

## v2.3.5 — 2026-04-23

- **TopBar**: Header global alineat en alçada amb la banda del brand del sidebar perquè les separacions horitzontals coincideixin visualment
- **TopBar**: Botó `Nou` refinat perquè es llegeixi millor com a trigger de dropdown abans del clic
- **Quick Capture**: Selector `Recordatori` ampliat i captura ràpida reequilibrada amb una amplada més continguda i sense la separació vertical lletja
- **Search**: Camp de cerca refet amb contenidor propi perquè la icona i el placeholder no se sobreposin
- **Sidebar**: Estat col·lapsat actualitzat amb botó separat i visible per expandir el sidebar, independent del logo
- **Validació**: Verificació runtime del header i sidebar, més build frontend i package Maven abans del release

---

## v2.3.6 — 2026-04-23

- **TopBar**: Captura ràpida retornada al costat del botó `Nou` per recuperar l’agrupació correcta de la capçalera
- **TopBar / Quick Capture**: Eliminades les dobles capes visuals forçant inputs i selector interns a ser transparents dins dels seus contenidors
- **Search**: Camp de cerca mantingut amb contenidor únic i input intern sense capes superposades
- **Validació**: Revalidació runtime específica de la regressió visual abans del nou release

---

## v2.3.1 — 2026-04-23

- **Sidebar**: Títol del sidebar refinat amb lockup visual tipus showcase (`Work.board`) i icona accentuada
- **Sidebar**: Ítem actiu ara mostra rail lateral esquerre i estat actiu més elegant, alineat amb el design system
- **Validació**: Comprovació runtime/visual del sidebar feta abans de tancar el canvi

---

## v2.3.0 — 2026-04-23

- **Colors**: Eliminats TOTS els colors Tailwind hardcodejats (bg-green-500, text-blue-600, bg-red-500, etc.) de 10+ components
- **Colors**: Status/priority badges ara usen tokens semàntics DS (data-info, data-positive, data-warning, data-negative)
- **Colors**: Botons d'acció (save/edit/cancel) migrats a data-positive, accent-primary, data-negative
- **Colors**: TopBar icones → accent-primary
- **Toast**: Eliminats overrides de classNames a App.tsx — ara `<Toaster position="bottom-center" />` sense props de styling (index.css ja té els estils DS)
- **Text**: Tots els `text-[10px]` i `text-[11px]` → `text-xs` (escala DS)
- **Spacing**: `h-[48px]` → `h-12`, `gap-[16px]` → `gap-4` (tokens DS)

---

## v2.2.1 — 2026-04-22

- **Fix**: Border radius hardcodejats reemplaçats per tokens DS: `rounded-[16px]`→`rounded-xl`, `rounded-[12px]`→`rounded-lg`, `rounded-[10px]`→`rounded-lg`, `rounded-[6px]`/`rounded-[4px]`→`rounded-sm`
- **Fix**: `color: "#fff"` hardcodejat a button.tsx i badge.tsx → `hsl(0, 0%, 100%)`
- **Fix**: Label global font-size corregit de `text-xs` a `text-sm` (DS spec)
- **Fix**: Indigo Deep `--data-info` corregit de `hsl(190,60%,60%)` a `hsl(210,60%,60%)` (DS spec)
- **Fix**: Indigo Deep `--background` saturació corregida de 15% a 10% (DS spec)
- **Fix**: Indigo Deep `--tag-*` colors ajustats als valors exactes del DS
- **Fix**: Toast shadow `shadow-2xl` → `shadow-lg` (DS max shadow)
- **Tokens**: Afegides z-index utilities al `@theme inline` (z-base..z-tooltip)

---

## v2.2.0 — 2026-04-22

- **Temes**: Eliminats tots els temes fun (Matrix, Dragon Ball, Cyberpunk, Monokai, Nord)
- **Temes**: Implementats 7 temes oficials del Design System: Teal Night, Warm Earth, Steel Blue, Ember Rose, Jade Noir, Sunset Amber, Sage Mist
- **Layout**: Sidebar widths corregits a tokens DS (64px/240px)
- **Layout**: TopBar sticky amb z-40
- **Components**: Skeleton — eliminat animate-pulse redundant (CSS shimmer ja ho gestiona)
- **Components**: EntryCard — hover micro-interacció (translateY + shadow)
- **Components**: 8 empty states millorats amb icones i jerarquia de text (EntryList, DailyView ×5, TimeLogTable, ProjectsPage)
- **Colors**: Substituïts hex hardcodejats per CSS vars a WeeklySummary i ProjectsPage
- **Animacions**: Afegit @keyframes fadeUp + .animate-fade-up

---

## v2.1.0 — 2026-04-22

- **BREAKING**: Reescriptura completa de 15 components UI shadcn amb inline styles + CSS vars del design system
- Components reescrits: button, input, badge, card, tabs, dialog, sheet, dropdown-menu, select, table, tooltip, skeleton, textarea, alert-dialog (sonner ja correcte)
- Eliminats TOTS els CSS overrides via data-slot d'index.css (ara redundants)
- Conservats: form label global, progress bar, spinner, sonner toast CSS, reduced motion
- Fix: tabs active color — mogut a Tailwind class per permetre pseudo-class override
- Tema per defecte: Indigo Deep amb tokens CSS complets
- .gitignore actualitzat amb .playwright-mcp/ i screenshots/

---

## v2.0.3 — 2026-04-22

- Camí 2 completat: netejar className hardcoded dels TSX per deixar el design system CSS controlar
- Button variants CSS overrides: default (accent-primary), ghost, outline/secondary, destructive — alineats amb showcase
- Tabs pill: container surface-2, radius-full, active tab accent-primary fill amb text blanc
- Badge + Card TSX cleanup: eliminat className inline de ActesPage, EntryCard, TagMultiSelect
- Input/Form TSX cleanup: eliminat bg-background/border-border/text-foreground de EntryForm, ActesPage, ActaEditorPage
- TopBar "Nou" button: eliminat colors hardcoded (ara usa default variant = accent-primary)
- Eliminat tots els `rounded-[8px]` hardcoded → `rounded-md` (token del design system)
- Select, AlertDialog, form labels, body font-size CSS overrides afegits
- Verificació visual Playwright: totes les pàgines i dialogs verificats

---

## v2.0.2 — 2026-04-22

- Fix: tokens Indigo Deep corregits als valors exactes del showcase.html (saturation/lightness)
- Afegit `--accent-primary-hue` token per shadow-glow dinàmic i sidebar active
- Skeleton shimmer corregit a implementació showcase (::after pseudo-element amb transform)
- Sidebar menu button active: border-left accent-primary + fons translúcid hsla()
- Tabs: underline variant amb accent-primary border-bottom, pill variant amb accent fill
- Card variants semàntiques: .card-positive/negative/warning/info/accent amb color-mix()
- Progress bar + spinner components CSS afegits
- Light variant tokens ajustats per coherència amb showcase

---

## v2.0.1 — 2026-04-22

- Estils showcase aplicats a tots els components UI (paritat amb showcase.html)
- Scrollbar custom (Webkit + Firefox) amb tokens surface-3/border-strong
- Skeleton: shimmer animation amb gradient sliding (substitueix animate-pulse)
- Card: hover lift translateY(-2px) + shadow-md transition
- Dialog/Sheet: overlay backdrop blur(4px), surface-1 bg, radius-xl, shadow-lg
- Table: headers uppercase text-xs text-muted amb tracking, rows hover surface-2
- Input: h-10, bg-surface-2, focus glow amb shadow-glow + border accent-primary
- Badge: patró 15% opacity bg + full color text via color-mix()
- Button: h-10 default, active scale(0.97), transitions amb design system durations
- Sonner toast: left-border 3px semàntic (positive/negative/warning/info), surface-2 bg
- Tooltip: surface-2 bg, border-subtle, shadow-sm, radius-sm, max-width 220px
- Dropdown menu: surface-2 bg, border-subtle, shadow-md, min-width 180px
- Eliminada dependència next-themes de sonner.tsx (usava import inexistent)

---

## v2.0.0 — 2026-04-22

- Aplicat design system complet: arquitectura de tokens structure/accent separada
- Tema per defecte: Indigo Deep (dark) — inspirat en developer tools i observability platforms
- Tokens globals nous: spacing (space-0..16), typography (text-xs..4xl), radius, shadows, motion, z-index, easings
- Fonts: Inter (headings/body) + JetBrains Mono (codi)
- Variant light d'Indigo Deep disponible com a "Indigo Clar"
- Temes fun (Matrix, Dragon Ball, Cyberpunk, Nord, Monokai) adaptats a la nova arquitectura de tokens
- Colors semàntics nous: data-positive/negative/warning/info/neutral, tag-1..4
- Tailwind utilities noves: bg-surface-1/2/3, text-data-positive, border-border-strong, etc.
- Suport prefers-reduced-motion

---

## v1.8.2 — 2026-04-22

- Fix: eliminat `useBlocker` que requereix data router i trencava la pàgina de nova acta (mantingut `beforeunload` per avisar al tancar/refrescar)

---

## v1.8.1 — 2026-04-22

- Fix: ruta `/actes/new` declarada abans de `/actes/:id` per evitar pàgina buida al crear nova acta

---

## v1.8.0 — 2026-04-22

- Exportar acta al portapapers (HTML ric) i imprimir
- Mode lectura read-only per actes (`/actes/:id`)
- Comptador de paraules i temps estimat de lectura a l'editor
- Duplicar acta des de la llista
- Avís de canvis sense guardar amb `useBlocker` (confirmació abans de sortir)
- Ordenar llista d'actes per data o títol (ascendent/descendent)
- Convertir acció d'una acta en tasca (integració amb entries)
- Assistents amb autocomplete via `<datalist>` HTML natiu

---

## v1.7.0 — 2026-04-22

- Toolbar d'editor markdown a l'editor d'actes (negreta, cursiva, llistes, checkboxes, encapçalaments, separador)
- Substituït parser markdown propi per `react-markdown` + `remark-gfm` (suport complet: llistes numerades, codi, links, blockquotes, hr)
- Checkboxes interactius a la vista prèvia: clicar toggle `[ ]` ↔ `[x]`
- Plantilla acta ampliada amb secció "Assistents"
- Cards d'actes enriquides: data, preview del body, badge accions pendents (x/y)
- Cerca per títol i filtre per tags a la llista d'actes
- Dreceres de teclat: Ctrl+B (negreta), Ctrl+I (cursiva), Ctrl+S (guardar)
- Deduplicat `groupByDate`/`formatGroupDate` a utils compartit

---

## v1.6.0 — 2026-04-21

- Redisseny complet de "El meu dia": layout de 2 zones (primària + rail secundari)
- Zona primària amb 3 columnes ponderades: Ahir (24%) | **Avui hero** (45%) | Pendent (31%)
- Avui com a hero panel amb shadow-lg i border destacat
- Ahir i Pendent amb estil quiet (bg-card/50, border subtil)
- Rail secundari (340px fix) amb Recordatoris (top) i Temps (bottom)
- Divisor "Fetes" dins Avui amb border-t subtil
- Drag & drop preservat (Pendent → Avui)

---

## v1.5.4 — 2026-04-21

- Text del botó Nou en blanc (text-foreground) en lloc de blau

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
