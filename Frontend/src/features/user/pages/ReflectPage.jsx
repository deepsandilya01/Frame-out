import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  BookOpen, Save, ChevronLeft, ChevronRight, Smile, 
  Target, Heart, Star, TrendingUp, BarChart2, Zap, History as HistoryIcon
} from 'lucide-react';
import { userService } from '../service/user.service';
import { gsap } from 'gsap';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const MOODS = [
  { key: 'sleepy',    emoji: '😴', label: 'Sleepy',    color: '#6366f1' },
  { key: 'calm',      emoji: '😐', label: 'Calm',      color: '#64748b' },
  { key: 'happy',     emoji: '😊', label: 'Happy',     color: '#f59e0b' },
  { key: 'motivated', emoji: '🔥', label: 'Motivated', color: '#f97316' },
  { key: 'energized', emoji: '⚡', label: 'Energized', color: '#00F5FF' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function ReflectPage() {
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'history' | 'analytics'
  const [entry, setEntry] = useState({ content: '', mood: null, goals: [], gratitude: [], highlights: '' });
  const [history, setHistory] = useState([]);
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [goalInput, setGoalInput] = useState('');
  const [gratInput, setGratInput] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [jRes, hRes, mRes] = await Promise.all([
        userService.getJournalToday(),
        userService.getJournalHistory({ page: 1, limit: 10 }),
        userService.getMoodAnalytics()
      ]);
      
      setEntry({
        content: jRes.entry?.content || '',
        mood: jRes.entry?.mood || null,
        goals: jRes.entry?.goals || [],
        gratitude: jRes.entry?.gratitude || [],
        highlights: jRes.entry?.highlights || '',
      });
      setHistory(hRes.entries || []);
      setMoodData(mRes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await userService.saveJournalToday(entry);
      setTimeout(() => setSaving(false), 800);
      loadAll();
    } catch (e) { alert('Save failed'); setSaving(false); }
  };

  const updateEntry = (field, value) => setEntry(prev => ({ ...prev, [field]: value }));

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setEntry(prev => ({ ...prev, goals: [...prev.goals, goalInput.trim()] }));
    setGoalInput('');
  };

  const addGrat = () => {
    if (!gratInput.trim()) return;
    setEntry(prev => ({ ...prev, gratitude: [...prev.gratitude, gratInput.trim()] }));
    setGratInput('');
  };

  // Analytics data prep
  const distribution = moodData?.distribution || [];
  const barData = distribution.map(d => ({
    name: MOODS.find(m => m.key === d.mood)?.label || d.mood,
    sessions: d.count,
    avgFocus: d.avgFocus,
    color: MOODS.find(m => m.key === d.mood)?.color || '#849495',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center border border-accent/20">
            <BookOpen size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mindful Reflection</h1>
            <p className="text-[#849495] text-sm">Align your mindset with your goals</p>
          </div>
        </div>
        
        <div className="flex gap-1 glass rounded-full p-1 overflow-x-auto scrollbar-hide w-full sm:w-fit whitespace-nowrap px-2">
          {[
            { id: 'write', label: 'Write', icon: BookOpen },
            { id: 'analytics', label: 'Mindset', icon: TrendingUp },
            { id: 'history', label: 'Past', icon: HistoryIcon }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                activeTab === t.id ? 'bg-accent-dim text-accent border border-accent/20' : 'text-[#849495] hover:text-white'
              }`}>
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'write' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Mood */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <p className="label-eyebrow mb-4 flex items-center gap-2"><Smile size={12} /> Current Energy State</p>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                {MOODS.map(m => (
                  <button key={m.key} onClick={() => updateEntry('mood', m.key)}
                    className={`flex-1 min-w-[60px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all group ${
                      entry.mood === m.key ? 'ring-1 border-white/10' : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                    }`}
                    style={entry.mood === m.key ? { background: m.color + '18', borderColor: m.color + '50', color: m.color } : {}}>
                    <span className="text-2xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <span className="text-[10px] font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <p className="label-eyebrow flex items-center gap-2"><Star size={12} /> Daily Log</p>
                <p className="text-[#849495] text-[10px]">{formatDate(new Date().toISOString().split('T')[0])}</p>
              </div>
              <textarea 
                value={entry.content}
                onChange={e => updateEntry('content', e.target.value)}
                placeholder="What's on your mind? How was your focus today?"
                className="input-minimal resize-none text-sm w-full leading-relaxed min-h-[300px]"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] text-[#849495]">Auto-saving...</p>
                <button onClick={save} disabled={saving} className="btn-primary px-6 py-2 text-xs font-bold uppercase tracking-wider">
                  {saving ? 'Saving...' : 'Secure Save'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             {/* Wins */}
             <div className="glass rounded-2xl p-5 border border-white/5">
               <p className="label-eyebrow mb-3 flex items-center gap-2 text-amber-400"><Star size={12} /> Main Highlight</p>
               <input 
                  value={entry.highlights}
                  onChange={e => updateEntry('highlights', e.target.value)}
                  placeholder="One big win..."
                  className="input-minimal text-sm w-full"
               />
             </div>

             {/* Gratitude */}
             <div className="glass rounded-2xl p-5 border border-white/5">
               <p className="label-eyebrow mb-3 flex items-center gap-2 text-pink-400"><Heart size={12} /> Gratitude</p>
               <div className="space-y-2 mb-4">
                 {entry.gratitude.map((g, i) => (
                   <div key={i} className="flex items-center gap-2 text-xs text-[#dce4e4] bg-white/2 px-2 py-1.5 rounded-lg">
                     <span className="text-pink-400">♡</span> {g}
                   </div>
                 ))}
               </div>
               <div className="flex gap-2">
                 <input value={gratInput} onChange={e => setGratInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGrat()} placeholder="I'm grateful for..." className="input-minimal text-xs flex-1 py-2" />
                 <button onClick={addGrat} className="btn-ghost px-3 text-sm">+</button>
               </div>
             </div>

             {/* Focus Insight - Proactive AI Style */}
             <div className="glass-glow rounded-2xl p-5 border border-accent/20">
                <p className="label-eyebrow mb-2 flex items-center gap-2 text-accent"><Zap size={12} /> Mindset Insight</p>
                <p className="text-xs text-white/80 leading-relaxed">
                  {moodData?.bestMood 
                    ? `You are most productive when feeling ${MOODS.find(m => m.key === moodData.bestMood)?.label}. Try a 5-min breathing exercise to shift your state.`
                    : "Track more sessions to unlock emotional productivity insights."}
                </p>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="glass rounded-2xl p-6">
              <p className="label-eyebrow mb-6">Mood Distribution</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#849495', fontSize: 11}} width={80} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                   <Bar dataKey="sessions" radius={[0, 4, 4, 0]} barSize={20}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.8} />)}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="glass rounded-2xl p-6">
              <p className="label-eyebrow mb-6">Productivity by Mood (Min)</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#849495', fontSize: 11}} width={80} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                   <Bar dataKey="avgFocus" radius={[0, 4, 4, 0]} barSize={20}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.6} />)}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-[#849495] text-sm">No entries yet.</div>
          ) : history.map((h, i) => (
            <div key={i} className="glass rounded-2xl p-5 hover:bg-white/4 transition-all">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-sm font-bold uppercase tracking-tighter">{formatDate(h.date)}</span>
                    <span className="text-xl">{MOODS.find(m => m.key === h.mood)?.emoji}</span>
                  </div>
               </div>
               <p className="text-[#849495] text-sm leading-relaxed line-clamp-3">{h.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-[#849495] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {p.value}{p.name === 'avgFocus' ? ' min' : ''}
        </p>
      ))}
    </div>
  );
};
