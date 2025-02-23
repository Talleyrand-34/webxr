from flask import Flask, render_template, request, jsonify
import pathlib
from .config import UPLOADS_DIR_NAME

UPLOADS_DIR = pathlib.Path(__file__).parent.parent / UPLOADS_DIR_NAME
UPLOADS_DIR.mkdir(exist_ok=True)

app: Flask = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file.filename.endswith('.wav'):
        file.save(UPLOADS_DIR / file.filename)
        return jsonify({"message": "File uploaded successfully"}), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400

if __name__ == '__main__':
    app.run(debug=True)