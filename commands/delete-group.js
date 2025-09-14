import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import fs from "fs";

const GROUPS_FILE = "groups.json";
const ARCHIVE_CATEGORY_ID = "1414997991600685206"; // ID de la catégorie Archives

export const data = new SlashCommandBuilder()
  .setName("delete-group")
  .setDescription("Archiver ce groupe (créateur uniquement)");

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;

  if (!channel.name.toLowerCase().startsWith("🎪grp-")) {
    return interaction.editReply("❌ Cette commande doit être utilisée dans un salon de groupe.");
  }

  // Charger les groupes
  let groups = {};
  if (fs.existsSync(GROUPS_FILE)) {
    groups = JSON.parse(fs.readFileSync(GROUPS_FILE, "utf8"));
  }

  const group = groups[channel.id];
  if (!group) {
    return interaction.editReply("❌ Impossible de trouver les infos de ce groupe.");
  }

  if (interaction.user.id !== group.creator) {
    return interaction.editReply(
      `❌ Seul le créateur du groupe peut archiver ce salon. (Créateur : <@${group.creator}>)`
    );
  }

  // Boutons de confirmation
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_archive")
      .setLabel("✅ Archiver le groupe")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("cancel_archive")
      .setLabel("❌ Annuler")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.editReply({
    content: `⚠️ Veux-tu vraiment archiver le groupe **${group.name}** ?`,
    components: [row],
  });

  // Attendre réponse
  const filter = (i) =>
    ["confirm_archive", "cancel_archive"].includes(i.customId) &&
    i.user.id === interaction.user.id;

  try {
    const confirmation = await interaction.channel.awaitMessageComponent({
      filter,
      time: 15000,
    });

    if (confirmation.customId === "confirm_archive") {
      try {
        // Déplacer dans la catégorie Archives
        await channel.setParent(ARCHIVE_CATEGORY_ID);

        // Supprimer du fichier groups.json
        delete groups[channel.id];
        fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));

        await confirmation.reply({
          content: `📦 Le groupe **${group.name}** a été archivé.`,
          ephemeral: true,
        });
        console.log(`📦 Groupe archivé : ${group.name}`);
      } catch (err) {
        console.error(err);
        await confirmation.reply({
          content: "❌ Erreur lors de l'archivage du groupe.",
          ephemeral: true,
        });
      }
    } else {
      await confirmation.reply({
        content: "❌ Archivage annulé.",
        ephemeral: true,
      });
    }
  } catch {
    await interaction.editReply("⌛ Temps écoulé, archivage annulé.");
  }
}
