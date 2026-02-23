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

      // messageは何もしない（通知だけON・自動返信なし）
      if (event.type === "message") {
        continue;
      }

      // =========================
      // postback処理
      // =========================
      if (event.type === "postback") {

        const data = event.postback.data;

        // 🛁 家族風呂（文章のみ）
        if (data === "action=familybath") {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text:
`家族風呂のご予約をご希望の方は

①ご予約番号
②お名前
③12時〜17時までの間でご希望時間（1時間制）

の送信をお願いいたします🙇‍♀️

ご予約状況によってはご希望に沿うことができない可能性がございます。
あらかじめご了承ください。`
          });
          continue;
        }

        // 🍹 ドリンク（文章のみ）
        if (data === "action=drink") {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text:
`各種ドリンクのご注文は公式LINEから、
お支払いは受付にて承っております。`
          });
          continue;
        }

        // 🎪 アクティビティ（横スクロール＋URL付き）
        if (data === "action=activity") {
          await client.replyMessage(event.replyToken, {
            type: "flex",
            altText: "アクティビティ一覧",
            contents: {
              type: "carousel",
              contents: [

                // ピザ
                {
                  type: "bubble",
                  hero: {
                    type: "image",
                    url: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771839545/pizap_p1vwr7.jpg",
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover",
                    action: {
                      type: "uri",
                      uri: "https://glampicks.jp/glamping/g23617/official/?activity_option=1716163127&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                    }
                  },
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "ピザ体験",
                        weight: "bold",
                        size: "lg"
                      }
                    ]
                  },
                  footer: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "button",
                        style: "primary",
                        action: {
                          type: "uri",
                          label: "詳細を見る",
                          uri: "https://glampicks.jp/glamping/g23617/official/?activity_option=1716163127&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                        }
                      }
                    ]
                  }
                },

                // サウナ
                {
                  type: "bubble",
                  hero: {
                    type: "image",
                    url: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771839546/saunap_uizlbi.jpg",
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover",
                    action: {
                      type: "uri",
                      uri: "https://glampicks.jp/glamping/g23617/official/?activity_option=1683730809&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                    }
                  },
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "サウナ",
                        weight: "bold",
                        size: "lg"
                      }
                    ]
                  },
                  footer: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "button",
                        style: "primary",
                        action: {
                          type: "uri",
                          label: "詳細を見る",
                          uri: "https://glampicks.jp/glamping/g23617/official/?activity_option=1683730809&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                        }
                      }
                    ]
                  }
                },

                // アスレチック
                {
                  type: "bubble",
                  hero: {
                    type: "image",
                    url: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771839546/athp_ncdqqn.jpg",
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover",
                    action: {
                      type: "uri",
                      uri: "https://glampicks.jp/glamping/g23617/official/?activity_option=1739016438&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                    }
                  },
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "アスレチック",
                        weight: "bold",
                        size: "lg"
                      }
                    ]
                  },
                  footer: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "button",
                        style: "primary",
                        action: {
                          type: "uri",
                          label: "詳細を見る",
                          uri: "https://glampicks.jp/glamping/g23617/official/?activity_option=1739016438&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                        }
                      }
                    ]
                  }
                }

              ]
            }
          });
          continue;
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
app.listen(port, () => console.log(`listening on ${port}`));
