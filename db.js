import sqlite3 from "sqlite3";
const db = new sqlite3.Database('groups.db');

// Création de la table si elle n'existe pas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS groups (
    channel_id TEXT PRIMARY KEY,
    name TEXT,
    creator TEXT
  )`);
});

const myDB = {
  addGroup: (channelId, name, creator) => {
    db.run(
      `INSERT INTO groups (channel_id, name, creator) VALUES (?, ?, ?)`,
      [channelId, name, creator]
    );
  },
  removeGroup: (channelId) => {
    db.run(`DELETE FROM groups WHERE channel_id = ?`, [channelId]);
  },
  getGroup: (channelId, cb) => {
    db.get(`SELECT * FROM groups WHERE channel_id = ?`, [channelId], cb);
  },
  getAllGroups: (cb) => {
    db.all(`SELECT * FROM groups`, [], cb);
  }
};

export default myDB;