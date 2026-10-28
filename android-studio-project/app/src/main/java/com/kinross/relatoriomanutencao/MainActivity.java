package com.kinross.relatoriomanutencao;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.content.res.Configuration;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;
    private final static int FILE_CHOOSER_RESULT_CODE = 1001;
    private final static int PERMISSION_REQUEST_CODE = 1002;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        requestAppPermissions();
        configureWebView();

        // Só recarrega a URL se não houver estado previamente salvo (evita reset ao plugar carregador)
        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            // Carrega o aplicativo 100% puro e offline direto da memória interna do APK (sem depender de URL ou internet)
            webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        }
    }

    private void requestAppPermissions() {
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions = new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.READ_MEDIA_IMAGES
            };
        } else {
            permissions = new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
            };
        }

        boolean allGranted = true;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        // Adiciona ponte nativa Android para salvar PDF e abrir app oficial do Gmail diretamente
        webView.addJavascriptInterface(new AndroidBridge(), "Android");

        // Interceptador oficial AndroidX: carrega os arquivos HTML/JS/CSS locais de assets sem precisar de internet
        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("mailto:")) {
                    try {
                        Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                        emailIntent.setData(Uri.parse(url));
                        // Direciona especificamente para o aplicativo Gmail instalado no tablet
                        emailIntent.setPackage("com.google.android.gm");
                        startActivity(emailIntent);
                        return true;
                    } catch (Exception e) {
                        try {
                            Intent genericIntent = new Intent(Intent.ACTION_SENDTO);
                            genericIntent.setData(Uri.parse(url));
                            startActivity(Intent.createChooser(genericIntent, "Enviar Relatório Técnico"));
                            return true;
                        } catch (Exception ex) {
                            Toast.makeText(MainActivity.this, "Erro ao abrir aplicativo de e-mail", Toast.LENGTH_SHORT).show();
                        }
                    }
                    return true;
                } else if (url.startsWith("tel:")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            // Concede permissão de câmera e mídia local automaticamente para o app
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }

            // Suporte completo à câmera e upload de fotos no formulário
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                    uploadMessage = null;
                }

                uploadMessage = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE);
                } catch (Exception e) {
                    uploadMessage = null;
                    return false;
                }
                return true;
            }
        });
    }

    /**
     * Ponte JavaScript nativa para comunicação com a interface Web
     */
    public class AndroidBridge {

        @JavascriptInterface
        public void sendEmailWithPdf(final String recipient, final String subject, final String body, final String base64Pdf, final String filename) {
            runOnUiThread(() -> {
                try {
                    byte[] pdfBytes = android.util.Base64.decode(base64Pdf, android.util.Base64.DEFAULT);

                    // Salva arquivo no diretório de cache acessível pelo FileProvider
                    File cacheFolder = new File(getCacheDir(), "relatorios_pdf");
                    if (!cacheFolder.exists()) {
                        cacheFolder.mkdirs();
                    }
                    File pdfFile = new File(cacheFolder, filename != null && !filename.isEmpty() ? filename : "Relatorio_Tecnico.pdf");
                    FileOutputStream fos = new FileOutputStream(pdfFile);
                    fos.write(pdfBytes);
                    fos.flush();
                    fos.close();

                    Uri contentUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getApplicationContext().getPackageName() + ".fileprovider",
                            pdfFile
                    );

                    Intent sendIntent = new Intent(Intent.ACTION_SEND);
                    sendIntent.setType("application/pdf");
                    if (recipient != null && !recipient.isEmpty()) {
                        String[] recipients = recipient.split("[,;]");
                        for (int i = 0; i < recipients.length; i++) {
                            recipients[i] = recipients[i].trim();
                        }
                        sendIntent.putExtra(Intent.EXTRA_EMAIL, recipients);
                    }
                    sendIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
                    sendIntent.putExtra(Intent.EXTRA_TEXT, body);
                    sendIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                    // Tenta abrir diretamente com o Gmail oficial
                    Intent gmailIntent = new Intent(sendIntent);
                    gmailIntent.setPackage("com.google.android.gm");

                    // Concede permissão temporária de leitura para o pacote do Gmail
                    grantUriPermission("com.google.android.gm", contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION);

                    try {
                        startActivity(gmailIntent);
                    } catch (Exception ex) {
                        // Se o pacote específico falhar, abre seletor com permissão concedida
                        startActivity(Intent.createChooser(sendIntent, "Enviar Relatório via Gmail"));
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(MainActivity.this, "Erro ao preparar anexo no Gmail: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    // Fallback para envio simples
                    openGmail(recipient, subject, body);
                }
            });
        }

        @JavascriptInterface
        public void openGmail(final String recipient, final String subject, final String body) {
            runOnUiThread(() -> {
                try {
                    Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                    emailIntent.setData(Uri.parse("mailto:" + Uri.encode(recipient)));
                    emailIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
                    emailIntent.putExtra(Intent.EXTRA_TEXT, body);
                    // Força abertura no app oficial do Gmail instalado no Tablet
                    emailIntent.setPackage("com.google.android.gm");
                    startActivity(emailIntent);
                } catch (Exception e) {
                    try {
                        Intent fallbackIntent = new Intent(Intent.ACTION_SENDTO);
                        fallbackIntent.setData(Uri.parse("mailto:" + Uri.encode(recipient) +
                                "?subject=" + Uri.encode(subject) +
                                "&body=" + Uri.encode(body)));
                        startActivity(Intent.createChooser(fallbackIntent, "Enviar Relatório Técnico"));
                    } catch (Exception ex) {
                        Toast.makeText(MainActivity.this, "Erro ao abrir aplicativo de e-mail", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        @JavascriptInterface
        public void savePdf(final String base64Data, final String filename) {
            runOnUiThread(() -> {
                try {
                    byte[] pdfBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);

                    Uri fileUri = null;

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                        values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                        values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                        fileUri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                        if (fileUri != null) {
                            OutputStream os = getContentResolver().openOutputStream(fileUri);
                            if (os != null) {
                                os.write(pdfBytes);
                                os.flush();
                                os.close();
                            }
                        }
                    } else {
                        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                        if (!downloadsDir.exists()) {
                            downloadsDir.mkdirs();
                        }
                        File file = new File(downloadsDir, filename);
                        FileOutputStream fos = new FileOutputStream(file);
                        fos.write(pdfBytes);
                        fos.flush();
                        fos.close();
                        fileUri = Uri.fromFile(file);
                    }

                    Toast.makeText(MainActivity.this, "PDF salvo com sucesso na pasta Downloads!", Toast.LENGTH_LONG).show();

                    if (fileUri != null) {
                        try {
                            Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                            viewIntent.setDataAndType(fileUri, "application/pdf");
                            viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            startActivity(Intent.createChooser(viewIntent, "Abrir Relatório PDF"));
                        } catch (Exception ignored) {
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(MainActivity.this, "Erro ao salvar arquivo PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (uploadMessage == null) return;

            Uri[] results = null;
            if (resultCode == RESULT_OK) {
                if (data != null) {
                    // 1. Tenta extrair múltiplos arquivos selecionados via ClipData (galeria de fotos)
                    ClipData clipData = data.getClipData();
                    if (clipData != null && clipData.getItemCount() > 0) {
                        ArrayList<Uri> urisList = new ArrayList<>();
                        for (int i = 0; i < clipData.getItemCount(); i++) {
                            Uri uri = clipData.getItemAt(i).getUri();
                            if (uri != null) {
                                urisList.add(uri);
                            }
                        }
                        if (!urisList.isEmpty()) {
                            results = urisList.toArray(new Uri[0]);
                        }
                    }

                    // 2. Se for seleção de arquivo único com dataUri
                    if (results == null && data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    }
                }

                // 3. Se o data for nulo ou vazio, utiliza método padrão do FileChooserParams
                if (results == null) {
                    results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                }
            }

            uploadMessage.onReceiveValue(results);
            uploadMessage = null;
        }
    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Garante que rotação de tela, conexão do carregador ou modo docking não reiniciem a WebView
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onRestoreInstanceState(@NonNull Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        if (webView != null) {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().flush();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
