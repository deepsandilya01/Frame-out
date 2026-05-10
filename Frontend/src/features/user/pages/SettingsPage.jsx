import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../state/user.store';
import { Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'electric', label: 'Electric Cyan', color: '#00F5FF' },
  { id: 'emerald',  label: 'Emerald',       color: '#10b981' },
  { id: 'crimson',  label: 'Crimson',        color: '#ef4444' },
  { id: 'purple',   label: 'Purple Neon',    color: '#a855f7' },
  { id: 'orange',   label: 'Solar Orange',   color: '#f97316' },
  { id: 'arctic',   label: 'Arctic White',   color: '#e2e8f0' },
];

export default function SettingsPage() {
  const dispatch  = useDispatch();
  const theme     = useSelector(s => s.user.theme);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[#849495] text-sm mt-0.5">Customize your Frame-Out experience</p>
      </div>

      {/* Theme */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-accent" />
          <h2 className="text-white font-semibold">Accent Theme</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => dispatch(setTheme(t.id))}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                theme === t.id
                  ? 'border-white/20 bg-white/5'
                  : 'border-white/6 bg-white/2 hover:bg-white/4'
              }`}>
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                   style={{ background: t.color, boxShadow: `0 0 8px ${t.color}40` }}>
                {theme === t.id && <Check size={10} className="text-black" />}
              </div>
              <span className="text-sm text-[#dce4e4] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="glass-glow rounded-2xl p-5">
        <p className="label-eyebrow mb-3">PREVIEW</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-ghost">Ghost Button</button>
          <span className="pill-accent">Active Pill</span>
          <span className="pill">Inactive Pill</span>
          <span className="text-accent font-semibold">Accent Text</span>
        </div>
        <div className="mt-3">
          <input className="input-minimal" placeholder="Sample input field" />
        </div>
      </div>
    </div>
  );
}
