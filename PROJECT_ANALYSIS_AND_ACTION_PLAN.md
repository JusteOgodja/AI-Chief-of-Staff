# Superhuman AI Chief of Staff — Analyse & Plan d'action technique

## 1. Synthèse du contexte et des objectifs

### Ce que le brief demande réellement
- **Abstraction centrale** : une couche d’*Organizational Intelligence* — pas un chatbot ni un feed, mais un “cerveau” qui voit les flux, comprend les dépendances, résout les conflits et crée de la transparence.
- **Problème ciblé** : l’information circule “à l’aveugle” (meetings, emails, messages, voice, docs) → surcharge pour certains, exclusion pour d’autres, pas de source de vérité partagée.
- **Vision produit** : un “AI Chief of Staff” agentique qui mappe les flux, construit un graphe de connaissances et de parties prenantes, maintient une vérité versionnée, décide quoi amplifier/restreindre/router, et s’expose via texte, voix et visuel.

### Critères d’évaluation (prioriser)
| Critère | Poids implicite | Implication |
|--------|------------------|-------------|
| **Communication Intelligence** | Fort | Modélisation et routage de l’info au cœur du design |
| **Knowledge Graph & Stakeholder Map** | Fort | Représentation claire de la structure et des dépendances |
| **UI & Visualisation** | Fort | Modèles visuels des flux et du raisonnement de l’IA |
| **UX & Interaction** | Fort | Voix, faible friction, peu de clics/typing |
| **Créativité & Moonshot** | Moyen | Interprétation ambitieuse du “cerveau” |
| **Deconfliction & Critique** | Moyen | Détection de contradictions / surcharge |
| **Qualité de la démo** | Fort | Prototype clair, convaincant, intuitif |

---

## 2. Périmètre fonctionnel et technique

### Dans le scope (attendu / prioritaire)
- **Mapping du flux d’information** : qui communique avec qui, sur quoi, à quelle fréquence.
- **Graphe de connaissances + carte des parties prenantes** : personnes, équipes, sujets, décisions, dépendances.
- **Source de vérité vivante** : états actuels des décisions/sujets, versionnés.
- **Routage intelligent** : “Qui doit savoir quoi ?” — notifications ciblées selon pertinence.
- **Visualisation** : cartes de flux, graphes, “What changed today?”, vue contexte pour un nouveau stakeholder.
- **Agent “critique”** : détection de contradictions ou d’infos conflictuelles.
- **Multi-modalité** : au minimum texte ; voix (STT/TTS) et visuel renforcent la note “UX & interaction”.

### Optionnel (renforce la démo si le temps le permet)
- **Voice in/out** : STT pour saisie, TTS pour réponses.
- **Multi-agent avancé** : plusieurs agents spécialisés (memory, critic, coordinator) avec orchestration explicite.
- **Mobile** : mentionné dans “modalities” — utile en démo si l’UI web est déjà solide.

### Hors scope explicite
- Intégration réelle à des outils métier (Slack, Google Workspace, etc.) — le brief suggère des **datasets publics** (Enron, SNAP, mailing lists) comme **proxy** pour la démo.
- Authentification / SSO entreprise.
- Scale “vraie” entreprise (performance, sécurité) — focus prototype/démo.

### Hypothèses techniques à trancher tôt
- **Stack** : Python (data/ML/agents) + frontend (React/Next.js ou Streamlit pour vélocité) — recommandation ci-dessous.
- **Données** : utiliser Enron ou SNAP comme corpus d’entrée pour construire graphe + flux ; pas de live data en MVP.
- **LLM** : OpenAI (sponsor du track) pour extraction d’entités, résumés, raisonnement agent ; possibilité de mock pour dev sans clé.
- **Graphe** : Neo4j ou NetworkX + persistance simple (JSON/SQLite) en MVP ; Neo4j si on veut une démo “knowledge graph” très visible.

---

## 3. Architecture logique proposée

### Vue d’ensemble en couches

```
┌─────────────────────────────────────────────────────────────────────────┐
│  INTERFACES (Voice, Text, Visual)                                       │
│  — Chat / requêtes naturelles  — Tableau de bord (flux, graphe, alerts) │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION AGENTIQUE                                                 │
│  — Coordinator Agent (routing, "who needs to know")                      │
│  — Memory Agent (versioned truth, updates)                               │
│  — Critic Agent (conflicts, overload detection)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────┐
│  CŒUR MÉTIER                                                             │
│  — Information Flow Model  — Stakeholder Map  — Knowledge Graph          │
│  — Living Source of Truth (versioned)  — Notification / Routing Engine   │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────┐
│  INGESTION & EXTRACTION                                                  │
│  — Parsers (emails, threads, optional: voice transcripts)                │
│  — Entity/Topic/Decision extraction (LLM)  — Graph builder               │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────┐
│  DONNÉES                                                                 │
│  — Raw corpus (Enron/SNAP/forums)  — Graph store  — Versioned truth DB  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Composants principaux

| Composant | Rôle | Livrable MVP |
|-----------|------|--------------|
| **Ingestion** | Charger et parser le corpus (e.g. Enron), normaliser en “events” (sender, receiver, date, body, thread_id) | Pipeline CLI ou script qui produit un JSON/Parquet d’events |
| **Extraction** | Entités (personnes, équipes), sujets, décisions via LLM (ou règles/heuristiques si pas de LLM) | Module qui enrichit chaque event et alimente le graphe |
| **Knowledge Graph + Stakeholder Map** | Nœuds : Person, Team, Topic, Decision ; arêtes : communicates_with, works_on, decided_on, depends_on | Graphe en mémoire (NetworkX) ou Neo4j + export pour viz |
| **Information Flow Model** | Fréquences, directions, clusters de communication ; “where knowledge is blocked or duplicated” | Métriques + petits algorithmes (centralité, communautés) |
| **Living Source of Truth** | Décisions/sujets avec version (timestamp, source, diff) | Structure versionnée (e.g. JSON par “decision_id” avec history) |
| **Coordinator Agent** | Répond à “Who needs to know this?” ; suggère des notifications | Prompt + appel LLM + utilisation du graphe |
| **Critic Agent** | Détecte contradictions (même sujet, affirmations opposées) ou surcharge | Règles ou LLM sur les extraits “decision/topic” |
| **Visualisation** | Graphe interactif, flux, “What changed today?”, vue contexte nouveau stakeholder | 1 dashboard (React ou Streamlit) avec au moins graphe + liste de changements |
| **Voice (optionnel)** | STT entrée, TTS sortie | Intégration Whisper + TTS (OpenAI ou autre) |

### Flux de données principaux

1. **Offline : Build**
   - Corpus (Enron/SNAP) → **Ingestion** → events normalisés.
   - Events → **Extraction** (LLM) → entités, sujets, décisions.
   - Entités + events → **Graph Builder** → Knowledge Graph + Stakeholder Map.
   - Décisions extraites → **Source of Truth** (versionnée).

2. **Temps réel / démo : Query**
   - Utilisateur : “What changed today?” / “Who needs to know X?” / “Context for new hire Y”.
   - **Orchestration** → Coordinator + Memory + Critic.
   - **Cœur** : lecture du graphe + source de vérité → réponses + listes de notifications.
   - **UI** : réponses texte + visuels (carte de flux, graphe, changements).

3. **Simulation “event” (démo)**
   - Un “meeting” ou “email” simulé est injecté → re-extraction → mise à jour du graphe et de la source de vérité → notifications suggérées + “What changed” mis à jour.

---

## 4. Décomposition en étapes (MVP → améliorations)

### Phase 0 — Setup (Jour 1)
- **0.1** Environnement : Python 3.11+, venv, `requirements.txt` (openai, networkx, pandas, streamlit ou react selon choix).
- **0.2** Structure du repo : `data/`, `ingestion/`, `extraction/`, `graph/`, `agents/`, `api/` (ou `backend/`), `frontend/` (ou `dashboard/`), `config/`.
- **0.3** Config : clé OpenAI (ou mock), chemins datasets, paramètres (model, batch size).

### Phase 1 — Données et graphe (Jours 2–3)
- **1.1** Télécharger et parser un sous-ensemble Enron (ou SNAP) → CSV/JSON : `sender_id`, `receiver_id`, `timestamp`, `body`, `subject`, `thread_id`.
- **1.2** Créer le modèle de graphe (Person, Topic, Decision ; relations) et le builder à partir des events (sans LLM) : personnes = senders/receivers, arêtes = communications.
- **1.3** Persistance simple : export du graphe (JSON ou base Neo4j) + chargement au démarrage.
- **Livrable** : script qui produit un graphe de communication à partir d’Enron, visualisable (export GraphML ou via lib de viz).

### Phase 2 — Extraction et “vérité” (Jours 3–4)
- **2.1** Module d’extraction LLM : pour un batch d’emails/messages, extraire topics, décisions, entités mentionnées (prompt structuré, sortie JSON).
- **2.2** Alimenter le graphe avec Topic et Decision (nœuds + liens vers Person).
- **2.3** “Living source of truth” : structure de stockage des décisions avec version (id, subject, summary, timestamp, source_message_id, previous_version_id).
- **Livrable** : graphe enrichi + base de “décisions” versionnées ; script “simulate new email → update graph and truth”.

### Phase 3 — Agents (Jours 4–5)
- **3.1** **Memory Agent** : répond à “What is the current truth?” / “What changed today?” en lisant la source de vérité et le graphe.
- **3.2** **Coordinator Agent** : “Who needs to know this?” — input = résumé d’un event ; output = liste de personnes/équipes à notifier (règles + graphe + optionnel LLM).
- **3.3** **Critic Agent** : parcourir les décisions/sujets, détecter paires contradictoires (par similarité de sujet + conflit sémantique via LLM ou règles).
- **Livrable** : 3 agents appelables depuis un orchestrateur minimal (une fonction “query” qui dispatch selon l’intention).

### Phase 4 — Visualisation et UX (Jours 5–7)
- **4.1** Dashboard : graphe interactif (stakeholders + knowledge), couche “flux” (épaisseur/volume entre nœuds).
- **4.2** Vues : “What changed today?” (liste + mini timeline), “Context for [person]” (subgraph + résumé).
- **4.3** Exposer le raisonnement : pour une requête, afficher “l’IA a consulté : graphe, décisions X,Y ; a notifié : A,B,C”.
- **Livrable** : démo utilisable avec données Enron + scénarios du brief (meeting ends → update → notify ; founder asks “what changed?” ; new stakeholder context ; critic flags conflict).

### Phase 5 — Polish et voix (Jours 7+)
- **5.1** Voice : STT (Whisper) pour la requête, TTS pour la réponse (optionnel).
- **5.2** Améliorer les prompts et la qualité des extractions.
- **5.3** Démo narrative : script de démo (3–5 min) qui montre les critères du brief.

---

## 5. Par quoi commencer — ordre concret

### Ordre recommandé des fichiers / modules

1. **`README.md`** — objectif du projet, comment lancer ingestion puis dashboard.
2. **`requirements.txt`** — dépendances (voir section 6).
3. **`config/settings.py`** ou `config.yaml` — chemins data, `OPENAI_API_KEY`, model.
4. **`ingestion/parser.py`** — parser Enron (ou lecteur SNAP) → liste de dicts (events).
5. **`ingestion/run_ingestion.py`** — script qui appelle le parser et écrit `data/events.json` (ou .parquet).
6. **`graph/schema.py`** — définitions (Person, Topic, Decision, relations) ; pas forcément un ORM, des dataclasses ou TypedDict suffisent.
7. **`graph/builder.py`** — à partir de `events`, construire le graphe (NetworkX ou driver Neo4j).
8. **`graph/repository.py`** — load/save graphe (fichier ou Neo4j).
9. **`extraction/extractor.py`** — appel LLM pour extraire topics/décisions/entités d’un texte ; interface : `extract(texte) -> dict`.
10. **`extraction/enrich_events.py`** — boucle sur events, appelle extractor, attache les champs au graphe + source de vérité.
11. **`truth/source_of_truth.py`** — structure “versioned decisions” + add/update/get.
12. **`agents/memory_agent.py`**, **`agents/coordinator_agent.py`**, **`agents/critic_agent.py`** — chacun avec une fonction `run(...)` qui prend les entrées et le graphe/truth.
13. **`agents/orchestrator.py`** — route les requêtes utilisateur vers le bon agent (ou combine).
14. **`api/main.py`** (FastAPI) ou **`dashboard/app.py`** (Streamlit) — 1 endpoint “query” + 1 “get_graph” pour la viz.
15. **`frontend/`** (React) ou **`dashboard/`** (Streamlit) — page avec graphe (e.g. vis.js, D3, ou Streamlit + streamlit-agraph / pyvis) + zone “What changed” + champ requête.

### Première séquence de travail (aujourd’hui)

1. Créer le repo (structure de dossiers ci-dessus).
2. Rédiger `requirements.txt` et `config/settings.py`.
3. Implémenter le parser Enron minimal (ou un loader SNAP) et écrire `data/events.json`.
4. Implémenter `graph/schema.py` + `graph/builder.py` avec NetworkX : nœuds = personnes (emails), arêtes = nombre d’échanges.
5. Exporter le graphe (JSON ou GraphML) et le visualiser une première fois (script Python avec pyvis ou networx → HTML) pour valider la chaîne.

Dès que cette chaîne fonctionne, tu as un “cœur” données + graphe sur lequel brancher extraction LLM, source de vérité et agents.

---

## 6. Choix techniques et recommandations

### Langage et backend
- **Recommandation** : **Python** pour tout le pipeline (ingestion, extraction, graphe, agents). Rapide pour prototyper, écosystème LLM et graphes mature.
- **Alternative** : Node.js + TypeScript si l’équipe est plus à l’aise ; les SDK OpenAI existent ; le calcul graphe (centralité, etc.) sera moins direct qu’avec NetworkX.

### Frontend
- **Recommandation** : **Streamlit** pour le MVP : dashboard rapide, intégration Python native, composants pour graphes (pyvis, streamlit-agraph). Idéal pour une démo “vision + interaction” en peu de temps.
- **Alternative** : **React + Next.js** si tu veux une UI plus personnalisée et “product-like” ; il faudra exposer une API (FastAPI) et consommer depuis le front. Plus de temps, meilleure impression “moonshot”.

### Graphe
- **Recommandation** : **NetworkX** en MVP (en mémoire, export JSON/GraphML). Rapide, pas d’infra. Pour la démo, pyvis ou vis.js côté front pour le rendu.
- **Alternative** : **Neo4j** si tu veux mettre en avant “knowledge graph” et requêtes Cypher (plus impressionnant pour le jury, un peu plus de setup).

### LLM
- **Recommandation** : **OpenAI API** (GPT-4o ou gpt-4o-mini pour le coût) pour extraction et agents — cohérent avec le sponsor. Prévoir un mode “mock” (réponses en dur ou log) pour dev sans clé.
- **Alternative** : modèle local (Ollama, etc.) si contrainte coût ou offline ; peut dégrader légèrement la qualité des extractions.

### Données
- **Recommandation** : **Enron corpus** (emails publics) : déjà utilisé en recherche, format connu, scripts de parsing existants. Sous-ensemble de 5–10k emails suffit pour une démo.
- **Alternative** : **SNAP email** (Stanford) pour un autre graphe de communication ; ou combiner les deux pour montrer “multi-source”.

### Voix (optionnel)
- **Recommandation** : **OpenAI Whisper** (STT) + **OpenAI TTS** pour cohérence et simplicité. Intégration en dernier après que le flux texte soit solide.

---

## 7. Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Extraction LLM lente ou coûteuse | Traiter par batch ; cache des extractions par `message_id` ; utiliser gpt-4o-mini pour l’extraction. |
| Graphe trop gros pour la viz | Filtrer par sous-graphe (e.g. top 50 nœuds par centralité), ou par “équipe” dérivée des clusters. |
| Démo floue | Préparer un script de démo (3 scénarios du brief) + données pré-traitées pour éviter les temps de chargement. |
| “Chief of Staff” perçu comme un chatbot | Mettre en avant dans l’UI : cartes de flux, graphe, “What changed”, raisonnement de l’IA (ce qu’elle a lu, à qui elle notifierait). |

---

## 8. Checklist avant de coder

- [ ] Environnement Python créé, `requirements.txt` installé.
- [ ] Structure de dossiers en place (`ingestion/`, `graph/`, `extraction/`, `agents/`, `truth/`, `dashboard/` ou `frontend/`).
- [ ] Clé OpenAI (ou mock) configurée.
- [ ] Source des données choisie (Enron ou SNAP) et lien de téléchargement noté.
- [ ] Premier objectif clair : “À la fin du jour 1, j’ai un graphe de communication Enron visualisable dans un HTML.”

Tu peux démarrer par la **Phase 0** et les fichiers **1 → 5** de la section 5 ; enchaîner avec **6 → 9** pour avoir un graphe enrichi et une source de vérité, puis brancher les agents et le dashboard.
