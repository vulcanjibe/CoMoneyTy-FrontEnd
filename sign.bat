apksigner sign --ks my-release-key.keystore F:\Nodejs\CoMoneyTy\platforms\android\build\outputs\apk\android-release-unsigned.apk
pause
cd F:\Nodejs\CoMoneyTy\platforms\android\build\outputs\apk
F:
zipalign -v 4 android-release-unsigned.apk comoneyty.apk
pause
