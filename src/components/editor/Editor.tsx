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

export const getTemplateKeyFromType = (type?: string, name?: string): string => {
  const combined = `${type || ""} ${name || ""}`.toLowerCase().replace(/[\s\-_/]+/g, "_");
  if (!combined.trim()) return "standard";
  
  // Specific checks first (Longer strings that contain substrings of others)
  if (combined.includes("domisili_usaha_non_warga")) return "domisili_usaha_non_warga";
  if (combined.includes("domisili_usaha")) return "domisili_usaha";
  if (combined.includes("domisili")) return "domisili";

  if (combined.includes("nikah_non_muslim")) return "nikah_non_muslim";
  if (combined.includes("nikah")) return "nikah";

  if (combined.includes("penghasilan_ayah")) return "penghasilan_ayah";
  if (combined.includes("penghasilan_ibu")) return "penghasilan_ibu";
  if (combined.includes("penghasilan_orangtua") || combined.includes("penghasilan_ortu")) return "penghasilan_orangtua";
  if (combined.includes("penghasilan")) return "penghasilan";

  if (combined.includes("perubahan_kartu_keluarga") || combined.includes("perubahan_kk")) return "perubahan_kk";
  if (combined.includes("kartu_keluarga") || combined.includes("permohonan_kk")) return "permohonan_kk";

  // Standard checks
  if (combined.includes("ket_usaha") || combined.includes("keterangan_usaha") || combined.includes("usaha")) return "ket_usaha";
  if (combined.includes("bio_penduduk") || combined.includes("biodata")) return "bio_penduduk";
  if (combined.includes("beda_identitas") || combined.includes("kis")) return "beda_identitas_kis";
  if (combined.includes("jalan") || combined.includes("bepergian") || combined.includes("berpergian")) return "jalan";
  if (combined.includes("izin_orangtua") || combined.includes("izin_orang_tua")) return "izin_orangtua";
  if (combined.includes("keramaian")) return "keramaian";
  if (combined.includes("beda_nama")) return "beda_nama";
  if (combined.includes("catatan_kriminal") || combined.includes("skck")) return "catatan_kriminal";
  if (combined.includes("jamkesos")) return "jamkesos";
  if (combined.includes("jual_beli")) return "jual_beli";
  if (combined.includes("kehilangan")) return "kehilangan";
  if (combined.includes("kelahiran") && !combined.includes("duplikat") && !combined.includes("lahir_mati")) return "kelahiran";
  if (combined.includes("kematian")) return "kematian";
  if (combined.includes("kendaraan")) return "kendaraan";
  if (combined.includes("kepemilikan_tanah") || combined.includes("tanah")) return "kepemilikan_tanah";
  if (combined.includes("ktp_dalam_proses")) return "ktp_dalam_proses";
  if (combined.includes("kurang_mampu") || combined.includes("sktm")) return "kurang_mampu";
  if (combined.includes("janda") || combined.includes("duda")) return "janda";
  if (combined.includes("lahir_mati")) return "lahir_mati";
  if (combined.includes("ket_penduduk") || combined.includes("keterangan_penduduk")) return "ket_penduduk";
  if (combined.includes("pengantar")) return "pengantar";
  if (combined.includes("pergi_kawin")) return "pergi_kawin";
  if (combined.includes("pindah")) return "pindah";
  if (combined.includes("rujuk_cerai") || combined.includes("rujuk")) return "rujuk_cerai";
  if (combined.includes("wali_hakim")) return "wali_hakim";
  if (combined.includes("kuasa")) return "kuasa";
  if (combined.includes("perjalanan_dinas") || combined.includes("sppd")) return "perjalanan_dinas";
  if (combined.includes("permohonan_akta")) return "permohonan_akta";
  if (combined.includes("cerai")) return "cerai";
  if (combined.includes("duplikat_kelahiran")) return "duplikat_kelahiran";
  if (combined.includes("duplikat_nikah")) return "duplikat_nikah";
  if (combined.includes("pas_lintas")) return "pas_lintas";
  if (combined.includes("pernyataan_akta")) return "pernyataan_akta";
  if (combined.includes("sporadik")) return "sporadik";
  
  return "standard";
};

const EditorContent = ({ initialJson, letterType, letterName, id, onSave, previewData, readOnly, hideHeaderNavigation }: EditorProps) => {
  const { actions, query, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
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

    if (!content) {
      content = (
        <Element is={Page} canvas>
          <KopSurat />
          <div className="h-4"></div>
          <Element id="judul_standard_fb" is={Text} text="SURAT KETERANGAN" fontSize="16" textAlign="center" bold={true} />
          <Element id="nomor_standard_fb" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
          <div className="h-6"></div>
          <OpeningText />
          <CommonPendudukData />
          <ClosingText />
          <Signature />
        </Element>
      );
    }

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
    let hasValidJson = false;
    if (initialJson && typeof initialJson === 'string' && initialJson.trim().startsWith('{')) {
      try {
        actions.deserialize(initialJson);
        hasValidJson = true;
      } catch (e) {
        console.error("Error loading initial JSON:", e);
      }
    }

    if (!hasValidJson) {
      const templateKey = getTemplateKeyFromType(letterType, letterName);
      loadTemplate(templateKey);
    }
  }, [initialJson, letterType, letterName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SuratContext.Provider value={contextValue}>
      <div className={`h-full flex flex-col overflow-hidden ${readOnly ? 'bg-transparent' : 'bg-zinc-50'}`}>
        {!hideHeaderNavigation && (
          <Header onSave={onSave} zoom={zoom} setZoom={setZoom} readOnly={readOnly} hideNavigation={hideHeaderNavigation} />
        )}
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Toolbox */}
          {enabled && <Toolbox />}

          {/* Center: Canvas */}
          <div className={`flex-1 flex flex-col relative transition-all ${readOnly ? 'bg-transparent' : 'bg-zinc-100/50'}`}>
            <div className={`flex-1 flex justify-center ${readOnly ? 'p-0 overflow-visible' : 'overflow-auto custom-scrollbar p-8'}`}>
               <div 
                 className={`transition-transform duration-200 ease-out origin-top flex flex-col items-center ${readOnly ? 'p-0 pb-0' : 'pb-20'}`}
                 style={{ 
                   transform: !readOnly ? `scale(${zoom / 100})` : undefined,
                   marginBottom: (!readOnly && zoom > 100) ? `${(zoom - 100) * 4}mm` : 0
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
