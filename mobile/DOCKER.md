# Mobile app aur Docker — parho pehle

Chhoti si imaandar baat: **mobile app (Expo/React Native) ko Docker mein "chalane" ka koi
faida nahi**, aur normal tareeqe se ye Docker mein serve nahi hota.

## Kyun?

- Backend/Frontend **web servers** hain — wo ek container mein chal ke ek URL/port dete hain.
  Isi liye unka Docker sense banta hai.
- Mobile app ek **phone application** hai (APK/IPA). Ye kisi port par "serve" nahi hoti —
  ye user ke phone par install hoti hai. Docker container ke andar phone/emulator nahi hota.

## To phir build/run kaise?

- **APK banane ke liye** (jo aap already kar chuke ho) — EAS use karo, Docker nahi:
  ```
  npx eas build --platform android --profile preview
  ```
- **Development ke liye** (live testing):
  ```
  npx expo start
  ```
  Phir Expo Go app / dev client se QR scan karke phone par chalao.

## Docker ka sirf itna role (optional, mostly CI ke liye)

Agar kisi **automated server (CI)** par consistent Node environment chahiye jahan se `eas build`
trigger ho, to wahan ek Node image use ki ja sakti hai. Lekin ye "app run" nahi hai — ye sirf
build ko trigger karne wala tooling hai, aur zyadatar log ise seedha EAS cloud par chalate hain.
Aam use ke liye iski zaroorat nahi.

## Khulasa

- Backend  → Docker ✔  (dekho `Backend-Node/DOCKER.md`)
- Frontend → Docker ✔  (dekho `Frontend/DOCKER.md`)
- Mobile   → Docker ✖  → EAS (`eas build`) / `expo start` use karo.
