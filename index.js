import fs from "fs";
import path from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// Charger toutes les commandes
client.commands = new Collection();
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    // Lecture des groupes enregistrés
    const GROUPS_FILE = "groups.json";
    if (fs.existsSync(GROUPS_FILE)) {
        try {
            const groups = JSON.parse(fs.readFileSync(GROUPS_FILE, "utf8"));
            const groupEntries = Object.entries(groups);

            if (groupEntries.length === 0) {
                console.log("📂 Aucun groupe enregistré.");
            } else {
                console.log("📂 Groupes enregistrés :");

                for (const [channelId, group] of groupEntries) {
                    try {
                        const creator = await client.users.fetch(group.creator);
                        const channel = await client.channels.fetch(channelId).catch(() => null);
                        const channelName = channel ? channel.name : "❌ Salon introuvable";

                        console.log(
                            `- ${group.name} (Salon: ${channelName}, ID: ${channelId}) | Créateur: ${creator.tag} (${group.creator})`
                        );
                    } catch {
                        console.log(
                            `- ${group.name} (Salon ID: ${channelId}) | Créateur ID: ${group.creator}`
                        );
                    }
                }
            }
        } catch (err) {
            console.error("❌ Erreur de lecture du fichier groups.json :", err);
        }
    } else {
        console.log("📂 groups.json introuvable.");
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "❌ Une erreur est survenue lors de l’exécution de cette commande.",
            ephemeral: true,
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
