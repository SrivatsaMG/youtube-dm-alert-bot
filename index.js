require("dotenv").config();
const fs = require("fs");
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType
} = require("discord.js");
const { fetch } = require("undici");
const xml2js = require("xml2js");

/* =========================
   DISCORD CLIENT
========================= */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

/* =========================
   FILE STORAGE
========================= */
const LAST_VIDEO_FILE = "./last_video.json";
const STOPPED_USERS_FILE = "./stopped_users.json";

function readJSON(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
        fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
        return fallback;
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* =========================
   YOUTUBE CONFIG
========================= */
const CHANNEL_ID = "UC9exOhASNX9iN1GpLUiwLTQ";
const CHANNEL_URL = "https://www.youtube.com/@RuDyy_val";
const RSS_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/* =========================
   STATUS ROTATION
========================= */
let latestVideoTitle = "YouTube Updates";
let latestVideoUrl = CHANNEL_URL;
let statusRotation = [];
let rotationIndex = 0;

/* =========================
   FETCH LATEST VIDEO
========================= */
async function fetchLatestVideo() {
    try {
        const res = await fetch(RSS_FEED);
        const xml = await res.text();
        const parsed = await xml2js.parseStringPromise(xml);

        const entry = parsed?.feed?.entry?.[0];
        if (!entry) return;

        const videoId = entry["yt:videoId"][0];
        const videoUrl = entry.link[0].$.href;
        const title = entry.title[0];
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        const last = readJSON(LAST_VIDEO_FILE, { lastVideoId: "" });
        if (last.lastVideoId === videoId) return;

        latestVideoTitle = title.substring(0, 60);
        latestVideoUrl = videoUrl;
        buildStatusRotation();

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0xff0000)
            .setImage(thumbnail)
            .setTimestamp();

        await notifyUsers(videoUrl, embed);
        writeJSON(LAST_VIDEO_FILE, { lastVideoId: videoId });

        console.log("📩 New video alert sent");

    } catch (err) {
        console.log("❌ RSS fetch error:", err.message);
    }
}

/* =========================
   SEND DMs
========================= */
async function notifyUsers(videoUrl, embed) {
    const stoppedUsers = readJSON(STOPPED_USERS_FILE, []);

    for (const [, guild] of client.guilds.cache) {
        const role = guild.roles.cache.get(process.env.ALERT_ROLE_ID);
        if (!role) continue;

        await guild.members.fetch();

        for (const [, member] of role.members) {
            if (stoppedUsers.includes(member.id)) continue;

            try {
                await member.send({
                    content: `<@${member.id}>\n${videoUrl}`,
                    embeds: [embed]
                });
            } catch {
                // DMs closed
            }
        }
    }
}

/* =========================
   DM COMMANDS
========================= */
client.on("messageCreate", async (message) => {
    if (!message.channel.isDMBased()) return;
    if (message.author.bot) return;

    const text = message.content.toLowerCase().trim();
    let stopped = readJSON(STOPPED_USERS_FILE, []);

    if (text === "stop" || text === "/stop") {
        if (!stopped.includes(message.author.id)) {
            stopped.push(message.author.id);
            writeJSON(STOPPED_USERS_FILE, stopped);
        }
        return message.reply("❌ You are unsubscribed.");
    }

    if (text === "/start") {
        stopped = stopped.filter(id => id !== message.author.id);
        writeJSON(STOPPED_USERS_FILE, stopped);
        return message.reply("✅ You are subscribed again.");
    }
});

/* =========================
   STATUS ROTATION
========================= */
function buildStatusRotation() {
    statusRotation = [
        { name: latestVideoTitle, type: ActivityType.Watching },
        { name: "YouTube DM Alerts", type: ActivityType.Playing },
        { name: "No API Key Needed", type: ActivityType.Watching },
        { name: "Created by vatsa.7760", type: ActivityType.Playing }
    ];
}

function rotateStatus() {
    if (!statusRotation.length) return;
    const current = statusRotation[rotationIndex];

    client.user.setPresence({
        status: "online",
        activities: [{
            name: current.name,
            type: current.type
        }]
    });

    rotationIndex = (rotationIndex + 1) % statusRotation.length;
}

/* =========================
   READY
========================= */
client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    await fetchLatestVideo();
    buildStatusRotation();
    rotateStatus();

    setInterval(fetchLatestVideo, 5 * 60 * 1000);
    setInterval(rotateStatus, 7 * 1000);
});

client.login(process.env.DISCORD_TOKEN);

/* =========================
   OWNER CRASH DM (ALL IN FILE)
========================= */
async function notifyOwnerOnCrash(error, type) {
    try {
        if (!client.user) return;
        const owner = await client.users.fetch(process.env.OWNER_ID);
        if (!owner) return;

        await owner.send(
            `🚨 **BOT ALERT**\n` +
            `📌 Type: ${type}\n` +
            `🕒 Time: ${new Date().toLocaleString()}\n\n` +
            "```" +
            String(error).substring(0, 1800) +
            "```"
        );
    } catch (e) {
        console.log("❌ Failed to DM owner:", e.message);
    }
}

process.on("uncaughtException", async (err) => {
    console.error("🔥 Uncaught Exception:", err);
    await notifyOwnerOnCrash(err, "Uncaught Exception");
    process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
    console.error("🔥 Unhandled Rejection:", reason);
    await notifyOwnerOnCrash(reason, "Unhandled Rejection");
    process.exit(1);
});

process.on("SIGTERM", async () => {
    await notifyOwnerOnCrash("SIGTERM received", "Shutdown");
    process.exit(0);
});
