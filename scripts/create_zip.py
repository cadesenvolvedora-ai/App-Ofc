import os
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
ZIP_PATH = os.path.join(PUBLIC_DIR, 'relatorio-tecnico-android-studio.zip')

print(f"Creating zip from root: {ROOT_DIR}")

# Exclude patterns
EXCLUDE_DIRS = {'node_modules', '.git', 'dist', '.cache', '__pycache__'}
EXCLUDE_FILES = {'.DS_Store', 'relatorio-tecnico-android-studio.zip'}

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(ROOT_DIR):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
        
        for file in files:
            if file in EXCLUDE_FILES or file.endswith('.pyc') or file.endswith('.zip'):
                continue
            abs_file = os.path.join(root, file)
            rel_path = os.path.relpath(abs_file, ROOT_DIR)
            zipf.write(abs_file, os.path.join('relatorio-manutencao-app', rel_path))

print(f"Zip created successfully at: {ZIP_PATH} ({os.path.getsize(ZIP_PATH)} bytes)")
