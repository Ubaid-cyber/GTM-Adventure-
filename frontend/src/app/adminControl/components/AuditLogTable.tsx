'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Info, 
  Clock,
  Globe,
  Database,
  Shield,
  X
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  ip: string;
  userAgent: string | null;
  metadata: any;
  createdAt: Date | string;
}

export function AuditLogTable({ initialLogs }: { initialLogs: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = initialLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip.includes(searchTerm) ||
    (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
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
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredLogs.map((log) => (
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
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-all"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-sm font-medium italic">
                    No matching logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Data Deep Dive Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                       <Database className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold leading-none">Payload Inspection</h3>
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1.5">ID: {selectedLog.id}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setSelectedLog(null)}
                   className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Event Origin</h4>
                       <p className="text-white font-medium text-sm">{selectedLog.action}</p>
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Network Trace</h4>
                       <p className="text-blue-500 font-mono text-sm">{selectedLog.ip}</p>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Raw Metadata (JSON)</h4>
                    <div className="bg-black border border-white/5 rounded-2xl p-6 font-mono text-[11px] text-blue-300/80 max-h-[300px] overflow-y-auto custom-scrollbar">
                       <pre>{JSON.stringify(selectedLog.metadata, null, 2) || "// No specialized metadata recorded for this trace."}</pre>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                 <button 
                   onClick={() => setSelectedLog(null)}
                   className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition-all"
                 >
                    Close Trace
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
