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
            userId:{stage: 6, name: null, address: null}
        };
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
            // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
            if (storage.userId.stage == 0){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "あなたの「氏名」を入力してください" 
                }));
            } else if(storage.userId.stage == 1) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "あなたの「住所」を入力してください"
                }));
            } else if(storage.userId.stage == 2) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した物件」を入力してください"
                }));
            } else if(storage.userId.stage == 3) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した年月日」を入力してください"
                }));
            } else if(storage.userId.stage == 4) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災した物件の所在」を入力してください"
                }));
            } else if(storage.userId.stage == 5) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "「り災の状況がわかる写真」を添付してください"
                }));
            } else if(storage.userId.stage == 6) {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "り災証明書の申請が完了しました。審査が完了した後、市役所よりご連絡します。しばらくお待ちください。"
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