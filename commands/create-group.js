import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import fs from "fs";

const GROUPS_FILE = "groups.json";

export const data = new SlashCommandBuilder()
  .setName("create-group")
  .setDescription("Créer un groupe avec un salon privé")
  .addStringOption((option) =>
    option.setName("nom").setDescription("Nom du projet").setRequired(true)
  )
  .addUserOption((option) =>
    option.setName("membre1").setDescription("Membre 1").setRequired(false)
  )
  .addUserOption((option) =>
    option.setName("membre2").setDescription("Membre 2").setRequired(false)
  )
  .addUserOption((option) =>
    option.setName("membre3").setDescription("Membre 3").setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const groupName = interaction.options.getString("nom");
  const members = [];
  for (let i = 1; i <= 10; i++) {
    const user = interaction.options.getUser(`membre${i}`);
    if (user) members.push(user);
  }

  const existingChannel = interaction.guild.channels.cache.find(
    (c) => c.name === `🎪grp-${groupName.toLowerCase()}`
  );
  if (existingChannel) {
    return interaction.editReply("❌ Ce groupe existe déjà !");
  }

  try {
    const channel = await interaction.guild.channels.create({
      name: `🎪grp-${groupName.toLowerCase()}`,
      type: 0, // textuel
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        ...members.map((user) => ({
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        })),
      ],
    });

    // Charger l’existant
    let groups = {};
    if (fs.existsSync(GROUPS_FILE)) {
      groups = JSON.parse(fs.readFileSync(GROUPS_FILE, "utf8"));
    }

    // Enregistrer ce groupe
    groups[channel.id] = {
      name: groupName,
      creator: interaction.user.id,
    };
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));

    await interaction.editReply(`✅ Salon créé : ${channel}`);
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Erreur lors de la création du salon.");
  }
}
