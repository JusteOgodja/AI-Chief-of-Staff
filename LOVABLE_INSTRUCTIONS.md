# 📋 Instructions Lovable - Frontend AI Chief of Staff

## 🎯 OBJECTIF CRISTALLIN
Créer un frontend moderne et professionnel pour un système AI Chief of Staff qui transforme la communication organisationnelle en intelligence actionnable. CE N'EST PAS UN CHATBOT - c'est un système agentic qui sert de "cerveau" à une organisation.

## 🏗️ CONTEXTE TECHNIQUE IMPÉRATIF

### Backend Existant
- **Python/Streamlit** avec 3 agents IA (Memory, Coordinator, Critic)
- **Graphe de connaissances** : Personnes, Sujets, Décisions avec relations
- **Source de vérité** : Données versionnées (JSON)
- **Processing temps réel** : Simulation d'événements et mises à jour

### Architecture des Données
- **Nodes** : Person (bleu), Topic (vert), Decision (orange)
- **Edges** : Communication flows, mentions, décisions
- **Requêtes** : Langage naturel → Réponses structurées
- **Métriques** : Centralité, densité, volumes

## 🎨 EXIGENCES DESIGN NON NÉGOCIABLES

### Identité Visuelle
- **Palette** : Bleu gradient (#1e3a8a → #3b82f6) primaire, accents vert (#10b981), orange (#f59e0b), rouge (#ef4444)
- **Typographie** : Inter ou équivalent professionnel sans-serif
- **Layout** : Card-based, espacé, organisé avec hiérarchie visuelle claire
- **Vibe** : Entreprise moderne, digne de confiance, intelligent

### 5 Pages Principales OBLIGATOIRES

#### 1. Dashboard Principal
- Header branding AI Chief of Staff + profil utilisateur
- Métriques clés en cards : People (8), Topics (17), Decisions (13), Truth Entries (102)
- Input de requête NATURELLE très proéminent
- Timeline des activités récentes
- Quick actions statiques

#### 2. Explorateur de Graphe de Connaissances
- **Visualisation réseau interactive** : Nodes colorés, edges avec épaisseur = volume
- Zoom, pan, filtres par type de node
- Panel détails node au clic
- Statistiques graphe (densité, centralité)
- Recherche globale

#### 3. Interface Agent IA
- Input requête naturel GRAND et proéminent
- Exemples de requêtes suggérées
- Affichage réponse avec :
  - Réponse principale (visible)
  - Résultats détaillés (expandable)
  - Notifications recommandées (cards visuelles)
  - **Panneau "AI Reasoning"** (expandable) - CRITIQUE
  - **Détails d'orchestration** (technique)

#### 4. "What Changed Today"
- Dashboard métriques : Total Changes, New Decisions, New Topics, New Facts
- Timeline chronologique des changements
- Cards expandables avec : type, contenu, timestamp, source, version

#### 5. Conflits & Issues
- Système d'alerte visuel pour contradictions détectées
- Analyse surcharge par personne avec indicateurs visuels
- Identification des knowledge gaps
- Outils de résolution

## 🔄 INTÉGRATION BACKEND

### Communication API
Le frontend doit communiquer avec le backend Python. Deux options :

1. **Intégration directe** : Composant Streamlit custom
2. **API REST** : Wrapper autour de l'orchestrator

### Formats de Données CLÉS

#### Réponse Requête
```json
{
  "answer": "Texte principal",
  "results": [...],
  "changes": [...],
  "recommended_notifications": [...],
  "conflicts_found": 0,
  "reasoning": "Explication IA",
  "orchestration": {
    "agent_used": "Memory Agent",
    "graph_nodes": 25,
    "graph_edges": 40,
    "truth_entries": 102
  }
}
```

#### Node Graphe
```json
{
  "id": "alice@company.com",
  "node_type": "person",
  "label": "alice@company.com",
  "connections": 15
}
```

## 🎯 UX CRITIQUES

### 1. Interaction Naturelle
- Input requête FRONT AND CENTER
- Auto-complétion suggestions
- Historique requêtes
- Voice input (si possible)

### 2. Exploration Visuelle
- Graphe réseau interactif (D3.js)
- Animations fluides
- Hover states et tooltips
- Click-to-expand details

### 3. Analytics Professionnels
- Charts métriques propres et lisibles
- Export PDF/CSV
- Filtres date range
- Vues comparatives

### 4. Feel Temps Réel
- Loading states et skeletons
- Optimistic updates
- Transitions fluides
- Indicateurs progression

## 🚀 SPÉCIFICATIONS TECHNIQUES

### Stack Recommandé
- **React/Next.js** pour écosystème et performance
- **TypeScript** pour sécurité typage
- **Tailwind CSS** pour cohérence styling
- **Framer Motion** pour animations
- **D3.js** ou **Recharts** pour data viz
- **React Query** pour data fetching

### Performance
- Load initial < 3 secondes
- Navigation < 500ms entre pages
- Graphe rendering smooth avec 1000+ nodes
- Search response < 1 seconde
- Mobile responsive (tablet minimum)

## 🎨 INSPIRATION DESIGN

### Références
- **Notion** : Pour l'organisation et la propreté
- **Linear** : Pour l'efficacité et la modernité
- **Arc Browser** : Pour l'innovation UI
- **D3.js examples** : Pour visualisation graphe
- **Palantir** : Pour analyse réseau professionnelle

### À ÉVITER
- Interface chatbot style
- Design trop consumer/casual
- Animations excessives
- Couleurs vives/jeunes

## 📦 LIVRABLES FINAUX

1. **Application frontend complète** avec 5 pages
2. **Design responsive** (desktop + tablet)
3. **Mode dark/light** toggle
4. **Branding professionnel** cohérent
5. **Documentation composants** et intégration
6. **Guide déploiement**

---

## 🎨 PROMPT EXACT À COPIER-COLLER DANS LOVABLE

```
Create a modern, professional frontend for an AI Chief of Staff system that transforms organizational communication into intelligent insights. This is NOT a chatbot - it's an agentic AI system serving as the "brain" of an organization.

BACKEND CONTEXT:
- Python/Streamlit backend with 3 AI agents: Memory (what changed/truth), Coordinator (who needs to know), Critic (conflicts/overload)
- Knowledge graph with People (blue nodes), Topics (green), Decisions (orange) and relationships
- Versioned source of truth stored in JSON
- Natural language query processing with structured responses
- Real-time event simulation and graph updates

REQUIRED PAGES (5):

1. **Dashboard Homepage**:
   - Header with "AI Chief of Staff" branding and user profile
   - Key metrics cards: People (8), Active topics (17), Decisions made (13), Truth entries (102)
   - Prominent natural language query input (large, centered)
   - Recent activity timeline
   - Quick action buttons

2. **Knowledge Graph Explorer**:
   - Interactive network visualization with colored nodes and weighted edges
   - Zoom, pan, filter by node type capabilities
   - Node details panel on click
   - Graph statistics (network density, central nodes)
   - Search functionality

3. **AI Agent Interface**:
   - Large, prominent natural language query input
   - Query examples: "What changed today?", "Who needs to know about X?", "Context for person@company.com"
   - Response display with:
     * Main answer (prominent)
     * Detailed results (expandable)
     * Recommended notifications (visual cards)
     * AI Reasoning panel (expandable) - CRITICAL
     * Orchestration details (technical info)

4. **What Changed Today**:
   - Summary metrics: Total Changes, New Decisions, New Topics, New Facts
   - Chronological timeline of changes
   - Expandable cards showing type, content, timestamp, source, version

5. **Conflicts & Issues**:
   - Visual alert system for detected contradictions
   - Information overload analysis per person
   - Knowledge gap identification
   - Resolution tools interface

DESIGN REQUIREMENTS:
- **Modern Enterprise**: Clean, professional, trustworthy aesthetic
- **Color Palette**: Primary blue gradient (#1e3a8a → #3b82f6), accent green (#10b981), warning orange (#f59e0b), danger red (#ef4444)
- **Typography**: Inter or professional sans-serif
- **Layout**: Card-based, spacious, organized with clear visual hierarchy
- **Dark/Light Mode**: Toggle capability

TECHNICAL SPECIFICATIONS:
- React/Next.js with TypeScript
- Tailwind CSS for styling
- D3.js or Recharts for data visualization
- Framer Motion for animations
- React Query for data fetching
- Performance: <3s load, <500ms navigation, smooth 1000+ node rendering

KEY UX REQUIREMENTS:
- Natural language interaction front and center
- Interactive data exploration with smooth transitions
- Professional analytics with export capabilities
- Real-time feel with loading states and optimistic updates
- WCAG 2.1 AA accessibility compliance
- Responsive design (desktop + tablet)

INTEGRATION NOTES:
- Backend communicates via structured JSON responses
- Query format: natural language → agent-processed response
- Graph data: nodes with types, edges with weights
- Real-time updates through event simulation

CRITICAL SUCCESS FACTORS:
1. Professional enterprise aesthetic (not consumer/casual)
2. Transparent AI reasoning (show how answers are derived)
3. Interactive network visualization (smooth with 1000+ nodes)
4. Natural language query experience (intuitive, fast)
5. Real-time feel (instant feedback, smooth transitions)

Design inspiration: Notion (organization), Linear (efficiency), Arc Browser (innovation), D3.js examples (data viz), Palantir (professional network analysis).

AVOID: Chatbot-style interfaces, overly casual design, excessive animations, bright/youthful colors.

The goal is a tool that conveys trust, intelligence, and efficiency while maintaining excellent usability for enterprise users.
```

## 🎯 RÉSULTAT ATTENDU

Un frontend moderne, professionnel et enterprise-ready qui transforme le backend Python existant en une expérience utilisateur exceptionnelle, digne d'un produit SaaS B2B de haute qualité.
