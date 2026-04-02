import React from 'react';
import { getAdminAuditLogs } from '@/lib/actions/admin-actions';
import { 
  ClipboardList, 
  Search, 
  Terminal, 
  Shield, 
  Info, 
  Clock,
  Globe,
  Database
} from 'lucide-react';

export default async function AuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 📜 Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Logs</h1>
          <p className="text-white/40 text-sm mt-1">Immutable chronological trace of administrative and system activities.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl shadow-lg">
           <Terminal className="w-4 h-4 text-blue-500" />
           <span className="text-white/70 text-sm font-mono tracking-tight">Governance Active</span>
        </div>
      </div>

      {/* 📊 Strategic Audit Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Trace Events</div>
           <div className="text-2xl font-bold text-white">{logs.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl border-green-500/10">
           <div className="text-[10px] font-black uppercase tracking-widest text-green-500/50 mb-1">Security Health</div>
           <div className="text-2xl font-bold text-white uppercase tracking-tighter">Compliant</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Unique Admin IPs</div>
           <div className="text-2xl font-bold text-white">{new Set(logs.map(l => l.ip)).size}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl border-blue-500/10">
           <div className="text-[10px] font-black uppercase tracking-widest text-blue-500/50 mb-1">Retention Policy</div>
           <div className="text-2xl font-bold text-white uppercase tracking-tighter">90 Days</div>
        </div>
      </div>

      {/* 📋 System Trace Table */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
           <div className="flex items-center gap-2">
             <Shield className="w-4 h-4 text-white/20" />
             <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Administrative Audit Trail</span>
           </div>
           <div className="flex items-center bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition-all">
             <Search className="w-3.5 h-3.5 text-white/20 mr-2" />
             <input 
               type="text" 
               placeholder="Filter actions or IPs..." 
               className="bg-transparent border-none text-[11px] text-white placeholder:text-white/20 focus:ring-0 p-0 w-48"
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Action & Resource</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Administrator</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Network Trace</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                         <Info className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="font-mono text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                        {log.action}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-white/60 text-xs font-medium">
                      {log.userId || 'System Automation'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
                        <Globe className="w-3 h-3 opacity-50 text-blue-500" />
                        {log.ip}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2 text-white/40 text-[11px]">
                       <Clock className="w-3 h-3 opacity-30" />
                       {new Date(log.createdAt).toLocaleString()}
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-all">
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-sm font-medium italic">
                    No system audit logs found in recent history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
