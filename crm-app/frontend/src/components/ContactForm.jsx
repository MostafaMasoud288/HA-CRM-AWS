import { useState, useEffect } from 'react'
import './ContactForm.css'

const AVATAR_COLORS = ['#F59E0B','#10B981','#3B82F6','#8B5CF6','#EF4444','#EC4899','#06B6D4','#F97316']

const EMPTY = {
  first_name:'', last_name:'', email:'', phone:'', company:'',
  job_title:'', status:'lead', notes:'', avatar_color:'#F59E0B',
}

export default function ContactForm({ contact, onSave, onClose }) {
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(contact ? { ...EMPTY, ...contact } : EMPTY)
    setErrors({})
  }, [contact])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim())  e.last_name  = 'Required'
    if (!form.email.trim())      e.email      = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await onSave(form, contact?.id)
    } catch (err) {
      setErrors({ api: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel slide-in">
        <div className="modal-header">
          <h2 className="modal-title">
            {contact ? 'Edit Contact' : 'New Contact'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {errors.api && <div className="form-api-error">{errors.api}</div>}

        {/* Avatar Color */}
        <div className="color-row">
          {AVATAR_COLORS.map(c => (
            <button
              key={c}
              className={`color-swatch ${form.avatar_color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => set('avatar_color', c)}
            />
          ))}
        </div>

        <div className="form-grid">
          <Field label="First Name *" error={errors.first_name}>
            <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Ahmed" />
          </Field>
          <Field label="Last Name *" error={errors.last_name}>
            <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Hassan" />
          </Field>
          <Field label="Email *" error={errors.email} full>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ahmed@example.com" />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+20 100 000 0000" />
          </Field>
          <Field label="Company">
            <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
          </Field>
          <Field label="Job Title">
            <input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="CTO" />
          </Field>
          <Field label="Status" full>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
              <option value="churned">Churned</option>
            </select>
          </Field>
          <Field label="Notes" full>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Any notes about this contact…"
            />
          </Field>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : contact ? 'Update Contact' : 'Create Contact'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, full, children }) {
  return (
    <div className={`form-field ${full ? 'full' : ''} ${error ? 'has-error' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
