import React, { useState, useRef } from "react";
import transvox from './assets/transVox.png';
import './App.css';
import Dropdown from './adds/dropdown';

function App() {
  const [record, setRecord] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  // Définition d'une langue cible par défaut (par exemple, English)
  const [targetLang, setTargetLang] = useState<string>('en_XX');
  const [loading, setLoading] = useState(false); // Etat pour gérer le chargement (spinner)
  const [isSpeaking, setIsSpeaking] = useState(false); // Etat pour savoir si le texte est en train d'être lu

  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // 🎤 Démarrer l'enregistrement
  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        sendAudioToBackend(audioBlob);
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setRecord(true);
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone :", error);
    }
  };

  // ⏹️ Arrêter l'enregistrement
  const stopRecord = () => {
    mediaRecorder.current?.stop();
    setRecord(false);
  };

  // 📂 Importer un fichier audio
  const Uploader = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      sendFileToBackend(file);
    }
  };

  // 🚀 Envoyer un fichier audio enregistré au backend
  const sendAudioToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    await transcribeAudio(formData);
  };

  // 🚀 Envoyer un fichier audio importé au backend
  const sendFileToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await transcribeAudio(formData);
  };

  // 🔄 Transcription du fichier via le backend
  const transcribeAudio = async (formData: FormData) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/transcribe/", {  // Chemin relatif
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.text) {
        setTranscription(data.text);
      } else {
        setTranscription("⚠️ Erreur lors de la transcription.");
      }
    } catch (error) {
      console.error("Erreur de transcription :", error);
      setTranscription("⚠️ Erreur lors de l'envoi du fichier.");
    }
  };

  // 🚀 Traduction du texte via le backend
  const translateText = async () => {
    if (!transcription.trim()) {
      setTranslatedText("⚠️ Veuillez entrer un texte à traduire.");
      return;
    }
    setLoading(true); // Afficher le spinner

    try {
      const response = await fetch("http://127.0.0.1:8000/translate/", {  // Chemin relatif
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcription,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur de traduction.");
      }

      const data = await response.json();
      // On vérifie que la réponse contient bien le champ "translation"
      setTranslatedText(data.translation || "⚠️ Erreur lors de la traduction.");
    } catch (error) {
      console.error("Erreur de traduction :", error);
      setTranslatedText("⚠️ Erreur lors de la traduction.");
    }finally {
      setLoading(false); // Cacher le spinner après la traduction
    }
  };

  // 🚀 Text-to-Speech : Lire le texte traduit à haute voix
  const readTextToSpeech = () => {
    if (translatedText.trim() === "") {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    // Définir la langue du texte traduit
    utterance.lang = targetLang.split("_")[0]; // Utilisation du préfixe de la langue cible
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false); // Réinitialiser l'état une fois la lecture terminée

    // Lire le texte
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <div className='row'>
        <img src={transvox} className="logo tv" alt="TransVox logo" />
        <h2 className="underlight">Welcome to the TransVox page!</h2>
      </div>

      <h2>----------- Text Translation -----------</h2>
      <div className='enter'>
        <textarea
          className='input'
          placeholder='Enter your text here'
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
        />
        <div className='option'>
          <button className='btn' onClick={translateText}>
            Translate to: {targetLang}
          </button>
          <section className='select'>
            <Dropdown
              selectedLang={targetLang}
              setSelectedLang={setTargetLang}
            />
          </section>
        </div>
      </div>
      {/* Affichage du spinner pendant la traduction */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      <div className='out'>
        <h4>Translated Text:</h4>
        <output>{translatedText}</output>
      </div>

      {/* Bouton pour Text-to-Speech */}
      <button className='btn' onClick={readTextToSpeech} disabled={isSpeaking || !translatedText}>
          {isSpeaking ? "Speaking..." : "Listen to Translation"}
        </button>
      

      <h2>----------- Audio Transcription -----------</h2>
      <div className='enter'>
        <section className='option mg_r'>
          <button className='btn' onClick={record ? stopRecord : startRecord}>
            {record ? "Stop" : "Record audio"}
          </button>
          <input type="file" accept="audio/*" onChange={Uploader} className="btn ht" />
          <button
            className="btn"
            onClick={translateText}
            disabled={!audioURL}>
            Transcript
          </button>
        </section>
      </div>

      <h2>Thanks for trying TransVox. </h2>
    </>
  );
}

export default App;
