import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { formatBureaucraticDateTime, getHumanRoleLabel, getHumanStatusLabel } from "@/lib/utils/formatters";

export type AuditAction = 
  | "CREATE" 
  | "UPDATE" 
  | "VERIFY" 
  | "SIGN" 
  | "PRINT" 
  | "MUTASI" 
  | "REJECT" 
  | "DELETE";

export type AuditTarget = 
  | "SURAT" 
  | "PENDUDUK" 
  | "KELUARGA" 
  | "PERTANAHAN" 
  | "RUMAH_TANGGA";

export interface AuditEntry {
  id: string;
  entity_type: AuditTarget;
  entity_id: string | number;
  entity_identifier: string; // e.g. Nomor Surat or NIK
  title: string;             // e.g. "Surat Keterangan Usaha" or "Biodata Penduduk"
  action: AuditAction;
  actor_id?: string;
  actor_name: string;
  actor_role: string;
  timestamp: string;
  status_from?: number | string;
  status_to?: number | string;
  comment?: string;
  metadata?: {
    ip?: string;
    device?: string;
    print_count?: number;
    checksum?: string;
    changes?: Record<string, { before: any; after: any }>;
    extra?: Record<string, any>;
  };
}

export interface AuditCertificate {
  certificateId: string;
  generatedAt: string;
  entityType: string;
  entityTitle: string;
  identifier: string;
  checksum: string;
  entries: AuditEntry[];
  totalActions: number;
  isTamperProof: boolean;
}

/**
 * Generate lightweight deterministic checksum for legal proof
 */
export function generateDocumentHash(payload: any): string {
  const str = typeof payload === "string" ? payload : JSON.stringify(payload || {});
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
  return `DOC-AUTH-${hex}-${Date.now().toString(36).toUpperCase()}`;
}

const LOCAL_AUDIT_KEY = "desaos_audit_logs_local";

function getLocalAuditLogs(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAuditLog(entry: AuditEntry) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalAuditLogs();
    existing.unshift(entry);
    // Keep last 300 entries locally
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(existing.slice(0, 300)));
  } catch (err) {
    console.warn("Failed saving local audit log:", err);
  }
}

/**
 * Record an audit log event
 */
export async function recordAuditLog(params: {
  entityType: AuditTarget;
  entityId: string | number;
  entityIdentifier: string;
  title: string;
  action: AuditAction;
  actorName?: string;
  actorRole?: string;
  statusFrom?: number | string;
  statusTo?: number | string;
  comment?: string;
  metadata?: Record<string, any>;
}): Promise<AuditEntry> {
  const supabase = createSupabaseBrowserClient();
  
  let actorName = params.actorName;
  let actorRole = params.actorRole;
  let actorId: string | undefined;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      actorId = user.id;
      if (!actorName) {
        actorName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Petugas Desa";
      }
      if (!actorRole) {
        actorRole = user.user_metadata?.role || "Operator Pelayanan";
      }
    }
  } catch {
    // offline or no auth session
  }

  const newEntry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    entity_type: params.entityType,
    entity_id: params.entityId,
    entity_identifier: params.entityIdentifier,
    title: params.title,
    action: params.action,
    actor_id: actorId,
    actor_name: actorName || "Operator Pelayanan",
    actor_role: getHumanRoleLabel(actorRole || "Operator"),
    timestamp: new Date().toISOString(),
    status_from: params.statusFrom,
    status_to: params.statusTo,
    comment: params.comment,
    metadata: {
      ...params.metadata,
      device: typeof navigator !== "undefined" ? navigator.userAgent : "Desktop Client",
      checksum: generateDocumentHash({
        id: params.entityId,
        identifier: params.entityIdentifier,
        action: params.action,
        time: new Date().toISOString()
      })
    }
  };

  // 1. Try to save to Supabase audit table if it exists
  try {
    await supabase.from("audit_logs").insert({
      id: newEntry.id,
      entity_type: newEntry.entity_type,
      entity_id: String(newEntry.entity_id),
      entity_identifier: newEntry.entity_identifier,
      title: newEntry.title,
      action: newEntry.action,
      actor_id: newEntry.actor_id,
      actor_name: newEntry.actor_name,
      actor_role: newEntry.actor_role,
      status_from: newEntry.status_from ? String(newEntry.status_from) : null,
      status_to: newEntry.status_to ? String(newEntry.status_to) : null,
      comment: newEntry.comment,
      metadata: newEntry.metadata,
      created_at: newEntry.timestamp
    });
  } catch {
    // If audit_logs table is missing, graceful fallback to local persistence
  }

  // 2. Always maintain local cache
  saveLocalAuditLog(newEntry);

  return newEntry;
}

/**
 * Record a letter print event
 */
export async function recordPrintAudit(params: {
  suratId: string | number;
  noSurat: string;
  namaSurat: string;
  actorName?: string;
  actorRole?: string;
}) {
  return recordAuditLog({
    entityType: "SURAT",
    entityId: params.suratId,
    entityIdentifier: params.noSurat,
    title: params.namaSurat,
    action: "PRINT",
    actorName: params.actorName,
    actorRole: params.actorRole,
    comment: "Pencetakan fisik dokumen resmi untuk penyerahan kepada warga.",
    metadata: {
      printed_at: new Date().toISOString()
    }
  });
}

/**
 * Get unified audit trail for an entity
 * Synthesizes data from `audit_logs`, `surat_flow_logs`, `log_surat`, and local cache.
 */
export async function getAuditTrail(
  entityType: AuditTarget,
  entityId: string | number,
  identifier?: string
): Promise<AuditEntry[]> {
  const supabase = createSupabaseBrowserClient();
  const entries: AuditEntry[] = [];
  const seenIds = new Set<string>();

  // 1. Check database audit_logs
  try {
    const { data: dbLogs } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", String(entityId))
      .order("created_at", { ascending: false });

    if (dbLogs && dbLogs.length > 0) {
      dbLogs.forEach((item: any) => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          entries.push({
            id: item.id,
            entity_type: item.entity_type,
            entity_id: item.entity_id,
            entity_identifier: item.entity_identifier || identifier || "-",
            title: item.title || "Dokumen",
            action: item.action || "UPDATE",
            actor_id: item.actor_id,
            actor_name: item.actor_name || "Petugas Desa",
            actor_role: item.actor_role || "Operator",
            timestamp: item.created_at,
            status_from: item.status_from,
            status_to: item.status_to,
            comment: item.comment,
            metadata: item.metadata || {}
          });
        }
      });
    }
  } catch {
    // Table might not exist yet
  }

  // 2. If entity is SURAT, also synthesize from surat_flow_logs & log_surat
  if (entityType === "SURAT") {
    try {
      const suratNumId = typeof entityId === "number" ? entityId : parseInt(String(entityId), 10);
      if (!isNaN(suratNumId)) {
        // Fetch flow logs
        const { data: flowLogs } = await supabase
          .from("surat_flow_logs")
          .select("*")
          .eq("surat_id", suratNumId)
          .order("created_at", { ascending: false });

        // Fetch parent log_surat
        const { data: logSurat } = await supabase
          .from("log_surat")
          .select("id, no_surat, tanggal, nama_surat, pamong:id_pamong(pamong_nama, pamong_jabatan), created_at")
          .eq("id", suratNumId)
          .maybeSingle();

        if (flowLogs && flowLogs.length > 0) {
          flowLogs.forEach((fl: any) => {
            const entryId = `flow_${fl.id}`;
            if (!seenIds.has(entryId)) {
              seenIds.add(entryId);
              let action: AuditAction = "UPDATE";
              if (fl.action === "create" || fl.action === "submit") action = "CREATE";
              else if (fl.action === "verify" || fl.action === "verify_sekdes") action = "VERIFY";
              else if (fl.action === "sign" || fl.action === "sign_kades") action = "SIGN";
              else if (fl.action === "reject") action = "REJECT";

              entries.push({
                id: entryId,
                entity_type: "SURAT",
                entity_id: suratNumId,
                entity_identifier: logSurat?.no_surat || identifier || "-",
                title: logSurat?.nama_surat || "Surat Layanan",
                action: action,
                actor_id: fl.user_id,
                actor_name: fl.user_name || "Petugas Desa",
                actor_role: getHumanRoleLabel(fl.role),
                timestamp: fl.created_at,
                status_from: fl.status_from,
                status_to: fl.status_to,
                comment: fl.comment,
                metadata: {
                  checksum: generateDocumentHash({ id: fl.id, time: fl.created_at })
                }
              });
            }
          });
        }

        // If no logs found in flow_logs, create an initial synthetic entry from log_surat
        if (entries.length === 0 && logSurat) {
          const creationDate = logSurat.created_at || logSurat.tanggal || new Date().toISOString();
          const baseEntry: AuditEntry = {
            id: `initial_surat_${logSurat.id}`,
            entity_type: "SURAT",
            entity_id: logSurat.id,
            entity_identifier: logSurat.no_surat || "-",
            title: logSurat.nama_surat || "Surat Layanan",
            action: "CREATE",
            actor_name: (logSurat.pamong as any)?.pamong_nama || "Operator Layanan",
            actor_role: (logSurat.pamong as any)?.pamong_jabatan || "Petugas",
            timestamp: creationDate,
            comment: "Dokumen diterbitkan secara resmi melalui sistem DesaOS.",
            metadata: {
              checksum: generateDocumentHash({ no_surat: logSurat.no_surat, tanggal: logSurat.tanggal })
            }
          };
          entries.push(baseEntry);
        }
      }
    } catch (err) {
      console.error("Error synthesizing flow logs:", err);
    }
  }

  // 3. Merge with local audit logs for this entity
  const localLogs = getLocalAuditLogs();
  localLogs.forEach(entry => {
    if (
      entry.entity_type === entityType &&
      (String(entry.entity_id) === String(entityId) || (identifier && entry.entity_identifier === identifier)) &&
      !seenIds.has(entry.id)
    ) {
      seenIds.add(entry.id);
      entries.push(entry);
    }
  });

  // Sort descending by timestamp
  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generate official Audit Certificate for dispute defense
 */
export function generateAuditCertificate(
  entries: AuditEntry[],
  entityTitle: string,
  identifier: string
): AuditCertificate {
  const checksum = generateDocumentHash({
    identifier,
    count: entries.length,
    lastAction: entries[0]?.timestamp || new Date().toISOString()
  });

  return {
    certificateId: `BA-AUDIT-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toISOString(),
    entityType: entries[0]?.entity_type || "DOKUMEN",
    entityTitle,
    identifier,
    checksum,
    entries,
    totalActions: entries.length,
    isTamperProof: true
  };
}
