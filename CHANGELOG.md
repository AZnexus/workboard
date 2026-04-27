# Changelog — Workboard

Historial de versions del projecte. Cada versió documenta els canvis incorporats.

---

## v2.3.23 — 2026-04-27

- **TopBar / Quick Capture**: Ampliada la `Quick Capture` compacta perquè aprofiti molt millor l’espai flexible de la capçalera i arribi aproximadament cap al centre de la web.
- **TopBar / Quick Capture**: Mantinguda intacta l’estructura general del header (`Nou` + captura + cerca) aplicant només un augment del límit màxim d’amplada del contenidor compacte.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build` i generació d’un nou jar versionat per incloure l’ajust de layout a la release.

---

## v2.3.22 — 2026-04-27

- **Tasques / Prioritats**: Introduïts tokens globals reutilitzables de prioritat perquè la jerarquia visual sigui molt més clara a tota la UI de tasques.
- **Tasques / Prioritats**: `Immediata` es manté en vermell, `Urgent` passa a taronja clarament diferenciat i `Alta` queda en groc/ambre, evitant la confusió visual anterior entre `Urgent` i `Alta`.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build` i generació d’un nou jar versionat per incloure el canvi de semàntica visual a la release.

---

## v2.3.21 — 2026-04-27

- **Actes / Editor**: Corregit el càlcul de l'alçada de la barra de format i de la capçalera de `Vista Prèvia` perquè comparteixin una alçada fixa real i no una alineació aproximada per `min-height`.
- **Actes / Editor**: Eliminada la dependència del contingut intern per a la simetria de la franja superior del cos editor/prèvia, deixant la línia divisòria perfectament quadrada entre ambdós panells.
- **Validació**: Revalidació amb `npm run build` frontend i generació d’un nou jar versionat per comprovar el fix d’alçada exacta.

---

## v2.3.20 — 2026-04-27

- **Actes / Editor**: Igualada l'alçada visual de la barra de format de l'editor i la capçalera de `Vista Prèvia` perquè la divisió vertical entre els dos panells es llegeixi neta i simètrica.
- **Actes / Editor**: Harmonitzats padding, border i ritme vertical de les dues franges superiors del cos editor/prèvia sense alterar el model de comparació Markdown ↔ renderitzat definit a la versió anterior.
- **Validació**: Revalidació amb `npm run build` frontend i generació d’un nou jar versionat per comprovar el retoc visual fi del separador superior.

---

## v2.3.19 — 2026-04-27

- **Actes / Editor**: Replantejat el layout perquè les metadades visquin en una sola franja superior d’amplada completa i, a sota, editor i vista prèvia funcionin com una comparació directa costat a costat.
- **Actes / Editor**: `Títol` i `Data` passen a sincronitzar-se dins del markdown, igual que `Assistents`, de manera que la vista prèvia mostra únicament el document real editable i no contingut afegit fora del cos markdown.
- **Actes / Editor**: Eliminada la capçalera especial de la prèvia i ajustats els estils perquè el `# Títol` renderitzat dins del markdown mantingui la jerarquia visual forta al panell dret.
- **Validació**: Revalidació amb `npm run build` frontend i generació d’un nou jar versionat per a comprovació manual del nou model editor-vs-preview.

---

## v2.3.18 — 2026-04-27

- **Actes / Editor**: Compactades les metadades del panell esquerre en un grid curt perquè deixin d'ocupar vertical innecessària i cedeixin espai real a l'edició Markdown.
- **Actes / Editor**: Eliminada la duplicació de metadades a la vista prèvia per convertir el panell dret en una comparació directa del cos renderitzat, al costat del text editable.
- **Actes / Editor**: Ajustada la capçalera dels dos panells perquè editor i preview comencin a la mateixa alçada visual exacta, mantenint el footer de mètriques sempre visible.
- **Validació**: Revalidació amb `npm run build` frontend i generació d'un nou jar versionat per a comprovació manual del nou layout comparatiu.

---

## v2.3.17 — 2026-04-27

- **Actes / Editor**: L'editor d'actes passa a usar realment un layout full-width/full-height dins del `AppShell`, evitant que el contenidor pare estranguli la pantalla d'edició.
- **Actes / Editor**: La vista prèvia reserva ara un bloc de capçalera i metadades equivalent al costat editor perquè el contingut renderitzat comenci molt més alineat amb el text editable.
- **Actes / Editor**: Mantingut el patró d'scroll intern a editor i prèvia, amb el footer de mètriques fora de la zona scrollable per quedar sempre visible.
- **Validació**: Revalidació amb `npm run build` frontend i `./mvnw clean package`, generant un nou jar versionat per a comprovació manual del layout.

---

## v2.3.16 — 2026-04-24

- **Tasques / Formulari**: Reequilibrat el diàleg global de creació perquè `Data planificada` ocupi l'espai just, `Prioritat` respiri millor i `Cos / Detalls` tingui més protagonisme en el flux de treball.
- **Registre i Actes**: Redissenyats els blocs de filtres amb títols, labels i jerarquia consistent perquè cerca, estat, tipus, període i ordenació siguin més clars i més visuals.
- **El meu dia / Toasts**: Fets més explícits els badges de secció amb color semàntic, mogut el toaster a `top-right` i afegida descripció accessible al diàleg global `Nou` per eliminar l'avís runtime de Radix.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build`, revisió Oracle i comprovació runtime headless sobre `/`, `/entries`, `/actes` i el flux `Nou → Nova Tasca`, confirmant filtres renderitzats, consola neta i absència de warnings al diàleg global.

---

## v2.3.15 — 2026-04-24

- **Actes / Editor**: Reorganitzada la capçalera perquè les accions globals (`Guardar`, `Cancel·lar`, copiar i imprimir) quedin separades del contingut del document i la navegació sigui més clara.
- **Actes / Editor**: Convertits títol i metadades (`Data`, `Etiquetes`, `Assistents`, fixació) en una capçalera documental més neta i menys atapeïda, amb millor jerarquia visual.
- **Actes / Editor**: Refinades l’àrea d’edició Markdown, la toolbar i la vista prèvia amb una separació més natural entre panells i millor lectura general.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build`, revisió Oracle i comprovació runtime headless a `/actes/new`, confirmant creació real d’una acta (`POST /api/v1/entries => 201`), toast `Acta creada` i absència d’overflow horitzontal en vista mòbil.

---

## v2.3.14 — 2026-04-24

- **Hores / Pàgina**: Recomposta la capçalera, els presets i el layout principal perquè la vista d'hores se senti més cohesionada, amb millor jerarquia i menys fragmentació visual.
- **Hores / Formulari i taula**: Polits els camps, la lectura de la taula i l'estat buit perquè el flux d'alta i consulta sigui més net tant en escriptori com en responsive.
- **Hores / Resum**: El resum lateral ara calcula totals i hores per projecte a partir del mateix rang visible, incloent el mode `Personalitzat`, evitant desalineacions amb el llistat.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build`, revisió Oracle i comprovació runtime headless del flux Hores confirmant alta/esborrat, toast `Esborrat`, rang personalitzat correcte i absència d'overflow horitzontal en vista mòbil.

---

## v2.3.13 — 2026-04-24

- **Toasts / Estil global**: Redissenyat el wrapper compartit de Sonner perquè els toasts siguin més grans, més nets i amb color semàntic coherent amb el design system.
- **Toasts / Missatges**: Eliminades les icones/emoji redundants dels missatges visibles perquè el toast utilitzi una sola icona global i una lectura més minimalista.
- **Toasts / Semàntica**: Corregits els fluxos visibles d'alta, edició i esborrat perquè el color del toast correspongui realment al resultat de l'acció.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build`, revisió d'Oracle i comprovació runtime headless sobre el flux d'afegir hores, confirmant l'aparició del toast `Temps afegit` amb el nou estil global.

---

## v2.3.12 — 2026-04-24

- **Tasques / Formulari**: El diàleg de `Nova Tasca` passa a prioritzar el flux real de planificació mostrant `Data planificada` i `Prioritat` immediatament després del títol.
- **Tasques / Formulari**: La resta del formulari de tasca queda ordenada com `Ref Externa`, `Etiquetes` i `Cos / Detalls`, mantenint intactes els condicionals compartits de notes, actes i edició.
- **Validació**: Revalidació amb `npx tsc --noEmit`, `npm run build` i comprovació headless del runtime local confirmant l'ordre visible `Títol → Data planificada → Prioritat → Ref Externa → Etiquetes → Cos / Detalls`.

---

## v2.3.11 — 2026-04-24

- **Tasques / My Day**: Polits els colors de les icones de shell i metadades perquè `El meu dia`, `Tasques`, `Fixades`, els estats buits i els pins visuals segueixin millor la semàntica del design system.
- **Tasques / Cards**: Les icones de tipus (`Tasca`, `Nota`, `Reunió`, `Recordatori`) i el pin no fixat ara comuniquen millor el seu rol sense quedar apagats o genèrics.
- **Filtres**: El toggle de fixats passa a seguir el mateix llenguatge visual neutral→accent que la resta de superfícies de tasques.
- **Validació**: Revalidació amb build/typecheck frontend, regeneració d’assets empaquetats i comprovació headless curta del runtime local sense errors de consola.

---

## v2.3.10 — 2026-04-24

- **Tasques / Prioritats**: Labels de prioritat unificades a tota la UI de tasques amb un helper compartit, eliminant el soroll dels prefixos `P1 --`, `P2 --`, etc.
- **Tasques / My Day**: Les cards de tasca mostren ara un badge visible de `due_date` amb color semàntic segons urgència.
- **Tasques / My Day**: Afegit el moviment simètric `Pendent -> Avui` i `Avui -> Pendent` tant amb botó com amb drag-and-drop, basat en `dueDate`.
- **Backend / API**: El PATCH d'entrades ara diferencia entre `dueDate` absent i `dueDate: null`, permetent netejar explícitament la planificació d'una tasca.
- **Validació**: Afegides proves de servei/controller per al clear explícit de `dueDate`, revalidació build/typecheck frontend i comprovació runtime headless del flux `Moure a pendents` contra el jar fresc de la release.

---

## v2.3.8 — 2026-04-24

- **Projectes**: Creació de projectes corregida enviant colors hex compatibles amb la validació del backend en lloc de tokens CSS
- **Projectes**: Missatge d’error de creació refinat perquè només indiqui duplicat quan realment el backend informa que el nom ja existeix
- **Validació**: Flux local verificat amb creació, llistat i esborrat de projecte via API abans de generar la release

---

## v2.3.9 — 2026-04-24

- **My Day / Pendents**: Les tasques amb data planificada futura o passada ara es mantenen visibles a `Pendents`; només les que vencen avui queden fora del backlog
- **Dashboard**: La classificació del backlog passa a fer-se al servei amb una regla explícita en lloc de dependre d'una query JPA amb desigualtat de dates que fallava en runtime
- **Validació**: Afegides proves focalitzades de servei/repositori i revalidació runtime real contra `/api/v1/dashboard/daily` després d'eliminar un jar local antic que estava ocupant el port 8080

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
- Protocol de revisió documentat al document canònic de governança del projecte

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
