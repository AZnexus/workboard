# Phase 4 Step 4/4 — TimeLog / Entry Boundary Design

## Goal

Eliminar l'acoblament directe de `TimeLogService` amb `EntryRepository` sense canviar el comportament funcional ni visible de l'app.

## Context

Després del pas 3/4, el hotspot de fetch de tags ja està resolt:

- `EntryEntity.tags` és `LAZY`
- els read paths crítics ja carreguen tags explícitament

El següent tall natural i segur dins la Fase 4 és una costura petita de fronteres entre mòduls.

## Problema actual

`TimeLogService` depèn directament d'`EntryRepository` per resoldre `entryId` a `create()` i `update()`.

Això implica:

- dependència directa del mòdul `timelog` sobre el detall de persistència del mòdul `entry`
- una frontera menys neta que la que ja s'ha establert a `EntryService -> TagService`

## Disseny proposat

### 1. Tall mínim de frontera

`TimeLogService` ha de deixar de dependre d'`EntryRepository` i passar a dependre d'una frontera petita d'`entry`.

La forma recomanada és:

- exposar a `EntryService` un mètode simple per resoldre una entry opcional per ID, pensat per a enllaç intern de timelog
- fer que `TimeLogService` usi aquest mètode en lloc d'accedir al repositori directament

### 2. Semàntica que s'ha de mantenir exactament igual

No s'ha de canviar res d'això:

- si `entryId` és `null`, el timelog es desa sense entry
- si `entryId` no existeix, el comportament s'ha de mantenir igual que ara
- la resposta de `TimeLogController` no canvia de shape
- no es toquen dashboard, export, tags ni read paths de la Fase 4 anterior

### 3. Regla de contenció

Aquest pas no inclou:

- canvis de model a `TimeLogEntity`
- refactor de controladors
- canvi de semàntica de validació sobre `entryId`
- reestructuració gran dels serveis `entry` o `timelog`

Només s'ha de moure la dependència cap a una frontera de servei més neta.

## Fitxers esperats

- `src/main/java/com/workboard/timelog/TimeLogService.java`
- `src/main/java/com/workboard/entry/EntryService.java`
- nou test focalitzat de servei per `timelog`
- possiblement reforç mínim a `TimeLogControllerIntTest` si cal una xarxa addicional

## Estratègia de verificació

1. test nou de `TimeLogService` per create/update amb `entryId` present, absent i inexistent
2. verificació de `TimeLogControllerIntTest`
3. verificació ampliada dels tests de `entry`, `dashboard`, `export` i `timelog` relacionats
4. `./mvnw -q -DskipTests package`

## Criteri d'acceptació

El pas 4/4 només es considerarà complet si:

- `TimeLogService` ja no depèn directament d'`EntryRepository`
- el comportament observable amb `entryId` no canvia
- no hi ha regressions a timelog ni als passos anteriors de la Fase 4
- el package passa

## Decisió

El pas 4/4 recomanat és aquest cleanup de frontera `TimeLogService -> EntryRepository`, perquè és el tall més petit, justificat i amb menys risc de regressió per tancar la Fase 4.
