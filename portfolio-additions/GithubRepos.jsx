// Practical 3: drop into your portfolio's /src/components, together with Spinner.jsx and ErrorMessage.jsx
// Usage on your Projects page:  <GithubRepos username="your-github-username" />
import { useEffect, useState } from 'react';
import Spinner from './Spinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';

export default function GithubRepos({ username }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`, { signal: controller.signal })
      .then((res) => {
        if (res.status === 404) throw new Error(`GitHub user "${username}" not found`);
        if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later.');
        if (!res.ok) throw new Error(`GitHub request failed (${res.status})`);
        return res.json();
      })
      .then(setRepos)
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [username]);

  if (loading) return <Spinner text="Fetching repositories..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!repos.length) return <p>No public repositories found.</p>;

  return (
    <div className="repo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1rem' }}>
      {repos.map((r) => (
        <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer" style={{ border: '1px solid #ddd', borderRadius: 10, padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ margin: 0 }}>{r.name}</h3>
          <p>{r.description || 'No description'}</p>
          <small>{r.language || '—'} · ⭐ {r.stargazers_count} · 🍴 {r.forks_count}</small>
        </a>
      ))}
    </div>
  );
}
