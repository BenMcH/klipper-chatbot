# Klipper chat

This repo is an attempt at combining the OpenAI APIs with a custom data store, the [Klipper Configuration Referece](https://www.klipper3d.org/Config_Reference.html), as a means to create a chat bot suited to help configure your 3d printer's firmware. This repo stores OpenAI embeddings in a SQLite table, `articles` when `index.mjs` is run. Once embeddings have been generated, `query.mjs` can be run in order to ask the user a question, embed their question, and then pass the 20 most similar knowledge base responses to GPT-3.5-Turbo along with the question to provide a relevant answer to the user.

Each time the `query.mjs` file is run, the virtual table created with `sqlite-vss` is dropped and then recreated such that any new embeddings are automatically picked up but that we don't encounter duplicates when providing information to the GPT apis.

