import dotenv from "dotenv";
dotenv.config();

import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
    new SlashCommandBuilder()
        .setName("create-group")
        .setDescription("Créer un groupe avec un salon privé")
        .addStringOption((option) =>
            option.setName("nom").setDescription("Nom du projet").setRequired(true)
        )
        .addUserOption((option) =>
            option.setName("membre1").setDescription("Membre 1").setRequired(true)
        )
        .addUserOption((option) =>
            option.setName("membre2").setDescription("Membre 2").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre3").setDescription("Membre 3").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre4").setDescription("Membre 4").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre5").setDescription("Membre 5").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre6").setDescription("Membre 6").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre7").setDescription("Membre 7").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre8").setDescription("Membre 8").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre9").setDescription("Membre 9").setRequired(false)
        )
        .addUserOption((option) =>
            option.setName("membre10").setDescription("Membre 10").setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName("add-member")
        .setDescription("Ajouter un membre au groupe (à utiliser dans le salon du groupe)")
        .addUserOption((option) =>
            option.setName("membre")
                .setDescription("Utilisateur à ajouter")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("remove-member")
        .setDescription("Retirer un membre du groupe (créateur uniquement)")
        .addUserOption((option) =>
            option.setName("membre")
                .setDescription("Utilisateur à retirer")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
  .setName("delete-group")
  .setDescription("Supprimer ce groupe (créateur uniquement)"),



].map((command) => command.toJSON());



const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🚀 Déploiement des commandes slash...");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log("✅ Commandes déployées avec succès !");
    } catch (error) {
        console.error(error);
    }
})();
