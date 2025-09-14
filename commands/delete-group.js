import { SlashCommandBuilder } from "discord.js";
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
  .setName("delete-group")
  .setDescription("Supprimer ce groupe (créateur uniquement)");

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;

  // Vérifie si c'est bien un salon de groupe
  if (!channel.name.toLowerCase().startsWith("grp-")) {
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
      `❌ Seul le créateur du groupe peut supprimer ce salon. (Créateur : <@${group.creator}>)`
    );
  }

  try {
    // Supprime l'entrée du groupe
    delete groups[channel.id];
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));

    // Supprime le salon
    await channel.delete();

    console.log(`🗑️ Groupe supprimé : ${channel.name}`);
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Erreur lors de la suppression du groupe.");
  }
}
