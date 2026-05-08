import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BookOpen, Save, ChevronLeft, ChevronRight, Smile, Target, Heart, Star } from 'lucide-react';
import { userService } from '../service/user.service';
import { gsap } from 'gsap';

const MOODS = [
  { key: 'sleepy',    emoji: '😴', label: 'Sleepy',    color: '#6366f1' },
  { key: 'calm',      emoji: '😐', label: 'Calm',      color: '#64748b' },
  { key: 'happy',     emoji: '😊', label: 'Happy',     color: '#f59e0b' },
  { key: 'motivated', emoji: '🔥', label: 'Motivated', color: '#f97316' },
  { key: 'energized', emoji: '⚡', label: 'Energized', color: '#00F5FF' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function JournalPage() {
  const containerRef = useRef(null);

  const [entry,      setEntry]      = useState({ content: '', mood: null, goals: [], gratitude: [], highlights: '' });
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [history,    setHistory]    = useState([]);
  const [histPage,   setHistPage]   = useState(1);
  const [histTotal,  setHistTotal]  = useState(0);
  const [activeView, setActiveView] = useState('today'); // 'today' | 'history'

  // Temp input for adding goals/gratitude
  const [goalInput, setGoalInput]       = useState('');
  const [gratInput, setGratInput]       = useState('');

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
    loadToday();
    loadHistory();
  }, []);

  const loadToday = async () => {
    try {
      setLoading(true);
      const res = await userService.getJournalToday();
      setEntry({
        content:    res.entry.content    || '',
        mood:       res.entry.mood       || null,
        goals:      res.entry.goals      || [],
        gratitude:  res.entry.gratitude  || [],
        highlights: res.entry.highlights || '',
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadHistory = async (page = 1) => {
    try {
      const res = await userService.getJournalHistory({ page, limit: 5 });
      setHistory(res.entries || []);
      setHistTotal(res.pagination?.total || 0);
      setHistPage(page);
    } catch (e) { console.error(e); }
  };

  const save = async () => {
    try {
      setSaving(true);
      await userService.saveJournalToday(entry);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadHistory();
    } catch (e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  // Auto-save debounce
  const autoSaveRef = useRef(null);
  const triggerAutoSave = useCallback((newEntry) => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      userService.saveJournalToday(newEntry).catch(() => {});
    }, 2000);
  }, []);

  const updateEntry = (field, value) => {
    const next = { ...entry, [field]: value };
    setEntry(next);
    triggerAutoSave(next);
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    const next = { ...entry, goals: [...entry.goals, goalInput.trim()] };
    setEntry(next);
    setGoalInput('');
    triggerAutoSave(next);
  };

  const addGratitude = () => {
    if (!gratInput.trim()) return;
    const next = { ...entry, gratitude: [...entry.gratitude, gratInput.trim()] };
    setEntry(next);
    setGratInput('');
    triggerAutoSave(next);
  };

  const removeGoal = (i) => {
    const next = { ...entry, goals: entry.goals.filter((_, idx) => idx !== i) };
    setEntry(next); triggerAutoSave(next);
  };

  const removeGrat = (i) => {
    const next = { ...entry, gratitude: entry.gratitude.filter((_, idx) => idx !== i) };
    setEntry(next); triggerAutoSave(next);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center"
               style={{ border: '1px solid rgba(0,245,255,0.3)' }}>
            <BookOpen size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reflection Journal</h1>
            <p className="text-[#849495] text-sm">{formatDate(todayStr())}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex gap-1 glass rounded-full p-1">
            {['today', 'history'].map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  activeView === v ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
                }`}>{v}</button>
            ))}
          </div>
          {activeView === 'today' && (
            <button onClick={save} disabled={saving}
              className="btn-primary px-4 py-2 text-sm">
              <Save size={13} />
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {activeView === 'today' ? (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Main writing area */}
            <div className="col-span-2 space-y-4">
              {/* Mood */}
              <div className="glass rounded-2xl p-5">
                <p className="label-eyebrow mb-3 flex items-center gap-2"><Smile size={12} /> HOW ARE YOU FEELING TODAY?</p>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button key={m.key} onClick={() => updateEntry('mood', m.key)}
                      className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all text-sm ${
                        entry.mood === m.key
                          ? 'ring-1'
                          : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                      style={entry.mood === m.key ? { background: m.color + '18', borderColor: m.color + '50', color: m.color } : {}}>
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[10px] font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main reflection */}
              <div className="glass rounded-2xl p-5">
                <p className="label-eyebrow mb-3 flex items-center gap-2"><BookOpen size={12} /> TODAY'S REFLECTION</p>
                <textarea
                  value={entry.content}
                  onChange={e => updateEntry('content', e.target.value)}
                  placeholder="What happened today? What did you learn? How did your focus sessions go? Write freely…"
                  className="input-minimal resize-none text-sm w-full leading-relaxed"
                  rows={10}
                />
                <p className="text-[#849495] text-xs mt-2 text-right">{entry.content.length}/5000</p>
              </div>

              {/* Highlights */}
              <div className="glass rounded-2xl p-5">
                <p className="label-eyebrow mb-3 flex items-center gap-2"><Star size={12} /> TODAY'S WIN</p>
                <textarea
                  value={entry.highlights}
                  onChange={e => updateEntry('highlights', e.target.value)}
                  placeholder="What was your biggest win today, no matter how small?"
                  className="input-minimal resize-none text-sm w-full"
                  rows={3}
                />
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {/* Goals */}
              <div className="glass rounded-2xl p-5">
                <p className="label-eyebrow mb-3 flex items-center gap-2"><Target size={12} /> TODAY'S GOALS</p>
                <div className="space-y-2 mb-3">
                  {entry.goals.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-accent">→</span>
                      <span className="text-[#dce4e4] flex-1">{g}</span>
                      <button onClick={() => removeGoal(i)} className="text-[#849495] hover:text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addGoal()}
                    placeholder="Add a goal…"
                    className="input-minimal text-sm flex-1 py-1.5"
                  />
                  <button onClick={addGoal} className="btn-ghost px-3 py-1.5 text-xs">+</button>
                </div>
              </div>

              {/* Gratitude */}
              <div className="glass rounded-2xl p-5">
                <p className="label-eyebrow mb-3 flex items-center gap-2"><Heart size={12} /> GRATITUDE</p>
                <div className="space-y-2 mb-3">
                  {entry.gratitude.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-pink-400">♡</span>
                      <span className="text-[#dce4e4] flex-1">{g}</span>
                      <button onClick={() => removeGrat(i)} className="text-[#849495] hover:text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={gratInput}
                    onChange={e => setGratInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addGratitude()}
                    placeholder="I'm grateful for…"
                    className="input-minimal text-sm flex-1 py-1.5"
                  />
                  <button onClick={addGratitude} className="btn-ghost px-3 py-1.5 text-xs">+</button>
                </div>
              </div>

              {/* Auto-save note */}
              <p className="text-[#849495] text-xs text-center">
                ✦ Auto-saves 2s after you stop typing
              </p>
            </div>
          </div>
        )
      ) : (
        /* History view */
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <BookOpen size={32} className="text-[#849495] mx-auto mb-3" />
              <p className="text-[#849495] text-sm">No past entries yet. Start writing today!</p>
            </div>
          ) : history.map((h, i) => (
            <div key={i} className="glass rounded-2xl p-5 hover:bg-white/2 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-accent text-sm font-medium">{formatDate(h.date)}</span>
                    {h.mood && <span className="text-lg">{MOODS.find(m => m.key === h.mood)?.emoji}</span>}
                  </div>
                  {h.content && (
                    <p className="text-[#849495] text-sm leading-relaxed line-clamp-3">{h.content}</p>
                  )}
                  {h.goals?.length > 0 && (
                    <p className="text-[#849495] text-xs mt-2">
                      {h.goals.length} goal{h.goals.length > 1 ? 's' : ''} · {h.gratitude?.length || 0} gratitude items
                    </p>
                  )}
                </div>
                {h.highlights && (
                  <div className="glass rounded-xl px-3 py-2 max-w-xs text-xs text-amber-400 flex-shrink-0">
                    ⭐ {h.highlights.slice(0, 80)}{h.highlights.length > 80 ? '…' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {histTotal > 5 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => loadHistory(histPage - 1)} disabled={histPage === 1}
                className="btn-ghost px-3 py-2 disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <span className="text-[#849495] text-sm">Page {histPage} of {Math.ceil(histTotal / 5)}</span>
              <button onClick={() => loadHistory(histPage + 1)} disabled={histPage >= Math.ceil(histTotal / 5)}
                className="btn-ghost px-3 py-2 disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
