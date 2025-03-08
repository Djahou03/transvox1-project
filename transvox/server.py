from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import speech_recognition as sr
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
from langdetect import detect
import tempfile
import io

app = FastAPI()

# Middleware CORS pour autoriser toutes les origines (ou personnaliser selon besoin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger le modèle mBART-50 pour la traductioncd
model_name = "facebook/mbart-large-50-many-to-many-mmt"
tokenizer = MBart50TokenizerFast.from_pretrained(model_name)
model = MBartForConditionalGeneration.from_pretrained(model_name)

# Mapping entre langdetect et les codes de langue mBART-50
LANG_MAP = {
    "fr": "fr_XX", "en": "en_XX", "es": "es_XX", "de": "de_DE", "it": "it_IT",
    "pt": "pt_XX", "nl": "nl_XX", "ar": "ar_AR", "zh-cn": "zh_CN", "ru": "ru_RU",
    "hi": "hi_IN", "sw": "sw_KE", "tr": "tr_TR", "pl": "pl_PL"
}

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = None  # Facultatif : sera détecté si non fourni
    target_lang: str

@app.post("/translate/")
async def translate_text(request: TranslationRequest):
    text = request.text.strip()
    
    # Détection automatique de la langue source si non fournie
    if request.source_lang is None:
        detected_lang = detect(text)
        source_lang = LANG_MAP.get(detected_lang)
        if source_lang is None:
            raise HTTPException(status_code=400, detail=f"Langue détectée ({detected_lang}) non supportée.")
    else:
        source_lang = request.source_lang

    # Debug logs
    print("Texte à traduire :", text)
    print("Langue source :", source_lang)
    print("Langue cible :", request.target_lang)

    # Vérifier que les codes de langue existent dans le tokenizer
    if source_lang not in tokenizer.lang_code_to_id or request.target_lang not in tokenizer.lang_code_to_id:
        raise HTTPException(status_code=400, detail="Langue source ou cible invalide.")

    # Définir la langue source pour le tokenizer
    tokenizer.src_lang = source_lang

    # Encodage du texte et génération de la traduction
    encoded_text = tokenizer(text, return_tensors="pt")
    generated_tokens = model.generate(
        **encoded_text,
        forced_bos_token_id=tokenizer.lang_code_to_id[request.target_lang]
    )
    translated_text = tokenizer.decode(generated_tokens[0], skip_special_tokens=True).strip()

    print("Texte traduit :", translated_text)
    return {"source_lang": source_lang, "translation": translated_text}


