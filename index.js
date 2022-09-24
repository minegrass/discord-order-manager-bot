import {
  Client,
  GatewayIntentBits,
  messageLink,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const POST_CHANNEL_ID = "1023213223530483785";
const DATA_CHANNEL_ID = "1023239465906491433";
const KING_ID = "354146574533656586";

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("takeBtn")
    .setLabel("TAKE ORDER")
    .setStyle(ButtonStyle.Primary)
);
const disable_btn = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("takeBtn")
    .setLabel("TAKEN")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)
);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", async (msg) => {
  if (msg.author.id === `${KING_ID}`) {
    if (msg.content.includes("!send")) {
      const userContent = msg.content.substring(6).split("/");
      const orderID = Date.now();
      const [username, password, req, price] = userContent;
      const orderData = {
        orderID: orderID,
        username: username,
        password: password,
        req: req,
        price: price,
      };
      await client.channels.cache
        .get(`${DATA_CHANNEL_ID}`)
        .send(JSON.stringify(orderData));
      await client.channels.cache.get(`${POST_CHANNEL_ID}`).send({
        content: `@everyone NEW ORDER ARRIVED!\n Order ID:${orderID}\n Order details:${req}\n Price:${price}`,
        components: [row],
      });
    }
  }
});

client.on("interactionCreate", async (action) => {
  if (action.customId === "takeBtn") {
    // console.log(action);
    const orderID = action.message.content.substring(29, 42);
    // console.log(orderID);
    const channel = client.channels.cache.get(DATA_CHANNEL_ID);
    await channel.messages.fetch({ limit: 100 }).then((messages) => {
      //Iterate through the messages here with the variable "messages".
      messages.forEach(async (message) => {
        const jsonMSG = JSON.parse(message);
        if (jsonMSG.orderID == orderID) {
          await action.user.send(
            `U TOOK ORDER WITH ID : ${orderID}\n username : ${jsonMSG.username}\n password : ${jsonMSG.password}\n Order details : ${jsonMSG.req}\n Price : ${jsonMSG.price}\n DM <@${KING_ID}> picture of BEFORE and AFTER.\n GOOD LUCK AND FA DA CHAI !`
          );
        }
        await action.message.edit({
          content: `TOO LATE ORDER TAKEN!\n Order ID:${orderID}\n Order details:${jsonMSG.req}\n Price:${jsonMSG.price}`,
          components: [disable_btn],
        });
      });
    });

    await action.deferUpdate();
    await client.users.cache
      .get(KING_ID)
      .send(`<@${action.user.id}> took order with id : ${orderID}`);
  }
});

client.once("ready", () => {
  console.log("Bot Online");
});

client.login(BOT_TOKEN);
