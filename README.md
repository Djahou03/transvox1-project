# TransVox

TransVox est une application de traduction automatique et de transcription vocale. Elle permet de convertir de l'audio en texte et de traduire ce texte dans plusieurs langues en utilisant des modèles de traitement du langage naturel (NLP).

## Fonctionnalités

- Enregistrement audio et transcription en texte via le backend.
- Traduction automatique du texte avec un modèle NLP (mBART-50).
- Lecture du texte traduit via Text-to-Speech.

## Architecture

- **Backend** : API FastAPI pour gérer la traduction et la transcription.
- **Frontend** : Application React pour l'interface utilisateur, avec un gestionnaire de langue et de traduction.
- **Modèles NLP** : Utilisation de `mBART-50` pour la traduction automatique.

## Installation

1. Clonez le repository :
    ```bash
    git clone https://github.com/username/transvox-project.git
    ```



2. Lancez le serveur backend :
    ```bash
    uvicorn server:app --reload
    ```

3. Démarrez le frontend avec React :
    ```bash
    npm run dev 
    ```

## Utilisation

1. Enregistrez votre audio ou importez un fichier audio.
2. Cliquez sur "Translate" pour obtenir la traduction du texte.
3. Cliquez sur "Text-to-Speech" pour écouter la traduction.

