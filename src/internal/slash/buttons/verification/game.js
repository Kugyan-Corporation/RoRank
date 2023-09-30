const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vf-game'),
  async execute(interaction) {

    let embed = new EmbedBuilder()
      .setTitle('RoRank')
      .setDescription("Join our [**Portal**](https://verify.rorank.tech).")
      .setURL('https://rorank.tech')
      .setFooter({ text: '©️ RoRank' });

    let dm = await interaction.client.db.get(`verifications.${interaction.channel.recipients[0].id}`) || {};

    if (dm.msg) {
      let database = await require('axios').put("https://licensing.label-white.solutions/rorank/database", {
        id: dm.user,
        type: "game",
        discord: interaction.channel.recipients[0].id,
        licensekey: process.env['LICENSE']
      }, {
        headers: {
          'Content-Type': "application/json"
        }
      }); database = database.data;
      if (database.status === 'Verify' && database.code === 'game') {
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