import express from "express";
import { Client } from "@line/bot-sdk";

const app = express();
app.use(express.json());

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// messageで無視するワード
const IGNORE_MESSAGES = [
  "#家族風呂の予約をする",
  "#アクティビティを見る",
  "#ドリンクメニュー",
];

// postbackで無視するワード
const IGNORE_POSTBACK_TEXTS = [
  "#家族風呂の予約をする",
  "#アクティビティを見る",
  "#ドリンクメニュー",
];

// 返信文テンプレ（薪割り用）
const DETAIL_TEXT = {
  makiwari: `時間
15:00〜22:00まで
場所
キッチンカー横の薪割り機周辺

ご予約は不要です。体験ご希望の方は、周辺のスタッフにお声がけください。`,
};

app.get("/", (_req, res) => res.status(200).send("ok"));

app.post("/webhook", async (req, res) => {
  try {
    const events = req.body?.events || [];

    console.log("=== webhook received ===");
    console.log("raw body:", JSON.stringify(req.body, null, 2));

    for (const event of events) {
      console.log("event:", JSON.stringify(event, null, 2));

      // =========================
      // ✅ message処理（今回の目的）
      // =========================
      if (event.type === "message") {
        const text = event.message?.text || "";

        if (IGNORE_MESSAGES.includes(text)) {
          console.log("IGNORED message:", text);
          continue; // 返信しない＝通知鳴らない
        }

        // それ以外の通常メッセージは通知させる
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "メッセージを受信しました",
        });

        console.log("replied normal message");
        continue;
      }

      // =========================
      // postback処理
      // =========================
      if (event.type !== "postback") continue;

      const data = event.postback?.data || "";
      const params = new URLSearchParams(data);

      console.log("postback.data:", data);
      console.log("postback.params:", Object.fromEntries(params.entries()));

      const text = params.get("text");

      if (text && IGNORE_POSTBACK_TEXTS.includes(text)) {
        console.log("IGNORED postback:", text);
        continue;
      }

      if (params.get("action") === "show_detail") {
        const id = params.get("id");
        const detailText = DETAIL_TEXT[id];

        if (!detailText) {
          console.log("detail not found:", id);
          continue;
        }

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: detailText,
        });

        console.log("replied detail:", id);
        continue;
      }

      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "通知しました",
      });

      console.log("replied default notification");
    }

    res.sendStatus(200);
  } catch (e) {
    console.error("ERROR:", e);
    res.sendStatus(200);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));