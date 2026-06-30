/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  UserPlus, 
  X, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  RefreshCw,
  Phone,
  Mail,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Check,
  AlertTriangle
} from "lucide-react";
import { Pegawai, KepegawaianType } from "../types";
import * as XLSX from "xlsx";
import { getSalaryByGolonganAndMasaKerja } from "../utils/salaryTable";

// Helper to determine if a pegawai profile is complete and ready to print
const isDataLengkap = (peg: Pegawai): { valid: boolean; missingFields: string[] } => {
  const missing: string[] = [];
  if (!peg.nama?.trim()) missing.push("Nama Lengkap");
  if (!peg.nip?.trim() || peg.nip.trim().length < 5) missing.push("NIP");
  if (!peg.tempatLahir?.trim()) missing.push("Tempat Lahir");
  if (!peg.tanggalLahir?.trim()) missing.push("Tanggal Lahir");
  if (!peg.pangkatGolongan?.trim()) missing.push("Pangkat/Golongan");
  if (!peg.jabatan?.trim()) missing.push("Jabatan");
  if (!peg.unitKerja?.trim()) missing.push("Unit Kerja");
  if (!peg.gajiPokokLama) missing.push("Gaji Pokok Lama");
  
  if (!peg.skOlehPejabat?.trim()) missing.push("Pejabat Pengesah SK Lama");
  if (!peg.skNomor?.trim()) missing.push("Nomor SK Lama");
  if (!peg.skTanggal?.trim()) missing.push("Tanggal Terbit SK Lama");
  if (!peg.skTglMulaiBerlaku?.trim()) missing.push("TMT Gaji Lama");
  
  if (!peg.gajiPokokBaru) missing.push("Gaji Pokok Baru");
  if (!peg.tmtBaru?.trim()) missing.push("TMT KGB Baru");
  if (!peg.tmtAkanDatang?.trim()) missing.push("TMT KGB YAD");
  
  return {
    valid: missing.length === 0,
    missingFields: missing
  };
};

interface DatabaseGridProps {
  pegawaiList: Pegawai[];
  onAddPegawai: (pegawai: Pegawai) => void;
  onUpdatePegawai: (id: string, updated: Pegawai) => void;
  onDeletePegawai: (id: string) => void;
  onSelectPegawaiForSKGB: (pegawai: Pegawai) => void;
}

export default function DatabaseGrid({ 
  pegawaiList, 
  onAddPegawai, 
  onUpdatePegawai, 
  onDeletePegawai, 
  onSelectPegawaiForSKGB 
}: DatabaseGridProps) {
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "PNS" | "PPPK" | "PerluProses">("All");

  // Add/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);

  // Import State Hooks
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Field States
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [pangkatGolongan, setPangkatGolongan] = useState("IX");
  const [jabatan, setJabatan] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [gajiPokokLama, setGajiPokokLama] = useState(0);
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");

  const [skOlehPejabat, setSkOlehPejabat] = useState("");
  const [skNomor, setSkNomor] = useState("");
  const [skTanggal, setSkTanggal] = useState("");
  const [skTglMulaiBerlaku, setSkTglMulaiBerlaku] = useState("");
  const [skMasaKerjaTahun, setSkMasaKerjaTahun] = useState(0);
  const [skMasaKerjaBulan, setSkMasaKerjaBulan] = useState(0);

  const [hasPMK, setHasPMK] = useState(false);
  const [pmkTahun, setPmkTahun] = useState(0);
  const [pmkBulan, setPmkBulan] = useState(0);
  const [pmkNomor, setPmkNomor] = useState("");
  const [pmkTanggal, setPmkTanggal] = useState("");

  const [gajiPokokBaru, setGajiPokokBaru] = useState(0);
  const [pangkatGolonganBaru, setPangkatGolonganBaru] = useState("");
  const [mkTahunBaru, setMkTahunBaru] = useState(0);
  const [mkBulanBaru, setMkBulanBaru] = useState(0);
  const [tmtBaru, setTmtBaru] = useState("");
  const [tmtAkanDatang, setTmtAkanDatang] = useState("");

  const [formType, setFormType] = useState<KepegawaianType>(KepegawaianType.PNS);
  const [formActiveTab, setFormActiveTab] = useState<"pribadi" | "sk" | "pmk" | "baru">("pribadi");

  // Standard Pangkat list for helpers
  const listPangkatPNS = [
    "PENATA MUDA, III/a",
    "PENATA MUDA Tk. I, III/b",
    "PENATA, III/c",
    "PENATA Tk. I, III/d",
    "PEMBINA, IV/a",
    "PEMBINA Tk. I, IV/b",
    "PEMBINA UTAMA MUDA, IV/c",
    "PEMBINA UTAMA MADYA, IV/d"
  ];

  const listGolonganPPPK = [
    "V", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"
  ];

  // Helper to prefill when changing KepegawaianType
  const handleTypeChange = (type: KepegawaianType) => {
    setFormType(type);
    if (type === KepegawaianType.PPPK) {
      setPangkatGolongan("IX");
      setPangkatGolonganBaru("IX");
    } else {
      setPangkatGolongan("PENATA Tk. I, III/d");
      setPangkatGolonganBaru("PENATA Tk. I, III/d");
    }
  };

  // Helper to open form for editing or adding
  const openForm = (pegawai: Pegawai | null = null) => {
    if (pegawai) {
      setEditingPegawai(pegawai);
      setNama(pegawai.nama);
      setNip(pegawai.nip);
      setTempatLahir(pegawai.tempatLahir);
      setTanggalLahir(pegawai.tanggalLahir);
      setPangkatGolongan(pegawai.pangkatGolongan);
      setJabatan(pegawai.jabatan);
      setUnitKerja(pegawai.unitKerja);
      setGajiPokokLama(pegawai.gajiPokokLama);
      setNoHp(pegawai.noHp || "");
      setEmail(pegawai.email || "");

      setSkOlehPejabat(pegawai.skOlehPejabat);
      setSkNomor(pegawai.skNomor);
      setSkTanggal(pegawai.skTanggal);
      setSkTglMulaiBerlaku(pegawai.skTglMulaiBerlaku);
      setSkMasaKerjaTahun(pegawai.skMasaKerjaTahun);
      setSkMasaKerjaBulan(pegawai.skMasaKerjaBulan);

      setHasPMK(pegawai.hasPMK);
      setPmkTahun(pegawai.pmkTahun || 0);
      setPmkBulan(pegawai.pmkBulan || 0);
      setPmkNomor(pegawai.pmkNomor || "");
      setPmkTanggal(pegawai.pmkTanggal || "");

      setGajiPokokBaru(pegawai.gajiPokokBaru);
      setPangkatGolonganBaru(pegawai.pangkatGolonganBaru || pegawai.pangkatGolongan);
      setMkTahunBaru(pegawai.mkTahunBaru);
      setMkBulanBaru(pegawai.mkBulanBaru);
      setTmtBaru(pegawai.tmtBaru);
      setTmtAkanDatang(pegawai.tmtAkanDatang);

      const isPegPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(pegawai.pangkatGolongan);
      setFormType(isPegPPPK ? KepegawaianType.PPPK : KepegawaianType.PNS);
    } else {
      setEditingPegawai(null);
      setNama("");
      setNip("");
      setTempatLahir("");
      setTanggalLahir("");
      setPangkatGolongan("PENATA Tk. I, III/d");
      setJabatan("GURU AHLI MUDA");
      setUnitKerja("SMA NEGERI 1 CIHAURBEUTI");
      setGajiPokokLama(4042500);
      setNoHp("");
      setEmail("");

      setSkOlehPejabat("KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII");
      setSkNomor("");
      setSkTanggal("");
      setSkTglMulaiBerlaku("");
      setSkMasaKerjaTahun(16);
      setSkMasaKerjaBulan(10);

      setHasPMK(false);
      setPmkTahun(0);
      setPmkBulan(0);
      setPmkNomor("");
      setPmkTanggal("");

      setGajiPokokBaru(4169900);
      setPangkatGolonganBaru("PENATA Tk. I, III/d");
      setMkTahunBaru(18);
      setMkBulanBaru(0);
      setTmtBaru("");
      setTmtAkanDatang("");
      
      setFormType(KepegawaianType.PNS);
    }
    setFormActiveTab("pribadi");
    setIsFormOpen(true);
  };

  // Download Template XLSX/CSV
  const handleDownloadTemplate = (format: "xlsx" | "csv") => {
    const templateHeaders = [
      "No",
      "Nama Pegawai (Lengkap)",
      "NIP",
      "Tempat Lahir",
      "Tanggal Lahir (YYYY-MM-DD)",
      "Pangkat Golongan", // e.g. "IX" or "PENATA, III/c"
      "Jabatan",
      "Unit Kerja (Sekolah)",
      "Gaji Pokok Lama",
      "Gaji Pokok Baru",
      "Masa Kerja Golongan Tahun (Baru)",
      "Masa Kerja Golongan Bulan (Baru)",
      "No HP (Optional)",
      "Email (Optional)",
      "SK Lama Oleh Pejabat",
      "SK Lama Nomor",
      "SK Lama Tanggal (YYYY-MM-DD)",
      "SK Lama TMT Berlaku (YYYY-MM-DD)",
      "SK Lama Masa Kerja Tahun",
      "SK Lama Masa Kerja Bulan",
      "TMT KGB Baru (YYYY-MM-DD)",
      "TMT KGB YAD (YYYY-MM-DD)",
      "Status KGB (Selesai / Perlu Diproses / Mendekati Jatuh Tempo)"
    ];

    const sampleRow = [
      1,
      "BUDI SANTOSO, S.Pd.",
      "198510102015031002",
      "CIAMIS",
      "1985-10-10",
      "PENATA, III/c",
      "GURU AHLI PERTAMA - SEJARAH",
      "SMAN 1 CIHAURBEUTI",
      3502000,
      3610000,
      10,
      4,
      "081234567890",
      "budi.santoso@gmail.com",
      "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII",
      "800/KPG.14/KCD.XIII",
      "2024-03-15",
      "2024-04-01",
      8,
      2,
      "2026-04-01",
      "2028-04-01",
      "Selesai"
    ];

    if (format === "xlsx") {
      const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, sampleRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template_Pegawai");
      XLSX.writeFile(workbook, "Template_Import_Pegawai_SKGB.xlsx");
    } else {
      const csvRows = [
        templateHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
        sampleRow.map(v => typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v).join(",")
      ];
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Template_Import_Pegawai_SKGB.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Parser handle from file upload change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportPreviewData([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rawRows.length < 2) {
          throw new Error("File tidak memiliki baris data (kosong atau hanya header)");
        }

        const dataRows = rawRows.slice(1); // skip headers
        const parsedPegList: Pegawai[] = [];

        dataRows.forEach((row, idx) => {
          if (!row || row.length === 0 || !row[1]) return;

          const cell = (colIdx: number, fallback: any = "") => {
            const val = row[colIdx];
            return val !== undefined && val !== null ? val : fallback;
          };

          const pegItem: Pegawai = {
            id: `peg-import-${Date.now()}-${idx}`,
            nama: String(cell(1)).trim().toUpperCase(),
            nip: String(cell(2)).trim().replace(/[^0-9]/g, ""),
            tempatLahir: String(cell(3)).trim().toUpperCase(),
            tanggalLahir: cell(4) ? String(cell(4)).trim() : "1980-01-01",
            pangkatGolongan: String(cell(5)).trim(),
            jabatan: String(cell(6)).trim().toUpperCase(),
            unitKerja: String(cell(7)).trim().toUpperCase(),
            gajiPokokLama: Number(cell(8, 0)),
            gajiPokokBaru: Number(cell(9, 0)),
            mkTahunBaru: Number(cell(10, 0)),
            mkBulanBaru: Number(cell(11, 0)),
            noHp: cell(12) ? String(cell(12)).trim() : undefined,
            email: cell(13) ? String(cell(13)).trim() : undefined,
            skOlehPejabat: String(cell(14, "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII")),
            skNomor: String(cell(15, "800/KCD-XIII")),
            skTanggal: cell(16) ? String(cell(16)).trim() : "2024-01-01",
            skTglMulaiBerlaku: cell(17) ? String(cell(17)).trim() : "2024-01-01",
            skMasaKerjaTahun: Number(cell(18, 0)),
            skMasaKerjaBulan: Number(cell(19, 0)),
            hasPMK: false,
            tmtBaru: cell(20) ? String(cell(20)).trim() : "2026-01-01",
            tmtAkanDatang: cell(21) ? String(cell(21)).trim() : "2028-01-01",
            statusKGB: (cell(22) ? String(cell(22)).trim() : "Selesai") as any
          };

          if (pegItem.nama && pegItem.nip) {
            parsedPegList.push(pegItem);
          }
        });

        if (parsedPegList.length === 0) {
          throw new Error("Format kolom tidak pas atau tidak ditemukan data pegawai valid yang memiliki Nama & NIP");
        }

        setImportPreviewData(parsedPegList);
      } catch (err: any) {
        setImportError(err.message || "Gagal mengolah file. Pastikan format kolom sesuai template.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (importPreviewData.length === 0) return;
    
    importPreviewData.forEach(peg => {
      onAddPegawai(peg);
    });

    setImportPreviewData([]);
    setIsImportModalOpen(false);
  };

  // Autocalculate values helper
  const handleAutoCalculateKGB = () => {
    // Masa Kerja is basically SK Masa Kerja + 2 Years, plus PMK helper if activated.
    const calculatedMKTahun = Number(skMasaKerjaTahun) + 2 + (hasPMK ? Number(pmkTahun) : 0);
    const calculatedMKBulan = Number(skMasaKerjaBulan) + (hasPMK ? Number(pmkBulan) : 0);
    
    const finalNewMKTahun = calculatedMKTahun + Math.floor(calculatedMKBulan / 12);
    const finalNewMKBulan = calculatedMKBulan % 12;

    setMkTahunBaru(finalNewMKTahun);
    setMkBulanBaru(finalNewMKBulan);

    // Fetch from official database lookup
    const lookedUpGajiLama = getSalaryByGolonganAndMasaKerja(pangkatGolongan, Number(skMasaKerjaTahun));
    const lookedUpGajiBaru = getSalaryByGolonganAndMasaKerja(pangkatGolonganBaru || pangkatGolongan, finalNewMKTahun);

    if (lookedUpGajiLama > 0) {
      setGajiPokokLama(lookedUpGajiLama);
    }

    if (lookedUpGajiBaru > 0) {
      setGajiPokokBaru(lookedUpGajiBaru);
    } else if (lookedUpGajiLama > 0) {
      setGajiPokokBaru(Math.round(lookedUpGajiLama * 1.0314 / 100) * 100);
    }

    if (skTglMulaiBerlaku) {
      // TMT Baru is TMT Lama + 2 Years
      const tmtLamaDate = new Date(skTglMulaiBerlaku);
      if (!isNaN(tmtLamaDate.getTime())) {
        const tmtBaruDate = new Date(skTglMulaiBerlaku);
        tmtBaruDate.setFullYear(tmtLamaDate.getFullYear() + 2);
        const yNew = tmtBaruDate.getFullYear();
        const mNew = String(tmtBaruDate.getMonth() + 1).padStart(2, '0');
        const dNew = String(tmtBaruDate.getDate()).padStart(2, '0');
        const tmtBaruString = `${yNew}-${mNew}-${dNew}`;
        setTmtBaru(tmtBaruString);

        // Kenaikan yang akan datang is TMT baru + 2 Years
        const nextKgbDate = new Date(tmtBaruString);
        nextKgbDate.setFullYear(nextKgbDate.getFullYear() + 2);
        const yNext = nextKgbDate.getFullYear();
        const mNext = String(nextKgbDate.getMonth() + 1).padStart(2, '0');
        const dNext = String(nextKgbDate.getDate()).padStart(2, '0');
        setTmtAkanDatang(`${yNext}-${mNext}-${dNext}`);
      }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nip || !pangkatGolongan || !jabatan || !unitKerja || !gajiPokokLama) {
      alert("Harap lengkapi semua data wajib pada formulir.");
      return;
    }

    // Determine KGB Status automatically based on TMT Baru compared to today (June 16, 2026)
    const today = new Date("2026-06-16");
    const tmtDate = new Date(tmtBaru || "2026-06-16");
    const diffTime = tmtDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let computedStatus: "Selesai" | "Perlu Diproses" | "Mendekati Jatuh Tempo" = "Selesai";
    if (diffDays <= 0) {
      computedStatus = "Perlu Diproses";
    } else if (diffDays <= 90) { // under 3 months
      computedStatus = "Mendekati Jatuh Tempo";
    }

    const payload: Pegawai = {
      id: editingPegawai ? editingPegawai.id : "peg-" + Date.now(),
      nama,
      nip,
      tempatLahir,
      tanggalLahir,
      pangkatGolongan,
      pangkatGolonganBaru: pangkatGolonganBaru || pangkatGolongan,
      jabatan,
      unitKerja,
      gajiPokokLama: Number(gajiPokokLama),
      noHp: noHp || undefined,
      email: email || undefined,
      skOlehPejabat,
      skNomor,
      skTanggal,
      skTglMulaiBerlaku,
      skMasaKerjaTahun: Number(skMasaKerjaTahun),
      skMasaKerjaBulan: Number(skMasaKerjaBulan),
      hasPMK,
      pmkTahun: hasPMK ? Number(pmkTahun) : undefined,
      pmkBulan: hasPMK ? Number(pmkBulan) : undefined,
      pmkNomor: hasPMK ? pmkNomor : undefined,
      pmkTanggal: hasPMK ? pmkTanggal : undefined,
      gajiPokokBaru: Number(gajiPokokBaru) || Number(gajiPokokLama),
      mkTahunBaru: Number(mkTahunBaru),
      mkBulanBaru: Number(mkBulanBaru),
      tmtBaru,
      tmtAkanDatang,
      statusKGB: computedStatus
    };

    if (editingPegawai) {
      onUpdatePegawai(editingPegawai.id, payload);
    } else {
      onAddPegawai(payload);
    }
    setIsFormOpen(false);
  };

  // Filters mapping
  const filteredList = pegawaiList.filter((peg) => {
    const matchesSearch = 
      peg.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peg.nip.includes(searchTerm) ||
      peg.unitKerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peg.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      
    const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
    
    if (filterType === "PNS") return matchesSearch && !isPPPK;
    if (filterType === "PPPK") return matchesSearch && isPPPK;
    if (filterType === "PerluProses") return matchesSearch && peg.statusKGB !== "Selesai";
    return matchesSearch;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num) + ",-";
  };

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Database Kepegawaian</h2>
            <p className="text-xs text-slate-500">Kelola informasi pegawai, riwayat gaji, dan rekam masa kerja pegawai.</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs font-semibold select-none">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Data Lengkap (Siap Cetak)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                <span>Perlu Input Tambahan</span>
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer animate-pulse-subtle"
            >
              <FileSpreadsheet size={16} />
              <span>Import Excel / CSV</span>
            </button>

            <button
              onClick={() => openForm(null)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Tambah Pegawai Baru</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, NIP, unit kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setFilterType("All")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "All" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua Pegawai
            </button>
            <button
              onClick={() => setFilterType("PNS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "PNS" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Golongan PNS
            </button>
            <button
              onClick={() => setFilterType("PPPK")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "PPPK" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Golongan PPPK (IX-XV)
            </button>
            <button
              onClick={() => setFilterType("PerluProses")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "PerluProses" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-rose-600"
              }`}
            >
              Antrean KGB
            </button>
          </div>
        </div>
      </div>

      {/* Main Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Profil Pegawai</th>
                <th className="p-4">Golongan / NIP</th>
                <th className="p-4">Unit Kerja & Jabatan</th>
                <th className="p-4">Masa Kerja & Gaji Lama</th>
                <th className="p-4">Status & Alur KGB</th>
                <th className="p-4 text-center">Aksi Kendali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                        <UserPlus size={24} />
                      </div>
                      <p className="font-semibold text-slate-700">Tidak ada pegawai ditemukan</p>
                      <p className="text-xs">Coba ubah kata kunci pencarian Anda atau tambahkan pegawai baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((peg) => {
                  const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
                  const validation = isDataLengkap(peg);
                  return (
                    <tr key={peg.id} className="hover:bg-slate-50 transition-colors">
                      {/* Profil Name */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <div className="font-bold text-slate-900 leading-tight">{peg.nama}</div>
                          {validation.valid ? (
                            <span 
                              className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0"
                              title="Profil Lengkap - Siap Cetak Berkas SKGB"
                            >
                              <Check size={11} className="stroke-[3]" />
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9.5px] font-extrabold cursor-help shrink-0"
                              title={`Profil belum lengkap. Data yang kurang: ${validation.missingFields.join(', ')}`}
                            >
                              <AlertTriangle size={10} className="stroke-[2.5] text-amber-600" />
                              <span>{validation.missingFields.length} Kurang</span>
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs mt-1 flex items-center gap-3">
                          {peg.noHp && (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={10} />
                              {peg.noHp}
                            </span>
                          )}
                          {peg.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail size={10} />
                              <span className="truncate max-w-[120px]">{peg.email}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* NIP / Golongan */}
                      <td className="p-4">
                        <div className="font-mono text-slate-800 text-xs font-semibold">{peg.nip}</div>
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                            isPPPK 
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {isPPPK ? `PPPK (GOL ${peg.pangkatGolongan})` : `PNS (${peg.pangkatGolongan})`}
                          </span>
                        </div>
                      </td>

                      {/* Unit Kerja / Jabatan */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-850 leading-tight block">{peg.jabatan}</div>
                        <div className="text-slate-400 text-xs truncate max-w-[200px] mt-0.5" title={peg.unitKerja}>
                          {peg.unitKerja}
                        </div>
                      </td>

                      {/* SK Gaji & PMK info */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{formatRupiah(peg.gajiPokokLama)}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                          <span>{peg.skMasaKerjaTahun}th {peg.skMasaKerjaBulan}bl</span>
                          {peg.hasPMK && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded font-bold">
                              +PMK {peg.pmkTahun}th
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status / TMT */}
                      <td className="p-4">
                        <div className="text-xs text-slate-600">
                          TMT: <span className="font-bold text-slate-800">{peg.tmtBaru}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            peg.statusKGB === "Selesai"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : peg.statusKGB === "Perlu Diproses"
                              ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {peg.statusKGB}
                          </span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onSelectPegawaiForSKGB(peg)}
                            className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center text-xs font-semibold gap-1 cursor-pointer"
                            title="Unduh & Cetak SKGB"
                          >
                            <FileText size={13} />
                            <span>Cetak</span>
                          </button>
                          <button
                            onClick={() => openForm(peg)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Pegawai"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus data pegawai ${peg.nama}?`)) {
                                onDeletePegawai(peg.id);
                              }
                            }}
                            className="p-1.5 bg-rose-55 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pegawai"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Form Drawer (Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-900/50">
              <div>
                <h3 className="font-bold text-base">
                  {editingPegawai ? "Ubah Profil Pegawai" : "Tambah Pegawai Baru ke Database"}
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Harap lengkapi detail profil di bawah untuk memproses berkas otomatis.
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Tab Bar for fields structure */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-sm">
              <button
                type="button"
                onClick={() => setFormActiveTab("pribadi")}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "pribadi" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Profil Pribadi
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab("sk")}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "sk" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                2. SK Lama (Terakhir)
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab("pmk")}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "pmk" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                3. Tambah MK (PMK)
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAutoCalculateKGB();
                  setFormActiveTab("baru");
                }}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "baru" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                4. KGB Baru (Kalkulator)
              </button>
            </div>

            {/* Form Fields Scroller */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSaveForm} className="space-y-6">
                
                {/* TAB 1: DATA PRIBADI */}
                {formActiveTab === "pribadi" && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <Info size={14} />
                        Petunjuk Pengisian Nama & NIP
                      </p>
                      <p className="font-medium text-[11px]">
                        Isi nama lengkap berserta gelar akademisnya. NIP pegawai harus diisi tanpa spasi. Jenis kepegawaian menentukan template dan format logo tanda tangan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nama Lengkap & Gelar *</label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="e.g. WIKA NAJMUDIN, S.Pd."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Pilih Jenis Kepegawaian *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleTypeChange(KepegawaianType.PNS)}
                            className={`py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              formType === KepegawaianType.PNS
                                ? "bg-blue-50 border-blue-400 text-blue-900 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            PNS (Negeri Sipil)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTypeChange(KepegawaianType.PPPK)}
                            className={`py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              formType === KepegawaianType.PPPK
                                ? "bg-purple-50 border-purple-400 text-purple-900 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            PPPK (Perjanjian Kerja)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Golongan Ruang *</label>
                        {formType === KepegawaianType.PNS ? (
                          <select
                            value={pangkatGolongan}
                            onChange={(e) => setPangkatGolongan(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {listPangkatPNS.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={pangkatGolongan}
                            onChange={(e) => setPangkatGolongan(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {listGolonganPPPK.map(g => (
                              <option key={g} value={g}>Golongan {g}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">NIP Pegawai *</label>
                        <input
                          type="text"
                          required
                          value={nip}
                          onChange={(e) => setNip(e.target.value.replace(/\s+/g, ""))}
                          placeholder="e.g. 198109052024211004"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Jabatan *</label>
                        <input
                          type="text"
                          required
                          value={jabatan}
                          onChange={(e) => setJabatan(e.target.value)}
                          placeholder="e.g. GURU AHLI PERTAMA - PPKN"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Unit Kerja *</label>
                        <input
                          type="text"
                          required
                          value={unitKerja}
                          onChange={(e) => setUnitKerja(e.target.value)}
                          placeholder="e.g. SMKN CIMERAK KABUPATEN PANGANDARAN"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tempat Lahir</label>
                        <input
                          type="text"
                          value={tempatLahir}
                          onChange={(e) => setTempatLahir(e.target.value.toUpperCase())}
                          placeholder="e.g. CIAMIS"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={tanggalLahir}
                          onChange={(e) => setTanggalLahir(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">No. Handphone (WA info)</label>
                        <input
                          type="tel"
                          value={noHp}
                          onChange={(e) => setNoHp(e.target.value)}
                          placeholder="e.g. 08123456789"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Alamat Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. pegawai@jabarprov.go.id"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SK TERAKHIR (LAMA) */}
                {formActiveTab === "sk" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-xs space-y-1 border border-slate-200">
                      <p className="font-bold flex items-center gap-1.5 text-slate-800">
                        <Info size={14} />
                        Keterangan SK Kenaikan Gaji/Pangkat Terakhir
                      </p>
                      <p className="font-medium">
                        Masukkan rincian Surat Keputusan yang berlaku saat ini. Sistem akan menggunakannya sebagai acuan dasar (Atas Dasar No & Tanggal) dalam draf berkas SKGB baru.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Pejabat Pengesah SK Terakhir *</label>
                        <input
                          type="text"
                          required
                          value={skOlehPejabat}
                          onChange={(e) => setSkOlehPejabat(e.target.value)}
                          placeholder="e.g. KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nomor SK Terakhir *</label>
                        <input
                          type="text"
                          required
                          value={skNomor}
                          onChange={(e) => setSkNomor(e.target.value)}
                          placeholder="e.g. NO.1658/KPG.14.KCD-XIII"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tanggal Terbit SK Terakhir *</label>
                        <input
                          type="date"
                          required
                          value={skTanggal}
                          onChange={(e) => setSkTanggal(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">TMT / Tanggal Gaji Berlaku Lama *</label>
                        <input
                          type="date"
                          required
                          value={skTglMulaiBerlaku}
                          onChange={(e) => setSkTglMulaiBerlaku(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Gaji Pokok Lama (Laporan SK) *</label>
                        <input
                          type="number"
                          required
                          value={gajiPokokLama}
                          onChange={(e) => setGajiPokokLama(Number(e.target.value))}
                          placeholder="Rp."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Golongan (SK Lama): Tahun</label>
                        <input
                          type="number"
                          value={skMasaKerjaTahun}
                          onChange={(e) => setSkMasaKerjaTahun(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Golongan (SK Lama): Bulan</label>
                        <input
                          type="number"
                          value={skMasaKerjaBulan}
                          onChange={(e) => setSkMasaKerjaBulan(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PENAMBAHAN MASA KERJA (PMK) */}
                {formActiveTab === "pmk" && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-xs space-y-1 border border-amber-200">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Info size={14} />
                        Penambahan Masa Kerja (PMK) Fleksibel
                      </p>
                      <p className="font-medium leading-relaxed">
                        Jika Pegawai terkait memiliki ketetapan luar biasa berupa Penambahan Masa Kerja (PMK) dari Kepala BKN / Gubernur, aktifkan opsi ini. Total waktu masa kerja baru akan ditambahkan dari nilai akumulatif di bawah ini.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        id="hasPMK"
                        checked={hasPMK}
                        onChange={(e) => setHasPMK(e.target.checked)}
                        className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="hasPMK" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Aktifkan Penambahan Masa Kerja (SK PMK) Untuk Pegawai Ini
                      </label>
                    </div>

                    {hasPMK && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-teal-100 p-5 rounded-xl bg-teal-50/20 animate-in slide-in-from-top-3 duration-200">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">Nomor SK PMK *</label>
                          <input
                            type="text"
                            required={hasPMK}
                            value={pmkNomor}
                            onChange={(e) => setPmkNomor(e.target.value)}
                            placeholder="e.g. SK-PMK-002/XI/2025"
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">Tanggal SK PMK *</label>
                          <input
                            type="date"
                            required={hasPMK}
                            value={pmkTanggal}
                            onChange={(e) => setPmkTanggal(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">PMK Tambahan Tahun *</label>
                          <input
                            type="number"
                            required={hasPMK}
                            value={pmkTahun}
                            onChange={(e) => setPmkTahun(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">PMK Tambahan Bulan *</label>
                          <input
                            type="number"
                            required={hasPMK}
                            value={pmkBulan}
                            onChange={(e) => setPmkBulan(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: DATA KGB BARU (AUTO CALCULATOR) */}
                {formActiveTab === "baru" && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-start gap-3">
                      <RefreshCw size={20} className="text-emerald-700 shrink-0 mt-0.5 animate-spin duration-1000" />
                      <div className="text-xs text-emerald-950 space-y-1 leading-relaxed">
                        <p className="font-bold text-emerald-800">Pemberitahuan Otomatisasi KGB</p>
                        <p>
                          Total masa kerja, Tanggal TMT KGB Baru, dan Kenaikan Berikutnya telah dihitung otomatis bertambah 2 tahun berdasarkan tanggal TMT SK Lama yang Anda input sebelumnya.
                        </p>
                        <button
                          type="button"
                          onClick={handleAutoCalculateKGB}
                          className="mt-1 py-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-all uppercase text-[9px]"
                        >
                          Hitung / Sinkron Nilai Sekarang
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Pangkat / Golongan Baru *</label>
                        {formType === KepegawaianType.PPPK ? (
                          <select
                            value={pangkatGolonganBaru}
                            onChange={(e) => setPangkatGolonganBaru(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                          >
                            {listGolonganPPPK.map((g) => (
                              <option key={g} value={g}>Golongan {g}</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={pangkatGolonganBaru}
                            onChange={(e) => setPangkatGolonganBaru(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                          >
                            {listPangkatPNS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Gaji Pokok Baru (KGB Baru) *</label>
                        <input
                          type="number"
                          required
                          value={gajiPokokBaru}
                          onChange={(e) => setGajiPokokBaru(Number(e.target.value))}
                          placeholder="Rp."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">TMT KGB Baru Mulai Berlaku *</label>
                        <input
                          type="date"
                          required
                          value={tmtBaru}
                          onChange={(e) => setTmtBaru(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Baru: Tahun *</label>
                        <input
                          type="number"
                          required
                          value={mkTahunBaru}
                          onChange={(e) => setMkTahunBaru(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Baru: Bulan *</label>
                        <input
                          type="number"
                          required
                          value={mkBulanBaru}
                          onChange={(e) => setMkBulanBaru(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Kenaikan Gaji Berkala Berikutnya (2 Tahun Mendatang) *</label>
                        <input
                          type="date"
                          required
                          value={tmtAkanDatang}
                          onChange={(e) => setTmtAkanDatang(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </div>

            {/* Form Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <div>
                {formActiveTab !== "pribadi" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formActiveTab === "baru") setFormActiveTab("pmk");
                      else if (formActiveTab === "pmk") setFormActiveTab("sk");
                      else if (formActiveTab === "sk") setFormActiveTab("pribadi");
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Batal
                </button>
                {formActiveTab !== "baru" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (formActiveTab === "pribadi") setFormActiveTab("sk");
                      else if (formActiveTab === "sk") setFormActiveTab("pmk");
                      else if (formActiveTab === "pmk") {
                        handleAutoCalculateKGB();
                        setFormActiveTab("baru");
                      }
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all inline-flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <span>Lanjut</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                  >
                    {editingPegawai ? "Simpan Perubahan" : "Simpan Pegawai"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGION: IMPORT DATA PEGAWAI EXCEL / CSV MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/90 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Import Database Pegawai</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Unggah berkas Excel atau CSV untuk menambah data pegawai secara massal.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreviewData([]);
                  setImportError("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 border-b border-slate-100">
              
              {/* Box 1: Downoad official templates */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8">
                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-widest">Unduh Template Contoh Kolom</h4>
                  <p className="text-xs text-slate-650 mt-1">Gunakan template resmi kami agar urutan posisi kolom dibaca presisi oleh sistem pembaca berkas.</p>
                </div>
                <div className="md:col-span-4 flex flex-col sm:flex-row gap-2 justify-end w-full">
                  <button
                    onClick={() => handleDownloadTemplate("xlsx")}
                    className="px-3 py-2 bg-emerald-650 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download size={13} />
                    <span>Format Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadTemplate("csv")}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download size={13} />
                    <span>Format CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Box 2: Dropzone Area clickable */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-emerald-50/10 cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
                
                <div className="w-12 h-12 bg-white group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 rounded-full border border-slate-200 shadow-sm flex items-center justify-center transition-colors">
                  <Download size={22} className="transform rotate-180" />
                </div>
                
                <h4 className="text-sm font-bold text-slate-800">Tarik berkas Anda ke sini, atau klik untuk memilih</h4>
                <p className="text-xs text-slate-400 font-medium">Menerima berkas ekstensi Excel (.xlsx / .xls) ataupun berkas teks CSV (.csv)</p>
              </div>

              {/* Error messages */}
              {importError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Grid 3: Preview Data imported list */}
              {importPreviewData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <span>Preview Berkas Data Terbaca</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{importPreviewData.length} Baris data</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">• Pastikan Nama dan NIP telah sesuai untuk dilanjutkan</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto bg-slate-50">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3 w-12 text-center text-slate-400">No</th>
                          <th className="py-2.5 px-3">Nama Pegawai</th>
                          <th className="py-2.5 px-3">NIP</th>
                          <th className="py-2.5 px-3">Golongan</th>
                          <th className="py-2.5 px-3">Unit Kerja (Sekolah)</th>
                          <th className="py-2.5 px-3 text-right">Gaji Baru</th>
                          <th className="py-2.5 px-3 w-20 text-center">TMT Baru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 bg-white">
                        {importPreviewData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-center text-[11px] font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.nama}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{item.nip}</td>
                            <td className="py-2 px-3 font-bold text-slate-650">{item.pangkatGolongan}</td>
                            <td className="py-2 px-3 text-[11px] text-slate-400 font-medium truncate max-w-[200px]">{item.unitKerja}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-indigo-650">
                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.gajiPokokBaru).replace("Rp", "").trim()}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">{item.tmtBaru}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-medium">Layanan Verifikasi Format Kepegawaian Cabdisdik Wilayah XIII</span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportPreviewData([]);
                    setImportError("");
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importPreviewData.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-450 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={14} />
                  <span>Masukkan {importPreviewData.length > 0 ? importPreviewData.length : ""} Pegawai Ke Database</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
