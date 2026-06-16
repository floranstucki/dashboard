# Database

## Vue d'ensemble

La base de données est construite autour de l'utilisateur.

Chaque utilisateur possède ses propres :

* Projets
* Tâches
* Objectifs
* Habitudes
* Notes
* Idées
* Événements
* Données financières

---

## Users

| Champ    | Type    |
| -------- | ------- |
| id       | BIGINT  |
| username | VARCHAR |
| email    | VARCHAR |
| password | VARCHAR |

---

## Projects

| Champ       | Type    |
| ----------- | ------- |
| id          | BIGINT  |
| title       | VARCHAR |
| description | TEXT    |
| progress    | INTEGER |
| user_id     | BIGINT  |

---

## Tasks

| Champ      | Type    |
| ---------- | ------- |
| id         | BIGINT  |
| title      | VARCHAR |
| status     | VARCHAR |
| priority   | VARCHAR |
| deadline   | DATE    |
| recurrence | VARCHAR |
| user_id    | BIGINT  |

---

## Sub Tasks

| Champ   | Type    |
| ------- | ------- |
| id      | BIGINT  |
| title   | VARCHAR |
| done    | BOOLEAN |
| task_id | BIGINT  |
| user_id | BIGINT  |

---

## Goals

| Champ    | Type    |
| -------- | ------- |
| id       | BIGINT  |
| title    | VARCHAR |
| progress | INTEGER |
| deadline | DATE    |
| user_id  | BIGINT  |

---

## Habits

| Champ          | Type    |
| -------------- | ------- |
| id             | BIGINT  |
| title          | VARCHAR |
| frequency      | VARCHAR |
| done_today     | BOOLEAN |
| streak         | INTEGER |
| last_done_date | VARCHAR |
| user_id        | BIGINT  |

---

## Notes

| Champ   | Type    |
| ------- | ------- |
| id      | BIGINT  |
| title   | VARCHAR |
| content | TEXT    |
| tag     | VARCHAR |
| user_id | BIGINT  |

---

## Ideas

| Champ    | Type    |
| -------- | ------- |
| id       | BIGINT  |
| title    | VARCHAR |
| content  | TEXT    |
| category | VARCHAR |
| user_id  | BIGINT  |

---

## Calendar Events

| Champ    | Type    |
| -------- | ------- |
| id       | BIGINT  |
| title    | VARCHAR |
| category | VARCHAR |
| date     | DATE    |
| time     | VARCHAR |
| user_id  | BIGINT  |

---

## Finances

| Champ       | Type    |
| ----------- | ------- |
| id          | BIGINT  |
| description | VARCHAR |
| amount      | DECIMAL |
| type        | VARCHAR |
| category    | VARCHAR |
| user_id     | BIGINT  |
