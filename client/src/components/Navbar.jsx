import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav">
      <h1>✅ TaskFlow</h1>
      <nav>
        {user ? (
          <>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/assistant">AI Assistant</NavLink>
            <NotificationBell />
            <span className="muted">{user.name}</span>
            <button onClick={() => { logout(); nav('/login'); }}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
