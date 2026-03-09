import express from "express";

const app = express();
app.use(express.json());

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function replyMessage(replyToken, messages) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: Array.isArray(messages) ? messages : [messages],
      notificationDisabled: false
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("LINE API error:", res.status, err);
  }
}

async function getProfile(userId) {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`
    }
  });
  if (!res.ok) return null;
  return await res.json();
}

app.get("/", (_req, res) => res.status(200).send("ok"));

app.post("/webhook", (req, res) => {
  const events = req.body?.events || [];
  res.sendStatus(200);
  Promise.all(events.map(handleEvent)).catch(err => console.error(err));
});

async function handleEvent(event) {

  // テキストメッセージ処理
  if (event.type === "message" && event.message.type === "text") {
    const text = event.message.text;

    // ⑤ チェックイン完了
    if (text.startsWith("チェックイン完了")) {
      return replyMessage(event.replyToken, [
        {
          type: "flex",
          altText: "チェックイン完了",
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              backgroundColor: "#e8b9a5",
              contents: [
                {
                  type: "text",
                  text: "チェックイン完了 ✅",
                  color: "#FFFFFF",
                  weight: "bold",
                  size: "lg",
                  align: "center"
                }
              ]
            },
            body: {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "本日はごゆっくりお過ごしください。\n\森のたんけんアスレチックご利用の方はタップ",
                  wrap: true,
                  size: "sm",
                  align: "center",
                  margin: "md"
                },
                {
                  type: "button",
                  style: "primary",
                  color: "#e8b9a5",
                  margin: "md",
                  action: {
                    type: "uri",
                    label: "アスレチック同意書",
                    uri: "https://docs.google.com/forms/d/e/1FAIpQLSfUwLl-prlCVQmcb8rS4wGWr1RHQ6g96orTTbe1MUrPSPWpPg/viewform"
                  }
                }
              ]
            }
          }
        }
      ]);
    }

    // 通常チェックイン案内
    if (text.includes("チェックイン")) {
      const profile = await getProfile(event.source.userId);
      const name = profile ? profile.displayName : "お客様";

      return replyMessage(event.replyToken, {
        type: "text",
        text:
`${name}さま

本日はザランタン三瀬高原にご宿泊いただきありがとうございます😊
ご滞在中、なにかございましたらこちらのLINEにてメッセージをお送りください。

ーーーーーーーーーーー
【チェックインのご案内】
チェックインフォームをまだご記入いただいていないお客様は、下記リンクよりご入力をお願いいたします。
https://dive-hotels.com/accounts/mypage

※複数テントをご予約のお客様は、テントごとにご記入をお願いいたします。
ーーーーーーーーーーー

【21:30以降のご連絡先】
21:30～翌朝07:30はスタッフが不在になります。
緊急時は下記の番号にご連絡ください。

070-3549-3069
※日中の電話はご遠慮ください。`
      });
    }
    return;
  }

  // Postback処理
  if (event.type !== "postback") return;

  const data = event.postback.data;
  const replyToken = event.replyToken;

  // 家族風呂
  if (data === "action=familybath") {
    return replyMessage(replyToken, {
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
  }

  // ドリンク
  else if (data === "action=drink") {
    const drinkImage = "https://res.cloudinary.com/dtbvrmjru/image/upload/v1771899362/%E3%83%88%E3%82%99%E3%83%AA%E3%83%B3%E3%82%AF%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC_y4emlf.png";

    return replyMessage(replyToken, [
      {
        type: "text",
        text:
`各種ドリンクのご注文は公式LINEから、
お支払いは受付にて承っております。`
      },
      {
        type: "image",
        originalContentUrl: drinkImage,
        previewImageUrl: drinkImage
      }
    ]);
  }

  // アクティビティ
  else if (data === "action=activity") {
    const makeBubble = (img, url) => ({
      type: "bubble",
      hero: {
        type: "image",
        url: img,
        size: "full",
        aspectMode: "cover",
        action: {
          type: "uri",
          uri: url
        }
      }
    });

    return replyMessage(replyToken, {
      type: "flex",
      altText: "アクティビティ一覧",
      contents: {
        type: "carousel",
        contents: [
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905293/1_navye5.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1716163127&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905294/2_x7wzdh.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1683730809&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905295/3_fvwfae.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1739016438&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905294/4_pohlnx.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1760056490"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905295/5_dgp9gl.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1690357206&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905294/6_adivwy.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1683730808&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905299/7_gsq0pv.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1683730804&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905293/8_bnjbzj.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1746012956&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu"),
          makeBubble("https://res.cloudinary.com/dtbvrmjru/image/upload/v1771905294/9_crtr6w.png","https://glampicks.jp/glamping/g23617/official/?activity_option=1746012959&utm_source=LINE&utm_medium=referral&utm_campaign=activity_richmenu")
        ]
      }
    });
  }

  // ① チェックイン開始
  else if (data === "action=checkinStart") {
    return replyMessage(replyToken, [
      {
        type: "flex",
        altText: "チェックインのご案内",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#e8b9a5",
            contents: [
              {
                type: "text",
                text: "チェックインのご案内",
                color: "#FFFFFF",
                weight: "bold",
                size: "lg",
                align: "center"
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#e8b9a5",
                action: {
                  type: "uri",
                  label: "チェックインフォームの入力",
                  uri: "https://dive-hotels.com/accounts/mypage"
                }
              },
              {
                type: "button",
                style: "secondary",
                action: {
                  type: "postback",
                  label: "入力済みの方はこちら",
                  data: "action=checkinComplete"
                }
              }
            ]
          }
        }
      }
    ]);
  }

  // ② 部屋タイプ選択
  else if (data === "action=checkinComplete") {
    return replyMessage(replyToken, [
      {
        type: "flex",
        altText: "お部屋タイプを選択してください",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#e8b9a5",
            contents: [
              {
                type: "text",
                text: "お部屋タイプの選択",
                color: "#FFFFFF",
                weight: "bold",
                size: "lg",
                align: "center"
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#4A6741",
                action: {
                  type: "postback",
                  label: "皇帝テント（フォレスト）1・2",
                  data: "action=selectRoomType&type=forest"
                }
              },
              {
                type: "button",
                style: "primary",
                color: "#e8b9a5",
                action: {
                  type: "postback",
                  label: "ベルテント 3〜10",
                  data: "action=selectRoomType&type=bell"
                }
              },
              {
                type: "button",
                style: "primary",
                color: "#5C8A52",
                action: {
                  type: "postback",
                  label: "皇帝テント（ガーデン）11・12",
                  data: "action=selectRoomType&type=garden"
                }
              }
            ]
          }
        }
      }
    ]);
  }

  // ②-b 部屋番号カルーセル
  else if (data.startsWith("action=selectRoomType")) {
    const params = new URLSearchParams(data.split("&").slice(1).join("&"));
    const type = params.get("type");

    const roomMap = {
      forest: [
        { name: "皇帝T(F)1", color: "#4A6741" },
        { name: "皇帝T(F)2", color: "#4A6741" }
      ],
      bell: Array.from({ length: 8 }, (_, i) => ({ name: `ベルテント${i + 3}`, color: "#e8b9a5" })),
      garden: [
        { name: "皇帝T(G)11", color: "#5C8A52" },
        { name: "皇帝T(G)12", color: "#5C8A52" }
      ]
    };

    const rooms = roomMap[type];
    const isBell = type === "bell";

    let carouselContents;

    if (isBell) {
      const grouped = [];
      for (let i = 0; i < rooms.length; i += 2) {
        grouped.push(rooms.slice(i, i + 2));
      }
      carouselContents = grouped.map(group => ({
        type: "bubble",
        size: "nano",
        body: {
          type: "box",
          layout: "vertical",
          backgroundColor: group[0].color,
          paddingAll: "8px",
          spacing: "sm",
          contents: group.map(room => ({
            type: "button",
            style: "primary",
            color: "#d4967e",
            height: "sm",
            action: {
              type: "postback",
              label: room.name,
              data: `action=selectDinner&room=${room.name}`
            }
          }))
        }
      }));
    } else {
      carouselContents = rooms.map(room => ({
        type: "bubble",
        size: "nano",
        body: {
          type: "box",
          layout: "vertical",
          backgroundColor: room.color,
          paddingAll: "10px",
          alignItems: "center",
          justifyContent: "center",
          action: {
            type: "postback",
            label: room.name,
            data: `action=selectDinner&room=${room.name}`
          },
          contents: [
            {
              type: "text",
              text: room.name,
              weight: "bold",
              size: "sm",
              color: "#FFFFFF",
              align: "center",
              wrap: true
            }
          ]
        }
      }));
    }

    return replyMessage(replyToken, [
      {
        type: "text",
        text: isBell
          ? "スクロール・タップしてください 👉"
          : "お部屋番号を選択してください 👇"
      },
      {
        type: "flex",
        altText: "部屋番号を選択してください",
        contents: {
          type: "carousel",
          contents: carouselContents
        }
      }
    ]);
  }

  // ③ 夕食時間選択
  else if (data.startsWith("action=selectDinner")) {
    const params = new URLSearchParams(data.split("&").slice(1).join("&"));
    const room = params.get("room");

    return replyMessage(replyToken, [
      {
        type: "text",
        text: `${room} で承りました。\n夕食のご希望時間を選択してください 👇`
      },
      {
        type: "flex",
        altText: "夕食時間を選択してください",
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "夕食時間の選択",
                weight: "bold",
                size: "lg",
                align: "center",
                margin: "md"
              },
              {
                type: "box",
                layout: "vertical",
                margin: "sm",
                backgroundColor: "#e8b9a5",
                cornerRadius: "8px",
                action: {
                  type: "postback",
                  label: "17:00",
                  data: `action=confirm&room=${room}&time=17:00`
                },
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    paddingAll: "13px",
                    alignItems: "center",
                    contents: [
                      {
                        type: "text",
                        text: "🍽️ 17:00",
                        color: "#FFFFFF",
                        weight: "bold",
                        size: "md",
                        flex: 1
                      },
                      {
                        type: "text",
                        text: "おすすめ",
                        color: "#FFFFFF",
                        size: "xxs",
                        align: "end"
                      }
                    ]
                  }
                ]
              },
              ...[
                { label: "🍽️ 17:30", time: "17:30" },
                { label: "🍽️ 18:00", time: "18:00" },
                { label: "🍽️ 18:30", time: "18:30" }
              ].map(item => ({
                type: "box",
                layout: "vertical",
                margin: "sm",
                backgroundColor: "#e8b9a5",
                cornerRadius: "8px",
                action: {
                  type: "postback",
                  label: item.label,
                  data: `action=confirm&room=${room}&time=${item.time}`
                },
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    paddingAll: "13px",
                    contents: [
                      {
                        type: "text",
                        text: item.label,
                        color: "#FFFFFF",
                        weight: "bold",
                        size: "md"
                      }
                    ]
                  }
                ]
              }))
            ]
          }
        }
      }
    ]);
  }

  // ④ 確認画面
  else if (data.startsWith("action=confirm")) {
    const params = new URLSearchParams(data.split("&").slice(1).join("&"));
    const time = params.get("time");
    const room = params.get("room");

    return replyMessage(replyToken, [
      {
        type: "flex",
        altText: "内容をご確認ください",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#e8b9a5",
            contents: [
              {
                type: "text",
                text: "内容のご確認",
                color: "#FFFFFF",
                weight: "bold",
                size: "lg",
                align: "center"
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "お部屋番号", flex: 2, color: "#888888", size: "sm" },
                  { type: "text", text: room, flex: 3, weight: "bold", size: "sm" }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "夕食時間", flex: 2, color: "#888888", size: "sm" },
                  { type: "text", text: time, flex: 3, weight: "bold", size: "sm" }
                ]
              },
              { type: "separator" },
              {
                type: "button",
                style: "primary",
                color: "#e8b9a5",
                margin: "md",
                action: {
                  type: "message",
                  label: "間違いなければこちらをタップ",
                  text: `チェックイン完了\nお部屋：${room}\n夕食時間：${time}`
                }
              }
            ]
          }
        }
      }
    ]);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MITSUSE server started"));
