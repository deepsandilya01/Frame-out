import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Edit2, X, Check } from 'lucide-react';
import { useTasks } from '../hook/useTasks';

const PRIORITIES = ['low', 'medium', 'high'];
const P_COLOR = { high: '#ef4444', medium: '#f97316', low: '#4ade80' };

function TaskModal({ onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || { title: '', description: '', priority: 'medium', status: 'pending', deadline: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); onClose(); }
    catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{initial ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-[#849495] hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            required className="input-minimal" placeholder="Task title"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="input-minimal resize-none" rows={2} placeholder="Description (optional)"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-eyebrow block mb-2">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button key={p} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-1.5 rounded-full text-[11px] font-medium transition-all ${form.priority === p ? 'text-white' : 'text-[#849495] bg-white/4 hover:bg-white/8'}`}
                    style={form.priority === p ? { background: P_COLOR[p], opacity: 0.9 } : {}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-eyebrow block mb-2">Deadline</label>
              <input type="date" className="input-minimal text-sm"
                value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving…' : initial ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, loading, fetchTasks, createTask, editTask, changeStatus, deleteTask } = useTasks();
  const [modal, setModal]   = useState(null); // null | 'new' | task object for edit
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-[#849495] text-sm mt-0.5">{tasks.filter(t => t.status !== 'completed').length} pending</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('new')}>
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 glass rounded-full p-1 w-fit">
        {['all', 'pending', 'in-progress', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
            }`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading && tasks.length === 0 ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="glass rounded-xl h-14 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-[#849495]">No tasks here. <button onClick={() => setModal('new')} className="text-accent">Create one →</button></p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task._id}
                 className="glass rounded-xl px-4 py-3 flex items-center gap-3 group hover:border-white/10 transition-all hover-lift">
              {/* Status toggle */}
              <button onClick={() => changeStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                      className="flex-shrink-0 text-[#849495] hover:text-accent transition-colors">
                {task.status === 'completed' ? <CheckCircle2 size={18} className="text-accent" /> : <Circle size={18} />}
              </button>

              {/* Priority dot */}
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                   style={{ background: P_COLOR[task.priority] || '#849495' }} />

              {/* Title */}
              <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-[#849495]' : 'text-[#dce4e4]'}`}>
                {task.title}
              </span>

              {/* Deadline */}
              {task.deadline && (
                <span className="pill text-[10px] flex items-center gap-1">
                  <Clock size={9} />
                  {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}

              {/* Priority pill */}
              <span className="pill text-[10px]" style={{ color: P_COLOR[task.priority] }}>
                {task.priority}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(task)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#849495] hover:text-white hover:bg-white/8 transition-all">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => deleteTask(task._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#849495] hover:text-red-400 hover:bg-red-500/8 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal === 'new' && (
        <TaskModal onClose={() => setModal(null)} onSubmit={createTask} />
      )}
      {modal && modal !== 'new' && (
        <TaskModal
          initial={modal}
          onClose={() => setModal(null)}
          onSubmit={(data) => editTask(modal._id, data)}
        />
      )}
    </div>
  );
}
