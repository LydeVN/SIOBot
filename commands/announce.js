import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("announce")
  .setDescription("Envoyer un message public via le bot")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("Le message à annoncer publiquement")
      .setRequired(true)
  );

export async function execute(interaction) {
  const message = interaction.options.getString("message");

  try {
    // Réponse privée pour confirmer
    await interaction.reply({ content: "✅ Message envoyé publiquement !", ephemeral: true });

    // Envoi public dans le channel
    await interaction.channel.send(message);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Erreur lors de l’envoi du message.", ephemeral: true });
  }
}
