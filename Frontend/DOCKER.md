# Docker — Frontend (Vue)

Frontend ka apna `docker-compose` nahi hai. Sab kuch **project root** ke ek hi
`docker-compose.yml` se chalta hai (backend + frontend saath).

## Sirf frontend ki image (bina compose)

Isi `Frontend` folder mein:

```
# Image banao
docker build -t shop365-frontend .

# Chalao — browser: http://localhost:8080
docker run -p 8080:4173 shop365-frontend
```

## Sab kuch ek saath chalane ke liye

Project **root** folder mein jao aur wahan ka `DOCKER.md` parho, ya seedha:

```
docker compose up --build
```

## Notes

- nginx use nahi ho raha; built app ko `vite preview` (Node) serve karta hai (port 4173,
  compose mein 8080 par map).
- Build ke waqt `web.env` ka API URL use hota hai (build script `cp web.env .env` karta hai).
  API URL badlo to `web.env` update karke dobara `--build` karo.
