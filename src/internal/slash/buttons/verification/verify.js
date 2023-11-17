const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify'),
  async execute(interaction) {
    interaction.res.send({ type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: '' } });
    let userInfo = await require('axios').get("https://rorank.label-white.space/database?licensekey=" + process.env['LICENSE'] + "&discord=" + interaction.member.user.id); userInfo = userInfo.data;

    let embed = new EmbedBuilder()
      .setTitle('RoRank')
      .setDescription("What's your roblox username?\nSend it in this DM.")
      .setURL('https://rorank.tech')
      .setFooter({ text: '©️ RoRank' });
    let buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('vf-username')
          .setLabel('Submit')
          .setStyle(ButtonStyle.Primary),
      );

    if (userInfo.status === 'NExist') {
      let dm = await interaction.client.db.get(`verifications.${interaction.member.user.id}`) || {}; let response = null;

      if (!dm.dm) {
        response = await require('axios').post("https://discord.com/api/v10/users/@me/channels", {
          recipient_id: interaction.member.user.id
        }, {
          headers: {
            'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`,
            'Content-Type': "application/json"
          }
        }); dm.dm = response.data.id; await interaction.client.db.set(`verifications.${interaction.member.user.id}`, dm);
      };
      dm = await interaction.client.db.get(`verifications.${interaction.member.user.id}`);
      if (!dm.msg) {
        try {
          response = await require('axios').post("https://discord.com/api/v10/channels/" + dm.dm + "/messages", {
            content: "",
            embeds: [embed],
            components: [buttons]
          }, {
            headers: {
              'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`,
              'Content-Type': "application/json"
            }
          }); if (response.data.id) { dm.msg = response.data.id; await interaction.client.db.set(`verifications.${interaction.member.user.id}`, dm); }
        } catch (err) { };
      };
    } else if (userInfo.status === 'Active') {
      let SRoles = await require('axios').get("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/roles", {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
        }
      }); SRoles = SRoles.data;
      let CRoles = await require('axios').get("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + interaction.member.user.id, {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
        }
      }); CRoles = CRoles.data.roles;
      let playerInfo = await interaction.client.noblox.getPlayerInfo(Number(userInfo.roblox));
      let groupRank = await interaction.client.noblox.getRankInGroup(Number(userInfo.roblox)); groupRank = groupRank.toString();
      let groupRanks = [];
      for (const rank in interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["ranks"]) {
        if (rank !== groupRank) {
          for (const role of interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["ranks"][rank.toString()]) {
            groupRanks.push(role);
          }
        }
      }
      let serverRoles = interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["ranks"][groupRank] || [];
      for (const URole of interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["unverified"]) {
        groupRanks.push(URole);
      }
      for (const VRole of interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["verified"]) {
        serverRoles.push(VRole);
      }
      groupRanks = groupRanks.filter(role => CRoles.includes(role));
      serverRoles = serverRoles.filter(role => !CRoles.includes(role));
      try {
        await require('axios').patch("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + interaction.member.user.id, {
          nick: playerInfo.username
        }, {
          headers: {
            'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`,
            'Content-Type': "application/json"
          }
        });
      } catch (err) { };
      try {
        if (interaction.client.config["discord"][interaction.guild.id]["verification"]["mode"]["keep-old"] === false) {
          for (const RID of groupRanks) {
            await require('axios').delete("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + interaction.member.user.id + "/roles/" + RID, {
              headers: {
                'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
              }
            });
          }
        }
        for (const RID of serverRoles) {
          await require('axios').put("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + interaction.member.user.id + "/roles/" + RID, {}, {
            headers: {
              'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
            }
          });
        }
      } catch (err) { };
    }
  },
};