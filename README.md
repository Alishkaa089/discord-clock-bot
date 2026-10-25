# Discord Saat Botu (Clock Bot)

Ses kanalına qoşulur, kanalın adını cari saatla yeniləyir və 24/7 orada qalır (internet kəsilsə belə avtomatik yenidən qoşulur).

## Qurulum

1. Node.js 18+ quraşdırın (artıq var).
2. Discord Developer Portal-da bot yaradın:
   - https://discord.com/developers/applications → New Application
   - Bot → Add Bot → token-i kopyalayın
   - Privileged Gateway Intents: **Server Members** və **Message Content** lazım deyil, amma **Guilds** aktiv olmalıdır (default).
   - OAuth2 → URL Generator: scopes: `bot`, permissions: `Connect`, `Speak`, `Manage Channels`, `View Channels`.
   - Yaranan linklə botu serverinizə əlavə edin.
3. `.env.example`-i `.env` adıyla kopyalayın və doldurun:
   ```
   DISCORD_TOKEN=...
   GUILD_ID=server_id
   CHANNEL_ID=ses_kanali_id
   TIMEZONE=Asia/Baku
   UPDATE_INTERVAL_MS=600000
   ```
   ID-ləri əldə etmək: Discord-da Developer Mode-u aktiv edin (Settings → Advanced → Developer Mode), kanal/server üzərinə sağ klik → Copy ID.
4. Asılılıqları quraşdırın:
   ```
   npm install
   ```
5. İşə salın:
   ```
   npm start
   ```

## 24/7 işləmək (kompüter söndükdə belə)

Bot yalnız işləyən kompüterdə aktivdir. 24/7 üçün hostinq lazımdır:

- **Pulsuz / ucuz variantlar:** Railway, Render, Fly.io, Oracle Cloud Free Tier.
- **PM2 ilə VPS-də:** `npm install -g pm2` sonra `pm2 start src/index.js --name clock-bot` və `pm2 save && pm2 startup`.
- **Windows-da avto-başlama:** Task Scheduler ilə `npm start` əlavə edin.

## Məhdudiyyətlər

- Discord kanal adını çox tez-tez dəyişməyə icazə vermir (rate limit). Buna görə default olaraq hər 10 dəqiqədən bir yenilənir. `UPDATE_INTERVAL_MS` ilə dəyişə bilərsiniz, amma 60000-dən (1 dəq) aşağı qoymayın, əks halda 429 xətası alacaqsınız.
- Kanal adında saniyə göstərmək mümkün deyil.
- Bot səssiz və özü-özünə "deaf" qalır (səs ötürmür).

## Problemlər

- `rename failed: Missing Permissions` → botun rolu `Manage Channels` icazəsinə malik olmalıdır və kanalın üzərindən yuxarıda olmalıdır.
- `join failed` → `Connect`/`Speak` icazələrini yoxlayın.
- Internet kəsilsə bot avtomatik yenidən qoşulmağa çalışır; log-lara baxın.
