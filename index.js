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
  res.sendStatus(200); // 先に200を返す
  Promise.all(events.map(handleEvent)).catch(err => console.error(err));
});

async function handleEvent(event) {

  // チェックイン（通常メッセージ）
  if (event.type === "message" && event.message.type === "text") {
    const text = event.message.text;

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
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MITSUSE server started"));
