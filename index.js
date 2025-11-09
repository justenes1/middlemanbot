require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = '$';
const MIDDLEMAN_ROLE_ID = '1431066232970416330';
const ACTIVE_TRADER_ROLE_ID = '1431066239299489946';
const OVERSEER_ROLE_ID = '1431066222782316575';
const VOUCH_DATA_FILE = './vouch_data.json';
const AFK_DATA_FILE = './afk_data.json';

function loadVouchData() {
    try {
        if (fs.existsSync(VOUCH_DATA_FILE)) {
            return JSON.parse(fs.readFileSync(VOUCH_DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading vouch data:', error);
    }
    return {};
}

function saveVouchData(data) {
    try {
        fs.writeFileSync(VOUCH_DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving vouch data:', error);
    }
}

function loadAFKData() {
    try {
        if (fs.existsSync(AFK_DATA_FILE)) {
            return JSON.parse(fs.readFileSync(AFK_DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading AFK data:', error);
    }
    return {};
}

function saveAFKData(data) {
    try {
        fs.writeFileSync(AFK_DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving AFK data:', error);
    }
}

let vouchData = loadVouchData();
let afkData = loadAFKData();

client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    console.log(`📊 messageCreate listeners: ${client.listenerCount('messageCreate')}`);
    console.log(`📊 interactionCreate listeners: ${client.listenerCount('interactionCreate')}`);
    client.user.setActivity('$imagine | $mminfo', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            if (afkData[user.id]) {
                message.reply(`${user} is currently afk: ${afkData[user.id]}`);
            }
        });
    }

    if (afkData[message.author.id]) {
        delete afkData[message.author.id];
        saveAFKData(afkData);
        message.reply(`Welcome back! Your AFK status has been removed.`);
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'imagine') {
        console.log(`[COMMAND] $imagine triggered by ${message.author.tag} at ${new Date().toISOString()}`);
        
        if (!message.guild || !message.member) {
            return message.reply('❌ This command can only be used in a server.');
        }
        
        if (!message.member.roles.cache.has(MIDDLEMAN_ROLE_ID)) {
            return message.reply('❌ You do not have permission to use this command. Only Middleman Team members can use it.');
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('interested')
                    .setLabel('Interested')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('not_interested')
                    .setLabel('Not Interested')
                    .setStyle(ButtonStyle.Danger)
            );

        const embedMessage = `You just got scammed, Wanna be a Hitter like us?

You find victim in the trading servers (Adopt Me, PSX, MM2, Pets go, etc)
You get victim to use our middleman service
We will help you to scam the item/crypto/usd etc
After we get victim's item you and mm will split the hit item

Make sure to check out the guide in for everything you need to know. #

**STAFF IMPORTANT**

If you're ready, click the button below to start hitting and join the team!`;

        await message.channel.send({
            content: embedMessage,
            components: [row]
        });
        return;
    }

    if (command === 'mminfo') {
        const attachment = new AttachmentBuilder('./attached_assets/mminfo_1762715439813.webp');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('understood')
                    .setLabel('Understood')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('didnt_understand')
                    .setLabel('Didnt Understand')
                    .setStyle(ButtonStyle.Danger)
            );

        const infoMessage = `**A Middleman is a trusted staff member who ensures trades happen fairly.**

**Example:**
If you're trading 2k Robux for an Adopt Me Crow, the MM will hold the Crow until payment is confirmed, then release it to you.

**Benefits:** Prevents scams, ensures smooth transactions.`;

        await message.channel.send({
            content: infoMessage,
            files: [attachment],
            components: [row]
        });
        return;
    }

    if (command === 'mmfee') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('fee_50')
                    .setLabel('50%')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('fee_100')
                    .setLabel('100%')
                    .setStyle(ButtonStyle.Success)
            );

        const feeMessage = `Small trades: Free
High-value trades: May require a small tip/fee.

Fees help reward the MM's time & effort.
We accept Robux, in-game items, crypto, or cash.

Would you like to pay 100% or split 50/50?`;

        await message.channel.send({
            content: feeMessage,
            components: [row]
        });
        return;
    }

    if (command === 'confirm') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_trade')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('decline_trade')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        await message.channel.send({
            content: 'Do we both confirm this trade?',
            components: [row]
        });
        return;
    }

    if (command === 'vouchconfig') {
        if (!message.guild || !message.member) {
            return message.reply('❌ This command can only be used in a server.');
        }

        if (!message.member.roles.cache.has(OVERSEER_ROLE_ID)) {
            return message.reply('❌ You do not have permission to use this command. Only Overseer members or above can use it.');
        }

        if (args.length < 2) {
            return message.reply('❌ Usage: `$vouchconfig @user <number>` or `$vouchconfig username <number>`');
        }

        const vouchCount = parseInt(args[args.length - 1]);
        if (isNaN(vouchCount)) {
            return message.reply('❌ Please provide a valid number for the vouch count.');
        }

        let targetUser = message.mentions.users.first();
        if (!targetUser) {
            const username = args.slice(0, -1).join(' ');
            targetUser = message.guild.members.cache.find(m => 
                m.user.username.toLowerCase() === username.toLowerCase() || 
                m.displayName.toLowerCase() === username.toLowerCase()
            )?.user;
        }

        if (!targetUser) {
            return message.reply('❌ Could not find that user. Please mention them or use their exact username.');
        }

        vouchData[targetUser.id] = vouchCount;
        saveVouchData(vouchData);

        await message.reply(`✅ Set vouch count for ${targetUser.tag} to **${vouchCount}** vouches.`);
        return;
    }

    if (command === 'vouchcount') {
        const targetUser = message.mentions.users.first() || message.author;
        const vouchCount = vouchData[targetUser.id] || 0;

        await message.reply(`${targetUser} currently has **${vouchCount}** Vouches.`);
        return;
    }

    if (command === 'ask') {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setDescription('What is your roblox user\n\nCan you join private servers');

        await message.channel.send({ embeds: [embed] });
        return;
    }

    if (command === 'afk') {
        let reason = args.join(' ') || 'No reason provided';
        reason = reason.replace(/@(everyone|here)/gi, '@\u200b$1').replace(/<@&\d+>/g, '[role mention]');
        
        afkData[message.author.id] = reason;
        saveAFKData(afkData);

        await message.reply(`You are now AFK: ${reason}`);
        return;
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'interested') {
        try {
            const role = interaction.guild.roles.cache.get(ACTIVE_TRADER_ROLE_ID);
            if (!role) {
                return interaction.reply({ content: '❌ Role not found. Please contact an administrator.', ephemeral: true });
            }

            await interaction.member.roles.add(role);

            let dmSent = false;
            try {
                await interaction.user.send(`You are officially a hitter Make sure to verify to join future giveaways and check guides if you are new`);
                dmSent = true;
            } catch (error) {
                console.error(`Could not send DM to ${interaction.user.tag}:`, error);
            }

            const responseMessage = dmSent 
                ? '✅ You have been granted the Active Traders role! Check your DMs.' 
                : '✅ You have been granted the Active Traders role! (Could not send DM - please enable DMs from server members)';
            
            await interaction.reply({ content: responseMessage, ephemeral: true });
        } catch (error) {
            console.error('Error granting role:', error);
            await interaction.reply({ content: '❌ An error occurred while granting the role.', ephemeral: true });
        }
    }

    if (interaction.customId === 'not_interested') {
        try {
            await interaction.member.kick('User clicked Not Interested button');
            await interaction.reply({ content: '❌ You have been removed from the server.', ephemeral: true });
        } catch (error) {
            console.error('Error kicking member:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ An error occurred while removing you from the server.', ephemeral: true });
            } else {
                await interaction.followUp({ content: '❌ An error occurred while removing you from the server.', ephemeral: true });
            }
        }
    }

    if (interaction.customId === 'understood') {
        await interaction.reply({ content: `### ${interaction.user} understood.` });
    }

    if (interaction.customId === 'didnt_understand') {
        await interaction.reply({ content: `### ${interaction.user} Did not understand.` });
    }

    if (interaction.customId === 'fee_50') {
        await interaction.reply({ content: `### ${interaction.user} agreed to pay 50%.` });
    }

    if (interaction.customId === 'fee_100') {
        await interaction.reply({ content: `### ${interaction.user} agreed to pay 100%.` });
    }

    if (interaction.customId === 'confirm_trade') {
        await interaction.reply({ content: `### ${interaction.user} Has confirmed this trade.` });
    }

    if (interaction.customId === 'decline_trade') {
        await interaction.reply({ content: `### ${interaction.user} Has declined this trade.` });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
