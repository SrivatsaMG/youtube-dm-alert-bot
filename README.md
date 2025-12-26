# 📺 youtube-dm-alert-bot

A Discord bot that automatically sends **YouTube upload alerts via Direct Message (DM)** to subscribed users.  
It uses **YouTube RSS feeds (no API key required)**, supports **role-based subscriptions**, **DM unsubscribe commands**, **status rotation**, **auto-restart on crash**, and **owner crash notifications** — all handled from a **single `index.js` file**.

---

## ✨ Features

- 📩 Sends **DM alerts** when a new YouTube video is uploaded
- 🔔 **Role-based subscriptions** (only users with a specific role receive alerts)
- 🚫 `/stop` command to unsubscribe from DMs
- ✅ `/start` command to re-subscribe
- 🔄 **Rotating bot status**
- ♻️ **Auto-restart on crash** (PM2 ready)
- 🚨 **Owner DM notification on crash**
- 🔑 **No YouTube API key required** (RSS-based)
- 📁 Simple JSON-based storage
- 🧠 Everything runs from **one file (`index.js`)**

---

## 📁 Project Structure

youtube-dm-alert-bot/
youtube-dm-alert-bot/
├── index.js        ✅ main bot code
├── package.json    ✅ dependencies & scripts
├── README.md       ✅ documentation
├── .env            ✅ environment variables (DO NOT COMMIT)
└── .gitignore      ✅ ignore secrets


yaml
Copy code

---

## ⚙️ Requirements

- **Node.js v18+**
- A Discord bot token
- PM2 (recommended for production)

---

## 🚀 Setup Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/youtube-dm-alert-bot.git
cd youtube-dm-alert-bot
2️⃣ Install Dependencies
bash
Copy code
npm install
3️⃣ Create .env File
env
Copy code
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
OWNER_ID=YOUR_DISCORD_USER_ID
ALERT_ROLE_ID=DISCORD_ROLE_ID_FOR_ALERTS
⚠️ OWNER_ID must be a USER ID, not a role ID.

4️⃣ Enable Discord Intents
In the Discord Developer Portal → Bot → Privileged Gateway Intents, enable:

✅ Server Members Intent

✅ Message Content Intent

Save changes.

5️⃣ Run the Bot (Local Test)
bash
Copy code
node index.js
Expected output:

csharp
Copy code
✅ Logged in as YourBotName#1234
🔁 Auto-Restart (Production – Recommended)
Install PM2
bash
Copy code
npm install -g pm2
Start the bot with PM2
bash
Copy code
pm2 start index.js --name youtube-dm-alert-bot
Save & enable startup
bash
Copy code
pm2 save
pm2 startup
💬 Bot Commands (DM Only)
Command	Description
stop / /stop	Unsubscribe from YouTube alert DMs
/start	Re-subscribe to alerts

🚨 Crash Notifications
If the bot:

Crashes

Throws an uncaught exception

Has an unhandled promise rejection

➡️ The owner receives a DM with:

Error type

Timestamp

Error stack (shortened)

PM2 then automatically restarts the bot.

🔐 Security Notes
❌ Never commit .env

❌ Never share your bot token

✅ Use .gitignore for secrets

✅ Limit alert role to trusted users

🛠️ Customization
You can easily change:

YouTube channel ID

Status rotation text

Alert role

Check interval

DM message format

All inside index.js.

📜 License
MIT License — free to use, modify, and distribute.

⭐ Support
If you find this useful:

⭐ Star the repository

🐛 Open an issue for bugs

💡 Suggest features via pull requests

🔮 Future Improvements (Ideas)
🔴 Live stream detection

📊 Subscriber count fetch

🗃️ Supabase / database support

📈 Dashboard

🧠 Anti-spam DM cooldowns

Built with ❤️ for Discord & YouTube automation
