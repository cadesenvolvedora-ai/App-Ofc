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

print("3. Generating updated relatorio-tecnico-android-studio.zip...")
if os.path.exists(ZIP_PATH):
    os.remove(ZIP_PATH)

README_CONTENT = """============================================================
COMO GERAR O APK NO ANDROID STUDIO - RELATÓRIO TÉCNICO KINROSS
============================================================

1. Abra o Android Studio.
2. No menu superior ou tela inicial, clique em:
   File > Open... (ou "Open an Existing Project")
3. Selecione a pasta:
   "android-studio-project" (que está dentro deste pacote extraído)
4. Aguarde o Android Studio sincronizar o Gradle automaticamente.
5. Para gerar o arquivo APK:
   No menu superior, clique em:
   Build > Build Bundle(s) / APK(s) > Build APK(s)
6. Assim que a barra de progresso terminar, aparecerá uma notificação
   no canto inferior direito escrito:
   "APK(s) generated successfully for 1 module: Locate"
7. Clique em "locate" para abrir a pasta com o arquivo:
   app-debug.apk
8. Pronto! Transfira o arquivo app-debug.apk para o celular ou tablet
   Android (via USB, WhatsApp ou Google Drive) e instale diretamente.

TODAS AS ÚLTIMAS MODIFICAÇÕES JÁ ESTÃO EMBUTIDAS 100% OFFLINE NESTE APK:
- Fundo branco limpo com 100% de legibilidade e alto contraste.
- Tabelas técnicas atualizadas:
  * CARCAÇA EIXO INT.2
  * EIXO INTERMEDIÁRIO 2
- Armazenamento permanente protegido contra desconexões e bateria.
- Envio direto para o Gmail oficial com fotos e laudo em alta resolução.
============================================================
"""

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # Add root README
    zipf.writestr('LEIA-ME_COMO_GERAR_APK.txt', README_CONTENT)
    
    # Add android-studio-project files
    for root, dirs, files in os.walk(ANDROID_DIR):
        # Exclude build and cache directories
        dirs[:] = [d for d in dirs if d not in {'.gradle', 'build', '.idea', '.cxx', 'captures'}]
        for file in files:
            if file.endswith('.zip') or file.endswith('.pyc') or file == '.DS_Store':
                continue
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, ROOT_DIR)
            zipf.write(abs_path, rel_path)

print(f"Zip created successfully: {ZIP_PATH} ({os.path.getsize(ZIP_PATH)} bytes)")
