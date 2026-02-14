console.log("event:", JSON.stringify(event));

import express from "express";
import { Client } from "@line/bot-sdk";

const app = express();
app.use(express.json());

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// 返信文テンプレ（今は薪割りだけ）
const DETAIL_TEXT = {
  makiwari:
`時間
15:00〜22:00まで
場所
キッチンカー横の薪割り機周辺

ご予約は不要です。体験ご希望の方は、周辺のスタッフにお声がけください。`
};

app.get("/", (_req, res) => res.status(200).send("ok"));

app.post("/webhook", async (req, res) => {
  try {
    const events = req.body?.events || [];

    for (const event of events) {
      if (event.type !== "postback") continue;

      const params = new URLSearchParams(event.postback?.data || "");
      if (params.get("action") !== "show_detail") continue;

      const id = params.get("id");
      const text = DETAIL_TEXT[id];
      if (!text) continue;

      await client.replyMessage(event.replyToken, { type: "text", text });
    }

    res.sendStatus(200);
  } catch (e) {
    // LINEは200を返すのが無難（再送を抑える）
    res.sendStatus(200);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));