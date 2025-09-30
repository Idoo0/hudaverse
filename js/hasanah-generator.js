// Hasanah Generator - JavaScript Implementation
class HasanahGenerator {
    constructor() {
        this.apiKey = null;
        this.isConfigured = false;
        this.quranData = {};
        this.systemPrompt = `
ANDA ADALAH SEBUAH API GENERATOR JSON.
Peran Anda adalah menganalisis teks ayat Al-Qur'an dan mengembalikan daftar amalan dalam format JSON yang ketat.

ATURAN PALING PENTING:
1. OUTPUT WAJIB dan HANYA berupa string JSON yang valid.
2. JANGAN PERNAH menulis teks salam, penjelasan, atau kesimpulan di luar struktur JSON. Seluruh jawaban Anda harus bisa langsung di-parse oleh JSON.parse() di JavaScript.
3. Struktur JSON HARUS seperti ini:
{
  "habits": [
    {
      "title": "Judul Amalan Singkat dan Menarik",
      "description": "Penjelasan 1-2 kalimat yang memotivasi, menjelaskan cara melakukan amalan, dan kaitannya dengan ayat.",
      "verse_reference": "Referensi ayat spesifik, contoh: QS. Al-Baqarah: 255"
    }
  ]
}
4. Hasilkan 3 sampai 4 saran amalan yang praktis dan relevan dari ayat yang diberikan.

Sekarang, analisis ayat-ayat berikut dan berikan output dalam format JSON yang telah ditentukan tanpa teks tambahan apapun.
        `;
    }

    // Initialize dengan API key
    async initialize(apiKey) {
        this.apiKey = apiKey;
        this.isConfigured = true;
        console.log('✅ Hasanah Generator initialized successfully');
    }

    // Set API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.isConfigured = true;
        this.saveApiKeyToStorage(apiKey);
    }

    // Get API key dari localStorage
    getStoredApiKey() {
        return localStorage.getItem('gemini_api_key');
    }

    // Save API key ke localStorage
    saveApiKeyToStorage(apiKey) {
        localStorage.setItem('gemini_api_key', apiKey);
    }

    // Load Quran data for specific surah
    async loadSurahData(surahNumber) {
        if (this.quranData[surahNumber]) {
            return this.quranData[surahNumber];
        }

        try {
            const response = await fetch(`fahmi_backend/surah/${surahNumber}.json`);
            if (!response.ok) {
                throw new Error(`Surah ${surahNumber} data not found`);
            }
            
            const data = await response.json();
            this.quranData[surahNumber] = data;
            return data;
        } catch (error) {
            console.error(`Error loading surah ${surahNumber}:`, error);
            throw new Error(`Gagal memuat data surah ${surahNumber}`);
        }
    }

    // Generate habits from verses
    async generateHabits(surahNumber, startAyah, endAyah) {
        if (!this.isConfigured || !this.apiKey) {
            throw new Error('Hasanah Generator belum dikonfigurasi. Silakan set API key terlebih dahulu.');
        }

        try {
            // Load surah data
            const surahData = await this.loadSurahData(surahNumber);
            const surahKey = surahNumber.toString();
            const surahObj = surahData[surahKey];

            if (!surahObj) {
                throw new Error(`Data surah ${surahNumber} tidak valid`);
            }

            const surahNameLatin = surahObj.name_latin || `Surah ${surahNumber}`;
            const arabicTexts = surahObj.text || {};
            const indonesianTexts = surahObj.translations?.id?.text || {};

            // Build verses text
            let versesText = [];
            for (let i = startAyah; i <= endAyah; i++) {
                const verseKey = i.toString();
                const arabicText = arabicTexts[verseKey] || '[Teks Arab tidak tersedia]';
                const indonesianText = indonesianTexts[verseKey] || '[Terjemahan tidak tersedia]';
                
                versesText.push(
                    `QS. ${surahNameLatin}:${i}\n` +
                    `Arab: ${arabicText}\n` +
                    `Terjemahan: ${indonesianText}\n`
                );
            }

            if (versesText.length === 0) {
                throw new Error('Tidak ada ayat yang ditemukan dalam rentang yang diberikan');
            }

            const versesContent = versesText.join('\n');
            const fullPrompt = `${this.systemPrompt}\n\nBerikut adalah ayat-ayat yang perlu dianalisis:\n\n${versesContent}`;

            // Call Gemini API
            const response = await this.callGeminiAPI(fullPrompt);
            
            // Parse JSON response
            const habitsData = this.parseHabitsResponse(response);
            
            return habitsData;

        } catch (error) {
            console.error('Error generating habits:', error);
            throw new Error('Gagal menghasilkan amalan. Silakan coba lagi.');
        }
    }

    // Call Gemini API
    async callGeminiAPI(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 32,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', errorData);
            
            if (response.status === 400) {
                throw new Error('API key tidak valid atau request bermasalah');
            } else if (response.status === 403) {
                throw new Error('API key tidak memiliki akses atau quota habis');
            } else {
                throw new Error('Gagal berkomunikasi dengan AI service');
            }
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Response AI tidak valid');
        }

        return data.candidates[0].content.parts[0].text;
    }

    // Parse habits response from AI
    parseHabitsResponse(response) {
        console.log('Raw AI Response:', response);

        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Tidak ada JSON yang ditemukan dalam response AI');
            }

            const jsonString = jsonMatch[0];
            const habitsData = JSON.parse(jsonString);

            // Validate structure
            if (!habitsData.habits || !Array.isArray(habitsData.habits)) {
                throw new Error('Format JSON tidak valid - habits array tidak ditemukan');
            }

            // Validate each habit
            habitsData.habits.forEach((habit, index) => {
                if (!habit.title || !habit.description || !habit.verse_reference) {
                    throw new Error(`Habit ${index + 1} tidak memiliki field yang lengkap`);
                }
            });

            return habitsData;

        } catch (error) {
            console.error('Error parsing habits response:', error);
            throw new Error('Gagal mem-parsing response AI. Format tidak sesuai.');
        }
    }

    // Validate API key
    async validateApiKey(apiKey) {
        try {
            this.apiKey = apiKey;
            const testPrompt = "Berikan contoh JSON dengan format yang benar.";
            await this.callGeminiAPI(testPrompt);
            return true;
        } catch (error) {
            console.error('API Key validation failed:', error);
            return false;
        }
    }

    // Get available surahs (static list)
    getAvailableSurahs() {
        const surahs = [];
        for (let i = 1; i <= 114; i++) {
            surahs.push(i);
        }
        return surahs;
    }

    // Generate sample habits for testing
    generateSampleHabits() {
        return {
            habits: [
                {
                    title: "Dzikir Pagi dan Petang",
                    description: "Mengingat Allah dengan membaca tasbih, tahmid, dan takbir setiap pagi dan petang untuk menenangkan hati.",
                    verse_reference: "QS. Al-Ahzab: 41"
                },
                {
                    title: "Sedekah Harian",
                    description: "Memberikan sedekah sekecil apapun setiap hari sebagai bentuk syukur dan kepedulian terhadap sesama.",
                    verse_reference: "QS. Al-Baqarah: 261"
                },
                {
                    title: "Membaca Al-Quran",
                    description: "Membaca dan merenungkan ayat-ayat Al-Quran minimal satu halaman setiap hari untuk memperkuat iman.",
                    verse_reference: "QS. Al-Muzammil: 4"
                }
            ]
        };
    }
}

// Initialize global Hasanah instance
window.hasanahGenerator = new HasanahGenerator();

// Auto-initialize if API key exists
document.addEventListener('DOMContentLoaded', () => {
    const storedApiKey = window.hasanahGenerator.getStoredApiKey();
    if (storedApiKey) {
        window.hasanahGenerator.setApiKey(storedApiKey);
    }
});

// Make class available globally
window.HasanahGenerator = HasanahGenerator;