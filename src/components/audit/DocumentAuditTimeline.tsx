"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  Printer, 
  PenTool, 
  History, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { AuditEntry, AuditTarget, getAuditTrail } from "@/lib/services/audit";
import { formatBureaucraticDateTime } from "@/lib/utils/formatters";

interface DocumentAuditTimelineProps {
  entityType: AuditTarget;
  entityId: string | number;
  entityIdentifier?: string;
  className?: string;
}

export default function DocumentAuditTimeline({
  entityType,
  entityId,
  entityIdentifier,
  className
}: DocumentAuditTimelineProps) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const trail = await getAuditTrail(entityType, entityId, entityIdentifier);
        if (isMounted) setLogs(trail);
      } catch (err) {
        console.error("Error loading inline audit trail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [entityType, entityId, entityIdentifier]);

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center gap-2 text-xs text-secondary-text">
        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
        <span>Memuat linimasa audit...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-secondary-text">
        Belum ada jejak riwayat untuk dokumen ini.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE": return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case "VERIFY": return <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />;
      case "SIGN": return <PenTool className="w-3.5 h-3.5 text-emerald-500" />;
      case "PRINT": return <Printer className="w-3.5 h-3.5 text-purple-500" />;
      case "MUTASI": return <History className="w-3.5 h-3.5 text-indigo-500" />;
      case "REJECT": return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative pl-5 space-y-4 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-color">
        {logs.map((entry, index) => {
          const isLatest = index === 0;
          return (
            <div key={entry.id} className="relative group">
              <div 
                className={cn(
                  "absolute -left-5 top-0.5 w-5 h-5 rounded-full border bg-card-bg flex items-center justify-center",
                  isLatest ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border-color"
                )}
              >
                {getActionIcon(entry.action)}
              </div>

              <div className="p-3 rounded-lg border border-border-color bg-card-bg text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-primary-text">{entry.actor_name}</span>
                    <span className="text-[10px] text-secondary-text">({entry.actor_role})</span>
                  </div>
                  <div className="text-[10px] text-secondary-text font-mono">
                    {formatBureaucraticDateTime(entry.timestamp)}
                  </div>
                </div>

                {entry.comment && (
                  <p className="text-[11px] text-secondary-text bg-body-bg/50 p-1.5 rounded border border-border-color/40">
                    {entry.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
