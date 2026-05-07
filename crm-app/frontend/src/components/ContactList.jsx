import { STATUS_COLORS } from '../App.jsx'
import './ContactList.css'

const STATUS_LABELS = { lead:'Lead', prospect:'Prospect', customer:'Customer', churned:'Churned' }

function Avatar({ contact }) {
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()
  return (
    <div className="avatar" style={{ '--color': contact.avatar_color || '#F59E0B' }}>
      {initials}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="contact-row skeleton-row">
      <div className="skeleton" style={{ width:40, height:40, borderRadius:'50%' }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
        <div className="skeleton" style={{ width:'55%', height:13 }} />
        <div className="skeleton" style={{ width:'40%', height:11 }} />
      </div>
      <div className="skeleton" style={{ width:80, height:22, borderRadius:99 }} />
      <div className="skeleton" style={{ width:120, height:13 }} />
      <div className="skeleton" style={{ width:64, height:28, borderRadius:8 }} />
    </div>
  )
}

export default function ContactList({ contacts, loading, pagination, onEdit, onDelete, onPage }) {
  return (
    <section className="contact-section fade-in">
      <div className="section-header">
        <h2 className="section-title">Contacts</h2>
        <span className="section-count">{pagination.total} total</span>
      </div>

      <div className="contact-table">
        <div className="table-head">
          <span>Name</span>
          <span>Status</span>
          <span>Company</span>
          <span>Email</span>
          <span />
        </div>

        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : contacts.length === 0
            ? <div className="empty-state">
                <span className="empty-icon">◇</span>
                <p>No contacts found</p>
              </div>
            : contacts.map(c => (
                <div className="contact-row fade-in" key={c.id}>
                  <div className="contact-name-cell">
                    <Avatar contact={c} />
                    <div>
                      <span className="contact-fullname">{c.first_name} {c.last_name}</span>
                      <span className="contact-job">{c.job_title || '—'}</span>
                    </div>
                  </div>

                  <span
                    className="status-badge"
                    style={{
                      '--sc': STATUS_COLORS[c.status],
                      background: `${STATUS_COLORS[c.status]}18`,
                      color: STATUS_COLORS[c.status],
                    }}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>

                  <span className="contact-company">{c.company || '—'}</span>
                  <span className="contact-email">{c.email}</span>

                  <div className="row-actions">
                    <button className="action-btn edit" onClick={() => onEdit(c)} title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(c.id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
        }
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pagination.page <= 1}
            onClick={() => onPage(pagination.page - 1)}
          >← Prev</button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="page-btn"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPage(pagination.page + 1)}
          >Next →</button>
        </div>
      )}
    </section>
  )
}
