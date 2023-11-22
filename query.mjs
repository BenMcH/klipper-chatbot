import OpenAI from 'openai';
import invariant from 'invariant';
import Database from "better-sqlite3";
import * as sqlite_vss from "sqlite-vss";
import readline from 'readline/promises'

const db = new Database('klipper.db');
db.pragma('journal_mode = WAL');
sqlite_vss.load(db)

db.exec(`DROP TABLE IF EXISTS vss_articles;`);

db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS vss_articles using vss0 (
    embedding(1536)
);`);

db.exec(`insert into vss_articles(rowid, embedding)
  select id, embedding from articles;`)

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

const io = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = await io.question("How can I help you?\n")

io.close()

const embedding = JSON.stringify(await embed(question))

// (select embedding from articles where rowid = 1)
const data = db.prepare(`with matches as (
  select 
    rowid, 
    distance
  from vss_articles
  where vss_search(
    embedding,
    ?
  )
  limit 20
)
select
  articles.rowid,
  articles.content,
  matches.distance
from matches
left join articles on articles.rowid = matches.rowid`).all(embedding)

let i = 1;

let query = `Question: ${question}\n\ninfo:\n`
for (let response of data) {
  query = `${query}\n${response.content}`
  // console.log(i++, response.content)
}

const response = await client.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: 'You are a chatbot helping answer klipper configuration issues. You will receive a question followed by potential resources. Use this to answer the question provided. Do not add additional information.'
    },
    {
      role: 'user',
      content: query
    }
  ]
});

console.log(response.choices[0].message.content)
