# Disseny — llistats paginats compartits per Registre, Tasques, Notes, Actes i Hores

## Objectiu

Transformar les pantalles de **Registre**, **Tasques**, **Notes** i **Actes** en llistats paginats amb una **taula com a vista per defecte**, mantenint una **vista alternativa en targetes** per preservar el model actual de lectura.

La pantalla de **Hores** manté la seva base tabular actual, però s'alinea amb el mateix patró visual i funcional de toolbar, filtres, paginació i estat sincronitzat amb URL.

## Per què es fa aquest canvi

- El model actual està molt basat en agrupacions per data i targetes, cosa que fa més difícil escanejar volum, comparar files i navegar quan hi ha moltes entrades.
- **Registre** ja té filtres i paginació parcial, però la composició final continua sent una graella de targetes agrupada per subseccions i dates.
- **Tasques**, **Notes** i **Actes** tenen lògiques de filtre i presentació diferents entre elles.
- **Hores** ja té una taula funcional, però no comparteix encara un patró comú amb la resta de llistats.

El canvi busca una experiència més coherent, més visible i més escalable sense eliminar la vista actual en targetes.

## Decisions confirmades

- La **vista per defecte** serà la nova **taula/llistat**.
- La **vista en targetes** es manté com a opció alternativa.
- L'estat del llistat es conservarà a la **URL**.
- Les noves taules de **Registre**, **Tasques**, **Notes** i **Actes** seran **planes**, no agrupades per data o subsecció com a estructura principal.
- El desplegament serà **incremental i conservador**, sense substitució massiva d'un sol cop.

## Enfocament escollit

S'adopta un enfocament de **doble vista amb motor compartit**.

Cada pàgina tindrà:

- toolbar superior comuna
- panell de filtres
- taula paginada per defecte
- selector de vista **Taula / Targetes**
- estat compartit basat en URL

La vista de targetes ja no tindrà una lògica pròpia separada de filtres o navegació. Tant la vista de taula com la de targetes dependran del mateix estat de cerca, filtres, ordenació i pàgina.

## Principis de disseny

### 1. Conservador per defecte

No s'elimina la vista actual en targetes. El redisseny prioritza millorar la navegació i la lectura sense perdre el context visual que ja funciona.

### 2. Un sol model mental

Les pantalles de llistat han de compartir la mateixa estructura general:

- header de pàgina
- toolbar de cerca i accions
- filtres desplegables
- contingut principal en taula o targetes
- peu de paginació

### 3. Estat reproduïble

Qualsevol vista rellevant s'ha de poder recuperar amb la URL exacta, incloent cerca, filtres, ordenació, pàgina i mode de visualització.

### 4. Taula per escanejar, targeta per llegir

La taula és la vista principal per comparar, escanejar i operar sobre col·leccions. La targeta es manté per a una lectura més visual o contextual, però ja no governa l'estructura principal.

## Abast funcional

Aquest disseny s'aplica a:

- **Registre** (`EntryList`)
- **Tasques** (`TasksPage`)
- **Notes** (`NotesPage`)
- **Actes** (`ActesPage`)
- **Hores** (`TimeLogsPage` / `TimeLogTable`)

Queda fora d'abast en aquesta fase:

- altres pantalles del dashboard que no siguin llistats principals
- canvis de semàntica de dades al backend
- substitució completa de components de targeta existents

## Model compartit de llistat

Cal introduir una capa comuna de gestió de llistats que resolgui com a mínim aquests aspectes:

1. lectura i escriptura de l'estat a `searchParams`
2. sincronització entre filtres, vista, ordenació i pàgina
3. contracte comú per renderitzar **table view** i **card view**
4. comportament consistent quan canvien filtres o cerca

Aquest model compartit ha d'evitar que cada pàgina torni a implementar de manera local:

- control de `view`
- persistència de filtres
- reinici de pàgina quan es modifiquen criteris
- toolbar i paginació amb variants diferents entre pantalles

## Estat a URL

La URL ha de reflectir, com a mínim, aquest estat:

- `view` → `table` o `cards`
- `q` → cerca de text
- `page` → pàgina actual
- `sort` → criteri d'ordenació
- filtres específics de cada pantalla

### Regles de comportament

- Quan canvia qualsevol filtre o la cerca, la pàgina torna a `page=1`.
- Quan no hi ha cap filtre actiu, la URL ha de quedar neta i sense paràmetres sobrants.
- Si la URL conté filtres vàlids, la pàgina s'ha d'inicialitzar amb aquest estat.
- El selector de vista **Taula / Targetes** també s'ha de persistir a la URL.

## Toolbar comuna

La toolbar ha de seguir un patró únic a totes les pantalles.

### Estructura recomanada

- **esquerra**: camp de cerca principal
- **dreta**: botó **Filtres**, selector **Taula / Targetes**, i controls específics de la pantalla si cal

### Comportament

- En desktop, tot es presenta en una franja compacta.
- En mides petites, la cerca pot ocupar una fila pròpia i les accions passar a la següent.
- El botó **Filtres** ha de poder indicar visualment si hi ha filtres actius.

## Panell de filtres

El panell de filtres s'inspira en el patró de **Forms & Tables** del showcase: compacte, combinable i orientat a treballar ràpid.

### Regles del panell

- Tancat per defecte si no hi ha filtres actius.
- Obert si la URL porta filtres actius o si l'usuari el desplega.
- Ha de permetre restablir fàcilment l'estat a un conjunt net.
- No ha de convertir-se en una pantalla de formulari pesada; ha de ser un panell ràpid de refinament.

## Vista de taula

La taula seguirà el patró de l'**Advanced Data Table** del showcase.

### Característiques comunes

- capçalera clara i compacta
- files amb hover i semàntica d'acció
- ordenació per columnes principals
- peu amb paginació coherent
- estats de càrrega i buit compartits
- contenidor amb scroll horitzontal si cal en pantalles estretes

### Regles funcionals

- Les taules de **Registre**, **Tasques**, **Notes** i **Actes** són planes.
- Les agrupacions per data o subsecció deixen de ser el tall principal en vista taula.
- Les accions específiques de cada pàgina s'han de mantenir com a columna o zona d'accions.

## Vista de targetes

La vista de targetes conserva el llenguatge visual actual tant com sigui possible, però passa a dependre del mateix motor de llistat compartit.

### Regles funcionals

- La vista targetes reutilitza exactament els mateixos filtres, cerca, ordenació i paginació que la vista taula.
- La vista targetes no ha de recuperar una arquitectura completament separada basada en agrupacions pròpies diferents del motor compartit.
- Les targetes poden continuar mostrant metadata contextual rica, però sense convertir aquesta vista en el patró principal de navegació.

## Disseny per pantalla

### Registre

**Situació actual**

- `EntryList` ja té filtres, lectura inicial de `q` i paginació bàsica.
- El render final continua agrupant per subseccions i per data abans d'arribar a la targeta.

**Nova direcció**

- `Registre` es converteix en la primera pantalla completa amb el nou patró compartit.
- La vista per defecte passa a ser una taula plana paginada.

**Columnes recomanades**

- Tipus
- Títol / resum
- Projecte / etiquetes
- Estat
- Prioritat
- Data
- Accions

**Filtres recomanats**

- tipus
- estat
- prioritat
- rang de dates
- etiqueta
- fixades

### Tasques

**Situació actual**

- `TasksPage` mostra un toggle simple entre **Actives** i **Tancades**.
- La composició continua depenent de subseccions i grups per data.

**Nova direcció**

- El toggle `Actives/Tancades` es manté com a filtre ràpid dins del nou patró.
- La taula plana passa a ser la vista principal.

**Columnes recomanades**

- Títol
- Estat
- Prioritat
- Venciment / data
- Projecte / etiquetes
- Accions

**Filtres recomanats**

- estat actives / tancades
- prioritat
- rang de dates o venciment
- etiqueta
- fixades

### Notes

**Situació actual**

- `NotesPage` diferencia entre **Actives** i **Arxivades**.
- Manté accions específiques com **Convertir** i **Arxivar / Activar**.

**Nova direcció**

- Les accions específiques es mantenen.
- La presentació principal passa a ser una taula plana paginada.

**Columnes recomanades**

- Títol
- Estat / arxivada
- Projecte / etiquetes
- Data d'actualització o data funcional
- Accions

**Filtres recomanats**

- actives / arxivades
- etiqueta
- rang de dates
- fixades

### Actes

**Situació actual**

- `ActesPage` ja té cerca, etiquetes i ordenació.
- La renderització final es fa amb `ActaCard` agrupada per data.

**Nova direcció**

- Es manté la capacitat de cerca, filtratge per etiquetes i ordenació.
- La composició principal passa a ser una taula plana paginada.

**Columnes recomanades**

- Títol
- Estat
- Data reunió
- Etiquetes
- Seguiment o accions pendents
- Accions

**Filtres recomanats**

- etiqueta
- estat
- rang de dates
- ordenació

### Hores

**Situació actual**

- `TimeLogTable` ja és tabular i resol bé l'edició en línia i les accions per fila.
- Encara no comparteix del tot el mateix patró general amb la resta de llistats.

**Nova direcció**

- No es refà la base de `TimeLogTable`.
- Es normalitza la pantalla perquè comparteixi el mateix patró de toolbar, filtres i peu de paginació.

**Columnes base**

- Data
- Projecte
- Codi
- Hores
- Descripció
- Accions

**Filtres recomanats**

- període
- projecte
- codi
- text lliure

## Ordenació

La vista taula ha de permetre ordenació almenys per les columnes principals de cada pantalla.

### Regles mínimes

- `Registre`: com a mínim per tipus, data, estat i prioritat
- `Tasques`: com a mínim per títol, estat, prioritat i data/venciment
- `Notes`: com a mínim per títol, estat i data
- `Actes`: com a mínim per data, títol i estat
- `Hores`: com a mínim per data, projecte i hores si el backend o la capa de dades ho permeten

## Paginació

La paginació ha de ser consistent entre pantalles.

### Regles mínimes

- posicionada al peu del llistat
- mostra pàgina actual i navegació cap endavant/enrere
- integrada al mateix patró visual a totes les seccions
- reiniciada quan canvien criteris de cerca, filtre o ordenació

## Estats de la interfície

Cada pantalla ha de resoldre de forma coherent:

- **loading**
- **empty state**
- **resultats amb contingut**
- **filtres actius sense resultats**

Els estats buits han de ser descriptius i específics de la pantalla, però mantenir el mateix patró de composició.

## Fitxers i punts d'integració previstos

- `src/main/frontend/src/components/entries/EntryList.tsx`
- `src/main/frontend/src/components/entries/EntryFilters.tsx`
- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`
- `src/main/frontend/src/pages/ActesPage.tsx`
- `src/main/frontend/src/pages/TimeLogsPage.tsx`
- `src/main/frontend/src/components/timelogs/TimeLogTable.tsx`
- `src/main/frontend/src/components/ui/table.tsx`
- nova capa compartida de gestió de list state via URL
- possibles components compartits per toolbar, selector de vista i peu de paginació

## Estratègia de desplegament

### Fase 1 — infraestructura compartida

- estat URL compartit
- toolbar comuna
- patró de filtres desplegables
- selector `Taula / Targetes`
- patró de paginació

### Fase 2 — Registre

- primera migració completa al nou model
- taula plana per defecte
- targetes com a vista alternativa

### Fase 3 — Tasques, Notes i Actes

- adopció del patró compartit
- preservació d'accions específiques de cada pàgina
- substitució del tall visual principal per data per una taula plana

### Fase 4 — Hores

- alineació visual i funcional amb el nou patró
- reutilització màxima de `TimeLogTable`

## Criteris d'acceptació del disseny

1. Totes cinc pantalles comparteixen el mateix patró base de toolbar, filtres, selector de vista i peu de paginació.
2. La **taula** és la vista per defecte a **Registre**, **Tasques**, **Notes**, **Actes** i **Hores**.
3. La vista en **targetes** continua disponible com a alternativa a les pantalles d'entries.
4. L'estat del llistat queda reflectit i recuperable via URL.
5. Les noves taules de **Registre**, **Tasques**, **Notes** i **Actes** són planes i no es basen en agrupacions per data com a estructura principal.
6. **Hores** conserva les seves capacitats actuals, però amb una presentació alineada amb el patró comú.

## Riscos i límits

- Si es força massa simetria entre pantalles, es poden perdre matisos útils d'accions específiques. El model compartit ha de ser flexible a nivell de contingut de columnes i accions.
- Si la vista targetes intenta mantenir una lògica completament diferent de la taula, es duplicarà massa complexitat. Cal compartir estat i criteris.
- Si la persistència a URL no queda ben definida, es poden generar paràmetres inconsistents entre pantalles.

## Resultat esperat

El producte passa a tenir un sistema de llistats coherent i escalable:

- una sola manera d'entendre cerca, filtres, vista i paginació
- taules més útils per treballar amb volum
- targetes encara disponibles per lectura contextual
- desplegament incremental i baix risc sobre l'arquitectura actual
