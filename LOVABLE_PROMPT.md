# Prompt Lovable - AI Chief of Staff Frontend

## 🎯 Mission Brief
Create a modern, professional frontend for an AI Chief of Staff system that transforms organizational communication into intelligent, actionable insights. This is NOT a chatbot - it's an agentic AI system that serves as the "brain" of an organization.

## 🏗️ Architecture Overview
The backend consists of:
- **3 AI Agents**: Memory (what changed/truth), Coordinator (who needs to know), Critic (conflicts/overload)
- **Knowledge Graph**: People, Topics, Decisions with relationships (NetworkX-based)
- **Source of Truth**: Versioned organizational knowledge (JSON-based)
- **Real-time Processing**: Event simulation and automatic updates

## 🎨 Design Requirements

### Visual Identity
- **Modern Enterprise**: Clean, professional, trustworthy
- **Color Palette**: Primary blue gradient (#1e3a8a → #3b82f6), accent green (#10b981), warning orange (#f59e0b), danger red (#ef4444)
- **Typography**: Inter or similar professional sans-serif
- **Layout**: Card-based, spacious, organized with clear visual hierarchy

### Core Pages/Views

#### 1. **Dashboard Homepage**
- **Header**: AI Chief of Staff branding with user profile
- **Key Metrics Cards**: 
  - People in network (e.g., 8)
  - Active topics (e.g., 17) 
  - Decisions made (e.g., 13)
  - Truth entries (e.g., 102)
- **Quick Actions**: Natural language query input (prominent)
- **Recent Activity**: Timeline of latest organizational changes

#### 2. **Knowledge Graph Explorer**
- **Interactive Network Visualization**: 
  - Nodes: People (blue), Topics (green), Decisions (orange)
  - Edges: Communication flows with thickness = volume
  - Zoom, pan, filter capabilities
- **Node Details Panel**: Click node → shows connections, recent activity
- **Graph Statistics**: Network density, central nodes, clusters
- **Search/Filter**: By node type, name, or connection strength

#### 3. **AI Agent Interface**
- **Query Input**: Large, prominent natural language input
- **Query Examples**: "What changed today?", "Who needs to know about X?", "Context for person@company.com"
- **Response Display**:
  - Main answer (prominent)
  - Detailed results/changes (expandable)
  - Recommended notifications (visual cards)
  - **AI Reasoning Panel** (expandable): Shows how answer was derived
  - **Orchestration Details** (technical info about agents used)

#### 4. **What Changed Today**
- **Summary Dashboard**: Metrics cards for changes (total, decisions, topics, facts)
- **Timeline View**: Chronological list of changes
- **Change Details**: Expandable cards showing:
  - Type (decision/topic/fact)
  - Content
  - Timestamp
  - Source
  - Version info

#### 5. **Conflicts & Issues**
- **Conflict Detection**: Visual alert system for detected contradictions
- **Information Overload**: Per-person analysis with visual indicators
- **Knowledge Gaps**: Topic-based gap identification
- **Resolution Tools**: Interface for addressing detected issues

## 🔄 Data Integration

### API Communication
The frontend will need to communicate with the Python backend. Since the current backend uses Streamlit, you have two options:

1. **Direct Integration**: Build as a Streamlit custom component
2. **API Layer**: Create a REST API wrapper around the orchestrator

### Key Data Structures to Handle

#### Query Response Format
```json
{
  "answer": "Main response text",
  "results": [...],           // Search results
  "changes": [...],           // Recent changes
  "recommended_notifications": [...],  // People to notify
  "conflicts_found": 0,
  "reasoning": "AI explanation",
  "orchestration": {
    "agent_used": "Memory Agent",
    "graph_nodes": 25,
    "graph_edges": 40,
    "truth_entries": 102
  }
}
```

#### Graph Node Format
```json
{
  "id": "alice@company.com",
  "node_type": "person",
  "label": "alice@company.com", 
  "connections": 15
}
```

## 🎯 Critical UX Requirements

### 1. **Natural Language Interaction**
- Query input should be front-and-center
- Auto-complete suggestions for common queries
- Query history and saved queries
- Voice input capability (if possible)

### 2. **Visual Data Exploration**
- Interactive network graph (D3.js or similar)
- Smooth animations and transitions
- Hover states and tooltips
- Click-to-expand details

### 3. **Professional Analytics**
- Clean, readable charts and metrics
- Export capabilities (PDF, CSV)
- Date range filters
- Comparison views

### 4. **Real-time Feel**
- Loading states and skeletons
- Optimistic updates where appropriate
- Smooth transitions between states
- Progress indicators for processing

### 5. **Accessibility & Responsive**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Mobile/tablet responsive design

## 🚀 Advanced Features to Include

### 1. **Smart Notifications**
- Toast notifications for important updates
- Notification center with filtering
- Subscription to specific topics/people

### 2. **Collaboration Features**
- Share insights with team members
- Comment on decisions/topics
- @mention colleagues

### 3. **Personalization**
- User preferences and saved views
- Custom dashboards
- Bookmark important information

### 4. **Advanced Filtering**
- Multi-criteria filtering
- Saved filter presets
- Boolean search capabilities

## 🎨 Design System Requirements

### Components
- **Cards**: Consistent styling for information blocks
- **Buttons**: Primary, secondary, tertiary variants
- **Forms**: Clean, accessible form elements
- **Modals**: For detailed views and confirmations
- **Tooltips**: Informative hover states
- **Loading States**: Skeletons, spinners, progress bars

### Visual Hierarchy
- **Primary Actions**: High contrast, larger size
- **Secondary Actions**: Medium emphasis
- **Information**: Lower emphasis, readable
- **System Messages**: Distinct styling (success/warning/error)

### Animation Principles
- **Purposeful**: Animations should guide attention
- **Smooth**: 60fps, easing functions
- **Fast**: 200-300ms for most transitions
- **Respectful**: Honor motion preferences

## 📱 Technical Specifications

### Framework Choice
- **React/Next.js** recommended for ecosystem and performance
- **TypeScript** for type safety
- **Tailwind CSS** for styling consistency
- **Framer Motion** for animations
- **D3.js** or **Recharts** for data visualization
- **React Query** for data fetching

### Performance Requirements
- **Initial Load**: < 3 seconds
- **Navigation**: < 500ms between pages
- **Graph Rendering**: Smooth with 1000+ nodes
- **Search Response**: < 1 second
- **Mobile Optimized**: Touch-friendly interactions

### State Management
- **Global State**: User preferences, query history
- **Server State**: Graph data, agent responses
- **Local State**: UI interactions, form data

## 🔧 Integration Points

### Backend Communication
```javascript
// Example API integration
async function processQuery(query) {
  const response = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return response.json();
}

// Graph data fetching
async function getGraphData() {
  const response = await fetch('/api/graph');
  return response.json();
}
```

### Real-time Updates
- WebSocket connection for live updates
- Event-driven graph updates
- Notification system integration

## 🎯 Success Metrics

### User Experience
- **Query Success Rate**: > 95% of queries return useful results
- **Task Completion Time**: < 2 minutes for common tasks
- **User Satisfaction**: Professional, intuitive interface

### Technical Performance
- **Page Load**: < 3 seconds
- **Graph Interaction**: Smooth with 1000+ nodes
- **Mobile Responsiveness**: Full functionality on tablets
- **Accessibility**: WCAG 2.1 AA compliance

## 🚀 Final Deliverables

1. **Complete Frontend Application**
   - All 5 core pages implemented
   - Responsive design (desktop + tablet)
   - Dark/light mode toggle
   - Professional branding

2. **Integration Layer**
   - API communication with backend
   - Error handling and loading states
   - Real-time update capabilities

3. **Documentation**
   - Component library documentation
   - Integration guide
   - Deployment instructions

4. **Demo Assets**
   - Sample data visualization
   - User guide screenshots
   - Performance benchmarks

---

## 🎨 Design Inspiration
- **Modern Enterprise**: Notion, Linear, Arc Browser
- **Data Visualization**: D3.js examples, Observable notebooks
- **AI Interfaces**: ChatGPT, Claude, Perplexity (but more professional)
- **Network Analysis**: Gephi, Linkurious, Palantir

Remember: This is a **professional enterprise tool**, not a consumer app. The design should convey trust, intelligence, and efficiency while maintaining excellent usability.
