import express from "express";
import { Client } from "@line/bot-sdk";

const app = express();
app.use(express.json());

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

app.get("/", (_req, res) => res.status(200).send("ok"));

app.post("/webhook", async (req, res) => {
  try {
    const events = req.body?.events || [];

    for (const event of events) {

      // 🔹 通常メッセージは何もしない（通知だけ鳴る）
      if (event.type === "message") {
        continue;
      }

      // 🔹 postback処理
      if (event.type === "postback") {
        const data = event.postback.data;

        if (data === "action=familybath") {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "家族風呂のご案内はこちらです。",
          });
        }

        if (data === "action=activity") {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "アクティビティ一覧はこちらです。",
          });
        }

        if (data === "action=drink") {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "ドリンクメニューはこちらです。",
          });
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(200);
  }
});

const port = process.env.PORT || 3000;
app.listen(port);