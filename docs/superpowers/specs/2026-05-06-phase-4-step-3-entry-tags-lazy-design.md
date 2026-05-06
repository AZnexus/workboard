# Phase 4 Step 3/4 — `EntryEntity.tags` Lazy Loading Design

## Goal

Canviar `EntryEntity.tags` de `fetch = EAGER` a `fetch = LAZY` sense alterar el comportament funcional ni visual de l'aplicació.

## Context

Els passos 1/4 i 2/4 de la Fase 4 ja han preparat els read paths crítics perquè carreguin tags de manera explícita:

- `EntryService` per detail/list/search
- `DashboardService` per daily/standup
- `MarkdownExportService` per export day/range

Amb això, el següent tall natural és deixar d'acoblar tota `EntryEntity` a una càrrega global de tags.

## Problema actual

`EntryEntity.tags` continua amb `fetch = EAGER`, cosa que implica:

- càrrega automàtica de tags fins i tot en camins que no els necessiten
- acoblament entre la forma de l'entitat i read paths concrets
- risc de mantenir green tests mentre encara hi ha dependències implícites amagades

## Disseny proposat

### 1. Canvi únic de model

Modificar `src/main/java/com/workboard/entry/EntryEntity.java` perquè:

- `@OneToMany(... fetch = FetchType.EAGER)` passi a `fetch = FetchType.LAZY`

No es farà cap altre canvi global de mapping en aquest pas.

### 2. Fonts vàlides de càrrega de tags

Després del canvi a `LAZY`, els únics camins admesos per consumir tags en lectura han de ser els read paths explícits que ja existeixen a `EntryRepository`:

- `findByIdWithTags(...)`
- `findAllWithTags(Pageable)`
- `findAllWithTags(Specification<EntryEntity>, Pageable)`
- `findByDateOrderByPinnedDescCreatedAtDescWithTags(...)`
- `findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(...)`
- `findByTypeAndStatusOrderByCreatedAtDescWithTags(...)`

Si apareix un trencament nou, la correcció correcta és afegir o ajustar un read path específic, no recuperar un eager global.

### 3. Superfície que ha de continuar intacta

Aquest pas ha de preservar exactament el comportament actual a:

- API d'entries que serialitza `EntryResponse`
- dashboard daily/standup
- export markdown
- qualsevol flux de create/update que continuï dins transacció i no depengui de serialització fora del context correcte

### 4. Regla de contenció

Aquest pas no inclou:

- redisseny de serveis `entry/tag/timelog`
- refactors amplis de repositori
- simplificació d'exception mapping
- canvis visuals o de shape de resposta

Si es detecta una nova dependència implícita, només s'arreglarà el camí concret afectat.

## Fitxers esperats

- `src/main/java/com/workboard/entry/EntryEntity.java`
- possiblement `src/main/java/com/workboard/entry/EntryRepository.java` només si surt un read path residual no cobert
- tests d'entry/dashboard/export ja existents, només si cal reforçar alguna cobertura residual

## Estratègia de verificació

### Tall mínim

1. test focalitzat del canvi lazy sobre els read paths ja protegits
2. suite ampliada de Phase 4 step 3/4 a:
   - `EntryServiceTest`
   - `EntryRepositoryIntTest`
   - `EntryControllerIntTest`
   - `DashboardControllerIntTest`
   - `ExportControllerIntTest`
   - `DashboardServiceTest`
   - `MarkdownExportServiceTest`
   - `EntryResponseTest`
3. `./mvnw -q -DskipTests package`

### Criteri d'acceptació

El pas 3/4 només es considerarà complet si:

- no hi ha `LazyInitializationException`
- no canvia cap resposta observable
- els tests objectiu passen
- el package passa

## Risc principal

El risc real és que encara quedi algun consum implícit de `entity.getTags()` fora d'un read path explícit.

Aquest risc és acceptable perquè el canvi es farà ara que els camins principals ja estan blindats, i perquè qualsevol regressió hauria d'aparèixer ràpidament a la verificació focalitzada.

## Decisió

El següent tall recomanat és executar aquest canvi lazy com a pas 3/4 de la Fase 4, mantenint el diff petit i limitat al hotspot preparat pels passos anteriors.
