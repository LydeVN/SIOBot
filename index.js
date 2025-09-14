import fs from "fs";
import path from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

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

// Connexion SQLite
let db;
async function connectDB() {
  db = await open({
    filename: "./database.db", // ton fichier .db
    driver: sqlite3.Database,
  });
  console.log("✅ Connecté à la base SQLite");
}

client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // Afficher les groupes enregistrés
  try {
    const rows = await db.all("SELECT channelId, name, creator FROM groups");

    if (rows.length === 0) {
      console.log("📂 Aucun groupe enregistré en base.");
    } else {
      console.log("📂 Groupes enregistrés en base :");

      for (const row of rows) {
        try {
          const creator = await client.users.fetch(row.creator);
          const channel = await client.channels.fetch(row.channelId).catch(() => null);
          const channelName = channel ? channel.name : "❌ Salon introuvable";

          console.log(
            `- ${row.name} (Salon: ${channelName}, ID: ${row.channelId}) | Créateur: ${creator.tag} (${row.creator})`
          );
        } catch {
          console.log(
            `- ${row.name} (Salon ID: ${row.channelId}) | Créateur ID: ${row.creator}`
          );
        }
      }
    }
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des groupes :", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, db); // 👈 passe la DB aux commandes
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Une erreur est survenue lors de l’exécution de cette commande.",
      ephemeral: true,
    });
  }
});

await connectDB();
client.login(process.env.DISCORD_TOKEN);
