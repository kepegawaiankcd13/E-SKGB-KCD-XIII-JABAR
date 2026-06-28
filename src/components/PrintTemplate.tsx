/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Pegawai, SystemSettings } from "../types";

interface PrintTemplateProps {
  pegawai: Pegawai;
  settings: SystemSettings;
  nomorSurat: string;
  tanggalSurat: string; // YYYY-MM-DD or pre-formatted Indonesian string
  tembusanList: string[];
}

export default function PrintTemplate({
  pegawai,
  settings,
  nomorSurat,
  tanggalSurat,
  tembusanList
}: PrintTemplateProps) {
  
  // Helper to format name and preserve academic casing of titles (degrees)
  const formatNamaDanGelar = (namaLengkap: string) => {
    if (!namaLengkap) return "";
    const commaIdx = namaLengkap.indexOf(",");
    if (commaIdx !== -1) {
      const namaUtama = namaLengkap.slice(0, commaIdx).toUpperCase().trim();
      const gList = namaLengkap.slice(commaIdx).trim(); // Keep original casing of degrees
      return `${namaUtama}${gList}`;
    }
    return namaLengkap.toUpperCase().trim();
  };

  // Custom Jabar Logo SVG 
  const JabarLogoSVG = () => (
    <svg className="w-20 h-24 print:w-16 print:h-20 shrink-0 select-none" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Shield Shield with Green fill */}
      <path d="M50,10 C85,10 90,35 90,65 C90,95 50,115 50,115 C50,115 10,95 10,65 C10,35 15,10 50,10 Z" fill="#0b5e3a" stroke="#d4af37" strokeWidth="3" />
      {/* Inner design lines with gold colors and red stars */}
      <path d="M50,15 C78,15 82,38 82,65 C82,88 50,106 50,106 C50,106 18,88 18,65 C18,38 22,15 50,15 Z" fill="#137c4f" stroke="#eeca3a" strokeWidth="1.5" />
      
      {/* Central Tower / Gedung Sate simulation */}
      <rect x="46" y="35" width="8" height="40" fill="#ffffff" />
      <polygon points="42,35 50,22 58,35" fill="#ffd700" stroke="#b8860b" strokeWidth="1" />
      <line x1="50" y1="22" x2="50" y2="17" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="16" r="2.5" fill="#f43f5e" /> {/* Top Red Star */}

      {/* Gold wings/ears simulation Jabar */}
      <path d="M28,60 C28,45 42,45 42,60 C42,75 28,75 28,60 Z M72,60 C72,45 58,45 58,60 C58,75 72,75 72,60 Z" fill="#ffd700" opacity="0.8" />

      {/* Ribbon with text Gemah Ripah */}
      <path d="M15,90 Q50,105 85,90" fill="none" stroke="#eeca3a" strokeWidth="8" strokeLinecap="round" />
      <path d="M15,90 Q50,105 85,90" fill="none" stroke="#003366" strokeWidth="5" strokeLinecap="round" />
      
      {/* Text on ribbon */}
      <path id="ribbonTextPath" d="M18,91 Q50,106 82,91" fill="none" />
      <text fontFamily="Arial" fontSize="4.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">
        <textPath href="#ribbonTextPath" startOffset="50%">
          GEMAH RIPAH REPEH RAPIH
        </textPath>
      </text>
    </svg>
  );

  // Helper formatting numbers to Rupiah
  const formatRupiah = (num: number) => {
    return "Rp. " + new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num) + ",-";
  };

  const formatFriendlyDate = (dateStr: string) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Check if PPPK based on grade
  const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(pegawai.pangkatGolongan);
  const useTTE = isPPPK ? settings.spesimen.useTTEForPPPK : settings.spesimen.useTTEForPNS;
  const regulasi = isPPPK ? settings.regulasiPPPK : settings.regulasiPNS;

  return (
    <div className="print-page bg-white text-black font-sans w-full max-w-[215mm] mx-auto p-[20mm] select-text shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0 print:mx-0 print:max-w-none print:min-h-0 min-h-[330mm] flex flex-col justify-between" style={{ boxSizing: "border-box" }}>
      
      {/* Document Content Top and Body */}
      <div>
        {/* KOP SURAT / LETTERHEAD */}
        {settings.kop.useFullImage && settings.kop.fullImageUrl ? (
          <div className="w-full mb-4 select-none">
            <img 
              src={settings.kop.fullImageUrl} 
              alt="Kop Surat" 
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain block" 
            />
          </div>
        ) : (
          <div className="flex items-center space-x-4 border-b-[4px] border-black pb-3 select-none">
            {settings.kop.logoUrl ? (
              <img 
                src={settings.kop.logoUrl} 
                alt="Logo Instansi" 
                referrerPolicy="no-referrer"
                className="w-20 h-24 print:w-16 print:h-20 object-contain shrink-0"
              />
            ) : (
              JabarLogoSVG()
            )}
            
            <div className="flex-1 text-center font-sans">
              <h1 className="text-[14pt] print:text-[12pt] font-extrabold tracking-normal text-black leading-tight uppercase">
                {settings.kop.pemdaLine}
              </h1>
              <h2 className="text-[13pt] print:text-[11pt] font-extrabold text-black leading-snug uppercase">
                {settings.kop.dinasLine}
              </h2>
              <h3 className="text-[13pt] print:text-[11pt] font-extrabold text-[#0066aa] leading-snug uppercase tracking-tight">
                {settings.kop.cabdisLine}
              </h3>
              <p className="text-[9pt] print:text-[7.5pt] font-medium text-black mt-1">
                {settings.kop.alamat}
              </p>
              <p className="text-[8.5pt] print:text-[7pt] font-normal text-slate-800 italic">
                {settings.kop.kontak}
              </p>
              <p className="text-[9.5pt] print:text-[8pt] font-bold text-black uppercase mt-0.5 tracking-wider">
                {settings.kop.kabupatenZip}
              </p>
            </div>
          </div>
        )}

        {/* DATE & ADDRESSEE HEADER */}
        <div className="mt-5 grid grid-cols-2 text-[10pt] print:text-[8.8pt] leading-normal font-sans text-black select-none">
          {/* Left Metadata Parameters */}
          <div className="space-y-1.5 flex flex-col justify-start">
            <div className="flex items-start">
              <span className="w-16 shrink-0 inline-block font-medium">Nomor</span>
              <span className="mr-2">:</span>
              <span className="font-semibold tracking-wide font-mono print:font-sans break-all">{nomorSurat}</span>
            </div>
            <div className="flex items-start">
              <span className="w-16 shrink-0 inline-block font-medium">Sifat</span>
              <span className="mr-2">:</span>
              <span>Biasa</span>
            </div>
            <div className="flex items-start">
              <span className="w-16 shrink-0 inline-block font-medium">Perihal</span>
              <span className="mr-2">:</span>
              <span className="font-bold flex-1 leading-tight">
                Pemberitahuan Kenaikan Gaji<br />Berkala
              </span>
            </div>
          </div>

          {/* Right Destination / Date Block */}
          <div className="flex flex-col items-start pl-8 print:pl-4 space-y-1 text-left">
            <div className="mb-1 font-normal">
              {settings.kop.kabupatenZip.split("–")[0].trim() || "Ciamis"}, {formatFriendlyDate(tanggalSurat)}
            </div>
            <div className="font-medium text-black">Kepada</div>
            <div className="font-bold text-black leading-tight">Yth. Sdr. Asisten Administrasi pada</div>
            <div className="pl-[2.2rem] text-slate-900 leading-tight font-medium">
              Sekretariat Daerah Provinsi Jawa Barat
            </div>
            <div className="text-black">
              di
            </div>
            <div className="pl-[2.2rem] font-bold text-black uppercase tracking-[0.25em] text-[10pt] print:text-[8.8pt]">
              Bandung
            </div>
          </div>
        </div>

        {/* OPENING CLAUSE */}
        <div className="mt-5 text-[10pt] print:text-[8.8pt] text-justify leading-relaxed">
          <p>
            Dengan ini diberitahukan bahwa sehubungan telah dipenuhinya masa kerja dan syarat-syarat lainnya kepada :
          </p>
        </div>

        {/* LIST 1-6: PEGAWAI PROFILE DETAILS */}
        <div className="mt-3 pl-4 text-[10pt] print:text-[8.8pt] leading-relaxed space-y-1 text-black">
          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">1.</span>
            <span className="w-72 shrink-0 inline-block uppercase">NAMA/ TEMPAT DAN TANGGAL LAHIR</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-bold text-black uppercase flex-1">
              {pegawai.nama} / {pegawai.tempatLahir}, {formatFriendlyDate(pegawai.tanggalLahir)}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">2.</span>
            <span className="w-72 shrink-0 inline-block uppercase">NIP</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-semibold font-mono print:font-sans text-black tracking-wide flex-1">
              {pegawai.nip}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">3.</span>
            <span className="w-72 shrink-0 inline-block uppercase">PANGKAT GOLONGAN RUANG</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-bold text-black uppercase flex-1">{pegawai.pangkatGolongan}</span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">4.</span>
            <span className="w-72 shrink-0 inline-block uppercase">JABATAN</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-semibold text-black uppercase flex-1 leading-snug">{pegawai.jabatan}</span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">5.</span>
            <span className="w-72 shrink-0 inline-block uppercase">UNIT KERJA</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-bold text-black uppercase flex-1 leading-snug">{pegawai.unitKerja}</span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">6.</span>
            <span className="w-72 shrink-0 inline-block uppercase">GAJI POKOK</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-semibold text-black flex-1">{formatRupiah(pegawai.gajiPokokLama)}</span>
          </div>
        </div>

        {/* ATAS DASAR SK SECTION */}
        <div className="mt-4 text-[10pt] print:text-[8.8pt] font-sans leading-relaxed text-black">
          <p>atas dasar Surat Keputusan terakhir tentang gaji dan pangkat yang ditetapkan :</p>
          
          <div className="mt-1.5 pl-8 space-y-1">
            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">A.</span>
              <span className="w-64 inline-block uppercase font-sans">OLEH PEJABAT</span>
              <span className="mx-2 font-semibold text-black shrink-0">:</span>
              <span className="font-bold text-black uppercase leading-tight">{pegawai.skOlehPejabat}</span>
            </div>

            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">B.</span>
              <span className="w-64 inline-block uppercase font-sans">TANGGAL DAN NOMOR</span>
              <span className="mx-2 font-semibold text-black shrink-0">:</span>
              <span className="font-bold text-black uppercase">
                {formatFriendlyDate(pegawai.skTanggal)} / {pegawai.skNomor}
              </span>
            </div>

            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">C.</span>
              <span className="w-64 inline-block uppercase font-sans">TANGGAL MULAI BERLAKU GAJI</span>
              <span className="mx-2 font-semibold text-black shrink-0">:</span>
              <span className="font-bold text-black uppercase">{formatFriendlyDate(pegawai.skTglMulaiBerlaku)}</span>
            </div>

            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">D.</span>
              <span className="w-64 inline-block uppercase font-sans">MASA KERJA PADA TANGGAL TERSEBUT</span>
              <span className="mx-2 font-semibold text-black shrink-0">:</span>
              <span className="font-bold text-black uppercase">
                {pegawai.skMasaKerjaTahun} Tahun {pegawai.skMasaKerjaBulan} Bulan
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: DIBERIKAN KENAIKAN GAJI BERKALA SEHINGGA MEMPEROLEH */}
        <div className="mt-4 py-1.5 text-center text-black">
          <h4 className="text-[10.5pt] print:text-[9.5pt] font-extrabold text-black tracking-wide uppercase">
            DIBERIKAN KENAIKAN GAJI BERKALA SEHINGGA MEMPEROLEH :
          </h4>
        </div>

        {/* LIST 7-11: NEW SALARY BENEFIT DETAILS */}
        <div className="mt-3 pl-4 text-[10pt] print:text-[8.8pt] leading-relaxed space-y-1 text-black">
          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">7.</span>
            <span className="w-72 shrink-0 inline-block uppercase text-black">GAJI POKOK BARU</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-extrabold text-black flex-1">
              {formatRupiah(pegawai.gajiPokokBaru)}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">8.</span>
            <span className="w-72 shrink-0 inline-block uppercase text-black">BERDASARKAN MASA KERJA GOLONGAN</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-bold text-black flex-1">
              {pegawai.mkTahunBaru} Tahun {pegawai.mkBulanBaru} Bulan
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">9.</span>
            <span className="w-72 shrink-0 inline-block uppercase text-black">DALAM PANGKAT/GOLONGAN RUANG</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-bold text-black uppercase flex-1">{pegawai.pangkatGolongan}</span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">10.</span>
            <span className="w-72 shrink-0 inline-block uppercase font-bold text-black">TERHITUNG MULAI TANGGAL</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-extrabold text-black flex-1">{formatFriendlyDate(pegawai.tmtBaru)}</span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">11.</span>
            <span className="w-72 shrink-0 inline-block uppercase text-black">KENAIKAN YANG AKAN DATANG BILA MEMENUHI SYARAT</span>
            <span className="mx-2 font-semibold text-black shrink-0">:</span>
            <span className="font-bold text-black flex-1">{formatFriendlyDate(pegawai.tmtAkanDatang)}</span>
          </div>
        </div>

        {/* LEGISLATION INSTRUCTION FOOTER */}
        <div className="mt-4 text-[10pt] print:text-[8.8pt] text-justify leading-relaxed font-sans first-letter:uppercase text-black">
          <p>
            Diharapkan kepada Pegawai tersebut dibayarkan penghasilan gaji pokok baru sesuai dengan <span className="font-bold underline">{regulasi}</span>.
          </p>
        </div>
      </div>      {/* FOOTER SECTION: SIGNATURE & COPIES (TEMBUSAN) - Placed at the very bottom */}
      <div className="mt-8 pt-4 flex flex-col space-y-4 text-[10pt] print:text-[8.8pt] leading-normal font-sans text-black">
        
        {/* Signature Block (on the right) */}
        <div className="flex justify-end w-full">
          <div className="w-[360px] print:w-[350px] flex flex-col items-center justify-start text-center pl-1 select-none">
            <span className="block font-bold text-black uppercase text-center w-full text-[10pt] print:text-[8.8pt]">
              {settings.spesimen.jabatanLengkap},
            </span>
            
            {/* DIGITAL SIGNATURE / TTE BLOCK */}
            {useTTE ? (
              <div className="my-2 py-3 px-4 bg-white border border-black rounded-[14px] flex items-center space-x-3.5 text-left w-full select-none min-h-[90px] print:min-h-[85px]">
                {/* Custom Seal Indicator */}
                <div className="w-[56px] h-[56px] bg-white shrink-0 flex items-center justify-center overflow-hidden">
                  {settings.spesimen.tteLogoType && settings.spesimen.tteLogoType !== "bawaan" && settings.spesimen.customTteLogoUrl ? (
                    <img 
                      src={settings.spesimen.customTteLogoUrl} 
                      alt="TTE Segel" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* High-fidelity SVG of the BSrE/Jabar style digital signature seal */
                    <svg viewBox="0 0 100 100" className="w-[46px] h-[46px]" xmlns="http://www.w3.org/2000/svg">
                      {/* Top dots */}
                      <circle cx="50" cy="15" r="3" fill="#0ea5e9" />
                      <circle cx="50" cy="23" r="3" fill="#0ea5e9" />
                      <circle cx="50" cy="31" r="3" fill="#0ea5e9" />
                      
                      {/* Left and right brackets/capsules resembling fingerprint */}
                      <path d="M40,35 H60" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M30,42 H70" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Fingerprint ridges */}
                      <path d="M42,50 C42,46 58,46 58,50 C58,62 46,62 46,72" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <path d="M36,50 C36,41 64,41 64,50 C64,68 52,68 52,78 M52,84" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <path d="M30,50 C30,36 70,36 70,50 C70,74 58,74 58,84" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      
                      {/* Verification badge/shield decor */}
                      <circle cx="36" cy="56" r="2.5" fill="#0ea5e9" />
                      <circle cx="64" cy="56" r="2.5" fill="#10b981" />
                    </svg>
                  )}
                </div>
                <div className="text-[7.2pt] print:text-[6.6pt] leading-tight text-black font-sans flex-1 overflow-hidden pr-1">
                  <span className="block text-slate-805 italic leading-tight mb-0.5 whitespace-pre-wrap">
                    {settings.spesimen.tteHeader || "Ditandatangani secara elektronik oleh:"}
                  </span>
                  <span className="block font-bold text-black uppercase leading-tight tracking-wide mb-0.5 text-[7.2pt] print:text-[6.6pt] break-words">
                    {settings.spesimen.jabatanLengkap}
                  </span>
                  {/* Space between Office Title and Official Name */}
                  <div className="h-[14px] print:h-[12px]" />
                  <span className="block font-bold text-black leading-tight text-[8.2pt] print:text-[7.6pt] break-words">
                    {formatNamaDanGelar(settings.spesimen.namaPejabat)}
                  </span>
                  <span className="block text-slate-700 font-medium font-sans break-words mt-0.5 text-[7.2pt] print:text-[6.6pt]">
                    {settings.spesimen.pangkatPangkat}
                    {!isPPPK && settings.spesimen.golonganRuang && `/${settings.spesimen.golonganRuang}`}
                  </span>
                </div>
              </div>
            ) : (
              /* MANUAL SIGNATURE SPACE IN PNS - COMPLETELY BLANK FOR WET SIGNATURE & PHYSICAL STAMP */
              <div className="h-24 print:h-20 w-full" />
            )}

            {/* CHIEF IDENTIFICATION BLOCK (Only visible if not using TTE) */}
            {!useTTE && (
              <div className="w-full text-center text-black">
                <span className="block font-extrabold text-black underline text-[10pt] print:text-[8.8pt] break-words">
                  {formatNamaDanGelar(settings.spesimen.namaPejabat)}
                </span>
                <span className="block text-[9pt] print:text-[8pt] text-black font-semibold uppercase mt-0.5 break-words">
                  {settings.spesimen.pangkatPangkat}
                  {!isPPPK && settings.spesimen.golonganRuang && `, ${settings.spesimen.golonganRuang}`}
                </span>
                <span className="block font-mono print:font-sans text-[8.5pt] print:text-[7.8pt] text-black mt-0.5 font-semibold">
                  NIP. {settings.spesimen.nip}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tembusan section moved below signature dynamically, aligned bottom-left */}
        <div className="w-full text-left space-y-1.5 pt-1 text-black">
          <span className="block font-bold uppercase text-black tracking-wider text-[7.5pt] print:text-[7pt]">
            Tembusan : disampaikan kepada Yth :
          </span>
          <ol className="list-decimal list-inside pl-1 space-y-0.5 text-[7.5pt] print:text-[6.8pt] text-black font-normal">
            {tembusanList.map((item, id) => (
              <li key={id} className="leading-snug text-left truncate max-w-xl text-black">
                {item}
              </li>
            ))}
          </ol>
        </div>

      </div>

    </div>
  );
}
