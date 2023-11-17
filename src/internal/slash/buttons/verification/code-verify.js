const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vf-code-verify'),
  async execute(interaction) {
    interaction.res.send({ type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: '' } });

    let embed = new EmbedBuilder()
      .setTitle('RoRank')
      .setURL('https://rorank.tech')
      .setDescription("Successfully Verified.")
      .setFooter({ text: '©️ RoRank' });

    let dm = await interaction.client.db.get(`verifications.${interaction.channel.recipients[0].id}`) || {};

    if (dm.msg) {
      let database = await require('axios').post("https://rorank.label-white.space/database", {
        id: dm.user,
        licensekey: process.env['LICENSE']
      }, {
        headers: {
          'Content-Type': "application/json"
        }
      }); database = database.data;
      if (database.status === 'Updated') {
        require('axios').patch("https://discord.com/api/v10/channels/" + dm.dm + "/messages/" + dm.msg, {
          content: "",
          embeds: [embed],
          components: []
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