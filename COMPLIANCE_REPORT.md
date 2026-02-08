# Rapport de conformité — Superhuman AI Chief of Staff

Analyse du projet par rapport aux exigences et instructions du brief (HACNNATION / OpenAI Track).

---

## 1. Synthèse exécutive

| Statut | Nombre |
|--------|--------|
| **Conforme / En place** | 5 |
| **Partiel** | 4 |
| **Non implémenté** | 10+ |

Le projet pose de bonnes bases (ingestion, graphe de communication, extraction topics/décisions, dashboard minimal) mais **la majorité des exigences cœur du brief ne sont pas encore implémentées** : pas d’agents (Memory, Coordinator, Critic), pas de source de vérité versionnée, pas de routage “who needs to know”, pas de visualisation des flux ni du raisonnement de l’IA, pas de déconfliction, pas de voix. Le livrable actuel correspond à un **MVP Phase 1–2** du plan d’action ; les phases 3–5 (agents, vérité, viz avancée, voix) sont absentes.

---

## 2. Exigences du brief vs état du projet

### 2.1 The Moonshot & Vision

| Exigence | Statut | Détail |
|----------|--------|--------|
| **Organiser l’information pour la résolution collective** (pas “répondre à des questions”) | Partiel | L’extraction (topics, décisions) et le graphe de communication vont dans ce sens, mais il n’y a pas encore de couche qui “organise” explicitement (routage, amplification, restriction). |
| **AI Operating System / Chief of Staff = cerveau de l’entreprise** | Non | Pas d’orchestration agentique ni de couche “cerveau” ; le dashboard est un affichage statique + placeholder pour les agents. |
| **Pas un chatbot, pas un feed** | Conforme | Le design (graphe, events, extraction) vise une couche d’intelligence organisationnelle, pas un simple chat ou feed. |

### 2.2 Fonctionnalités attendues (The Challenge)

| Exigence | Statut | Implémentation actuelle |
|----------|--------|--------------------------|
| **Map information flow inside an organization** | Partiel | `graph/builder.py` construit un **graphe de communication** (qui envoie à qui, avec poids = nombre de messages) à partir des events. Il n’y a pas de vue “flux” par sujet/décision ni de métriques de propagation. |
| **Build a stakeholder and knowledge graph** | Partiel | **Stakeholder** : oui — nœuds = personnes, arêtes = communication (`graph/builder.py`, `graph/schema.py`). **Knowledge graph** : le schéma définit Topic, Decision, Team (`graph/schema.py`) mais le **builder n’utilise que Person** ; les topics/décisions extraits (`extraction/run_enrich.py` → `events_enriched.json`) ne sont **pas injectés dans le graphe** ni persistés comme nœuds/relations. |
| **Create a living source of truth** | Non | Aucun module `truth/` ni stockage de “vérité” versionnée. Le schéma `Decision` dans `graph/schema.py` prévoit `version` et `previous_version_id` mais n’est pas utilisé. |
| **Version and update knowledge continuously** | Non | Pas de versioning ni de mise à jour continue. Les décisions extraites ne sont pas stockées ni versionnées. |
| **Orchestrate communication across teams** | Non | Pas d’agent Coordinator, pas de logique “who needs to know”, pas d’amplification/restriction/routage. |
| **Visualize how understanding spreads** | Non | Le dashboard affiche des **tables** (nœuds, liens) ; pas de graphe interactif (pyvis présent dans `requirements.txt` mais non utilisé), pas de carte de flux, pas de “how understanding spreads”. |
| **Work across modalities (voice, text, mobile, visual)** | Partiel | **Text** : oui (ingestion, extraction, dashboard). **Voice, mobile, visual** : non (aucun STT/TTS, pas d’UI mobile, pas de viz graph/flow). |

### 2.3 Scénarios d’exemple (Example Scenarios)

| Scénario | Statut | Commentaire |
|----------|--------|-------------|
| **Meeting ends → AI updates knowledge graph and notifies relevant stakeholders** | Non | Pas de mise à jour automatique du graphe à partir d’un “event” type meeting ; pas de notification ciblée. |
| **Decision made → AI version-stamps and routes to affected teams** | Non | Pas de source de vérité versionnée ; pas de routage. |
| **Founder asks “What changed today?” → AI generates visual map of updates** | Non | Pas d’agent Memory ; pas de vue “what changed” ; pas de carte visuelle des mises à jour (placeholder dans `dashboard/app.py`). |
| **New stakeholder joins → AI creates instant context view** | Non | Pas de vue “context for [person]” ni de sous-graphe / résumé par personne. |
| **AI detects conflicting information → critic agent flags for review** | Non | Pas d’agent Critic ni de détection de contradictions. |

### 2.4 Superhuman Element (agentic AI)

| Exigence | Statut | Détail |
|----------|--------|--------|
| **Sees all communication** | Partiel | Les events sont ingérés et enrichis, mais pas de vue unifiée “tout le flux” ni d’API temps réel. |
| **Understands dependencies** | Non | Pas de modélisation explicite des dépendances (équipes, sujets, décisions) ni d’arêtes `depends_on` / `decided_on` dans le graphe. |
| **Resolves conflicts** | Non | Pas d’agent Critic ni de résolution de conflits. |
| **Creates transparency** | Partiel | Le graphe de communication donne une forme de transparence “qui parle à qui” ; pas de transparence sur “current truth”, “what changed”, “who knows what”. |
| **Never overwhelms humans** | Non | Pas de logique de filtrage / priorisation / “ne pas surcharger”. |

### 2.5 Questions que le système doit répondre (Core Idea)

| Question | Statut |
|----------|--------|
| **Who needs to know this?** | Non — pas de Coordinator ni de routage. |
| **What is the current truth?** | Non — pas de source de vérité ni d’agent Memory. |
| **What just changed?** | Non — pas de vue “what changed today” ni de mémoire versionnée. |
| **Where is knowledge blocked or duplicated?** | Non — pas d’analyse de clusters, goulots ou duplication. |

### 2.6 Hints & Resources (données et techniques)

| Élément | Statut |
|---------|--------|
| **Données type Enron / SNAP / mailing lists** | Conforme — parser CSV type Enron (`ingestion/parser.py`), mock data (`ingestion/mock_data.py`). |
| **Extraire : people, teams, topics, decisions, frequency, dependencies, knowledge clusters** | Partiel — people et frequency (graphe) ; topics et decisions (extraction vers `events_enriched.json`) ; teams, dependencies, knowledge clusters non dérivés. |
| **Knowledge graphs (Neo4j, NetworkX)** | Conforme — NetworkX utilisé (`graph/builder.py`), schéma prévu pour graphe de connaissances. |
| **LLMs for summarization and entity extraction** | Conforme — extraction via Ollama/OpenAI/heuristique (`extraction/extractor.py`, `run_enrich.py`). |
| **Voice input and speech-to-text** | Non — pas de STT/TTS. |
| **Visual dashboards for communication flow** | Partiel — dashboard Streamlit présent mais tables uniquement ; pas de viz de flux. |
| **Multi-agent (memory, critic, coordinator)** | Non — pas de module `agents/` ni d’orchestration. |

### 2.7 Critères d’évaluation (Evaluation Criteria)

| Critère | Ce qu’on cherche | État actuel |
|---------|------------------|-------------|
| **Communication Intelligence** | Modélisation et routage de l’information | Partiel — modélisation (graphe de communication) ; pas de routage. |
| **Knowledge Graph & Stakeholder Map** | Représentation claire de la structure et des dépendances | Partiel — stakeholder map (personnes + liens) ; knowledge graph (topics, décisions) non construit dans le graphe. |
| **User Interface & Visualization** | Modèles visuels des flux et du raisonnement de l’IA | Non — tables uniquement ; pas de graphe interactif ni de visualisation du raisonnement. |
| **User Experience & Interaction** | Voix, faible friction, peu de clics | Non — pas de voix ; interaction = saisie texte + tables. |
| **Creativity & Moonshot Thinking** | Interprétation ambitieuse du “cerveau” | Partiel — vision et architecture prévues dans le plan ; implémentation encore MVP. |
| **Deconfliction & Critique** | Détection de contradictions ou surcharge | Non — pas d’agent Critic ni de détection. |
| **Demo Quality** | Prototype clair, convaincant, intuitif | Partiel — enchaînement ingestion → enrich → graphe → dashboard fonctionne ; démo limitée par l’absence d’agents et de viz. |
| **Emphasis: visualizing agentic AI reasoning and communication flows** | Mettre en avant le raisonnement de l’IA et les flux | Non — pas de raisonnement agent visible ni de viz des flux. |

---

## 3. État par composant (fichiers)

### 3.1 Conforme ou bien avancé

- **`ingestion/parser.py`** — Events normalisés (sender, receiver, timestamp, subject, body) ; compatible Enron/SNAP.
- **`ingestion/run_ingestion.py`** — Pipeline ingestion → `events.json`.
- **`ingestion/mock_data.py`** — Données de test sans dépendance externe.
- **`extraction/extractor.py`** — Extraction topics/décisions/entités (heuristique + Ollama + OpenAI) ; pas de clé obligatoire.
- **`extraction/run_enrich.py`** — Enrichissement des events → `events_enriched.json`.
- **`graph/schema.py`** — Schéma Person, Topic, Decision, Team et types d’arêtes (décrit le “knowledge graph” cible).
- **`graph/builder.py`** — Construction du graphe de communication (Person × Person, poids = volume).
- **`graph/run_build.py`** — Build à partir de `events.json` (n’utilise pas encore `events_enriched.json`).
- **`config/settings.py`** — Configuration (LLM provider, chemins, etc.).
- **`dashboard/app.py`** — Page Streamlit avec stats et tables nœuds/liens ; placeholder Chief of Staff.

### 3.2 Partiel ou incohérent

- **Graphe** : Le builder ne crée que des nœuds Person et des arêtes `communicates_with`. Les types Topic, Decision, Team et les arêtes `decided_on`, `mentions_topic`, `depends_on` ne sont pas utilisés. Les données enrichies (`events_enriched.json`) ne sont pas lues par `run_build` ni intégrées au graphe.
- **Dashboard** : `pyvis` est dans les dépendances mais le graphe n’est pas affiché en interactif ; pas de “What changed today?” ni de raisonnement de l’IA.

### 3.3 Absent (à implémenter)

- **`truth/`** — Source de vérité vivante et versionnée (décisions, états).
- **`agents/`** — Memory agent, Coordinator agent, Critic agent + orchestrateur.
- **Routage** — “Who needs to know this?” ; notifications ciblées.
- **Visualisation** — Graphe interactif (pyvis ou équivalent), carte des flux, “What changed today?”, vue contexte par personne.
- **Voice** — STT/TTS (optionnel mais dans le brief).
- **Intégration enrichissement → graphe** — Utiliser `events_enriched.json` pour ajouter des nœuds Topic/Decision et des arêtes au graphe.

---

## 4. Recommandations prioritaires pour se rapprocher du brief

1. **Knowledge graph complet** — Faire lire `events_enriched.json` dans le builder (ou un nouveau script), ajouter les nœuds Topic et Decision et les arêtes Person–Topic, Person–Decision, etc., puis exporter un graphe unifié (personnes + sujets + décisions).
2. **Source de vérité versionnée** — Implémenter un module `truth/` qui stocke les décisions avec version et timestamp, et l’alimenter à partir des events enrichis.
3. **Agents** — Implémenter au moins :
   - **Memory** : répond à “What is the current truth?” / “What changed today?” à partir de la source de vérité et du graphe.
   - **Coordinator** : répond à “Who needs to know this?” en s’appuyant sur le graphe (et éventuellement le LLM).
   - **Critic** : détection simple de conflits (même sujet, décisions contradictoires).
4. **Dashboard** — Afficher le graphe avec pyvis (ou équivalent) ; ajouter une section “What changed today?” et une zone de requête qui appelle l’orchestrateur et affiche la réponse + le “raisonnement” (sources utilisées, personnes notifiées).
5. **Démo** — Préparer un scénario en 3–5 min qui montre : mise à jour du graphe après un event simulé, “What changed today?”, vue contexte pour un nouveau stakeholder, alerte du Critic sur un conflit.

---

## 5. Conclusion

Le projet respecte **partiellement** les exigences du brief : la base données + graphe de communication + extraction est en place et alignée avec la “organizational intelligence”, mais **les éléments centraux** (source de vérité versionnée, agents Memory/Coordinator/Critic, routage, visualisation des flux et du raisonnement, déconfliction) **ne sont pas encore implémentés**. Pour aligner le livrable avec le brief et les critères d’évaluation, il faut compléter les phases 3–5 du plan d’action (agents, vérité, visualisation, optionnel voix) et connecter l’enrichissement au graphe et au dashboard.
