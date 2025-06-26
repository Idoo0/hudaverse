// File untuk mengelola data Al-Quran dari JSON files
class QuranDataManager {
    constructor() {
        this.surahList = [];
        this.surahData = {};
        this.isLoaded = false;
        this.loadingSurah = new Set();
    }

    // Daftar lengkap 114 surah
    async loadSurahList() {
        // Data dasar 114 surah
        this.surahList = [
            {"nomor":1,"nama":"الفاتحة","nama_latin":"Al-Fātiḥah","jumlah_ayat":7,"tempat_turun":"mekah","arti":"Pembukaan"},
            {"nomor":2,"nama":"البقرة","nama_latin":"Al-Baqarah","jumlah_ayat":286,"tempat_turun":"madinah","arti":"Sapi Betina"},
            {"nomor":3,"nama":"آل عمران","nama_latin":"Āli 'Imrān","jumlah_ayat":200,"tempat_turun":"madinah","arti":"Keluarga Imran"},
            {"nomor":4,"nama":"النساء","nama_latin":"An-Nisā'","jumlah_ayat":176,"tempat_turun":"madinah","arti":"Wanita"},
            {"nomor":5,"nama":"المائدة","nama_latin":"Al-Mā'idah","jumlah_ayat":120,"tempat_turun":"madinah","arti":"Hidangan"},
            {"nomor":6,"nama":"الأنعام","nama_latin":"Al-An'ām","jumlah_ayat":165,"tempat_turun":"mekah","arti":"Binatang Ternak"},
            {"nomor":7,"nama":"الأعراف","nama_latin":"Al-A'rāf","jumlah_ayat":206,"tempat_turun":"mekah","arti":"Tempat Tertinggi"},
            {"nomor":8,"nama":"الأنفال","nama_latin":"Al-Anfāl","jumlah_ayat":75,"tempat_turun":"madinah","arti":"Rampasan Perang"},
            {"nomor":9,"nama":"التوبة","nama_latin":"At-Taubah","jumlah_ayat":129,"tempat_turun":"madinah","arti":"Pengampunan"},
            {"nomor":10,"nama":"يونس","nama_latin":"Yūnus","jumlah_ayat":109,"tempat_turun":"mekah","arti":"Yunus"},
            {"nomor":11,"nama":"هود","nama_latin":"Hūd","jumlah_ayat":123,"tempat_turun":"mekah","arti":"Hud"},
            {"nomor":12,"nama":"يوسف","nama_latin":"Yūsuf","jumlah_ayat":111,"tempat_turun":"mekah","arti":"Yusuf"},
            {"nomor":13,"nama":"الرعد","nama_latin":"Ar-Ra'd","jumlah_ayat":43,"tempat_turun":"madinah","arti":"Guruh"},
            {"nomor":14,"nama":"إبراهيم","nama_latin":"Ibrāhīm","jumlah_ayat":52,"tempat_turun":"mekah","arti":"Ibrahim"},
            {"nomor":15,"nama":"الحجر","nama_latin":"Al-Ḥijr","jumlah_ayat":99,"tempat_turun":"mekah","arti":"Hijr"},
            {"nomor":16,"nama":"النحل","nama_latin":"An-Naḥl","jumlah_ayat":128,"tempat_turun":"mekah","arti":"Lebah"},
            {"nomor":17,"nama":"الإسراء","nama_latin":"Al-Isrā'","jumlah_ayat":111,"tempat_turun":"mekah","arti":"Perjalanan Malam"},
            {"nomor":18,"nama":"الكهف","nama_latin":"Al-Kahf","jumlah_ayat":110,"tempat_turun":"mekah","arti":"Gua"},
            {"nomor":19,"nama":"مريم","nama_latin":"Maryam","jumlah_ayat":98,"tempat_turun":"mekah","arti":"Maryam"},
            {"nomor":20,"nama":"طه","nama_latin":"Ṭāhā","jumlah_ayat":135,"tempat_turun":"mekah","arti":"Taha"},
            {"nomor":21,"nama":"الأنبياء","nama_latin":"Al-Anbiyā'","jumlah_ayat":112,"tempat_turun":"mekah","arti":"Para Nabi"},
            {"nomor":22,"nama":"الحج","nama_latin":"Al-Ḥajj","jumlah_ayat":78,"tempat_turun":"madinah","arti":"Haji"},
            {"nomor":23,"nama":"المؤمنون","nama_latin":"Al-Mu'minūn","jumlah_ayat":118,"tempat_turun":"mekah","arti":"Orang-orang Mukmin"},
            {"nomor":24,"nama":"النور","nama_latin":"An-Nūr","jumlah_ayat":64,"tempat_turun":"madinah","arti":"Cahaya"},
            {"nomor":25,"nama":"الفرقان","nama_latin":"Al-Furqān","jumlah_ayat":77,"tempat_turun":"mekah","arti":"Pembeda"},
            {"nomor":26,"nama":"الشعراء","nama_latin":"Ash-Shu'arā'","jumlah_ayat":227,"tempat_turun":"mekah","arti":"Para Penyair"},
            {"nomor":27,"nama":"النمل","nama_latin":"An-Naml","jumlah_ayat":93,"tempat_turun":"mekah","arti":"Semut"},
            {"nomor":28,"nama":"القصص","nama_latin":"Al-Qaṣaṣ","jumlah_ayat":88,"tempat_turun":"mekah","arti":"Kisah-kisah"},
            {"nomor":29,"nama":"العنكبوت","nama_latin":"Al-'Ankabūt","jumlah_ayat":69,"tempat_turun":"mekah","arti":"Laba-laba"},
            {"nomor":30,"nama":"الروم","nama_latin":"Ar-Rūm","jumlah_ayat":60,"tempat_turun":"mekah","arti":"Bangsa Romawi"},
            {"nomor":31,"nama":"لقمان","nama_latin":"Luqmān","jumlah_ayat":34,"tempat_turun":"mekah","arti":"Luqman"},
            {"nomor":32,"nama":"السجدة","nama_latin":"As-Sajdah","jumlah_ayat":30,"tempat_turun":"mekah","arti":"Sajdah"},
            {"nomor":33,"nama":"الأحزاب","nama_latin":"Al-Aḥzāb","jumlah_ayat":73,"tempat_turun":"madinah","arti":"Golongan yang Bersekutu"},
            {"nomor":34,"nama":"سبأ","nama_latin":"Saba'","jumlah_ayat":54,"tempat_turun":"mekah","arti":"Saba'"},
            {"nomor":35,"nama":"فاطر","nama_latin":"Fāṭir","jumlah_ayat":45,"tempat_turun":"mekah","arti":"Pencipta"},
            {"nomor":36,"nama":"يس","nama_latin":"Yāsīn","jumlah_ayat":83,"tempat_turun":"mekah","arti":"Yasin"},
            {"nomor":37,"nama":"الصافات","nama_latin":"Aṣ-Ṣāffāt","jumlah_ayat":182,"tempat_turun":"mekah","arti":"Barisan-barisan"},
            {"nomor":38,"nama":"ص","nama_latin":"Ṣād","jumlah_ayat":88,"tempat_turun":"mekah","arti":"Sad"},
            {"nomor":39,"nama":"الزمر","nama_latin":"Az-Zumar","jumlah_ayat":75,"tempat_turun":"mekah","arti":"Rombongan"},
            {"nomor":40,"nama":"غافر","nama_latin":"Ghāfir","jumlah_ayat":85,"tempat_turun":"mekah","arti":"Yang Mengampuni"},
            {"nomor":41,"nama":"فصلت","nama_latin":"Fuṣṣilat","jumlah_ayat":54,"tempat_turun":"mekah","arti":"Yang Dijelaskan"},
            {"nomor":42,"nama":"الشورى","nama_latin":"Ash-Shūrā","jumlah_ayat":53,"tempat_turun":"mekah","arti":"Musyawarah"},
            {"nomor":43,"nama":"الزخرف","nama_latin":"Az-Zukhruf","jumlah_ayat":89,"tempat_turun":"mekah","arti":"Perhiasan"},
            {"nomor":44,"nama":"الدخان","nama_latin":"Ad-Dukhān","jumlah_ayat":59,"tempat_turun":"mekah","arti":"Kabut"},
            {"nomor":45,"nama":"الجاثية","nama_latin":"Al-Jāthiyah","jumlah_ayat":37,"tempat_turun":"mekah","arti":"Yang Bertekuk Lutut"},
            {"nomor":46,"nama":"الأحقاف","nama_latin":"Al-Aḥqāf","jumlah_ayat":35,"tempat_turun":"mekah","arti":"Bukit-bukit Pasir"},
            {"nomor":47,"nama":"محمد","nama_latin":"Muḥammad","jumlah_ayat":38,"tempat_turun":"madinah","arti":"Muhammad"},
            {"nomor":48,"nama":"الفتح","nama_latin":"Al-Fatḥ","jumlah_ayat":29,"tempat_turun":"madinah","arti":"Kemenangan"},
            {"nomor":49,"nama":"الحجرات","nama_latin":"Al-Ḥujurāt","jumlah_ayat":18,"tempat_turun":"madinah","arti":"Kamar-kamar"},
            {"nomor":50,"nama":"ق","nama_latin":"Qāf","jumlah_ayat":45,"tempat_turun":"mekah","arti":"Qaf"},
            {"nomor":51,"nama":"الذاريات","nama_latin":"Adh-Dhāriyāt","jumlah_ayat":60,"tempat_turun":"mekah","arti":"Angin yang Menerbangkan"},
            {"nomor":52,"nama":"الطور","nama_latin":"Aṭ-Ṭūr","jumlah_ayat":49,"tempat_turun":"mekah","arti":"Bukit Tursina"},
            {"nomor":53,"nama":"النجم","nama_latin":"An-Najm","jumlah_ayat":62,"tempat_turun":"mekah","arti":"Bintang"},
            {"nomor":54,"nama":"القمر","nama_latin":"Al-Qamar","jumlah_ayat":55,"tempat_turun":"mekah","arti":"Bulan"},
            {"nomor":55,"nama":"الرحمن","nama_latin":"Ar-Raḥmān","jumlah_ayat":78,"tempat_turun":"madinah","arti":"Yang Maha Pemurah"},
            {"nomor":56,"nama":"الواقعة","nama_latin":"Al-Wāqi'ah","jumlah_ayat":96,"tempat_turun":"mekah","arti":"Hari Kiamat"},
            {"nomor":57,"nama":"الحديد","nama_latin":"Al-Ḥadīd","jumlah_ayat":29,"tempat_turun":"madinah","arti":"Besi"},
            {"nomor":58,"nama":"المجادلة","nama_latin":"Al-Mujādilah","jumlah_ayat":22,"tempat_turun":"madinah","arti":"Gugatan"},
            {"nomor":59,"nama":"الحشر","nama_latin":"Al-Ḥashr","jumlah_ayat":24,"tempat_turun":"madinah","arti":"Pengusiran"},
            {"nomor":60,"nama":"الممتحنة","nama_latin":"Al-Mumtaḥanah","jumlah_ayat":13,"tempat_turun":"madinah","arti":"Wanita yang Diuji"},
            {"nomor":61,"nama":"الصف","nama_latin":"Aṣ-Ṣaff","jumlah_ayat":14,"tempat_turun":"madinah","arti":"Barisan"},
            {"nomor":62,"nama":"الجمعة","nama_latin":"Al-Jumu'ah","jumlah_ayat":11,"tempat_turun":"madinah","arti":"Hari Jumat"},
            {"nomor":63,"nama":"المنافقون","nama_latin":"Al-Munāfiqūn","jumlah_ayat":11,"tempat_turun":"madinah","arti":"Orang-orang Munafik"},
            {"nomor":64,"nama":"التغابن","nama_latin":"At-Taghābun","jumlah_ayat":18,"tempat_turun":"madinah","arti":"Pengungkapan Kesalahan"},
            {"nomor":65,"nama":"الطلاق","nama_latin":"Aṭ-Ṭalāq","jumlah_ayat":12,"tempat_turun":"madinah","arti":"Talak"},
            {"nomor":66,"nama":"التحريم","nama_latin":"At-Taḥrīm","jumlah_ayat":12,"tempat_turun":"madinah","arti":"Pengharaman"},
            {"nomor":67,"nama":"الملك","nama_latin":"Al-Mulk","jumlah_ayat":30,"tempat_turun":"mekah","arti":"Kerajaan"},
            {"nomor":68,"nama":"القلم","nama_latin":"Al-Qalam","jumlah_ayat":52,"tempat_turun":"mekah","arti":"Pena"},
            {"nomor":69,"nama":"الحاقة","nama_latin":"Al-Ḥāqqah","jumlah_ayat":52,"tempat_turun":"mekah","arti":"Hari Kiamat"},
            {"nomor":70,"nama":"المعارج","nama_latin":"Al-Ma'ārij","jumlah_ayat":44,"tempat_turun":"mekah","arti":"Tempat Naik"},
            {"nomor":71,"nama":"نوح","nama_latin":"Nūḥ","jumlah_ayat":28,"tempat_turun":"mekah","arti":"Nuh"},
            {"nomor":72,"nama":"الجن","nama_latin":"Al-Jinn","jumlah_ayat":28,"tempat_turun":"mekah","arti":"Jin"},
            {"nomor":73,"nama":"المزمل","nama_latin":"Al-Muzzammil","jumlah_ayat":20,"tempat_turun":"mekah","arti":"Orang yang Berselimut"},
            {"nomor":74,"nama":"المدثر","nama_latin":"Al-Muddaththir","jumlah_ayat":56,"tempat_turun":"mekah","arti":"Orang yang Berkemul"},
            {"nomor":75,"nama":"القيامة","nama_latin":"Al-Qiyāmah","jumlah_ayat":40,"tempat_turun":"mekah","arti":"Kiamat"},
            {"nomor":76,"nama":"الإنسان","nama_latin":"Al-Insān","jumlah_ayat":31,"tempat_turun":"madinah","arti":"Manusia"},
            {"nomor":77,"nama":"المرسلات","nama_latin":"Al-Mursalāt","jumlah_ayat":50,"tempat_turun":"mekah","arti":"Malaikat yang Diutus"},
            {"nomor":78,"nama":"النبأ","nama_latin":"An-Naba'","jumlah_ayat":40,"tempat_turun":"mekah","arti":"Berita Besar"},
            {"nomor":79,"nama":"النازعات","nama_latin":"An-Nāzi'āt","jumlah_ayat":46,"tempat_turun":"mekah","arti":"Malaikat yang Mencabut"},
            {"nomor":80,"nama":"عبس","nama_latin":"'Abasa","jumlah_ayat":42,"tempat_turun":"mekah","arti":"Dia Bermuka Masam"},
            {"nomor":81,"nama":"التكوير","nama_latin":"At-Takwīr","jumlah_ayat":29,"tempat_turun":"mekah","arti":"Menggulung"},
            {"nomor":82,"nama":"الإنفطار","nama_latin":"Al-Infiṭār","jumlah_ayat":19,"tempat_turun":"mekah","arti":"Terbelah"},
            {"nomor":83,"nama":"المطففين","nama_latin":"Al-Muṭaffifīn","jumlah_ayat":36,"tempat_turun":"mekah","arti":"Orang yang Curang"},
            {"nomor":84,"nama":"الإنشقاق","nama_latin":"Al-Inshiqāq","jumlah_ayat":25,"tempat_turun":"mekah","arti":"Terbelah"},
            {"nomor":85,"nama":"البروج","nama_latin":"Al-Burūj","jumlah_ayat":22,"tempat_turun":"mekah","arti":"Gugusan Bintang"},
            {"nomor":86,"nama":"الطارق","nama_latin":"Aṭ-Ṭāriq","jumlah_ayat":17,"tempat_turun":"mekah","arti":"Yang Datang di Malam Hari"},
            {"nomor":87,"nama":"الأعلى","nama_latin":"Al-A'lā","jumlah_ayat":19,"tempat_turun":"mekah","arti":"Yang Paling Tinggi"},
            {"nomor":88,"nama":"الغاشية","nama_latin":"Al-Ghāshiyah","jumlah_ayat":26,"tempat_turun":"mekah","arti":"Hari Pembalasan"},
            {"nomor":89,"nama":"الفجر","nama_latin":"Al-Fajr","jumlah_ayat":30,"tempat_turun":"mekah","arti":"Fajar"},
            {"nomor":90,"nama":"البلد","nama_latin":"Al-Balad","jumlah_ayat":20,"tempat_turun":"mekah","arti":"Negeri"},
            {"nomor":91,"nama":"الشمس","nama_latin":"Ash-Shams","jumlah_ayat":15,"tempat_turun":"mekah","arti":"Matahari"},
            {"nomor":92,"nama":"الليل","nama_latin":"Al-Layl","jumlah_ayat":21,"tempat_turun":"mekah","arti":"Malam"},
            {"nomor":93,"nama":"الضحى","nama_latin":"Aḍ-Ḍuḥā","jumlah_ayat":11,"tempat_turun":"mekah","arti":"Waktu Duha"},
            {"nomor":94,"nama":"الشرح","nama_latin":"Ash-Sharḥ","jumlah_ayat":8,"tempat_turun":"mekah","arti":"Kelapangan"},
            {"nomor":95,"nama":"التين","nama_latin":"At-Tīn","jumlah_ayat":8,"tempat_turun":"mekah","arti":"Buah Tin"},
            {"nomor":96,"nama":"العلق","nama_latin":"Al-'Alaq","jumlah_ayat":19,"tempat_turun":"mekah","arti":"Segumpal Darah"},
            {"nomor":97,"nama":"القدر","nama_latin":"Al-Qadr","jumlah_ayat":5,"tempat_turun":"mekah","arti":"Kemuliaan"},
            {"nomor":98,"nama":"البينة","nama_latin":"Al-Bayyinah","jumlah_ayat":8,"tempat_turun":"madinah","arti":"Bukti Nyata"},
            {"nomor":99,"nama":"الزلزلة","nama_latin":"Az-Zalzalah","jumlah_ayat":8,"tempat_turun":"madinah","arti":"Guncangan"},
            {"nomor":100,"nama":"العاديات","nama_latin":"Al-'Ādiyāt","jumlah_ayat":11,"tempat_turun":"mekah","arti":"Kuda Perang"},
            {"nomor":101,"nama":"القارعة","nama_latin":"Al-Qāri'ah","jumlah_ayat":11,"tempat_turun":"mekah","arti":"Hari Kiamat"},
            {"nomor":102,"nama":"التكاثر","nama_latin":"At-Takāthur","jumlah_ayat":8,"tempat_turun":"mekah","arti":"Bermegah-megahan"},
            {"nomor":103,"nama":"العصر","nama_latin":"Al-'Aṣr","jumlah_ayat":3,"tempat_turun":"mekah","arti":"Masa"},
            {"nomor":104,"nama":"الهمزة","nama_latin":"Al-Humazah","jumlah_ayat":9,"tempat_turun":"mekah","arti":"Pengumpat"},
            {"nomor":105,"nama":"الفيل","nama_latin":"Al-Fīl","jumlah_ayat":5,"tempat_turun":"mekah","arti":"Gajah"},
            {"nomor":106,"nama":"قريش","nama_latin":"Quraysh","jumlah_ayat":4,"tempat_turun":"mekah","arti":"Suku Quraisy"},
            {"nomor":107,"nama":"الماعون","nama_latin":"Al-Mā'ūn","jumlah_ayat":7,"tempat_turun":"mekah","arti":"Barang Berguna"},
            {"nomor":108,"nama":"الكوثر","nama_latin":"Al-Kawthar","jumlah_ayat":3,"tempat_turun":"mekah","arti":"Nikmat yang Banyak"},
            {"nomor":109,"nama":"الكافرون","nama_latin":"Al-Kāfirūn","jumlah_ayat":6,"tempat_turun":"mekah","arti":"Orang-orang Kafir"},
            {"nomor":110,"nama":"النصر","nama_latin":"An-Naṣr","jumlah_ayat":3,"tempat_turun":"madinah","arti":"Pertolongan"},
            {"nomor":111,"nama":"المسد","nama_latin":"Al-Masad","jumlah_ayat":5,"tempat_turun":"mekah","arti":"Garis-garis"},
            {"nomor":112,"nama":"الإخلاص","nama_latin":"Al-Ikhlāṣ","jumlah_ayat":4,"tempat_turun":"mekah","arti":"Keikhlasan"},
            {"nomor":113,"nama":"الفلق","nama_latin":"Al-Falaq","jumlah_ayat":5,"tempat_turun":"mekah","arti":"Waktu Subuh"},
            {"nomor":114,"nama":"الناس","nama_latin":"An-Nās","jumlah_ayat":6,"tempat_turun":"mekah","arti":"Manusia"}
        ];
        this.isLoaded = true;
    }

    // Load data surah dari JSON file
    async loadSurahData(nomorSurah) {
        if (this.surahData[nomorSurah] || this.loadingSurah.has(nomorSurah)) {
            return this.surahData[nomorSurah];
        }

        this.loadingSurah.add(nomorSurah);

        try {
            const response = await fetch(`fahmi_backend/surah/${nomorSurah}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawData = await response.json();
            
            // Transform data dari format JSON ke format yang dibutuhkan aplikasi
            const surahInfo = rawData[nomorSurah];
            if (!surahInfo) {
                throw new Error(`Data surah ${nomorSurah} tidak ditemukan`);
            }

            // Generate data ayat
            const ayatArray = [];
            for (let i = 1; i <= parseInt(surahInfo.number_of_ayah); i++) {
                if (surahInfo.text[i] && surahInfo.translations?.id?.text[i]) {
                    ayatArray.push({
                        nomor: i,
                        teks_arab: surahInfo.text[i],
                        teks_indonesia: surahInfo.translations.id.text[i],
                        tafsir: surahInfo.tafsir?.id?.kemenag?.text[i] || ''
                    });
                }
            }

            // Format data yang dikembalikan
            this.surahData[nomorSurah] = {
                info: {
                    nomor: parseInt(surahInfo.number),
                    nama: surahInfo.name,
                    nama_latin: surahInfo.name_latin,
                    jumlah_ayat: parseInt(surahInfo.number_of_ayah),
                    terjemahan_nama: surahInfo.translations?.id?.name || ''
                },
                audio_full: `https://server7.mp3quran.net/s_gmd/${nomorSurah.toString().padStart(3, '0')}.mp3`,
                ayat: ayatArray
            };

            this.loadingSurah.delete(nomorSurah);
            return this.surahData[nomorSurah];

        } catch (error) {
            console.error(`Error loading surah ${nomorSurah}:`, error);
            this.loadingSurah.delete(nomorSurah);
            
            // Return fallback data
            return {
                info: this.surahList.find(s => s.nomor == nomorSurah) || {},
                audio_full: `https://server7.mp3quran.net/s_gmd/${nomorSurah.toString().padStart(3, '0')}.mp3`,
                ayat: [],
                error: true
            };
        }
    }

    // Get surah list
    getSurahList() {
        return this.surahList;
    }

    // Check if data is loaded
    isDataLoaded() {
        return this.isLoaded;
    }

    // Initialize the manager
    async init() {
        await this.loadSurahList();
    }
}

// Export untuk digunakan di file lain
window.QuranDataManager = QuranDataManager;