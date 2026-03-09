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
    headers: { "Authorization": `Bearer ${TOKEN}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

app.get("/", (_req, res) => res.status(200).send("ok"));

app.post("/webhook", (req, res) => {
  const events = req.body?.events || [];
  res.sendStatus(200);
  Promise.all(events.map(handleEvent)).catch(console.error);
});

async function handleEvent(event) {

  if (event.type === "message" && event.message.type === "text") {
    const text = event.message.text;

    if (text.startsWith("チェックイン完了")) {
      return replyMessage(event.replyToken, [{
        type: "flex",
        altText: "チェックイン完了",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#E6B8AF",
            contents: [{
              type: "text",
              text: "チェックイン完了 ✅",
              color: "#5A3A36",
              weight: "bold",
              size: "lg",
              align: "center"
            }]
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "本日はごゆっくりお過ごしください。\n\n最後に同意書のご記入をお願いします。",
              wrap: true,
              align: "center"
            }]
          }
        }
      }]);
    }

    if (text.includes("チェックイン")) {
      const profile = await getProfile(event.source.userId);
      const name = profile ? profile.displayName : "お客様";

      return replyMessage(event.replyToken,{
        type:"text",
        text:`${name}さま

本日はザランタン三瀬高原にご宿泊いただきありがとうございます😊

【チェックインのご案内】
チェックインフォームはこちら
https://dive-hotels.com/accounts/mypage`
      });
    }

    return;
  }

  if (event.type !== "postback") return;

  const data = event.postback.data;
  const replyToken = event.replyToken;

  if (data === "action=checkinStart") {
    return replyMessage(replyToken,[{
      type:"flex",
      altText:"チェックイン",
      contents:{
        type:"bubble",
        header:{
          type:"box",
          layout:"vertical",
          backgroundColor:"#E6B8AF",
          contents:[{
            type:"text",
            text:"チェックインのご案内",
            color:"#5A3A36",
            weight:"bold",
            size:"lg",
            align:"center"
          }]
        },
        body:{
          type:"box",
          layout:"vertical",
          contents:[
            {
              type:"button",
              style:"primary",
              color:"#8B3A2F",
              action:{
                type:"uri",
                label:"チェックインフォーム",
                uri:"https://dive-hotels.com/accounts/mypage"
              }
            },
            {
              type:"button",
              style:"secondary",
              action:{
                type:"postback",
                label:"入力済み",
                data:"action=checkinComplete"
              }
            }
          ]
        }
      }
    }]);
  }

  if (data === "action=checkinComplete") {
    return replyMessage(replyToken,[{
      type:"flex",
      altText:"部屋タイプ選択",
      contents:{
        type:"bubble",
        header:{
          type:"box",
          layout:"vertical",
          backgroundColor:"#E6B8AF",
          contents:[{
            type:"text",
            text:"お部屋タイプの選択",
            color:"#5A3A36",
            weight:"bold",
            size:"lg",
            align:"center"
          }]
        },
        body:{
          type:"box",
          layout:"vertical",
          spacing:"md",
          contents:[
            {
              type:"button",
              style:"primary",
              color:"#4A6741",
              action:{
                type:"postback",
                label:"皇帝テント（フォレスト）",
                data:"action=selectRoomType&type=forest"
              }
            },
            {
              type:"button",
              style:"primary",
              color:"#E6B8AF",
              action:{
                type:"postback",
                label:"ベルテント",
                data:"action=selectRoomType&type=bell"
              }
            },
            {
              type:"button",
              style:"primary",
              color:"#5C8A52",
              action:{
                type:"postback",
                label:"皇帝テント（ガーデン）",
                data:"action=selectRoomType&type=garden"
              }
            }
          ]
        }
      }
    }]);
  }

  if (data.startsWith("action=selectRoomType")) {

    const params=new URLSearchParams(data.split("&")[1]);
    const type=params.get("type");

    const roomMap={
      forest:[
        {name:"皇帝T(F)1",color:"#4A6741"},
        {name:"皇帝T(F)2",color:"#4A6741"}
      ],
      bell:Array.from({length:8},(_,i)=>({
        name:`テント${i+3}`,
        color:"#E6B8AF"
      })),
      garden:[
        {name:"皇帝T(G)11",color:"#5C8A52"},
        {name:"皇帝T(G)12",color:"#5C8A52"}
      ]
    };

    const rooms=roomMap[type];
    const isBell=type==="bell";

    let carouselContents;

    if(isBell){

      carouselContents=rooms.map(room=>({
        type:"bubble",
        size:"micro",
        body:{
          type:"box",
          layout:"vertical",
          backgroundColor:"#E6B8AF",
          paddingAll:"16px",
          action:{
            type:"postback",
            label:room.name,
            data:`action=selectDinner&room=${room.name}`
          },
          contents:[{
            type:"text",
            text:room.name,
            weight:"bold",
            size:"lg",
            align:"center"
          }]
        }
      }));

    }else{

      carouselContents=rooms.map(room=>({
        type:"bubble",
        size:"micro",
        body:{
          type:"box",
          layout:"vertical",
          backgroundColor:room.color,
          paddingAll:"20px",
          action:{
            type:"postback",
            label:room.name,
            data:`action=selectDinner&room=${room.name}`
          },
          contents:[{
            type:"text",
            text:room.name,
            weight:"bold",
            size:"lg",
            color:"#FFFFFF",
            align:"center"
          }]
        }
      }));

    }

    return replyMessage(replyToken,[{
      type:"flex",
      altText:"部屋選択",
      contents:{
        type:"carousel",
        contents:carouselContents
      }
    }]);

  }

}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MITSUSE server started"));
