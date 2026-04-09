const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkFactWithGemini } = require('../utils/gemini');
const { checkUsage, incrementUsage } = require('../utils/rateLimiter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('Fact-check a football (soccer) claim using AI.')
        .addStringOption(option =>
            option.setName('claim')
                .setDescription('The football claim you want to fact-check')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const claim = interaction.options.getString('claim');

        const limitCheck = checkUsage(userId);
        
        if (!limitCheck.allowed) {
            return interaction.reply({
                content: '⚠️ You have reached your limit of 5 fact-checks for today. Please try again tomorrow!',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply();

        try {
            const aiResponse = await checkFactWithGemini(claim);
            const remaining = incrementUsage(userId);

            let embedColor = 0x808080; 
            if (aiResponse.includes('Verdict: TRUE')) {
                embedColor = 0x00FF00; 
            } else if (aiResponse.includes('Verdict: FALSE')) {
                embedColor = 0xFF0000; 
            } else if (aiResponse.includes('Verdict: PARTLY TRUE')) {
                embedColor = 0xFFFF00; 
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('⚽ AI Fact Check Result')
                .setDescription(aiResponse)
                .addFields({ name: 'Your Claim', value: `"${claim}"` })
                .setFooter({ text: `Remaining daily uses: ${remaining}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [resultEmbed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ An error occurred while checking your fact. Please try again later.');
        }
    },
};
