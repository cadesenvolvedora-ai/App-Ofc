# Como Abrir e Gerar o APK no Android Studio

Este projeto contém a aplicação completa pronta para ser compilada como um aplicativo nativo Android no Android Studio.

## Opção 1: Abrir diretamente a pasta `android-studio-project` no Android Studio

1. Baixe e extraia este arquivo ZIP no seu computador.
2. Abra o **Android Studio**.
3. No menu inicial, clique em **File > Open** (ou "Open an Existing Project").
4. Selecione a pasta **`android-studio-project`** que está dentro do ZIP extraído.
5. Aguarde o Gradle sincronizar as dependências (Sync Project with Gradle Files).
6. Para gerar o APK:
   - Vá no menu superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Assim que terminar, aparecerá uma notificação no canto inferior direito com o link **"locate"**.
   - Clique nele para encontrar o arquivo `app-debug.apk` pronto para instalar no celular!

---

## Opção 2: Gerar os arquivos estáticos locais (Offline)

Caso deseje embutir todo o código React offline direto dentro do APK sem precisar de internet:
1. Na pasta principal do projeto React:
   ```bash
   npm install
   npm run build
   ```
2. Copie todo o conteúdo da pasta gerada `dist/` para dentro de:
   `android-studio-project/app/src/main/assets/`
3. No arquivo `MainActivity.java`, descomente a linha:
   `myWebView.loadUrl("file:///android_asset/index.html");`
4. Compile o projeto no Android Studio (**Build > Build APK**).
