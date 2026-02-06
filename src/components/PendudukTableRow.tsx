import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Printer,
  Copy,
  Link as LinkIcon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PendudukRowProps {
  person: {
    // Identity
    nik: string;
    name: string;
    kk: string;
    relation: string;
    gender: string;
    birthplace: string;
    dob: string;
    age: string;
    religion: string;
    maritalStatus: string;
    nationality: string;
    statusPenduduk: string;
    
    // Additional Identity
    nama_desa?: string;
    nama_kecamatan?: string;
    nama_kabupaten?: string;
    nama_provinsi?: string;
    gelar_depan?: string;
    gelar_belakang?: string;
    waktu_lahir?: string;
    detail_tempat_lahir?: string;
    cara_lahir?: string;
    anak_ke?: number;
    berat_lahir?: string;
    panjang_lahir?: string;
    akta_kelahiran_nomor?: string;

    // Details
    bloodType: string;
    educationKK: string;
    educationCurrent: string;
    job: string;
    keahlian_khusus?: string;
    kepesertaan_asuransi?: string;
    cacat_fisik_mental?: string;
    sakit_menahun?: string;
    status_kehamilan?: string;
    status_ekonomi_dtks?: string;
    penghasilan_rata_rata?: string;
    kepemilikan_rumah?: string;
    sumber_air_minum?: string;

    // Parents
    fatherNik: string;
    fatherName: string;
    motherNik: string;
    motherName: string;

    // Location
    dusun: string;
    rt: string;
    rw: string;
    address: string;
    alamat_sebelumnya?: string;

    // Contact
    phone: string;
    email: string;
    akun_facebook?: string;
    akun_instagram?: string;
    akun_twitter?: string;
    id_sosial_lainnya?: string;

    // Documents
    passport: string;
    kitap: string;
    scan_ktp_url?: string;
    scan_kk_url?: string;
    scan_akta_lahir_url?: string;
    scan_akta_nikah_url?: string;
    scan_ijazah_url?: string;
    scan_paspor_url?: string;
    
    statusColor: "red" | "blue" | "emerald" | "gray";
  };
  rowNumber: number;
  onDetail: (nik: string) => void;
  onEdit: (nik: string) => void;
  onDelete: (nik: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export default function PendudukTableRow({
  person,
  rowNumber,
  onDetail,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: PendudukRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const renderCell = (content: string | number | undefined, isUppercase: boolean = false) => {
    let displayContent = content || "-";
    
    // Force casing logic if content is a string and not empty
    if (typeof displayContent === 'string' && displayContent !== "-") {
      if (isUppercase) {
        displayContent = displayContent.toUpperCase();
      } else {
        // Force Title Case for other fields
        displayContent = toTitleCase(displayContent);
      }
    }

    return (
      <td className={`px-3 py-3 whitespace-nowrap text-xs text-secondary-text border-r border-transparent last:border-r-0 ${isUppercase ? 'uppercase' : ''}`}>
        {displayContent}
      </td>
    );
  };

  const renderLink = (url: string | undefined, label: string) => (
    <td className="px-3 py-3 whitespace-nowrap text-xs text-secondary-text border-r border-transparent text-center">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center justify-center gap-1">
          <LinkIcon className="w-3 h-3" />
          {label}
        </a>
      ) : "-"}
    </td>
  );

  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 group">
      {/* Sticky Columns */}
      <td className="sticky left-0 bg-card-bg group-hover:bg-gray-50 px-3 py-3 text-center font-medium text-xs text-secondary-text border-r border-transparent w-[40px]">
        {rowNumber}
      </td>
      <td className="sticky left-[40px] bg-card-bg group-hover:bg-gray-50 px-3 py-3 font-medium text-xs text-primary-text border-r border-transparent w-[110px]">
        <span>{person.nik}</span>
      </td>
      <td className="sticky left-[150px] bg-card-bg group-hover:bg-gray-50 px-3 py-3 font-semibold text-xs text-primary-text border-r border-transparent shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)] w-[180px] uppercase">
        {person.name}
      </td>

      {/* Identity */}
      {renderCell(person.kk)}
      {renderCell(person.relation)}
      {renderCell(person.gender)}
      {renderCell(person.birthplace)}
      {renderCell(person.dob)}
      {renderCell(person.age ? `${person.age} Thn` : "-")}
      {renderCell(person.religion)}
      {renderCell(person.maritalStatus)}
      {renderCell(person.nationality, true)}
      
      {/* Additional Identity */}
      {renderCell(person.dusun, true)}
      {renderCell(person.nama_desa)}
      {renderCell(person.nama_kecamatan)}
      {renderCell(person.nama_kabupaten)}
      {renderCell(person.nama_provinsi)}
      {renderCell(person.akta_kelahiran_nomor)}

      {/* Status Badge */}
      <td className="px-3 py-3 whitespace-nowrap border-r border-slate-50">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border shadow-xs ${
            person.statusColor === "emerald"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : person.statusColor === "blue"
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : person.statusColor === "red"
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-gray-50 text-gray-600 border-gray-100"
          }`}
        >
          {person.statusPenduduk}
        </span>
      </td>

      {/* Details */}
      {renderCell(person.bloodType)}
      {renderCell(person.educationKK)}
      {renderCell(person.educationCurrent)}
      {renderCell(person.job)}

      {/* Parents */}
      {renderCell(person.fatherNik)}
      {renderCell(person.fatherName, true)}
      {renderCell(person.motherNik)}
      {renderCell(person.motherName, true)}

      {/* Location */}
      
      {/* Contact */}
      {renderCell(person.phone)}
      {renderCell(person.email)}

      {/* Actions Column */}
      <td className="sticky right-0 bg-card-bg px-2 py-1 text-center w-[40px] text-xs">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-hover-bg rounded-md transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card-bg border border-border-color rounded-md shadow-lg z-50 py-1 text-left">
              <button
                onClick={() => {
                  onDetail(person.nik);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text hover:text-primary-text hover:bg-hover-bg w-full text-left transition-colors"
              >
                <Eye className="h-3.5 w-3.5 text-secondary-text" />
                <span>Lihat Detail</span>
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit(person.nik);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text hover:text-primary-text hover:bg-hover-bg w-full text-left transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-secondary-text" />
                  <span>Ubah Data</span>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete(person.nik);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text hover:text-primary-text hover:bg-hover-bg w-full text-left transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                  <span>Hapus Data</span>
                </button>
              )}
              <button
                onClick={() => {
                  // Placeholder for Print
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text hover:text-primary-text hover:bg-hover-bg w-full text-left transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-secondary-text" />
                <span>Cetak Biodata</span>
              </button>
              <button
                onClick={() => {
                  // Placeholder for Copy
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text hover:text-primary-text hover:bg-hover-bg w-full text-left transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-secondary-text" />
                <span>Salin Data</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
