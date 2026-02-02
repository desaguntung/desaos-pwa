"use client";

import { useEditor, Element, Frame, Editor as CraftEditor } from "@craftjs/core";
import { useEffect, useState } from "react";
import { Container } from "@/components/editor/nodes/Container";
import { Text } from "@/components/editor/nodes/Text";
import { Variable } from "@/components/editor/nodes/Variable";
import { Input } from "@/components/editor/nodes/Input";
import { Row } from "@/components/editor/nodes/Row";
import { Page } from "@/components/editor/nodes/Page";
import { KopSurat } from "@/components/editor/nodes/KopSurat";
import { Signature } from "@/components/editor/nodes/Signature";
import { DataRow } from "@/components/editor/nodes/DataRow";
import { Table } from "@/components/editor/nodes/Table";
import { LandSketch } from "@/components/editor/nodes/LandSketch";
import { LandBoundaries } from "@/components/editor/nodes/LandBoundaries";
import { FooterBSrE } from "@/components/editor/nodes/FooterBSrE";
import { FooterArea } from "@/components/editor/nodes/FooterArea";

import { SuratContext } from "@/lib/contexts/SuratContext";

import { OpeningText, ClosingText, CommonPendudukData } from "@/components/editor/LegacyComponents";
import { loadTemplatePart2 } from "@/components/editor/part2";
import { loadTemplatePart3 } from "@/components/editor/part3";
import { loadTemplatePart4 } from "@/components/editor/part4";
import { loadTemplatePart5 } from "@/components/editor/part5";
import { loadTemplatePart6 } from "@/components/editor/part6";
import { loadTemplatePart7 } from "@/components/editor/part7";

import { Header } from "@/components/editor/Header";
import { Toolbox } from "@/components/editor/Toolbox";
import { SettingsPanel } from "@/components/editor/SettingsPanel";

type EditorProps = {
  initialJson?: string;
  letterType?: string;
  letterName?: string;
  id?: string;
  onSave?: (json: string) => void;
  previewData?: any;
  readOnly?: boolean;
  hideHeaderNavigation?: boolean;
};

export const templates = [
  { key: "blank", label: "Blank Template", desc: "Start from scratch", color: "gray" },
  { key: "standard", label: "Standard Format", desc: "Standard letter format", color: "blue" },
  { key: "ket_usaha", label: "Ket. Usaha", desc: "Keterangan usaha", color: "green" },
  { key: "domisili", label: "Ket. Domisili", desc: "Keterangan domisili", color: "yellow" },
  { key: "penghasilan", label: "Ket. Penghasilan", desc: "Keterangan penghasilan", color: "purple" },
  { key: "bio_penduduk", label: "Biodata Penduduk", desc: "Biodata penduduk", color: "pink" },
  { key: "beda_identitas_kis", label: "Beda Identitas KIS", desc: "Beda identitas KIS", color: "indigo" },
  { key: "jalan", label: "Ket. Jalan", desc: "Keterangan jalan", color: "red" },
  { key: "izin_orangtua", label: "Izin Orang Tua", desc: "Izin orang tua", color: "teal" },
  { key: "keramaian", label: "Izin Keramaian", desc: "Izin keramaian", color: "orange" },
  { key: "beda_nama", label: "Ket. Beda Nama", desc: "Beda nama", color: "cyan" },
  { key: "catatan_kriminal", label: "SKCK", desc: "Catatan kriminal", color: "lime" },
  { key: "domisili_usaha", label: "Domisili Usaha", desc: "Domisili usaha", color: "emerald" },
  { key: "jamkesos", label: "Ket. Jamkesos", desc: "Keterangan jamkesos", color: "fuchsia" },
  { key: "jual_beli", label: "Ket. Jual Beli", desc: "Jual beli", color: "rose" },
  { key: "kehilangan", label: "Ket. Kehilangan", desc: "Kehilangan", color: "sky" },
  { key: "kelahiran", label: "Ket. Kelahiran", desc: "Kelahiran", color: "amber" },
  { key: "kematian", label: "Ket. Kematian", desc: "Kematian", color: "stone" },
  { key: "kendaraan", label: "Ket. Kendaraan", desc: "Kepemilikan kendaraan", color: "neutral" },
  { key: "kepemilikan_tanah", label: "Kepemilikan Tanah", desc: "Kepemilikan tanah", color: "zinc" },
  { key: "ktp_dalam_proses", label: "KTP Dalam Proses", desc: "Keterangan KTP", color: "blue" },
  { key: "kurang_mampu", label: "Ket. Kurang Mampu", desc: "SKTM", color: "orange" },
  { key: "janda", label: "Ket. Janda/Duda", desc: "Keterangan janda/duda", color: "slate" },
  { key: "lahir_mati", label: "Ket. Lahir Mati", desc: "Keterangan lahir mati", color: "gray" },
  { key: "nikah", label: "Ket. Nikah", desc: "Keterangan nikah", color: "red" },
  { key: "nikah_non_muslim", label: "Nikah Non Muslim", desc: "Nikah non muslim", color: "green" },
  { key: "ket_penduduk", label: "Ket. Penduduk", desc: "Keterangan penduduk", color: "yellow" },
  { key: "pengantar", label: "Surat Pengantar", desc: "Surat pengantar", color: "purple" },
  { key: "penghasilan_ayah", label: "Penghasilan Ayah", desc: "Penghasilan ayah", color: "pink" },
  { key: "penghasilan_ibu", label: "Penghasilan Ibu", desc: "Penghasilan ibu", color: "indigo" },
  { key: "penghasilan_orangtua", label: "Penghasilan Ortu", desc: "Penghasilan orang tua", color: "teal" },
  { key: "pergi_kawin", label: "Pergi Kawin", desc: "Pergi kawin", color: "cyan" },
  { key: "pindah", label: "Pindah Penduduk", desc: "Pindah penduduk", color: "lime" },
  { key: "rujuk_cerai", label: "Rujuk/Cerai", desc: "Rujuk atau cerai", color: "emerald" },
  { key: "wali_hakim", label: "Wali Hakim", desc: "Wali hakim", color: "fuchsia" },
  { key: "kuasa", label: "Surat Kuasa", desc: "Surat kuasa", color: "rose" },
  { key: "perjalanan_dinas", label: "Perjalanan Dinas", desc: "Perjalanan dinas", color: "sky" },
  { key: "permohonan_akta", label: "Permohonan Akta", desc: "Permohonan akta", color: "amber" },
  { key: "cerai", label: "Permohonan Cerai", desc: "Permohonan cerai", color: "stone" },
  { key: "duplikat_kelahiran", label: "Duplikat Kelahiran", desc: "Duplikat kelahiran", color: "neutral" },
  { key: "duplikat_nikah", label: "Duplikat Nikah", desc: "Duplikat nikah", color: "zinc" },
  { key: "permohonan_kk", label: "Permohonan KK", desc: "Permohonan KK", color: "blue" },
  { key: "pas_lintas", label: "Pas Lintas", desc: "Pas lintas", color: "orange" },
  { key: "perubahan_kk", label: "Perubahan KK", desc: "Perubahan KK", color: "slate" },
  { key: "pernyataan_akta", label: "Pernyataan Akta", desc: "Pernyataan akta", color: "gray" },
  { key: "sporadik", label: "Sporadik", desc: "Sporadik", color: "red" },
  { key: "domisili_usaha_non_warga", label: "Domisili Usaha Non Warga", desc: "Domisili usaha non warga", color: "green" }
];

export const getTemplateKeyFromType = (type: string): string => {
  if (!type) return "blank";
  
  // Specific checks first (Longer strings that contain substrings of others)
  if (type.includes("surat_ket_domisili_usaha_non_warga") || type.includes("surat_domisili_usaha_non_warga")) return "domisili_usaha_non_warga";
  if (type.includes("surat_ket_domisili_usaha")) return "domisili_usaha";
  if (type.includes("surat_ket_domisili")) return "domisili";

  if (type.includes("surat_ket_nikah_non_muslim")) return "nikah_non_muslim";
  if (type.includes("surat_ket_nikah")) return "nikah";

  if (type.includes("surat_ket_penghasilan_ayah")) return "penghasilan_ayah";
  if (type.includes("surat_ket_penghasilan_ibu")) return "penghasilan_ibu";
  if (type.includes("surat_ket_penghasilan_orangtua")) return "penghasilan_orangtua";
  if (type.includes("surat_ket_penghasilan")) return "penghasilan";

  if (type.includes("surat_permohonan_perubahan_kartu_keluarga")) return "perubahan_kk";
  if (type.includes("surat_permohonan_kartu_keluarga")) return "permohonan_kk";

  // Standard checks
  if (type.includes("surat_ket_usaha")) return "ket_usaha";
  if (type.includes("surat_bio_penduduk")) return "bio_penduduk";
  if (type.includes("surat_ket_beda_identitas_kis")) return "beda_identitas_kis";
  if (type.includes("surat_jalan")) return "jalan";
  if (type.includes("surat_izin_orangtua_suami_istri")) return "izin_orangtua";
  if (type.includes("surat_izin_keramaian")) return "keramaian";
  if (type.includes("surat_ket_beda_nama")) return "beda_nama";
  if (type.includes("surat_ket_catatan_kriminal")) return "catatan_kriminal";
  if (type.includes("surat_ket_jamkesos")) return "jamkesos";
  if (type.includes("surat_ket_jual_beli")) return "jual_beli";
  if (type.includes("surat_ket_kehilangan")) return "kehilangan";
  if (type.includes("surat_ket_kelahiran")) return "kelahiran";
  if (type.includes("surat_ket_kematian")) return "kematian";
  if (type.includes("surat_ket_kepemilikan_kendaraan")) return "kendaraan";
  if (type.includes("surat_ket_kepemilikan_tanah")) return "kepemilikan_tanah";
  if (type.includes("surat_ket_ktp_dalam_proses")) return "ktp_dalam_proses";
  if (type.includes("surat_ket_kurang_mampu")) return "kurang_mampu";
  if (type.includes("surat_ket_janda")) return "janda";
  if (type.includes("surat_ket_lahir_mati")) return "lahir_mati";
  if (type.includes("surat_ket_penduduk")) return "ket_penduduk";
  if (type.includes("surat_ket_pengantar")) return "pengantar";
  if (type.includes("surat_ket_pergi_kawin")) return "pergi_kawin";
  if (type.includes("surat_ket_pindah_penduduk")) return "pindah";
  if (type.includes("surat_ket_rujuk_cerai")) return "rujuk_cerai";
  if (type.includes("surat_ket_wali_hakim")) return "wali_hakim";
  if (type.includes("surat_kuasa")) return "kuasa";
  if (type.includes("surat_perjalanan_dinas")) return "perjalanan_dinas";
  if (type.includes("surat_permohonan_akta")) return "permohonan_akta";
  if (type.includes("surat_permohonan_cerai")) return "cerai";
  if (type.includes("surat_permohonan_duplikat_kelahiran")) return "duplikat_kelahiran";
  if (type.includes("surat_permohonan_duplikat_surat_nikah")) return "duplikat_nikah";
  if (type.includes("surat_permohonan_pas_lintas")) return "pas_lintas";
  if (type.includes("surat_pernyataan_akta")) return "pernyataan_akta";
  if (type.includes("surat_sporadik")) return "sporadik";
  
  return "blank";
};

const EditorContent = ({ initialJson, letterType, letterName, id, onSave, previewData, readOnly, hideHeaderNavigation }: EditorProps) => {
  const { actions, query, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [zoom, setZoom] = useState(100);

  // Construct context value
  const contextValue = {
    mode: (readOnly || previewData) ? 'preview' : 'edit' as 'preview' | 'edit',
    data: previewData || {}
  };

  const loadTemplate = (type: string) => {
    let content = null;
    if (type === "standard") {
      content = (
        <Element is={Page} canvas>
          <KopSurat />
          <div className="h-4"></div>
          <Element id="judul_standard" is={Text} text="SURAT KETERANGAN" fontSize="16" textAlign="center" bold={true} />
          <Element id="nomor_standard" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
          <div className="h-6"></div>
          <OpeningText />
          <CommonPendudukData />
          <ClosingText />
          <Signature />
        </Element>
      );
    }

    if (!content) content = loadTemplatePart2(type);
    if (!content) content = loadTemplatePart3(type);
    if (!content) content = loadTemplatePart4(type);
    if (!content) content = loadTemplatePart5(type);
    if (!content) content = loadTemplatePart6(type);
    if (!content) content = loadTemplatePart7(type);

    if (content) {
      // Wrap content in Root Container
      const wrappedContent = (
        <Element
          is={Container}
          canvas
          width="100%"
          height="auto"
          background="transparent"
          padding="0"
          flexDirection="column"
          alignItems="center"
        >
          {content}
        </Element>
      );

      try {
        const tree = query.parseReactElement(wrappedContent).toNodeTree();
        actions.deserialize(tree.nodes as any);
        setSelectedTemplate(type);
      } catch (e) {
        console.error("Error loading template:", e);
      }
    }
  };

  useEffect(() => {
    if (initialJson) {
      try {
        actions.deserialize(initialJson);
      } catch (e) {
        console.error("Error loading initial JSON:", e);
      }
    } else if (letterType) {
       const templateKey = getTemplateKeyFromType(letterType);
       if (templateKey && templateKey !== "blank") {
          loadTemplate(templateKey);
       } else {
          // Default/Blank template
          const defaultContent = (
            <Element
              is={Container}
              canvas
              width="100%"
              height="auto"
              background="transparent"
              padding="0"
              flexDirection="column"
              alignItems="center"
            >
              <Element is={Page} canvas>
                 <KopSurat />
                 <div className="h-20"></div>
                 <Text text="Klik tombol 'Edit' untuk mulai membuat surat." fontSize="14" textAlign="center" />
              </Element>
            </Element>
          );
          
          try {
             // @ts-ignore - React 19 compatibility
             const tree = query.parseReactElement(defaultContent).toNodeTree();
             actions.deserialize(tree.nodes as any);
          } catch (e) {
             console.error("Error loading default content:", e);
          }
       }
    } else {
        // Fallback if no letterType (e.g. direct create)
        const defaultContent = (
            <Element
              is={Container}
              canvas
              width="100%"
              height="auto"
              background="transparent"
              padding="0"
              flexDirection="column"
              alignItems="center"
            >
              <Element is={Page} canvas>
                 <KopSurat />
                 <div className="h-20"></div>
                 <Text text="Klik tombol 'Edit' untuk mulai membuat surat." fontSize="14" textAlign="center" />
              </Element>
            </Element>
          );
          
          try {
             // @ts-ignore - React 19 compatibility
             const tree = query.parseReactElement(defaultContent).toNodeTree();
             actions.deserialize(tree.nodes as any);
          } catch (e) {
             console.error("Error loading default content:", e);
          }
    }
  }, [initialJson, letterType]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SuratContext.Provider value={contextValue}>
      <div className={`h-full flex flex-col overflow-hidden ${readOnly ? 'bg-transparent' : 'bg-zinc-50'}`}>
        <Header onSave={onSave} zoom={zoom} setZoom={setZoom} readOnly={readOnly} hideNavigation={hideHeaderNavigation} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Toolbox */}
          {enabled && <Toolbox />}

          {/* Center: Canvas */}
          <div className={`flex-1 flex flex-col relative transition-all ${readOnly ? 'bg-transparent' : 'bg-zinc-100/50'}`}>
            <div className={`flex-1 overflow-auto flex justify-center custom-scrollbar ${readOnly ? 'py-10' : 'p-8'}`}>
               <div 
                 className={`transition-transform duration-200 ease-out origin-top flex flex-col items-center ${readOnly ? 'pb-10' : 'pb-20'}`}
                 style={{ 
                   transform: `scale(${zoom / 100})`,
                   marginBottom: `${(zoom > 100 ? (zoom - 100) * 4 : 0)}mm` // Add extra space at bottom when zoomed in
                 }}
               >
                 <Frame />
               </div>
            </div>
          </div>

          {/* Right: Settings */}
          {enabled && !readOnly && <SettingsPanel />}
        </div>
      </div>
    </SuratContext.Provider>
  );
};

export const Editor = (props: EditorProps) => {
  return (
    <CraftEditor
      enabled={!props.readOnly}
      resolver={{
        Container,
        Text,
        Variable,
        Input,
        Row,
        Page,
        KopSurat,
        Signature,
        DataRow,
        Table,
        LandSketch,
        LandBoundaries,
        FooterBSrE,
        FooterArea,
        OpeningText,
        ClosingText,
        CommonPendudukData,
      }}
    >
      <EditorContent {...props} />
    </CraftEditor>
  );
};

export default Editor;
