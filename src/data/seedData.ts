/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pegawai, SystemSettings, ActivityLog, StaffUser } from "../types";

export const initialPegawaiList: Pegawai[] = [
  {
    id: "peg-1",
    nama: "WIKA NAJMUDIN, S.Pd.",
    tempatLahir: "TASIKMALAYA",
    tanggalLahir: "1981-09-05",
    nip: "198109052024211004",
    pangkatGolongan: "IX",
    jabatan: "GURU AHLI PERTAMA - PPKN",
    unitKerja: "SMKN CIMERAK KABUPATEN PANGANDARAN",
    gajiPokokLama: 3203600,
    noHp: "081234567812",
    email: "wika.najmudin@sch.id",
    skOlehPejabat: "GUBERNUR JAWA BARAT",
    skNomor: "Kep.208/KPG.02/PPIK/2024",
    skTanggal: "2024-02-29",
    skTglMulaiBerlaku: "2024-03-01",
    skMasaKerjaTahun: 0,
    skMasaKerjaBulan: 0,
    hasPMK: false,
    gajiPokokBaru: 3304400,
    mkTahunBaru: 2,
    mkBulanBaru: 0,
    tmtBaru: "2026-03-01",
    tmtAkanDatang: "2028-03-01",
    statusKGB: "Selesai"
  },
  {
    id: "peg-2",
    nama: "RADEN IHLAS RADESA, S. Pd., M. Pd.",
    tempatLahir: "CIAMIS",
    tanggalLahir: "1974-12-28",
    nip: "197412282007011009",
    pangkatGolongan: "PENATA Tk. I, III/d",
    jabatan: "GURU AHLI MUDA",
    unitKerja: "SMA NEGERI 1 CIHAURBEUTI",
    gajiPokokLama: 4042500,
    noHp: "082155427845",
    email: "raden.ihlas@sman1cihaurbeuti.sch.id",
    skOlehPejabat: "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII",
    skNomor: "NO.1658/KPG.14.KCD-XIII",
    skTanggal: "2024-02-21",
    skTglMulaiBerlaku: "2024-06-01",
    skMasaKerjaTahun: 16,
    skMasaKerjaBulan: 10,
    hasPMK: false,
    gajiPokokBaru: 4169900,
    mkTahunBaru: 18,
    mkBulanBaru: 0,
    tmtBaru: "2026-06-01",
    tmtAkanDatang: "2028-06-01",
    statusKGB: "Selesai"
  },
  {
    id: "peg-3",
    nama: "H. REZA ARDIANSYAH, S.E., M.M.",
    tempatLahir: "CIAMIS",
    tanggalLahir: "1978-04-12",
    nip: "197804122009021003",
    pangkatGolongan: "PENATA, III/c",
    jabatan: "ANALIS KEPEGAWAIAN MUDA",
    unitKerja: "CABANG DINAS PENDIDIKAN WILAYAH XIII",
    gajiPokokLama: 3802500,
    noHp: "081344558291",
    email: "reza.ardiansyah@jabarprov.go.id",
    skOlehPejabat: "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII",
    skNomor: "0945/KPG.14/KCD XIII",
    skTanggal: "2024-07-15",
    skTglMulaiBerlaku: "2024-08-01",
    skMasaKerjaTahun: 14,
    skMasaKerjaBulan: 6,
    hasPMK: true,
    pmkTahun: 2,
    pmkBulan: 0,
    pmkNomor: "SK-PMK-002/2024",
    pmkTanggal: "2024-05-10",
    gajiPokokBaru: 3950600,
    mkTahunBaru: 18,
    mkBulanBaru: 6,
    tmtBaru: "2026-08-01",
    tmtAkanDatang: "2028-08-01",
    statusKGB: "Mendekati Jatuh Tempo"
  },
  {
    id: "peg-4",
    nama: "NINA HERLINA, S.Pd., M.Pd.",
    tempatLahir: "BANDUNG",
    tanggalLahir: "1983-02-15",
    nip: "198302152010012015",
    pangkatGolongan: "PENATA, III/c",
    jabatan: "GURU MADYA",
    unitKerja: "SMAN 2 CIAMIS",
    gajiPokokLama: 3602400,
    noHp: "085324567800",
    email: "nina.herlina@mail.com",
    skOlehPejabat: "KEPALA DINAS PENDIDIKAN PROVINSI JAWA BARAT",
    skNomor: "1230/KPG.12/KCD-XIII",
    skTanggal: "2024-06-12",
    skTglMulaiBerlaku: "2024-07-01",
    skMasaKerjaTahun: 12,
    skMasaKerjaBulan: 4,
    hasPMK: false,
    gajiPokokBaru: 3710500,
    mkTahunBaru: 14,
    mkBulanBaru: 4,
    tmtBaru: "2026-07-01",
    tmtAkanDatang: "2028-07-01",
    statusKGB: "Perlu Diproses"
  },
  {
    id: "peg-5",
    nama: "CECEP SURYANA, S.ST.",
    tempatLahir: "TASIKMALAYA",
    tanggalLahir: "1989-11-20",
    nip: "198911202021211005",
    pangkatGolongan: "IX",
    jabatan: "GURU AHLI PERTAMA - FISIKA",
    unitKerja: "SMKN 1 CIAMIS",
    gajiPokokLama: 3100200,
    noHp: "089876543210",
    email: "cecep.suryana@gmail.com",
    skOlehPejabat: "GUBERNUR JAWA BARAT",
    skNomor: "Kep.110/KPG.02/PPIK/2024",
    skTanggal: "2024-05-15",
    skTglMulaiBerlaku: "2024-06-01",
    skMasaKerjaTahun: 2,
    skMasaKerjaBulan: 0,
    hasPMK: false,
    gajiPokokBaru: 3200800,
    mkTahunBaru: 4,
    mkBulanBaru: 0,
    tmtBaru: "2026-06-01",
    tmtAkanDatang: "2028-06-01",
    statusKGB: "Perlu Diproses"
  }
];

export const initialSystemSettings: SystemSettings = {
  kop: {
    pemdaLine: "PEMERINTAH DAERAH PROVINSI JAWA BARAT",
    dinasLine: "DINAS PENDIDIKAN",
    cabdisLine: "CABANG DINAS PENDIDIKAN WILAYAH XIII",
    alamat: "Jalan Jenderal Ahmad Yani Nomor 101 Kecamatan Ciamis",
    kontak: "e-mail: cabdisdik13@jabarprov.go.id / kcdwilxiii@gmail.com",
    kabupatenZip: "CIAMIS – 46213"
  },
  spesimen: {
    namaPejabat: "DWI YANTI ESTRININGRUM, S.Sos., M.Pd.",
    pangkatPangkat: "Pembina Tk. I",
    golonganRuang: "IV/b",
    nip: "197202022005012011",
    jabatanLengkap: "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII",
    useTTEForPPPK: true,
    useTTEForPNS: false,
    tteSecuredText: "Ditandatangani secara elektronik oleh: KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII PROVINSI JAWA BARAT, DWI YANTI ESTRININGRUM, S.Sos., M.Pd. Pembina Tk. I"
  },
  nomorSuratCounter: "7469/KPG.14/KCD XIII",
  regulasiPNS: "Peraturan Presiden Nomor 05 Tahun 2024",
  regulasiPPPK: "Peraturan Pemerintah Nomor 11 Tahun 2024"
};

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-15T09:00:00Z",
    adminUser: "Super Admin",
    action: "Inisialisasi Sistem",
    detail: "Sistem SKGB diaktifkan pertama kali dengan data awal Cabdisdik XIII Jabar."
  },
  {
    id: "log-2",
    timestamp: "2026-06-15T10:15:30Z",
    adminUser: "Super Admin",
    action: "Ubah Pengaturan",
    detail: "Mengonfigurasi spesimen tanda tangan dan kop surat wilayah Kerja Ciamis."
  },
  {
    id: "log-3",
    timestamp: "2026-06-16T11:02:11Z",
    adminUser: "Super Admin",
    action: "Cetak SKGB",
    detail: "Mencetak SKGB PPPK untuk pegawai WIKA NAJMUDIN, S.Pd."
  }
];

export const initialStaffUserList: StaffUser[] = [
  {
    id: "staff-1",
    username: "admin",
    password: "jabar123",
    name: "Asep Sunandar (Super Admin)",
    role: "Administrasi KCD Wilayah XIII",
    createdAt: "2026-06-15T09:00:00Z",
    status: "Aktif"
  },
  {
    id: "staff-2",
    username: "stafkepeg1",
    password: "staf123",
    name: "Hj. Nina Karlina, S.IP.",
    role: "Staf Kepegawaian",
    createdAt: "2026-06-16T14:22:15Z",
    status: "Aktif"
  },
  {
    id: "staff-3",
    username: "stafkepeg2",
    password: "staf456",
    name: "Yudi Wahyudi, S.ST.",
    role: "Staf Kepegawaian",
    createdAt: "2026-06-17T08:12:00Z",
    status: "Aktif"
  }
];

