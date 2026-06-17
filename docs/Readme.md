# Home Dashboard

Dashboard personnel moderne développé avec React, Quarkus et MySQL permettant de centraliser la gestion des tâches, projets, finances, objectifs et habitudes au sein d'une seule interface.

---

## Fonctionnalités

### Dashboard

* Widgets personnalisables
* Mode compact
* Objectif principal du moment
* Actions rapides
* Recherche globale
* Notifications intelligentes
* Statistiques avancées

### Tâches

* Création, modification et suppression
* Priorités
* Dates limites
* Tâches récurrentes
* Sous-tâches
* Progression automatique

### Projets

* Gestion de projets
* Suivi d'avancement
* Vue d'ensemble centralisée

### Habitudes

* Création d'habitudes
* Validation quotidienne
* Streaks
* Réinitialisation automatique quotidienne

### Finances

* Revenus
* Dépenses
* Épargne
* Statistiques
* Export PDF

### Calendrier

* Gestion des événements
* Vue centralisée des échéances

### Notes & Idées

* Notes rapides
* Gestion des idées
* Organisation par catégories

---

## Architecture

### Frontend

* React
* React Router
* Context API
* Vite
* Lucide Icons

### Backend

* Java 21
* Quarkus
* Hibernate ORM
* JWT Authentication

### Base de données

* MySQL 8

### Infrastructure

* Docker
* Docker Compose
* Nginx

---

## Lancement avec Docker

### Prérequis

* Docker Desktop
* Docker Compose

### Variables d'environnement

Créer un fichier `.env` :

```env
DB_NAME=home_dashboard
DB_USERNAME=root
DB_PASSWORD=password

DB_URL=jdbc:mysql://mysql:3306/home_dashboard
```

### Démarrage

```bash
docker compose up --build
```

### Accès

Frontend :

```txt
http://localhost:8080
```

Backend :

```txt
http://localhost:7777
```

API :

```txt
http://localhost:7777/q/swagger-ui
```

---

## Structure du projet

```txt
home-dashboard/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── utils/
│
├── backend/
│   ├── src/main/java/
│   ├── Entity/
│   ├── Resource/
│   ├── Service/
│   └── DTO/
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## Intégrations

- Open-Meteo : météo trail/randonnée
- Serveur personnel : statut CPU, RAM et disque
- Strava : activités sportives via OAuth2

Les secrets d'intégration sont définis dans le fichier `.env`.

---

## Intégrations avancées

- Strava OAuth : activités sportives, distance hebdomadaire, dénivelé et dernière sortie.
- GitHub OAuth : repos publics/privés, issues, pull requests et activité récente.
- Open-Meteo : météo trail/randonnée.
- Serveur personnel : statut, CPU, RAM, disque, uptime et services.
- Signal FC : actualités et manifestations WordPress.

---

## Variables d'environnement

```env
DB_NAME=home_dashboard
DB_USERNAME=root
DB_PASSWORD=

DB_URL=jdbc:mysql://mysql:3306/home_dashboard

STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=http://localhost:7777/strava/callback
```


## Fonctionnalités principales développées

* Authentification JWT
* Gestion des tâches et sous-tâches
* Tâches récurrentes
* Gestion de projets
* Gestion des habitudes
* Gestion des objectifs
* Gestion des finances
* Export PDF
* Notifications intelligentes
* Dashboard personnalisable

---

## Auteur

Floran Stucki

Projet personnel de gestion de productivité et d'organisation.
