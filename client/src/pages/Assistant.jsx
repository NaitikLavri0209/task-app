import { useState } from 'react';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Assistant() {
  const [goal, setGoal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [added, setAdded] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuggestions([]); setAdded({});
    try { setSuggestions((await api('/ai/suggest', { method: 'POST', body: { goal } })).suggestions); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  const add = async (s, i) => {
    try { await api('/tasks', { method: 'POST', body: s }); setAdded((a) => ({ ...a, [i]: true })); }
    catch (err) { setError(err.message); }
  };

  return (
    <section>
      <h2>🤖 AI Task Assistant</h2>
      <p className="muted">Describe a goal and the AI will break it into tasks.</p>
      <form className="card row" onSubmit={ask}>
        <input className="grow" placeholder="e.g. Prepare for my DBMS exam" value={goal} onChange={(e) => setGoal(e.target.value)} required minLength={3} maxLength={200} />
        <button disabled={loading}>Suggest tasks</button>
      </form>
      <ErrorMessage message={error} />
      {loading && <Spinner text="Thinking..." />}
      <ul className="list">
        {suggestions.map((s, i) => (
          <li key={i} className="card task">
            <div className="grow"><strong>{s.title}</strong><p className="muted">{s.description}</p><span className={`pill ${s.priority}`}>{s.priority}</span></div>
            <button disabled={added[i]} onClick={() => add(s, i)}>{added[i] ? 'Added ✓' : 'Add to tasks'}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
