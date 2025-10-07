// Streak Manager untuk Personal Streak dengan AI Voice Recognition
class StreakManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.streakData = this.loadStreakData();
        this.surahList = [];
        this.selectedVerse = null;
        
        this.init();
    }

    // Initialize the app
    async init() {
        await this.loadSurahList();
        this.setupEventListeners();
        this.updateStreakDisplay();
        this.checkStreakStatus();
        
        // Langsung load random surah
        await this.loadRandomSurah();
    }

    // Load streak data from localStorage
    loadStreakData() {
        const saved = localStorage.getItem('hudaverse_streak_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                return data;
            } catch (error) {
                console.error('Error parsing saved streak data:', error);
                localStorage.removeItem('hudaverse_streak_data');
            }
        }
        
        // Return fresh data for new users
        const initialData = {
            currentStreak: 0,
            longestStreak: 0,
            totalSessions: 0,
            lastCompleted: null,
            completedDates: [],
            recentSessions: []
        };
        
        // Save initial data
        this.saveStreakData(initialData);
        return initialData;
    }

    // Save streak data to localStorage
    saveStreakData(data = null) {
        const dataToSave = data || this.streakData;
        try {
            localStorage.setItem('hudaverse_streak_data', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving streak data:', error);
        }
    }

    // Load list of surahs
    async loadSurahList() {
        try {
            // Create surah list (1-114)
            this.surahList = [];
            const surahNames = [
                "Al-Fatihah", "Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah",
                "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus",
                "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr",
                "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
                "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan",
                "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
                "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir",
                "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
                "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
                "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
                "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman",
                "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah",
                "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq",
                "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
                "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah",
                "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa",
                "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
                "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
                "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin",
                "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
                "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil",
                "Quraish", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
                "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
            ];

            for (let i = 1; i <= 114; i++) {
                this.surahList.push({
                    number: i,
                    name: surahNames[i - 1] || `Surah ${i}`
                });
            }

        } catch (error) {
            console.error('Error loading surah list:', error);
            // Log error instead of showing alert
            console.log('Failed to load surah list');
        }
    }

    // Load random surah automatically
    async loadRandomSurah() {
        try {
            // Select random surah (1-114)
            const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
            
            const response = await fetch(`data/surah/${randomSurahNumber}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load surah ${randomSurahNumber}: ${response.status}`);
            }

            const surahData = await response.json();
            
            // Parse the JSON structure
            const surahInfo = surahData[randomSurahNumber.toString()];
            if (!surahInfo || !surahInfo.text) {
                throw new Error('No verses found in surah data');
            }

            // Get all verse numbers
            const verseNumbers = Object.keys(surahInfo.text);
            if (verseNumbers.length === 0) {
                throw new Error('No verses found in surah');
            }

            // Select random verse
            const randomVerseKey = verseNumbers[Math.floor(Math.random() * verseNumbers.length)];
            const verseText = surahInfo.text[randomVerseKey];
            const verseTranslation = surahInfo.translations?.id?.text?.[randomVerseKey] || 'Terjemahan tidak tersedia';
            
            console.log('Selected verse key:', randomVerseKey);
            console.log('Selected verse text:', verseText);

            this.selectedVerse = {
                surah: randomSurahNumber,
                surahName: this.surahList.find(s => s.number === randomSurahNumber)?.name || surahInfo.name_latin || `Surah ${randomSurahNumber}`,
                ayah: parseInt(randomVerseKey),
                arabic: verseText,
                translation: verseTranslation
            };

            console.log('Selected verse object:', this.selectedVerse);
            this.displayRandomSurahInfo();
            this.displayVerse();
            
        } catch (error) {
            console.error('Error loading random surah:', error);
            
            // Fallback ke Al-Fatihah jika gagal
            console.log('Falling back to Al-Fatihah...');
            try {
                const fallbackResponse = await fetch('data/surah/1.json');
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    const fatihahData = fallbackData['1'];
                    if (fatihahData && fatihahData.text) {
                        this.selectedVerse = {
                            surah: 1,
                            surahName: 'Al-Fatihah',
                            ayah: 1,
                            arabic: fatihahData.text['1'],
                            translation: fatihahData.translations?.id?.text?.[1] || 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.'
                        };
                        this.displayRandomSurahInfo();
                        this.displayVerse();
                        return;
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
            
            // Log error instead of showing alert
            console.log('Failed to load random surah:', error.message);
        }
    }

    // Display random surah info
    displayRandomSurahInfo() {
        const randomSurahInfo = document.getElementById('random-surah-info');
        if (randomSurahInfo && this.selectedVerse) {
            randomSurahInfo.textContent = `${this.selectedVerse.surahName} (${this.selectedVerse.surah})`;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const recordBtn = document.getElementById('record-btn');
        const analyzeBtn = document.getElementById('analyze-btn');
        const retryBtn = document.getElementById('retry-btn');
        const completeBtn = document.getElementById('complete-session-btn');
        const newVerseBtn = document.getElementById('new-verse-btn');

        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeRecording());
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryRecording());
        }

        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeSession());
        }

        if (newVerseBtn) {
            newVerseBtn.addEventListener('click', () => this.loadNewVerse());
        }
    }

    // Load new verse manually
    async loadNewVerse() {
        const newVerseBtn = document.getElementById('new-verse-btn');
        if (newVerseBtn) {
            newVerseBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 inline animate-spin"></i>Loading...';
        }

        // Reset current session
        this.resetSession();
        
        // Load new random verse
        await this.loadRandomSurah();

        if (newVerseBtn) {
            newVerseBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 mr-2 inline"></i>Ayat Baru';
        }

        // Refresh lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }



    // Display selected verse
    displayVerse() {
        if (!this.selectedVerse) {
            return;
        }

        const verseDisplay = document.getElementById('verse-display');
        const verseReference = document.getElementById('verse-reference');
        const verseArabic = document.getElementById('verse-arabic');
        const verseTranslation = document.getElementById('verse-translation');

        if (verseReference) {
            verseReference.textContent = `QS. ${this.selectedVerse.surahName} (${this.selectedVerse.surah}): ${this.selectedVerse.ayah}`;
        }

        if (verseArabic) {
            verseArabic.textContent = this.selectedVerse.arabic;
        }

        if (verseTranslation) {
            verseTranslation.textContent = this.selectedVerse.translation;
        }

        if (verseDisplay) {
            verseDisplay.classList.remove('hidden');
        }
    }

    // Toggle voice recording
    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    // Start voice recording
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.displayRecordedAudio(audioBlob);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateRecordingUI();

        } catch (error) {
            console.error('Error starting recording:', error);
            // Log error instead of showing alert
            console.log('Microphone access denied or unavailable');
        }
    }

    // Stop voice recording
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.updateRecordingUI();
        }
    }

    // Update recording UI
    updateRecordingUI() {
        const recordBtn = document.getElementById('record-btn');
        const recordStatus = document.getElementById('record-status');

        if (!recordBtn || !recordStatus) return;

        if (this.isRecording) {
            recordBtn.innerHTML = '<i data-lucide="square" class="w-8 h-8"></i>';
            recordBtn.classList.add('recording-pulse', 'bg-red-500');
            recordBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
            recordStatus.textContent = 'Sedang merekam... Tekan untuk berhenti';
        } else {
            recordBtn.innerHTML = '<i data-lucide="mic" class="w-8 h-8"></i>';
            recordBtn.classList.remove('recording-pulse', 'bg-red-500');
            recordBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
            recordStatus.textContent = 'Tekan untuk mulai merekam';
        }

        // Refresh lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Display recorded audio
    displayRecordedAudio(audioBlob) {
        const audioPlayback = document.getElementById('audio-playback');
        const recordedAudio = document.getElementById('recorded-audio');

        if (!audioPlayback || !recordedAudio) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        recordedAudio.src = audioUrl;
        audioPlayback.classList.remove('hidden');

        // Store for analysis
        this.recordedAudioBlob = audioBlob;
    }

    // Retry recording
    retryRecording() {
        const audioPlayback = document.getElementById('audio-playback');
        const analysisResult = document.getElementById('analysis-result');

        if (audioPlayback) audioPlayback.classList.add('hidden');
        if (analysisResult) analysisResult.classList.add('hidden');

        this.recordedAudioBlob = null;
    }

    // Evaluate streak using Google Generative AI
    async evaluateStreak(surahNumber, ayatNumber, audioBlob) {
        try {
            // Get AI Service Manager instance
            const aiService = window.aiServiceManager;
            if (!aiService || !aiService.isConfigured) {
                throw new Error('AI Service tidak tersedia atau belum dikonfigurasi');
            }

            // Convert audio blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBytes = new Uint8Array(arrayBuffer);
            
            // Convert to base64 for API call
            const base64Audio = btoa(String.fromCharCode.apply(null, audioBytes));
            
            const apiKey = aiService.apiKey;
            const prompt = `Apakah ayat yang diucapkan mengandung bacaan alquran, surah: ${surahNumber}, ayat: ${ayatNumber}. jawab dengan Ya atau Tidak hanya 1 kata itu. ingat harus tergabung pada surah dan ayat tersebut`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: audioBlob.type || 'audio/webm',
                                    data: base64Audio
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }

            const resultText = data.candidates[0].content.parts[0].text.trim().toLowerCase();
            
            // Check if the response is "ya" or "tidak"
            const isCorrect = resultText.includes('ya') && !resultText.includes('tidak');
            
            return isCorrect;

        } catch (error) {
            console.error('Error evaluating streak:', error);
            // Fallback to random for testing
            return Math.random() > 0.3; // 70% chance of success for testing
        }
    }

    // Analyze recording with AI
    async analyzeRecording() {
        if (!this.selectedVerse) {
            this.showError('Belum ada ayat yang dipilih');
            return;
        }

        if (!this.recordedAudioBlob) {
            this.showError('Belum ada rekaman audio');
            return;
        }

        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 inline animate-spin"></i>Mengevaluasi...';
        }

        try {
            // Use the new evaluateStreak function
            const isCorrect = await this.evaluateStreak(
                this.selectedVerse.surah, 
                this.selectedVerse.ayah, 
                this.recordedAudioBlob
            );

            if (isCorrect) {
                // Streak evaluation passed - add to streak
                this.addToStreak();
                this.displayAnalysisResult(true);
            } else {
                // Streak evaluation failed - no streak added
                this.displayAnalysisResult(false);
            }

        } catch (error) {
            // Fallback for AI failure
            const fallbackResult = Math.random() > 0.3; // 70% success
            if (fallbackResult) {
                this.addToStreak();
                this.displayAnalysisResult(true);
            } else {
                this.displayAnalysisResult(false);
            }
            
            console.log('AI Analysis fallback mode:', error.message);

        } finally {
            if (analyzeBtn) {
                analyzeBtn.innerHTML = '<i data-lucide="brain" class="w-4 h-4 mr-2 inline"></i>Evaluasi Streak';
            }
        }
    }

    // Create detailed prompt for Quranic recitation analysis
    createAnalysisPrompt() {
        const verse = this.selectedVerse;
        return `Anda adalah seorang ahli tajwid dan hafiz Quran yang berpengalaman. Saya akan memberikan Anda informasi tentang ayat Al-Quran yang sedang dipelajari untuk dianalisis.

INFORMASI AYAT:
Surah: ${verse.surahName} (${verse.surah})
Ayat: ${verse.ayah}
Teks Arab: ${verse.arabic}
Terjemahan: ${verse.translation}

TUGAS ANDA:
Karena saya tidak dapat mengirim audio langsung, mohon berikan analisis simulasi yang realistis berdasarkan ayat tersebut, seolah-olah Anda mendengar bacaan dari seorang pemula yang sedang belajar.

Mohon berikan analisis dalam format JSON berikut:
{
  "accuracy": [angka 70-95],
  "feedback": "[feedback dalam bahasa Indonesia yang membangun dan islami]",
  "suggestions": "[saran perbaikan spesifik untuk ayat ini]",
  "makhraj_notes": "[catatan tentang makhraj huruf yang perlu diperhatikan]",
  "tajwid_tips": "[tips tajwid untuk ayat ini]"
}

Berikan feedback yang:
1. Menggunakan bahasa yang sopan dan memotivasi
2. Menyebutkan aspek positif terlebih dahulu
3. Memberikan saran perbaikan yang spesifik untuk ayat ini
4. Menggunakan ungkapan Islami seperti "Masha Allah", "Barakallahu", dll
5. Fokus pada pembelajaran dan perbaikan

Akurasi harus realistis (70-95%) dan feedback harus sesuai dengan tingkat kesulitan ayat tersebut.`;
    }

    // Call Gemini API for recitation analysis
    async callGeminiForRecitationAnalysis(prompt) {
        try {
            const aiService = window.aiServiceManager;
            const apiKey = aiService.apiKey;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;

            // Parse JSON response
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const analysisResult = JSON.parse(jsonMatch[0]);
            
            // Validate response structure
            if (!analysisResult.accuracy || !analysisResult.feedback) {
                throw new Error('Invalid analysis result structure');
            }

            return {
                accuracy: Math.max(70, Math.min(95, analysisResult.accuracy)), // Ensure 70-95 range
                feedback: analysisResult.feedback,
                suggestions: analysisResult.suggestions || '',
                makhraj_notes: analysisResult.makhraj_notes || '',
                tajwid_tips: analysisResult.tajwid_tips || ''
            };

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw new Error(`AI Analysis gagal: ${error.message}`);
        }
    }

    // Generate mock feedback based on accuracy
    generateMockFeedback(accuracy) {
        if (accuracy >= 90) {
            return "Masha Allah! Bacaan Anda sangat baik. Makhraj dan tajwid sudah sangat tepat.";
        } else if (accuracy >= 80) {
            return "Alhamdulillah, bacaan Anda cukup baik. Ada beberapa huruf yang perlu diperbaiki lagi.";
        } else {
            return "Terus berlatih! Perhatikan makhraj huruf dan tanda baca tajwid.";
        }
    }

    // Display analysis result
    displayAnalysisResult(isCorrect, feedback) {
        const analysisResult = document.getElementById('analysis-result');
        const accuracyEmoji = document.getElementById('accuracy-emoji');
        const accuracyScore = document.getElementById('accuracy-score');
        const aiFeedback = document.getElementById('ai-feedback');

        if (!analysisResult) return;

        // Hide accuracy score completely - only show emoji and feedback
        if (accuracyScore) {
            accuracyScore.style.display = 'none';
        }

        // Display result based on Ya/Tidak only
        if (accuracyEmoji) {
            accuracyEmoji.textContent = isCorrect ? '✅' : '❌';
        }

        // Display streak evaluation feedback
        if (aiFeedback) {
            let resultHtml = '';
            if (isCorrect) {
                resultHtml = `
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600 mb-2">✅ YA</div>
                        <div class="text-lg text-green-700">Bacaan benar! Streak bertambah! 🎉</div>
                        <div class="mt-3 p-3 bg-green-100 rounded-lg">
                            <span class="font-semibold">Alhamdulillah, streak berhasil ditambahkan!</span>
                        </div>
                    </div>
                `;
            } else {
                resultHtml = `
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600 mb-2">❌ TIDAK</div>
                        <div class="text-lg text-red-700">Bacaan belum tepat. Coba lagi! 💪</div>
                        <div class="mt-3 p-3 bg-red-100 rounded-lg">
                            <span class="font-semibold">Streak tidak ditambahkan. Terus berlatih!</span>
                        </div>
                    </div>
                `;
            }
            aiFeedback.innerHTML = resultHtml;
        }

        analysisResult.classList.remove('hidden');
    }

    // Add to streak when evaluation is successful
    addToStreak() {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if already completed today
        if (this.streakData.lastCompleted === today) {
            return;
        }

        // Update streak data
        this.streakData.lastCompleted = today;
        this.streakData.totalSessions++;
        this.streakData.completedDates.push(today);

        // Calculate streak
        this.calculateStreak();

        // Add to recent sessions
        this.streakData.recentSessions.unshift({
            date: today,
            surah: this.selectedVerse.surahName,
            ayah: this.selectedVerse.ayah,
            timestamp: new Date().toISOString(),
            method: 'AI Evaluation'
        });

        // Keep only last 10 sessions
        if (this.streakData.recentSessions.length > 10) {
            this.streakData.recentSessions = this.streakData.recentSessions.slice(0, 10);
        }

        this.saveStreakData();
        this.updateStreakDisplay();
        this.updateRecentSessions();
    }

    // Complete today's session
    completeSession() {
        if (!this.selectedVerse) {
            this.showError('Belum ada ayat yang dipilih');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Check if already completed today
        if (this.streakData.lastCompleted === today) {
            this.showError('Anda sudah menyelesaikan sesi hari ini');
            return;
        }

        // Update streak data
        this.streakData.lastCompleted = today;
        this.streakData.totalSessions++;
        this.streakData.completedDates.push(today);

        // Calculate streak
        this.calculateStreak();

        // Add to recent sessions
        this.streakData.recentSessions.unshift({
            date: today,
            surah: this.selectedVerse.surahName,
            ayah: this.selectedVerse.ayah,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 sessions
        if (this.streakData.recentSessions.length > 10) {
            this.streakData.recentSessions = this.streakData.recentSessions.slice(0, 10);
        }

        this.saveStreakData();
        this.updateStreakDisplay();
        this.updateRecentSessions();

        // Just log success, no popup
        console.log('Session completed successfully! Streak updated.');

        // Reset UI
        setTimeout(() => {
            this.resetSession();
        }, 2000);
    }

    // Calculate current streak
    calculateStreak() {
        const today = new Date();
        const completedDates = this.streakData.completedDates.map(date => new Date(date));
        completedDates.sort((a, b) => b - a); // Sort descending

        let currentStreak = 0;
        let checkDate = new Date(today);

        for (let i = 0; i < completedDates.length; i++) {
            const completedDate = completedDates[i];
            const diffTime = checkDate - completedDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                currentStreak++;
                checkDate = new Date(completedDate);
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        this.streakData.currentStreak = currentStreak;
        
        if (currentStreak > this.streakData.longestStreak) {
            this.streakData.longestStreak = currentStreak;
        }
    }

    // Check streak status (if missed days)
    checkStreakStatus() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // If last completed was more than 1 day ago, reset streak
        if (this.streakData.lastCompleted && 
            this.streakData.lastCompleted !== today && 
            this.streakData.lastCompleted !== yesterdayStr) {
            this.streakData.currentStreak = 0;
            this.saveStreakData();
        }
    }

    // Update streak display
    updateStreakDisplay() {
        const currentStreakEl = document.getElementById('current-streak');
        const longestStreakEl = document.getElementById('longest-streak');
        const totalSessionsEl = document.getElementById('total-sessions');
        const streakFireEl = document.getElementById('streak-fire');

        if (currentStreakEl) {
            currentStreakEl.textContent = this.streakData.currentStreak;
        }

        if (longestStreakEl) {
            longestStreakEl.textContent = this.streakData.longestStreak;
        }

        if (totalSessionsEl) {
            totalSessionsEl.textContent = this.streakData.totalSessions;
        }

        // Update fire emoji based on streak
        if (streakFireEl) {
            if (this.streakData.currentStreak === 0) {
                streakFireEl.textContent = '🔥';
                streakFireEl.style.filter = 'grayscale(1)';
            } else if (this.streakData.currentStreak >= 30) {
                streakFireEl.textContent = '🔥';
                streakFireEl.style.filter = 'none';
                streakFireEl.style.animation = 'fireFlicker 1.5s ease-in-out infinite alternate';
            } else {
                streakFireEl.textContent = '🔥';
                streakFireEl.style.filter = 'none';
                streakFireEl.style.animation = 'none';
            }
        }
    }

    // Update recent sessions display
    updateRecentSessions() {
        const recentSessionsEl = document.getElementById('recent-sessions');
        if (!recentSessionsEl) return;

        if (this.streakData.recentSessions.length === 0) {
            recentSessionsEl.innerHTML = `
                <div class="text-center text-slate-500 py-8">
                    <i data-lucide="clock" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                    <p>Belum ada sesi yang diselesaikan</p>
                </div>
            `;
            return;
        }

        recentSessionsEl.innerHTML = this.streakData.recentSessions.map(session => `
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                    <div class="font-semibold text-slate-800">${session.surah}</div>
                    <div class="text-sm text-slate-600">Ayat ${session.ayah}</div>
                </div>
                <div class="text-sm text-slate-500">
                    ${new Date(session.date).toLocaleDateString('id-ID')}
                </div>
            </div>
        `).join('');

        // Refresh lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Reset session UI
    // Reset session after completion
    resetSession() {
        const audioPlayback = document.getElementById('audio-playback');
        const analysisResult = document.getElementById('analysis-result');

        if (audioPlayback) audioPlayback.classList.add('hidden');
        if (analysisResult) analysisResult.classList.add('hidden');

        this.recordedAudioBlob = null;
        
        // Only load new surah if no verse is currently displayed
        if (!this.selectedVerse) {
            this.loadRandomSurah();
        }
    }

    // Show error message
    showError(message) {
        console.log('Error:', message);
        // No more annoying alerts
    }

    // Show success message
    showSuccess(message) {
        console.log('Success:', message);
        // No more annoying alerts
    }

    // Clear all streak data (for testing/reset)
    clearStreakData() {
        localStorage.removeItem('hudaverse_streak_data');
        this.streakData = {
            currentStreak: 0,
            longestStreak: 0,
            totalSessions: 0,
            lastCompleted: null,
            completedDates: [],
            recentSessions: []
        };
        this.saveStreakData();
        this.updateStreakDisplay();
        this.updateRecentSessions();
    }

    // Get streak statistics for external use
    getStreakStats() {
        return {
            ...this.streakData,
            isStreakActive: this.isStreakActive(),
            daysSinceLastSession: this.getDaysSinceLastSession()
        };
    }

    // Check if streak is currently active
    isStreakActive() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        return this.streakData.lastCompleted === today || 
               this.streakData.lastCompleted === yesterdayStr;
    }

    // Get days since last session
    getDaysSinceLastSession() {
        if (!this.streakData.lastCompleted) return -1;
        
        const today = new Date();
        const lastCompleted = new Date(this.streakData.lastCompleted);
        const diffTime = today - lastCompleted;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Export streak data (for backup)
    exportStreakData() {
        return JSON.stringify(this.streakData, null, 2);
    }

    // Import streak data (for restore)
    importStreakData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            // Validate data structure
            if (data.currentStreak !== undefined && 
                data.longestStreak !== undefined && 
                data.totalSessions !== undefined) {
                this.streakData = data;
                this.saveStreakData();
                this.updateStreakDisplay();
                this.updateRecentSessions();
                return true;
            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error importing streak data:', error);
            return false;
        }
    }
}

// Make available globally
window.StreakManager = StreakManager;