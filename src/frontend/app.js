import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useCallback, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';

const html = htm.bind(h);

// ============================================
// SVG Icons (inline, no emoji)
// ============================================

const icons = {
  vault: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  dashboard: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  zap: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  folder: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/></svg>`,
  search: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  refresh: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v9h-9"/></svg>`,
  sun: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>`,
  arrowLeft: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  copy: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  externalLink: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  check: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  trash: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  plus: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  empty: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
};

// ============================================
// API
// ============================================

const api = {
  get: (path) => fetch(`/api${path}`).then(r => r.json()),
  post: (path, body) => fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json()),
  del: (path) => fetch(`/api${path}`, { method: 'DELETE' }).then(r => r.json()),
};

// ============================================
// Helpers
// ============================================

const TOOL_COLORS = {
  'claude-code': 'var(--tool-claude)',
  'agents-registry': 'var(--tool-agents)',
  'gemini-cli': 'var(--tool-gemini)',
  'cursor': 'var(--tool-cursor)',
  'github-copilot': 'var(--tool-copilot)',
  'windsurf': 'var(--tool-windsurf)',
  'aider': 'var(--tool-aider)',
  'cline': 'var(--tool-cline)',
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function shortenPath(p) {
  if (!p) return '';
  const match = p.match(/^\/Users\/([^/]+)/);
  if (match) return p.replace(match[0], '~');
  return p;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ============================================
// Router
// ============================================

function useRouter() {
  const [route, setRoute] = useState(location.hash || '#/');
  useEffect(() => {
    const handler = () => setRoute(location.hash || '#/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

function navigate(hash) { location.hash = hash; }

// ============================================
// Sidebar
// ============================================

function Sidebar({ tools, stats, activeRoute, onRescan }) {
  const [isDark, setIsDark] = useState(
    document.documentElement.dataset.theme !== 'light'
  );

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setIsDark(!isDark);
  };

  return html`
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">${icons.vault}</div>
        <div>
          <div class="logo-text">Skill Vault</div>
          <div class="logo-version">v0.1.0</div>
        </div>
      </div>

      <nav class="nav-section">
        <div class="nav-section-title">Navigation</div>
        <button class="nav-item ${activeRoute === '#/' ? 'active' : ''}"
                onclick=${() => navigate('#/')}>
          <span class="nav-item-icon">${icons.dashboard}</span>
          Dashboard
        </button>
        <button class="nav-item ${activeRoute.startsWith('#/skills') ? 'active' : ''}"
                onclick=${() => navigate('#/skills')}>
          <span class="nav-item-icon">${icons.zap}</span>
          Skills
          ${stats && html`<span class="nav-item-count">${stats.totalSkills}</span>`}
        </button>
        <button class="nav-item ${activeRoute === '#/projects' ? 'active' : ''}"
                onclick=${() => navigate('#/projects')}>
          <span class="nav-item-icon">${icons.folder}</span>
          Projekte
          ${stats && html`<span class="nav-item-count">${stats.projectCount}</span>`}
        </button>
      </nav>

      ${tools && tools.length > 0 && html`
        <nav class="nav-section">
          <div class="nav-section-title">Tools</div>
          ${tools.filter(t => t.skillCount > 0).map(t => html`
            <button class="nav-item"
                    onclick=${() => navigate(`#/skills?tool=${t.id}`)}>
              <span class="nav-tool-dot" style="background: ${TOOL_COLORS[t.id] || 'var(--accent-400)'}"></span>
              ${t.name}
              <span class="nav-item-count">${t.skillCount}</span>
            </button>
          `)}
        </nav>
      `}

      <div class="sidebar-footer">
        <button class="btn-icon" onclick=${onRescan} title="Alle Skills neu scannen" aria-label="Rescan">
          ${icons.refresh}
        </button>
        <button class="btn-icon" onclick=${toggleTheme} title="Theme wechseln" aria-label="Toggle theme">
          ${isDark ? icons.sun : icons.moon}
        </button>
      </div>
    </aside>
  `;
}

// ============================================
// Dashboard
// ============================================

function Dashboard({ stats, tools }) {
  if (!stats) return html`
    <div>
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">AI Skills auf deinem Rechner</p>
      </div>
      <div class="stats-grid">
        ${[1,2,3,4].map(() => html`<div class="skeleton skeleton-stat"></div>`)}
      </div>
      ${[1,2].map(() => html`<div class="skeleton skeleton-card"></div>`)}
    </div>
  `;

  const activeTools = (tools || []).filter(t => t.skillCount > 0);
  const maxCount = Math.max(...activeTools.map(t => t.skillCount), 1);
  const globalCount = (stats.byScope || []).find(s => s.scope === 'global')?.count || 0;
  const projectCount = (stats.byScope || []).find(s => s.scope === 'project')?.count || 0;

  return html`
    <div>
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">AI Skills auf deinem Rechner</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Skills gesamt</div>
          <div class="stat-value stat-accent">${stats.totalSkills}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Aktive Tools</div>
          <div class="stat-value stat-success">${activeTools.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Global</div>
          <div class="stat-value stat-info">${globalCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Projekte</div>
          <div class="stat-value stat-warning">${stats.projectCount}</div>
        </div>
      </div>

      ${activeTools.length > 0 && html`
        <div class="chart-container">
          <div class="chart-title">Skills pro Tool</div>
          ${activeTools.map(t => html`
            <div class="chart-bar-row">
              <div class="chart-bar-label">
                <span class="chart-bar-dot" style="background: ${TOOL_COLORS[t.id] || 'var(--accent-400)'}"></span>
                <span>${t.name}</span>
              </div>
              <div class="chart-bar-track">
                <div class="chart-bar-fill"
                     style="width: ${(t.skillCount / maxCount) * 100}%; background: ${TOOL_COLORS[t.id] || 'var(--accent-400)'}">
                </div>
              </div>
              <div class="chart-bar-value">${t.skillCount}</div>
            </div>
          `)}
        </div>
      `}

      ${stats.byType && stats.byType.length > 0 && html`
        <div class="chart-container">
          <div class="chart-title">Skills nach Typ</div>
          ${stats.byType.map(t => html`
            <div class="chart-bar-row">
              <div class="chart-bar-label">
                <span>${t.type}</span>
              </div>
              <div class="chart-bar-track">
                <div class="chart-bar-fill"
                     style="width: ${(t.count / stats.totalSkills) * 100}%; background: var(--accent-400)">
                </div>
              </div>
              <div class="chart-bar-value">${t.count}</div>
            </div>
          `)}
        </div>
      `}
    </div>
  `;
}

// ============================================
// Skill List
// ============================================

function SkillList({ initialTool }) {
  const [skills, setSkills] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [toolFilter, setToolFilter] = useState(initialTool || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (toolFilter) params.set('tool', toolFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (scopeFilter) params.set('scope', scopeFilter);
    params.set('limit', '100');
    const data = await api.get(`/skills?${params}`);
    setSkills(data.skills || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [query, toolFilter, typeFilter, scopeFilter]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);
  useEffect(() => { api.get('/tools').then(d => setTools(d.tools || [])); }, []);

  const debouncedSetQuery = useMemo(() => debounce(setQuery, 200), []);
  const types = ['instruction', 'skill', 'rules', 'config', 'mcp'];

  return html`
    <div>
      <div class="page-header">
        <h1 class="page-title">Skills</h1>
        <p class="page-subtitle">${total} Skills gefunden</p>
      </div>

      <div class="search-bar">
        <span class="search-icon">${icons.search}</span>
        <input class="search-input"
               type="search"
               placeholder="Skills durchsuchen..."
               oninput=${(e) => debouncedSetQuery(e.target.value)}
               aria-label="Skills suchen" />
      </div>

      <div class="filter-bar" role="toolbar" aria-label="Filter">
        <button class="filter-chip ${!toolFilter ? 'active' : ''}"
                onclick=${() => setToolFilter('')}>Alle Tools</button>
        ${tools.map(t => html`
          <button class="filter-chip ${toolFilter === t.id ? 'active' : ''}"
                  onclick=${() => setToolFilter(toolFilter === t.id ? '' : t.id)}>
            <span class="filter-chip-dot" style="background: ${TOOL_COLORS[t.id] || 'var(--accent-400)'}"></span>
            ${t.name}
          </button>
        `)}

        <div class="filter-divider"></div>

        <button class="filter-chip ${!scopeFilter ? 'active' : ''}"
                onclick=${() => setScopeFilter('')}>Alle</button>
        <button class="filter-chip ${scopeFilter === 'global' ? 'active' : ''}"
                onclick=${() => setScopeFilter(scopeFilter === 'global' ? '' : 'global')}>Global</button>
        <button class="filter-chip ${scopeFilter === 'project' ? 'active' : ''}"
                onclick=${() => setScopeFilter(scopeFilter === 'project' ? '' : 'project')}>Projekt</button>

        <div class="filter-divider"></div>

        ${types.map(t => html`
          <button class="filter-chip ${typeFilter === t ? 'active' : ''}"
                  onclick=${() => setTypeFilter(typeFilter === t ? '' : t)}>
            ${t}
          </button>
        `)}
      </div>

      ${loading ? html`
        <div class="skill-list">
          ${[1,2,3,4].map(() => html`<div class="skeleton skeleton-card"></div>`)}
        </div>
      ` : skills.length === 0 ? html`
        <div class="empty-state">
          <div class="empty-state-icon">${icons.search}</div>
          <div class="empty-state-text">Keine Skills gefunden</div>
          <button class="btn" onclick=${() => { setQuery(''); setToolFilter(''); setTypeFilter(''); setScopeFilter(''); }}>
            Filter zurücksetzen
          </button>
        </div>
      ` : html`
        <div class="skill-list">
          ${skills.map(s => html`
            <a class="skill-card" onclick=${() => navigate(`#/skills/${s.id}`)}
               role="button" tabindex="0"
               onkeydown=${(e) => e.key === 'Enter' && navigate(`#/skills/${s.id}`)}>
              <div class="skill-card-header">
                <div class="skill-card-tool-indicator" style="background: ${TOOL_COLORS[s.tool_id] || 'var(--accent-400)'}"></div>
                <div class="skill-card-meta">
                  <div class="skill-card-name">${s.name}</div>
                  <div class="skill-card-badges">
                    <span class="badge badge-tool" style="background: ${TOOL_COLORS[s.tool_id] || 'var(--accent-400)'}">
                      ${s.tool_name}
                    </span>
                    <span class="badge badge-type">${s.type}</span>
                    <span class="badge ${s.scope === 'global' ? 'badge-scope-global' : 'badge-scope-project'}">
                      ${s.scope}
                    </span>
                    ${s.project_name && html`
                      <span class="badge badge-project">${s.project_name}</span>
                    `}
                  </div>
                </div>
              </div>
              <div class="skill-card-preview">${s.content_preview}</div>
              <div class="skill-card-footer">
                <span class="skill-card-path">${shortenPath(s.file_path)}</span>
                <span class="skill-card-size">${formatBytes(s.file_size)}</span>
              </div>
            </a>
          `)}
        </div>
      `}
    </div>
  `;
}

// ============================================
// Skill Detail
// ============================================

function SkillDetail({ id }) {
  const [skill, setSkill] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSkill(null);
    api.get(`/skills/${id}`).then(d => setSkill(d.skill));
  }, [id]);

  if (!skill) return html`
    <div>
      <button class="back-link" onclick=${() => navigate('#/skills')}>
        ${icons.arrowLeft} Zurück
      </button>
      <div class="skeleton" style="height: 48px; margin-bottom: 24px; width: 60%;"></div>
      <div class="skeleton" style="height: 200px;"></div>
    </div>
  `;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReveal = () => api.get(`/skills/${id}/reveal`);

  return html`
    <div>
      <button class="back-link" onclick=${() => navigate('#/skills')}>
        ${icons.arrowLeft} Zurück zu Skills
      </button>

      <div class="detail-header">
        <div class="detail-tool-bar" style="background: ${TOOL_COLORS[skill.tool_id] || 'var(--accent-400)'}"></div>
        <div>
          <h1 class="detail-title">${skill.name}</h1>
          <div class="skill-card-badges">
            <span class="badge badge-tool" style="background: ${TOOL_COLORS[skill.tool_id] || 'var(--accent-400)'}">
              ${skill.tool_name}
            </span>
            <span class="badge badge-type">${skill.type}</span>
            <span class="badge ${skill.scope === 'global' ? 'badge-scope-global' : 'badge-scope-project'}">
              ${skill.scope}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-meta">
        <div class="detail-meta-item">
          <div class="detail-meta-label">Dateipfad</div>
          <div class="detail-meta-value detail-meta-mono">${shortenPath(skill.file_path)}</div>
        </div>
        <div class="detail-meta-item">
          <div class="detail-meta-label">Dateigröße</div>
          <div class="detail-meta-value">${formatBytes(skill.file_size)}</div>
        </div>
        <div class="detail-meta-item">
          <div class="detail-meta-label">Zuletzt geändert</div>
          <div class="detail-meta-value">${new Date(skill.file_modified_at).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</div>
        </div>
        ${skill.project_name && html`
          <div class="detail-meta-item">
            <div class="detail-meta-label">Projekt</div>
            <div class="detail-meta-value">${skill.project_name}</div>
          </div>
        `}
      </div>

      <div class="detail-actions">
        <button class="btn" onclick=${handleCopy}>
          ${copied ? icons.check : icons.copy}
          ${copied ? 'Kopiert!' : 'In Zwischenablage'}
        </button>
        <button class="btn" onclick=${handleReveal}>
          ${icons.externalLink}
          Im Finder anzeigen
        </button>
      </div>

      <div class="detail-content">${skill.content}</div>
    </div>
  `;
}

// ============================================
// Projects
// ============================================

function Projects({ onUpdate }) {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await api.get('/projects');
    setProjects(data.projects || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    await api.post('/projects', { path: newPath.trim() });
    setNewPath('');
    setShowModal(false);
    fetchProjects();
    if (onUpdate) onUpdate();
  };

  const handlePickFolder = async () => {
    const data = await api.get('/projects/pick-folder');
    if (data.path) setNewPath(data.path);
  };

  const handleRemove = async (id) => {
    await api.del(`/projects/${id}`);
    fetchProjects();
    if (onUpdate) onUpdate();
  };

  const handleRescan = async (id) => {
    await api.post('/scan', { projectId: id });
    setTimeout(() => { fetchProjects(); if (onUpdate) onUpdate(); }, 2000);
  };

  return html`
    <div>
      <div class="page-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
        <div>
          <h1 class="page-title">Projekte</h1>
          <p class="page-subtitle">${projects.length} Projektordner registriert</p>
        </div>
        <button class="btn btn-primary" onclick=${() => setShowModal(true)}>
          ${icons.plus} Projekt hinzufügen
        </button>
      </div>

      ${loading ? html`
        <div class="project-list">
          ${[1,2,3].map(() => html`<div class="skeleton" style="height: 72px; margin-bottom: 12px;"></div>`)}
        </div>
      ` : projects.length === 0 ? html`
        <div class="empty-state">
          <div class="empty-state-icon">${icons.folder}</div>
          <div class="empty-state-text">Noch keine Projektordner registriert.<br/>Füge Projektordner hinzu, um projekt-bezogene Skills zu finden.</div>
          <button class="btn btn-primary" onclick=${() => setShowModal(true)}>
            ${icons.plus} Erstes Projekt hinzufügen
          </button>
        </div>
      ` : html`
        <div class="project-list">
          ${projects.map(p => html`
            <div class="project-card">
              <div class="project-icon">${icons.folder}</div>
              <div class="project-info">
                <div class="project-name">${p.name}</div>
                <div class="project-path">${shortenPath(p.path)}</div>
              </div>
              <span class="project-skill-count">${p.skillCount || 0} Skills</span>
              <div class="project-actions">
                <button class="btn btn-ghost btn-sm" onclick=${() => handleRescan(p.id)}
                        title="Erneut scannen" aria-label="Rescan ${p.name}">
                  ${icons.refresh}
                </button>
                <button class="btn btn-ghost btn-sm" onclick=${() => handleRemove(p.id)}
                        title="Entfernen" aria-label="Remove ${p.name}">
                  ${icons.trash}
                </button>
              </div>
            </div>
          `)}
        </div>
      `}

      ${showModal && html`
        <div class="modal-overlay" onclick=${(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 class="modal-title" id="modal-title">Projektordner hinzufügen</h2>
            <div>
              <span class="detail-meta-label" style="display: block; margin-bottom: 8px;">Projektordner</span>
              <div style="display: flex; gap: 8px;">
                <input class="input"
                       type="text"
                       placeholder="/Users/name/Projects/mein-projekt"
                       value=${newPath}
                       oninput=${(e) => setNewPath(e.target.value)}
                       onkeydown=${(e) => e.key === 'Enter' && handleAdd()}
                       autofocus
                       style="flex: 1;" />
                <button class="btn" onclick=${handlePickFolder} type="button" title="Ordner auswählen">
                  ${icons.folder}
                </button>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn" onclick=${() => setShowModal(false)}>Abbrechen</button>
              <button class="btn btn-primary" onclick=${handleAdd} disabled=${!newPath.trim()}>
                ${icons.plus} Hinzufügen
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

// ============================================
// App
// ============================================

function App() {
  const route = useRouter();
  const [stats, setStats] = useState(null);
  const [tools, setTools] = useState([]);

  const fetchData = useCallback(async () => {
    const [statsData, toolsData] = await Promise.all([
      api.get('/stats'),
      api.get('/tools'),
    ]);
    setStats(statsData);
    setTools(toolsData.tools || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRescan = async () => {
    await api.post('/scan');
    setTimeout(fetchData, 3000);
  };

  let page;
  if (route === '#/' || route === '#' || route === '') {
    page = html`<${Dashboard} stats=${stats} tools=${tools} />`;
  } else if (route.startsWith('#/skills/')) {
    const id = route.split('#/skills/')[1];
    page = html`<${SkillDetail} id=${id} />`;
  } else if (route.startsWith('#/skills')) {
    const params = new URLSearchParams(route.split('?')[1] || '');
    page = html`<${SkillList} initialTool=${params.get('tool') || ''} />`;
  } else if (route === '#/projects') {
    page = html`<${Projects} onUpdate=${fetchData} />`;
  } else {
    page = html`<${Dashboard} stats=${stats} tools=${tools} />`;
  }

  return html`
    <div class="app-layout">
      <${Sidebar}
        tools=${tools}
        stats=${stats}
        activeRoute=${route}
        onRescan=${handleRescan} />
      <main class="main-content">
        ${page}
      </main>
    </div>
  `;
}

// ============================================
// Mount
// ============================================

render(html`<${App} />`, document.getElementById('app'));
