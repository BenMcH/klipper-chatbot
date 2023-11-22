# Klipper chat

This repo is an attempt at combining the OpenAI APIs with a custom data store, the [Klipper Configuration Referece](https://www.klipper3d.org/Config_Reference.html), as a means to create a chat bot suited to help configure your 3d printer's firmware. This repo stores OpenAI embeddings in a SQLite table, `articles` when `index.mjs` is run. Once embeddings have been generated, `query.mjs` can be run in order to ask the user a question, embed their question, and then pass the 20 most similar knowledge base responses to GPT-3.5-Turbo along with the question to provide a relevant answer to the user.

Each time the `query.mjs` file is run, the virtual table created with `sqlite-vss` is dropped and then recreated such that any new embeddings are automatically picked up but that we don't encounter duplicates when providing information to the GPT apis.

## Example chat:

```
➜  klipper-chat git:(main) ✗ node query.mjs 
How can I help you?
how do i add a bltouch to my printer?
To add a BLTouch to your printer, you need to follow these steps:

1. Configure the BLTouch probe in your Klipper configuration file. You can find the configuration section for the BLTouch probe in the "Bed probing hardware" section. The relevant configuration reference is [bltouch].

2. Uncomment the `sensor_pin` parameter in the `[bltouch]` section and provide the pin connected to the BLTouch sensor. Most BLTouch devices require a pullup on the sensor pin, so if needed, prefix the pin name with "^".

3. Uncomment the `control_pin` parameter in the `[bltouch]` section and provide the pin connected to the BLTouch control.

4. Save the changes to your configuration file.

5. Restart your printer and test the BLTouch probe.

Make sure to refer to the [BL-Touch guide](BLTouch.md) and the [command reference](G-Codes.md#bltouch) for detailed information on configuring and using the BLTouch probe with Klipper.
```

*Note: This chat is not meant to be fully accurate and still has the capability of hallucination. This repo's purpose is simply to provide myself a playground to test out sqlite-vss and retrieval augmented generation (RAG).*
