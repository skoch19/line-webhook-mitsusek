import express from "express";
import { Client } from "@line/bot-sdk";

const app = express();
app.use(express.json());

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

const OWNER_ID = process.env.OWNER_ID;



app.get("/", (req, res) => {
  res.send("ok");
});



app.post("/webhook", async (req, res) => {

  const events = req.body.events;

  for (const event of events) {

    if (event.type !== "postback") continue;

    const data = new URLSearchParams(event.postback.data);
    const action = data.get("action");



    // チェックイン開始
    if (action === "checkinStart") {
      await sendRoomType(event.replyToken);
    }



    // 部屋タイプ選択
    if (action === "selectType") {

      const type = data.get("type");

      await sendRoomSelect(event.replyToken, type);
    }



    // 部屋選択
    if (action === "selectRoom") {

      const room = data.get("room");

      await sendDinnerSelect(event.replyToken, room);
    }



    // 夕食選択
    if (action === "selectDinner") {

      const room = data.get("room");
      const time = data.get("time");

      await sendConfirm(event.replyToken, room, time);
    }



    // 確定
    if (action === "confirmCheckin") {

      const room = data.get("room");
      const time = data.get("time");

      await client.pushMessage(OWNER_ID, {
        type: "text",
        text: `チェックイン完了
お部屋：${room}
夕食時間：${time}`
      });

      await client.replyMessage(event.replyToken, {
        type: "text",
        text: `チェックイン完了
本日はごゆっくりお過ごしください。

（わくわくのもりをご利用される方はこちら）
https://docs.google.com/forms/d/e/1FAIpQLSfUwLl-prlCVQmcb8rS4wGWr1RHQ6g96orTTbe1MUrPSPWpPg/viewform`
      });

    }

  }

  res.sendStatus(200);

});



app.listen(process.env.PORT || 3000);



/* =========================
   部屋タイプ選択
========================= */

async function sendRoomType(token) {

  await client.replyMessage(token, {
    type: "flex",
    altText: "部屋タイプ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "お部屋タイプを選択してください",
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
            color: "#e8a0a8",
            action: {
              type: "postback",
              label: "皇帝テント（フォレスト）",
              data: "action=selectType&type=forest"
            }
          },

          {
            type: "button",
            style: "primary",
            color: "#e8a0a8",
            action: {
              type: "postback",
              label: "ベルテント",
              data: "action=selectType&type=bell"
            }
          },

          {
            type: "button",
            style: "primary",
            color: "#e8a0a8",
            action: {
              type: "postback",
              label: "皇帝テント（ガーデン）",
              data: "action=selectType&type=garden"
            }
          }

        ]
      }
    }
  });

}



/* =========================
   部屋番号選択
========================= */

async function sendRoomSelect(token, type) {

  let rooms = [];

  if (type === "forest") {
    rooms = ["皇帝1", "皇帝2"];
  }

  if (type === "bell") {
    rooms = [
      "テント3",
      "テント4",
      "テント5",
      "テント6",
      "テント7",
      "テント8",
      "テント9",
      "テント10"
    ];
  }

  if (type === "garden") {
    rooms = ["皇帝11", "皇帝12"];
  }



  await client.replyMessage(token, {
    type: "flex",
    altText: "部屋選択",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "お部屋を選択してください",
            weight: "bold",
            size: "lg"
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: rooms.map(room => ({
          type: "button",
          style: "primary",
          color: "#e8a0a8",
          action: {
            type: "postback",
            label: room,
            data: `action=selectRoom&room=${room}`
          }
        }))
      }
    }
  });

}



/* =========================
   夕食時間
========================= */

async function sendDinnerSelect(token, room) {

  const times = ["17:30", "18:00", "18:30", "19:00"];

  await client.replyMessage(token, {
    type: "flex",
    altText: "夕食時間",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "夕食時間を選択してください",
            weight: "bold",
            size: "lg"
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: times.map(time => ({
          type: "button",
          style: "primary",
          color: "#e8a0a8",
          action: {
            type: "postback",
            label: time,
            data: `action=selectDinner&room=${room}&time=${time}`
          }
        }))
      }
    }
  });

}



/* =========================
   確認
========================= */

async function sendConfirm(token, room, time) {

  await client.replyMessage(token, {
    type: "flex",
    altText: "確認",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "内容のご確認", weight: "bold", size: "lg" },
          { type: "text", text: `部屋：${room}` },
          { type: "text", text: `夕食：${time}` }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#e8a0a8",
            action: {
              type: "postback",
              label: "間違いなければこちらをタップ",
              data: `action=confirmCheckin&room=${room}&time=${time}`
            }
          }
        ]
      }
    }
  });

}
