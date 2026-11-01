import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// One component for both Login and Register
export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      login(await api(`/auth/${mode}`, { method: 'POST', body }));
      nav('/tasks');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{isRegister ? 'Create account' : 'Welcome back'}</h2>
      {isRegister && <input placeholder="Name" value={form.name} onChange={set('name')} required />}
      <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
      <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required minLength={6} />
      <ErrorMessage message={error} />
      <button disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Register' : 'Login'}</button>
      <p className="muted">{isRegister ? <>Have an account? <Link to="/login">Login</Link></> : <>New here? <Link to="/register">Register</Link></>}</p>
    </form>
  );
}
