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

### 1. DailyView — Ajust visual de les icones de moviment i fixació
Millora de densitat visual i claredat semàntica a les columnes `Avui` i `Pendent`, mantenint les accions visibles però molt menys invasives.

### 2. Sistema de temes — Parelles Light/Dark + nous temes
Rework del selector de temes perquè cada identitat visual tingui variant `Light` i `Dark`, amb selector previ de mode i noves parelles de temes.

### 3. Easter eggs subtils
Afegir una capa petita d'easter eggs temporals i elegants, incloent codi Konami i referències discretes a Dragon Ball.

### 4. Nova secció `Millores`
Crear un espai específic per gestionar millores de producte, la seva valoració, el seguiment funcional i la redacció/exportació d'anàlisis en format compatible amb Redmine.

### 5. Versions a Configuració
Afegir una nova secció de `Versions` a `Configuració`, amb comportament semblant a `Projectes` o `Etiquetes`, per poder assignar una única versió opcional a cada tasca.

### 6. Nova secció `RETROS`
Crear un espai personal per preparar dues retros diferents (`Retro d'equip` i `Retro d'analistes`), amb històric arxivable, cerca pròpia i integració amb el registre general.

### 7. Cerca global / command palette
Afegir un punt únic de cerca i navegació ràpida per saltar a tasques, notes, actes, timelogs, registre i configuració sense dependre només del registre general.

### 8. Tasks i Notes — filtres avançats
Portar a `Tasks` i `Notes` una capacitat de filtratge més rica, apropant-les al nivell de potència que ja té el registre general.

### 9. Timelogs — drilldown per projecte i tasca
Permetre baixar del resum de timelogs al detall real per projecte o tasca per entendre millor on s'ha invertit el temps.

### 10. Tasques i notes — pàgines de detall estables
Donar a tasques i notes una vista de detall amb URL pròpia, separada del patró actual massa basat en llista + sheet d'edició.

### 11. Vistes guardades / presets de filtres
Permetre guardar combinacions habituals de filtres i estat de llista per reutilitzar-les a les seccions principals.

### 12. Actes — plantilles o fluxos inicials reutilitzables
Afegir plantilles o punts de partida per a actes recurrents per evitar recrear sempre la mateixa estructura manualment.

### 13. Accions massives a llistes i dashboard
Permetre operar sobre grups d'entrades al dashboard i a les llistes principals sense haver d'anar element a element.

### 14. Navegació entre elements relacionats
Facilitar salts directes entre tasques, notes, actes, projectes i timelogs quan ja existeixi una relació útil entre ells.

---

## Item 1 — DailyView: ajust visual de les icones de tasques pendents / avui

### Estat
Pendent.

### Objectiu
Fer que les accions ràpides de les targetes de `DailyView` continuïn sent visibles, però amb menys soroll visual i amb una semàntica de moviment més clara.

### Per què cal fer-ho

Actualment, les icones visibles dins les targetes ocupen massa protagonisme visual i en alguns casos semblen menjar-se massa alçada útil de la fitxa. Això fa que dues funcionalitats petites tinguin massa pes respecte al contingut principal.

### Què s'ha de fer

- Limitar l'abast **només** a `DailyView`.
- No extrapolar aquest canvi a `TasksPage` ni a altres llistes fins que hi hagi una decisió separada.
- Mantenir les icones **sempre visibles**, però reduint mida i impacte visual.
- Reubicar la icona de fixació (`pin`) en una posició petita a dalt a la dreta.
- Reubicar l'acció de moure la tasca a la part baixa esquerra, fora de la zona on acostuma a concentrar-se el text.
- Fer que la icona de moviment sigui semàntica:
  - a `Pendent`, una fletxa a l'esquerra
  - a `Avui`, una fletxa a la dreta

### Fitxers / zones candidates

- `src/main/frontend/src/components/dashboard/DailyView.tsx`
- possibles estils o helpers de targetes reutilitzats dins el dashboard

### Com s'hauria d'abordar

1. Revisar el layout actual de les targetes d'`Avui` i `Pendent`.
2. Fer un ajust local del posicionament i mida de les accions, sense redissenyar la resta de la targeta.
3. Assegurar que el text no queda envaït per les icones.
4. Comprovar que la direcció visual de les fletxes explica clarament el moviment.

### Validació recomanada

- revisió visual desktop
- revisió visual responsive
- comprovació que les dues accions continuen sent fàcils de clicar
- proves existents de `DailyView` i ajust de tests si cal canviar etiquetes o affordances

### Risc
Baix.

### Dependències

- cap dependència funcional de backend
- convé mantenir coherència amb el llenguatge visual general de targetes del dashboard

---

## Item 2 — Sistema de temes: selector Light/Dark, parelles equivalents i nous temes

### Estat
Pendent.

### Objectiu
Reorganitzar el sistema de temes perquè cada tema tingui dues variants equivalents (`Light` i `Dark`) i l'usuari pugui navegar el catàleg de manera més clara.

### Per què cal fer-ho

Ara mateix el sistema de temes no reflecteix prou bé la relació entre identitat visual i mode de color. La idea és que l'usuari triï primer si vol `Light` o `Dark`, i després vegi només les variants compatibles mantenint la mateixa identitat visual quan salta d'un mode a l'altre.

### Què s'ha de fer

- Afegir un selector previ `Light / Dark` a la zona de temes.
- Mostrar després només els temes del mode triat.
- Fer que cada tema existeixi com una **parella estricta**:
  - una variant `Light`
  - una variant `Dark`
- Conservar la mateixa identitat del tema en canviar de `Light` a `Dark` o al revés.
- Afegir **com a mínim 3 noves parelles** de temes.
- Prioritzar temes molt integrats, agradables i consistents amb el producte.

### Fitxers / zones candidates

- `src/main/frontend/src/config/themes.ts`
- `src/main/frontend/src/hooks/useTheme.tsx`
- `src/main/frontend/src/pages/ConfigPage.tsx`

### Com s'hauria d'abordar

1. Definir el model intern de parella `Light/Dark` per identitat de tema.
2. Adaptar el selector perquè primer es triï el mode i després la variant.
3. Garantir que, si l'usuari canvia de mode, es manté la identitat equivalent sempre que existeixi la parella.
4. Dissenyar i afegir les noves parelles de temes.

### Validació recomanada

- comprovació funcional del canvi de `Light` a `Dark` mantenint identitat
- revisió visual dels temes existents i dels nous
- comprovació de persistència de preferència si el sistema ja la desa

### Risc
Mitjà.

### Dependències

- coherència entre definició estàtica de temes i lògica de selecció/persistència

---

## Item 3 — Easter eggs subtils: Konami + Dragon Ball

### Estat
Pendent.

### Objectiu
Afegir petits detalls amagats que facin l'aplicació més divertida sense convertir-los en part del flux principal ni contaminar la UI diària.

### Per què cal fer-ho

Es busca una capa d'identitat i complicitat, però sense que l'aplicació perdi to professional ni sembli recarregada.

### Què s'ha de fer

- Implementar un detector del codi Konami.
- En activar-lo, mostrar un efecte visual temporal i algun detall extra ocult coherent.
- Afegir referències a Dragon Ball com a easter eggs **només subtils**.
- Evitar que aquests detalls quedin presents de manera permanent o invasiva.

### Restriccions explícites

- han de ser **només** easter eggs
- el to ha de ser elegant i subtil
- l'efecte del Konami ha de ser temporal, no persistent

### Fitxers / zones candidates

- pendent de decidir segons el punt de l'app on encaixi millor la interacció

### Com s'hauria d'abordar

1. Escollir una zona d'activació segura i no molesta.
2. Definir un efecte visual temporal amb prou personalitat però sense excés.
3. Escollir 1-2 referències de Dragon Ball que siguin recognoscibles però discretes.
4. Evitar dependències visuals permanents o sorolloses.

### Validació recomanada

- verificar que l'activació només passa quan toca
- comprovar que l'efecte desapareix sol
- revisar que no interfereix amb accessibilitat ni flux normal

### Risc
Baix.

### Dependències

- abans d'implementar convé concretar millor les referències exactes i el tipus d'efecte final

---

## Item 4 — Nova secció `Millores`

### Estat
Pendent, però amb definició funcional avançada.

### Objectiu
Crear una secció específica per treballar millores de producte i les seves valoracions directament dins Workboard, evitant dependre d'un editor extern per redactar anàlisis en format Redmine/Textile.

### Per què cal fer-ho

Actualment la feina d'anàlisi i valoració de millores viu massa fora de Workboard. La nova secció ha de permetre:

- veure l'estat global de cada millora d'un cop d'ull
- centralitzar requisits, context, tags, versió i enllaços externs
- redactar i revisar la valoració dins una experiència d'edició còmoda
- conservar informació clau d'hores, percentatges i seguiment

### Model funcional acordat

#### Entitats

- hi haurà dos tipus nous separats:
  - `Millora`
  - `Valoració`
- `Millora` s'ha de tractar com un **nou tipus d'input** i ha d'aparèixer al desplegable de creació de nous inputs
- cada `Millora` tindrà com a màxim **una sola** `Valoració`
- la `Valoració` podrà editar-se si cal, però continuarà sent única
- les tasques tècniques derivades del desenvolupament quedaran **només referenciades** de moment; no es modelaran encara com un tipus intern nou

#### Relació amb tasques normals

- una tasca normal es podrà relacionar opcionalment amb una `Millora`
- una tasca normal només es podrà relacionar amb **una sola** `Millora`
- aquesta relació s'haurà de valorar com a camp opcional, no obligatori

#### Percentatge

- el percentatge serà **sempre manual**
- s'aplicarà a `Valoracions`
- també s'aplicarà a tasques normals
- no s'ha d'inferir automàticament a partir de l'estat

### Navegació i UX general

- la llista principal de la secció `Millores` mostrarà **només les millores pare**
- no hi haurà una llista separada de valoracions com a secció principal, perquè cada `Millora` només tindrà una sola `Valoració`
- des de cada `Millora` s'accedirà a la seva única `Valoració`
- la `Millora` tindrà una vista resum global amb les dades útils més visibles, incloent la pròpia millora i l'accés a la subpàgina de valoració
- la `Valoració` seguirà el mateix patró conceptual que les actes:
  - primer vista de lectura
  - després, si cal editar, entrada explícita a l'editor
  - edició en pantalla partida amb editor + preview

### Camps de la `Millora`

- títol
- descripció senzilla / requisits
- Redmine ID de la millora
- prioritat
- due date
- JIRA associat
- versió
- nota associada
- tags
- hores venudes

### Regles específiques de la `Millora`

- `JIRA` serà **únic i opcional**
- la nota associada tindrà una **petita estructura fixa** amb tres camps curts:
  - `Context`
  - `Risc / dependència`
  - `Observacions`
- les hores venudes es posaran **manualment**

### Camps i creació de la `Valoració`

- la `Valoració` només es podrà crear des de la `Millora`
- en crear-la caldrà demanar l'**ID Redmine fill**
- la `Valoració` tindrà un **due date propi**, diferent del de la `Millora`
- el títol de la `Valoració` serà:
  - automàtic
  - derivat de la `Millora`
  - no editable
- valors inicials:
  - estat inicial = `valoració no començada`
  - percentatge inicial = `0`

### Herència cap a la `Valoració`

- `versió`: heretada i no editable
- `tags`: heretats i no editables
- `prioritat`: heretada inicialment però editable a la `Valoració`

### Editor de `Valoració`

La `Valoració` és la part on hi haurà la feina real de l'analista. L'editor no ha de ser un simple textarea Textile lliure, sinó una experiència útil i còmoda.

#### Requisits d'edició

- experiència similar a l'editor d'actes
- pantalla partida amb zona d'edició i preview
- barra de format al damunt
- ajuda perquè el format final sigui correcte sense perdre temps en formateig manual constant

#### Model d'edició acordat

- editor **híbrid**
- estructura dividida en **blocs guiats**
- els blocs base inicials seran:
  - `Anàlisi`
  - `Resum de tasques`
  - `Pre-anàlisi`
  - `DB`
  - `APIs`
  - `WEBs`
  - `Valoració`
- dins d'aquests blocs hi pot haver text lliure, però el contenidor i l'ordre venen guiats per l'editor
- generació automàtica del Textile correcte
- guardar tant:
  - el **Textile generat**
  - com una **estructura interna** editable

#### Regles dels blocs guiats

- els blocs `Anàlisi`, `Resum de tasques`, `Pre-anàlisi` i `Valoració` són **fixos**
- els blocs `DB`, `APIs` i `WEBs` són **obligatoris a nivell d'estructura**, però el seu contingut pot ser buit funcionalment
- si una millora no té afectació a `DB`, `APIs` o `WEBs`, el Textile ha d'indicar explícitament `_No aplica_` o equivalent
- `DB` és bloc únic
- `APIs` pot contenir **N subblocs**
- `WEBs` pot contenir **N subblocs**
- cada subbloc d'`API` o `WEB` hauria de poder-se afegir fàcilment des de la UI, sense obligar a picar l'estructura Textile a mà

#### Formulari inicial de suport

Abans d'entrar a redactar en profunditat, l'editor hauria d'ajudar a preparar l'estructura inicial de la valoració amb un formulari curt i còmode.

Aquest formulari inicial hauria de permetre com a mínim:

- omplir la informació bàsica necessària de la `Valoració`
- omplir o revisar el `due date` propi de la `Valoració`
- indicar si la millora requereix `DB`
- indicar si la millora requereix `APIs`
- indicar si la millora requereix `WEBs`
- si hi ha `APIs`, poder afegir-ne una o més des del principi
- si hi ha `WEBs`, poder afegir-ne una o més des del principi

Comportament esperat:

- si `DB` no aplica, el bloc es crea igualment amb `_No aplica_`
- si `APIs` no aplica, el bloc es crea igualment amb `_No aplica_`
- si `WEBs` no aplica, el bloc es crea igualment amb `_No aplica_`
- si hi ha una o més `APIs`, l'editor ha de generar l'esquelet correcte dels seus subblocs
- si hi ha una o més `WEBs`, l'editor ha de generar l'esquelet correcte dels seus subblocs

L'objectiu és reduir al màxim la feina mecànica de format i que l'analista es concentri a redactar l'anàlisi, no a construir manualment el Textile.

#### Exportació

- ha d'estar preparat per copiar/exportar fàcilment el Textile cap a Redmine

### Plantilla Textile inicial de referència

La primera plantilla de `Valoració` s'ha de documentar explícitament perquè és la base funcional sobre la qual s'ha de construir el primer editor i la primera plantilla configurable.

```text
h1. Anàlisi

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


h3. Resum de tasques

* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
* Anàlisi, gestió, reunions
* Validació i proves

---


h1. Pre-anàlisi

XXXXXXXXXXXXXXXXXXXX

---

h2. DB

*@TAULA@*

o

_Sense afectació_

h2. APIS

h3. API-X

*1. Tasca X*
XXXXXXXXXXXXXXXXXX


h2. WEBS

h3. WEB-X

*1. Tasca X*
XXXXXXXXXXXXXXXXXX

---

h2. Valoració

*Anàlisi: Xh*

*BD: XXh*
* Tasca X: *Xh*

*API X: XXh*
* Tasca X: *Xh*

*WEB X: XXh*
* Tasca X: *Xh*

*Proves: XXh*
*Disseny: XXh* (Si Cal)

*Gestió:* (Analisi+BO+APIs+WEBs+Proves)/2 = *XXh*
*Gestió + jiras:*  Gestió/4 = *XXh*
*Seguiment: XXh* (Si creiem que hi haurà hores de seguiment amb tercers o BSM, cal ser previsor i apuntar-les)

**Total: XXh**
```

Notes sobre aquesta plantilla inicial:

- és la **primera plantilla de referència** que s'ha de preservar
- els textos de placeholder (`XXXXXXXX...`) s'han d'entendre com a contingut a emplenar
- `DB`, `APIs` i `WEBs` formen part sempre de l'estructura, encara que algun bloc quedi com `_Sense afectació_` o `_No aplica_`
- la secció `Valoració` és la base per estructurar el futur editor i el model de càlcul d'hores

### Càlcul automàtic de la `Valoració`

Cal incorporar dins la pròpia secció de `Millores` una petita millora funcional addicional: l'editor de `Valoració` ha d'ajudar també amb els càlculs d'hores de la secció de valoració.

#### Objectiu

L'analista ha de poder introduir només els valors base de cada ítem i evitar fer manualment les operacions repetitives de subtotal i total.

#### Comportament desitjat

- el càlcul ha de ser **automàtic en viu** mentre s'edita
- no s'ha de dependre d'un botó manual de recalculat com a flux principal
- l'editor ha de recalcular automàticament:
  - hores d'anàlisi
  - subtotal de DB
  - subtotal de cada API
  - subtotal de cada WEB
  - proves
  - disseny
  - gestió
  - gestió + jiras
  - seguiment
  - total final

#### Regles de càlcul que s'han de suportar

- `Gestió = (Analisi + BO + APIs + WEBs + Proves) / 2`
- `Gestió + jiras = Gestió / 4`
- `Total = suma de tots els blocs finals aplicables`

#### Implicacions per a l'editor

- l'usuari ha d'emplenar els números dels ítems base
- els camps derivats s'han de mostrar ja calculats
- el Textile generat final ha de reflectir aquests càlculs automàticament
- convé mantenir visibles tant els ítems individuals com els subtotals per bloc

#### Punts a concretar més endavant a la spec

- què es considera exactament `BO` dins el model intern del formulari/editor
- com s'editaran les línies individuals de cada `API` i `WEB`
- com es gestionaran els arrodoniments i el format final de les hores

### Template de `Valoració`

Es parteix del template Textile actual proporcionat per l'usuari, però el sistema no ha de quedar lligat a una sola plantilla fixa.

#### Regles acordades

- hi haurà una plantilla per defecte global
- en crear una `Valoració` es podrà triar una altra plantilla
- el model serà **mixt**:
  - default global
  - selecció puntual a la creació
- la gestió de plantilles es farà des de **Configuració**

#### Migració de plantilles

- les valoracions ja entregades es deixaran com estan
- les valoracions en curs es podran migrar **manualment** si convé
- no es vol assumir una actualització automàtica per defecte

### Versions

- cal crear una nova secció de configuració: `Versions`
- una `Versió` serà semblant a una etiqueta, però amb pes semàntic propi
- exemples d'ús: `HEDWIG`
- la versió es podrà associar a:
  - `Millora`
  - `Valoració`
  - tasca normal
- la versió serà opcional

### Resum global de la `Millora`

La vista resum de `Millora` ha de servir per veure l'estat real de la peça mare i també les dades útils derivades de la seva `Valoració`.

#### Informació que s'hi ha de veure

- requisits
- estat
- percentatge
- tags
- versió
- Redmines relacionats
- JIRA
- hores d'anàlisi
- hores totals valorades
- hores venudes
- tasques tècniques referenciades

#### Representació d'enllaços i referències

- Redmine i JIRA s'han de mostrar com **IDs + enllaços clicables**
- les tasques tècniques referenciades han de mostrar:
  - ID
  - títol
  - estat
  - enllaç

### Hores

- cal guardar i mostrar:
  - hores d'anàlisi
  - hores totals valorades
  - hores venudes
- la representació pot ser compacta, tipus badge/etiqueta, però la dada ha d'existir com a camp real
- el factor d'inflat de cara a client **no** s'ha de calcular automàticament; l'usuari el vol introduir manualment segons el cas

### Filtres de la llista de `Millores`

Filtres validats com a bons:

- text lliure global
- estat
- prioritat
- versió
- tags
- due date / temporalitat
- té valoració / no té valoració
- percentatge

Notes addicionals:

- JIRA i Redmine no necessiten necessàriament filtre específic inicial si el cercador global ja els cobreix bé

### Punts oberts abans d'implementar

- acabar de definir quins camps exactes tindrà aquest formulari inicial i com es connectarà amb l'editor posterior

### Estats proposats de `Millora`

Ordre principal:

`Nova` → `En valoració` → `Valorada` → `Enviada a client` → `Aprovada` → `En desenvolupament` → `Validant` → `Pendent de revisió` → `Finalitzada` → `Pendent d'integrar` → `Integrada`

Regles generals:

- `Integrada` és l'estat terminal positiu
- `Bloquejada` i `Cancel·lada` són estats especials disponibles des de **qualsevol estat no terminal**
- en sortir de `Bloquejada`, la `Millora` ha de tornar a l'últim estat actiu anterior
- `Cancel·lada` és terminal

Transicions orientatives:

- `Nova` → `En valoració`
- `En valoració` → `Valorada`
- `Valorada` → `Enviada a client` o `En valoració`
- `Enviada a client` → `Aprovada` o `En valoració`
- `Aprovada` → `En desenvolupament`
- `En desenvolupament` → `Validant`
- `Validant` → `Pendent de revisió` o `En desenvolupament`
- `Pendent de revisió` → `Finalitzada` o `En desenvolupament`
- `Finalitzada` → `Pendent d'integrar` o `En desenvolupament`
- `Pendent d'integrar` → `Integrada` o `En desenvolupament`

En qualsevol estat no terminal també s'ha de poder passar a:

- `Bloquejada`
- `Cancel·lada`

### Estats proposats de `Valoració`

Ordre principal:

`No començada` → `En curs` → `Per revisar` → `Revisada` → `Enviada` → `Tancada`

Branques funcionals:

- `Per revisar` → `Pendent de canvis`
- `Pendent de canvis` → `En curs` o `Revisada`

Regles generals:

- `Tancada` és l'estat terminal positiu
- `Bloquejada` i `Cancel·lada` són estats especials disponibles des de **qualsevol estat no terminal**
- en sortir de `Bloquejada`, la `Valoració` ha de tornar a l'últim estat actiu anterior
- `Cancel·lada` és terminal

Transicions orientatives:

- `No començada` → `En curs`
- `En curs` → `Per revisar`
- `Per revisar` → `Revisada` o `Pendent de canvis`
- `Pendent de canvis` → `En curs` o `Revisada`
- `Revisada` → `Enviada` o `Pendent de canvis`
- `Enviada` → `Tancada` o `Pendent de canvis`

En qualsevol estat no terminal també s'ha de poder passar a:

- `Bloquejada`
- `Cancel·lada`

### Fitxers / zones candidates

- `src/main/frontend/src/config/entry-taxonomy.ts`
- `src/main/frontend/src/types/index.ts`
- `src/main/java/com/workboard/entry/EntryType.java`
- `src/main/frontend/src/pages/ActesPage.tsx`
- `src/main/frontend/src/pages/ActaViewPage.tsx`
- `src/main/frontend/src/pages/ActaEditorPage.tsx`
- `src/main/frontend/src/pages/ConfigPage.tsx`
- futures pantalles i components de `Millores`

### Com s'hauria d'abordar

1. Tancar els punts oberts de model i UX que encara queden per concretar.
2. Escriure una spec pròpia abans d'implementar, perquè aquest item és prou gran i transversal.
3. Separar clarament:
   - model de dades
   - navegació
   - editor Textile híbrid
   - configuració de versions i plantilles
4. Implementar primer el flux mínim usable:
   - llista de millores
   - detall/resum
   - creació de valoració
   - lectura i edició de valoració
5. Deixar per una segona passada les refinacions més fines d'estats, plantilles avançades i possibles automatitzacions.

### Validació recomanada

- verificació funcional completa front + back
- comprovació de persistència correcta dels nous tipus i camps
- proves del flux de navegació `llista -> lectura -> editar`
- proves del percentatge manual
- proves de la relació opcional entre tasca normal i `Millora`
- comprovació que l'export/còpia a Redmine és usable de veritat

### Risc
Alt.

### Dependències

- requerirà nova spec abans de picar codi
- tocarà frontend, model de dades, potser migracions i tipus d'entrada
- convé definir bé els estats abans de tancar el pla d'implementació

---

## Item 5 — Versions a Configuració

### Estat
Pendent.

### Objectiu
Afegir una nova secció de `Versions` a `Configuració` perquè es puguin crear i gestionar versions reutilitzables i després associar-ne una de manera opcional a les tasques.

### Per què cal fer-ho

La futura millora de `RETROS` necessita poder referenciar una versió existent. A més, la idea de `versió` té un pes semàntic diferent del de les etiquetes: una tasca ha de poder portar com a màxim una sola versió, mentre que pot continuar tenint moltes etiquetes.

### Què s'ha de fer

- afegir una nova secció de `Versions` dins de `Configuració`
- fer que la seva gestió s'assembli a la de `Projectes` o `Etiquetes`
- permetre crear, editar i llistar versions
- permetre assignar una versió a les tasques
- fer que aquesta assignació sigui **opcional**
- garantir que una tasca només pot tenir **una sola versió**
- mantenir intacte el comportament actual d'etiquetes:
  - una tasca pot tenir **N etiquetes**
  - la versió no substitueix les etiquetes

### Fitxers / zones candidates

- `src/main/frontend/src/pages/ConfigPage.tsx`
- futures pantalles/components de `Versions`
- `src/main/frontend/src/components/entries/EntryForm.tsx`
- `src/main/java/com/workboard/entry/EntryEntity.java`
- `src/main/java/com/workboard/entry/EntryService.java`
- `src/main/java/com/workboard/entry/EntryController.java`
- `src/main/java/com/workboard/entry/EntryResponse.java`

### Com s'hauria d'abordar

1. Definir `Versions` com una peça de configuració pròpia, no com una etiqueta més amb un altre nom.
2. Reutilitzar el patró de gestió ja existent a `Configuració` per evitar una UX nova innecessària.
3. Incorporar la versió al flux de tasques com a camp opcional i singular.
4. Validar explícitament la diferència conceptual entre `1 versió` i `N etiquetes`.
5. Deixar aquesta millora tancada abans de tocar `RETROS`.

### Validació recomanada

- crear una versió des de `Configuració`
- editar-la i veure-la a la llista
- assignar-la a una tasca
- comprovar que la versió és opcional
- comprovar que una tasca no pot tenir més d'una versió
- comprovar que les etiquetes continuen sent múltiples i independents

### Risc
Baix.

### Dependències

- no depèn de `RETROS`
- aquesta millora s'ha de fer **abans** de `RETROS`

---

## Item 6 — Nova secció `RETROS`

### Estat
Pendent.

### Objectiu
Crear una nova secció `RETROS` com a espai personal per preparar retros de manera contínua, sense dependre de notes externes ni convertir-les en actes de reunió.

### Per què cal fer-ho

Ara mateix, quan a l'usuari se li acudeixen coses a comentar en una retro, les ha d'apuntar fora de l'app i corre el risc de perdre-les o dispersar-les. La secció `RETROS` ha de servir per capturar i ordenar aquests punts dins de Workboard, de forma ràpida, persistent i consultable més endavant.

### Què s'ha de fer

- afegir una nova secció pròpia: `RETROS`
- tractar-la com un espai **personal**, no com una acta de reunió ni com una eina col·laborativa multiusuari
- suportar exactament dos tipus de retro:
  - `Retro d'equip`
  - `Retro d'analistes`
- permetre que les dues retros estiguin obertes alhora, però només una de cada tipus
- navegar entre les dues amb un **selector segmentat / tabs** dins la mateixa secció
- mostrar cada retro en una **sola pantalla llarga**:
  - metadades a dalt
  - blocs editables a sota
- no permetre crear retros des del top bar
- fer que la creació i el cicle de vida quedin confinats a la pròpia secció `RETROS`

#### Metadades de cada retro

- `mes de la retro`
- `versió`
- `data de reunió`

Regles:

- `mes de la retro` i `data de reunió` són camps diferents
- la `versió` no és text lliure: s'ha de seleccionar des de `Versions`

#### Base comuna dels dos tipus de retro

- `Sensacions`
- `Mantenir/Potenciar`
- `Millorar/Mitigar`

Regles comunes:

- la retro és **sempre personal de l'usuari**
- les sensacions són sempre seves
- els punts de mantenir/millorar també són seus
- no s'han de modelar aportacions d'altres persones com si fos una acta

#### `Retro d'equip`

Inclou a més:

- `Floretes`

Regles específiques:

- cada floreta té un destinatari i un text positiu
- el destinatari s'introdueix com a **nom lliure**
- el destinatari s'ha de veure clarament com un **badge visual separat** del text

#### `Retro d'analistes`

Comparteix la base comuna, però:

- no té `Floretes`
- afegeix `Comentaris/Propostes`

#### Format dels blocs

- `Mantenir/Potenciar`, `Millorar/Mitigar`, `Floretes` i `Comentaris/Propostes` són **llistes d'ítems independents**
- cada ítem s'ha de poder:
  - crear
  - editar
  - eliminar
  - reordenar manualment
- `Sensacions` són sempre de l'usuari i han de quedar en format molt curt (3-4 paraules màxim)

#### Cicle de vida

- cada retro pot estar `oberta` o `arxivada`
- la retro oberta és un workspace viu i editable
- la retro arxivada continua sent **editable**
- quan s'arxiva una retro, s'ha de crear automàticament una nova retro del mateix tipus
- la nova retro neix **completament buida**
- no s'ha d'heretar cap dada automàticament de l'anterior

#### Històric i cerca

- dins de la secció `RETROS` s'han de poder cercar retros arxivades
- la cerca inicial ha de ser simple i suficient, amb:
  - text lliure
  - tipus de retro
  - mes
  - versió
- a la llista d'arxivades només cal mostrar:
  - tipus de retro
  - mes
  - versió
  - data de reunió

#### Registre general

- les retros arxivades també han d'aparèixer al registre general com un input més
- no es vol una vista resumida especial per al registre
- han de ser cercables i consultables com qualsevol altre input

### Fitxers / zones candidates

- `src/main/frontend/src/config/navigation.tsx`
- `src/main/frontend/src/components/layout/TopBar.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`
- `src/main/frontend/src/components/entries/EntryList.tsx`
- `src/main/frontend/src/components/list/ListToolbar.tsx`
- `src/main/java/com/workboard/entry/EntryType.java`
- `src/main/java/com/workboard/entry/EntryController.java`
- `src/main/java/com/workboard/entry/EntrySearchCriteria.java`
- `src/main/java/com/workboard/entry/EntrySearchSpecifications.java`
- `src/main/java/com/workboard/entry/EntryRepository.java`

### Com s'hauria d'abordar

1. Tractar `RETROS` com un nou tipus integrat dins del sistema general d'inputs, però amb secció pròpia i flux de creació específic.
2. Fer primer la millora de `Versions` i només després començar `RETROS`.
3. Modelar bé les dues variants (`equip` i `analistes`) compartint base comuna i encapsulant-ne les diferències.
4. Prioritzar una primera versió simple i usable:
   - una retro oberta per tipus
   - històric cercable
   - aparició al registre general
5. Evitar convertir la feature en una acta col·laborativa o en un mini gestor complex de reunions.

### Validació recomanada

- veure la secció `RETROS` i canviar entre `Retro d'equip` i `Retro d'analistes`
- editar lliurement la retro oberta de cada tipus
- afegir i reordenar ítems dins dels blocs
- validar que `Floretes` només surt a la retro d'equip
- validar que `Comentaris/Propostes` només surt a la retro d'analistes
- comprovar que el destinatari d'una floreta es mostra com a badge separat
- comprovar que la versió se selecciona des de `Versions`
- comprovar que `RETROS` no es crea des del top bar
- arxivar una retro i verificar que se'n crea automàticament una altra del mateix tipus i completament buida
- cercar retros arxivades dins la secció
- trobar retros arxivades també al registre general

### Risc
Mitjà.

### Dependències

- depèn directament de la millora prèvia de `Versions`
- convé escriure una spec pròpia abans d'implementar-la
- no s'ha de barrejar la seva implementació amb la de `Versions`

---

## Bloc de preanàlisi — millores candidates detectades durant la revisió del repo

> Aquest bloc recull possibles millores futures detectades durant una revisió del producte i del codi. S'afegeixen aquí per no perdre-les, però **encara no tenen el mateix nivell de definició** que els ítems anteriors. Quan es prioritzin, caldrà concretar-ne millor l'abast.

---

## Item 7 — Cerca global / command palette

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Afegir una experiència de cerca global i navegació ràpida que permeti trobar o obrir tasques, notes, actes, timelogs, registres o seccions de configuració des d'un únic punt d'entrada.

### Per què cal fer-ho

Actualment la cerca global del top bar queda massa vinculada al registre general. El producte ja té prou seccions pròpies perquè tingui sentit poder saltar de manera directa a una entrada o una àrea concreta sense haver de passar necessàriament per `/entries`.

### Què s'ha de fer

- ampliar la cerca global perquè no sigui només un redirect al registre
- permetre cercar i obrir directament contingut de diferents seccions
- estudiar si convé un format de command palette, launcher o cerca global enriquida
- mantenir-la com una acció ràpida i transversal, no com una pàgina pesada

### Fitxers / zones candidates

- `src/main/frontend/src/components/layout/TopBar.tsx`
- `src/main/frontend/src/config/navigation.tsx`
- `src/main/frontend/src/components/entries/EntryList.tsx`
- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`
- `src/main/frontend/src/pages/ActesPage.tsx`
- `src/main/frontend/src/pages/TimeLogsPage.tsx`

### Com s'hauria d'abordar

1. Decidir si la cerca global ha de prioritzar navegació, obertura d'entrades, o totes dues coses.
2. Reutilitzar tant com es pugui els fluxos i rutes que ja existeixen a cada secció.
3. Evitar que la feature es converteixi en una segona implementació parcial del registre general.

### Validació recomanada

- cercar i obrir directament una tasca o nota
- navegar des de la cerca a una secció principal
- comprovar que la interacció sigui realment més ràpida que l'ús actual del registre

### Risc
Mitjà.

### Dependències

- pot dependre de futures millores de detall estable per tasques i notes
- caldrà concretar més endavant quines entitats entren al primer MVP

---

## Item 8 — Tasks i Notes: filtres avançats

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Fer que `Tasks` i `Notes` tinguin un model de filtres més potent i més proper al del registre general.

### Per què cal fer-ho

El registre general ja disposa d'un conjunt de filtres i estat d'URL molt més ric que les pàgines específiques de tasques i notes. Això força a sortir de la vista natural d'aquestes seccions quan es vol fer triatge real per estat, prioritat, dates o etiquetes.

### Què s'ha de fer

- ampliar `Tasks` amb filtres útils més enllà de cerca i scope
- ampliar `Notes` amb una experiència semblant
- estudiar quins filtres del registre val la pena heretar i quins no
- mantenir la UX específica de cada secció, no clonar literalment el registre

### Fitxers / zones candidates

- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`
- `src/main/frontend/src/components/list/ListToolbar.tsx`
- `src/main/frontend/src/components/entries/EntryFilters.tsx`
- `src/main/frontend/src/lib/list-state/`
- `src/main/frontend/src/hooks/useEntries.ts`

### Com s'hauria d'abordar

1. Partir dels filtres que ja s'han demostrat útils al registre.
2. Adaptar-los a cada secció sense perdre simplicitat.
3. Decidir si això ha d'anar acompanyat o no de millores de paging i cerca de servidor.

### Validació recomanada

- filtrar tasques per estat, prioritat o dates
- filtrar notes per criteris rellevants sense haver d'anar al registre
- comprovar que l'estat de filtres sigui estable i reutilitzable

### Risc
Mitjà.

### Dependències

- podria quedar molt millor si abans o durant la feina s'aborda paging/filtering més robust

---

## Item 9 — Timelogs: drilldown per projecte i tasca

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Permetre navegar del resum de temps a un detall accionable per projecte o tasca.

### Per què cal fer-ho

La pàgina de timelogs ja ofereix valor de resum, però encara costa analitzar de forma pràctica on s'ha invertit realment el temps o baixar d'un total a la traça concreta de treball.

### Què s'ha de fer

- afegir una manera de pivotar del resum al detall
- permetre drilldown per projecte
- estudiar també drilldown per tasca o codi de tasca
- millorar la relació entre resum i consulta puntual

### Fitxers / zones candidates

- `src/main/frontend/src/pages/TimeLogsPage.tsx`
- `src/main/frontend/src/components/timelogs/WeeklySummary.tsx`
- `src/main/frontend/src/components/timelogs/TimeLogTable.tsx`
- `src/main/frontend/src/hooks/useTimeLogs.ts`
- backend de `timelogs`

### Com s'hauria d'abordar

1. Identificar quin nivell de drilldown és més valuós per al dia a dia.
2. Reutilitzar al màxim la informació i filtres ja disponibles.
3. Evitar convertir la pàgina en una mini eina d'analytics massa gran.

### Validació recomanada

- saltar d'un resum setmanal al detall d'un projecte
- consultar la distribució temporal d'una tasca concreta
- comprovar que la navegació no trenca el flux actual de registre d'hores

### Risc
Mitjà.

### Dependències

- pot requerir ampliar el contracte de consulta actual de timelogs

---

## Item 10 — Tasques i notes: pàgines de detall estables

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Donar a tasques i notes una vista de detall amb URL pròpia, fora del patró exclusiu de llista + sheet d'edició.

### Per què cal fer-ho

Les actes ja tenen un recorregut de visualització més estable, però tasques i notes continuen massa lligades a la lògica de llista. Falta una URL fiable per revisar una peça concreta amb més context o tornar-hi més tard.

### Què s'ha de fer

- crear una experiència de detall estable per tasques
- crear una experiència equivalent per notes
- decidir si aquesta vista ha de ser només de lectura o lectura + entrada a edició
- integrar-la amb obertures des del registre i des de les vistes específiques

### Fitxers / zones candidates

- `src/main/frontend/src/config/navigation.tsx`
- `src/main/frontend/src/components/entries/EntryOpenSheetAction.tsx`
- `src/main/frontend/src/components/entries/EntryCard.tsx`
- `src/main/frontend/src/components/entries/EntryListTable.tsx`
- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`

### Com s'hauria d'abordar

1. Definir el paper exacte d'aquestes pàgines respecte al sheet actual.
2. Mantenir consistència entre obertura des de llista i navegació directa per URL.
3. Evitar duplicar massa lògica d'edició en dues superfícies diferents.

### Validació recomanada

- obrir una tasca per URL directa
- obrir una nota des del registre i aterrissar a la vista correcta
- comprovar que la navegació enrere conserva sentit

### Risc
Mitjà.

### Dependències

- pot encaixar molt bé amb la futura cerca global

---

## Item 11 — Vistes guardades / presets de filtres

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Permetre guardar combinacions habituals de filtres, cerca i mode de llista per reutilitzar-les ràpidament.

### Per què cal fer-ho

Diverses pàgines ja fan servir estat a URL i fluxos de filtre relativament rics. El següent pas natural és poder recuperar vistes freqüents sense reconstruir-les manualment cada vegada.

### Què s'ha de fer

- permetre guardar presets o vistes habituals
- definir en quines seccions té més sentit començar
- estudiar si els presets han de ser globals o específics per secció
- reaprofitar al màxim l'estat d'URL ja existent

### Fitxers / zones candidates

- `src/main/frontend/src/components/entries/EntryList.tsx`
- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`
- `src/main/frontend/src/pages/ActesPage.tsx`
- `src/main/frontend/src/pages/TimeLogsPage.tsx`
- `src/main/frontend/src/lib/list-state/`
- possiblement `src/main/frontend/src/pages/ConfigPage.tsx`

### Com s'hauria d'abordar

1. Triar primer una o dues seccions on l'estalvi sigui més clar.
2. Definir si el preset és només un accés ràpid local o una entitat gestionable.
3. Evitar una primera versió massa carregada de permisos, categories o metadades.

### Validació recomanada

- guardar una vista i recuperar-la després
- comprovar que els presets mantenen el comportament esperat dels filtres
- validar que no introdueixen confusió a la UI principal

### Risc
Mitjà.

### Dependències

- es beneficia d'un model de llistes i filtres més coherent entre seccions

---

## Item 12 — Actes: plantilles o fluxos inicials reutilitzables

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Reduir la fricció de crear actes recurrents o semblants reutilitzant estructura base, blocs o punts de partida.

### Per què cal fer-ho

La secció d'actes ja té patrons de duplicació i un flux propi, però continua existint una part repetitiva en la preparació de reunions recurrents. Una capa de plantilles o starters podria fer aquest ús molt més ràpid.

### Què s'ha de fer

- estudiar si convé modelar plantilles explícites o només starters reutilitzables
- facilitar l'arrencada d'actes recurrents
- reaprofitar el que ja existeix de duplicació sense obligar sempre a duplicar un item vell

### Fitxers / zones candidates

- `src/main/frontend/src/pages/ActesPage.tsx`
- `src/main/frontend/src/pages/ActaEditorPage.tsx`
- `src/main/frontend/src/components/entries/EntryForm.tsx`
- `src/main/frontend/src/config/entry-taxonomy.ts`
- `src/main/frontend/src/hooks/useCreateEntry.ts`

### Com s'hauria d'abordar

1. Diferenciar bé entre duplicar una acta real i arrencar des d'una plantilla neutra.
2. Mantenir el focus només en actes, sense generalitzar-ho prematurament a altres inputs.
3. Buscar una primera versió simple i usable.

### Validació recomanada

- crear una nova acta a partir d'una base recurrent
- comprovar que la plantilla no arrossega dades que no toca
- validar que el flux és més ràpid que el model actual

### Risc
Baix o mitjà.

### Dependències

- cap dependència clara ara mateix

---

## Item 13 — Accions massives a llistes i dashboard

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Permetre operar sobre grups d'entrades des del dashboard o les llistes principals amb menys clics.

### Per què cal fer-ho

L'app té molt bon suport per accions sobre una sola entrada, però continua sent costós fer canvis repetitius o de neteja sobre diversos elements seguits.

### Què s'ha de fer

- estudiar accions massives per tasques o entrades seleccionades
- considerar moviments, canvis d'estat, reprogramació o altres operacions candidates
- decidir en quines superfícies té més sentit començar: dashboard, registre o pàgines específiques

### Fitxers / zones candidates

- `src/main/frontend/src/components/dashboard/DailyView.tsx`
- `src/main/frontend/src/components/entries/EntryList.tsx`
- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/components/entries/EntryCard.tsx`
- `src/main/frontend/src/components/entries/EntryListTable.tsx`
- `src/main/frontend/src/components/table/TableActionGroup.tsx`

### Com s'hauria d'abordar

1. Triar molt bé quines accions massives aporten valor real i no compliquen massa la UI.
2. Prioritzar primer una superfície i un conjunt reduït d'operacions.
3. Tenir cura especial amb confirmacions i operacions difícils de desfer.

### Validació recomanada

- seleccionar diversos elements i aplicar una acció comuna
- comprovar que no es degrada la simplicitat del flux d'un sol element
- validar que el comportament és clar i segur

### Risc
Mitjà.

### Dependències

- cap dependència estricta ara mateix

---

## Item 14 — Navegació entre elements relacionats

### Estat
Preanàlisi. Pendent de concretar.

### Objectiu
Millorar els salts contextuals entre tasques, notes, actes, projectes i timelogs quan ja hi ha una relació útil entre aquests elements.

### Per què cal fer-ho

El model actual ja conté relacions i metadades útils com projectes, etiquetes, referències externes o codis de tasca, però aquestes connexions són encara massa informatives i poc navegables.

### Què s'ha de fer

- detectar quins enllaços contextuals tenen més valor real
- permetre salts ràpids entre entitats relacionades
- millorar la continuïtat entre captura, seguiment i consulta

### Fitxers / zones candidates

- `src/main/frontend/src/components/entries/EntryCard.tsx`
- `src/main/frontend/src/components/entries/EntryForm.tsx`
- `src/main/frontend/src/pages/ActesPage.tsx`
- `src/main/frontend/src/pages/TimeLogsPage.tsx`
- `src/main/frontend/src/pages/ProjectsPage.tsx`
- `src/main/frontend/src/pages/TagsPage.tsx`
- `src/main/frontend/src/hooks/useEntries.ts`

### Com s'hauria d'abordar

1. Detectar primers casos d'ús on el salt contextual estalvia temps de debò.
2. Evitar una xarxa d'enllaços massa densa o sorollosa.
3. Prioritzar relacions ja presents al producte abans d'introduir-ne de noves.

### Validació recomanada

- obrir una entrada i saltar a un element relacionat amb un clic clar
- comprovar que el context no es perd en navegar
- validar que la relació és útil i no només decorativa

### Risc
Mitjà.

### Dependències

- pot relacionar-se amb futures pàgines de detall estables
