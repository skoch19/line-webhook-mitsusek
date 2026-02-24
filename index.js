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

      if (event.type === "message") continue;

      if (event.type === "postback") {

        const data = event.postback.data;

        // 🛁 家族風呂
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

        // 🍹 ドリンク
        if (data === "action=drink") {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text:
`各種ドリンクのご注文は公式LINEから、
お支払いは受付にて承っております。`
          });
          continue;
        }

        // 🎪 アクティビティ
        if (data === "action=activity") {

          const makeBubble = ({ title, price, img, url }) => ({
            type: "bubble",
            hero: {
              type: "image",
              url: img.replace("/upload/", "/upload/w_800,h_533,c_fill,g_auto/"),
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover",
              action: { type: "uri", uri: url }
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  position: "absolute",
                  offsetTop: "12px",
                  offsetStart: "12px",
                  backgroundColor: price ? "#00000099" : "#00000000",
                  cornerRadius: "20px",
                  paddingAll: "6px",
                  contents: price
                    ? [{
                        type: "text",
                        text: price,
                        size: "xs",
                        color: "#FFFFFF",
                        weight: "bold"
                      }]
                    : []
                },
                {
                  type: "box",
                  layout: "vertical",
                  position: "absolute",
                  offsetBottom: "0px",
                  width: "100%",
                  backgroundColor: "#00000080",
                  paddingAll: "14px",
                  contents: [{
                    type: "text",
                    text: title,
                    size: "lg",
                    weight: "bold",
                    color: "#FFFFFF",
                    align: "center"
                  }]
                }
              ],
              paddingAll: "0px",
              height: "0px"
            }
          });

          await client.replyMessage(event.replyToken, {
            type: "flex",
            altText: "アクティビティ一覧",
            contents: {
              type: "carousel",
              contents: [

                makeBubble({
                  title: "ピザ釜",
                  price: "¥1,100~",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899361/%E3%83%92%E3%82%9A%E3%82%B5%E3%82%99%E7%AA%AF_lq9hs7.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1716163127&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "テントサウナ",
                  price: "¥2,200~",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899361/%E3%82%B5%E3%82%A6%E3%83%8A_hpzzrd.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1683730809&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "森のたんけんアスレチック",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899364/%E3%82%A2%E3%82%B9%E3%83%AC%E3%83%81%E3%83%83%E3%82%AF_flwtan.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1739016438&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "やまびこの湯",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899363/%E3%82%84%E3%81%BE%E3%81%B2%E3%82%99%E3%81%93%E3%81%AE%E6%B9%AF_j0mqgj.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1760056490"
                }),

                makeBubble({
                  title: "星空デッキ",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899362/%E6%98%9F%E7%A9%BA%E3%83%86%E3%82%99%E3%83%83%E3%82%AD_p3wupx.png",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1690357206&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "ボードゲーム貸し出し",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899361/%E3%83%9B%E3%82%99%E3%83%BC%E3%83%88%E3%82%99%E3%82%B1%E3%82%99%E3%83%BC%E3%83%A0_brazlg.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1683730808&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "ランタン作り",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899362/%E3%83%A9%E3%83%B3%E3%82%BF%E3%83%B3_r18xv2.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1683730804&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "収穫体験",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899361/%E5%8F%8E%E7%A9%AB%E4%BD%93%E9%A8%93_fpgqzc.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1746012956&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                }),

                makeBubble({
                  title: "川遊び",
                  img: "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899361/%E5%B7%9D%E9%81%8A%E3%81%B2%E3%82%99_ary0qa.jpg",
                  url: "https://glampicks.jp/glamping/g23617/official/?activity_option=1746012959&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"
                })

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
