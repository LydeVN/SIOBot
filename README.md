# Discord Group Bot

This project is a **Discord bot** that allows users to create and manage private group channels.  
It includes commands to create groups, add members, remove members, and delete groups with proper permission checks.

---

## Requirements

### 1. `groups.json`
At the root of the project, you must have a file named **`groups.json`**.  
This file is used to reference the **creators of the channels** so that permission checks can be enforced  
(e.g., only the creator can remove members or delete a group).

### 2. `.env variables`
With theses following variables :
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_discord_server_id

### 3. `Bot permissions`

The bot needs the following permissions on your server:
- Manage Channels
- Send Messages
- Read Message History
- View Channels
- Use Application Commands
