// Journey data only: nodes, edges, paths. No UI logic here.
// Coordinates are in SVG viewBox units (0 0 900 540), laid out like the reference picture.

export const NODE_W = 112
export const NODE_H = 58

export const GROUPS = {
  prelife: 'Pre-life',
  life: 'Life',
  barzakh: 'Barzakh',
  resurrection: 'Resurrection',
  land: 'Land of Resurrection',
  final: 'Final Destination',
}

export const MINOR_SIGNS_AZ = [
  { code: 'A', name: 'Diutus & Wafatnya Rasulullah ﷺ', dalil: 'HR. Bukhari 6504', arabic: 'بُعِثْتُ أَنَا وَالسَّاعَةُ كَهَاتَيْنِ', whatHappens: 'Tanda pertama dimulainya babak akhir zaman dengan diutusnya penutup para nabi.', prep: 'Berpegang teguh pada Al-Qur\'an dan Sunnah nabawiyyah.' },
  { code: 'B', name: 'Hilangnya Amanah & Kepemimpinan Rusak', dalil: 'HR. Bukhari 6496', arabic: 'إِذَا ضُيِّعَتِ الأَمَانَةُ فَانْتَظِرِ السَّاعَةَ', whatHappens: 'Urusan diserahkan kepada yang bukan ahlinya, merajalelanya ketidakadilan.', prep: 'Menjaga amanah dalam tugas pribadi & keluarga; menuntut ilmu syar\'i.' },
  { code: 'C', name: 'Perlombaan Membangun Gedung Tinggi', dalil: 'HR. Muslim 8', arabic: 'يَتَطَاوَلُونَ فِي الْبُنْيَانِ', whatHappens: 'Masyarakat miskin dan penggembala saling berbangga meninggikan bangunan megah.', prep: 'Zuhud dari kemewahan semu duniawi; infaq jariyah untuk bekal kekal.' },
  { code: 'D', name: 'Waktu Terasa Sangat Cepat & Singkat', dalil: 'HR. Tirmidzi 2332', arabic: 'يَتَقَارَبُ الزَّمَانُ فَتَكُونُ السَّنَةُ كَالشَّهْرِ', whatHappens: 'Hilangnya keberkahan waktu; hari berlalu tanpa disadari.', prep: 'Manajemen waktu ketat; menjaga shalat fardhu awal waktu sebagai penjangkar hidup.' },
  { code: 'E', name: 'Maraknya Pembunuhan Tanpa Alasan (Al-Harj)', dalil: 'HR. Muslim 157', arabic: 'لاَ يَدْرِي الْقَاتِلُ فِيمَ قَتَلَ', whatHappens: 'Kekacauan sosial parah dan darah manusia menjadi murah.', prep: 'Menahan lisan dan tangan; menjauhi fitnah dan lingkaran kebencian.' },
  { code: 'F', name: 'Tanah Arab Menghijau & Dialiri Sungai', dalil: 'HR. Muslim 157', arabic: 'تَعُودَ أَرْضُ الْعَرَبِ مُرُوجًا وَأَنْهَارًا', whatHappens: 'Gurun tandus jazirah Arab kembali bervegetasi subur dan dialiri sungai.', prep: 'Memperbaharui taubat nashuha dan memperbanyak amal saleh.' }
]

export const NODES = [
  {
    id: 'dharr',
    label: 'World of Al-Dharr',
    group: 'prelife',
    x: 16,
    y: 56,
    arabic: 'وَإِذْ أَخَذَ رَبُّكَ مِن بَنِي آدَمَ مِن ظُهُورِهِمْ ذُرِّيَّتَهُمْ وَأَشْهَدَهُمْ عَلَىٰ أَنفُسِهِمْ أَلَسْتُ بِرَبِّكُمْ ۖ قَالُوا بَلَىٰ',
    dalil: 'QS. Al-A\'raf: 172',
    whatHappens: 'Seluruh jiwa anak keturunan Adam dikumpulkan dalam bentuk dzarrah (partikel halus) dan bersaksi mengakui Allah sebagai satu-satunya Rabb.',
    preparationGuide: 'Menjaga perjanjian fitrah tauhid, menjauhi syirik sekecil apa pun dalam kehidupan dunia.'
  },
  {
    id: 'womb',
    label: 'Womb of the Mother',
    group: 'prelife',
    x: 150,
    y: 56,
    arabic: 'ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ',
    dalil: 'HR. Al-Bukhari No. 3208 & Muslim No. 2643',
    whatHappens: 'Malaikat meniupkan ruh pada usia 120 hari kandungan dan mencatat empat ketetapan: rezeki, ajal, amal, dan nasib celaka atau bahagia.',
    preparationGuide: 'Husnuzhan kepada takdir Allah, senantiasa berikhtiar sungguh-sungguh meraih husnul khatimah.'
  },
  {
    id: 'dunya',
    label: 'Dunya (Tanda Kiamat)',
    group: 'life',
    x: 284,
    y: 56,
    here: true,
    arabic: 'وَمَا هَٰذِهِ الْحَيَاةُ الدُّنْيَا إِلَّا لَهْوٌ وَلَعِبٌ ۚ وَإِنَّ الدَّارَ الْآخِرَةَ لَهِيَ الْحَيَوَانُ',
    dalil: 'QS. Al-Ankabut: 64 & Sabda Tanda Kiamat',
    whatHappens: 'Tempat menanam bekal dan ujian. Di akhir zaman muncul tanda-tanda Kiamat Shughra (katalog A-Z) dan 10 Tanda Kiamat Kubra.',
    preparationGuide: 'Melaksanakan 5 waktu shalat fardhu secara istiqamah, beramal saleh, dan membentengi diri dari fitnah akhir zaman.',
    hasMinorSigns: true
  },
  {
    id: 'grave',
    label: 'Grave (Al-Barzakh)',
    group: 'barzakh',
    x: 418,
    y: 56,
    arabic: 'يُثَبِّتُ اللَّهُ الَّذِينَ آمَنُوا بِالْقَوْلِ الثَّابِتِ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ',
    dalil: 'QS. Ibrahim: 27 & HR. Tirmidzi 1071',
    whatHappens: 'Pertanyaan Malaikat Munkar dan Nakir (Man Rabbuka, Ma Dinuka, Man Nabiyyuka). Kubur menjadi taman surga atau jurang neraka.',
    preparationGuide: 'Rutin membaca Surah Al-Mulk setiap malam (penyelamat dari azab kubur), menjaga kesucian dari najis kencing, dan shalat malam.'
  },
  {
    id: 'horn',
    label: 'Blowing the Horn',
    group: 'resurrection',
    x: 552,
    y: 56,
    arabic: 'وَنُفِخَ فِي الصُّورِ فَصَعِقَ مَن فِي السَّمَاوَاتِ وَمَن فِي الْأَرْضِ إِلَّا مَن شَاءَ اللَّهُ',
    dalil: 'QS. Az-Zumar: 68',
    whatHappens: 'Malaikat Israfil meniup sangkakala pertama: seluruh makhluk binasa. Tiupan kedua: seluruh jiwa dibangkitkan dari kuburnya.',
    preparationGuide: 'Menyiapkan kalimat tauhid Laa ilaaha illallaah saat sakaratul maut agar dibangkitkan dalam keadaan diridhai.'
  },
  {
    id: 'resurrection',
    label: 'Padang Mahsyar',
    group: 'resurrection',
    x: 686,
    y: 56,
    arabic: 'سَبْعَةٌ يُظِلُّهُمُ اللَّهُ فِي ظِلِّهِ يَوْمَ لاَ ظِلَّ إِلاَّ ظِلُّهُ',
    dalil: 'HR. Bukhari No. 660 & Muslim No. 1031',
    whatHappens: 'Manusia dikumpulkan tanpa alas kaki dan tanpa busana di bawah matahari terik berjarak 1 mil. Menunggu pengadilan Ilahi.',
    preparationGuide: 'Mengejar karakter 7 golongan yang dinaungi Arsy: shalat berjamaah, sedekah tersembunyi, menolak maksiat karena takut Allah.'
  },
  {
    id: 'intercession',
    label: 'Syafa\'at Rasulullah ﷺ',
    group: 'land',
    x: 686,
    y: 200,
    arabic: 'فَأَسْجُدُ تَحْتَ الْعَرْشِ فَيَفْتَحُ اللَّهُ عَلَيَّ مِنْ مَحَامِدِهِ ... فَيُقَالُ يَا مُحَمَّدُ ارْفَعْ رَأْسَكَ',
    dalil: 'HR. Al-Bukhari No. 4712 & Muslim No. 194',
    whatHappens: 'Rasulullah ﷺ bersujud di bawah Arsy memohon dimulainya hisab (Syafa\'at \'Uzhma) ketika nabi-nabi lain menyatakan ketidaksanggupan.',
    preparationGuide: 'Memperbanyak shalawat kepada Nabi ﷺ setiap hari (minimal 100x), membaca doa setelah azan, dan mengamalkan sunnah beliau.'
  },
  {
    id: 'judgement',
    label: 'Al-Hisab (Perhitungan)',
    group: 'land',
    x: 552,
    y: 200,
    arabic: 'فَسَوْفَ يُحَاسَبُ حِسَابًا يَسِيرًا • وَيَنقَلِبُ إِلَىٰ أَهْلِهِ مَسْرُورًا',
    dalil: 'QS. Al-Insyiqaq: 8-9',
    whatHappens: 'Pemeriksaan amal perbuatan. Orang beriman dihisab secara tertutup (hisab yang mudah), sedangkan orang munafik dan kafir didebat hisabnya.',
    preparationGuide: 'Muhasabah diri setiap malam, memaafkan kesalahan orang lain di dunia, dan menutupi aib sesama muslim.'
  },
  {
    id: 'books',
    label: 'Pembagian Kitab Amal',
    group: 'land',
    x: 418,
    y: 200,
    arabic: 'وَوُضِعَ الْكِتَابُ فَتَرَى الْمُجْرِمِينَ مُشْفِقِينَ مِمَّا فِيهِ',
    dalil: 'QS. Al-Kahfi: 49 & Al-Haqqah: 19',
    whatHappens: 'Catatan amal beterbangan. Golongan kanan menerima dari tangan kanan, sedangkan golongan celaka menerima dari sebelah kiri atau balik punggung.',
    preparationGuide: 'Memperbanyak istighfar (siapa yang gembira melihat catatan amalnya kelak, perbanyaklah istighfar - HR. Baihaqi).'
  },
  {
    id: 'scale',
    label: 'Al-Mizan (Timbangan)',
    group: 'land',
    x: 284,
    y: 200,
    arabic: 'كَلِمَتَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ ... ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    dalil: 'HR. Bukhari No. 6682 & QS. Al-Anbiya: 47',
    whatHappens: 'Amal kebaikan dan keburukan ditaruh di atas timbangan hakiki berskala raksasa.',
    preparationGuide: 'Membiasakan zikir pemberat mizan: "Subhanallah wa bihamdihi Subhanallahil \'Azhim" dan menjaga akhlak terpuji (Husnul Khuluq).'
  },
  {
    id: 'fountain',
    label: 'Telaga Al-Haudh (Al-Kautsar)',
    group: 'land',
    x: 150,
    y: 200,
    arabic: 'حَوْضِي مَسِيرَةُ شَهْرٍ، مَاؤُهُ أَبْيَضُ مِنَ اللَّبَنِ ... مَنْ شَرِبَ مِنْهَا فَلاَ يَظْمَأُ أَبَدًا',
    dalil: 'HR. Al-Bukhari No. 6579 & Muslim No. 2292',
    whatHappens: 'Air telaga dari surga yang diminumkan langsung oleh Rasulullah ﷺ, memadamkan dahaga selamanya.',
    preparationGuide: 'Konsisten di atas jalan Sunnah murni tanpa mengada-adakan ajaran palsu (bid\'ah), serta memberi minum orang dahaga di dunia.'
  },
  {
    id: 'test',
    label: 'Ujian Cahaya & Kegelapan',
    group: 'land',
    x: 16,
    y: 200,
    arabic: 'يَوْمَ يَقُولُ الْمُنَافِقُونَ وَالْمُنَافِقَاتُ لِلَّذِينَ آمَنُوا انظُرُونَا نَقْتَبِسْ مِن نُّورِكُمْ',
    dalil: 'QS. Al-Hadid: 12-13',
    whatHappens: 'Kegelapan pekat menyelimuti. Orang beriman diberi cahaya penuntun sesuai kadar amal, sedangkan orang munafik kehabisan cahaya dan jatuh ke neraka.',
    preparationGuide: 'Menjaga shalat fardhu Subuh & Isya berjamaah ("cahaya sempurna di hari kiamat"), membaca Surah Al-Kahfi setiap hari Jumat.'
  },
  {
    id: 'hell',
    label: 'NERAKA JAHANNAM',
    group: 'final',
    x: 284,
    y: 340,
    w: 112,
    h: 150,
    kind: 'hell',
    arabic: 'كَلَّا ۖ إِنَّهَا لَظَىٰ • نَزَّاعَةً لِّلشَّوَىٰ',
    dalil: 'QS. Al-Ma\'arij: 15-16',
    whatHappens: 'Tempat siksa abadi bagi orang kafir dan tempat pembersihan sementara bagi orang beriman yang berbuat dosa besar.',
    preparationGuide: 'Berdzikir memohon perlindungan dari api neraka 7x bakda Subuh & Maghrib: "Allahumma ajirna minan naar".'
  },
  {
    id: 'sirat',
    label: 'Ash-Shirath',
    group: 'final',
    x: 284,
    y: 400,
    w: 112,
    h: 36,
    kind: 'sirat',
    arabic: 'فَيَمُرُّ أَوَّلُكُمْ كَالْبَرْقِ ... ثُمَّ كَمَرِّ الرِّيحِ ... وَبِجَنْبَتَيْ الصِّرَاطِ كَلاَلِيبُ مُعَلَّقَةٌ',
    dalil: 'HR. Muslim No. 195',
    whatHappens: 'Jembatan setajam pedang dan sehalus rambut di atas kawah Neraka Jahannam. Kecepatan melintas ditentukan oleh amal saleh.',
    preparationGuide: 'Meringankan beban orang miskin di dunia, memaafkan orang yang berbuat salah, dan menjauhi ghibah.'
  },
  {
    id: 'arch',
    label: 'Al-Qantharah',
    group: 'final',
    x: 470,
    y: 386,
    w: 90,
    h: 58,
    arabic: 'يَخْلُصُ الْمُؤْمِنُونَ مِنَ النَّارِ فَيُحْبَسُونَ عَلَى قَنْطَرَةٍ بَيْنَ الْجَنَّةِ وَالنَّارِ فَيُقْتَصُّ لِبَعْضِهِمْ',
    dalil: 'HR. Al-Bukhari No. 6535',
    whatHappens: 'Jembatan pembersihan hati antara surga dan neraka, tempat menyelesaikan kezaliman antarsesama mukmin hingga hati suci bersih.',
    preparationGuide: 'Menyelesaikan sengketa dan melunasi hutang sebelum wafat, membuang dendam dan hasad kepada saudara seiman.'
  },
  {
    id: 'heaven',
    label: 'SURGA JANNATUN NA\'IM',
    group: 'final',
    x: 640,
    y: 340,
    w: 200,
    h: 150,
    kind: 'heaven',
    arabic: 'ادْخُلُوهَا بِسَلَامٍ آمِنِينَ • وَنَزَعْنَا مَا فِي صُدُورِهِم مِّنْ غِلٍّ إِخْوَانًا عَلَىٰ سُرُرٍ مُّتَقَابِلِينَ',
    dalil: 'QS. Al-Hijr: 46-47 & Yunus: 26',
    whatHappens: 'Puncak kenikmatan abadi tanpa akhir, disambut salam oleh malaikat dan memandang Wajah Allah Yang Maha Mulia.',
    preparationGuide: 'Memohon Surga Firdaus: "Allahumma inni as\'alukal jannata wa a\'udzu bika minan naar".'
  }
]

// type: neutral | believer | disbeliever | hypocrite
// pts: waypoints in viewBox coordinates (first = start, last = arrow tip)
export const EDGES = [
  { id: 'e1', from: 'dharr', to: 'womb', type: 'neutral', pts: [[128, 85], [148, 85]] },
  { id: 'e2', from: 'womb', to: 'dunya', type: 'neutral', pts: [[262, 85], [282, 85]] },

  { id: 'e3b', from: 'dunya', to: 'grave', type: 'believer', pts: [[398, 76], [416, 76]], label: 'Believers', lx: 407, ly: 44 },
  { id: 'e3d', from: 'dunya', to: 'grave', type: 'disbeliever', pts: [[398, 98], [416, 98]] },
  { id: 'e4b', from: 'grave', to: 'horn', type: 'believer', pts: [[532, 76], [550, 76]], label: 'Believers', lx: 541, ly: 44 },
  { id: 'e4d', from: 'grave', to: 'horn', type: 'disbeliever', pts: [[532, 98], [550, 98]] },
  { id: 'e5b', from: 'horn', to: 'resurrection', type: 'believer', pts: [[666, 76], [684, 76]], label: 'Believers', lx: 675, ly: 44 },
  { id: 'e5d', from: 'horn', to: 'resurrection', type: 'disbeliever', pts: [[666, 98], [684, 98]] },

  { id: 'e6b', from: 'resurrection', to: 'intercession', type: 'believer', pts: [[800, 74], [850, 74], [850, 212], [800, 212]] },
  { id: 'e6d', from: 'resurrection', to: 'intercession', type: 'disbeliever', pts: [[800, 96], [872, 96], [872, 238], [800, 238]] },

  { id: 'e7b', from: 'intercession', to: 'judgement', type: 'believer', pts: [[684, 218], [666, 218]], label: 'Believers', lx: 675, ly: 190 },
  { id: 'e7d', from: 'intercession', to: 'judgement', type: 'disbeliever', pts: [[684, 240], [666, 240]] },
  { id: 'e8b', from: 'judgement', to: 'books', type: 'believer', pts: [[550, 218], [532, 218]], label: 'Believers', lx: 541, ly: 190 },
  { id: 'e8d', from: 'judgement', to: 'books', type: 'disbeliever', pts: [[550, 240], [532, 240]] },
  { id: 'e9b', from: 'books', to: 'scale', type: 'believer', pts: [[416, 218], [398, 218]], label: 'Believers', lx: 407, ly: 190 },
  { id: 'e9d', from: 'books', to: 'scale', type: 'disbeliever', pts: [[416, 240], [398, 240]] },
  { id: 'e10b', from: 'scale', to: 'fountain', type: 'believer', pts: [[282, 218], [264, 218]], label: 'Believers', lx: 273, ly: 190 },

  { id: 'e10d', from: 'scale', to: 'hell', type: 'disbeliever', pts: [[340, 264], [340, 338]] },
  { id: 'e11h', from: 'scale', to: 'hell', type: 'hypocrite', pts: [[308, 264], [308, 300], [160, 300], [160, 264]], label: 'Hypocrites', lx: 234, ly: 316 },
  { id: 'e11b', from: 'fountain', to: 'test', type: 'believer', pts: [[148, 218], [130, 218]], label: 'Believers', lx: 139, ly: 190 },

  { id: 'e12h', from: 'test', to: 'hell', type: 'hypocrite', pts: [[40, 264], [40, 366], [282, 366]], label: 'Hypocrites', lx: 150, ly: 382 },
  { id: 'e12b', from: 'test', to: 'sirat', type: 'believer', pts: [[16, 250], [8, 250], [8, 418], [282, 418]], label: 'Believers', lx: 90, ly: 436 },

  { id: 'e13', from: 'sirat', to: 'arch', type: 'believer', pts: [[396, 418], [468, 418]] },
  { id: 'e14', from: 'arch', to: 'heaven', type: 'believer', pts: [[560, 418], [638, 418]] },
]

// Ordered stage lists for the timeline scrub, per path.
export const PATHS = {
  all: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'fountain', 'test', 'sirat', 'arch', 'heaven', 'hell'],
  believer: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'fountain', 'test', 'sirat', 'arch', 'heaven'],
  disbeliever: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'hell'],
  hypocrite: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'fountain', 'test', 'hell'],
}

export const PATH_META = {
  all: { label: 'All Roles', color: '#38bdf8' },
  believer: { label: 'Believers', color: '#34d399' },
  disbeliever: { label: 'Disbelievers', color: '#f87171' },
  hypocrite: { label: 'Hypocrites', color: '#fbbf24' },
}

export const nodeById = (id) => NODES.find((n) => n.id === id)
