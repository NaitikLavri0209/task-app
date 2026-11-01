import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setTasks(await api(`/tasks${filter ? `?status=${filter}` : ''}`)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  // each mutation returns true/false so child forms know whether to reset
  const run = async (fn) => { setError(''); try { await fn(); return true; } catch (e) { setError(e.message); return false; } };
  const create = (data) => run(async () => { const t = await api('/tasks', { method: 'POST', body: data }); if (!filter || filter === t.status) setTasks((p) => [t, ...p]); });
  const update = (id, data) => run(async () => { const t = await api(`/tasks/${id}`, { method: 'PUT', body: data }); setTasks((p) => p.map((x) => (x._id === id ? t : x))); });
  const remove = (id) => run(async () => { await api(`/tasks/${id}`, { method: 'DELETE' }); setTasks((p) => p.filter((x) => x._id !== id)); });

  return (
    <section>
      <TaskForm onSubmit={create} />
      <div className="row between">
        <h2>Your tasks ({tasks.length})</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option>
        </select>
      </div>
      <ErrorMessage message={error} onRetry={load} />
      {loading ? <Spinner text="Loading tasks..." /> : tasks.length === 0 && !error ? <p className="muted">No tasks yet. Add one above 👆</p> : (
        <ul className="list">{tasks.map((t) => <TaskItem key={t._id} task={t} onUpdate={update} onDelete={remove} />)}</ul>
      )}
    </section>
  );
}
