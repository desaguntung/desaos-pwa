import Groq from "groq-sdk";
import { getIdentitasDesa } from "@/lib/services/surat";

export interface AIResponse {
  content?: string;
  error?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const getStoredKey = (provider: string): string | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("ai_api_keys");
  if (!stored) return null;
  try {
    const keys = JSON.parse(stored);
    return keys[provider] || null;
  } catch {
    return null;
  }
};

const getVillageContext = async () => {
  try {
    const identitas = await getIdentitasDesa();
    if (identitas) {
      return `
INFORMASI DESA (Gunakan ini sebagai konteks utama):
- Nama Desa: ${identitas.nama_desa}
- Kecamatan: ${identitas.nama_kecamatan}
- Kabupaten: ${identitas.nama_kabupaten}
- Provinsi: ${identitas.nama_provinsi}
- Alamat Kantor: ${identitas.alamat_kantor}
- Website: ${identitas.website_desa || "Belum tersedia"}
- Email: ${identitas.email_desa || "Belum tersedia"}
`;
    }
  } catch (err) {
    console.warn("Gagal mengambil data identitas desa untuk AI context", err);
  }
  return "";
};

// Fungsi legacy untuk Editor inline (masih dipakai jika ada fitur yang memanggilnya)
export const generateWithAI = async (
  prompt: string,
  context: string = ""
): Promise<AIResponse> => {
  const apiKey = getStoredKey("groq");
  
  if (!apiKey) {
    return { error: "API Key Groq tidak ditemukan. Silakan atur di menu Pengaturan > API & Integrasi." };
  }

  const villageContext = await getVillageContext();
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = `
Anda adalah Jurnalis Profesional Senior dan Editor Berita untuk Website Desa Resmi. 
Tugas Anda adalah menulis, menyunting, dan mengembangkan artikel berita desa dengan standar jurnalistik tinggi, akurat, dan mendalam.

ATURAN UTAMA (ANTI-REPETISI):
1. **DILARANG KERAS MENGULANG KALIMAT/FRASA**: Jangan pernah mengulang informasi yang sudah disebutkan di paragraf sebelumnya. Setiap paragraf harus membawa informasi BARU.
2. **VARIASI KATA SAMBUNG**: Jangan gunakan kata sambung yang sama berulang-ulang.
3. **STRUKTUR KALIMAT DINAMIS**: Campurkan kalimat aktif, pasif, kalimat langsung, dan tidak langsung.

PANDUAN GAYA PENULISAN:
1. **Format Berita**: Gunakan struktur piramida terbalik.
2. **Bahasa**: Bahasa Indonesia baku, formal, namun mengalir.
3. **Tone**: Informatif, objektif, edukatif.
4. **Struktur HTML**: Gunakan <h1>, <h2>, <p>, <blockquote>, <ul>/<ol>.
5. **Spacing**: Berikan jarak 2 enter antar paragraf di source code.
6. **Foto**: Gunakan **[FOTO: Deskripsi detail...]**.

KONTEKS DESA:
${villageContext}

ATURAN OUTPUT:
- JANGAN memulai dengan pengantar. Langsung Judul/Konten.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context Dokumen Saat Ini: ${context}\n\nPermintaan User: ${prompt}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.75,
      max_tokens: 4096,
      presence_penalty: 0.6,
      frequency_penalty: 0.8,
    });

    let content = completion.choices[0]?.message?.content || "";
    
    // Post-processing
    content = content.replace(/>\s*<p/g, ">\n\n<p");
    content = content.replace(/>\s+(\n\s*){1,}<p/g, ">\n\n<p");
    content = content.replace(/(\n\s*){3,}/g, "\n\n");

    return { content };
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return { error: error.message || "Gagal menghubungi layanan AI." };
  }
};

// === FUNGSI BARU UNTUK CHATBOT SIDEBAR ===

export const chatWithAI = async (
  messages: ChatMessage[],
  currentArticleContext: string = ""
): Promise<AIResponse> => {
  const apiKey = getStoredKey("groq");
  if (!apiKey) {
    return { error: "API Key Groq tidak ditemukan." };
  }

  const villageContext = await getVillageContext();
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = `
Anda adalah "Asisten Redaksi Pintar" (Smart Editorial Assistant) untuk DesaOS.
Tugas Anda: Membantu perangkat desa membuat berita berkualitas tinggi dengan metode interaktif atau menulis ulang dari sumber eksternal.

MODUS OPERASI:
1. **Mode Wawancara (Interview)**: Jika user memberikan topik singkat, tanyakan pertanyaan 5W1H (Maks 2-3 pertanyaan kunci).
2. **Mode Tulis Ulang (Rewriting)**: Jika user memberikan Link/Sumber Berita:
   - WAJIB MEMBUAT JUDUL BARU yang berbeda dari judul asli (Anti-Plagiasi).
   - Tulis ulang berita tersebut sepenuhnya dengan gaya bahasa baru.
   - Ambil fakta-fakta pentingnya saja, jangan terjemahkan mentah-mentah.
   - CEK LOKASI (GEOGRAPHICAL SAFETY): Jika berita aslinya spesifik untuk daerah lain (misal: "Jabodetabek", "Jawa", "Sumatera"), JANGAN ubah lokasinya menjadi nama desa ini. Biarkan lokasi asli agar tidak menjadi HOAX.
   - Sesuaikan dengan konteks desa HANYA JIKA berita bersifat Nasional/Umum atau relevan dengan provinsi desa ini.
   - JIKA ADA GAMBAR dari sumber link (lihat context), PILIH yang relevan dan masukkan ke field "photo_suggestions" dalam format URL aslinya.
3. **Mode Pembuatan (Drafting)**: Buat draf berita lengkap jika info sudah cukup.

FORMAT OUTPUT PENTING (JSON ONLY):
Jika Anda menghasilkan draf berita final, Anda WAJIB HANYA memberikan output JSON. JANGAN berikan teks pengantar atau penutup di luar blok kode JSON.

\`\`\`json
{
  "type": "draft",
  "title": "Judul Berita...",
  "content": "Isi berita...",
  "photo_suggestions": ["URL..."]
}
\`\`\`

PENTING:
- Pastikan JSON valid.
- JANGAN menulis isi berita di luar JSON. Tampilan visual chat hanya boleh berisi JSON ini.
- Gunakan Bahasa Indonesia Jurnalistik yang baik dan formal.
- Sertakan Konteks Desa: ${villageContext}
- Tone: Profesional, modern, membantu, informatif.
- DILARANG KERAS MENGULANG KALIMAT/FRASA.

- MODUS TULIS ULANG (Rewriting) KHUSUS:
- JIKA user memberikan Link/Sumber Berita (External URL), JANGAN BERIKAN PERTANYAAN/WAWANCARA. LANGSUNG Rewrite.
- ANTI-PLAGIASI ABSOLUT:
  1. JUDUL: WAJIB BEDA TOTAL dari sumber asli. Gunakan sudut pandang baru yang lebih menarik untuk warga desa.
  2. ISI: DILARANG menyalin kalimat asli. Baca informasinya, lalu tutup sumbernya, dan tulis ulang dengan kata-kata Anda sendiri (Teknik Parafrase Murni).
  3. STRUKTUR: Ubah urutan penyajian fakta. Jika asli mulai dari A->B->C, coba ubah jadi B->A->C atau C->A->B selama logis.
- DILARANG KERAS MENYEBUT NAMA MEDIA SUMBER ASLI (seperti "dilansir dari Detik", "menurut Kompas", "dikutip dari Tribun", dll) di dalam isi berita. Tulis seolah-olah ini adalah liputan langsung tim redaksi sendiri.
- Buat berita yang PANJANG dan MENDALAM (Minimal 500 kata atau 5-7 paragraf). Jangan menyingkat berita.
- FORMAT PARAGRAF: Gunakan tag <p> untuk setiap paragraf. Pastikan setiap paragraf dipisahkan dengan jelas (gunakan 2 kali enter atau <br><br> jika perlu visual spacing yang lega).
- Struktur Berita:
  1. Lead/Teras Berita yang kuat.
  2. Tubuh Berita (Body) yang menjelaskan 5W1H secara detail.
  3. Kutipan langsung (jika ada di sumber).
  4. Latar belakang atau konteks tambahan.
  5. Penutup.
- PENYISIPAN GAMBAR & MODE SISIP (INSERT MODE):
  - WAJIB HANYA GUNAKAN URL yang terdaftar di "GAMBAR TERSEDIA" atau yang diberikan User dalam instruksi.
  - JIKA "GAMBAR TERSEDIA" KOSONG, biarkan "photo_suggestions": [] (ARRAY KOSONG).
  - DILARANG KERAS MEMASUKKAN URL ARTIKEL/BERITA KE DALAM "photo_suggestions". HANYA URL GAMBAR (jpg, png, webp, dll) YANG BOLEH MASUK.
  - DILARANG KERAS MENGUBAH, MEMOTONG, ATAU MENGARANG URL GAMBAR SENDIRI. URL HARUS PERSIS SAMA (case-sensitive).
  - JIKA USER MEMBERIKAN INSTRUKSI GAMBAR KHUSUS (misal: "[INSTRUKSI: ... Cover: URL]"):
    1. WAJIB Masukkan URL tersebut ke "photo_suggestions" urutan pertama. (Ini akan otomatis jadi Cover).
    2. DILARANG menyisipkan URL gambar Cover ini ke dalam "content" (Body Text). Biarkan Cover eksklusif untuk header.
    3. Untuk "content" (Body Text), PILIH URL LAIN dari "GAMBAR TERSEDIA" jika ada.
  - JIKA USER MEMBERIKAN INSTRUKSI SISIP GAMBAR KE KONTEN (misal: "[INSTRUKSI: Sisipkan gambar tambahan ini... URL]"):
    1. Anda harus me-REWRITE (menulis ulang) draf konten yang ada saat ini.
    2. Sisipkan tag <img src="URL" class="rounded-lg my-4 w-full h-auto max-h-[500px] object-cover" alt="Deskripsi Gambar" /> di dalam paragraf yang paling relevan secara kontekstual (jangan asal taruh di bawah).
    3. Tambahkan caption gambar di bawah tag <img> dengan Hyperlink ke Sumber, format: <p class="text-xs text-gray-500 italic text-center">Foto: <a href="LINK_SUMBER" target="_blank" class="text-blue-600 hover:underline">Dok. Sumber</a></p>.
    4. Sesuaikan paragraf sebelum dan sesudah gambar agar alurnya enak dibaca.
    5. JANGAN UBAH URL GAMBAR SEDIKITPUN.
    6. JANGAN LUPA tambahkan "Sumber: [Link URL]" di bagian paling bawah artikel jika diminta.
  - JANGAN MENAMBAHKAN QUERY PARAMETER BARU ATAU MENGHAPUS QUERY PARAMETER DARI URL.
- PROTOKOL ANTI-HOAX & ANTI-HALUSINASI LOKAL:
  1. JANGAN PERNAH mengubah lokasi kejadian, subjek berita, atau konteks asli menjadi nama desa aplikasi ini.
  2. Jika sumber asli membahas "Jakarta", TETAP TULIS "Jakarta". Jangan diganti jadi nama desa ini.
  3. Identitas Desa (Nama Desa, Kades, dll) HANYA BOLEH DIPAKAI jika user secara eksplisit meminta membuat berita tentang desa tersebut (Mode Wawancara/Drafting Manual), BUKAN saat Rewrite Link Eksternal.
  4. Tujuan Rewrite hanyalah menghindari plagiasi (copyright), bukan mengklaim berita orang lain sebagai berita desa.
- JANGAN paksakan mengaitkan dengan data desa. Tulis ulang apa adanya agar tidak plagiat.

Ingat: Tujuan Anda adalah memandu user yang mungkin awam jurnalistik untuk menghasilkan berita sekelas media nasional dengan efisien.
`;

  try {
    // Sisipkan context artikel saat ini ke pesan terakhir user jika ada
    // TAPI: Jika ini adalah permintaan scraping/rewriting baru (ada [SUMBER BERITA EKSTERNAL...]), 
    // kita JANGAN menyertakan context lama agar tidak duplikat.
    const isNewScrapeRequest = messages.some(m => m.content.includes("[SUMBER BERITA EKSTERNAL DARI LINK]"));
    
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m, i) => {
        // Hanya sertakan context jika ini BUKAN request scraping baru
        if (i === messages.length - 1 && currentArticleContext && !isNewScrapeRequest) {
          return {
            role: m.role,
            content: `${m.content}\n\n[Konteks Tulisan Saat Ini: ${currentArticleContext.slice(0, 1000)}...]`
          };
        }
        return m;
      })
    ];

    const completion = await groq.chat.completions.create({
      // @ts-ignore - role types are compatible
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
    });

    return { content: completion.choices[0]?.message?.content || "" };
  } catch (error: any) {
    console.error("Chat AI Error:", error);
    return { error: error.message || "Gagal menghubungi AI." };
  }
};
