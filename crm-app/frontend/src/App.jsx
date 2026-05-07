import { useState, useEffect, useCallback } from 'react'
import ContactList from './components/ContactList.jsx'
import ContactForm from './components/ContactForm.jsx'
import StatsBar    from './components/StatsBar.jsx'
import './App.css'

const API = '/api/contacts'

export default function App() {
  const [contacts,    setContacts]    = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterStatus, setFilter]     = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [toast,       setToast]       = useState(null)
  const [pagination,  setPagination]  = useState({ page: 1, pages: 1, total: 0 })

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchContacts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search) params.set('search', search)
      if (filterStatus) params.set('status', filterStatus)
      const res  = await fetch(`${API}?${params}`)
      const data = await res.json()
      if (data.success) {
        setContacts(data.data)
        setPagination(data.pagination)
      }
    } catch { notify('Failed to load contacts', 'error') }
    finally  { setLoading(false) }
  }, [search, filterStatus])

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/stats`)
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch {}
  }, [])

  useEffect(() => { fetchContacts(1); fetchStats() }, [fetchContacts, fetchStats])

  const handleSave = async (formData, id) => {
    const method = id ? 'PUT' : 'POST'
    const url    = id ? `${API}/${id}` : API
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'Error saving contact')
    notify(id ? 'Contact updated ✓' : 'Contact created ✓')
    setShowForm(false)
    setEditContact(null)
    fetchContacts(1)
    fetchStats()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    const res  = await fetch(`${API}/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      notify('Contact deleted')
      fetchContacts(pagination.page)
      fetchStats()
    } else notify(data.message, 'error')
  }

  const openEdit = (c) => { setEditContact(c); setShowForm(true) }
  const openNew  = () => { setEditContact(null); setShowForm(true) }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">◆</span>
          <span className="brand-name">Nexus<em>CRM</em></span>
        </div>
        <nav className="nav">
          {['All','Lead','Prospect','Customer','Churned'].map(s => (
            <button
              key={s}
              className={`nav-item ${filterStatus === (s==='All'?'':s.toLowerCase()) ? 'active' : ''}`}
              onClick={() => setFilter(s === 'All' ? '' : s.toLowerCase())}
            >
              <span className="nav-dot" style={{ background: STATUS_COLORS[s.toLowerCase()] || 'var(--text-muted)' }} />
              {s}
              {stats && <span className="nav-count">{s === 'All' ? stats.total : (stats[s.toLowerCase()] || 0)}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="db-badge writer">
            <span className="db-dot" /> Writer
          </div>
          <div className="db-badge reader">
            <span className="db-dot" /> Reader
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-area">
        <header className="top-bar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search contacts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openNew}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Contact
          </button>
        </header>

        <StatsBar stats={stats} />

        <ContactList
          contacts={contacts}
          loading={loading}
          pagination={pagination}
          onEdit={openEdit}
          onDelete={handleDelete}
          onPage={fetchContacts}
        />
      </main>

      {/* ── Form Modal ── */}
      {showForm && (
        <ContactForm
          contact={editContact}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditContact(null) }}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}

export const STATUS_COLORS = {
  lead:     '#F59E0B',
  prospect: '#3B82F6',
  customer: '#10B981',
  churned:  '#6B7280',
  all:      'var(--text-muted)',
}
