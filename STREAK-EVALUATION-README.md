# Streak Evaluation dengan Google Generative AI

## Cara Kerja

Fitur evaluasi streak ini menggunakan Google Generative AI untuk mengevaluasi bacaan Al-Quran secara otomatis. Sistem akan menentukan apakah bacaan benar dengan jawaban "Ya" atau "Tidak".

## Implementasi

### 1. Fungsi Evaluasi Streak
```javascript
async evaluateStreak(surahNumber, ayatNumber, audioBlob)
```

**Parameter:**
- `surahNumber`: Nomor surah (1-114)
- `ayatNumber`: Nomor ayat dalam surah
- `audioBlob`: File audio rekaman dalam format WebM

**Return:**
- `true`: Jika AI menjawab "Ya" (bacaan benar) → Streak bertambah
- `false`: Jika AI menjawab "Tidak" (bacaan salah) → Streak tidak bertambah

### 2. Prompt untuk AI
```
"Apakah ayat yang diucapkan mengandung bacaan alquran, surah: {surah}, ayat: {ayat}. jawab dengan Ya atau Tidak hanya 1 kata itu. ingat harus tergabung pada surah dan ayat tersebut"
```

### 3. Logika Streak
- **Ya**: Streak +1, update statistik, simpan ke localStorage
- **Tidak**: Streak tidak berubah, beri motivasi untuk coba lagi

## Penggunaan

1. **Pilih Ayat**: Sistem akan menampilkan ayat random dari Al-Quran
2. **Rekam Audio**: Tekan tombol mikrofon untuk merekam bacaan
3. **Evaluasi**: Tekan "Evaluasi Streak" untuk analisis AI
4. **Hasil**: 
   - ✅ **YA** → Streak bertambah!
   - ❌ **TIDAK** → Coba lagi!

## Fallback System

Jika AI service tidak tersedia:
- Menggunakan evaluasi random (70% chance sukses)
- Log error tanpa mengganggu user experience
- Tetap bisa manual complete session

## API Configuration

Menggunakan API key yang sudah dikonfigurasi di `ai-service-manager.js`:
```javascript
const apiKey = "AIzaSyAxGvhjqziXocgMKLyqanpyxdIcMMnSWdY";
```

## File yang Dimodifikasi

1. **js/streak-manager.js**
   - Tambah fungsi `evaluateStreak()`
   - Tambah fungsi `addToStreak()`
   - Update `analyzeRecording()`
   - Update `displayAnalysisResult()`

2. **studio.html**
   - Update teks tombol "Evaluasi Streak"

## Features

✅ Real-time audio evaluation dengan Gemini AI  
✅ Simple Ya/Tidak response system  
✅ Automatic streak calculation  
✅ Fallback untuk offline mode  
✅ User-friendly feedback display  
✅ Progress tracking dengan localStorage  

## Testing

Untuk testing, sistem akan:
1. Record audio dalam format WebM
2. Convert ke base64 untuk API call
3. Send ke Gemini Flash Latest model
4. Parse response untuk "ya" atau "tidak"
5. Update streak berdasarkan hasil