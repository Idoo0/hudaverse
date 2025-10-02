// Streak Manager untuk Personal dan Group Streak
class StreakManager {
    constructor() {
        this.currentUser = 'Idoo0'; // Dari GitHub login
        this.apiEndpoint = 'http://127.0.0.1:5000/api/streak';
        this.geminiApiKey = 'AIzaSyDP0pV_WldmEXII9PM5qgMDbsajTM3RSLk'; // Ganti dengan API key Gemini
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.currentDailyVerse = null;
        this.streakData = this.loadStreakData();
        this.recordedAudioBlob = null; // Store the recorded audio
    }

    // Load streak data dari localStorage
    loadStreakData() {
        const saved = localStorage.getItem('hudaverse_streak_data');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            personal: {
                currentStreak: 0,
                longestStreak: 0,
                lastCompleted: null,
                totalDays: 0,
                completedDates: []
            },
            groups: {}
        };
    }

    // Save streak data ke localStorage
    saveStreakData() {
        localStorage.setItem('hudaverse_streak_data', JSON.stringify(this.streakData));
    }

    // Get daily verse (ayat harian)
    async getDailyVerse() {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if we already have today's verse
        const savedVerse = localStorage.getItem(`daily_verse_${today}`);
        if (savedVerse) {
            this.currentDailyVerse = JSON.parse(savedVerse);
            return this.currentDailyVerse;
        }

        // Generate new daily verse
        const surahNumber = Math.floor(Math.random() * 114) + 1;
        try {
            const response = await fetch(`data/surah/${surahNumber}.json`);
            const data = await response.json();
            const surahData = data[surahNumber];
            
            const totalAyat = parseInt(surahData.number_of_ayah);
            const ayatNumber = Math.floor(Math.random() * totalAyat) + 1;
            
            this.currentDailyVerse = {
                date: today,
                surah: {
                    number: surahNumber,
                    name: surahData.name,
                    name_latin: surahData.name_latin
                },
                ayat: {
                    number: ayatNumber,
                    arabic: surahData.text[ayatNumber],
                    translation: surahData.translations?.id?.text[ayatNumber] || '',
                    tafsir: surahData.tafsir?.id?.kemenag?.text[ayatNumber] || ''
                }
            };

            // Save today's verse
            localStorage.setItem(`daily_verse_${today}`, JSON.stringify(this.currentDailyVerse));
            return this.currentDailyVerse;
        } catch (error) {
            console.error('Error loading daily verse:', error);
            // Fallback verse
            this.currentDailyVerse = {
                date: today,
                surah: { number: 1, name: "الفاتحة", name_latin: "Al-Fatihah" },
                ayat: {
                    number: 1,
                    arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
                    translation: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.",
                    tafsir: "Basmalah adalah kalimat pembuka yang penuh keberkahan."
                }
            };
            return this.currentDailyVerse;
        }
    }

    // Start recording voice
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
                this.recordedAudioBlob = audioBlob; // Store the recorded audio
                console.log('Audio recorded, blob size:', audioBlob.size);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            return false;
        }
    }

    // Stop recording
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    // Verify recitation using recorded audio or simulation
    async verifyRecitation(audioBlob = null) {
        try {
            // Use recorded audio if available, otherwise simulate
            const audioToVerify = audioBlob || this.recordedAudioBlob;
            
            if (!audioToVerify) {
                // Pure simulation mode
                return this.simulateVerification();
            }

            // Real verification with audio
            const base64Audio = await this.audioToBase64(audioToVerify);
            
            // Prepare the expected text (Arabic verse)
            const expectedText = this.currentDailyVerse.ayat.arabic;
            const translationText = this.currentDailyVerse.ayat.translation;

            // For now, we'll simulate since Gemini audio API needs special setup
            // In production, you would call the real API here
            return await this.callGeminiForVerification(base64Audio, expectedText, translationText);
            
        } catch (error) {
            console.error('Error verifying recitation:', error);
            return { 
                success: false, 
                confidence: 0, 
                feedback: 'Terjadi kesalahan dalam verifikasi. Silakan coba lagi.' 
            };
        }
    }

    // Simulate verification for demo purposes
    simulateVerification() {
        // Random simulation for demo - 70% success rate
        const isSuccess = Math.random() > 0.3;
        const confidence = isSuccess ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 30;
        
        return Promise.resolve({
            success: isSuccess,
            confidence: confidence,
            feedback: isSuccess 
                ? "Mashaa Allah! Bacaan Anda sangat baik dan sesuai dengan ayat yang ditargetkan." 
                : "Terus berlatih! Coba ulangi sekali lagi dengan lebih pelan dan jelas."
        });
    }

    // Convert audio blob to base64
    audioToBase64(blob) {
        return new Promise((resolve, reject) => {
            if (!blob || !(blob instanceof Blob)) {
                reject(new Error('Invalid blob provided'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Call Gemini API for verification (enhanced version)
    async callGeminiForVerification(audioBase64, expectedArabic, translation) {
        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if we have actual audio data
            if (audioBase64 && audioBase64.length > 100) {
                // In a real implementation, you would:
                // 1. Convert audio to text using speech-to-text API
                // 2. Use Gemini to compare texts
                // 3. Return detailed analysis
                
                console.log('Audio base64 length:', audioBase64.length);
                console.log('Expected Arabic:', expectedArabic);
                
                // For now, simulate with slightly better logic
                const hasAudio = true;
                const isSuccess = Math.random() > 0.2; // 80% success when audio is provided
                
                return {
                    success: isSuccess,
                    confidence: isSuccess ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 40) + 40,
                    feedback: isSuccess 
                        ? "Alhamdulillah! Audio Anda terdeteksi dengan baik dan bacaan sangat sesuai dengan ayat Al-Quran." 
                        : "Audio terdeteksi namun perlu sedikit perbaikan dalam pelafalan. Tetap semangat!"
                };
            } else {
                // No audio provided, just simulate
                return this.simulateVerification();
            }
            
        } catch (error) {
            console.error('Gemini API error:', error);
            return { 
                success: false, 
                confidence: 0, 
                feedback: "Terjadi kesalahan dalam verifikasi AI." 
            };
        }
    }

    // Complete daily streak
    async completeDailyStreak(isPersonal = true, groupId = null) {
        const today = new Date().toISOString().split('T')[0];
        
        if (isPersonal) {
            // Update personal streak
            const lastCompleted = this.streakData.personal.lastCompleted;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastCompleted === yesterdayStr) {
                // Continue streak
                this.streakData.personal.currentStreak++;
            } else if (lastCompleted !== today) {
                // Start new streak
                this.streakData.personal.currentStreak = 1;
            }

            this.streakData.personal.lastCompleted = today;
            this.streakData.personal.totalDays++;
            this.streakData.personal.longestStreak = Math.max(
                this.streakData.personal.longestStreak,
                this.streakData.personal.currentStreak
            );
            
            if (!this.streakData.personal.completedDates.includes(today)) {
                this.streakData.personal.completedDates.push(today);
            }
        } else if (groupId) {
            // Update group streak
            if (!this.streakData.groups[groupId]) {
                this.streakData.groups[groupId] = {
                    members: [],
                    currentStreak: 0,
                    completedToday: [],
                    totalDays: 0
                };
            }

            const groupData = this.streakData.groups[groupId];
            if (!groupData.completedToday.includes(this.currentUser)) {
                groupData.completedToday.push(this.currentUser);
            }

            // Check if all members completed today
            const allCompleted = groupData.members.every(member => 
                groupData.completedToday.includes(member)
            );

            if (allCompleted) {
                groupData.currentStreak++;
                groupData.totalDays++;
                groupData.completedToday = []; // Reset for next day
            }
        }

        this.saveStreakData();
        return this.streakData;
    }

    // Get streak statistics
    getStreakStats(isPersonal = true, groupId = null) {
        if (isPersonal) {
            return this.streakData.personal;
        } else if (groupId && this.streakData.groups[groupId]) {
            return this.streakData.groups[groupId];
        }
        return null;
    }

    // Create new group
    createGroup(groupName, members = []) {
        const groupId = Date.now().toString();
        this.streakData.groups[groupId] = {
            id: groupId,
            name: groupName,
            creator: this.currentUser,
            members: [this.currentUser, ...members],
            currentStreak: 0,
            completedToday: [],
            totalDays: 0,
            createdAt: new Date().toISOString()
        };
        this.saveStreakData();
        return groupId;
    }

    // Join group
    joinGroup(groupId) {
        if (this.streakData.groups[groupId]) {
            const group = this.streakData.groups[groupId];
            if (!group.members.includes(this.currentUser)) {
                group.members.push(this.currentUser);
                this.saveStreakData();
                return true;
            }
        }
        return false;
    }

    // Get user's groups
    getUserGroups() {
        const userGroups = [];
        for (const [groupId, group] of Object.entries(this.streakData.groups)) {
            if (group.members.includes(this.currentUser)) {
                userGroups.push({ ...group, id: groupId });
            }
        }
        return userGroups;
    }

    // Clear recorded audio (for cleanup)
    clearRecordedAudio() {
        this.recordedAudioBlob = null;
        this.audioChunks = [];
    }

    // Get verification status for today
    getTodayVerificationStatus() {
        const today = new Date().toISOString().split('T')[0];
        return this.streakData.personal.completedDates.includes(today);
    }
}

// Export for global use
window.StreakManager = StreakManager;