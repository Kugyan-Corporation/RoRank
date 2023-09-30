const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vf-username'),
  async execute(interaction) {

    let embed = new EmbedBuilder()
      .setTitle('RoRank')
      .setDescription("Choose the verification method.")
      .setURL('https://rorank.tech')
      .setFooter({ text: '©️ RoRank' });
    let buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('vf-game')
          .setLabel('Game')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('vf-code')
          .setLabel('Code')
          .setStyle(ButtonStyle.Primary)
      );

    let response = await require('axios').get("https://discord.com/api/v10/channels/" + interaction.channel.id + "/messages/" + interaction.channel.last_message_id, {
      headers: {
        'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
      }
    }); response = response.data;

    if (!response.author.bot && response.author.id !== process.env['DISCORD_APPLICATION_ID']) {
      let dm = await interaction.client.db.get(`verifications.${interaction.channel.recipients[0].id}`);
      dm.user = await interaction.client.noblox.getIdFromUsername(response.content);
      await interaction.client.db.set(`verifications.${interaction.channel.recipients[0].id}`, dm);
      await require('axios').patch("https://discord.com/api/v10/channels/" + dm.dm + "/messages/" + dm.msg, {
        content: "",
        components: [new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('vf-username')
              .setLabel('Submit')
              .setDisabled(true)
              .setStyle(ButtonStyle.Primary),
          )]
      }, {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`,
          'Content-Type': "application/json"
        }
      });
      await interaction.res.send({
        type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "",
          embeds: [embed],
          components: [buttons]
        },
      });
      let botmsg = await require('axios').post("https://discord.com/api/v10/users/@me/channels", {
        recipient_id: interaction.channel.recipients[0].id
      }, {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`,
          'Content-Type': "application/json"
        }
      }); dm.msg = botmsg.data.last_message_id;
      interaction.client.db.set(`verifications.${interaction.channel.recipients[0].id}`, dm);
    } else {
      interaction.res.send({
        type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: ''
        },
      });
    }
  },
};