import { useState } from 'react';

const empty = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function TaskForm({ onSubmit }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const ok = await onSubmit({ ...form, dueDate: form.dueDate || undefined });
    setBusy(false);
    if (ok) setForm(empty);
  };

  return (
    <form className="card form" onSubmit={submit}>
      <input placeholder="Task title *" value={form.title} onChange={set('title')} required maxLength={100} />
      <input placeholder="Description" value={form.description} onChange={set('description')} maxLength={500} />
      <div className="row">
        <select value={form.priority} onChange={set('priority')}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} />
        <button disabled={busy}>{busy ? 'Adding...' : 'Add task'}</button>
      </div>
    </form>
  );
}
