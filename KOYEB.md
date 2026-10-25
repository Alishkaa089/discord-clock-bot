# Koyeb-ə deploy (pulsuz 24/7)

## 1. GitHub repo yarat və kodu push et

```powershell
cd "C:\Users\Ali\discord-clock-bot"
git init
git add .
git commit -m "Initial commit"
gh auth login          # brauzer açılır, GitHub-a daxil ol
gh repo create discord-clock-bot --public --source=. --push
```

## 2. Koyeb hesabı

- https://www.koyeb.com → Sign up (GitHub ilə daxil olmaq asandır).

## 3. Yeni app yarat

- Dashboard → Create App → **GitHub** → repo seç (`discord-clock-bot`).
- Builder: **Dockerfile** (avtomatik aşkarlanır) — Build command boş buraxın.
- Instance: **Eco (free)** seçin.
- Region: sizə yaxın (məs. Frankfurt).
- **Environment variables** (Secrets):
  - `DISCORD_TOKEN` = bot token
  - `GUILD_ID` = server ID
  - `CHANNEL_ID` = ses kanalı ID
  - `TIMEZONE` = `Asia/Baku`
  - `UPDATE_INTERVAL_MS` = `600000`
- Service type: **Worker** seçin (Web yox) — port tələb olunmur. Əgər yalnız "Web" varsa, env-ə `PORT=8080` əlavə edin və kodda kiçik HTTP server açın (aşağıya bax).

## 4. Deploy

- **Deploy** düyməsinə basın. Log-ları izləyin: `[bot] logged in as ...` və `[voice] connected` görünməlidir.

## 5. Yoxlama

- Discord-da ses kanalının adı `🕐 HH:MM` formatında yenilənməlidir.
- Koyeb Dashboard-da app "Healthy/Running" statusunda olmalıdır.

## Əgər "port listening" xətası verərsə

Koyeb bəzi hallarda HTTP port gözləyir. `src/index.js`-in sonuna (client.login-dən əvvəl) əlavə edin:

```js
const http = require('http');
http.createServer((_, res) => { res.writeHead(200); res.end('ok'); }).listen(process.env.PORT || 8080);
```

Sonra yenidən push edin — Koyeb avtomatik redeploy edəcək.

## Problemlər

- **Bot offline qalır:** Koyeb log-larına baxın; token/env düzgündürmü?
- **Channel rename 429:** `UPDATE_INTERVAL_MS`-i artırın (min 600000).
- **Sleep:** Koyeb Eco instance-lar uzun inaktivlikdə sleep edə bilər. Əgər sleep edirsə, Oracle Cloud Free Tier-ə keçin (ən etibarlı pulsuz variant).
