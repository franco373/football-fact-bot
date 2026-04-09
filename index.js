require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] Command at ${filePath} is missing required properties.`);
    }
}

const eventsPath = path.join(__dirname, 'events');

if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath);
}

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}! Football Fact Bot is online.`);
});

client.login(process.env.DISCORD_TOKEN);

// Create a dummy web server so Render allows it on the Free Web Service tier
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is online!');
});
server.listen(process.env.PORT || 3000, () => console.log('Dummy web server started.'));