# Docker Setup (Beginner Guide) — Backend-Node

Ye guide bilkul shuruaat wale level ki hai. Docker ka matlab: aapki app ek "box" (container)
mein chalti hai jismein Node aur saari cheezein pehle se hoti hain — to "mere PC par to chalta
tha" wale masle khatam.

---

## 1. Pehli baar: Docker install karo

- Windows/Mac: **Docker Desktop** install karo → https://www.docker.com/products/docker-desktop
- Install ke baad Docker Desktop **khol ke chhod do** (background mein chalta rehna chahiye).
- Check karne ke liye terminal mein:
  ```
  docker --version
  ```
  Agar version print ho jaye to sab theek hai.

---

## 2. `.env` file taiyaar karo

App ko chalne ke liye kuch secrets chahiye (database, jwt, etc.). Ye is folder ki `.env`
file se aate hain.

- Agar `.env` nahi hai to `.env.example` ko copy karke `.env` bana lo aur values bhar do.
- Zaroori values (kam se kam):
  - `MONGODB_URI` — aapka MongoDB connection string (jaise MongoDB Atlas ka).
  - `JWT_SECRET` — koi bhi lamba random text.
  - `PORT` — 8000 (agar badla to niche compose file bhi update karni hogi).

> Note: MongoDB is container ke andar nahi hai — ye maan ke chal rahe hain ke aap ka
> MongoDB (Atlas ya kahin aur) already online hai aur `MONGODB_URI` usi ki hai.

---

## 3. App chalao

### Tareeqa A — sab kuch ek saath (recommended)

`docker-compose.yml` project **root** mein hai (backend + frontend saath).
Root folder mein jao aur:

```
docker compose up --build
```

- Backend: http://localhost:8000/health
- Frontend: http://localhost:8080

Band karne ke liye: **Ctrl + C**, ya `docker compose down`.

### Tareeqa B — sirf backend (plain Docker, isi folder se)

```
# 1) Image banao
docker build -t shop365-api .

# 2) Container chalao (.env se env, port 8000)
docker run --env-file .env -p 8000:8000 shop365-api
```

---

## 4. Code change karne ke baad

Naya code lagane ke liye dobara build karo (root se):

```
docker compose up --build
```

---

## Aksar poche jane wale

- **Port already in use aaye?** → koi aur cheez 8000 par chal rahi hai. `docker-compose.yml`
  mein `"8000:8000"` ko `"8080:8000"` kar lo, phir app http://localhost:8080 par milegi.
- **MongoDB connect na ho?** → `.env` ka `MONGODB_URI` galat hai, ya Atlas mein aapka IP
  allow-list mein nahi. Atlas → Network Access → apna IP (ya 0.0.0.0/0 testing ke liye) add karo.
- **Changes nahi dikh rahe?** → `--build` lagana bhool gaye. `docker compose up --build` chalao.
