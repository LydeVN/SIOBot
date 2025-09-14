import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import fs from "fs";

const GROUPS_FILE = "groups.json";
let groups = {};
if (fs.existsSync(GROUPS_FILE)) {
  try {
    groups = JSON.parse(fs.readFileSync(GROUPS_FILE, "utf8"));
  } catch {
    groups = {};
    fs.writeFileSync(GROUPS_FILE, "{}");
  }
}

export const data = new SlashCommandBuilder()
  .setName("remove-member")
  .setDescription("Retirer un membre du groupe (créateur uniquement)")
  .addUserOption((option) =>
    option
      .setName("membre")
      .setDescription("Utilisateur à retirer du groupe")
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser("membre");
  const channel = interaction.channel;

  // Vérifie si c'est bien un groupe
  if (!channel.name.toLowerCase().startsWith("🎪grp-")) {
    return interaction.editReply("❌ Cette commande doit être utilisée dans un salon de groupe.");
  }

  // Vérifie que le groupe existe dans groups.json
  const group = groups[channel.id];
  if (!group) {
    return interaction.editReply("❌ Impossible de trouver les infos de ce groupe.");
  }

  // Vérifie que l'utilisateur est bien le créateur
  if (interaction.user.id !== group.creator) {
    return interaction.editReply(
      `❌ Seul le créateur du groupe peut retirer un membre. (Créateur : <@${group.creator}>)`
    );
  }

  try {
    await channel.permissionOverwrites.edit(user.id, {
      ViewChannel: false,
      SendMessages: false,
    });

    // Confirmation privée
    await interaction.editReply(`✅ ${user} a été retiré du groupe.`);

    // Message public
    await channel.send(`👋 ${user} a été retiré du groupe par le créateur.`);
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Erreur lors du retrait du membre.");
  }
}
