# Disseny — subseccions de Fixades a les llistes d'entries

## Objectiu

Fer que les entries fixades es mostrin sempre en una subsecció pròpia a la part superior de les llistes on el pin ha de tenir pes funcional, en lloc de dependre d'ordenacions inconsistents per prioritat o data.

## Problema actual

- A **El meu dia / Avui**, el frontend torna a ordenar les tasques per prioritat i el pin no domina l'ordre final.
- A **Pendent**, les tasques fixades no tenen una subsecció pròpia.
- A **Tasques**, **Notes** i **Registre**, la UI agrupa principalment per data i no aplica un model compartit per a fixades.
- El comportament és diferent segons la pantalla, encara que totes consumeixen el mateix camp `pinned`.

## Decisió

S'introdueix un model compartit de presentació que transforma qualsevol col·lecció d'entries en subseccions opcionals:

- **Fixades**
- **Sense fixar**

Cada subsecció:

- només es mostra si té contingut
- té comptador propi
- aplica exactament la mateixa regla d'ordenació interna

La UI farà servir la nomenclatura **Fixades**. No s'ha d'utilitzar text amb “pin” o “pinejades”.

## Regla d'ordenació interna

Dins de cada subsecció, les entries s'ordenen amb aquesta prioritat:

1. `priority` ascendent
2. entries amb `dueDate` abans que entries sense `dueDate`
3. `dueDate` ascendent
4. `createdAt` descendent com a desempat final

Aquesta regla s'ha d'aplicar de forma centralitzada i compartida.

## Àmbit funcional

La nova estructura de subseccions s'aplica a:

- **El meu dia / Avui**
- **El meu dia / Pendent**
- **Tasques**
- **Notes**
- **Registre**
- altres seccions específiques de llistes on el pin s'utilitzi com a criteri funcional de priorització

Queda explícitament **fora d'abast**:

- **El meu dia / Ahir**, que manté el comportament actual

## Model de presentació compartit

Cal crear una capa comuna de presentació per a llistes d'entries que:

1. separi les entries en fixades i no fixades
2. ordeni cada subsecció amb la regla acordada
3. calculi els comptadors de subsecció
4. retorni només subseccions amb contingut

L'objectiu és que la decisió funcional “fixada vs no fixada” no torni a quedar dispersa entre `DailyView`, `TasksPage`, `NotesPage` i `EntryList`.

## Integració per pantalla

### El meu dia

`DailyView` passa a fer servir el model compartit per a:

- bloc **Avui**
- bloc **Pendent**

En aquests dos casos, la subsecció principal és **Fixades** i després **Sense fixar**.

El bloc **Ahir** no es modifica.

També s'elimina la dependència del resort local només per prioritat a `todayTasks`, ja que la priorització passa a resoldre's des de la capa compartida.

### Tasques

`TasksPage` deixa de tenir la data com a primer criteri de segmentació visual. Primer es mostren les subseccions **Fixades** i **Sense fixar** i, dins de cadascuna, s'aplica l'ordre funcional acordat.

### Notes

`NotesPage` adopta exactament el mateix patró que **Tasques**, mantenint les accions pròpies de la pàgina però reutilitzant la mateixa preparació de subseccions.

### Registre

`EntryList` deixa de limitar-se a renderitzar l'ordre rebut i els grups per data com a eix principal. El registre també passa a tenir subseccions **Fixades** i **Sense fixar** com a primer tall visual.

Tot i que el backend ja retorna el registre amb `pinned desc`, la UI necessita igualment la capa compartida perquè ara no només s'ordena, sinó que es renderitzen subseccions explícites amb comptadors.

## Comportament respecte a la data

Per a **Tasques**, **Notes** i **Registre**, la segmentació per fixació va **per sobre de la data**.

Això implica que:

- primer es mostren les subseccions **Fixades** i **Sense fixar**
- la data ja no crea els blocs principals de la pàgina
- la data continua sent informació útil de l'entry i un criteri de suport quan cal, però no l'eix principal de la composició visual

## Comportament visual

La UI manté `EntryCard` com a component base.

S'hi afegeix un context visual de subsecció per tal que, dins del bloc **Fixades**:

- el contenidor de subsecció tingui una vora o tractament visual diferenciat
- el bloc sigui fàcilment identificable com a zona prioritària
- la icona de fixació quedi reforçada visualment dins de la targeta, sense redissenyar tota la card

Cada subsecció té un header propi, per exemple:

- **Fixades (3)**
- **Sense fixar (8)**

Aquest header ha de ser reutilitzable i coherent amb el patró de capçaleres de secció que ja existeix a `DailyView`.

## Casos límit

- Si només hi ha entries fixades, només es mostra **Fixades**.
- Si només hi ha entries no fixades, només es mostra **Sense fixar**.
- Si dues entries empaten en prioritat i en presència de `dueDate`, el desempat final és `createdAt desc`.
- El canvi és exclusivament de presentació compartida; no canvia la semàntica del camp `pinned`.

## Fitxers i punts d'integració previstos

- `src/main/frontend/src/components/dashboard/DailyView.tsx`
- `src/main/frontend/src/components/entries/EntryList.tsx`
- `src/main/frontend/src/pages/TasksPage.tsx`
- `src/main/frontend/src/pages/NotesPage.tsx`
- `src/main/frontend/src/components/entries/EntryCard.tsx`
- nova utilitat o mòdul compartit de preparació de subseccions d'entries
- possible component compartit de header/contenidor de subsecció

## Estratègia de validació

Cal verificar com a mínim aquests escenaris:

1. **El meu dia / Avui** amb una tasca urgent no fixada i una tasca normal fixada: la fixada ha d'aparèixer dins del bloc superior **Fixades**.
2. **Pendent** amb elements fixats i no fixats: les dues subseccions han d'aparèixer separades i amb comptador propi.
3. **Tasques**, **Notes** i **Registre**: les subseccions de fixació han d'aparèixer per sobre de qualsevol agrupació prèvia per data.
4. **El meu dia / Ahir**: no ha de canviar visualment ni funcionalment.
5. El bloc **Fixades** ha de mostrar el tractament visual reforçat i la icona de fixació visible.

## Resultat esperat

El producte passa a tenir una única regla mental clara:

- les entries fixades són sempre visibles primer dins del seu bloc **Fixades**
- les entries no fixades queden agrupades a **Sense fixar**
- el mateix criteri s'aplica de manera coherent a totes les pantalles rellevants
