/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, 
  UserCheck, 
  FileCheck2, 
  Hourglass, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  CalendarClock, 
  History,
  Info
} from "lucide-react";
import { Pegawai, ActivityLog } from "../types";

interface DashboardProps {
  pegawaiList: Pegawai[];
  logs: ActivityLog[];
  onNavigateToTab: (tab: string) => void;
  onSelectPegawaiForSKGB: (pegawai: Pegawai) => void;
}

export default function Dashboard({ 
  pegawaiList, 
  logs, 
  onNavigateToTab, 
  onSelectPegawaiForSKGB 
}: DashboardProps) {
  
  // Calculations
  const totalPegawai = pegawaiList.length;
  const totalPNS = pegawaiList.filter(p => p.pangkatGolongan.includes("/") || !["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(p.pangkatGolongan)).length; 
  // Wait, let's distinguish securely by a flag or check if it fits PNS / PPPK structure.
  // Actually, a cleaner way is verifying how we define them. Let's make an explicit check based on the standard grade.
  // Let's define: PPPK grades are Roman numerals e.g. "IX", "X", etc., PNS is like "III/a", "III/b" etc.
  const pnsCount = pegawaiList.filter(p => !["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(p.pangkatGolongan)).length;
  const pppkCount = totalPegawai - pnsCount;

  // KGB status counters
  const kgbSelesai = pegawaiList.filter(p => p.statusKGB === "Selesai").length;
  const kgbPerluProses = pegawaiList.filter(p => p.statusKGB === "Perlu Diproses").length;
  const kgbMendekati = pegawaiList.filter(p => p.statusKGB === "Mendekati Jatuh Tempo").length;

  // Let's list upcoming KGB (due soon or expired)
  const upcomingKGBList = pegawaiList.filter(p => p.statusKGB !== "Selesai");

  // Helper to format currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num) + ",-";
  };

  // Helper for human-friendly dates
  const formatFriendlyDate = (dateStr: string) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Upper Banner Block */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-850 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute right-10 bottom-0 translate-y-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <span className="px-3 py-1 bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm">
            Super Admin Area
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight">
            Sistem Informasi Kenaikan Gaji Berkala
          </h2>
          <p className="mt-2 text-indigo-100/90 text-sm md:text-base leading-relaxed">
            Selamat datang di portal pengelolaan berkas SK Kenaikan Gaji Berkala (SKGB) Cabang Dinas Pendidikan Wilayah XIII, Dinas Pendidikan Pemerintah Provinsi Jawa Barat. Pantau jatuh tempo kenaikan gaji pegawai secara terpadu.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <button 
              onClick={() => onNavigateToTab("cetak-skgb")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Proses Cetak SKGB</span>
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => onNavigateToTab("database")}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-100 font-semibold rounded-xl text-sm border border-slate-700/60 transition-all duration-150 inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>Kelola Basis Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total ASN */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Pegawai Terdaftar</span>
            <div className="text-2xl font-bold text-slate-900">{totalPegawai} ASN</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span>{pnsCount} PNS</span>
              <span className="inline-block w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{pppkCount} PPPK</span>
            </div>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-650 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-200">
            <Users size={22} />
          </div>
        </div>

        {/* KGB Selesai */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 font-sans">KGB Lancar / Selesai</span>
            <div className="text-2xl font-bold text-indigo-700">{kgbSelesai} Pegawai</div>
            <div className="text-xs text-indigo-600 flex items-center gap-1 font-medium bg-indigo-50 px-1.5 py-0.5 rounded w-max">
              <TrendingUp size={12} />
              <span>Gaji Baru Terbaca</span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
            <FileCheck2 size={22} />
          </div>
        </div>

        {/* Perlu Proses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-300 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 font-sans">Perlu Diproses Segera</span>
            <div className="text-2xl font-bold text-amber-600">{kgbPerluProses} Pegawai</div>
            <div className="text-xs text-amber-600 flex items-center gap-1 font-medium bg-amber-50 px-1.5 py-0.5 rounded w-max">
              <AlertCircle size={12} />
              <span>TMT Jatuh Tempo</span>
            </div>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
            <Hourglass size={22} />
          </div>
        </div>

        {/* Mendekati KGB */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-sky-300 transition-all duration-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Mendekati Jatuh Tempo</span>
            <div className="text-2xl font-bold text-sky-600">{kgbMendekati} Pegawai</div>
            <div className="text-xs text-sky-500 gap-1 flex items-center">
              <CalendarClock size={12} />
              <span>Dalam 3 bulan</span>
            </div>
          </div>
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors duration-200">
            <CalendarClock size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of People Needing Process (2/3 col on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarClock size={18} className="text-indigo-600" />
                <span>Alarm Antrean Jatuh Tempo Kenaikan Gaji Berkala</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Pegawai yang telah tiba atau mendekati masa kenaikan gaji berikutnya.</p>
            </div>
            <button 
              onClick={() => onNavigateToTab("notifikasi")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Notifikasi</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {upcomingKGBList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 space-y-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                  <UserCheck size={28} />
                </div>
                <p className="font-semibold text-slate-705">Semua Data KGB Tertata Aman!</p>
                <p className="text-xs text-center">Tidak ada antrean KGB yang perlu diproses dalam waktu dekat.</p>
              </div>
            ) : (
              upcomingKGBList.map((peg) => {
                const isUrgent = peg.statusKGB === "Perlu Diproses";
                return (
                  <div key={peg.id} className="p-4 hover:bg-slate-50 rounded-xl transition-all duration-150 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                          peg.pangkatGolongan.includes("/") || peg.pangkatGolongan.includes("PENATA") || peg.pangkatGolongan.includes("III") || peg.pangkatGolongan.includes("IV")
                            ? "bg-slate-100 text-slate-800 border border-slate-200" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {peg.pangkatGolongan.includes("/") || peg.pangkatGolongan.includes("PENATA") ? "PNS" : "PPPK"}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm hover:underline hover:text-indigo-800 cursor-pointer" onClick={() => onSelectPegawaiForSKGB(peg)}>
                          {peg.nama}
                        </h4>
                      </div>
                      <p className="text-slate-500 text-xs truncate max-w-sm">NIP {peg.nip} • {peg.jabatan}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="text-slate-500 font-mono">Unit: <span className="text-slate-700 font-sans font-medium">{peg.unitKerja}</span></span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">TMT Baru: <span className="text-indigo-600 font-medium">{formatFriendlyDate(peg.tmtBaru)}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        isUrgent 
                          ? "bg-rose-50 border-rose-200 text-rose-700" 
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        {peg.statusKGB}
                      </span>
                      <button
                        onClick={() => onSelectPegawaiForSKGB(peg)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                        title="Proses SKGB"
                      >
                        <FileCheck2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Log & Regulasi (1/3 col on large screens) */}
        <div className="space-y-6">
          {/* Quick Informational Panel Jabar */}
          <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-indigo-955 flex items-center gap-2">
              <Info size={16} className="text-indigo-650 shrink-0" />
              <span>Regulasi Gaji Berkala Terkini</span>
            </h3>
            <div className="text-xs text-indigo-950 space-y-2.5 leading-relaxed">
              <p>
                Sistem mengaktifkan formula perhitungan berdasarkan regulasi Kenaikan Gaji Berkala (KGB) yang disederhanakan:
              </p>
              <ul className="list-disc list-inside space-y-1 text-indigo-900/90 font-medium font-sans">
                <li><span className="font-bold">PNS</span>: Berdasarkan Perpres No. 5 Tahun 2024</li>
                <li><span className="font-bold">PPPK</span>: Berdasarkan PP No. 11 Tahun 2024</li>
                <li>Jarak Berkala wajib: tepat <span className="font-bold">2 Tahun</span></li>
              </ul>
              <p className="border-t border-indigo-100/60 pt-2 text-[11px] text-indigo-800/80">
                Data Penambahan Masa Kerja (PMK) jika diinput akan langsung diakumulasikan secara otomatis ke dalam total masa kerja golongan Pegawai terkait.
              </p>
            </div>
          </div>

          {/* Activity Log Dashboard Block */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-[300px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History size={16} className="text-indigo-650" />
                <span>Aktivitas Admin Terakhir</span>
              </h3>
              <button 
                onClick={() => onNavigateToTab("logs")}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Semua Log
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-indigo-500 pl-3 py-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500">{log.adminUser}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <h4 className="font-bold text-slate-800">{log.action}</h4>
                  <p className="text-slate-550 text-[11px] line-clamp-1">{log.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
