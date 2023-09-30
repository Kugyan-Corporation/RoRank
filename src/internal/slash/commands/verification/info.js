const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Retrieve the Roblox Profile')
    .addUserOption(option => option.setName('user').setDescription('user to lookup').setRequired(false)),
  async execute(interaction) {
    let DUID = interaction.member.user.id;
    if (interaction.data.options && interaction.data.options[0] && interaction.data.options[0].name === "user") DUID = interaction.data.options[0].value;
    let info = await require('axios').get("https://licensing.label-white.solutions/rorank/database?licensekey=" + process.env['LICENSE'] + "&discord=" + DUID); info = info.data;
    if (info.status === 'Active') {
      info.user = await interaction.client.noblox.getPlayerInfo(Number(info.roblox));
      let group = await interaction.client.noblox.getGroup();
      let fields = [
        { name: 'About', value: info.user.blurb || '', inline: true },
        { name: group.name, value: await interaction.client.noblox.getRankNameInGroup(Number(info.roblox)), inline: true }
      ]
      if (info.role !== 0) {
        let roles = await require('axios').get("https://licensing.label-white.solutions/rorank/information/roles"); roles = roles.data;
        fields.push({ name: 'RoRank', value: roles[info.role.toString()], inline: true });
      }
      interaction.res.send({
        type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [new EmbedBuilder()
            .setTitle(info.user.displayName ? info.user.displayName + " (@" + info.user.username + ")" : info.user.username)
            .setURL('https://www.roblox.com/users/' + Number(info.roblox))
            .setThumbnail(await interaction.client.noblox.getPlayerThumbnail(Number(info.roblox), "720x720", "png", true, "Headshot"))
            .addFields(fields).setFooter({ text: '©️ RoRank' })]
        },
      });
    } else if (info.status === 'NExist') {
      interaction.res.send({
        type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'This user is not linked to [RoRank](https://rorank.tech)!'
        },
      });
      await require('wait')(require('ms')('3s'))
      require('axios').delete("https://discord.com/api/v10/webhooks/" + process.env['DISCORD_APPLICATION_ID'] + "/" + interaction.token + "/messages/@original");
    }
  },
};