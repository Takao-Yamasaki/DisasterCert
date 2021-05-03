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
    // セッションストレージを使用
    var storage = sessionStorage;

    req.body.events.forEach((event) => {
        // ユーザーIDの取得
        var userId = event.source.userId;
        // ユーザの情報を変数に格納
        var userData = {
            userId:{stage: 0, name: null, address: null, housing: null, date: null, place: null, picture: null}
        };
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
            // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
            if (userData.userId.stage == 0){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "ようこそ！\nり災証明申請アプリです。\nり災証明の申請を開始します。" 
                }));
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "あなたの「氏名」を入力してください。" 
                }));
                
                // userData.userId.name = event.message.text;
                // userData.userId.stage = 1;
                // storage.setItem('userData',JSON.stringify(userData));
                // var getData = JSON.parse(storage.getItem('userId'));
                
                // events_processed.push(bot.replyMessage(event.replyToken, {
                //     type: "text",
                //     text: getData['name'] 
                // }));

            } else if(userData.userId.stage == 1) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "あなたの「住所」を入力してください。"
                }));
                userData.userId.stage = 2;
            } else if(userData.userId.stage == 2) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した物件」を入力してください・"
                }));
                userData.userId.stage = 3;
            } else if(userData.userId.stage == 3) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した年月日」を入力してください。"
                }));
                userData.userId.stage = 4;
            } else if(userData.userId.stage == 4) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した物件の所在」を入力してください。"
                }));
                userData.userId.stage = 5;
            } else if(userData.userId.stage == 5) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災の状況」を入力してください。"
                }));
                userData.userId.stage = 6;
            } else if(userData.userId.stage == 6) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災の状況がわかる写真」を添付してください。"
                }));
                userData.userId.stage = 7;
            } else if(userData.userId.stage == 7) {
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