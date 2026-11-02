import os
import shutil
import zipfile
import subprocess

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
ANDROID_DIR = os.path.join(ROOT_DIR, 'android-studio-project')
ASSETS_DIR = os.path.join(ANDROID_DIR, 'app', 'src', 'main', 'assets')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
ZIP_PATH = os.path.join(PUBLIC_DIR, 'relatorio-tecnico-android-studio.zip')

print("1. Building React application for production...")
subprocess.run(['npm', 'run', 'build'], cwd=ROOT_DIR, check=True)

print("2. Syncing dist/ into android-studio-project assets...")
if os.path.exists(ASSETS_DIR):
    shutil.rmtree(ASSETS_DIR)
os.makedirs(ASSETS_DIR, exist_ok=True)

# Copy all files from dist into ASSETS_DIR
for item in os.listdir(DIST_DIR):
    s = os.path.join(DIST_DIR, item)
    d = os.path.join(ASSETS_DIR, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        if not item.endswith('.zip'):
            shutil.copy2(s, d)

print("3. Removing any residual zip archives from public...")
if os.path.exists(ZIP_PATH):
    os.remove(ZIP_PATH)
print("Android project assets updated successfully!")

