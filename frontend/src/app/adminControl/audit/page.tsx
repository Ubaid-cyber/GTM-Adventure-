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
import { getAdminAuditLogs } from '@/lib/actions/admin-actions';
import { AuditLogTable } from '../components/AuditLogTable';

export default async function AuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Trace Events</div>
           <div className="text-2xl font-bold text-white tracking-tight">{logs.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl border-green-500/10 relative overflow-hidden group">
           <div className="text-[10px] font-black uppercase tracking-widest text-green-500/50 mb-1">Security Health</div>
           <div className="text-2xl font-bold text-white uppercase tracking-tighter">Compliant</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Unique Admin IPs</div>
           <div className="text-2xl font-bold text-white tracking-tight">{new Set(logs.map(l => l.ip)).size}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl border-blue-500/10 relative overflow-hidden group">
           <div className="text-[10px] font-black uppercase tracking-widest text-blue-500/50 mb-1">Retention Policy</div>
           <div className="text-2xl font-bold text-white uppercase tracking-tighter">90 Days</div>
        </div>
      </div>

      {/* 📋 System Trace Table - Handled by Client Component */}
      <AuditLogTable initialLogs={logs} />
    </div>
  );
}
