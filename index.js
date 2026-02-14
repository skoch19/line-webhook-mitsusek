import express from "express";
import { Client } from "@line/bot-sdk";

const app = express();
app.use(express.json());

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// postbackのtextで「無視するワード」
const IGNORE_TEXTS = [
  "#家族風呂の予約をする",
  "#アクティビティを見る",
  "#ドリンクメニュー",
];

// 返信文テンプレ（今は薪割りだけ）
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

      // postback以外は無視
      if (event.type !== "postback") continue;

      const data = event.postback?.data || "";
      const params = new URLSearchParams(data);

      console.log("postback.data:", data);
      console.log("postback.params:", Object.fromEntries(params.entries()));

      // あなたのrichmenuは action=keyword & text=... なのでここを見る
      const text = params.get("text");

      // 指定3つなら「何もしない（ログだけ）」
      if (text && IGNORE_TEXTS.includes(text)) {
        console.log("IGNORED postback:", text);
        continue;
      }

      // action=show_detail&id=makiwari 形式（薪割り用）
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

      // その他のpostbackは通知（返信メッセージ）
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
