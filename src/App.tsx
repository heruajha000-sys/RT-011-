/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, onSnapshot, query } from 'firebase/firestore';
import {
  Home,
  Users,
  FileText,
  Wallet,
  Settings,
  Sun,
  Moon,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Building,
  Menu,
  X,
  Printer,
  Trash2,
  Edit,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  HelpCircle,
  LogOut,
  Bell,
  Camera,
  RefreshCcw,
  BarChart3,
  Package,
  HeartHandshake,
  Megaphone,
  Mail,
  FilePlus,
  ChevronDown,
  Copy,
  Save,
  Bookmark,
  Check,
  SlidersHorizontal,
  Landmark,
  ArrowDown,
  ArrowUp,
  PieChart,
  LayoutGrid,
  Archive,
  RotateCw,
  Wrench,
  ArrowLeft,
  ShoppingCart,
  Minus
} from 'lucide-react';

// Interfaces
interface Resident {
  id: string;
  nik: string;
  no_kk: string;
  nama: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  status_huni: 'Milik Sendiri' | 'Kontrak/Kos' | 'Menumpang' | 'Lainnya';
  perkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai';
  pekerjaan: string;
  telepon: string;
  alamat: string;
  is_kepala_keluarga: boolean;
  // New fields
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: string;
  status_warga?: 'AKTIF' | 'TIDAK AKTIF';
  status_domisili?: 'DALAM' | 'LUAR';
  pendidikan_terakhir?: string;
  asal_pendatang?: string;
  is_mode_bayi?: boolean;
}

interface Transaction {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: 'Pemasukan' | 'Pengeluaran';
  nominal: number;
  pencatat: string;
}

interface Announcement {
  id: string;
  tanggal: string;
  judul: string;
  isi: string;
  kategori: 'Penting' | 'Kegiatan' | 'Keuangan';
}

interface LetterRequest {
  id: string;
  nama: string;
  nik: string;
  jenis_surat: 'Surat Pengantar Domisili' | 'Surat Keterangan Kelahiran' | 'Surat Pengantar SKCK' | 'Surat Keterangan Tidak Mampu';
  keperluan: string;
  tanggal: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
}

interface MutationRecord {
  id: string;
  nama: string;
  nik: string;
  jenis_mutasi: 'Pindah Masuk' | 'Pindah Keluar' | 'Pindah RT';
  tanggal: string;
  keterangan: string;
}

const INITIAL_RESIDENTS: Resident[] = [
  {
    id: '1',
    nik: '3275011001850001',
    no_kk: '3275011001000001',
    nama: 'Budi Santoso',
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Kawin',
    pekerjaan: 'Karyawan Swasta',
    telepon: '081234567890',
    alamat: 'Jl. Melati No. 12, RT 011/RW 04',
    is_kepala_keluarga: true
  },
  {
    id: '2',
    nik: '3275014505880002',
    no_kk: '3275011001000001',
    nama: 'Siti Aminah',
    jenis_kelamin: 'Perempuan',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Kawin',
    pekerjaan: 'Ibu Rumah Tangga',
    telepon: '081234567891',
    alamat: 'Jl. Melati No. 12, RT 011/RW 04',
    is_kepala_keluarga: false
  },
  {
    id: '3',
    nik: '3275012203900003',
    no_kk: '3275011001000002',
    nama: 'Ahmad Fauzi',
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Kontrak/Kos',
    perkawinan: 'Kawin',
    pekerjaan: 'Wiraswasta',
    telepon: '081398765432',
    alamat: 'Jl. Melati No. 15, RT 011/RW 04',
    is_kepala_keluarga: true
  },
  {
    id: '4',
    nik: '3275010507950004',
    no_kk: '3275011001000003',
    nama: 'Dewi Lestari',
    jenis_kelamin: 'Perempuan',
    status_huni: 'Menumpang',
    perkawinan: 'Belum Kawin',
    pekerjaan: 'PNS/TNI/POLRI',
    telepon: '085678901234',
    alamat: 'Jl. Melati No. 18, RT 011/RW 04',
    is_kepala_keluarga: true
  },
  {
    id: '5',
    nik: '3275011212800005',
    no_kk: '3275011001000004',
    nama: 'Rian Hidayat',
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Kawin',
    pekerjaan: 'Karyawan Swasta',
    telepon: '081987654321',
    alamat: 'Jl. Mawar No. 8, RT 011/RW 04',
    is_kepala_keluarga: true
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    tanggal: '2026-10-18',
    keterangan: 'Iuran Kas Warga Bulanan Oktober (50 KK)',
    kategori: 'Pemasukan',
    nominal: 2500000,
    pencatat: 'Bendahara RT'
  },
  {
    id: 't2',
    tanggal: '2026-10-15',
    keterangan: 'Pembelian Lampu Jalan LED & Kabel',
    kategori: 'Pengeluaran',
    nominal: 350000,
    pencatat: 'Seksi Keamanan'
  },
  {
    id: 't3',
    tanggal: '2026-10-10',
    keterangan: 'Konsumsi Kerja Bakti Bulanan',
    kategori: 'Pengeluaran',
    nominal: 450000,
    pencatat: 'Ketua RT'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    tanggal: '20 Oct 2026',
    judul: 'Kerja Bakti Massal & Pembersihan Saluran Air',
    isi: 'Diharapkan kehadiran seluruh warga RT 011/RW 04 pada hari Minggu pukul 07.00 WIB membawa alat kebersihan masing-masing.',
    kategori: 'Kegiatan'
  },
  {
    id: 'a2',
    tanggal: '15 Oct 2026',
    judul: 'Pembayaran Iuran Kas Bulanan',
    isi: 'Batas akhir pembayaran iuran kas RT bulan Oktober adalah tanggal 25. Mohon diserahkan kepada bendahara atau via transfer.',
    kategori: 'Keuangan'
  }
];

const TEMPLATES_IMBAUAN = [
  {
    id: 'kerja-bakti',
    judul: 'IMBAUAN KERJA BAKTI',
    isi: 'Sehubungan dengan upaya menjaga kebersihan dan kenyamanan lingkungan, kami mengundang seluruh warga untuk hadir dan berpartisipasi dalam kegiatan Kerja Bakti yang akan dilaksanakan pada:',
    tanggal: 'Minggu, 26 Oktober 2026',
    waktu: '07:00 WIB s/d Selesai',
    tempat: 'Sepanjang Jalan Lingkungan RT.01/RW.02'
  },
  {
    id: 'keamanan-siskamling',
    judul: 'IMBAUAN KEAMANAN (SISKAMLING)',
    isi: 'Dalam rangka meningkatkan ketertiban dan pencegahan potensi gangguan keamanan di lingkungan warga, kami mengimbau seluruh warga untuk mematuhi jadwal ronda malam/siskamling serta meningkatkan kewaspadaan bersama pada:',
    tanggal: 'Mulai 1 November 2026',
    waktu: '22:00 - 04:00 WIB',
    tempat: 'Pos Ronda Lingkungan RT.01/RW.02'
  },
  {
    id: 'iuran-kas',
    judul: 'IMBAUAN IURAN/KAS',
    isi: 'Mengingatkan kepada seluruh bapak/ibu warga bahwa batas akhir pembayaran iuran kas lingkungan RT/RW untuk periode bulan ini akan jatuh tempo pada tanggal yang ditentukan. Pembayaran dapat diserahkan ke Bendahara atau transfer kas RT:',
    tanggal: 'Jatuh Tempo: Tgl 25 Setiap Bulan',
    waktu: '08:00 - 20:00 WIB',
    tempat: 'Sekretariat / Bendahara RT'
  },
  {
    id: 'hari-besar',
    judul: 'PEMBERITAHUAN HARI BESAR',
    isi: 'Dalam rangka menyambut dan menyemarakkan Peringatan Hari Besar Nasional / Keagamaan, kami mengimbau seluruh warga untuk berpartisipasi serta memasang perlengkapan hiasan/bendera di depan rumah masing-masing pada:',
    tanggal: 'Mulai Minggu Depan',
    waktu: 'Sepanjang Hari',
    tempat: 'Lingkungan Rumah Masing-masing'
  },
  {
    id: 'custom-kosong',
    judul: 'CUSTOM / KOSONG',
    isi: '',
    tanggal: '',
    waktu: '',
    tempat: ''
  }
];

const getAge = (tanggal_lahir?: string) => {
  if (!tanggal_lahir) return 0;
  let birthDate: Date;
  if (tanggal_lahir.includes('-')) {
    const parts = tanggal_lahir.split('-');
    if (parts[0].length === 4) {
      birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  } else if (tanggal_lahir.includes('/')) {
    const parts = tanggal_lahir.split('/');
    if (parts[2]?.length === 4) {
      birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
  } else {
    birthDate = new Date(tanggal_lahir);
  }
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
};

const JENIS_SURAT_OPTIONS = [
  'SURAT PENGANTAR',
  'SURAT KETERANGAN DOMISILI',
  'SURAT KETERANGAN USAHA',
  'SURAT KETERANGAN KELAHIRAN',
  'SURAT KETERANGAN KEMATIAN',
  'SURAT KETERANGAN TIDAK MAMPU',
  'SURAT PENGANTAR SKCK',
  'SURAT IZIN KERAMAIAN',
  'SURAT KEHILANGAN',
  'SURAT BEDA NAMA',
  'SURAT PENGANTAR NIKAH'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dash' | 'warga' | 'kk' | 'keuangan' | 'surat' | 'more' | 'mutasi' | 'inventaris' | 'bantuan'>('dash');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [rtNumber, setRtNumber] = useState<string>('011');
  const [rwNumber, setRwNumber] = useState<string>('04');
  const [isTrialMode, setIsTrialMode] = useState<boolean>(true);

  // Data states
  const [residents, setResidents] = useState<Resident[]>([]); // Initialize empty
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [letterRequests, setLetterRequests] = useState<LetterRequest[]>([
    {
      id: 'l1',
      nama: 'Ahmad Fauzi',
      nik: '3275012203900003',
      jenis_surat: 'Surat Pengantar Domisili',
      keperluan: 'Keperluan Pembuatan Rekening Bank',
      tanggal: '2026-10-20',
      status: 'Disetujui'
    }
  ]);

  // Load residents from Firestore
  useEffect(() => {
    const q = query(collection(db, 'residents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const residentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resident[];
      setResidents(residentsData);
    });
    return () => unsubscribe();
  }, []);

  // UI state filters
  const [demographicTab, setDemographicTab] = useState<'statusHuni' | 'perkawinan' | 'pekerjaan'>('statusHuni');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [huniFilter, setHuniFilter] = useState<'ALL' | 'TETAP' | 'PENDATANG'>('ALL'); // Separated filter
  const [ktpFilter, setKtpFilter] = useState<'ALL' | 'ADA_KTP' | 'TANPA_KTP'>('ALL'); // Separated filter
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Laki-laki' | 'Perempuan'>('ALL');
  const [kkFilter, setKkFilter] = useState<'ALL' | 'TUNGGAL'>('ALL');
  const [kkSearchQuery, setKkSearchQuery] = useState<string>('');
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showAgeModal, setShowAgeModal] = useState<boolean>(false);
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [appliedMinAge, setAppliedMinAge] = useState<string>('');
  const [appliedMaxAge, setAppliedMaxAge] = useState<string>('');
  const [isZeroMode, setIsZeroMode] = useState<boolean>(false); // Allow toggling between 0 data (like screenshot) and demo data!
  const [showKkOptionsModal, setShowKkOptionsModal] = useState<boolean>(false);
  const [kkRtFilter, setKkRtFilter] = useState<string>('Semua RT');
  const [kkSortOrder, setKkSortOrder] = useState<string>('Terbaru');
  const [showMoreLainnyaModal, setShowMoreLainnyaModal] = useState<boolean>(false);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [mutationSearch, setMutationSearch] = useState<string>('');
  const [showAddMutationModal, setShowAddMutationModal] = useState<boolean>(false);
  const [newMutation, setNewMutation] = useState<Partial<MutationRecord>>({
    jenis_mutasi: 'Pindah Masuk',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // Modals
  const [showAddResidentModal, setShowAddResidentModal] = useState<boolean>(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState<boolean>(false);
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);
  const [selectedKK, setSelectedKK] = useState<string | null>(null);

  // New Resident Form
  const [newResident, setNewResident] = useState<Partial<Resident>>({
    jenis_kelamin: 'Laki-laki',
    status_huni: 'Milik Sendiri',
    perkawinan: 'Belum Kawin',
    pekerjaan: 'Karyawan Swasta',
    is_kepala_keluarga: false
  });

  // New Transaction Form
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    kategori: 'Pemasukan',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // New Letter Request Form
  const [newLetter, setNewLetter] = useState<Partial<LetterRequest>>({
    jenis_surat: 'Surat Pengantar Domisili'
  });

  // Surat System States (Matching screenshot)
  const [suratSubTab, setSuratSubTab] = useState<'warga' | 'imbauan' | 'pengaturan'>('warga');
  const [selectedJenisSurat, setSelectedJenisSurat] = useState<string>('SURAT PENGANTAR');
  const [showJenisSuratModal, setShowJenisSuratModal] = useState<boolean>(false);
  const [selectedResidentForSurat, setSelectedResidentForSurat] = useState<Resident | null>(null);
  const [keperluanSurat, setKeperluanSurat] = useState<string>('');
  const [showSelectResidentModal, setShowSelectResidentModal] = useState<boolean>(false);
  const [residentSearchForSurat, setResidentSearchForSurat] = useState<string>('');
  const [showLetterPreviewModal, setShowLetterPreviewModal] = useState<boolean>(false);
  const [showDraftsModal, setShowDraftsModal] = useState<boolean>(false);
  const [showInOutModal, setShowInOutModal] = useState<boolean>(false);
  const [inOutTab, setInOutTab] = useState<'keluar' | 'masuk'>('keluar');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePreviewLetter, setActivePreviewLetter] = useState<{
    nomorSurat: string;
    jenisSurat: string;
    nama: string;
    nik: string;
    no_kk?: string;
    jenis_kelamin?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    agama?: string;
    pekerjaan?: string;
    alamat: string;
    keperluan: string;
    tanggal: string;
  } | null>(null);

  const [letterDrafts, setLetterDrafts] = useState<Array<{
    id: string;
    jenisSurat: string;
    nama: string;
    nik: string;
    keperluan: string;
    savedAt: string;
    resident?: Resident | null;
  }>>([
    {
      id: 'd1',
      jenisSurat: 'SURAT PENGANTAR',
      nama: 'Budi Santoso',
      nik: '3275011001850001',
      keperluan: 'Persyaratan perpanjangan Surat Izin Mengemudi (SIM A/C) di Satlantas',
      savedAt: '21 Okt 2026, 14:20',
      resident: INITIAL_RESIDENTS[0]
    }
  ]);

  const [inOutLetters, setInOutLetters] = useState<Array<{
    id: string;
    tipe: 'KELUAR' | 'MASUK';
    nomorSurat: string;
    jenisSurat: string;
    namaPemohon: string;
    nik: string;
    alamat: string;
    tanggal: string;
    keperluan: string;
    status: string;
  }>>([
    {
      id: 'io1',
      tipe: 'KELUAR',
      nomorSurat: '014/RT.011-RW.04/X/2026',
      jenisSurat: 'SURAT PENGANTAR',
      namaPemohon: 'Ahmad Fauzi',
      nik: '3275012203900003',
      alamat: 'Jl. Melati No. 15, RT 011/RW 04',
      tanggal: '20 Okt 2026',
      keperluan: 'Pendaftaran Seleksi Calon Pegawai Negeri Sipil (CPNS)',
      status: 'Terbit'
    },
    {
      id: 'io2',
      tipe: 'KELUAR',
      nomorSurat: '013/RT.011-RW.04/X/2026',
      jenisSurat: 'SURAT KETERANGAN DOMISILI',
      namaPemohon: 'Dewi Lestari',
      nik: '3275010507950004',
      alamat: 'Jl. Melati No. 18, RT 011/RW 04',
      tanggal: '18 Okt 2026',
      keperluan: 'Pembukaan Rekening Bank BCA Cabang Pondok Gede',
      status: 'Terbit'
    },
    {
      id: 'io3',
      tipe: 'MASUK',
      nomorSurat: '400/12/Kel.JB/X/2026',
      jenisSurat: 'Surat Edaran Lurah',
      namaPemohon: 'Kelurahan Jatibening',
      nik: '-',
      alamat: 'Kantor Kelurahan Jatibening',
      tanggal: '15 Okt 2026',
      keperluan: 'Gerakan Bersama Pemberantasan Sarang Nyamuk (PSN) 3M Plus',
      status: 'Diarsipkan'
    }
  ]);

  const [suratConfig, setSuratConfig] = useState({
    kabupaten: 'SERANG',
    kecamatan: 'PAMARAYAN',
    kelurahan: 'SANGIANG',
    kota: 'Serang',
    namaKetuaRT: 'Budi Santoso',
    nikKetuaRT: '3275011001850001',
    namaKetuaRW: 'Drs. H. Mulyadi',
    formatNomor: 'RT.011/RW.04',
    alamatSekretariat: 'Kp. Barani, RT 011 / RW 04, Desa Sangiang, Kec. Pamarayan, Serang, Banten - Kode Pos: 42179'
  });

  // State Surat Imbauan (matching screenshot IMG_20261023_005852_10ecbb9a.jpg)
  const [kopFull, setKopFull] = useState<boolean>(false);
  const [kopImage, setKopImage] = useState<string | null>(null);
  const [selectedTemplateImbauan, setSelectedTemplateImbauan] = useState<string>('IMBAUAN KERJA BAKTI');
  const [showTemplateImbauanDropdown, setShowTemplateImbauanDropdown] = useState<boolean>(false);
  const [autoGenerateNomorImbauan, setAutoGenerateNomorImbauan] = useState<boolean>(true);
  const [kodeWilayahImbauan, setKodeWilayahImbauan] = useState<string>('RT.011/RW.04');
  const [formatTandaTanganImbauan, setFormatTandaTanganImbauan] = useState<string>('RT & Sekretaris');
  const [showTandaTanganDropdown, setShowTandaTanganDropdown] = useState<boolean>(false);
  const [perihalImbauan, setPerihalImbauan] = useState<string>('IMBAUAN KERJA BAKTI');
  const [isiSuratImbauan, setIsiSuratImbauan] = useState<string>(
    'Sehubungan dengan upaya menjaga kebersihan dan kenyamanan lingkungan, kami mengundang seluruh warga untuk hadir dan berpartisipasi dalam kegiatan Kerja Bakti yang akan dilaksanakan pada:'
  );
  const [tanggalImbauan, setTanggalImbauan] = useState<string>('Minggu, 26 Oktober 2026');
  const [waktuImbauan, setWaktuImbauan] = useState<string>('07:00 WIB s/d Selesai');
  const [tempatImbauan, setTempatImbauan] = useState<string>('Sepanjang Jalan Lingkungan RT.01/RW.02');
  const [showImbauanPreviewModal, setShowImbauanPreviewModal] = useState<boolean>(false);

  // State Pengaturan Surat (matching IMG_20261023_015542_ea265ed8.jpg)
  const [tampilkanSekretaris, setTampilkanSekretaris] = useState<boolean>(true);
  const [tampilkanBendahara, setTampilkanBendahara] = useState<boolean>(false);
  const [tampilkanKetuaRW, setTampilkanKetuaRW] = useState<boolean>(false);
  const [showKelolaTemplateModal, setShowKelolaTemplateModal] = useState<boolean>(false);
  const [customTemplates, setCustomTemplates] = useState<Array<{ id: string; nama: string; konten: string }>>([
    {
      id: 'ct1',
      nama: 'Template Surat Edaran Waspada Bencana',
      konten: 'Sehubungan dengan tingginya curah hujan, dimohon seluruh warga RT/RW meningkatkan kesiapsiagaan...'
    }
  ]);
  const [newTemplateNama, setNewTemplateNama] = useState<string>('');
  const [newTemplateKonten, setNewTemplateKonten] = useState<string>('');

  // State Keuangan (matching Screenshot_2026-10-24-01-59-02-76_ef9df8ce568b803c96504800499ab560_9121e96a.jpg)
  const [selectedDompet, setSelectedDompet] = useState<string>('Semua Dompet');
  const [showDompetModal, setShowDompetModal] = useState<boolean>(false);
  const [showAturDompetModal, setShowAturDompetModal] = useState<boolean>(false);
  const [dompetList, setDompetList] = useState<Array<{ id: string; nama: string; saldo: number; noRek?: string }>>([
    { id: 'd1', nama: 'Kas Utama RT', saldo: 2500000, noRek: 'BCA 82190219' },
    { id: 'd2', nama: 'Kas Sosial & Duka', saldo: 850000, noRek: 'Mandiri 123009' },
    { id: 'd3', nama: 'Kas Ronda & Keamanan', saldo: 400000, noRek: 'Tunai Kasir' }
  ]);
  const [filterBulanKeuangan, setFilterBulanKeuangan] = useState<string>('SEMUA BULAN');
  const [filterTahunKeuangan, setFilterTahunKeuangan] = useState<string>('2026');
  const [showBulanDropdown, setShowBulanDropdown] = useState<boolean>(false);
  const [showTahunDropdown, setShowTahunDropdown] = useState<boolean>(false);
  const [showSearchKeuangan, setShowSearchKeuangan] = useState<boolean>(false);
  const [searchKeuanganQuery, setSearchKeuanganQuery] = useState<string>('');
  const [showNeracaModal, setShowNeracaModal] = useState<boolean>(false);
  const [showTambahDompetModal, setShowTambahDompetModal] = useState<boolean>(false);
  const [newDompetData, setNewDompetData] = useState<{ nama: string; nomor: string; pemilik: string; jenis: 'bank' | 'tunai' }>({
    nama: '',
    nomor: '',
    pemilik: '',
    jenis: 'bank'
  });

  // State Inventaris RT/RW (Matching Screenshot_2026-10-24-15-32-52-92_ef9df8ce568b803c96504800499ab560_afe6c87d.jpg)
  const [inventarisSubTab, setInventarisSubTab] = useState<'master' | 'riwayat'>('master');
  const [inventarisItems, setInventarisItems] = useState<Array<{
    id: string;
    nama: string;
    kode: string;
    kategori: string;
    jumlahTotal: number;
    diLuar: number;
    diDalam: number;
    kondisiBaik: number;
    kondisiRusak: number;
    lokasi: string;
  }>>([
    {
      id: 'inv1',
      nama: 'Tenda Serbaguna RT 3x6m',
      kode: 'INV-001',
      kategori: 'Perlengkapan Event',
      jumlahTotal: 2,
      diLuar: 1,
      diDalam: 1,
      kondisiBaik: 2,
      kondisiRusak: 0,
      lokasi: 'Gudang Pos Ronda'
    },
    {
      id: 'inv2',
      nama: 'Kursi Lipat Chitose',
      kode: 'INV-002',
      kategori: 'Mebel',
      jumlahTotal: 50,
      diLuar: 10,
      diDalam: 40,
      kondisiBaik: 48,
      kondisiRusak: 2,
      lokasi: 'Sekretariat RT'
    },
    {
      id: 'inv3',
      nama: 'Sound System & Mic Wireless',
      kode: 'INV-003',
      kategori: 'Elektronik',
      jumlahTotal: 1,
      diLuar: 0,
      diDalam: 1,
      kondisiBaik: 1,
      kondisiRusak: 0,
      lokasi: 'Rumah Ketua RT'
    }
  ]);

  const [peminjamanLogs, setPeminjamanLogs] = useState<Array<{
    id: string;
    namaBarang: string;
    peminjam: string;
    jumlah: number;
    tanggalPinjam: string;
    tanggalKembaliTarget: string;
    status: 'Dipinjam' | 'Dikembalikan';
  }>>([
    {
      id: 'pmj1',
      namaBarang: 'Tenda Serbaguna RT 3x6m',
      peminjam: 'Bapak Slamet (No. 12)',
      jumlah: 1,
      tanggalPinjam: '22 Okt 2026',
      tanggalKembaliTarget: '25 Okt 2026',
      status: 'Dipinjam'
    },
    {
      id: 'pmj2',
      namaBarang: 'Kursi Lipat Chitose',
      peminjam: 'Ibu Rahma (No. 08)',
      jumlah: 10,
      tanggalPinjam: '20 Okt 2026',
      tanggalKembaliTarget: '22 Okt 2026',
      status: 'Dikembalikan'
    }
  ]);

  const [searchInventarisQuery, setSearchInventarisQuery] = useState<string>('');
  const [filterKondisiInventaris, setFilterKondisiInventaris] = useState<string>('SEMUA');
  const [peminjamanFilter, setPeminjamanFilter] = useState<'Semua' | 'Dipinjam' | 'Dikembalikan'>('Semua');
  const [showAddInventarisModal, setShowAddInventarisModal] = useState<boolean>(false);
  const [showPinjamInventarisModal, setShowPinjamInventarisModal] = useState<boolean>(false);
  const [newInventaris, setNewInventaris] = useState({
    nama: '',
    kode: '',
    kategori: 'Perlengkapan RT',
    jumlahTotal: 1,
    lokasi: 'Sekretariat RT'
  });
  const [selectedCartItems, setSelectedCartItems] = useState<Array<{ id: string; nama: string; jumlah: number }>>([]);
  const [peminjamType, setPeminjamType] = useState<'warga' | 'luar'>('warga');
  const [selectedWargaPeminjamForPinjam, setSelectedWargaPeminjamForPinjam] = useState<Resident | null>(null);
  const [namaPeminjamLuar, setNamaPeminjamLuar] = useState<string>('');
  const [keteranganAcara, setKeteranganAcara] = useState<string>('');
  const [tanggalPinjamInput, setTanggalPinjamInput] = useState<string>('24 Oktober 2026');
  const [targetKembaliInput, setTargetKembaliInput] = useState<string>('');
  const [showSelectBarangModal, setShowSelectBarangModal] = useState<boolean>(false);
  const [showSelectResidentForPinjamModal, setShowSelectResidentForPinjamModal] = useState<boolean>(false);

  // State Manajemen Bantuan (Matching Screenshot_2026-10-24-16-26-47-99_ef9df8ce568b803c96504800499ab560_e482c337.jpg)
  const [bantuanCategories, setBantuanCategories] = useState<string[]>(['Semua', 'Bansos', 'MBG', 'Duafa']);
  const [activeBantuanCategory, setActiveBantuanCategory] = useState<string>('Duafa');
  const [searchBantuanQuery, setSearchBantuanQuery] = useState<string>('');
  const [bantuanPrograms, setBantuanPrograms] = useState<Array<{
    id: string;
    nama: string;
    kategori: string;
    tanggal: string;
    targetPenerima: number;
    anggaranPerPenerima: number;
    keterangan: string;
  }>>([]);
  const [showBuatProgramModal, setShowBuatProgramModal] = useState<boolean>(false);
  const [showAddBantuanCategoryModal, setShowAddBantuanCategoryModal] = useState<boolean>(false);
  const [newBantuanCategoryName, setNewBantuanCategoryName] = useState<string>('');
  const [newBantuanProgram, setNewBantuanProgram] = useState({
    nama: '',
    kategori: 'Duafa',
    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    targetPenerima: 10,
    anggaranPerPenerima: 150000,
    keterangan: ''
  });

  const handleSaveImbauanDraft = () => {
    const newDraft = {
      id: 'd_imbauan_' + Date.now(),
      jenisSurat: 'SURAT IMBAUAN: ' + perihalImbauan,
      nama: 'Seluruh Warga ' + kodeWilayahImbauan,
      nik: '-',
      keperluan: perihalImbauan + ' - ' + isiSuratImbauan.slice(0, 80) + '...',
      savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      resident: null
    };
    setLetterDrafts(prev => [newDraft, ...prev]);
    showToast('Draft surat imbauan berhasil disimpan!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateAndPreview = () => {
    const pemohon = selectedResidentForSurat || (residents.length > 0 ? residents[0] : INITIAL_RESIDENTS[0]);
    if (!pemohon) {
      showToast('Pilih data warga pemohon terlebih dahulu!');
      setShowSelectResidentModal(true);
      return;
    }
    const purpose = keperluanSurat.trim() || 'Persyaratan administrasi kependudukan';
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const now = new Date();
    const romanMonth = romanMonths[now.getMonth()];
    const year = now.getFullYear();
    const seqNum = String(inOutLetters.filter(l => l.tipe === 'KELUAR').length + 1).padStart(3, '0');
    const letterNo = `${seqNum}/RT.${rtNumber}-RW.${rwNumber}/${romanMonth}/${year}`;

    const letterData = {
      nomorSurat: letterNo,
      jenisSurat: selectedJenisSurat,
      nama: pemohon.nama,
      nik: pemohon.nik,
      no_kk: pemohon.no_kk,
      jenis_kelamin: pemohon.jenis_kelamin,
      tempat_lahir: pemohon.tempat_lahir || 'Bekasi',
      tanggal_lahir: pemohon.tanggal_lahir || '1990-01-01',
      agama: pemohon.agama || 'Islam',
      pekerjaan: pemohon.pekerjaan || 'Wiraswasta',
      alamat: pemohon.alamat || `Jl. Lingkungan RT ${rtNumber}/RW ${rwNumber}`,
      keperluan: purpose,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setActivePreviewLetter(letterData);
    setShowLetterPreviewModal(true);

    const newLog = {
      id: 'io_' + Date.now(),
      tipe: 'KELUAR' as const,
      nomorSurat: letterNo,
      jenisSurat: selectedJenisSurat,
      namaPemohon: pemohon.nama,
      nik: pemohon.nik,
      alamat: letterData.alamat,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      keperluan: purpose,
      status: 'Terbit'
    };
    setInOutLetters(prev => [newLog, ...prev]);
  };

  const handleSaveDraft = () => {
    const pemohon = selectedResidentForSurat || (residents.length > 0 ? residents[0] : INITIAL_RESIDENTS[0]);
    const newDraft = {
      id: 'd_' + Date.now(),
      jenisSurat: selectedJenisSurat,
      nama: pemohon ? pemohon.nama : 'Warga RT 011',
      nik: pemohon ? pemohon.nik : '-',
      keperluan: keperluanSurat.trim() || 'Persyaratan administrasi pekerjaan',
      savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      resident: pemohon
    };
    setLetterDrafts(prev => [newDraft, ...prev]);
    showToast('Draft surat berhasil disimpan!');
  };


  // Calculations
  const activeResidents = isZeroMode ? [] : residents;
  const totalPenduduk = activeResidents.length;
  const totalKK = isZeroMode ? 0 : new Set(activeResidents.map(r => r.no_kk)).size;
  const totalKontrak = isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Kontrak/Kos').length;
  const totalLaki = isZeroMode ? 0 : activeResidents.filter(r => r.jenis_kelamin === 'Laki-laki').length;
  const totalPerempuan = isZeroMode ? 0 : activeResidents.filter(r => r.jenis_kelamin === 'Perempuan').length;

  const totalPemasukan = transactions.filter(t => t.kategori === 'Pemasukan').reduce((acc, t) => acc + t.nominal, 0);
  const totalPengeluaran = transactions.filter(t => t.kategori === 'Pengeluaran').reduce((acc, t) => acc + t.nominal, 0);
  const saldoKas = isZeroMode ? 0 : (totalPemasukan - totalPengeluaran);

  // Demographic breakdown counts
  const statusHuniCounts = {
    'Milik Sendiri': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Milik Sendiri').length,
    'Kontrak/Kos': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Kontrak/Kos').length,
    'Menumpang': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Menumpang').length,
    'Lainnya': isZeroMode ? 0 : activeResidents.filter(r => r.status_huni === 'Lainnya').length,
  };

  const perkawinanCounts = {
    'Belum Kawin': isZeroMode ? 0 : activeResidents.filter(r => r.perkawinan === 'Belum Kawin').length,
    'Kawin': isZeroMode ? 0 : activeResidents.filter(r => r.perkawinan === 'Kawin').length,
    'Cerai': isZeroMode ? 0 : activeResidents.filter(r => r.perkawinan === 'Cerai').length,
  };

  const pekerjaanCounts = activeResidents.reduce((acc: Record<string, number>, r) => {
    const job = r.pekerjaan || 'Lainnya';
    acc[job] = (acc[job] || 0) + 1;
    return acc;
  }, {});

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.nama || !newResident.nik) return;
    const item: Omit<Resident, 'id'> = {
      nik: newResident.nik || '',
      no_kk: newResident.no_kk || '327501' + Math.floor(1000000000 + Math.random() * 9000000000),
      nama: newResident.nama || '',
      jenis_kelamin: newResident.jenis_kelamin as any || 'Laki-laki',
      status_huni: newResident.status_huni as any || 'Milik Sendiri',
      perkawinan: newResident.perkawinan as any || 'Belum Kawin',
      pekerjaan: newResident.pekerjaan || 'Wiraswasta',
      telepon: newResident.telepon || '-',
      alamat: newResident.alamat || `Jl. Melati, RT ${rtNumber}/RW ${rwNumber}`,
      is_kepala_keluarga: !!newResident.is_kepala_keluarga,
      // Add new fields
      tempat_lahir: newResident.tempat_lahir,
      tanggal_lahir: newResident.tanggal_lahir,
      agama: newResident.agama,
      status_warga: newResident.status_warga,
      status_domisili: newResident.status_domisili,
      pendidikan_terakhir: newResident.pendidikan_terakhir,
      asal_pendatang: newResident.asal_pendatang,
      is_mode_bayi: newResident.is_mode_bayi
    };
    
    await addDoc(collection(db, 'residents'), item);
    
    setIsZeroMode(false);
    setShowAddResidentModal(false);
    setNewResident({ jenis_kelamin: 'Laki-laki', status_huni: 'Milik Sendiri', perkawinan: 'Belum Kawin', pekerjaan: 'Karyawan Swasta' });
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.keterangan || !newTx.nominal) return;
    const tx: Transaction = {
      id: 't_' + Date.now(),
      tanggal: newTx.tanggal || new Date().toISOString().split('T')[0],
      keterangan: newTx.keterangan || '',
      kategori: newTx.kategori as any || 'Pemasukan',
      nominal: Number(newTx.nominal) || 0,
      pencatat: 'Admin RT'
    };
    setTransactions([tx, ...transactions]);
    setShowAddTransactionModal(false);
    setNewTx({ kategori: 'Pemasukan', tanggal: new Date().toISOString().split('T')[0] });
  };

  const handleRequestLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetter.nama || !newLetter.keperluan) return;
    const req: LetterRequest = {
      id: 'l_' + Date.now(),
      nama: newLetter.nama,
      nik: newLetter.nik || '327501...',
      jenis_surat: newLetter.jenis_surat as any || 'Surat Pengantar Domisili',
      keperluan: newLetter.keperluan,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setLetterRequests([req, ...letterRequests]);
    setShowLetterModal(false);
    setNewLetter({ jenis_surat: 'Surat Pengantar Domisili' });
    alert('Permohonan surat berhasil dikirim ke pengurus RT!');
  };

  const formatDateIndo = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#121212] text-gray-100' : 'bg-gray-50 text-gray-900'} pb-24 transition-colors duration-200`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b ${isDarkMode ? 'bg-[#18181b]/90 border-gray-800 backdrop-blur-md' : 'bg-white/90 border-gray-200 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-lg">
            RT
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide">RT {rtNumber} / RW {rwNumber}</h1>
            <p className="text-xs text-gray-400">WargaKu Smart Neighborhood</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dash' && (
          <div className="space-y-4 animate-fade-in">
            {/* Title block */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Dashboard Statistik</h2>
                <p className="text-xs text-gray-400">Overview data warga lingkungan RT {rtNumber} / RW {rwNumber}</p>
              </div>
            </div>

            {/* Greeting Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-600/20">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs font-medium text-blue-100">{formatDateIndo()}</p>
              <h3 className="text-xl font-bold mt-0.5">Selamat Pagi, Admin!</h3>
              <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                Berikut adalah ringkasan data terkini lingkungan RT {rtNumber} / RW {rwNumber}.
              </p>
            </div>

            {/* Saldo Kas Card */}
            <div className={`p-4 rounded-2xl border transition ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80 shadow-lg' : 'bg-white border-gray-200 shadow-md'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">SALDO KAS</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight">
                Rp {saldoKas.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Status Keuangan Sehat</span>
              </div>
            </div>

            {/* Grid Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Penduduk */}
              <div 
                onClick={() => setActiveTab('warga')}
                className={`p-4 rounded-2xl border cursor-pointer transition hover:border-blue-500/50 relative overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>PENDUDUK</span>
                </div>
                <div className="text-2xl font-black">{totalPenduduk}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Terdata aktif</div>
                <Users className="absolute -right-4 -bottom-4 w-16 h-16 text-blue-500/5 pointer-events-none" />
              </div>

              {/* Kartu Keluarga */}
              <div 
                onClick={() => setActiveTab('kk')}
                className={`p-4 rounded-2xl border cursor-pointer transition hover:border-purple-500/50 relative overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>KARTU KELUARGA</span>
                </div>
                <div className="text-2xl font-black">{totalKK}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Kepala Keluarga</div>
                <FileText className="absolute -right-4 -bottom-4 w-16 h-16 text-purple-500/5 pointer-events-none" />
              </div>

              {/* Kontrak / Kos */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold mb-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>KONTRAK/KOS</span>
                </div>
                <div className="text-2xl font-black">{totalKontrak}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Warga menyewa</div>
                <Building className="absolute -right-4 -bottom-4 w-16 h-16 text-amber-500/5 pointer-events-none" />
              </div>

              {/* Gender ratio card */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center space-x-1 text-blue-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      <span>Laki-laki</span>
                    </span>
                    <span className="font-bold">{totalLaki}</span>
                  </div>
                  <div className="w-full bg-gray-700/40 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${totalPenduduk > 0 ? (totalLaki / totalPenduduk) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="flex items-center space-x-1 text-pink-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                      <span>Perempuan</span>
                    </span>
                    <span className="font-bold">{totalPerempuan}</span>
                  </div>
                  <div className="w-full bg-gray-700/40 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-pink-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${totalPenduduk > 0 ? (totalPerempuan / totalPenduduk) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistik Demografi Section */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Statistik Demografi</h3>
                  <p className="text-[11px] text-gray-400">Sebaran status huni & perkawinan</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-900/60 rounded-xl">
                <button
                  onClick={() => setDemographicTab('statusHuni')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'statusHuni' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Status Huni
                </button>
                <button
                  onClick={() => setDemographicTab('perkawinan')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'perkawinan' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Perkawinan
                </button>
                <button
                  onClick={() => setDemographicTab('pekerjaan')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${demographicTab === 'pekerjaan' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Pekerjaan
                </button>
              </div>

              {/* Demographics Content */}
              <div className="space-y-2 pt-1">
                {demographicTab === 'statusHuni' && (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-semibold tracking-wide">MILIK SENDIRI</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Milik Sendiri']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-semibold tracking-wide">KONTRAK/KOS</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Kontrak/Kos']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        <span className="text-xs font-semibold tracking-wide">MENUMPANG</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Menumpang']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                        <span className="text-xs font-semibold tracking-wide">LAINNYA</span>
                      </div>
                      <span className="text-xs font-bold">{statusHuniCounts['Lainnya']} Org</span>
                    </div>
                  </>
                )}

                {demographicTab === 'perkawinan' && (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-semibold tracking-wide">BELUM KAWIN</span>
                      </div>
                      <span className="text-xs font-bold">{perkawinanCounts['Belum Kawin']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-semibold tracking-wide">KAWIN</span>
                      </div>
                      <span className="text-xs font-bold">{perkawinanCounts['Kawin']} Org</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span className="text-xs font-semibold tracking-wide">CERAI</span>
                      </div>
                      <span className="text-xs font-bold">{perkawinanCounts['Cerai']} Org</span>
                    </div>
                  </>
                )}

                {demographicTab === 'pekerjaan' && (
                  Object.keys(pekerjaanCounts).length > 0 ? (
                    Object.entries(pekerjaanCounts).map(([job, count]) => (
                      <div key={job} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                          <span className="text-xs font-semibold tracking-wide uppercase">{job}</span>
                        </div>
                        <span className="text-xs font-bold">{count} Org</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-4 text-gray-400">Belum ada data pekerjaan</p>
                  )
                )}
              </div>
            </div>

            {/* Aktivitas Terkini */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Aktivitas Terkini</h3>
              </div>

              {announcements.length === 0 && transactions.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-xs">Belum ada aktivitas</p>
                  <p className="text-[10px] italic mt-1">* Lihat log selengkapnya di menu Log Aktivitas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {announcements.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-gray-900/30 border border-gray-800/40 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-400">{item.judul}</span>
                        <span className="text-[10px] text-gray-400">{item.tanggal}</span>
                      </div>
                      <p className="text-gray-300 line-clamp-2">{item.isi}</p>
                    </div>
                  ))}
                  <p className="text-[10px] text-center text-gray-400 italic pt-1">
                    * Lihat log selengkapnya di menu Log Aktivitas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DATA WARGA TAB */}
        {activeTab === 'warga' && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => setHuniFilter('ALL')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${huniFilter === 'ALL' ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>TOTAL WARGA</span>
                </div>
                <div className="text-2xl font-black">{residents.length}</div>
              </div>
              <div onClick={() => setHuniFilter(huniFilter === 'TETAP' ? 'ALL' : 'TETAP')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${huniFilter === 'TETAP' ? 'ring-2 ring-emerald-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>WARGA TETAP</span>
                </div>
                <div className="text-2xl font-black">{residents.filter(r => r.status_huni === 'Milik Sendiri').length}</div>
              </div>
              <div onClick={() => setHuniFilter(huniFilter === 'PENDATANG' ? 'ALL' : 'PENDATANG')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${huniFilter === 'PENDATANG' ? 'ring-2 ring-amber-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-semibold mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>PENDATANG</span>
                </div>
                <div className="text-2xl font-black">{residents.filter(r => r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang').length}</div>
              </div>
              <div onClick={() => setKtpFilter(ktpFilter === 'ADA_KTP' ? 'TANPA_KTP' : ktpFilter === 'TANPA_KTP' ? 'ALL' : 'ADA_KTP')} className={`p-4 rounded-2xl cursor-pointer ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${ktpFilter !== 'ALL' ? 'ring-2 ring-purple-500' : ''}`}>
                <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{ktpFilter === 'TANPA_KTP' ? 'TANPA KTP' : 'ADA KTP'}</span>
                </div>
                <div className="text-2xl font-black">{residents.length}</div>
                <div className="text-[10px] text-gray-500 mt-1">Klik: Ganti Status KTP</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex space-x-2 relative">
              <button className={`px-5 py-3 rounded-xl font-bold ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}>RT</button>
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border-0 outline-none ${isDarkMode ? 'bg-[#1e1e24] text-white' : 'bg-white shadow'}`}
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}
                >
                  <div className="space-y-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showMoreMenu && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border z-50 overflow-hidden ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => { setShowMoreMenu(false); setShowAgeModal(true); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-purple-400 text-left"
                      >
                        <span className="text-base">🎂</span>
                        <span>Filter Usia</span>
                      </button>

                      <div className="border-t border-gray-700/50 my-1"></div>

                      <button 
                        onClick={() => { setShowMoreMenu(false); setGenderFilter(genderFilter === 'Laki-laki' ? 'ALL' : 'Laki-laki'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-blue-400 text-left"
                      >
                        <span className="text-base">♂</span>
                        <span>Gender: Laki-laki {genderFilter === 'Laki-laki' && '✓'}</span>
                      </button>

                      <button 
                        onClick={() => { setShowMoreMenu(false); setGenderFilter(genderFilter === 'Perempuan' ? 'ALL' : 'Perempuan'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-pink-400 text-left"
                      >
                        <span className="text-base">♀</span>
                        <span>Gender: Perempuan {genderFilter === 'Perempuan' && '✓'}</span>
                      </button>

                      <div className="border-t border-gray-700/50 my-1"></div>

                      <button 
                        onClick={() => { setShowMoreMenu(false); alert('Mengunduh template Excel...'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-blue-500 text-left"
                      >
                        <Download className="w-4 h-4" />
                        <span>Template Excel</span>
                      </button>

                      <button 
                        onClick={() => { setShowMoreMenu(false); alert('Fitur Import Excel'); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-amber-500 text-left"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Import Excel</span>
                      </button>

                      <button 
                        onClick={() => { setShowMoreMenu(false); window.print(); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-500/10 text-xs font-semibold text-gray-300 text-left"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAddResidentModal(true)}
                className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filter Badge */}
            {(huniFilter !== 'ALL' || ktpFilter !== 'ALL' || genderFilter !== 'ALL' || appliedMinAge !== '' || appliedMaxAge !== '') && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Filter Aktif:</span>
                  <div className="flex flex-wrap gap-2">
                    {huniFilter !== 'ALL' && (
                        <div className="flex items-center bg-amber-900/30 text-amber-500 px-3 py-1 rounded-full text-xs font-bold">
                            <span>Status: {huniFilter === 'TETAP' ? 'Tetap' : 'Pendatang'}</span>
                            <button onClick={() => setHuniFilter('ALL')} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {ktpFilter !== 'ALL' && (
                        <div className="flex items-center bg-purple-900/30 text-purple-500 px-3 py-1 rounded-full text-xs font-bold">
                            <span>KTP: {ktpFilter === 'ADA_KTP' ? 'Ada' : 'Tanpa'}</span>
                            <button onClick={() => setKtpFilter('ALL')} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {genderFilter !== 'ALL' && (
                        <div className="flex items-center bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                            <span>Gender: {genderFilter}</span>
                            <button onClick={() => setGenderFilter('ALL')} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    {(appliedMinAge !== '' || appliedMaxAge !== '') && (
                        <div className="flex items-center bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
                            <span>Usia: {appliedMinAge || '0'} - {appliedMaxAge || '∞'} thn</span>
                            <button onClick={() => { setAppliedMinAge(''); setAppliedMaxAge(''); }} className="ml-2"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 italic">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Menampilkan {residents.filter(r => {
                    const age = getAge(r.tanggal_lahir);
                    return (
                      (huniFilter === 'ALL' || (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') || (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'))) &&
                      (ktpFilter === 'ALL' || (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') || (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF')) &&
                      (genderFilter === 'ALL' || r.jenis_kelamin === genderFilter) &&
                      (appliedMinAge === '' || age >= Number(appliedMinAge)) &&
                      (appliedMaxAge === '' || age <= Number(appliedMaxAge))
                    );
                  }).length} data sesuai filter</span>
                </div>
              </div>
            )}


            {/* Residents List */}
            {residents.filter(r => {
              const age = getAge(r.tanggal_lahir);
              return (
                (huniFilter === 'ALL' || (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') || (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'))) &&
                (ktpFilter === 'ALL' || (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') || (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF')) &&
                (genderFilter === 'ALL' || r.jenis_kelamin === genderFilter) &&
                (appliedMinAge === '' || age >= Number(appliedMinAge)) &&
                (appliedMaxAge === '' || age <= Number(appliedMaxAge)) &&
                r.nama.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }).length === 0 ? (
              <div className={`p-10 rounded-2xl text-center text-gray-500 ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}>
                Tidak ada data ditemukan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {residents
                  .filter(r => {
                    const age = getAge(r.tanggal_lahir);
                    return (
                      (huniFilter === 'ALL' || (huniFilter === 'TETAP' && r.status_huni === 'Milik Sendiri') || (huniFilter === 'PENDATANG' && (r.status_huni === 'Kontrak/Kos' || r.status_huni === 'Menumpang'))) &&
                      (ktpFilter === 'ALL' || (ktpFilter === 'ADA_KTP' && r.status_warga === 'AKTIF') || (ktpFilter === 'TANPA_KTP' && r.status_warga === 'TIDAK AKTIF')) &&
                      (genderFilter === 'ALL' || r.jenis_kelamin === genderFilter) &&
                      (appliedMinAge === '' || age >= Number(appliedMinAge)) &&
                      (appliedMaxAge === '' || age <= Number(appliedMaxAge)) &&
                      r.nama.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((resident) => (
                    <div key={resident.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'} space-y-2`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm">{resident.nama}</h4>
                            {resident.is_kepala_keluarga && (
                              <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                                KK
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">NIK: {resident.nik}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Hal footer */}
            <div className="flex justify-between items-center pt-4 text-sm font-semibold">
              <span>Hal 1</span>
              <div className="flex space-x-2">
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}

        {/* KARTU KELUARGA TAB */}
        {activeTab === 'kk' && (() => {
          const kkMap = residents.reduce((acc: Record<string, Resident[]>, r) => {
            const kk = r.no_kk || 'TANPA_KK';
            if (!acc[kk]) acc[kk] = [];
            acc[kk].push(r);
            return acc;
          }, {});

          const totalUniqueKK = isZeroMode ? 0 : Object.keys(kkMap).length;
          const totalJiwa = isZeroMode ? 0 : residents.length;
          const kkList = isZeroMode ? [] : Object.entries(kkMap).map(([no_kk, members]) => {
            const kepala = members.find(m => m.is_kepala_keluarga) || members[0];
            return {
              no_kk,
              kepala: kepala?.nama || 'Tidak ada Kepala Keluarga',
              jumlahAnggota: members.length,
              alamat: kepala?.alamat || '-',
              members,
              isTunggal: members.length === 1
            };
          });
          const totalKkTunggal = kkList.filter(k => k.isTunggal).length;

          const filteredKkList = kkList.filter(k => {
            const matchFilter = kkFilter === 'ALL' || (kkFilter === 'TUNGGAL' && k.isTunggal);
            const matchSearch = k.no_kk.toLowerCase().includes(kkSearchQuery.toLowerCase()) || k.kepala.toLowerCase().includes(kkSearchQuery.toLowerCase());
            return matchFilter && matchSearch;
          });

          return (
            <div className="space-y-4 animate-fade-in">
              {/* Top Stat Cards (Clickable) */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => setKkFilter('ALL')} 
                  className={`p-4 rounded-2xl cursor-pointer transition ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${kkFilter === 'ALL' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="text-[10px] text-blue-400 font-bold mb-1">TOTAL KK</div>
                  <div className="text-xl font-black">{totalUniqueKK}</div>
                </div>

                <div 
                  onClick={() => setKkFilter('ALL')} 
                  className={`p-4 rounded-2xl cursor-pointer transition ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}
                >
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">TOTAL JIWA</div>
                  <div className="text-xl font-black">{totalJiwa}</div>
                </div>

                <div 
                  onClick={() => setKkFilter(kkFilter === 'TUNGGAL' ? 'ALL' : 'TUNGGAL')} 
                  className={`p-4 rounded-2xl cursor-pointer transition ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'} ${kkFilter === 'TUNGGAL' ? 'ring-2 ring-amber-500' : ''}`}
                >
                  <div className="text-[10px] text-amber-400 font-bold mb-1">KK TUNGGAL</div>
                  <div className="text-xl font-black">{totalKkTunggal}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari No. KK / Kepala Keluarga..."
                    value={kkSearchQuery}
                    onChange={(e) => setKkSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border-0 outline-none ${isDarkMode ? 'bg-[#1e1e24] text-white' : 'bg-white shadow'}`}
                  />
                </div>
                <button 
                  onClick={() => setShowKkOptionsModal(true)}
                  className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg flex items-center justify-center"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {/* Filter active badge */}
              {kkFilter !== 'ALL' && (
                <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold">
                  <span>Filter Aktif: KK Tunggal</span>
                  <button onClick={() => setKkFilter('ALL')} className="underline">Reset</button>
                </div>
              )}

              {/* KK List */}
              {filteredKkList.length === 0 ? (
                <div className={`p-10 rounded-2xl text-center text-gray-500 ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}>
                  Belum ada data Kartu Keluarga.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredKkList.map((kkItem) => (
                    <div key={kkItem.no_kk} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-2`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm">No. KK: {kkItem.no_kk}</h4>
                            {kkItem.isTunggal && (
                              <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded-full font-semibold">
                                KK Tunggal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Kepala Keluarga: <span className="text-gray-200 font-semibold">{kkItem.kepala}</span></p>
                        </div>
                        <span className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-xl font-bold">
                          {kkItem.jumlahAnggota} Jiwa
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Alamat: {kkItem.alamat}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination footer */}
              <div className="flex justify-between items-center pt-4 text-sm font-semibold">
                <span>Halaman 1</span>
                <div className="flex space-x-2">
                  <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5 rotate-180" /></button>
                  <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* KEUANGAN TAB (Matching Screenshot_2026-10-24-01-59-02-76_ef9df8ce568b803c96504800499ab560_9121e96a.jpg) */}
        {activeTab === 'keuangan' && (
          <div className="space-y-4 animate-fade-in pb-12">
            {/* Top Buttons: Semua Dompet & Atur Dompet */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDompetModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#4c6ef5] hover:bg-[#4263eb] text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-blue-500/20 active:scale-95 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{selectedDompet}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAturDompetModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1c1d22] border border-[#2b2c34] hover:border-gray-700 text-white font-semibold text-xs flex items-center space-x-2 transition"
              >
                <Settings className="w-4 h-4 text-gray-300" />
                <span>Atur Dompet</span>
              </button>
            </div>

            {/* Banner: TOTAL KESELURUHAN (SEMUA DOMPET) */}
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-[#4338ca] via-[#5145cd] to-[#6d28d9] text-white shadow-xl shadow-indigo-600/25">
              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-100">
                  TOTAL KESELURUHAN (SEMUA DOMPET)
                </span>
                <div className="text-3xl font-black tracking-tight mt-1">
                  Rp {isZeroMode ? '0' : saldoKas.toLocaleString('id-ID')}
                </div>
              </div>
              <Landmark className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 text-white/20 pointer-events-none" />
            </div>

            {/* 2x2 Grid Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. SALDO Semua Dompet */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-[#2b4c7e] text-white shadow-sm min-h-[96px] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-blue-100 block">
                    SALDO Semua Dompet
                  </span>
                  <div className="text-xl font-black mt-1">
                    Rp {isZeroMode ? '0' : saldoKas.toLocaleString('id-ID')}
                  </div>
                </div>
                <Wallet className="absolute right-3 bottom-2.5 w-12 h-12 text-blue-300/25 pointer-events-none" />
              </div>

              {/* 2. MASUK */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-[#1c1d22] border border-[#2b2c34] text-white shadow-sm min-h-[96px] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    MASUK
                  </span>
                  <div className="text-xl font-black mt-1 text-white">
                    Rp {isZeroMode ? '0' : totalPemasukan.toLocaleString('id-ID')}
                  </div>
                </div>
                <ArrowDown className="absolute right-3 bottom-2.5 w-11 h-11 text-emerald-500/35 stroke-[3] pointer-events-none" />
              </div>

              {/* 3. KELUAR */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-[#1c1d22] border border-[#2b2c34] text-white shadow-sm min-h-[96px] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    KELUAR
                  </span>
                  <div className="text-xl font-black mt-1 text-white">
                    Rp {isZeroMode ? '0' : totalPengeluaran.toLocaleString('id-ID')}
                  </div>
                </div>
                <ArrowUp className="absolute right-3 bottom-2.5 w-11 h-11 text-rose-500/35 stroke-[3] pointer-events-none" />
              </div>

              {/* 4. ANALISA / Rincian Neraca */}
              <div
                onClick={() => setShowNeracaModal(true)}
                className="relative overflow-hidden rounded-2xl p-4 bg-[#1c1d22] border border-[#2b2c34] hover:border-gray-700 text-white shadow-sm min-h-[96px] flex flex-col justify-between cursor-pointer active:scale-98 transition"
              >
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    ANALISA
                  </span>
                  <div className="text-base sm:text-lg font-black mt-0.5 text-white leading-snug">
                    Rincian Neraca
                  </div>
                </div>
                <PieChart className="absolute right-2.5 bottom-2 w-11 h-11 text-purple-500/35 pointer-events-none" />
              </div>
            </div>

            {/* Filter Periode Bar */}
            <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm relative">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBulanDropdown(!showBulanDropdown)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-gray-200 hover:text-white uppercase tracking-wide transition"
                  >
                    <span>{filterBulanKeuangan}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {showBulanDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowBulanDropdown(false)} />
                      <div className="absolute top-full left-0 mt-2 z-40 bg-[#292a2e] border border-gray-700 rounded-xl shadow-2xl py-1 max-h-48 overflow-y-auto w-40">
                        {['SEMUA BULAN', 'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setFilterBulanKeuangan(b);
                              setShowBulanDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 ${filterBulanKeuangan === b ? 'text-blue-400 bg-blue-500/10' : 'text-gray-200'}`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <span className="text-gray-500 font-bold">/</span>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTahunDropdown(!showTahunDropdown)}
                    className="flex items-center space-x-1 text-xs font-bold text-gray-200 hover:text-white transition"
                  >
                    <span>{filterTahunKeuangan}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {showTahunDropdown && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowTahunDropdown(false)} />
                      <div className="absolute top-full left-0 mt-2 z-40 bg-[#292a2e] border border-gray-700 rounded-xl shadow-2xl py-1 w-28">
                        {['2026', '2025', '2024'].map((th) => (
                          <button
                            key={th}
                            type="button"
                            onClick={() => {
                              setFilterTahunKeuangan(th);
                              setShowTahunDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 ${filterTahunKeuangan === th ? 'text-blue-400 bg-blue-500/10' : 'text-gray-200'}`}
                          >
                            {th}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Calendar className="w-4 h-4 text-gray-500" />
            </div>

            {/* 4 Action Buttons Row */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setShowSearchKeuangan(!showSearchKeuangan)}
                className={`p-3 rounded-xl border transition ${showSearchKeuangan ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#1c1d22] border-[#2b2c34] text-gray-300 hover:text-white'}`}
                title="Cari Transaksi"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowNeracaModal(true)}
                className="p-3 rounded-xl bg-[#1c1d22] border border-[#2b2c34] hover:border-gray-700 text-emerald-400 hover:text-emerald-300 transition"
                title="Laporan & Neraca"
              >
                <Landmark className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-3 rounded-xl bg-[#1c1d22] border border-[#2b2c34] hover:border-gray-700 text-gray-300 hover:text-white transition"
                title="Cetak Laporan Kas"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowAddTransactionModal(true)}
                className="p-3 rounded-xl bg-[#00875a] hover:bg-[#009b65] text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition"
                title="Tambah Transaksi"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Search Input when search is toggled */}
            {showSearchKeuangan && (
              <div className="animate-fade-in pt-1">
                <input
                  type="text"
                  placeholder="Ketik keterangan atau nama pencatat..."
                  value={searchKeuanganQuery}
                  onChange={(e) => setSearchKeuanganQuery(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Transactions List */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs px-1">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">Riwayat Transaksi</span>
                <span className="text-[11px] text-gray-500">
                  {isZeroMode ? 0 : transactions.length} Transaksi
                </span>
              </div>

              {isZeroMode || transactions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#1c1d22]/50 border border-[#2b2c34] text-gray-400 space-y-2">
                  <Wallet className="w-10 h-10 mx-auto text-gray-600 opacity-60" />
                  <p className="text-xs">Belum ada transaksi pada periode ini.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddTransactionModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold text-xs hover:bg-emerald-600/30 transition inline-block mt-1"
                  >
                    + Catat Transaksi
                  </button>
                </div>
              ) : (
                transactions
                  .filter(tx => tx.keterangan.toLowerCase().includes(searchKeuanganQuery.toLowerCase()))
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-[#1c1d22] border border-[#2b2c34] flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${tx.kategori === 'Pemasukan' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <h4 className="font-bold text-xs text-white">{tx.keterangan}</h4>
                        </div>
                        <p className="text-[10px] text-gray-400">{tx.tanggal} • Oleh: {tx.pencatat}</p>
                      </div>
                      <div className={`text-xs font-black ${tx.kategori === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.kategori === 'Pemasukan' ? '+' : '-'} Rp {tx.nominal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* INVENTARIS RT/RW TAB (Matching Screenshot_2026-10-24-15-32-52-92_ef9df8ce568b803c96504800499ab560_afe6c87d.jpg) */}
        {activeTab === 'inventaris' && (
          <div className="space-y-4 animate-fade-in pb-12">
            {/* Header: Inventaris RT/RW */}
            <div className="flex justify-between items-center pt-1 pb-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Inventaris RT/RW
              </h2>
              <button
                type="button"
                onClick={() => {
                  showToast('Data inventaris diperbarui');
                }}
                className="p-2 rounded-full hover:bg-gray-800 text-white transition active:rotate-180"
                title="Perbarui Data"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Scroll Pill Badges */}
            <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1 text-xs">
              {/* 1. Total */}
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#1c1d22] border border-[#2b2c34] text-gray-200 shrink-0 shadow-sm">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-gray-300">Total: <strong className="text-blue-400 font-bold">{isZeroMode ? 0 : inventarisItems.reduce((a, b) => a + b.jumlahTotal, 0)}</strong></span>
              </div>

              {/* 2. Di Luar */}
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#1c1d22] border border-[#2b2c34] text-gray-200 shrink-0 shadow-sm">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-gray-300">Di Luar: <strong className="text-amber-400 font-bold">{isZeroMode ? 0 : inventarisItems.reduce((a, b) => a + b.diLuar, 0)}</strong></span>
              </div>

              {/* 3. Di Dalam */}
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#1c1d22] border border-[#2b2c34] text-gray-200 shrink-0 shadow-sm">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Archive className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-gray-300">Di Dalam: <strong className="text-emerald-400 font-bold">{isZeroMode ? 0 : inventarisItems.reduce((a, b) => a + b.diDalam, 0)}</strong></span>
              </div>

              {/* 4. Kondisi Baik */}
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#1c1d22] border border-[#2b2c34] text-gray-200 shrink-0 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-gray-300">Kondisi Baik: <strong className="text-purple-400 font-bold">{isZeroMode ? 0 : inventarisItems.reduce((a, b) => a + b.kondisiBaik, 0)}</strong></span>
              </div>
            </div>

            {/* 2 Sub Tabs Circular Navigation */}
            <div className="flex justify-center items-center space-x-10 pt-3 pb-2">
              {/* Subtab 1: Master Barang */}
              <button
                type="button"
                onClick={() => setInventarisSubTab('master')}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
                  inventarisSubTab === 'master'
                    ? 'bg-[#5c56f6] text-white shadow-indigo-500/30 scale-105 ring-4 ring-indigo-500/20'
                    : 'bg-[#23252a] text-gray-400 hover:text-gray-200'
                }`}>
                  <Package className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold transition ${
                  inventarisSubTab === 'master' ? 'text-white font-extrabold' : 'text-gray-400'
                }`}>
                  Master Barang
                </span>
              </button>

              {/* Subtab 2: Riwayat Peminjaman */}
              <button
                type="button"
                onClick={() => setInventarisSubTab('riwayat')}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
                  inventarisSubTab === 'riwayat'
                    ? 'bg-[#5c56f6] text-white shadow-indigo-500/30 scale-105 ring-4 ring-indigo-500/20'
                    : 'bg-[#23252a] text-gray-400 hover:text-gray-200'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold transition ${
                  inventarisSubTab === 'riwayat' ? 'text-white font-extrabold' : 'text-gray-400'
                }`}>
                  Riwayat Peminjaman
                </span>
              </button>
            </div>

            {/* Action Bar */}
            {inventarisSubTab === 'master' ? (
              <div className="flex items-center space-x-2.5 pt-1">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari barang..."
                    value={searchInventarisQuery}
                    onChange={(e) => setSearchInventarisQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#23252a] border border-gray-800 text-xs text-white placeholder-gray-400 outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Filter / Maintenance Icon Button */}
                <button
                  type="button"
                  onClick={() => {
                    const next = filterKondisiInventaris === 'SEMUA' ? 'RUSAK' : 'SEMUA';
                    setFilterKondisiInventaris(next);
                    showToast(next === 'RUSAK' ? 'Filter: Kondisi Rusak' : 'Menampilkan Semua Barang');
                  }}
                  className={`p-3 rounded-2xl border transition shrink-0 ${
                    filterKondisiInventaris === 'RUSAK'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-[#23252a] border-gray-800 text-gray-300 hover:text-white'
                  }`}
                  title="Filter Kondisi Barang"
                >
                  <Wrench className="w-4 h-4" />
                </button>

                {/* Print Icon Button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-3 rounded-2xl bg-[#1d70f5] hover:bg-[#1862db] text-white shadow-md shadow-blue-500/20 shrink-0 transition"
                  title="Cetak Laporan Inventaris"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Plus Add Button */}
                <button
                  type="button"
                  onClick={() => setShowAddInventarisModal(true)}
                  className="p-3 rounded-2xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/25 shrink-0 transition"
                  title="Tambah Barang Inventaris"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              /* Riwayat Peminjaman Action Bar matching Screenshot_2026-10-24-15-52-06-41_ef9df8ce568b803c96504800499ab560_ebd7532b.jpg */
              <div className="flex items-center space-x-2.5 pt-1">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari peminjam / acara..."
                    value={searchInventarisQuery}
                    onChange={(e) => setSearchInventarisQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#23252a] border border-gray-800 text-xs text-white placeholder-gray-400 outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = peminjamanFilter === 'Semua' ? 'Dipinjam' : peminjamanFilter === 'Dipinjam' ? 'Dikembalikan' : 'Semua';
                    setPeminjamanFilter(next);
                    showToast(`Filter: ${next}`);
                  }}
                  className="px-4 py-3.5 rounded-2xl bg-[#23252a] border border-gray-800 text-gray-200 hover:text-white font-bold text-xs flex items-center space-x-2 shrink-0 transition"
                >
                  <span>{peminjamanFilter}</span>
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}

            {/* Inventory List or Empty State */}
            {inventarisSubTab === 'master' ? (
              isZeroMode || inventarisItems.filter(i => i.nama.toLowerCase().includes(searchInventarisQuery.toLowerCase())).length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-2">
                  <p className="text-sm font-medium text-gray-400">Tidak ada data inventaris.</p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {inventarisItems
                    .filter(i => i.nama.toLowerCase().includes(searchInventarisQuery.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#1c1d22] border border-[#2b2c34] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                              {item.kode}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                              {item.kategori}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white">{item.nama}</h4>
                          <p className="text-xs text-gray-400">Lokasi: {item.lokasi}</p>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <div className="text-right text-xs">
                            <div className="font-bold text-white">Total: {item.jumlahTotal} Unit</div>
                            <div className="text-[10px] text-gray-400">
                              <span className="text-emerald-400">{item.diDalam} Dalam</span> • <span className="text-amber-400">{item.diLuar} Pinjam</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCartItems([{ id: item.id, nama: item.nama, jumlah: 1 }]);
                              setShowPinjamInventarisModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-bold transition"
                          >
                            Pinjam
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInventarisItems(inventarisItems.filter(i => i.id !== item.id));
                              showToast(`Barang ${item.nama} dihapus`);
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )
            ) : (
              /* Subtab: Riwayat Peminjaman matching Screenshot_2026-10-24-15-52-06-41_ef9df8ce568b803c96504800499ab560_ebd7532b.jpg */
              <>
                {isZeroMode || peminjamanLogs.filter(log => {
                  const matchSearch = log.namaBarang.toLowerCase().includes(searchInventarisQuery.toLowerCase()) || log.peminjam.toLowerCase().includes(searchInventarisQuery.toLowerCase());
                  const matchFilter = peminjamanFilter === 'Semua' || log.status === peminjamanFilter;
                  return matchSearch && matchFilter;
                }).length === 0 ? (
                  <div className="py-28 text-center text-gray-400 font-normal">
                    <p className="text-sm text-gray-400">Tidak ada riwayat peminjaman.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {peminjamanLogs
                      .filter(log => {
                        const matchSearch = log.namaBarang.toLowerCase().includes(searchInventarisQuery.toLowerCase()) || log.peminjam.toLowerCase().includes(searchInventarisQuery.toLowerCase());
                        const matchFilter = peminjamanFilter === 'Semua' || log.status === peminjamanFilter;
                        return matchSearch && matchFilter;
                      })
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-4 rounded-2xl bg-[#1c1d22] border border-[#2b2c34] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                log.status === 'Dipinjam' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                              }`}>
                                {log.status}
                              </span>
                              <span className="text-xs font-bold text-white">{log.namaBarang} ({log.jumlah} Unit)</span>
                            </div>
                            <p className="text-xs text-gray-300">Peminjam: {log.peminjam}</p>
                            <p className="text-[10px] text-gray-400">Pinjam: {log.tanggalPinjam} • Target Kembali: {log.tanggalKembaliTarget}</p>
                          </div>

                          {log.status === 'Dipinjam' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPeminjamanLogs(peminjamanLogs.map(l => l.id === log.id ? { ...l, status: 'Dikembalikan' as const } : l));
                                showToast('Barang berhasil ditandai telah dikembalikan');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition shrink-0"
                            >
                              Tandai Kembalikan
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* Floating "+ Pinjam Barang" Button (Matching Screenshot) */}
                <button
                  type="button"
                  onClick={() => setShowPinjamInventarisModal(true)}
                  className="fixed bottom-20 right-4 sm:right-8 z-40 px-6 py-3.5 rounded-2xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white font-bold text-sm shadow-2xl shadow-indigo-500/30 flex items-center space-x-2 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>Pinjam Barang</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* BANTUAN TAB (Matching Screenshot_2026-10-24-16-26-47-99_ef9df8ce568b803c96504800499ab560_e482c337.jpg) */}
        {activeTab === 'bantuan' && (
          <div className="space-y-4 animate-fade-in pb-24">
            {/* Header Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                Manajemen Bantuan
              </h2>
            </div>

            {/* Search Input Row with Calendar Icon */}
            <div className="flex items-center space-x-2.5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Program..."
                  value={searchBantuanQuery}
                  onChange={(e) => setSearchBantuanQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#23252a] border border-gray-800 text-xs text-white placeholder-gray-400 outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Calendar Button */}
              <button
                type="button"
                onClick={() => showToast(`Periode Laporan: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`)}
                className="p-3.5 rounded-2xl bg-[#23252a] border border-gray-800 text-gray-300 hover:text-white shrink-0 transition"
                title="Pilih Tanggal / Periode Bantuan"
              >
                <Calendar className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Category Filter Pills Row */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {bantuanCategories.map((cat) => {
                  const isActive = activeBantuanCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveBantuanCategory(cat)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (cat !== 'Semua' && confirm(`Hapus kategori "${cat}"?`)) {
                          setBantuanCategories(bantuanCategories.filter(c => c !== cat));
                          if (activeBantuanCategory === cat) setActiveBantuanCategory('Semua');
                          showToast(`Kategori "${cat}" dihapus`);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center space-x-1.5 shrink-0 select-none ${
                        isActive
                          ? 'bg-[#5c56f6] text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}

                {/* Add Category (+) Button */}
                <button
                  type="button"
                  onClick={() => setShowAddBantuanCategoryModal(true)}
                  className="w-9 h-9 rounded-full bg-[#00917c] hover:bg-[#007a68] text-white font-bold text-base flex items-center justify-center shrink-0 shadow transition active:scale-95"
                  title="Tambah Kategori Bantuan Baru"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Lightbulb Caption Tip */}
              <div className="flex items-center space-x-1.5 text-gray-400 text-[11px] italic">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Tip: Tahan (HP) atau Klik Kanan (PC) untuk hapus kategori.</span>
              </div>
            </div>

            {/* Content List or Empty State */}
            {isZeroMode || bantuanPrograms.filter(p => {
              const matchQuery = p.nama.toLowerCase().includes(searchBantuanQuery.toLowerCase()) || p.keterangan.toLowerCase().includes(searchBantuanQuery.toLowerCase());
              const matchCategory = activeBantuanCategory === 'Semua' || p.kategori === activeBantuanCategory;
              return matchQuery && matchCategory;
            }).length === 0 ? (
              /* Zero State matching screenshot Screenshot_2026-10-24-16-26-47-99_ef9df8ce568b803c96504800499ab560_e482c337.jpg */
              <div className="py-28 text-center text-gray-400 font-normal space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#23252a] flex items-center justify-center text-gray-600 border border-gray-800">
                  <Archive className="w-7 h-7" />
                </div>
                <p className="text-sm text-gray-400 font-normal">Belum ada program bantuan</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {bantuanPrograms
                  .filter(p => {
                    const matchQuery = p.nama.toLowerCase().includes(searchBantuanQuery.toLowerCase()) || p.keterangan.toLowerCase().includes(searchBantuanQuery.toLowerCase());
                    const matchCategory = activeBantuanCategory === 'Semua' || p.kategori === activeBantuanCategory;
                    return matchQuery && matchCategory;
                  })
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-[#1c1d22] border border-[#2b2c34] space-y-2 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 uppercase">
                            {p.kategori}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-1">{p.nama}</h4>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{p.tanggal}</span>
                      </div>

                      <p className="text-xs text-gray-300">{p.keterangan}</p>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-800/80 text-xs">
                        <div className="text-gray-400">
                          Target: <span className="font-bold text-white">{p.targetPenerima} Penerima</span> • <span className="text-emerald-400 font-bold">Rp {p.anggaranPerPenerima.toLocaleString('id-ID')}/orang</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBantuanPrograms(bantuanPrograms.filter(item => item.id !== p.id));
                            showToast(`Program "${p.nama}" dihapus`);
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Floating "+ Buat Program" Button */}
            <button
              type="button"
              onClick={() => setShowBuatProgramModal(true)}
              className="fixed bottom-20 right-4 sm:right-8 z-40 px-6 py-3.5 rounded-2xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white font-bold text-sm shadow-2xl shadow-indigo-500/30 flex items-center space-x-2 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Buat Program</span>
            </button>
          </div>
        )}

        {/* SURAT TAB */}
        {activeTab === 'surat' && (
          <div className="space-y-4 animate-fade-in pb-10">
            {/* 3 Circular Navigation Tabs */}
            <div className="flex justify-around items-center pt-1 pb-2">
              {/* Surat Warga */}
              <button
                onClick={() => {
                  setSuratSubTab('warga');
                  if (suratSubTab === 'warga' && showJenisSuratModal) {
                    setShowJenisSuratModal(false);
                  }
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-md ${
                  suratSubTab === 'warga'
                    ? 'bg-amber-400 text-gray-950 shadow-amber-400/20'
                    : 'bg-[#1c1d22] text-gray-400 hover:text-gray-200'
                }`}>
                  <FilePlus className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${suratSubTab === 'warga' ? 'text-amber-400' : 'text-gray-400'}`}>
                  Surat Warga
                </span>
              </button>

              {/* Surat Imbauan */}
              <button
                onClick={() => {
                  setSuratSubTab('imbauan');
                  setShowJenisSuratModal(false);
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-md ${
                  suratSubTab === 'imbauan'
                    ? 'bg-amber-400 text-gray-950 shadow-amber-400/20'
                    : 'bg-[#1c1d22] text-gray-400 hover:text-gray-200'
                }`}>
                  <Megaphone className="w-6 h-6" />
                </div>
                <span className={`text-xs font-semibold ${suratSubTab === 'imbauan' ? 'text-amber-400' : 'text-gray-400'}`}>
                  Surat Imbauan
                </span>
              </button>

              {/* Pengaturan Surat */}
              <button
                onClick={() => {
                  setSuratSubTab('pengaturan');
                  setShowJenisSuratModal(false);
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-md ${
                  suratSubTab === 'pengaturan'
                    ? 'bg-amber-400 text-gray-950 shadow-amber-400/20'
                    : 'bg-[#1c1d22] text-gray-400 hover:text-gray-200'
                }`}>
                  <Settings className="w-6 h-6" />
                </div>
                <span className={`text-xs font-semibold ${suratSubTab === 'pengaturan' ? 'text-amber-400' : 'text-gray-400'}`}>
                  Pengaturan Surat
                </span>
              </button>
            </div>

            {/* TAB 1: SURAT WARGA (Matches screenshot) */}
            {suratSubTab === 'warga' && (
              <div className="space-y-4 animate-fade-in">
                {showJenisSuratModal ? (
                  /* Tampilan Menu Dropdown Jenis Surat (Persis sesuai gambar screenshot IMG_20261023_005120_c3d5a816.jpg) */
                  <div className="bg-[#28292d] border border-[#383a40] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="max-h-[72vh] overflow-y-auto custom-scrollbar">
                      {JENIS_SURAT_OPTIONS.map((jenis) => {
                        const isSelected = selectedJenisSurat === jenis;
                        return (
                          <div
                            key={jenis}
                            onClick={() => {
                              setSelectedJenisSurat(jenis);
                              setShowJenisSuratModal(false);
                            }}
                            className={`w-full px-5 py-3.5 cursor-pointer transition-colors duration-150 select-none ${
                              isSelected
                                ? 'bg-[#3f4046] text-white font-bold'
                                : 'text-[#d2d4d8] hover:bg-[#34353a] hover:text-white font-bold'
                            }`}
                          >
                            <span className="text-xs sm:text-sm tracking-wide uppercase block">
                              {jenis}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header Title & Top-Right Action Buttons */}
                    <div className="flex justify-between items-start pt-1">
                  <div className="space-y-1 pr-2">
                    <h3 className="text-base font-bold text-white tracking-tight">Form Pembuatan Surat</h3>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      Pilih pemohon & keperluan untuk penerbitan surat PDF
                    </p>
                    <p className="text-[11px] text-emerald-400 leading-snug font-medium pt-0.5">
                      Isi surat dapat disesuaikan melalui template. Cek tab Pengaturan Surat untuk membuat template pribadi.
                    </p>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    {/* Draft Button */}
                    <button
                      onClick={() => setShowDraftsModal(true)}
                      className="w-14 h-14 rounded-2xl border border-amber-500/60 bg-amber-500/10 flex flex-col items-center justify-center space-y-0.5 hover:bg-amber-500/20 transition active:scale-95"
                    >
                      <Mail className="w-5 h-5 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-400">Draft</span>
                    </button>

                    {/* In & Out Button */}
                    <button
                      onClick={() => setShowInOutModal(true)}
                      className="w-14 h-14 rounded-2xl border border-blue-500/60 bg-blue-500/10 flex flex-col items-center justify-center space-y-0.5 hover:bg-blue-500/20 transition active:scale-95"
                    >
                      <Printer className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400">In & Out</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields: */}
                <div className="space-y-4 pt-1">
                  {/* 1. Jenis Surat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">1. Jenis Surat</label>
                    <div
                      onClick={() => setShowJenisSuratModal(true)}
                      className="bg-[#1a1c23] border border-gray-800 hover:border-gray-700 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition"
                    >
                      <span className="font-bold text-sm tracking-wide text-white uppercase">
                        {selectedJenisSurat}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* 2. Pilih Warga Pemohon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">2. Pilih Warga Pemohon</label>
                    <div
                      onClick={() => setShowSelectResidentModal(true)}
                      className="bg-[#1a1c23] border border-gray-800 hover:border-gray-700 p-4 rounded-2xl flex items-center space-x-3 cursor-pointer transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {selectedResidentForSurat ? (
                          <div>
                            <p className="text-sm font-bold text-white truncate">{selectedResidentForSurat.nama}</p>
                            <p className="text-[11px] text-gray-400 truncate">
                              NIK: {selectedResidentForSurat.nik} • {selectedResidentForSurat.alamat}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Klik untuk mencari data warga...</span>
                        )}
                      </div>
                      {selectedResidentForSurat && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResidentForSurat(null);
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                        >
                          Ganti
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Keperluan Surat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">3. Keperluan Surat</label>
                    <div className="bg-[#1a1c23] border border-gray-800 rounded-2xl p-4">
                      <textarea
                        value={keperluanSurat}
                        onChange={(e) => setKeperluanSurat(e.target.value)}
                        rows={4}
                        placeholder={`Ketik keperluan surat di sini...\nContoh: Persyaratan melamar pekerjaan.`}
                        className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* 4. Nomor Surat (Otomatis) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">4. Nomor Surat (Otomatis)</label>
                    <div className="bg-[#242731] border border-gray-700/60 rounded-2xl p-3.5 flex items-center space-x-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-xs text-gray-200 font-medium">
                        Nomor surat akan terbit otomatis saat preview/ cetak (Format: RT.{rtNumber}/RW.{rwNumber})
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={handleSaveDraft}
                      className="flex-1 py-3.5 px-4 rounded-2xl border border-amber-500/60 bg-[#1e1c18] text-amber-400 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-amber-500/10 active:scale-98 transition shadow"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Simpan Draft</span>
                    </button>

                    <button
                      onClick={handleGenerateAndPreview}
                      className="flex-[1.4] py-3.5 px-4 rounded-2xl bg-[#00c988] hover:bg-[#00b077] text-gray-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition tracking-wide uppercase"
                    >
                      <Printer className="w-4 h-4" />
                      <span>GENERATE & PREVIEW SURAT</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

            {/* TAB 2: SURAT IMBAUAN (Matching screenshot IMG_20261023_005852_10ecbb9a.jpg) */}
            {suratSubTab === 'imbauan' && (
              <div className="space-y-4 pt-1 animate-fade-in">
                {/* Header */}
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Form Surat Imbauan</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Cocok untuk pengumuman atau surat edaran umum warga.</p>
                </div>

                {/* Section 1: Kop Surat */}
                <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl p-4 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Kop Surat</span>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs text-gray-400">Kop Full</span>
                      <button
                        type="button"
                        onClick={() => setKopFull(!kopFull)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${kopFull ? 'bg-[#00c988]' : 'bg-gray-700'}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${kopFull ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl border border-gray-700/60 bg-[#141518]/60 p-3 min-h-[72px] flex items-center justify-center text-center">
                      {kopImage ? (
                        <div className="relative w-full flex items-center justify-between">
                          <img src={kopImage} alt="Kop Surat" className="max-h-12 object-contain rounded" />
                          <button
                            type="button"
                            onClick={() => setKopImage(null)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline ml-2"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 font-normal">Belum ada Kop (Lebar/Landscape)</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        id="kop-upload-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setKopImage(event.target?.result as string);
                              showToast('Kop surat berhasil diunggah!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="kop-upload-input"
                        className="cursor-pointer px-5 py-2.5 rounded-full bg-[#00875a] hover:bg-[#009b65] text-white font-medium text-xs inline-flex items-center justify-center transition shadow active:scale-95 whitespace-nowrap"
                      >
                        Upload Kop
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pilih Template Imbauan */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">Pilih Template Imbauan</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplateImbauanDropdown(!showTemplateImbauanDropdown)}
                      className="w-full bg-[#1c1d22] border border-[#2b2c34] hover:border-gray-600 rounded-xl px-4 py-3.5 flex items-center justify-between text-left transition focus:outline-none"
                    >
                      <span className="font-bold text-xs uppercase text-white tracking-wide">
                        {selectedTemplateImbauan}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTemplateImbauanDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showTemplateImbauanDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowTemplateImbauanDropdown(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#292a2e] border border-[#3c3d42] rounded-xl shadow-2xl overflow-hidden py-0">
                          {TEMPLATES_IMBAUAN.map((tpl) => {
                            const isSelected = selectedTemplateImbauan === tpl.judul;
                            return (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTemplateImbauan(tpl.judul);
                                  if (tpl.judul === 'CUSTOM / KOSONG') {
                                    setPerihalImbauan('');
                                    setIsiSuratImbauan('');
                                    setTanggalImbauan('');
                                    setWaktuImbauan('');
                                    setTempatImbauan('');
                                  } else {
                                    setPerihalImbauan(tpl.judul);
                                    setIsiSuratImbauan(tpl.isi);
                                    setTanggalImbauan(tpl.tanggal);
                                    setWaktuImbauan(tpl.waktu);
                                    setTempatImbauan(tpl.tempat);
                                  }
                                  setShowTemplateImbauanDropdown(false);
                                }}
                                className={`w-full text-left px-5 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wide transition-colors block ${
                                  isSelected
                                    ? 'bg-[#3c3e44] text-white'
                                    : 'text-[#d3d5d9] hover:bg-[#34353a] hover:text-white'
                                }`}
                              >
                                {tpl.judul}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Section 3: Pengaturan Nomor Surat */}
                <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl p-4 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Pengaturan Nomor Surat</span>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs text-gray-400">Auto-Generate</span>
                      <button
                        type="button"
                        onClick={() => setAutoGenerateNomorImbauan(!autoGenerateNomorImbauan)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${autoGenerateNomorImbauan ? 'bg-[#00c988]' : 'bg-gray-700'}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${autoGenerateNomorImbauan ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    <label className="block text-xs font-bold text-white">Kode Wilayah</label>
                    <div className="bg-[#141518] border border-gray-800 rounded-xl p-3">
                      <input
                        type="text"
                        value={kodeWilayahImbauan}
                        onChange={(e) => setKodeWilayahImbauan(e.target.value)}
                        placeholder="RT.01/RW.02"
                        className="w-full bg-transparent text-xs text-white font-medium focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 italic">
                      Format akhir: [Urut]/SI/[Wilayah]/[Bulan]/[Tahun]
                    </p>
                  </div>
                </div>

                {/* Section 4: Format Tanda Tangan */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">Format Tanda Tangan</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTandaTanganDropdown(!showTandaTanganDropdown)}
                      className="w-full bg-[#1c1d22] border border-[#2b2c34] hover:border-gray-600 rounded-xl px-4 py-3.5 flex items-center justify-between text-left transition focus:outline-none"
                    >
                      <span className="font-bold text-xs text-white">
                        {formatTandaTanganImbauan}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTandaTanganDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showTandaTanganDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-[#1e1f26] border border-gray-700 rounded-xl shadow-2xl overflow-hidden py-1">
                        {[
                          'RT & Sekretaris',
                          'Ketua RT Saja',
                          'Ketua RW & RT',
                          'Ketua RT & Bendahara'
                        ].map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => {
                              setFormatTandaTanganImbauan(fmt);
                              setShowTandaTanganDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-400 transition flex items-center justify-between ${
                              formatTandaTanganImbauan === fmt ? 'text-emerald-400 bg-emerald-500/15' : 'text-gray-200'
                            }`}
                          >
                            <span>{fmt}</span>
                            {formatTandaTanganImbauan === fmt && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5: Perihal / Judul Surat */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">Perihal / Judul Surat</label>
                  <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-xl px-4 py-3.5">
                    <input
                      type="text"
                      value={perihalImbauan}
                      onChange={(e) => setPerihalImbauan(e.target.value)}
                      placeholder="IMBAUAN KERJA BAKTI"
                      className="w-full bg-transparent font-bold uppercase text-white text-xs tracking-wide focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section 6: Isi Surat Imbauan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-white">Isi Surat Imbauan</label>
                  <p className="text-xs text-gray-400">Edit isi surat sesuai kebutuhan. Gunakan bahasa yang formal.</p>
                  <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-xl p-4">
                    <textarea
                      rows={5}
                      value={isiSuratImbauan}
                      onChange={(e) => setIsiSuratImbauan(e.target.value)}
                      placeholder="Sehubungan dengan upaya menjaga kebersihan dan kenyamanan lingkungan..."
                      className="w-full bg-transparent text-white text-xs leading-relaxed focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Detail Pelaksanaan Kegiatan (Opsional/Pendukung) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-400">Hari & Tanggal</label>
                    <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-xl px-3 py-2.5">
                      <input
                        type="text"
                        value={tanggalImbauan}
                        onChange={(e) => setTanggalImbauan(e.target.value)}
                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-400">Waktu</label>
                    <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-xl px-3 py-2.5">
                      <input
                        type="text"
                        value={waktuImbauan}
                        onChange={(e) => setWaktuImbauan(e.target.value)}
                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-400">Tempat</label>
                    <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-xl px-3 py-2.5">
                      <input
                        type="text"
                        value={tempatImbauan}
                        onChange={(e) => setTempatImbauan(e.target.value)}
                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveImbauanDraft}
                    className="flex-1 py-3.5 px-4 rounded-2xl border border-amber-500/60 bg-[#1e1c18] text-amber-400 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-amber-500/10 active:scale-98 transition shadow"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Simpan Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImbauanPreviewModal(true)}
                    className="flex-[1.4] py-3.5 px-4 rounded-2xl bg-[#00c988] hover:bg-[#00b077] text-gray-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition tracking-wide uppercase"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PREVIEW & CETAK SURAT</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PENGATURAN SURAT (Matches screenshot IMG_20261023_015542_ea265ed8.jpg) */}
            {suratSubTab === 'pengaturan' && (
              <div className="space-y-4 pt-1 animate-fade-in">
                {/* Title Header with Orange Gear */}
                <div className="flex items-start space-x-2.5 pt-1">
                  <div className="p-1 rounded-lg text-amber-500 mt-0.5 shrink-0">
                    <Settings className="w-5 h-5 fill-amber-500/20" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                      Pengaturan & Format Surat
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5 leading-normal">
                      Atur kop surat, format nomor, dan susunan penanda tangan untuk dokumen surat.
                    </p>
                  </div>
                </div>

                {/* Card: 3. Template Surat */}
                <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3.5 pr-2">
                    <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-white">3. Template Surat</h3>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        Buat template pribadi tanpa mengubah template bawaan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowKelolaTemplateModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#009b65] text-white text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition active:scale-95 shadow"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Kelola</span>
                  </button>
                </div>

                {/* Card: 1. Kop Surat & Logo */}
                <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl p-4 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-white">1. Kop Surat & Logo</span>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs text-gray-400 font-medium">Kop Full</span>
                      <button
                        type="button"
                        onClick={() => setKopFull(!kopFull)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${kopFull ? 'bg-[#00c988]' : 'bg-gray-700'}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${kopFull ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl border border-gray-700/60 bg-[#141518]/60 p-3 min-h-[72px] flex items-center justify-center text-center">
                      {kopImage ? (
                        <div className="relative w-full flex items-center justify-between">
                          <img src={kopImage} alt="Kop Surat" className="max-h-12 object-contain rounded" />
                          <button
                            type="button"
                            onClick={() => setKopImage(null)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline ml-2"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 font-normal">Belum ada Kop Full (Gambar Landscape)</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        id="kop-pengaturan-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setKopImage(event.target?.result as string);
                              showToast('Kop surat berhasil diunggah!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="kop-pengaturan-upload"
                        className="cursor-pointer px-5 py-2.5 rounded-full bg-[#00875a] hover:bg-[#009b65] text-white font-medium text-xs inline-flex items-center justify-center transition shadow active:scale-95 whitespace-nowrap"
                      >
                        Upload Kop
                      </label>
                    </div>
                  </div>
                </div>

                {/* Card: 2. Format Penomoran Surat */}
                <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl p-4 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-white">2. Format Penomoran Surat</span>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs text-gray-400 font-medium">Auto-Generate</span>
                      <button
                        type="button"
                        onClick={() => setAutoGenerateNomorImbauan(!autoGenerateNomorImbauan)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${autoGenerateNomorImbauan ? 'bg-[#00c988]' : 'bg-gray-700'}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${autoGenerateNomorImbauan ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    <label className="block text-xs font-semibold text-white">Kode Wilayah Surat</label>
                    <div className="bg-[#141518] border border-gray-800 rounded-xl p-3">
                      <input
                        type="text"
                        value={kodeWilayahImbauan}
                        onChange={(e) => setKodeWilayahImbauan(e.target.value)}
                        placeholder="RT.01/RW.02"
                        className="w-full bg-transparent text-xs text-white font-medium focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 italic">
                      Format Otomatis: [Urut]/[KodeSurat]/[KodeWilayah]/[Bulan]/[Tahun]
                    </p>
                  </div>
                </div>

                {/* Card: 3. Format Penanda Tangan */}
                <div className="bg-[#1c1d22] border border-[#2b2c34] rounded-2xl p-4 space-y-4 shadow-sm">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-white">3. Format Penanda Tangan</h3>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Nama, jabatan, stempel, dan gambar tanda tangan dikelola dari Settings &gt; Pengesahan TTD.
                    </p>
                  </div>

                  {/* Toggle: Tampilkan Sekretaris */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-white">Tampilkan Sekretaris</span>
                    <button
                      type="button"
                      onClick={() => setTampilkanSekretaris(!tampilkanSekretaris)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${tampilkanSekretaris ? 'bg-[#00c988]' : 'bg-[#2f3037] border border-gray-600'}`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${tampilkanSekretaris ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  {/* Toggle: Tampilkan Bendahara */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Tampilkan Bendahara</span>
                    <button
                      type="button"
                      onClick={() => setTampilkanBendahara(!tampilkanBendahara)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${tampilkanBendahara ? 'bg-[#00c988]' : 'bg-[#2f3037] border border-gray-600'}`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${tampilkanBendahara ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  {/* Toggle: Tambah Kolom Mengetahui Ketua RW */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Tambah Kolom Mengetahui Ketua RW</span>
                    <button
                      type="button"
                      onClick={() => setTampilkanKetuaRW(!tampilkanKetuaRW)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${tampilkanKetuaRW ? 'bg-[#00c988]' : 'bg-[#2f3037] border border-gray-600'}`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${tampilkanKetuaRW ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Tombol Simpan Pengaturan */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('Pengaturan & format surat berhasil disimpan!')}
                    className="w-full py-3.5 rounded-2xl bg-[#00c988] hover:bg-[#00b077] text-gray-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition tracking-wide uppercase"
                  >
                    <Save className="w-4 h-4" />
                    <span>SIMPAN PENGATURAN SURAT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MORE / PENGATURAN TAB */}
        {activeTab === 'more' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Menu & Pengaturan</h2>
              <p className="text-xs text-gray-400">Konfigurasi lingkungan RT {rtNumber} / RW {rwNumber}</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold text-sm">Informasi Wilayah RT/RW</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Nomor RT</label>
                  <input
                    type="text"
                    value={rtNumber}
                    onChange={(e) => setRtNumber(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Nomor RW</label>
                  <input
                    type="text"
                    value={rwNumber}
                    onChange={(e) => setRwNumber(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#1e1e24] border-gray-800/80' : 'bg-white border-gray-200'}`}>
              <h3 className="font-bold text-sm">Aksi Cepat</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setResidents(INITIAL_RESIDENTS);
                    setIsZeroMode(false);
                    alert('Data demografi berhasil direset ke default!');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-gray-900/40 hover:bg-gray-900/70 border border-gray-800/50 text-xs font-semibold transition flex justify-between items-center"
                >
                  <span>Reset Data Warga Default</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => {
                    setIsZeroMode(true);
                    alert('Tampilan diset ke Mode 0 Data (seperti screenshot)');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-gray-900/40 hover:bg-gray-900/70 border border-gray-800/50 text-xs font-semibold transition flex justify-between items-center"
                >
                  <span>Aktifkan Tampilan 0 Data (Screenshot Style)</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MUTASI TAB / VIEW */}
        {activeTab === 'mutasi' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight">Riwayat Mutasi</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#1e1e24] text-blue-400' : 'bg-white shadow text-blue-600'}`}
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAddMutationModal(true)}
                  className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Nama/NIK..."
                value={mutationSearch}
                onChange={(e) => setMutationSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm border-0 outline-none ${isDarkMode ? 'bg-[#1e1e24] text-white placeholder-gray-500' : 'bg-white shadow placeholder-gray-400'}`}
              />
            </div>

            {/* Filter row */}
            <div className="flex space-x-2">
              <button className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-[#1e1e24] text-gray-300' : 'bg-white shadow text-gray-700'}`}>
                <Calendar className="w-5 h-5" />
              </button>
              <div className={`flex-1 flex items-center justify-between px-4 py-3.5 rounded-2xl ${isDarkMode ? 'bg-[#1e1e24] text-gray-300' : 'bg-white shadow text-gray-700'}`}>
                <span className="text-sm font-medium">Semua</span>
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Content / Empty State */}
            {mutations.filter(m => m.nama.toLowerCase().includes(mutationSearch.toLowerCase()) || m.nik.includes(mutationSearch)).length === 0 ? (
              <div className={`p-16 rounded-3xl text-center text-gray-500 ${isDarkMode ? 'bg-[#1e1e24]/60' : 'bg-white shadow'}`}>
                <p className="text-sm">Tidak ada data riwayat.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mutations
                  .filter(m => m.nama.toLowerCase().includes(mutationSearch.toLowerCase()) || m.nik.includes(mutationSearch))
                  .map((m) => (
                    <div key={m.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800' : 'bg-white border-gray-200'} space-y-1`}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">{m.nama}</h4>
                        <span className="px-2.5 py-1 text-[10px] bg-blue-500/20 text-blue-400 rounded-lg font-semibold">{m.jenis_mutasi}</span>
                      </div>
                      <p className="text-xs text-gray-400">NIK: {m.nik} • {m.tanggal}</p>
                      <p className="text-xs text-gray-300">{m.keterangan}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination footer */}
            <div className="flex justify-between items-center pt-4 text-sm text-gray-400">
              <span>Hal 1</span>
              <div className="flex space-x-2">
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <button className={`p-3 rounded-full ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-white shadow'}`}><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 border-t flex justify-around items-center z-50 ${isDarkMode ? 'bg-[#18181b]/95 border-gray-800 backdrop-blur-lg' : 'bg-white/95 border-gray-200 backdrop-blur-lg'}`}>
        <button
          onClick={() => setActiveTab('dash')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'dash' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Dash</span>
        </button>

        <button
          onClick={() => setActiveTab('warga')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'warga' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <div className="w-12 h-12 -mt-6 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-[#121212]">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Warga</span>
        </button>

        <button
          onClick={() => setActiveTab('kk')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'kk' ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">KK</span>
        </button>

        <button
          onClick={() => {
            setShowMoreLainnyaModal(true);
          }}
          className={`flex flex-col items-center space-y-1 transition text-gray-400 hover:text-gray-200`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* MODAL: Tambah Warga */}
      {showAddResidentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center sticky top-0 bg-[#1e1e24] z-10 pb-2 space-x-4">
              <button onClick={() => setShowAddResidentModal(false)}><X className="w-5 h-5" /></button>
              <h3 className="font-bold text-lg">Tambah Warga Baru</h3>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Aktifkan Mode Bayi</span>
                <span className="text-[10px] text-gray-400">NIK akan di-generate otomatis dan status disesuaikan</span>
              </div>
              <input type="checkbox" checked={!!newResident.is_mode_bayi} onChange={(e) => setNewResident({...newResident, is_mode_bayi: e.target.checked})} className="w-8 h-4 rounded-full"/>
            </div>

            <form onSubmit={handleAddResident} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 text-[10px] uppercase font-bold">Data Pribadi</label>
                <input type="text" placeholder="NIK" value={newResident.nik || ''} onChange={(e) => setNewResident({...newResident, nik: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
              </div>
              
              <div className={`p-6 border-2 border-dashed rounded-xl ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300'} text-center`}>
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <span className="text-gray-400">Ketuk untuk memilih Foto KTP</span>
              </div>

              <input type="text" placeholder="Nama Lengkap" value={newResident.nama || ''} onChange={(e) => setNewResident({...newResident, nama: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Tempat Lahir</label><input type="text" placeholder="Tempat Lahir" value={newResident.tempat_lahir || ''} onChange={(e) => setNewResident({...newResident, tempat_lahir: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" /></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Tanggal Lahir</label><input type="date" value={newResident.tanggal_lahir || ''} onChange={(e) => setNewResident({...newResident, tanggal_lahir: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" /></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Jenis Kelamin</label><select value={newResident.jenis_kelamin} onChange={(e) => setNewResident({ ...newResident, jenis_kelamin: e.target.value as any })} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Laki-laki">L</option><option value="Perempuan">P</option></select></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Agama</label><select value={newResident.agama || 'Islam'} onChange={(e) => setNewResident({ ...newResident, agama: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Budha">Budha</option><option value="Konghucu">Konghucu</option></select></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Status Kawin</label><select value={newResident.perkawinan} onChange={(e) => setNewResident({ ...newResident, perkawinan: e.target.value as any })} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Belum Kawin">Belum Kawin</option><option value="Kawin">Kawin</option><option value="Cerai">Cerai</option></select></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Status Warga</label><select value={newResident.status_warga || 'AKTIF'} onChange={(e) => setNewResident({...newResident, status_warga: e.target.value as any})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="AKTIF">AKTIF</option><option value="TIDAK AKTIF">TIDAK AKTIF</option></select></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-gray-400 text-[10px] font-bold">Status Domisili</label><select value={newResident.status_domisili || 'DALAM'} onChange={(e) => setNewResident({...newResident, status_domisili: e.target.value as any})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="DALAM">DALAM</option><option value="LUAR">LUAR</option></select></div>
                <div><label className="text-gray-400 text-[10px] font-bold">Status Tinggal</label><select value={newResident.status_huni} onChange={(e) => setNewResident({...newResident, status_huni: e.target.value as any})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Milik Sendiri">Milik Sendiri</option><option value="Kontrak/Kos">Kontrak/Kos</option><option value="Menumpang">Menumpang</option></select></div>
              </div>

              <div><label className="text-gray-400 text-[10px] font-bold">Pendidikan Terakhir</label><select value={newResident.pendidikan_terakhir || 'SMA/SMK/MA Sederajat'} onChange={(e) => setNewResident({...newResident, pendidikan_terakhir: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="SMA/SMK/MA Sederajat">SMA/SMK/MA Sederajat</option><option value="SMP/MTs Sederajat">SMP/MTs Sederajat</option><option value="SD/MI Sederajat">SD/MI Sederajat</option></select></div>
              <div><label className="text-gray-400 text-[10px] font-bold">Asal Pendatang</label><select value={newResident.asal_pendatang || 'Asal Warga Sini'} onChange={(e) => setNewResident({...newResident, asal_pendatang: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white"><option value="Asal Warga Sini">Asal Warga Sini</option><option value="Pendatang">Pendatang</option></select></div>

              <input type="text" placeholder="Pekerjaan" className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
              <input type="text" placeholder="Nomor HP / WhatsApp" className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
              
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Alamat Lengkap (Ta..." className="col-span-2 w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" />
                <input type="text" value={rtNumber} className="w-full p-3 rounded-xl border bg-gray-900 border-gray-800 text-white" disabled />
              </div>

              <button type="submit" className="w-full py-4 rounded-xl bg-emerald-700 text-white font-bold text-sm">Simpan Data Warga</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Transaksi Kas */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Keuangan Kas RT</h3>
              <button onClick={() => setShowAddTransactionModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Kategori</label>
                <select
                  value={newTx.kategori}
                  onChange={(e) => setNewTx({ ...newTx, kategori: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="Pemasukan">Pemasukan (Iuran / Sumbangan)</option>
                  <option value="Pengeluaran">Pengeluaran (Operasional / Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran Warga Blok A Oktober"
                  value={newTx.keterangan || ''}
                  onChange={(e) => setNewTx({ ...newTx, keterangan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={newTx.nominal || ''}
                  onChange={(e) => setNewTx({ ...newTx, nominal: Number(e.target.value) })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={newTx.tanggal}
                  onChange={(e) => setNewTx({ ...newTx, tanggal: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Surat */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Buat Pengajuan Surat</h3>
              <button onClick={() => setShowLetterModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLetter} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Jenis Surat</label>
                <select
                  value={newLetter.jenis_surat}
                  onChange={(e) => setNewLetter({ ...newLetter, jenis_surat: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="Surat Pengantar Domisili">Surat Pengantar Domisili</option>
                  <option value="Surat Keterangan Kelahiran">Surat Keterangan Kelahiran</option>
                  <option value="Surat Pengantar SKCK">Surat Pengantar SKCK</option>
                  <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Warga"
                  value={newLetter.nama || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, nama: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">NIK Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="327501..."
                  value={newLetter.nik || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, nik: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Keperluan Pembuatan Surat</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Untuk persyaratan melamar pekerjaan / pembukaan rekening bank..."
                  value={newLetter.keperluan || ''}
                  onChange={(e) => setNewLetter({ ...newLetter, keperluan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLetterModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Filter Usia Manual */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white shadow-2xl' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'} space-y-6 animate-fade-in`}>
            <h3 className="font-bold text-lg tracking-tight">Filter Usia Manual</h3>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl text-center font-medium border-0 outline-none ${isDarkMode ? 'bg-[#2a2a32] text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              <span className="text-gray-400 font-bold">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl text-center font-medium border-0 outline-none ${isDarkMode ? 'bg-[#2a2a32] text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMinAge('');
                  setMaxAge('');
                  setShowAgeModal(false);
                }}
                className="text-blue-500 hover:text-blue-400 font-semibold text-sm px-3 py-2"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedMinAge(minAge);
                  setAppliedMaxAge(maxAge);
                  setShowAgeModal(false);
                }}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfigurasi & Aksi KK */}
      {showKkOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white shadow-2xl' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'} space-y-5 animate-fade-in`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base tracking-tight">Konfigurasi & Aksi KK</h3>
              <button onClick={() => setShowKkOptionsModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Filter & Urutan</div>
              <div className="space-y-2">
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Wilayah RT</label>
                  <select
                    value={kkRtFilter}
                    onChange={(e) => setKkRtFilter(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="Semua RT">Semua RT</option>
                    <option value="RT 011">RT {rtNumber}</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Urutkan Data</label>
                  <select
                    value={kkSortOrder}
                    onChange={(e) => setKkSortOrder(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="Terbaru">Terbaru</option>
                    <option value="Terlama">Terlama</option>
                    <option value="Jumlah Anggota Terbanyak">Jumlah Anggota Terbanyak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Aksi Data</div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowKkOptionsModal(false);
                    setShowAddResidentModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input KK Baru</span>
                </button>
                <button
                  onClick={() => {
                    setShowKkOptionsModal(false);
                    window.print();
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Menu Lainnya */}
      {showMoreLainnyaModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-md bg-[#1e1e24] text-white rounded-t-[32px] p-6 space-y-6 shadow-2xl border-t border-gray-800 animate-slide-up">
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto"></div>

            {/* Header Title & Logout Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">Menu Lainnya</h3>
              <button
                onClick={() => {
                  if (confirm('Keluar dari sesi Admin RT?')) {
                    setShowMoreLainnyaModal(false);
                    alert('Berhasil keluar (Admin).');
                  }
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/25 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Admin)</span>
              </button>
            </div>

            {/* 2x4 Grid of Menu Items */}
            <div className="grid grid-cols-4 gap-4 pt-2">
              {/* 1. Mutasi */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('mutasi');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <RefreshCcw className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Mutasi</span>
              </button>

              {/* 2. Keuangan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('keuangan');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Keuangan</span>
              </button>

              {/* 3. Cetak Surat */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('surat');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Printer className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Cetak Surat</span>
              </button>

              {/* 4. Laporan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('dash');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Laporan</span>
              </button>

              {/* 5. Inventaris */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('inventaris');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Inventaris</span>
              </button>

              {/* 6. Bantuan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('bantuan');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Bantuan</span>
              </button>

              {/* 7. Log Aktivitas */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  alert('Log Aktivitas Sistem WargaKu');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-gray-200 text-center leading-tight">Log Aktivitas</span>
              </button>

              {/* 8. Pengaturan */}
              <button
                onClick={() => {
                  setShowMoreLainnyaModal(false);
                  setActiveTab('more');
                }}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-slate-500/20 text-slate-300 flex items-center justify-center transition group-hover:scale-105 shadow-md">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-200">Pengaturan</span>
              </button>
            </div>

            <div className="pt-2 pb-4 text-center">
              <button
                onClick={() => setShowMoreLainnyaModal(false)}
                className="w-full py-3 rounded-2xl bg-gray-800 text-gray-300 font-bold text-sm hover:bg-gray-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Tambah Mutasi */}
      {showAddMutationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Mutasi Warga</h3>
              <button onClick={() => setShowAddMutationModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newMutation.nama) return;
              const item: MutationRecord = {
                id: 'mut_' + Date.now(),
                nama: newMutation.nama || '',
                nik: newMutation.nik || '327501...',
                jenis_mutasi: newMutation.jenis_mutasi as any || 'Pindah Masuk',
                tanggal: newMutation.tanggal || new Date().toISOString().split('T')[0],
                keterangan: newMutation.keterangan || '-'
              };
              setMutations([item, ...mutations]);
              setShowAddMutationModal(false);
              setNewMutation({ jenis_mutasi: 'Pindah Masuk', tanggal: new Date().toISOString().split('T')[0] });
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Jenis Mutasi</label>
                <select
                  value={newMutation.jenis_mutasi || 'Pindah Masuk'}
                  onChange={(e) => setNewMutation({ ...newMutation, jenis_mutasi: e.target.value as any })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="Pindah Masuk">Pindah Masuk</option>
                  <option value="Pindah Keluar">Pindah Keluar</option>
                  <option value="Pindah RT">Pindah RT</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nama Warga</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Warga"
                  value={newMutation.nama || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, nama: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">NIK</label>
                <input
                  type="text"
                  placeholder="NIK Warga"
                  value={newMutation.nik || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, nik: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Keterangan / Alasan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan mutasi..."
                  value={newMutation.keterangan || ''}
                  onChange={(e) => setNewMutation({ ...newMutation, keterangan: e.target.value })}
                  className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMutationModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-fade-in border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* MODAL: Kelola Template Surat Pribadi */}
      {showKelolaTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto`}>
            <div className="flex justify-between items-center pb-2 border-b border-gray-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Kelola Template Surat Pribadi</h3>
                  <p className="text-[11px] text-gray-400">Buat template kustom tanpa mengubah bawaan</p>
                </div>
              </div>
              <button onClick={() => setShowKelolaTemplateModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Existing Custom Templates */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Template Tersimpan</label>
              {customTemplates.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-400">
                  Belum ada template pribadi. Tambahkan melalui form di bawah.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customTemplates.map((tpl) => (
                    <div key={tpl.id} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1.5 flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <h4 className="font-bold text-xs text-white">{tpl.nama}</h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2">{tpl.konten}</p>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setPerihalImbauan(tpl.nama.toUpperCase());
                            setIsiSuratImbauan(tpl.konten);
                            setSuratSubTab('imbauan');
                            setShowKelolaTemplateModal(false);
                            showToast('Template diterapkan ke Surat Imbauan!');
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30"
                        >
                          Pakai
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomTemplates(customTemplates.filter(item => item.id !== tpl.id));
                            showToast('Template dihapus!');
                          }}
                          className="p-1 text-red-400 hover:text-red-300 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Tambah Template */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTemplateNama.trim() || !newTemplateKonten.trim()) return;
                const newTpl = {
                  id: 'ct_' + Date.now(),
                  nama: newTemplateNama.trim(),
                  konten: newTemplateKonten.trim()
                };
                setCustomTemplates([newTpl, ...customTemplates]);
                setNewTemplateNama('');
                setNewTemplateKonten('');
                showToast('Template baru berhasil ditambahkan!');
              }}
              className="space-y-3 pt-2 border-t border-gray-800/60 text-xs"
            >
              <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Tambah Template Baru</label>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nama Template (Contoh: Surat Edaran Ronda Khusus)"
                  value={newTemplateNama}
                  onChange={(e) => setNewTemplateNama(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={3}
                  placeholder="Ketik draf isi surat template Anda di sini..."
                  value={newTemplateKonten}
                  onChange={(e) => setNewTemplateKonten(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowKelolaTemplateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00875a] hover:bg-[#009b65] text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simpan Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cari & Pilih Warga Pemohon */}
      {showSelectResidentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Pilih Warga Pemohon</h3>
                <p className="text-xs text-gray-400">Pilih dari data kependudukan RT {rtNumber}</p>
              </div>
              <button onClick={() => setShowSelectResidentModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama warga, NIK, atau no KK..."
                value={residentSearchForSurat}
                onChange={(e) => setResidentSearchForSurat(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(residents.length > 0 ? residents : INITIAL_RESIDENTS)
                .filter(r => 
                  r.nama.toLowerCase().includes(residentSearchForSurat.toLowerCase()) ||
                  r.nik.includes(residentSearchForSurat) ||
                  r.no_kk.includes(residentSearchForSurat)
                )
                .map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedResidentForSurat(r);
                      setShowSelectResidentModal(false);
                      showToast(`Warga pemohon: ${r.nama} dipilih!`);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedResidentForSurat?.id === r.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-gray-900/60 border-gray-800/80 hover:bg-gray-800/70 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {r.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{r.nama}</p>
                        <p className="text-[10px] text-gray-400">NIK: {r.nik} • {r.jenis_kelamin}</p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{r.alamat}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg">
                      Pilih
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-gray-800 text-center">
              <button
                onClick={() => {
                  const manualName = prompt('Masukkan Nama Warga Pemohon:');
                  if (!manualName) return;
                  const manualNik = prompt('Masukkan NIK Warga Pemohon:') || '327501' + Date.now();
                  const tempWarga: Resident = {
                    id: 'temp_' + Date.now(),
                    nama: manualName,
                    nik: manualNik,
                    no_kk: '3275011001000001',
                    jenis_kelamin: 'Laki-laki',
                    status_huni: 'Milik Sendiri',
                    perkawinan: 'Kawin',
                    pekerjaan: 'Wiraswasta',
                    telepon: '-',
                    alamat: `Jl. Lingkungan RT ${rtNumber}/RW ${rwNumber}`,
                    is_kepala_keluarga: true
                  };
                  setSelectedResidentForSurat(tempWarga);
                  setShowSelectResidentModal(false);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                + Input Pemohon Manual (Belum Terdata)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generate & Preview Surat (Official Letter) */}
      {showLetterPreviewModal && activePreviewLetter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-white text-gray-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header modal controls */}
            <div className="flex justify-between items-center border-b pb-3 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-800">Preview Surat Resmi RT/RW</h3>
              </div>
              <button onClick={() => setShowLetterPreviewModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Letter Container */}
            <div id="printable-surat" className="bg-white text-black p-4 sm:p-6 text-xs sm:text-sm font-serif leading-relaxed">
              {/* KOP SURAT */}
              {kopFull && kopImage ? (
                <div className="border-b-2 border-black pb-3 mb-4 text-center">
                  <img src={kopImage} alt="Kop Surat Resmi" className="max-h-24 w-auto mx-auto object-contain" />
                </div>
              ) : (
                <div className="text-center border-b-2 border-black pb-3 mb-4 space-y-0.5 text-black">
                  <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                    PEMERINTAH KABUPATEN {suratConfig.kabupaten.toUpperCase()} | KECAMATAN {suratConfig.kecamatan.toUpperCase()}
                  </h4>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wide">
                    PEMERINTAH DESA {suratConfig.kelurahan.toUpperCase()}
                  </h3>
                  <h2 className="font-black text-base sm:text-lg uppercase tracking-tight">
                    PENGURUS RT {rtNumber} / RW {rwNumber}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-800 font-medium leading-snug pt-1">
                    Sekretariat: {suratConfig.alamatSekretariat}
                  </p>
                </div>
              )}

              {/* JUDUL SURAT & NOMOR */}
              <div className="text-center my-4">
                <h3 className="font-bold text-sm sm:text-base underline uppercase tracking-wide">
                  {activePreviewLetter.jenisSurat}
                </h3>
                <p className="text-xs font-semibold text-gray-700">
                  Nomor: {activePreviewLetter.nomorSurat}
                </p>
              </div>

              {/* ISI SURAT */}
              <p className="mb-3 text-justify">
                Yang bertanda tangan di bawah ini Ketua Rukun Tetangga (RT) {rtNumber} / RW {rwNumber} Kelurahan {suratConfig.kelurahan}, Kecamatan {suratConfig.kecamatan}, {suratConfig.kota}, dengan ini menerangkan bahwa:
              </p>

              <table className="w-full my-3 text-xs sm:text-sm">
                <tbody>
                  <tr>
                    <td className="w-36 py-0.5 font-medium">Nama Lengkap</td>
                    <td className="w-3 py-0.5">:</td>
                    <td className="py-0.5 font-bold uppercase">{activePreviewLetter.nama}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium">NIK</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-mono">{activePreviewLetter.nik}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium">No. Kartu Keluarga</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-mono">{activePreviewLetter.no_kk || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium">Jenis Kelamin</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{activePreviewLetter.jenis_kelamin || 'Laki-laki'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium">Tempat / Tgl Lahir</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{activePreviewLetter.tempat_lahir || 'Bekasi'}, {activePreviewLetter.tanggal_lahir || '01-01-1990'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium">Agama</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{activePreviewLetter.agama || 'Islam'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium">Pekerjaan</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">{activePreviewLetter.pekerjaan || 'Wiraswasta'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-medium align-top">Alamat Domisili</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{activePreviewLetter.alamat}</td>
                  </tr>
                </tbody>
              </table>

              <p className="my-3 text-justify">
                Orang tersebut di atas adalah benar-benar warga yang bertempat tinggal di lingkungan kami RT {rtNumber} / RW {rwNumber} Kelurahan {suratConfig.kelurahan}. Sepanjang pengetahuan kami, yang bersangkutan berkelakuan baik dan bermasyarakat.
              </p>

              <p className="my-3 text-justify">
                Surat ini diterbitkan untuk keperluan: <span className="font-bold text-black">{activePreviewLetter.keperluan}</span>.
              </p>

              <p className="my-3 text-justify">
                Demikian surat pengantar ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya oleh yang bersangkutan.
              </p>

              {/* TANDA TANGAN */}
              <div className="pt-6">
                <div className="text-right mb-4">
                  <span>{suratConfig.kota}, {activePreviewLetter.tanggal}</span>
                </div>
                <div className="flex justify-between items-start text-center text-xs sm:text-sm gap-2">
                  {tampilkanKetuaRW && (
                    <div className="flex-1">
                      <p className="font-medium">Mengetahui,</p>
                      <p className="font-bold">Ketua RW</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 italic">( Tanda Tangan & Cap )</span>
                      </div>
                      <p className="font-bold underline uppercase">{suratConfig.namaKetuaRW}</p>
                    </div>
                  )}

                  {tampilkanSekretaris && (
                    <div className="flex-1">
                      <p className="font-medium">Mengetahui,</p>
                      <p className="font-bold">Sekretaris</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 italic">( Tanda Tangan )</span>
                      </div>
                      <p className="font-bold underline uppercase">( Sekretaris )</p>
                    </div>
                  )}

                  {tampilkanBendahara && (
                    <div className="flex-1">
                      <p className="font-medium">Mengetahui,</p>
                      <p className="font-bold">Bendahara</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 italic">( Tanda Tangan )</span>
                      </div>
                      <p className="font-bold underline uppercase">( Bendahara )</p>
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="font-medium">Hormat Kami,</p>
                    <p className="font-bold">Ketua {kodeWilayahImbauan.split('/')[0] || `RT ${rtNumber}`}</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-gray-400 italic">( Tanda Tangan & Cap )</span>
                    </div>
                    <p className="font-bold underline uppercase">{suratConfig.namaKetuaRT}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t print:hidden">
              <button
                onClick={() => {
                  const plain = `SURAT PENGANTAR RT ${rtNumber}/RW ${rwNumber}\nNomor: ${activePreviewLetter.nomorSurat}\nNama: ${activePreviewLetter.nama}\nNIK: ${activePreviewLetter.nik}\nAlamat: ${activePreviewLetter.alamat}\nKeperluan: ${activePreviewLetter.keperluan}\nTanggal: ${activePreviewLetter.tanggal}`;
                  navigator.clipboard.writeText(plain);
                  showToast('Teks surat berhasil disalin!');
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-semibold text-xs text-gray-700 flex items-center justify-center space-x-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Format Teks</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Drafts List */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Draft Surat Tersimpan</h3>
              </div>
              <button onClick={() => setShowDraftsModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {letterDrafts.length === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-2">
                <Mail className="w-10 h-10 mx-auto text-gray-600 opacity-60" />
                <p className="text-xs">Belum ada draft surat yang tersimpan.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {letterDrafts.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 uppercase">
                          {d.jenisSurat}
                        </span>
                        <h4 className="font-bold text-xs text-white mt-1">{d.nama}</h4>
                        <p className="text-[10px] text-gray-400">NIK: {d.nik}</p>
                      </div>
                      <span className="text-[10px] text-gray-500">{d.savedAt}</span>
                    </div>

                    <p className="text-[11px] text-gray-300 italic bg-black/30 p-2 rounded-xl">
                      "{d.keperluan}"
                    </p>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => {
                          setLetterDrafts(letterDrafts.filter(item => item.id !== d.id));
                          showToast('Draft berhasil dihapus');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJenisSurat(d.jenisSurat);
                          setKeperluanSurat(d.keperluan);
                          if (d.resident) {
                            setSelectedResidentForSurat(d.resident);
                          }
                          setShowDraftsModal(false);
                          showToast('Draft surat berhasil dimuat!');
                        }}
                        className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg transition"
                      >
                        Gunakan Draft
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: In & Out (Arsip Surat) */}
      {showInOutModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1e1e24] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Arsip Surat (In & Out)</h3>
              </div>
              <button onClick={() => setShowInOutModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In & Out Tabs */}
            <div className="flex rounded-2xl bg-gray-900 p-1 border border-gray-800">
              <button
                onClick={() => setInOutTab('keluar')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  inOutTab === 'keluar' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Surat Keluar ({inOutLetters.filter(l => l.tipe === 'KELUAR').length})
              </button>
              <button
                onClick={() => setInOutTab('masuk')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  inOutTab === 'masuk' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Surat Masuk ({inOutLetters.filter(l => l.tipe === 'MASUK').length})
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {inOutLetters
                .filter(l => (inOutTab === 'keluar' ? l.tipe === 'KELUAR' : l.tipe === 'MASUK'))
                .map((l) => (
                  <div key={l.id} className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">
                          {l.nomorSurat}
                        </span>
                        <h4 className="font-bold text-xs text-white mt-1.5">{l.jenisSurat}</h4>
                        <p className="text-[11px] text-gray-300 font-medium">{l.namaPemohon}</p>
                      </div>
                      <span className="text-[10px] text-gray-500">{l.tanggal}</span>
                    </div>

                    <p className="text-[11px] text-gray-400 bg-black/30 p-2 rounded-xl">
                      <span className="text-gray-500">Keperluan:</span> {l.keperluan}
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          const letterData = {
                            nomorSurat: l.nomorSurat,
                            jenisSurat: l.jenisSurat,
                            nama: l.namaPemohon,
                            nik: l.nik,
                            alamat: l.alamat,
                            keperluan: l.keperluan,
                            tanggal: l.tanggal
                          };
                          setActivePreviewLetter(letterData);
                          setShowInOutModal(false);
                          setShowLetterPreviewModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl transition flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Ulang</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Preview Surat Imbauan */}
      {showImbauanPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white text-gray-900 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 print:hidden">
              <h3 className="font-bold text-base text-gray-800">Preview Surat Edaran / Imbauan Warga</h3>
              <button onClick={() => setShowImbauanPreviewModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-surat" className="bg-white text-black p-4 text-xs sm:text-sm font-serif leading-relaxed">
              {/* Kop Surat */}
              {kopFull && kopImage ? (
                <div className="border-b-2 border-black pb-3 mb-4 text-center">
                  <img src={kopImage} alt="Kop Surat Resmi" className="max-h-24 w-auto mx-auto object-contain" />
                </div>
              ) : (
                <div className="text-center border-b-2 border-black pb-3 mb-4 space-y-0.5 text-black">
                  <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                    PEMERINTAH KABUPATEN {suratConfig.kabupaten.toUpperCase()} | KECAMATAN {suratConfig.kecamatan.toUpperCase()}
                  </h4>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wide">
                    PEMERINTAH DESA {suratConfig.kelurahan.toUpperCase()}
                  </h3>
                  <h2 className="font-black text-base sm:text-lg uppercase tracking-tight">
                    PENGURUS RT {rtNumber} / RW {rwNumber}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-800 font-medium leading-snug pt-1">
                    Sekretariat: {suratConfig.alamatSekretariat}
                  </p>
                </div>
              )}

              {/* Judul & Nomor Surat */}
              <div className="text-center my-3">
                <h3 className="font-bold text-base underline uppercase">{perihalImbauan}</h3>
                <p className="text-xs font-mono mt-0.5">
                  Nomor: {autoGenerateNomorImbauan ? `001/SI/${kodeWilayahImbauan}/${new Date().toLocaleDateString('id-ID', { month: '2-digit' })}/${new Date().getFullYear()}` : `001/SI/${kodeWilayahImbauan}/2026`}
                </p>
              </div>

              <p className="my-2">Kepada Yth., Seluruh Warga Lingkungan {kodeWilayahImbauan}</p>
              <p className="my-2 text-justify">
                {isiSuratImbauan}
              </p>

              {/* Rincian Waktu & Lokasi */}
              {(tanggalImbauan || waktuImbauan || tempatImbauan) && (
                <div className="my-3 pl-4 space-y-1 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                  {tanggalImbauan && <p><span className="font-bold">Hari, Tanggal :</span> {tanggalImbauan}</p>}
                  {waktuImbauan && <p><span className="font-bold">Waktu :</span> {waktuImbauan}</p>}
                  {tempatImbauan && <p><span className="font-bold">Tempat :</span> {tempatImbauan}</p>}
                </div>
              )}

              <p className="my-3 text-justify">
                Demikian surat imbauan ini kami sampaikan. Atas perhatian, kesadaran, dan partisipasi aktif seluruh bapak/ibu warga kami ucapkan terima kasih.
              </p>

              {/* Tanda Tangan Sesuai Format */}
              <div className="pt-6">
                {formatTandaTanganImbauan === 'RT & Sekretaris' ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs">Mengetahui,</p>
                      <p className="font-bold text-xs pt-1">Sekretaris Lingkungan</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline text-xs uppercase">( ............................................ )</p>
                    </div>
                    <div>
                      <p className="text-xs">{suratConfig.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold text-xs pt-1">Ketua {kodeWilayahImbauan.split('/')[0] || `RT ${rtNumber}`}</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline text-xs uppercase">{suratConfig.namaKetuaRT}</p>
                    </div>
                  </div>
                ) : formatTandaTanganImbauan === 'Ketua RW & RT' ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs">Mengetahui,</p>
                      <p className="font-bold text-xs pt-1">Ketua RW</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline text-xs uppercase">{suratConfig.namaKetuaRW}</p>
                    </div>
                    <div>
                      <p className="text-xs">{suratConfig.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold text-xs pt-1">Ketua {kodeWilayahImbauan.split('/')[0] || `RT ${rtNumber}`}</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline text-xs uppercase">{suratConfig.namaKetuaRT}</p>
                    </div>
                  </div>
                ) : formatTandaTanganImbauan === 'Ketua RT & Bendahara' ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs">Mengetahui,</p>
                      <p className="font-bold text-xs pt-1">Bendahara Lingkungan</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline text-xs uppercase">( ............................................ )</p>
                    </div>
                    <div>
                      <p className="text-xs">{suratConfig.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold text-xs pt-1">Ketua {kodeWilayahImbauan.split('/')[0] || `RT ${rtNumber}`}</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline text-xs uppercase">{suratConfig.namaKetuaRT}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-xs">{suratConfig.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-xs pt-1">Ketua {kodeWilayahImbauan.split('/')[0] || `RT ${rtNumber}`}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-xs uppercase">{suratConfig.namaKetuaRT}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t print:hidden">
              <button
                onClick={() => {
                  const letterNo = autoGenerateNomorImbauan ? `001/SI/${kodeWilayahImbauan}/${new Date().toLocaleDateString('id-ID', { month: '2-digit' })}/${new Date().getFullYear()}` : `001/SI/${kodeWilayahImbauan}/2026`;
                  const newLog = {
                    id: 'io_' + Date.now(),
                    tipe: 'KELUAR' as const,
                    nomorSurat: letterNo,
                    jenisSurat: 'SURAT IMBAUAN',
                    namaPemohon: `Seluruh Warga ${kodeWilayahImbauan}`,
                    nik: '-',
                    alamat: `Lingkungan ${kodeWilayahImbauan}`,
                    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    keperluan: perihalImbauan,
                    status: 'Terbit'
                  };
                  setInOutLetters(prev => [newLog, ...prev]);
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Imbauan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pilih Dompet Kas (Keuangan) */}
      {showDompetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1c1d22] border-[#2b2c34] text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Pilih Dompet Kas</h3>
                  <p className="text-[11px] text-gray-400">Pilih dompet untuk filter data saldo</p>
                </div>
              </div>
              <button onClick={() => setShowDompetModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {/* Option: Semua Dompet */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDompet('Semua Dompet');
                  setShowDompetModal(false);
                  showToast('Menampilkan semua dompet kas');
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                  selectedDompet === 'Semua Dompet'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#141518] border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Semua Dompet</h4>
                    <p className="text-[10px] text-gray-400">Gabungan seluruh kas lingkungan RT</p>
                  </div>
                </div>
                {selectedDompet === 'Semua Dompet' && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
              </button>

              {/* Individual Wallets */}
              {dompetList.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDompet(d.nama);
                    setShowDompetModal(false);
                    showToast(`Dompet ${d.nama} aktif`);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    selectedDompet === d.nama
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-[#141518] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{d.nama}</h4>
                      <p className="text-[10px] text-gray-400">{d.noRek || 'Kas Tunai'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">
                      Rp {d.saldo.toLocaleString('id-ID')}
                    </div>
                    {selectedDompet === d.nama && (
                      <span className="text-[10px] text-blue-400 font-semibold">Aktif</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setShowDompetModal(false);
                  setShowAturDompetModal(true);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Atur & Kelola Dompet</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDompetModal(false)}
                className="px-4 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Atur Dompet (Keuangan) */}
      {showAturDompetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1c1d22] border-[#2b2c34] text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in max-h-[88vh] overflow-y-auto`}>
            {/* Header matching screenshot IMG_20261024_052826_6aaa52bb.jpg */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0091ff] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white">Kelola Dompet Kas & Rekening</h3>
              </div>
              <button
                onClick={() => setShowAturDompetModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Big Action Button matching screenshot: "+ Tambah Rekening / Kas Baru" */}
            <button
              type="button"
              onClick={() => {
                setShowAturDompetModal(false);
                setShowTambahDompetModal(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0091ff] hover:bg-[#007acc] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 active:scale-98 transition"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Tambah Rekening / Kas Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAturDompetModal(false)}
              className="w-full py-3 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs hover:bg-gray-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Rincian Neraca Keuangan (Keuangan) */}
      {showNeracaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1c1d22] border-[#2b2c34] text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Rincian Neraca Keuangan</h3>
                  <p className="text-[11px] text-gray-400">Laporan posisi kas & analitik pemasukan/pengeluaran</p>
                </div>
              </div>
              <button onClick={() => setShowNeracaModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Periode Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141518] border border-gray-800 text-xs">
              <span className="text-gray-400">Periode Laporan:</span>
              <span className="font-bold text-blue-400">{filterBulanKeuangan} / {filterTahunKeuangan}</span>
            </div>

            {/* 3 Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Total Masuk</span>
                <span className="text-xs font-black text-white mt-1 block">
                  Rp {isZeroMode ? '0' : totalPemasukan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] font-bold text-rose-400 uppercase block">Total Keluar</span>
                <span className="text-xs font-black text-white mt-1 block">
                  Rp {isZeroMode ? '0' : totalPengeluaran.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-[10px] font-bold text-indigo-400 uppercase block">Saldo Bersih</span>
                <span className="text-xs font-black text-white mt-1 block">
                  Rp {isZeroMode ? '0' : saldoKas.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Rincian Pos Neraca */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[11px] text-gray-400 uppercase tracking-wider">Komposisi Kas & Anggaran</h4>
              <div className="space-y-1.5">
                <div className="p-3 rounded-xl bg-[#141518] border border-gray-800/80 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-gray-300">Iuran Warga Bulanan</span>
                  </div>
                  <span className="font-bold text-white">Rp {isZeroMode ? '0' : '1.850.000'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141518] border border-gray-800/80 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="text-gray-300">Sumbangan & Donasi Sosial</span>
                  </div>
                  <span className="font-bold text-white">Rp {isZeroMode ? '0' : '650.000'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141518] border border-gray-800/80 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="text-gray-300">Biaya Kebersihan & Sampah</span>
                  </div>
                  <span className="font-bold text-white">Rp {isZeroMode ? '0' : '750.000'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141518] border border-gray-800/80 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-gray-300">Operasional Ronda & Keamanan</span>
                  </div>
                  <span className="font-bold text-white">Rp {isZeroMode ? '0' : '450.000'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowNeracaModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Neraca</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Tambah Dompet Kas Baru */}
      {showTambahDompetModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1c1d22] border-[#2b2c34] text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-5 shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Tambah Dompet Kas Baru</h3>
              <button onClick={() => { setShowTambahDompetModal(false); setShowAturDompetModal(true); }} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewDompetData({ ...newDompetData, jenis: 'bank' })}
                className={`py-3 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold transition ${
                  newDompetData.jenis === 'bank'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-[#141518] border-gray-800 text-gray-500 hover:border-gray-700'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Rekening Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setNewDompetData({ ...newDompetData, jenis: 'tunai' })}
                className={`py-3 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold transition ${
                  newDompetData.jenis === 'tunai'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-[#141518] border-gray-800 text-gray-500 hover:border-gray-700'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Kas Tunai (Cash)</span>
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3 text-sm">
              <input
                type="text"
                placeholder="Nama Bank / Dompet"
                value={newDompetData.nama}
                onChange={(e) => setNewDompetData({ ...newDompetData, nama: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Nomor Rekening (Opsional)"
                value={newDompetData.nomor}
                onChange={(e) => setNewDompetData({ ...newDompetData, nomor: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Atas Nama / Pemilik (Opsional)"
                value={newDompetData.pemilik}
                onChange={(e) => setNewDompetData({ ...newDompetData, pemilik: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowTambahDompetModal(false); setShowAturDompetModal(true); }}
                className="py-3.5 rounded-2xl bg-[#141518] text-gray-400 font-bold hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newDompetData.nama.trim()) return;
                  const newD = {
                    id: 'd_' + Date.now(),
                    nama: newDompetData.nama,
                    saldo: 0,
                    noRek: newDompetData.nomor || 'Kas Tunai'
                  };
                  setDompetList([...dompetList, newD]);
                  setShowTambahDompetModal(false);
                  setShowAturDompetModal(true);
                  setNewDompetData({ nama: '', nomor: '', pemilik: '', jenis: 'bank' });
                  showToast('Dompet baru berhasil disimpan!');
                }}
                className="py-3.5 rounded-2xl bg-[#0091ff] hover:bg-[#007acc] text-white font-bold transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Barang Inventaris */}
      {showAddInventarisModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${isDarkMode ? 'bg-[#1c1d22] border-[#2b2c34] text-white' : 'bg-white border-gray-200 text-gray-900'} space-y-4 shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Tambah Barang Inventaris</h3>
                  <p className="text-[11px] text-gray-400">Catat aset / inventaris milik RT</p>
                </div>
              </div>
              <button onClick={() => setShowAddInventarisModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newInventaris.nama.trim()) return;
                const newInv = {
                  id: 'inv_' + Date.now(),
                  nama: newInventaris.nama.trim(),
                  kode: newInventaris.kode.trim() || `INV-${String(inventarisItems.length + 1).padStart(3, '0')}`,
                  kategori: newInventaris.kategori,
                  jumlahTotal: Number(newInventaris.jumlahTotal) || 1,
                  diLuar: 0,
                  diDalam: Number(newInventaris.jumlahTotal) || 1,
                  kondisiBaik: Number(newInventaris.jumlahTotal) || 1,
                  kondisiRusak: 0,
                  lokasi: newInventaris.lokasi
                };
                setInventarisItems([newInv, ...inventarisItems]);
                setNewInventaris({ nama: '', kode: '', kategori: 'Perlengkapan RT', jumlahTotal: 1, lokasi: 'Sekretariat RT' });
                setShowAddInventarisModal(false);
                showToast(`Barang "${newInv.nama}" berhasil ditambahkan!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-gray-400 text-[10px] mb-1 block">Nama Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tenda Serbaguna 3x6m"
                  value={newInventaris.nama}
                  onChange={(e) => setNewInventaris({ ...newInventaris, nama: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Kode Barang (Opsional)</label>
                  <input
                    type="text"
                    placeholder="INV-004"
                    value={newInventaris.kode}
                    onChange={(e) => setNewInventaris({ ...newInventaris, kode: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Jumlah Unit</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newInventaris.jumlahTotal}
                    onChange={(e) => setNewInventaris({ ...newInventaris, jumlahTotal: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-[10px] mb-1 block">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  placeholder="Contoh: Gudang RT / Pos Ronda"
                  value={newInventaris.lokasi}
                  onChange={(e) => setNewInventaris({ ...newInventaris, lokasi: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInventarisModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simpan Barang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Form Pinjam Barang (Matching Screenshot_2026-10-24-16-02-22-17_ef9df8ce568b803c96504800499ab560_e464e5fa.jpg) */}
      {showPinjamInventarisModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#18191d] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4 text-white shadow-2xl max-h-[92vh] overflow-y-auto animate-fade-in">
            {/* Top Bar Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-800">
              <button
                type="button"
                onClick={() => setShowPinjamInventarisModal(false)}
                className="p-2 rounded-xl bg-[#23252a] text-gray-300 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
                Pinjam Barang
              </h3>
            </div>

            {/* Section 1: Barang yang Dipinjam */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white">Barang yang Dipinjam</h4>
                <button
                  type="button"
                  onClick={() => setShowSelectBarangModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Tambah Barang</span>
                </button>
              </div>

              {/* Cart Box */}
              <div className="bg-[#23252a] border border-gray-800/80 rounded-2xl p-5 text-center">
                {selectedCartItems.length === 0 ? (
                  <div className="py-4 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#18191d] flex items-center justify-center text-gray-600 border border-gray-800">
                      <Archive className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-white pt-1">Keranjang masih kosong</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Klik tombol '+ Tambah Barang' di atas untuk memilih barang.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-left">
                    {selectedCartItems.map((cItem) => (
                      <div
                        key={cItem.id}
                        className="p-3.5 rounded-xl bg-[#18191d] border border-gray-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-white">{cItem.nama}</p>
                          <p className="text-[10px] text-gray-400">Jumlah: {cItem.jumlah} Unit</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (cItem.jumlah > 1) {
                                setSelectedCartItems(selectedCartItems.map(i => i.id === cItem.id ? { ...i, jumlah: i.jumlah - 1 } : i));
                              } else {
                                setSelectedCartItems(selectedCartItems.filter(i => i.id !== cItem.id));
                              }
                            }}
                            className="p-1 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">{cItem.jumlah}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCartItems(selectedCartItems.map(i => i.id === cItem.id ? { ...i, jumlah: i.jumlah + 1 } : i));
                            }}
                            className="p-1 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCartItems(selectedCartItems.filter(i => i.id !== cItem.id))}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Siapa yang pinjam? */}
            <div className="bg-[#23252a] border border-gray-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <h4 className="font-bold text-sm text-white">Siapa yang pinjam?</h4>

              {/* Radio options */}
              <div className="flex items-center space-x-6 text-xs font-semibold">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="peminjamType"
                    checked={peminjamType === 'warga'}
                    onChange={() => setPeminjamType('warga')}
                    className="w-4 h-4 text-indigo-500 accent-indigo-500 focus:ring-0"
                  />
                  <span className="text-gray-200">Warga Sini</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="peminjamType"
                    checked={peminjamType === 'luar'}
                    onChange={() => setPeminjamType('luar')}
                    className="w-4 h-4 text-indigo-500 accent-indigo-500 focus:ring-0"
                  />
                  <span className="text-gray-200">Orang Luar</span>
                </label>
              </div>

              {/* Selection Input Field */}
              {peminjamType === 'warga' ? (
                <button
                  type="button"
                  onClick={() => setShowSelectResidentForPinjamModal(true)}
                  className="w-full p-3.5 rounded-xl bg-[#141518] border border-gray-800 text-left flex items-center space-x-3 text-xs text-white hover:border-gray-700 transition"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className={selectedWargaPeminjamForPinjam ? 'font-bold text-white' : 'text-gray-400 font-medium'}>
                    {selectedWargaPeminjamForPinjam ? `${selectedWargaPeminjamForPinjam.nama} (NIK: ${selectedWargaPeminjamForPinjam.nik})` : 'Pilih Warga...'}
                  </span>
                </button>
              ) : (
                <input
                  type="text"
                  placeholder="Masukkan nama peminjam / instansi luar..."
                  value={namaPeminjamLuar}
                  onChange={(e) => setNamaPeminjamLuar(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[#141518] border border-gray-800 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* Section 3: Keterangan Acara & Tanggal */}
            <div className="bg-[#23252a] border border-gray-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Keterangan Acara"
                  value={keteranganAcara}
                  onChange={(e) => setKeteranganAcara(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[#141518] border border-gray-800 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block font-semibold">Tgl Pinjam</label>
                  <input
                    type="text"
                    value={tanggalPinjamInput}
                    onChange={(e) => setTanggalPinjamInput(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#141518] border border-gray-800 text-xs font-bold text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block font-semibold">Target Kembali</label>
                  <input
                    type="text"
                    placeholder="Pilih Tgl"
                    value={targetKembaliInput}
                    onChange={(e) => setTargetKembaliInput(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#141518] border border-gray-800 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedCartItems.length === 0) {
                    showToast('Pilih setidaknya 1 barang untuk dipinjam!');
                    setShowSelectBarangModal(true);
                    return;
                  }
                  const borrower = peminjamType === 'warga'
                    ? (selectedWargaPeminjamForPinjam?.nama || 'Warga RT')
                    : (namaPeminjamLuar || 'Peminjam Luar');

                  selectedCartItems.forEach(item => {
                    const newLog = {
                      id: 'pmj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                      namaBarang: item.nama,
                      peminjam: `${borrower}${keteranganAcara ? ' (' + keteranganAcara + ')' : ''}`,
                      jumlah: item.jumlah,
                      tanggalPinjam: tanggalPinjamInput,
                      tanggalKembaliTarget: targetKembaliInput || 'Besok',
                      status: 'Dipinjam' as const
                    };
                    setPeminjamanLogs(prev => [newLog, ...prev]);

                    // Update inventaris item counts
                    setInventarisItems(prev => prev.map(inv => {
                      if (inv.nama === item.nama) {
                        return {
                          ...inv,
                          diLuar: inv.diLuar + item.jumlah,
                          diDalam: Math.max(0, inv.diDalam - item.jumlah)
                        };
                      }
                      return inv;
                    }));
                  });

                  // Reset form
                  setSelectedCartItems([]);
                  setKeteranganAcara('');
                  setTargetKembaliInput('');
                  setSelectedWargaPeminjamForPinjam(null);
                  setNamaPeminjamLuar('');
                  setShowPinjamInventarisModal(false);
                  showToast('Transaksi peminjaman barang berhasil disimpan!');
                }}
                className="w-full py-4 rounded-2xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 transition active:scale-98"
              >
                Simpan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DROPDOWN: Pilih Barang untuk Keranjang */}
      {showSelectBarangModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1d22] border border-[#2b2c34] rounded-3xl p-5 text-white space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="font-bold text-sm">Pilih Barang Inventaris</h3>
              <button onClick={() => setShowSelectBarangModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inventarisItems.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-2xl bg-[#141518] border border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-white">{inv.nama}</p>
                    <p className="text-[10px] text-gray-400">Tersedia: {inv.diDalam} Unit • {inv.lokasi}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const exists = selectedCartItems.find(i => i.nama === inv.nama);
                      if (exists) {
                        setSelectedCartItems(selectedCartItems.map(i => i.nama === inv.nama ? { ...i, jumlah: i.jumlah + 1 } : i));
                      } else {
                        setSelectedCartItems([...selectedCartItems, { id: inv.id, nama: inv.nama, jumlah: 1 }]);
                      }
                      setShowSelectBarangModal(false);
                      showToast(`"${inv.nama}" ditambahkan ke keranjang!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#5c56f6] text-white font-bold text-xs hover:bg-[#4f46e5]"
                  >
                    + Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pilih Warga Peminjam */}
      {showSelectResidentForPinjamModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1d22] border border-[#2b2c34] rounded-3xl p-5 text-white space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="font-bold text-sm">Pilih Warga Peminjam</h3>
              <button onClick={() => setShowSelectResidentForPinjamModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(residents.length > 0 ? residents : INITIAL_RESIDENTS).map((res) => (
                <div
                  key={res.id}
                  onClick={() => {
                    setSelectedWargaPeminjamForPinjam(res);
                    setShowSelectResidentForPinjamModal(false);
                    showToast(`Peminjam: ${res.nama}`);
                  }}
                  className="p-3 rounded-2xl bg-[#141518] border border-gray-800 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition"
                >
                  <div>
                    <p className="font-bold text-xs text-white">{res.nama}</p>
                    <p className="text-[10px] text-gray-400">NIK: {res.nik} • {res.alamat}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">Pilih</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Buat Program Bantuan Baru */}
      {showBuatProgramModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1d22] border border-[#2b2c34] rounded-3xl p-6 text-white space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Buat Program Bantuan Baru</h3>
                  <p className="text-[11px] text-gray-400">Catat program bansos / bantuan warga RT</p>
                </div>
              </div>
              <button onClick={() => setShowBuatProgramModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBantuanProgram.nama.trim()) return;
                const newProg = {
                  id: 'bt_' + Date.now(),
                  nama: newBantuanProgram.nama.trim(),
                  kategori: newBantuanProgram.kategori,
                  tanggal: newBantuanProgram.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                  targetPenerima: Number(newBantuanProgram.targetPenerima) || 1,
                  anggaranPerPenerima: Number(newBantuanProgram.anggaranPerPenerima) || 0,
                  keterangan: newBantuanProgram.keterangan || 'Program bantuan sosial warga'
                };
                setBantuanPrograms([newProg, ...bantuanPrograms]);
                setNewBantuanProgram({
                  nama: '',
                  kategori: 'Duafa',
                  tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                  targetPenerima: 10,
                  anggaranPerPenerima: 150000,
                  keterangan: ''
                });
                setShowBuatProgramModal(false);
                showToast(`Program Bantuan "${newProg.nama}" berhasil dibuat!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-gray-400 text-[10px] mb-1 block">Nama Program Bantuan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bantuan Sembako Yatim & Dhuafa Bulanan"
                  value={newBantuanProgram.nama}
                  onChange={(e) => setNewBantuanProgram({ ...newBantuanProgram, nama: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[10px] mb-1 block">Kategori Program</label>
                <select
                  value={newBantuanProgram.kategori}
                  onChange={(e) => setNewBantuanProgram({ ...newBantuanProgram, kategori: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                >
                  {bantuanCategories.filter(c => c !== 'Semua').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Target Penerima (Orang/KK)</label>
                  <input
                    type="number"
                    min={1}
                    value={newBantuanProgram.targetPenerima}
                    onChange={(e) => setNewBantuanProgram({ ...newBantuanProgram, targetPenerima: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] mb-1 block">Nominal / Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={newBantuanProgram.anggaranPerPenerima}
                    onChange={(e) => setNewBantuanProgram({ ...newBantuanProgram, anggaranPerPenerima: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-[10px] mb-1 block">Keterangan / Deskripsi Program</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat mengenai sumber dana & paket bantuan..."
                  value={newBantuanProgram.keterangan}
                  onChange={(e) => setNewBantuanProgram({ ...newBantuanProgram, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBuatProgramModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5c56f6] hover:bg-[#4f46e5] text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simpan Program</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Kategori Bantuan Baru */}
      {showAddBantuanCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1c1d22] border border-[#2b2c34] rounded-3xl p-5 text-white space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="font-bold text-sm">Tambah Kategori Bantuan</h3>
              <button onClick={() => setShowAddBantuanCategoryModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBantuanCategoryName.trim()) return;
                const catName = newBantuanCategoryName.trim();
                if (!bantuanCategories.includes(catName)) {
                  setBantuanCategories([...bantuanCategories, catName]);
                  setActiveBantuanCategory(catName);
                  showToast(`Kategori "${catName}" ditambahkan!`);
                }
                setNewBantuanCategoryName('');
                setShowAddBantuanCategoryModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-gray-400 text-[10px] mb-1 block">Nama Kategori Baru</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Zakat / Sembako / Beasiswa"
                  value={newBantuanCategoryName}
                  onChange={(e) => setNewBantuanCategoryName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#141518] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddBantuanCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00917c] hover:bg-[#007a68] text-white font-bold text-xs transition"
                >
                  Tambah Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
