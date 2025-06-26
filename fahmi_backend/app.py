# app.py (Versi Final dengan Prompt AI yang Diperbaiki)

import os
import json
import re
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from streak_api import streak_bp

load_dotenv()
app = Flask(__name__)
CORS(app)

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Error konfigurasi Gemini API: {e}")


app.register_blueprint(streak_bp, url_prefix='/api/streak')

# =====================================================================
# BAGIAN CHATBOT FAHMI (TIDAK ADA PERUBAHAN)
# =====================================================================
SYSTEM_PROMPT_FAHMI = """
Anda adalah "Fahmi", sebuah asisten AI yang ahli dalam ilmu Islam...
""" # (Isi sama seperti sebelumnya)

@app.route('/api/chat', methods=['POST'])
def chat_handler():
    # ... (Fungsi ini tetap sama)
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "Request tidak valid. 'prompt' tidak ditemukan."}), 400
    user_prompt = data['prompt']
    try:
        full_prompt = f"{SYSTEM_PROMPT_FAHMI}\n\nPertanyaan Pengguna: {user_prompt}"
        model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')
        response = model.generate_content(full_prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": "Terjadi kesalahan pada server saat memproses permintaan Anda."}), 500

# =====================================================================
# ENDPOINT HASANAH (DENGAN PROMPT AI YANG DIPERBAIKI TOTAL)
# =====================================================================

# !!! INI ADALAH PERUBAHAN PALING PENTING !!!
SYSTEM_PROMPT_HASANAH = """
ANDA ADALAH SEBUAH API GENERATOR JSON.
Peran Anda adalah menganalisis teks ayat Al-Qur'an dan mengembalikan daftar amalan dalam format JSON yang ketat.

ATURAN PALING PENTING:
1.  OUTPUT WAJIB dan HANYA berupa string JSON yang valid.
2.  JANGAN PERNAH menulis teks salam, penjelasan, atau kesimpulan di luar struktur JSON. Seluruh jawaban Anda harus bisa langsung di-parse oleh `json.loads()` di Python.
3.  Struktur JSON HARUS seperti ini:
    {
      "habits": [
        {
          "title": "Judul Amalan Singkat dan Menarik",
          "description": "Penjelasan 1-2 kalimat yang memotivasi, menjelaskan cara melakukan amalan, dan kaitannya dengan ayat.",
          "verse_reference": "Referensi ayat spesifik, contoh: QS. Al-Baqarah: 255"
        }
      ]
    }
4.  Hasilkan 3 sampai 4 saran amalan yang praktis dan relevan dari ayat yang diberikan.

Sekarang, analisis ayat-ayat berikut dan berikan output dalam format JSON yang telah ditentukan tanpa teks tambahan apapun.
"""

@app.route('/api/generate-habits', methods=['POST'])
def generate_habits_handler():
    # ... (Fungsi lainnya tetap sama seperti versi sebelumnya)
    data = request.get_json()
    if not data or not all(k in data for k in ['surah_number', 'start_ayah', 'end_ayah']):
        return jsonify({"error": "Request tidak valid. 'surah_number', 'start_ayah', 'end_ayah' dibutuhkan."}), 400

    try:
        surah_num = int(data['surah_number'])
        start_ayah = int(data['start_ayah'])
        end_ayah = int(data['end_ayah'])

        file_path = os.path.join('surah', f'{surah_num}.json')
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = json.load(f)
        except FileNotFoundError:
            return jsonify({"error": f"File untuk surah nomor {surah_num} tidak ditemukan di server."}), 404
        
        surah_key = str(surah_num)
        surah_obj = file_content.get(surah_key)

        if not surah_obj:
            return jsonify({"error": f"Struktur data tidak valid dalam file {surah_num}.json. Key '{surah_key}' tidak ditemukan."}), 500

        surah_name_latin = surah_obj.get('name_latin', f'Surah {surah_num}')
        arabic_texts_obj = surah_obj.get('text', {})
        indonesian_texts_obj = surah_obj.get('translations', {}).get('id', {}).get('text', {})
        
        verses_text = []
        for i in range(start_ayah, end_ayah + 1):
            verse_key = str(i)
            arabic_text = arabic_texts_obj.get(verse_key, '[Teks Arab tidak tersedia]')
            indonesian_text = indonesian_texts_obj.get(verse_key, '[Terjemahan tidak tersedia]')
            verses_text.append(f"QS. {surah_name_latin}:{i}\nArab: {arabic_text}\nTerjemahan: {indonesian_text}\n")
        
        if not verses_text:
             return jsonify({"error": "Ayat tidak ditemukan dalam rentang yang diberikan."}), 404

        verses_content = "\n".join(verses_text)
        
        full_prompt = f"{SYSTEM_PROMPT_HASANAH}\n\nBerikut adalah ayat-ayat yang perlu dianalisis:\n\n{verses_content}"
        
        model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')
        response = model.generate_content(full_prompt)
        
        print("="*50)
        print("RESPONS MENTAH DARI GEMINI API (DENGAN PROMPT BARU):")
        print(response.text)
        print("="*50)
        
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        
        if not match:
             raise json.JSONDecodeError("Blok JSON tidak ditemukan dalam respons AI.", response.text, 0)

        json_string = match.group(0)
        habits_json = json.loads(json_string)

        return jsonify(habits_json)

    except json.JSONDecodeError as e:
        error_message = f"Gagal mem-parsing JSON dari AI. Coba lagi. (Detail: {e})"
        print(error_message)
        return jsonify({"error": error_message}), 500
    except Exception as e:
        print(f"Error di generate_habits_handler: {e}")
        return jsonify({"error": "Terjadi kesalahan internal pada server."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)