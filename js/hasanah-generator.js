// Hasanah Generator - JavaScript Implementation
class HasanahGenerator {
    constructor() {
        this.apiKey = null;
        this.isConfigured = false;
        this.quranData = {};
        
        // Hardcoded API key for development (same as fahmi chatbot)
        this.defaultApiKey = "AIzaSyAxGvhjqziXocgMKLyqanpyxdIcMMnSWdY";
        
        this.systemPrompt = `
ANDA ADALAH API JSON GENERATOR. IKUTI ATURAN BERIKUT DENGAN KETAT:

1. HANYA KEMBALIKAN JSON YANG VALID - TIDAK ADA TEKS LAIN!
2. JANGAN TAMBAHKAN PENJELASAN, SALAM, ATAU KOMENTAR APAPUN!
3. FORMAT WAJIB:

{
  "habits": [
    {
      "title": "Judul Amalan Singkat",
      "description": "Penjelasan 1-2 kalimat tentang amalan dan kaitannya dengan ayat",
      "verse_reference": "QS. Nama Surah: Nomor Ayat"
    }
  ]
}

4. HASILKAN TEPAT 3 AMALAN YANG PRAKTIS DAN RELEVAN
5. PASTIKAN SEMUA STRING DITUTUP DENGAN BENAR
6. PASTIKAN JSON BERAKHIR DENGAN }

MULAI ANALISIS AYAT DAN KEMBALIKAN HANYA JSON:
        `;
        
        // Auto-initialize with default API key
        this.init();
    }

    // Initialize dengan default API key
    async init() {
        console.log('🌸 Initializing Hasanah Generator...');
        
        // Use default API key directly
        this.apiKey = this.defaultApiKey;
        this.isConfigured = true;
        
        console.log('✅ Hasanah Generator initialized with default API key');
    }

    // Initialize dengan API key
    async initialize(apiKey) {
        this.apiKey = apiKey;
        this.isConfigured = true;
        console.log('✅ Hasanah Generator initialized successfully');
    }

    // Set API key (called by AI Service Manager or manually)
    setApiKey(apiKey) {
        // Use provided API key or fall back to default
        this.apiKey = apiKey || this.defaultApiKey;
        this.isConfigured = true;
        console.log('✅ Hasanah Generator API key updated:', !!this.apiKey);
    }

    // Check if ready to use
    isReady() {
        return this.isConfigured && (this.apiKey || this.defaultApiKey);
    }

    // Get status for debugging
    getStatus() {
        return {
            isConfigured: this.isConfigured,
            hasApiKey: !!this.apiKey,
            hasDefaultApiKey: !!this.defaultApiKey,
            isReady: this.isReady(),
            usingDefaultKey: this.apiKey === this.defaultApiKey
        };
    }

    // Load Quran data for specific surah
    async loadSurahData(surahNumber) {
        if (this.quranData[surahNumber]) {
            return this.quranData[surahNumber];
        }

        try {
            console.log(`📖 Loading surah ${surahNumber} from data/surah/${surahNumber}.json`);
            const response = await fetch(`data/surah/${surahNumber}.json`);
            if (!response.ok) {
                throw new Error(`Surah ${surahNumber} data not found`);
            }
            
            const data = await response.json();
            console.log(`✅ Surah ${surahNumber} loaded successfully:`, data);
            this.quranData[surahNumber] = data;
            return data;
        } catch (error) {
            console.error(`❌ Error loading surah ${surahNumber}:`, error);
            throw new Error(`Gagal memuat data surah ${surahNumber}`);
        }
    }

    // Generate habits from verses
    async generateHabits(surahNumber, startAyah, endAyah) {
        // Use available API key (custom or default)
        const activeApiKey = this.apiKey || this.defaultApiKey;
        
        if (!activeApiKey) {
            throw new Error('Tidak ada API key yang tersedia untuk Hasanah Generator.');
        }

        try {
            // Load surah data
            const surahData = await this.loadSurahData(surahNumber);
            const surahKey = surahNumber.toString();
            const surahObj = surahData[surahKey];

            if (!surahObj) {
                console.error(`❌ Data surah ${surahNumber} tidak valid:`, surahData);
                throw new Error(`Data surah ${surahNumber} tidak valid`);
            }

            console.log(`📚 Processing surah: ${surahObj.name_latin}, ayah ${startAyah}-${endAyah}`);

            const surahNameLatin = surahObj.name_latin || `Surah ${surahNumber}`;
            const arabicTexts = surahObj.text || {};
            const indonesianTexts = surahObj.translations?.id?.text || {};

            console.log(`📖 Arabic texts available:`, Object.keys(arabicTexts).length, 'verses');
            console.log(`🇮🇩 Indonesian texts available:`, Object.keys(indonesianTexts).length, 'verses');

            // Build verses text
            let versesText = [];
            for (let i = startAyah; i <= endAyah; i++) {
                const verseKey = i.toString();
                const arabicText = arabicTexts[verseKey] || '[Teks Arab tidak tersedia]';
                const indonesianText = indonesianTexts[verseKey] || '[Terjemahan tidak tersedia]';
                
                console.log(`📝 Ayah ${i}: Arabic=${!!arabicTexts[verseKey]}, Indonesian=${!!indonesianTexts[verseKey]}`);
                
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

            // Call Gemini API with active API key
            const response = await this.callGeminiAPI(fullPrompt, activeApiKey);
            
            // Parse JSON response
            const habitsData = this.parseHabitsResponse(response);
            
            return habitsData;

        } catch (error) {
            console.error('Error generating habits:', error);
            throw new Error('Gagal menghasilkan amalan. Silakan coba lagi.');
        }
    }

    // Call Gemini API
    async callGeminiAPI(prompt, apiKey = null) {
        const activeApiKey = apiKey || this.apiKey || this.defaultApiKey;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${activeApiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.2,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 2048,
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
            // Clean the response - remove markdown code blocks if any
            let cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Extract JSON from response
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn('No JSON found, using fallback response');
                return this.generateFallbackHabits();
            }

            let jsonString = jsonMatch[0];
            
            // Try to fix incomplete JSON
            if (!jsonString.trim().endsWith('}')) {
                console.warn('JSON appears incomplete, attempting to fix...');
                
                // Count opening and closing braces
                const openBraces = (jsonString.match(/\{/g) || []).length;
                const closeBraces = (jsonString.match(/\}/g) || []).length;
                
                // Add missing closing braces
                const missingBraces = openBraces - closeBraces;
                for (let i = 0; i < missingBraces; i++) {
                    jsonString += '}';
                }
                
                // If we're inside a string, close it
                if (jsonString.includes('"') && (jsonString.match(/"/g) || []).length % 2 !== 0) {
                    jsonString = jsonString.replace(/("[^"]*$)/, '$1"');
                }
                
                // Try to complete the habits array if it's open
                if (jsonString.includes('"habits"') && !jsonString.includes(']}')) {
                    // Find the last complete habit and close the array
                    const lastCompleteHabit = jsonString.lastIndexOf('"}');
                    if (lastCompleteHabit > 0) {
                        jsonString = jsonString.substring(0, lastCompleteHabit + 2) + ']}';
                    }
                }
            }

            console.log('Cleaned JSON string:', jsonString);
            const habitsData = JSON.parse(jsonString);

            // Validate structure
            if (!habitsData.habits || !Array.isArray(habitsData.habits)) {
                console.warn('Invalid structure, using fallback');
                return this.generateFallbackHabits();
            }

            // Filter out incomplete habits
            const validHabits = habitsData.habits.filter(habit => 
                habit.title && habit.description && habit.verse_reference
            );

            if (validHabits.length === 0) {
                console.warn('No valid habits found, using fallback');
                return this.generateFallbackHabits();
            }

            return { habits: validHabits };

        } catch (error) {
            console.error('Error parsing habits response:', error);
            console.warn('Parsing failed, using fallback habits');
            return this.generateFallbackHabits();
        }
    }

    // Generate fallback habits when AI response fails
    generateFallbackHabits() {
        return {
            habits: [
                {
                    title: "Membaca Basmalah",
                    description: "Memulai setiap aktivitas dengan membaca 'Bismillahir Rahmanir Rahim' untuk mengingat Allah dan memohon berkah-Nya.",
                    verse_reference: "QS. Al-Fatihah: 1"
                },
                {
                    title: "Bersyukur Setiap Hari",
                    description: "Mengucapkan 'Alhamdulillahi rabbil alamiin' dan merenungkan nikmat Allah yang telah diberikan sepanjang hari.",
                    verse_reference: "QS. Al-Fatihah: 2"
                },
                {
                    title: "Berdoa dengan Khusyuk",
                    description: "Meluangkan waktu untuk berdoa dan memohon petunjuk dari Allah dengan penuh kerendahan hati.",
                    verse_reference: "Ayat yang dibaca"
                }
            ]
        };
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

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌸 Hasanah Generator DOM ready');
    console.log('🌸 Status:', window.hasanahGenerator.getStatus());
    
    // Still compatible with AI Service Manager if available
    setTimeout(() => {
        if (window.aiServiceManager) {
            console.log('🔗 AI Service Manager detected, registering service...');
            window.aiServiceManager.reinitializeServices();
        }
    }, 1000);
});

// Make class available globally
window.HasanahGenerator = HasanahGenerator;

// Debugging helper
window.debugHasanah = () => {
    console.log('=== HASANAH DEBUG INFO ===');
    console.log('HasanahGenerator instance:', window.hasanahGenerator);
    console.log('Status:', window.hasanahGenerator?.getStatus());
    console.log('AI Service Manager:', window.aiServiceManager);
    console.log('AI Service Manager status:', window.aiServiceManager?.getServiceStatus());
    console.log('========================');
};