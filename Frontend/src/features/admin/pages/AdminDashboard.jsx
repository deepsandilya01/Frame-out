import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, Activity, Target, ShieldAlert, Trash2, UserCog, Clock, 
  Search, Filter, TrendingUp, UserMinus, UserCheck, ChevronRight,
  BarChart3, LayoutGrid, Database, Plus, X
} from 'lucide-react';
import { useAdmin } from '../hook/useAdmin';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

function StatCard({ label, value, icon: Icon, color, trend }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="absolute -top-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
        <Icon size={100} style={{ color }} />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color: color }} />
        </div>
        {trend && (
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold border border-green-500/20 shadow-lg shadow-green-500/5">
            <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-[#849495] mt-1 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

function AssignTaskModal({ user, onClose, onAssign }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAssign({ userId: user._id, ...formData });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Assign Directive</h3>
            <p className="text-[#849495] text-xs">Target: {user.fullname}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#849495] hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-[#849495] uppercase tracking-widest font-bold">Task Title</label>
            <input 
              required
              type="text" 
              placeholder="System Optimization..."
              className="input-minimal"
              style={{ padding: '12px 10px' }}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#849495] uppercase tracking-widest font-bold">Mission Description</label>
            <textarea 
              placeholder="Detail the operational objectives..."
              className="input-minimal min-h-[100px] py-3 px-3 rounded-lg bg-white/5 border-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#849495] uppercase tracking-widest font-bold">Priority</label>
              <select 
                className="input-minimal px-2"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low" className="bg-[#080808]">Low</option>
                <option value="medium" className="bg-[#080808]">Medium</option>
                <option value="high" className="bg-[#080808]">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#849495] uppercase tracking-widest font-bold">Deadline</label>
              <input 
                type="date" 
                className="input-minimal px-2"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-4 justify-center"
          >
            {loading ? 'Transmitting...' : 'Confirm Assignment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { stats, users, logs, loading, fetchStats, fetchUsers, fetchLogs, changeRole, deleteUser, assignTask } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchLogs();
  }, [fetchStats, fetchUsers, fetchLogs]);

  const platformStats = stats?.stats || {};
  
  // FIXED: Synchronized date mapping between local and backend aggregation
  const growthData = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      // Backend returns YYYY-MM-DD. We need to match that.
      // Format: YYYY-MM-DD (e.g., 2026-05-13)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const existing = stats?.growth?.find(g => g._id === dateKey);
      
      last7Days.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        users: existing ? existing.count : 0
      });
    }
    return last7Days;
  }, [stats?.growth]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.fullname.toLowerCase().includes(search.toLowerCase()) || 
                            u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  const handleAssignTask = async (data) => {
    const res = await assignTask(data);
    if (res.success) {
      alert('Task assigned successfully!');
    } else {
      alert('Failed to assign task: ' + res.error);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto relative">
      {selectedUser && (
        <AssignTaskModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onAssign={handleAssignTask}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
               <ShieldAlert size={18} className="text-accent" />
             </div>
             <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Admin OS <span className="text-accent/50 text-sm font-normal">v2.5.2</span></h1>
          </div>
          <p className="text-[#849495] text-xs md:text-sm">Real-time platform intelligence and user orchestration.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 self-start md:self-auto overflow-x-auto">
          {[
            { id: 'overview', icon: LayoutGrid, label: 'Overview' },
            { id: 'users', icon: Users, label: 'Directory' },
            { id: 'logs', icon: Database, label: 'Logs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-accent text-black shadow-lg shadow-accent/20' 
                  : 'text-[#849495] hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="px-4 md:px-0 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Network Population" value={platformStats.users || 0} icon={Users} color="#00F5FF" />
            <StatCard label="Total Focus Pulse" value={Math.round(platformStats.totalFocusMinutes || 0)} icon={Clock} color="#8b5cf6" />
            <StatCard label="Active Directives" value={platformStats.tasks || 0} icon={Target} color="#10b981" />
            <StatCard label="Neural Sessions" value={platformStats.sessions || 0} icon={Activity} color="#f59e0b" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Chart */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
                  <TrendingUp size={16} className="text-accent" />
                  User Acquisition Growth
                </h3>
              </div>
              <div className="h-[250px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00F5FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#849495', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#849495', fontSize: 10 }}
                      domain={[0, 'auto']}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121212', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#00F5FF' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#00F5FF" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="glass rounded-3xl p-6 border border-white/5">
               <h3 className="text-white font-semibold flex items-center gap-2 text-sm mb-6">
                <Activity size={16} className="text-orange-400" />
                Recent Deployments
              </h3>
              <div className="space-y-4">
                {users.slice(0, 6).map((u, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white font-bold border border-white/10">
                        {u.fullname[0]}
                      </div>
                      <div>
                        <p className="text-xs text-white font-medium">{u.fullname}</p>
                        <p className="text-[9px] text-[#849495]">{formatDate(u.createdAt)}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#849495] opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab('users')} className="w-full mt-8 py-2.5 rounded-xl border border-white/5 text-[10px] text-[#849495] hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest font-bold">
                View All Personnel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4 px-4 md:px-0">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#849495]" size={16} />
              <input 
                type="text" 
                placeholder="Search node..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#849495] outline-none focus:border-accent/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                {['all', 'admin', 'user'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      roleFilter === role ? 'bg-white/10 text-white' : 'text-[#849495] hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider">User Node</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider">Access</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white text-xs font-bold border border-white/10 group-hover:border-accent/30 transition-all">
                            {user.fullname[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-accent transition-colors">{user.fullname}</p>
                            <p className="text-[10px] text-[#849495]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`pill text-[9px] px-2.5 py-0.5 border flex w-fit items-center gap-1.5 ${user.role === 'admin' ? 'border-accent/30 text-accent bg-accent/5' : 'border-white/10 text-[#849495]'}`}>
                          {user.role === 'admin' ? <ShieldAlert size={10} /> : <UserCog size={10} />}
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Always visible on mobile for accessibility */}
                        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all translate-x-2 md:group-hover:translate-x-0">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-black transition-all"
                            title="Assign Task"
                          >
                            <Plus size={15} />
                          </button>
                          <button 
                            onClick={() => changeRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[#849495] hover:text-white hover:border-white/20 transition-all"
                            title="Update Role"
                          >
                            <UserCog size={15} />
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Terminate this node?')) deleteUser(user._id) }}
                            className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filteredUsers.length === 0 && (
                 <div className="py-20 text-center text-[#849495] text-sm italic">No user nodes found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="px-4 md:px-0 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
              <Database size={16} className="text-accent" />
              System Audit Trail
            </h3>
            <button 
              onClick={fetchLogs} 
              className="text-[10px] text-accent hover:underline uppercase tracking-widest font-bold"
            >
              Refresh Logs
            </button>
          </div>

          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider">Event ID</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-[#849495] uppercase tracking-wider text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-mono text-[#555]">#{log._id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                          log.type === 'task_assignment' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                          log.type === 'user_management' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' :
                          log.type === 'security' ? 'border-red-500/20 text-red-400 bg-red-500/5' :
                          'border-white/10 text-[#849495]'
                        }`}>
                          {log.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{log.action}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#849495]">{log.details}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-[10px] text-[#849495] font-mono">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </p>
                        <p className="text-[8px] text-[#555]">{new Date(log.createdAt).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-[#849495] text-sm italic">
                        No audit records found in the current buffer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
