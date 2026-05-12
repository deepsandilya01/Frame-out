import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Edit2, X, Zap, AlertTriangle } from 'lucide-react';
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

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

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
      <div className="flex gap-1 glass rounded-full p-1 overflow-x-auto scrollbar-hide w-full sm:w-fit whitespace-nowrap px-2">
        {['all', 'pending', 'in-progress', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
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
            <div key={task._id} className="glass rounded-xl px-4 py-3 group hover:border-white/10 transition-all hover-lift">
              <div className="flex items-start gap-3">
                
                {/* Status Toggle Button */}
                <button 
                  onClick={() => changeStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')}
                  className={`flex-shrink-0 mt-0.5 transition-colors ${task.status === 'completed' ? 'text-accent' : task.status === 'in-progress' ? 'text-orange-400' : 'text-[#849495] hover:text-accent'}`}>
                  {task.status === 'completed' ? <CheckCircle2 size={18} /> : task.status === 'in-progress' ? <Clock size={18} /> : <Circle size={18} />}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: P_COLOR[task.priority] || '#849495' }} />
                    <span className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'line-through text-[#849495]' : 'text-white'}`}>
                      {task.title}
                    </span>
                    {task.status === 'in-progress' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">In Progress</span>
                    )}
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className={`text-xs mt-1.5 line-clamp-2 ${task.status === 'completed' ? 'text-[#849495]/50' : 'text-[#849495]'}`}>
                      {task.description}
                    </p>
                  )}

                  {/* Footer Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    
                    {/* Deadline logic */}
                    {task.deadline && (() => {
                      const dl = new Date(task.deadline);
                      const today = new Date();
                      dl.setHours(0,0,0,0);
                      today.setHours(0,0,0,0);
                      
                      const isOverdue = dl < today && task.status !== 'completed';
                      const isToday = dl.getTime() === today.getTime() && task.status !== 'completed';
                      
                      let dlClass = "text-[#849495]";
                      if (isOverdue) dlClass = "text-red-400 border-red-500/20 bg-red-500/10 font-medium";
                      else if (isToday) dlClass = "text-orange-400 border-orange-500/20 bg-orange-500/10 font-medium";

                      return (
                        <span className={`pill text-[10px] flex items-center gap-1 ${dlClass}`}>
                          {isOverdue ? <AlertTriangle size={9} /> : <Clock size={9} />}
                          {isOverdue ? 'Overdue: ' : isToday ? 'Due Today: ' : ''}
                          {dl.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      );
                    })()}

                    {/* Priority */}
                    <span className="pill text-[10px] font-medium" style={{ color: P_COLOR[task.priority] }}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>

                    {/* Gamification Stats */}
                    {task.status === 'completed' ? (
                       <span className="text-[10px] text-green-400 flex items-center gap-1 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">
                         <Zap size={9} fill="currentColor"/> +{task.xpReward} XP
                       </span>
                    ) : (
                       <span className="text-[10px] text-orange-400/80 flex items-center gap-1">
                         <Zap size={9}/> Reward: {task.xpReward} XP <span className="mx-0.5 opacity-40">|</span> <span className="text-red-400/80">Miss: -{task.penalty || 5} XP</span>
                       </span>
                    )}

                  </div>
                </div>

                {/* Actions Hover — Always visible on mobile for touch support */}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {task.status !== 'completed' && (
                    <button 
                      onClick={() => changeStatus(task._id, task.status === 'in-progress' ? 'pending' : 'in-progress')}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${task.status === 'in-progress' ? 'text-orange-400 bg-orange-400/10' : 'text-[#849495] hover:text-orange-400 hover:bg-orange-400/10'}`}
                      title={task.status === 'in-progress' ? "Mark as Pending" : "Mark as In-Progress"}>
                      <Clock size={12} />
                    </button>
                  )}
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
