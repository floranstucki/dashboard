# Architecture

## Vue d'ensemble

Home Dashboard est une application web de productivité personnelle permettant de centraliser :

* Tâches
* Sous-tâches
* Projets
* Objectifs
* Habitudes
* Notes
* Idées
* Événements
* Finances

L'application suit une architecture Frontend / Backend / Base de données.

---

## Architecture globale

```txt
Frontend React
       │
       ▼
REST API Quarkus
       │
       ▼
MySQL
```

---

## Frontend

Technologies :

* React
* Vite
* React Router
* Context API
* Lucide Icons

Responsabilités :

* Interface utilisateur
* Gestion des états
* Authentification
* Appels API

---

## Backend

Technologies :

* Java 21
* Quarkus
* Hibernate ORM
* JWT

Responsabilités :

* Logique métier
* Validation
* Sécurité
* Gestion des données

---

## Base de données

Technologie :

* MySQL 8

Responsabilités :

* Persistance des données
* Relations entre entités
* Stockage des utilisateurs

---

## Sécurité

Authentification :

* JWT Access Token

Protection :

* Routes sécurisées
* Isolation des données utilisateur
* Vérification de propriété des ressources

---

## Déploiement

Infrastructure :

* Docker
* Docker Compose

Services :

* Frontend
* Backend
* MySQL
