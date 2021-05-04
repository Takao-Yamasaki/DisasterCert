// -----------------------------------------------------------------------------
// Firebase
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp ({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://disaster-cert-default-rtdb.firebaseio.com/"
});

// var db = admin.database();
// var ref = db.ref("protoout/studio");
// var userRef = ref.child("messageList");

// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const { text } = require("express");

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);


// -----------------------------------------------------------------------------
// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロセスを格納する配列。
    let events_processed = [];

    req.body.events.forEach((event) => {
        // ユーザーIDの取得
        var userId = event.source.userId;
        // ユーザの情報を変数に格納
        var storage = {
            userId:{stage: 0, name: null, address: null, housing: null, date: null, location: null, cause: null ,picture: null}
        };
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
            if (storage.userId.stage == 0){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, [{
                    type: "text",
                    text: "ようこそ！\nり災証明申請アプリです。\n申請を開始します。" 
                },
                {
                    type: "text",
                    text: "あなたの「氏名」を入力してください。"
                }])); 
                // firebase
                var database = firebase.database();
                let room = "chat_room";
                database.ref(room).push({
                    userId: userId,
                    name: event.message.text,
                    stage: 1
                });

            } else if(storage.userId.stage == 1) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "${getData['name']}さんの「住所」を入力してください。"
                }));

            } else if(storage.userId.stage == 2) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した物件」を入力してください・"
                }));

            } else if(storage.userId.stage == 3) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した年月日」を入力してください。"
                }));

            } else if(storage.userId.stage == 4) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した物件の所在」を入力してください。"
                }));

            } else if(storage.userId.stage == 5) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災の原因」を入力してください。"
                }));

            } else if(storage.userId.stage == '6') {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災の状況がわかる写真」を添付してください。"
                }));
            
            } else if(storage.userId.stage == '7') {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "り災証明の申請が完了しました。\n申請内容を確認後、市役所の担当者よりご連絡します。\nしばらくお待ちください。"
                }));
            }
        }        
        });
    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});