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
const POST_CHANNEL_ID = process.env.POST_CHANNEL_ID;
const DATA_CHANNEL_ID = process.env.DATA_CHANNEL_ID;
const KING_ID = process.env.KING_ID;

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
    const MsgContent = action.message.content;
    const orderIDIndex = MsgContent.search("Order ID:");
    // console.log(orderIDIndex);
    const orderID = MsgContent.substring(orderIDIndex + 9, orderIDIndex + 22);
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
  console.log("Bot Online 9/25/2022 update v2");
});

client.login(BOT_TOKEN);
