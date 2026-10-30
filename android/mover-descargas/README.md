# Mover Descargas (Android)

Subí acá `mover-descargas-modular-58391-iguana.zip` sin descomprimir.

El workflow `.github/workflows/mover-descargas-apk.yml` extrae el ZIP, compila `assembleDebug` con Java 17, Android SDK 34 y Gradle 8.7, y publica el APK como artifact `mover-descargas-apk`.

Esta carpeta y su workflow están aislados del juego Chess RTS.
