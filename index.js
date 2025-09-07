import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
console.log("DISCORD_TOKEN =", process.env.DISCORD_TOKEN ? "OK" : "❌ undefined");
console.log("CLIENT_ID =", process.env.CLIENT_ID);
console.log("GUILD_ID =", process.env.GUILD_ID);

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// Chargement des groupes
const GROUPS_FILE = "groups.json";
let groups = {};
if (fs.existsSync(GROUPS_FILE)) {
    groups = JSON.parse(fs.readFileSync(GROUPS_FILE, "utf8"));
}

client.once("ready", () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // ======================
    // /create-group
    // ======================
    if (interaction.commandName === "create-group") {
        await interaction.deferReply({ ephemeral: true });

        const groupName = interaction.options.getString("nom");
        const members = [];
        for (let i = 1; i <= 10; i++) {
            const user = interaction.options.getUser(`membre${i}`);
            if (user) members.push(user);
        }

        const existingChannel = interaction.guild.channels.cache.find(
            (c) => c.name === `grp-${groupName.toLowerCase()}`
        );
        if (existingChannel) {
            return interaction.editReply("❌ Ce groupe existe déjà !");
        }

        try {
            const channel = await interaction.guild.channels.create({
                name: `grp-${groupName.toLowerCase()}`,
                type: 0, // 0 = textuel
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

            // Enregistre le créateur
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

    // ======================
    // /add-member
    // ======================
    if (interaction.commandName === "add-member") {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("membre");
        const channel = interaction.channel;

        // Vérifie si on est bien dans un groupe
        if (!channel.name.startsWith("grp-")) {
            return interaction.editReply(
                "❌ Cette commande doit être utilisée dans un salon de groupe."
            );
        }

        // Vérifie que l’utilisateur a le droit
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

            await interaction.editReply(`✅ tu as invité ${user} dans le salon !`);
            await channel.send(`👋 Bienvenue ${user} dans le groupe !`);
        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Erreur lors de l'ajout du membre.");
        }
    }

    // ======================
    // /remove-member
    // ======================
    if (interaction.commandName === "remove-member") {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("membre");
        const channel = interaction.channel;

        if (!channel.name.startsWith("grp-")) {
            return interaction.editReply(
                "❌ Cette commande doit être utilisée dans un salon de groupe."
            );
        }

        const group = groups[channel.id];
        if (!group) {
            return interaction.editReply("❌ Impossible de trouver les infos de ce groupe.");
        }

        // Vérifie si l’utilisateur est bien le créateur
        if (interaction.user.id !== group.creator) {
            return interaction.editReply(
                "❌ Seul le créateur du groupe peut retirer un membre."
            );
        }

        try {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: false,
                SendMessages: false,
            });

            await interaction.editReply(`✅ ${user} a été retiré du groupe.`);
            await channel.send(`👋 ${user} a été retiré du groupe par le créateur.`);
        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Erreur lors du retrait du membre.");
        }
    }

    if(interaction.commandName === "delete-group") {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.channel;

        // Vérifie que c’est bien un salon de groupe
        if (!channel.name.toLowerCase().startsWith("grp-")) {
            return interaction.editReply("❌ Cette commande doit être utilisée dans un salon de groupe.");
        }

        // Vérifie les infos du groupe
        const group = groups[channel.id];
        if (!group) {
            return interaction.editReply("❌ Impossible de trouver les infos de ce groupe.");
        }

        // Vérifie que l’utilisateur est le créateur
        if (interaction.user.id !== group.creator) {
            return interaction.editReply(`❌ Seul le créateur du groupe peut supprimer ce salon. <@${group.creator}>`);
        }

        try {
            // Supprime le salon
            await channel.delete();

            // Nettoie dans groups.json
            delete groups[channel.id];
            fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));

            console.log(`🗑️ Salon supprimé : ${channel.name}`);
        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Erreur lors de la suppression du salon.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
