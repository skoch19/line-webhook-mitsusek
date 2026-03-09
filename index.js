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
      replyToken,
      messages: Array.isArray(messages) ? messages : [messages]
    })
  });

  if (!res.ok) {
    console.error(await res.text());
  }
}

app.get("/", (_, res) => res.send("ok"));

app.post("/webhook", (req, res) => {
  const events = req.body.events || [];
  res.sendStatus(200);
  Promise.all(events.map(handleEvent));
});

async function handleEvent(event) {

  if (event.type !== "postback") return;

  const data = event.postback.data;
  const replyToken = event.replyToken;

  // ===============================
  // チェックイン開始
  // ===============================

  if (data === "action=checkinStart") {

    return replyMessage(replyToken,{
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
            weight:"bold",
            size:"lg",
            color:"#5A3A36",
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
                type:"uri",
                label:"事前チェックインはこちら",
                uri:"https://dive-hotels.com/accounts/mypage"
              }
            },

            {
              type:"button",
              style:"secondary",
              action:{
                type:"postback",
                label:"入力したので、スタッフを呼ぶ",
                data:"action=callStaff"
              }
            }

          ]
        }
      }
    });

  }

  // ===============================
  // スタッフ呼び出し
  // ===============================

  if(data==="action=callStaff"){

    return replyMessage(replyToken,{
      type:"flex",
      altText:"スタッフ呼び出し",
      contents:{
        type:"bubble",
        body:{
          type:"box",
          layout:"vertical",
          spacing:"md",
          contents:[

            {
              type:"text",
              text:"スタッフが参りますので少々お待ちください。",
              wrap:true,
              align:"center"
            },

            {
              type:"button",
              style:"primary",
              color:"#E6B8AF",
              action:{
                type:"postback",
                label:"スタッフの案内でタップ",
                data:"action=checkinComplete"
              }
            }

          ]
        }
      }
    });

  }

  // ===============================
  // 部屋タイプ選択
  // ===============================

  if (data === "action=checkinComplete") {

    return replyMessage(replyToken,{
      type:"flex",
      altText:"部屋タイプ",
      contents:{
        type:"bubble",
        header:{
          type:"box",
          layout:"vertical",
          backgroundColor:"#E6B8AF",
          contents:[{
            type:"text",
            text:"お部屋タイプ",
            size:"lg",
            weight:"bold",
            color:"#5A3A36",
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
    });

  }

  // ===============================
  // 部屋番号選択
  // ===============================

  if(data.startsWith("action=selectRoomType")){

    const params=new URLSearchParams(data.split("&")[1]);
    const type=params.get("type");

    const roomMap={
      forest:["皇帝T(F)1","皇帝T(F)2"],
      bell:["テント3","テント4","テント5","テント6","テント7","テント8","テント9","テント10"],
      garden:["皇帝T(G)11","皇帝T(G)12"]
    };

    const rooms=roomMap[type];

    const carousel=rooms.map(room=>({

      type:"bubble",
      size:"micro",
      body:{
        type:"box",
        layout:"vertical",
        paddingAll:"20px",
        backgroundColor:"#E6B8AF",
        action:{
          type:"postback",
          label:room,
          data:`action=selectDinner&room=${room}`
        },
        contents:[{
          type:"text",
          text:room,
          size:"lg",
          weight:"bold",
          align:"center"
        }]
      }

    }));

    return replyMessage(replyToken,{
      type:"flex",
      altText:"部屋選択",
      contents:{
        type:"carousel",
        contents:carousel
      }
    });

  }

  // ===============================
  // 夕食時間選択
  // ===============================

  if(data.startsWith("action=selectDinner")){

    const params=new URLSearchParams(data.split("&")[1]);
    const room=params.get("room");

    const times=["17:00","17:30","18:00"];

    const contents=times.map(t=>({

      type:"box",
      layout:"vertical",
      margin:"sm",
      backgroundColor:"#E6B8AF",
      cornerRadius:"8px",
      action:{
        type:"postback",
        label:t,
        data:`action=confirm&room=${room}&time=${t}`
      },
      contents:[{
        type:"box",
        layout:"horizontal",
        paddingAll:"14px",
        contents:[{
          type:"text",
          text:`🍽️ ${t}`,
          weight:"bold",
          size:"md",
          align:"center"
        }]
      }]

    }));

    return replyMessage(replyToken,{

      type:"flex",
      altText:"夕食時間",
      contents:{
        type:"bubble",
        body:{
          type:"box",
          layout:"vertical",
          contents:contents
        }
      }

    });

  }

}

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log("MITSUSE server started"));
