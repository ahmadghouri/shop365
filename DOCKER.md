# Docker — Poora Project (Beginner Guide)

Ek hi command se **backend + frontend** dono chal jaate hain.

## 1. Docker install (ek hi baar)

Docker Desktop install karo aur khol ke chhod do (background mein chalta rahe):
https://www.docker.com/products/docker-desktop

Check:
```
docker --version
```

## 2. Backend ki `.env` bharo

`Backend-Node/.env` mein zaroori values honi chahiye:
- `MONGODB_URI` — MongoDB connection string (jaise Atlas)
- `JWT_SECRET` — koi lamba random text
- `PORT` — 8000

(Agar nahi hai to `Backend-Node/.env.example` copy karke `.env` bana lo.)

## 3. Sab chalao

Isi **root** folder mein terminal khol ke:

```
docker compose up --build
```

- Backend  → http://localhost:8000/health
- Frontend → http://localhost:8080

Band karne ke liye: **Ctrl + C**, ya:
```
docker compose down
```

## 4. Code change ke baad

```
docker compose up --build
```

## Aksar poche jane wale

- **Port busy?** Root `docker-compose.yml` mein ports badal lo, jaise `"8000:8000"` →
  `"8001:8000"` (phir backend http://localhost:8001 par).
- **Frontend data na dikhaye?** `Frontend/web.env` ka API URL backend ki taraf hona chahiye,
  aur backend chalu hona chahiye.
- **MongoDB connect na ho?** `Backend-Node/.env` ka `MONGODB_URI` sahi karo; Atlas mein apna
  IP allow-list mein add karo.

## Mobile app?

Mobile (Expo) Docker mein serve nahi hota — dekho `mobile/DOCKER.md`. APK ke liye
`npx eas build` use karo.
