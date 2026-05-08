import React, { useEffect } from 'react';
import { useHeatmap } from '../hook/useHeatmap';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const INTENSITY_COLOR = [
  'rgba(255,255,255,0.04)',
  'rgba(0,245,255,0.2)',
  'rgba(0,245,255,0.4)',
  'rgba(0,245,255,0.7)',
  'var(--theme-accent)',
];

function HeatCell({ entry }) {
  const intensity = entry?.intensity ?? 0;
  return (
    <div
      title={entry ? `${entry.date}: ${entry.focusMinutes || 0} min (Level ${intensity})` : 'No data'}
      className="w-3 h-3 rounded-sm transition-all duration-150 hover:scale-125 cursor-pointer"
      style={{
        background: INTENSITY_COLOR[Math.min(intensity, 4)],
        boxShadow: intensity > 2 ? `0 0 4px ${INTENSITY_COLOR[intensity]}` : 'none',
      }}
    />
  );
}

export default function HeatmapPage() {
  const { year, loading, fetchYear } = useHeatmap();

  useEffect(() => { fetchYear(); }, []);

  // Group by weeks (each week = 7 days)
  const weeks = [];
  for (let i = 0; i < year.length; i += 7) {
    weeks.push(year.slice(i, i + 7));
  }

  // Compute stats
  const activeDays  = year.filter(d => d.intensity > 0).length;
  const totalMin    = year.reduce((acc, d) => acc + (d.focusMinutes || 0), 0);
  const maxIntDay   = year.reduce((max, d) => d.intensity > (max.intensity || 0) ? d : max, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Activity Heatmap</h1>
        <p className="text-[#849495] text-sm mt-0.5">GitHub-style focus tracking — last 365 days</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="label-eyebrow mb-1">ACTIVE DAYS</p>
          <p className="text-3xl font-bold text-white">{activeDays}</p>
          <p className="text-[#849495] text-xs">out of {year.length} tracked</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="label-eyebrow mb-1">TOTAL FOCUS</p>
          <p className="text-3xl font-bold text-white">{Math.round(totalMin / 60)}<span className="text-sm text-[#849495] ml-1">hrs</span></p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="label-eyebrow mb-1">BEST DAY</p>
          <p className="text-3xl font-bold text-accent">{maxIntDay.focusMinutes || 0}<span className="text-sm text-[#849495] ml-1">min</span></p>
          {maxIntDay.date && <p className="text-[#849495] text-xs">{new Date(maxIntDay.date).toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="glass rounded-2xl p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-[#849495] text-sm">Loading heatmap…</div>
        ) : year.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#849495] text-sm">
            No data yet. Complete focus sessions to build your streak!
          </div>
        ) : (
          <>
            {/* Month labels */}
            <div className="flex gap-1.5 mb-2 ml-8">
              {MONTHS.map(m => (
                <span key={m} className="text-[10px] text-[#849495] w-[52px]">{m}</span>
              ))}
            </div>

            {/* Day labels + grid */}
            <div className="flex gap-1.5">
              <div className="flex flex-col gap-1.5 mr-1">
                {['Mon','','Wed','','Fri','','Sun'].map((d, i) => (
                  <span key={i} className="text-[10px] text-[#849495] h-3 leading-3">{d}</span>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {week.map((day, di) => (
                    <HeatCell key={di} entry={day} />
                  ))}
                  {/* Pad last week */}
                  {week.length < 7 && [...Array(7 - week.length)].map((_, i) => (
                    <div key={`pad-${i}`} className="w-3 h-3" />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-[10px] text-[#849495]">Less</span>
              {INTENSITY_COLOR.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-[10px] text-[#849495]">More</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
