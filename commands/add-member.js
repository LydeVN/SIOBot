import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("add-member")
    .setDescription("Ajouter un membre au groupe (à utiliser dans le salon du groupe)")
    .addUserOption((option) =>
        option
            .setName("membre")
            .setDescription("Utilisateur à ajouter au groupe")
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

    // Vérifie que l'utilisateur qui exécute la commande a déjà accès
    const perms = channel.permissionsFor(interaction.user.id);
    if (!perms || !perms.has(PermissionsBitField.Flags.ViewChannel)) {
        return interaction.editReply(
            "❌ Tu n'as pas la permission d'ajouter des membres dans ce groupe."
        );
    }

    try {
        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
        });

        // Confirmation privée
        await interaction.editReply(`✅ Tu as invité ${user} dans le salon !`);

        // Message public dans le groupe
        await channel.send(`👋 Bienvenue ${user} dans le groupe !`);
    } catch (err) {
        console.error(err);
        await interaction.editReply("❌ Erreur lors de l'ajout du membre.");
    }
}
