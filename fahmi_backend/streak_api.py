from flask import Blueprint, request, jsonify
import google.generativeai as genai
import speech_recognition as sr
import io
import base64
from pydub import AudioSegment
import tempfile
import os

# Configure Gemini AI
genai.configure(api_key="YOUR_GEMINI_API_KEY")  # Ganti dengan API key Anda

streak_bp = Blueprint('streak', __name__)

@streak_bp.route('/verify-recitation', methods=['POST'])
def verify_recitation():
    try:
        data = request.json
        audio_base64 = data.get('audio')
        expected_arabic = data.get('expected_arabic')
        translation = data.get('translation')
        
        # Decode audio from base64
        audio_data = base64.b64decode(audio_base64)
        
        # Convert to WAV format for speech recognition
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_segment.export(temp_file.name, format='wav')
            temp_path = temp_file.name
        
        try:
            # Use speech recognition to convert audio to text
            recognizer = sr.Recognizer()
            with sr.AudioFile(temp_path) as source:
                audio = recognizer.record(source)
                
            # Try to recognize Arabic speech (you might need to install additional language packs)
            try:
                recognized_text = recognizer.recognize_google(audio, language='ar')
            except sr.UnknownValueError:
                recognized_text = ""
            except sr.RequestError:
                return jsonify({
                    'success': False,
                    'confidence': 0,
                    'feedback': 'Terjadi kesalahan dalam pengenalan suara.'
                })
            
            # Use Gemini to compare the recognized text with expected Arabic
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            Analyze if the recognized Arabic text matches the expected Quranic verse.
            
            Expected Arabic: {expected_arabic}
            Recognized Arabic: {recognized_text}
            Translation: {translation}
            
            Consider:
            1. Phonetic similarity (Arabic pronunciation variations)
            2. Missing or additional words
            3. Overall accuracy
            
            Respond with JSON format:
            {{
                "success": boolean (true if 70% or more match),
                "confidence": number (0-100),
                "feedback": "encouraging message in Indonesian"
            }}
            """
            
            response = model.generate_content(prompt)
            
            # Parse Gemini response
            import json
            try:
                result = json.loads(response.text)
            except:
                # Fallback if JSON parsing fails
                similarity_score = calculate_similarity(expected_arabic, recognized_text)
                result = {
                    "success": similarity_score > 0.7,
                    "confidence": int(similarity_score * 100),
                    "feedback": "Mashaa Allah! Bacaan Anda baik." if similarity_score > 0.7 else "Terus berlatih, bacaan semakin baik!"
                }
            
            return jsonify(result)
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
            
    except Exception as e:
        return jsonify({
            'success': False,
            'confidence': 0,
            'feedback': f'Terjadi kesalahan: {str(e)}'
        })

def calculate_similarity(text1, text2):
    """Simple similarity calculation as fallback"""
    if not text1 or not text2:
        return 0.0
    
    # Remove spaces and normalize
    text1 = text1.replace(' ', '').strip()
    text2 = text2.replace(' ', '').strip()
    
    if text1 == text2:
        return 1.0
    
    # Calculate basic similarity
    longer = text1 if len(text1) > len(text2) else text2
    shorter = text2 if len(text1) > len(text2) else text1
    
    if len(longer) == 0:
        return 1.0
    
    # Simple character-based similarity
    matches = sum(1 for a, b in zip(shorter, longer) if a == b)
    return matches / len(longer)

@streak_bp.route('/daily-verse', methods=['GET'])
def get_daily_verse():
    """Get daily verse - this could be enhanced with more logic"""
    import random
    from datetime import date
    
    # Use date as seed for consistent daily verse
    today = date.today()
    random.seed(today.toordinal())
    
    # Select random surah and ayat
    surah_number = random.randint(1, 114)
    
    try:
        # Load surah data
        import json
        with open(f'surah/{surah_number}.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
            surah_data = data[str(surah_number)]
            
        total_ayat = int(surah_data['number_of_ayah'])
        ayat_number = random.randint(1, total_ayat)
        
        verse = {
            'date': today.isoformat(),
            'surah': {
                'number': surah_number,
                'name': surah_data['name'],
                'name_latin': surah_data['name_latin']
            },
            'ayat': {
                'number': ayat_number,
                'arabic': surah_data['text'][str(ayat_number)],
                'translation': surah_data['translations']['id']['text'][str(ayat_number)],
                'tafsir': surah_data.get('tafsir', {}).get('id', {}).get('kemenag', {}).get('text', {}).get(str(ayat_number), '')
            }
        }
        
        return jsonify(verse)
        
    except Exception as e:
        # Fallback verse
        return jsonify({
            'date': today.isoformat(),
            'surah': {'number': 1, 'name': 'الفاتحة', 'name_latin': 'Al-Fatihah'},
            'ayat': {
                'number': 1,
                'arabic': 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
                'translation': 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
                'tafsir': 'Basmalah adalah kalimat pembuka yang penuh keberkahan.'
            }
        })