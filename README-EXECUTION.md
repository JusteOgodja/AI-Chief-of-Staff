# Comment exécuter le projet AI Chief of Staff

Ce guide vous explique comment démarrer le projet complet (backend + frontend).

## Prérequis

### Backend (Python)
- Python 3.11+
- pip (gestionnaire de paquets Python)

### Frontend (Node.js)
- Node.js 18+ 
- npm (gestionnaire de paquets Node.js)

## Configuration initiale

### 1. Cloner le projet
```bash
git clone <repository-url>
cd AI-Chief-of-Staff
```

### 2. Configurer l'environnement Python
```bash
# Créer un environnement virtuel
python -m venv .venv

# Activer l'environnement
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Installer les dépendances Python
pip install -r requirements.txt
```

### 3. Configurer les variables d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env selon vos besoins
# Par défaut, le projet utilise Ollama (gratuit et local)
```

### 4. Installer les dépendances Frontend
```bash
cd frontend_modern
npm install
cd ..
```

## Démarrage rapide

### Option 1: Utiliser les scripts de démarrage

#### Sur Windows:
```bash
# Démarrer le backend (Terminal 1)
python start-backend.py

# Démarrer le frontend (Terminal 2)  
start-frontend.bat
```

#### Sur Mac/Linux:
```bash
# Démarrer le backend (Terminal 1)
python start-backend.py

# Démarrer le frontend (Terminal 2)
chmod +x start-frontend.sh
./start-frontend.sh
```

### Option 2: Démarrage manuel

#### Backend (Terminal 1):
```bash
# Activer l'environnement virtuel
.venv\Scripts\activate  # Windows
# ou
source .venv/bin/activate  # Mac/Linux

# Démarrer le serveur FastAPI
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend (Terminal 2):
```bash
cd frontend_modern
npm run dev
```

## Accès à l'application

Une fois les deux serveurs démarrés:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **Documentation API**: http://localhost:8000/docs

## Structure de l'application

### Backend (FastAPI)
- `api/main.py`: Serveur API principal
- `agents/`: Agents IA (Memory, Coordinator, Critic)
- `graph/`: Gestion du graphe de connaissances
- `ingestion/`: Import et traitement des données
- `dashboard/`: Interface Streamlit (alternative)

### Frontend (React + Vite)
- `frontend_modern/src/`: Code source React
- `frontend_modern/src/pages/`: Pages de l'application
- `frontend_modern/src/components/`: Composants réutilisables
- `frontend_modern/src/lib/api.ts`: Client API pour communiquer avec le backend

## Fonctionnalités

1. **Interface Agent**: Posez des questions en langage naturel
2. **Graphe de connaissances**: Visualisation interactive du réseau
3. **Suivi des changements**: Quoi de neuf aujourd'hui
4. **Détection de conflits**: Identification des problèmes
5. **Tableau de bord**: Vue d'ensemble avec statistiques

## Dépannage

### Backend ne démarre pas
- Vérifiez que Python 3.11+ est installé: `python --version`
- Vérifiez l'environnement virtuel: `which python` (Mac/Linux) ou `where python` (Windows)
- Réinstallez les dépendances: `pip install -r requirements.txt`

### Frontend ne démarre pas
- Vérifiez Node.js: `node --version`
- Vérifiez npm: `npm --version`
- Réinstallez les dépendances: `cd frontend_modern && npm install`

### Erreur de connexion API
- Assurez-vous que le backend tourne sur http://localhost:8000
- Vérifiez le port 8000 n'est pas utilisé par une autre application
- Consultez les logs du backend pour des erreurs

### Problèmes avec Ollama
- Installez Ollama: https://ollama.ai/
- Téléchargez un modèle: `ollama run llama3.2`
- Vérifiez qu'Ollama tourne: `ollama list`

## Support

Pour toute question ou problème, consultez:
- Les logs du backend (terminal où vous avez lancé le backend)
- Les logs du frontend (terminal où vous avez lancé le frontend)
- La documentation API: http://localhost:8000/docs
