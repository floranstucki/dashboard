# API Documentation

Base URL :

```txt
http://localhost:7777
```

---

# Authentication

## Login

```http
POST /auth/login
```

Body :

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response :

```json
{
  "token": "jwt-token"
}
```

---

# Projects

## Get Projects

```http
GET /projects
```

## Create Project

```http
POST /projects
```

## Update Project

```http
PUT /projects/{id}
```

## Delete Project

```http
DELETE /projects/{id}
```

---

# Tasks

## Get Tasks

```http
GET /tasks
```

## Create Task

```http
POST /tasks
```

## Toggle Status

```http
PUT /tasks/{id}/status
```

## Delete Task

```http
DELETE /tasks/{id}
```

---

# Sub Tasks

## Get Sub Tasks

```http
GET /tasks/{id}/subtasks
```

## Create Sub Task

```http
POST /tasks/{id}/subtasks
```

## Toggle Sub Task

```http
PUT /tasks/{id}/subtasks/{subTaskId}
```

## Delete Sub Task

```http
DELETE /tasks/{id}/subtasks/{subTaskId}
```

---

# Goals

```http
GET /goals
POST /goals
PUT /goals/{id}
DELETE /goals/{id}
```

---

# Habits

```http
GET /habits
POST /habits
PUT /habits/{id}/toggle
DELETE /habits/{id}
```

---

# Notes

```http
GET /notes
POST /notes
PUT /notes/{id}
DELETE /notes/{id}
```

---

# Ideas

```http
GET /ideas
POST /ideas
PUT /ideas/{id}
DELETE /ideas/{id}
```

---

# Calendar

```http
GET /calendar
POST /calendar
PUT /calendar/{id}
DELETE /calendar/{id}
```

---

# Finances

```http
GET /finances
POST /finances
PUT /finances/{id}
DELETE /finances/{id}
```

---

# Reports

## Monthly Report

```http
GET /reports/monthly
```

Retourne un rapport PDF mensuel contenant :

* Résumé financier
* Statistiques
* Graphiques
* Répartition des dépenses


## Integrations

```http
GET /weather
GET /server-status

GET /strava/connect-url
GET /strava/callback
GET /strava/status
GET /strava/activities
DELETE /strava/disconnect

GET /github/connect-url
GET /github/callback
GET /github/status
GET /github/repos
GET /github/activity
GET /github/events
DELETE /github/disconnect

GET /signal-fc/posts
GET /signal-fc/manifestations