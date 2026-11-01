import { useState } from 'react';

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const overdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  const save = async () => { if (await onUpdate(task._id, { title })) setEditing(false); };

  return (
    <li className={`card task ${task.status}`}>
      <div className="grow">
        {editing ? (
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        ) : (
          <strong className={task.status === 'done' ? 'strike' : ''}>{task.title}</strong>
        )}
        {task.description && <p className="muted">{task.description}</p>}
        <small>
          <span className={`pill ${task.priority}`}>{task.priority}</span>
          {task.dueDate && <span className={overdue ? 'overdue' : ''}> 📅 {new Date(task.dueDate).toLocaleString()}{overdue && ' (overdue)'}</span>}
        </small>
      </div>
      <select value={task.status} onChange={(e) => onUpdate(task._id, { status: e.target.value })}>
        <option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option>
      </select>
      {editing ? <button onClick={save}>Save</button> : <button onClick={() => setEditing(true)}>Edit</button>}
      <button className="danger" onClick={() => window.confirm('Delete this task?') && onDelete(task._id)}>Delete</button>
    </li>
  );
}
