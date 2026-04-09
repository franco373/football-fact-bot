const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'usage.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function checkUsage(userId) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const today = new Date().toISOString().split('T')[0];

    if (!data[userId] || data[userId].date !== today) {
        return { allowed: true, remaining: config.maxDailyUses };
    }

    if (data[userId].count >= config.maxDailyUses) {
        return { allowed: false, remaining: 0 };
    }

    return { 
        allowed: true, 
        remaining: config.maxDailyUses - data[userId].count 
    };
}

function incrementUsage(userId) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const today = new Date().toISOString().split('T')[0];

    if (!data[userId] || data[userId].date !== today) {
        data[userId] = { date: today, count: 0 };
    }

    data[userId].count += 1;
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    return config.maxDailyUses - data[userId].count;
}

module.exports = { checkUsage, incrementUsage };