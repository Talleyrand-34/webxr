import ossaudiodev
from flask import Flask, render_template, request, jsonify
import pathlib
from .audio import procesar_audio

import wave
import io
#import pdb


UPLOADS_FOLDER = pathlib.Path(__file__).parent / 'uploads'
UPLOADS_FOLDER.mkdir(exist_ok=True)

app = Flask(__name__)

# A simple route to test the app
@app.route('/')
def index():
    print(request)
    # Return index.html
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file() -> (jsonify, int):

    if 'file' not in request.files:
        print(type(request.files['file']))
        return jsonify({"error": "No file part"}), 400

#    pdb.set_trace()

    # Obtenemos el archivo de la petición
    file = request.files['file']

    # Comprobación del tipo de mime recibida del archivo
    print(file.mimetype)
    mime = file.mimetype.split("/")[0]
    print(mime)
    if mime not in ["application", "audio"]:
        return jsonify({"error": "Invalid file type"}), 400

    # Lectura de los datos binarios de entrada del archivo
    data = file.read()
    print((type(data)))

    # Escritura del archivo en memoria
    with open(UPLOADS_FOLDER / file.filename, "wb") as f:
        f.write(data)

    print(f"Successfully received {file.filename}")
    return jsonify(procesar_audio()), 200

#    if file.filename == '':
#        return jsonify({"error": "No selected file"}), 400
#
#    if not file.filename.endswith('.wav'):
#        return jsonify({"error": "Invalid file type"}), 400

#    path_audio = UPLOADS_FOLDER / file.filename
#    file.save(path_audio)

    #frase = transcribir_audio(path_audio)

#    return jsonify({"message": "File uploaded successfully"}), 200