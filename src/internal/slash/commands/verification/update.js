const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update roles')
    .addUserOption(option => option.setName('user').setDescription('User to update').setRequired(false)),
  async execute(interaction) {
    let DUID = interaction.member.user.id;
    if (interaction.data.options && interaction.data.options[0] && interaction.data.options[0].name === "user") DUID = interaction.data.options[0].value;
    let info = await require('axios').get("https://licensing.label-white.solutions/rorank/database?licensekey=" + process.env['LICENSE'] + "&discord=" + DUID); info = info.data;
    if (info.status === 'Active') {
      let SRoles = await require('axios').get("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/roles", {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
        }
      }); SRoles = SRoles.data;
      let CRoles = await require('axios').get("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + DUID, {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
        }
      }); CRoles = CRoles.data.roles;
      let ACRoles = await require('axios').get("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + interaction.member.user.id, {
        headers: {
          'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
        }
      }); ACRoles = ACRoles.data.roles;

      let Allowed = false;

      for (const RID of interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["manager"]) {
        if (ACRoles.includes(RID)) {
          Allowed = true;
          break;
        }
      }

      if (Allowed || DUID === interaction.member.user.id) {
        info.user = await interaction.client.noblox.getPlayerInfo(Number(info.roblox));
        info.user.rank = await interaction.client.noblox.getRankInGroup(Number(info.roblox)); info.user.rank = info.user.rank.toString();
        let group = await interaction.client.noblox.getGroup();
        let fields = [];
        let groupRanks = [];
        for (const rank in interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["ranks"]) {
          if (rank !== info.user.rank) {
            for (const role of interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["ranks"][rank.toString()]) {
              groupRanks.push(role);
            }
          }
        }
        let serverRoles = interaction.client.config["discord"][interaction.guild.id]["verification"]["roles"]["ranks"][info.user.rank] || [];
        groupRanks = groupRanks.filter(role => CRoles.includes(role));
        serverRoles = serverRoles.filter(role => !CRoles.includes(role));
        try {
          await require('axios').patch("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + DUID, {
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
              await require('axios').delete("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + DUID + "/roles/" + RID, {
                headers: {
                  'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
                }
              });
            }
          }
          for (const RID of serverRoles) {
            await require('axios').put("https://discord.com/api/v10/guilds/" + interaction.guild.id + "/members/" + DUID + "/roles/" + RID, {}, {
              headers: {
                'Authorization': `Bot ${process.env['DISCORD_TOKEN']}`
              }
            });
          }
        } catch (err) { };
        let addedRoles = "";
        if (serverRoles) {
          for (const RID of serverRoles) {
            let Role = SRoles.filter(RL => RL.id === RID);
            if (addedRoles) {
              addedRoles = addedRoles + ` | \`${Role[0].name}\``;
            } else {
              addedRoles = `\`${Role[0].name}\``;
            }
          }
        }
        if (addedRoles && addedRoles !== '') {
          fields.push({ name: 'Added Roles', value: addedRoles, inline: true });
        }
        let removedRoles = "";
        if (groupRanks) {
          for (const RID of groupRanks) {
            let Role = SRoles.filter(RL => RL.id === RID);
            if (removedRoles) {
              removedRoles = removedRoles + ` | \`${Role[0].name}\``;
            } else {
              removedRoles = `\`${Role[0].name}\``;
            }
          }
        }
        if (removedRoles && removedRoles !== '') {
          fields.push({ name: 'Removed Roles', value: removedRoles, inline: true });
        }

        let embed = new EmbedBuilder()
          .setFooter({ text: '©️ RoRank' });

        if (fields[0]) {
          embed.addFields(fields)
            .setTitle(info.user.displayName ? info.user.displayName + " (@" + info.user.username + ")" : info.user.username)
            .setURL('https://www.roblox.com/users/' + Number(info.roblox))
            .setThumbnail(await interaction.client.noblox.getPlayerThumbnail(Number(info.roblox), "720x720", "png", true, "Headshot"));
        } else {
          embed.setTitle(group.name)
            .setDescription("Welcome!")
            .setURL('https://www.roblox.com/groups/' + process.env['GROUP'])
            .setThumbnail(await interaction.client.noblox.getLogo("420x420", true, "png"));
        }

        interaction.res.send({
          type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [embed]
          },
        });
      }
    } else if (info.status === 'NExist') {
      interaction.res.send({
        type: interaction.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This user is not linked to [RoRank](https://rorank.tech)!"
        },
      });
      await require('wait')(require('ms')('3s'))
      require('axios').delete("https://discord.com/api/v10/webhooks/" + process.env['DISCORD_APPLICATION_ID'] + "/" + interaction.token + "/messages/@original");
    }
  },
};