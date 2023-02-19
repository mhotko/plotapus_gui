from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from plotapus import DataHelper as dh

UPLOAD_FOLDER = r'C:\Users\Asus\Desktop\jupyter\gui\backend\uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'mpr', 'txt', 'csv', 'xls'}


api_v1_cors_config = {
  "origins": ["http://127.0.0.1:5173"],
  "methods": ["OPTIONS", "GET", "POST"],
}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app,resources={r"/*": api_v1_cors_config})

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_json_data(filename):
    return dh(os.path.join(app.config['UPLOAD_FOLDER'], filename)).get_dataframe_json()


@app.route("/upload_file", methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return ('', 500)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return ('', 500)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify(filename=filename, filetype=filename.rsplit('.', 1)[1].lower())

@app.route("/remove_file", methods=['POST'])
def remove_file():
    if request.method == 'POST':
        data = request.get_json()
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], data))
        return ('', 200)

@app.route("/get_data", methods=['POST'])
def get_data():
    if request.method == 'POST':
        data = request.get_json()
        return (get_json_data(data), 200)

if __name__ == "__main__":
    app.run("localhost", 6969, debug=True)