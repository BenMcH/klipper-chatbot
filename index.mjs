import OpenAI from 'openai';
import invariant from 'invariant';
import Database from "better-sqlite3";
import * as sqlite_vss from "sqlite-vss";
import { markdownToSections } from './md-breakup.mjs';
import fs from 'fs'

const db = new Database('klipper.db');
db.pragma('journal_mode = WAL');
sqlite_vss.load(db)

db.exec(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY,
    content TEXT NOT NULL,
    embedding BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);

const version = db.prepare("select vss_version()").pluck().get();
console.log({ version });

const apiKey = process.env.OPENAI_API_KEY
invariant(apiKey, "No OpenAI API key found")

const client = new OpenAI({
	apiKey
});

const embed = async (text) => {
	const embedding = await client.embeddings.create({
		model: 'text-embedding-ada-002',
		input: text
	})
	return embedding.data[0].embedding
}

const text = fs.readFileSync('./Config_Reference.md').toString()
const sections = await markdownToSections(text)

for (let text of sections) {
	if (!text.trim().includes('\n')) continue // Don't embed or insert. This indicates that only the header values are present, no real information

	const embeddings = await embed(text)

	const stmt = db.prepare(`INSERT INTO ARTICLES(content, embedding) VALUES (?, ?)`)

	stmt.run(text, JSON.stringify(embeddings))
}

