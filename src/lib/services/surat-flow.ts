import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export enum SuratFlowStatus {
  DRAFT = 0,
  PENDING_SEKDES = 1,
  PENDING_KADES = 2,
  SIGNED = 3,
  REJECTED_SEKDES = 4,
  REJECTED_KADES = 5,
}

export interface SuratFlowLog {
  id: string;
  surat_id: number;
  user_id: string;
  user_name?: string;
  role: string;
  action: string;
  status_from: number;
  status_to: number;
  comment?: string;
  created_at: string;
}

export interface SuratTask extends Record<string, any> {
  id: number;
  tanggal: string;
  no_surat?: string;
  status: number;
  nama_surat?: string; // from format_surat
  pemohon_nama?: string; // from penduduk
  pemohon_nik?: string;
  keterangan?: string;
  surat_formats?: {
    nama: string;
    kode_surat?: string;
    template?: any;
  };
  penduduk?: {
    nama: string;
    nik: string;
  };
}

export interface FormFieldDefinition {
    id: string;
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'land_sketch' | 'land_boundaries';
    required?: boolean;
    options?: string[]; // For select types
    placeholder?: string;
    defaultValue?: any;
}

export function extractFieldsFromTemplate(content: string, typeOrName?: string): FormFieldDefinition[] {
    const uniqueFields = new Set<string>();
    const fields: FormFieldDefinition[] = [];
    
    // List of system variables that are auto-filled from Database
    const systemVariables = [
        // Identitas Desa
        "Nama_Desa", "Kecamatan", "Kabupaten", "Kode_Desa", "Provinsi",
        "Nama_Kepala_Desa", "NIP_Kepala_Desa", "Jabatan_Kepala_Desa",
        "Nama_Sekretaris_Desa", "NIP_Sekretaris_Desa",
        "Alamat_Desa", "Logo_Desa", "Website_Desa", "Email_Desa", "Kode_Pos_Desa",
        "Sebutan_Desa", "Sebutan_Kabupaten", "Sebutan_Kecamatan", 
        "Nama_Kecamatan", "Nama_Kabupaten", "Nama_Provinsi",
        "Penandatangan", "Tgl_Surat", "Tanggal_Surat",
        
        // Aliases / Common variations
        "Nama_Des", "Nama_Kec", "Nama_Kab", "Nama_Prov", "Alamat_Des",
        "Format_Nomor_Surat", "Kode_Surat", "Tahun", "Nomor_Surat",
        
        // Data Penduduk
        "Nama", "Nama_Lengkap", "Nama_Penduduk",
        "NIK", "No_KTP",
        "Tempat_Lahir", "Tanggal_Lahir", "Tempat_Tanggal_Lahir", "Tgl_Lahir",
        "Jenis_Kelamin", "Sex",
        "Agama",
        "Status_Perkawinan", "Status_Kawin",
        "Pekerjaan", "Pekerjaan_Terakhir",
        "Kewarganegaraan", "Warga_Negara",
        "Pendidikan", "Pendidikan_Terakhir",
        "Golongan_Darah", "Gol_Darah",
        "Nama_Ayah", "Nama_Ibu",
        "Alamat", "Alamat_Lengkap", "Alamat_Rumah",
        "RT", "RW", "Dusun", "Lingkungan",
        "Umur",
    ];

    const isSystemVar = (key: string) => {
        const lowerKey = key.trim().toLowerCase();
        return systemVariables.some(
            sysVar => sysVar.toLowerCase() === lowerKey || 
                      sysVar.toLowerCase().replace(/_/g, ' ') === lowerKey.replace(/_/g, ' ') ||
                      sysVar.toLowerCase().replace(/_/g, '') === lowerKey.replace(/_/g, '')
        );
    };

    const addField = (key: string, explicitType?: FormFieldDefinition['type'], label?: string) => {
        const cleanKey = key.trim();
        if (!cleanKey) return;
        
        if (!uniqueFields.has(cleanKey) && !isSystemVar(cleanKey)) {
            uniqueFields.add(cleanKey);
            
            let type: FormFieldDefinition['type'] = explicitType || 'text';
            const lowerKey = cleanKey.toLowerCase();

            if (!explicitType) {
                if (lowerKey.includes('tanggal') || lowerKey.includes('tgl') || lowerKey.includes('waktu')) {
                    type = 'date';
                } else if (lowerKey.includes('umur') || lowerKey.includes('jumlah') || lowerKey.includes('nilai') || lowerKey.includes('harga')) {
                    type = 'number';
                } else if (lowerKey.includes('uraian') || lowerKey.includes('keterangan') || lowerKey.includes('isi') || lowerKey.includes('pesan') || lowerKey.includes('keperluan') || lowerKey.includes('alasan')) {
                    type = 'textarea';
                } else if (key === 'Sketsa_Tanah' || lowerKey.includes('sketsa_tanah')) {
                    type = 'land_sketch';
                } else if (key === 'Batas_Tanah' || lowerKey.includes('batas_tanah')) {
                    type = 'land_boundaries';
                }
            }
            
            fields.push({
                id: cleanKey,
                key: cleanKey, 
                label: label || cleanKey.replace(/_/g, ' '),
                type: type,
                required: true 
            });
        }
    };

    // Try parsing as JSON first (for visual editor templates)
    if (content && typeof content === 'string' && content.trim().startsWith('{')) {
      try {
        const jsonContent = JSON.parse(content);
        if (typeof jsonContent === 'object' && jsonContent !== null) {
            Object.values(jsonContent).forEach((node: any) => {
                if (node?.type?.resolvedName === 'Input') {
                    const label = node.props?.label;
                    if (label) {
                        const inputType = node.props?.inputType === 'number' ? 'number' : 'text';
                        addField(label, inputType, label);
                    }
                } else if (node?.type?.resolvedName === 'Text') {
                    const text = node.props?.text;
                    if (typeof text === 'string') {
                        // Run regex on text content
                        const regex = /\[([^"\{\}\[\]]+)\]/g;
                        const matches = Array.from(text.matchAll(regex));
                        matches.forEach(match => addField(match[1]));
                    }
                }
            });
            
            if (fields.length > 0) return fields;
        }
      } catch (e) {
        // Not JSON, proceed to regex fallback
      }
    }

    // Fallback: Regex on content string if available
    if (content && typeof content === 'string') {
      const regex = /\[([^"\{\}\[\]]+)\]/g;
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
          addField(match[1]);
      });
      if (fields.length > 0) return fields;
    }

    // Fallback: Check built-in template type or format name
    if (typeOrName) {
      const t = typeOrName.toLowerCase().replace(/[\s\-_/]+/g, '_');
      
      if (t.includes('sporadik')) {
        addField('Sketsa_Tanah', 'land_sketch', 'Sketsa Tanah');
        addField('Batas_Tanah', 'land_boundaries', 'Batas Tanah');
      } else if (t.includes('domisili_usaha_non_warga')) {
        addField('Nama Usaha', 'text', 'Nama Usaha');
        addField('Jenis Usaha', 'text', 'Jenis Usaha');
        addField('Alamat Usaha', 'text', 'Alamat Usaha');
        addField('Status Bangunan', 'text', 'Status Bangunan');
      } else if (t.includes('domisili_usaha') || t.includes('ket_usaha') || t.includes('usaha')) {
        addField('Nama Usaha', 'text', 'Nama Usaha');
        addField('Jenis Usaha', 'text', 'Jenis Usaha');
        addField('Alamat Usaha', 'text', 'Alamat Usaha');
      } else if (t.includes('pindah')) {
        addField('Alasan Pindah', 'textarea', 'Alasan Pindah');
        addField('Alamat Tujuan', 'text', 'Alamat Tujuan');
        addField('Desa Tujuan', 'text', 'Desa/Kelurahan Tujuan');
        addField('Kecamatan Tujuan', 'text', 'Kecamatan Tujuan');
        addField('Kabupaten Tujuan', 'text', 'Kabupaten/Kota Tujuan');
        addField('Provinsi Tujuan', 'text', 'Provinsi Tujuan');
        addField('Pengikut', 'number', 'Jumlah Pengikut');
      } else if (t.includes('rujuk_cerai') || t.includes('rujuk')) {
        addField('Status', 'text', 'Status (Rujuk/Cerai)');
        addField('Nama Pasangan', 'text', 'Nama Pasangan');
        addField('Tanggal Kejadian', 'date', 'Tanggal Kejadian');
        addField('No Akta', 'text', 'No. Akta / Surat');
      } else if (t.includes('wali_hakim')) {
        addField('Sebab Wali Hakim', 'textarea', 'Alasan Wali Hakim');
        addField('Nama Calon', 'text', 'Nama Calon Suami');
      } else if (t.includes('kuasa')) {
        addField('Nama Penerima', 'text', 'Nama Penerima Kuasa');
        addField('NIK Penerima', 'text', 'NIK Penerima Kuasa');
        addField('Umur Penerima', 'text', 'Umur Penerima Kuasa');
        addField('Pekerjaan Penerima', 'text', 'Pekerjaan Penerima Kuasa');
        addField('Alamat Penerima', 'text', 'Alamat Penerima Kuasa');
        addField('Keperluan Kuasa', 'textarea', 'Keperluan / Isi Kuasa');
      } else if (t.includes('perjalanan_dinas') || t.includes('sppd')) {
        addField('Nama Pejabat', 'text', 'Nama Pejabat Yang Berangkat');
        addField('Jabatan Pejabat', 'text', 'Jabatan Pejabat');
        addField('Tujuan Dinas', 'text', 'Tempat Tujuan');
        addField('Keperluan Dinas', 'textarea', 'Maksud Perjalanan Dinas');
        addField('Lama Dinas', 'text', 'Lama Perjalanan (Hari)');
        addField('Tgl Berangkat', 'date', 'Tanggal Berangkat');
        addField('Tgl Kembali', 'date', 'Tanggal Kembali');
        addField('Anggaran', 'text', 'Sumber Dana / Beban Anggaran');
      } else if (t.includes('permohonan_akta')) {
        addField('Nama Anak', 'text', 'Nama Anak');
        addField('TTL Anak', 'text', 'Tempat/Tgl Lahir Anak');
        addField('Anak Ke', 'number', 'Anak Ke-');
        addField('JK Anak', 'text', 'Jenis Kelamin Anak (L/P)');
        addField('Nama Ayah', 'text', 'Nama Ayah');
        addField('Nama Ibu', 'text', 'Nama Ibu');
      } else if (t.includes('cerai')) {
        addField('Nama Pasangan', 'text', 'Nama Pasangan');
        addField('Alasan Cerai', 'textarea', 'Alasan Perceraian');
      } else if (t.includes('duplikat_kelahiran')) {
        addField('Alasan Duplikat', 'textarea', 'Alasan Duplikat');
        addField('Keterangan', 'textarea', 'Keterangan Tambahan');
      } else if (t.includes('duplikat_nikah')) {
        addField('Alasan Duplikat', 'textarea', 'Alasan Duplikat');
        addField('No Nikah Lama', 'text', 'Nomor Surat Nikah Lama');
      } else if (t.includes('permohonan_kk')) {
        addField('Alasan Permohonan', 'textarea', 'Alasan Permohonan KK');
        addField('Jumlah Anggota', 'number', 'Jumlah Anggota Keluarga');
      } else if (t.includes('perubahan_kk')) {
        addField('Alasan Perubahan', 'textarea', 'Alasan Perubahan Data');
        addField('No KK Lama', 'text', 'Nomor KK Lama');
      } else if (t.includes('kurang_mampu') || t.includes('sktm') || t.includes('catatan_kriminal') || t.includes('skck')) {
        addField('Keperluan', 'textarea', 'Keperluan Surat');
      } else if (t.includes('kehilangan')) {
        addField('Barang Hilang', 'text', 'Barang / Dokumen Yang Hilang');
        addField('Rincian', 'textarea', 'Rincian / Ciri-ciri');
        addField('Tempat Hilang', 'text', 'Perkiraan Tempat Hilang');
        addField('Tgl Hilang', 'date', 'Perkiraan Tanggal Hilang');
      }
    }
    
    return fields;
}

export async function getSuratTasks(role: 'operator' | 'sekdes' | 'kades') {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("log_surat")
    .select(`
      *,
      surat_formats (nama),
      penduduk:id_pend (nama, nik)
    `)
    .order("tanggal", { ascending: false });

  // Filter based on role
  if (role === 'sekdes') {
    // Sekdes sees: Pending Sekdes (1) OR Returned from Kades (5)
    query = query.in('status', [SuratFlowStatus.PENDING_SEKDES, SuratFlowStatus.REJECTED_KADES]);
  } else if (role === 'kades') {
    // Kades sees: Pending Kades (2)
    query = query.eq('status', SuratFlowStatus.PENDING_KADES);
  } else {
    // Operator sees: Draft (0) OR Rejected Sekdes (4)
    // Or maybe everything? Let's limit to tasks needing attention
    query = query.in('status', [SuratFlowStatus.DRAFT, SuratFlowStatus.REJECTED_SEKDES]);
  }

  const { data, error } = await query;
  if (error) throw error;

  let tasks = data as SuratTask[];

  // Smart Filter for Operator: Hide Rejected tasks if a newer Signed task exists
  // This solves the issue where "Rejected" tasks linger even after the document has been re-submitted and signed.
  if (role === 'operator' && tasks.length > 0) {
      // Get list of relevant resident IDs
      const residentIds = tasks.map((t: any) => t.id_pend).filter(Boolean);
      
      if (residentIds.length > 0) {
          // Fetch signed documents for these residents
          const { data: signedDocs } = await supabase
              .from("log_surat")
              .select("id, id_pend, id_format_surat, status")
              .eq("status", SuratFlowStatus.SIGNED)
              .in("id_pend", residentIds);
              
          if (signedDocs && signedDocs.length > 0) {
              tasks = tasks.filter(task => {
                  // Always keep drafts
                  if (task.status === SuratFlowStatus.DRAFT) return true;
                  
                  // For rejected tasks, check if there's a newer signed doc
                  if (task.status === SuratFlowStatus.REJECTED_SEKDES) {
                      const taskPendId = (task as any).id_pend;
                      const taskFormatId = (task as any).id_format_surat;
                      
                      const hasNewerSigned = signedDocs.some(signed => 
                          signed.id_pend === taskPendId && 
                          signed.id_format_surat === taskFormatId &&
                          signed.id > task.id // Assuming higher ID is newer
                      );
                      
                      // If a newer signed document exists, hide this rejected task
                      return !hasNewerSigned;
                  }
                  
                  return true;
              });
          }
      }
  }

  return tasks;
}

export async function processSuratFlow(
  suratId: number, 
  action: 'submit' | 'approve' | 'reject' | 'sign',
  role: 'operator' | 'sekdes' | 'kades',
  comment?: string
) {
  const supabase = createSupabaseBrowserClient();
  
  // 1. Get current status
  const { data: surat, error: fetchError } = await supabase
    .from("log_surat")
    .select("status")
    .eq("id", suratId)
    .single();
    
  if (fetchError || !surat) throw new Error("Surat not found");

  const currentStatus = surat.status;
  let nextStatus = currentStatus;

  // 2. Determine next status
  if (role === 'operator' && action === 'submit') {
    if (currentStatus === SuratFlowStatus.DRAFT || currentStatus === SuratFlowStatus.REJECTED_SEKDES) {
      nextStatus = SuratFlowStatus.PENDING_SEKDES;
    }
  } else if (role === 'sekdes') {
    if (action === 'approve') nextStatus = SuratFlowStatus.PENDING_KADES;
    if (action === 'reject') nextStatus = SuratFlowStatus.REJECTED_SEKDES;
  } else if (role === 'kades') {
    if (action === 'sign') nextStatus = SuratFlowStatus.SIGNED;
    if (action === 'reject') nextStatus = SuratFlowStatus.REJECTED_KADES; // Returns to Sekdes
  }

  if (nextStatus === currentStatus && action !== 'reject') {
     // If status doesn't change and not rejecting (which might keep status same but adds log), throw?
     // Actually rejecting Kades -> Sekdes changes status 2 -> 5.
     // Rejecting Sekdes -> Operator changes status 1 -> 4.
     // So status usually changes.
  }

  // 3. Update Surat Status
  const { error: updateError } = await supabase
    .from("log_surat")
    .update({ status: nextStatus })
    .eq("id", suratId);

  if (updateError) throw updateError;

  // 4. Insert Log
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from("surat_flow_logs").insert({
    surat_id: suratId,
    user_id: user?.id,
    user_name: user?.user_metadata?.full_name || user?.email,
    role: role,
    action: action,
    status_from: currentStatus,
    status_to: nextStatus,
    comment: comment || ""
  });

  return { success: true, nextStatus };
}

export async function getFlowHistory(suratId: number) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("surat_flow_logs")
    .select("*")
    .eq("surat_id", suratId)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data as SuratFlowLog[];
}

export async function getSuratDetail(id: number) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("log_surat")
    .select(`
      *,
      surat_formats (*),
      penduduk:id_pend (*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSuratSignature(id: number, signatureData: any) {
  const supabase = createSupabaseBrowserClient();
  
  // First get existing form_data
  const { data: existing, error: fetchError } = await supabase
    .from("log_surat")
    .select("form_data")
    .eq("id", id)
    .single();
    
  if (fetchError) throw fetchError;
  
  const updatedFormData = {
    ...(existing?.form_data || {}),
    signature: signatureData
  };
  
  const { error } = await supabase
    .from("log_surat")
    .update({ 
        form_data: updatedFormData
    })
    .eq("id", id);

  if (error) throw error;
  return updatedFormData;
}

export async function updateSuratDocument(id: number, documentData: any) {
  const supabase = createSupabaseBrowserClient();
  
  // First get existing form_data
  const { data: existing, error: fetchError } = await supabase
    .from("log_surat")
    .select("form_data")
    .eq("id", id)
    .single();
    
  if (fetchError) throw fetchError;
  
  const updatedFormData = {
    ...(existing?.form_data || {}),
    uploaded_document: documentData
  };
  
  const { error } = await supabase
    .from("log_surat")
    .update({ 
        form_data: updatedFormData,
        signed_file_path: documentData.path
    })
    .eq("id", id);

  if (error) throw error;
  return updatedFormData;
}
