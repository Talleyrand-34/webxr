import whisper
import mimetypes

from .gpt import get_conclusion, get_conversacion_limpia

def es_audio(archivo):
    """Verifica si el archivo es un tipo de audio válido."""
    tipo, _ = mimetypes.guess_type(archivo)
    return tipo and tipo.startswith("audio")


def transcribir_audio(archivo):
    """Transcribe un archivo de audio usando Whisper."""
    if not es_audio(archivo):
        raise ValueError("El archivo no es un audio válido")

    modelo = whisper.load_model("base")  # Puedes cambiar a 'small', 'medium', 'large', etc.
    resultado = modelo.transcribe(archivo)

    return resultado["text"]

def procesar_audio(file_path="/armigo/backend/src/armigo/uploads/recording.aac") -> dict:
    frase = transcribir_audio(file_path)
    conclusion = get_conclusion(frase)
    conversacion = get_conversacion_limpia(conclusion, frase)[0]

    return {"input": frase, "conclusion": conclusion, "conversation": conversacion}

# Ejemplo de uso:
#print(transcribir_audio("/home/sama/Downloads/recording.wav"))