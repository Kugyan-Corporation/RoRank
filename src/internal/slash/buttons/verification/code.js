const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vf-code'),
  async execute(interaction) {
    interaction.res.send({ type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: '' } });

    let embed = new EmbedBuilder()
      .setTitle('RoRank')
      .setURL('https://rorank.tech')
      .setFooter({ text: '©️ RoRank' });
    let buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('vf-code-verify')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Primary)
      );

    let dm = await interaction.client.db.get(`verifications.${interaction.channel.recipients[0].id}`) || {};

    if (dm.msg) {
      let database = await require('axios').put("https://rorank.label-white.space/database", {
        id: dm.user,
        type: "code",
        discord: interaction.channel.recipients[0].id,
        licensekey: process.env['LICENSE']
      }, {
        headers: {
          'Content-Type': "application/json"
        }
      }); database = database.data;
      if (database.status === 'Verify') {
        require('axios').patch("https://discord.com/api/v10/channels/" + dm.dm + "/messages/" + dm.msg, {
          content: "",
          embeds: [embed.setDescription(`Add this \`${database.code}\` to your "About me".`)],
          components: [buttons]
        }, {
          headers: {
            'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`,
            'Content-Type': "application/json"
          }
        });
      }
    }
  },
};