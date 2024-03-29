// -----------------------------------------------------------------------------
// Firebase
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

// SDKを初期化
admin.initializeApp ({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://disaster-cert-default-rtdb.firebaseio.com/",
    storageBucket: "disaster-cert.appspot.com"
});

const {uuid} = require("uuidv4");

var db = admin.database();
var ref = db.ref("protoout/studio");
var userRef = ref.child("messageList");
var bucket = admin.storage().bucket();
const fs = require('fs')
const os = require('os')
const path = require('path')
const tempDir = os.tmpdir()

//ダウンロード関数
function downloadContent(messageId, downloadPath) {
    return bot.getMessageContent(messageId)
      .then((stream) => new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath);
        stream.pipe(writable);
        stream.on('end', () => resolve(downloadPath));
        stream.on('error', reject);
      }));
  }

var userId;
var userData = 1;
var userMsg; 
var flag;
// リプライメッセージの格納
var msg;
// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const { text } = require("express");

const log4js = require('log4js')
const logger = log4js.getLogger();
logger.level = 'debug';

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    // channelSecret: '',
    // channelAccessToken: ''
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
            // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
            if (event.type == "message" && event.message.type == "text"){
                // ユーザーIDの取得
                userId = event.source.userId;
                userMsg = event.message.text;
                // データの取得
                userRef.child(userId).once('value',function(snapshot){
                    // logger.debug(global.userData);
                    userData = snapshot.val();
                    logger.debug(userData);
                    // データが存在しなければ、ステージ０
                    if (snapshot.exists() == false) {
                        userRef.child(userId).update({
                            stage: 0
                        });
                    }
                    // replyMessage()で返信し、そのプロセスをevents_processedに追加。
                    logger.debug(userData['stage']);
                    switch (userData['stage']) {
                        case 0:
                            msg = {type: "text",text: "こんにちは！\nり災証明書申請アプリです。\n申請を開始します。\n何かテキストを入力してください。"} ;       
                            logger.debug(msg);
                            break;
                        case 1:
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\nあなたの「名前」を入力してください"};        
                            break;
                        case 2: 
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\nあなたの「住所」を入力してください"}; 
                            break;
                        case 3:
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\nあなたの「り災した物件」を入力してください"}; 
                            break;
                        case 4:
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\nあなたの「り災した物件の場所」を入力してください"};
                            break;
                        case 5:
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\nあなたの「り災した年月日」を入力してください"};
                            break;
                        case 6:
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\nあなたの「り災の原因」を入力してください"};
                            break;
                        case 7:
                            msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\n「り災の状況がわかる写真」を入力してください"};
                            break;
                        case 8:
                        //     msg = {
                        //             type: "text",
                        //             text: "ステージ:" + userData['stage']+ "】\n入力内容は次のとおりでよろしいでしょうか。よろしければ、「はい」と入力してください。" +
                        //             "\n名前：" + userData['name'] +
                        //             "\n住所：" + userData['address'] +
                        //             "\nり災物件：" + userData['housing'] +
                        //             "\nり災場所：" + userData['location'] +
                        //             "\nり災した年月日：" + userData['date'] +
                        //             "\nり災した原因：" + userData['cause']
                        //         };
                            break;
                        case 9:
                            if (event.message.text == "はい") {
                                msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\n申請が完了しました。内容確認後、担当者より連絡があります。しばらくお待ちください。"};
                                flag = 1;
                            } else {
                                msg = {type: "text",text: "【ステージ:" + userData['stage']+ "】\n入力をはじめから行います。\n何か文字を入力してください。"}
                            }
                            break;
                    }
                    if (userData['stage'] < 10) {
                        switch (userData['stage']) {
                            case 0:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1
                                });
                                break;
                            case 1:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1
                                });
                                break;
                            case 2:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1,
                                    name: userMsg
                                });
                                break;
                            case 3:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1,
                                    address: userMsg
                                });
                                break;
                            case 4:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1,
                                    housing: userMsg
                                });
                                break;
                            case 5:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1,
                                    location: userMsg
                                });
                                break;
                            case 6:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1,
                                    date: userMsg
                                });
                                break;
                            case 7:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1,
                                    cause: userMsg
                                });
                                break;
                            case 8:
                                userRef.child(userId).update({
                                    stage: userData['stage'] + 1
                                    // pic: userImg
                                });
                                break;
                            case 9:
                                if (flag == 1) {
                                    userRef.child(userId).update({
                                        stage: userData['stage'] + 1
                                    });
                                    break;
                                } else {
                                    userRef.child(userId).remove();
                                    break;
                                }
                        }
                    }
                    logger.debug(msg);
                    events_processed.push(bot.replyMessage(event.replyToken, msg));
                    
                    // events_processed.push(bot.replyMessage(event.replyToken, msg));
                });
            } else if(event.message.type == "image") {
                userRef.child(userId).once('value',function(snapshot){
                    userData = snapshot.val();
                    logger.debug(bucket);
                    // if文を入れる
                    const id = uuid();
                    downloadContent(event.message.id, path.join(tempDir, `${userId}.jpg`))
                    bucket.upload(path.join(tempDir, `${userId}.jpg`),{public: true },function(err, file, apiResponse){
                        logger.debug(err);
                        logger.debug(file);
                        logger.debug(apiResponse);
                    });
                });
                msg = {
                        type: "text",
                        // text: userImg
                        text: "【ステージ:" + userData['stage']+ "】\n入力内容は次のとおりでよろしいでしょうか。よろしければ、「はい」と入力してください。" +
                        "\n名前：" + userData['name'] +
                        "\n住所：" + userData['address'] +
                        "\nり災物件：" + userData['housing'] +
                        "\nり災場所：" + userData['location'] +
                        "\nり災した年月日：" + userData['date'] +
                        "\nり災した原因：" + userData['cause']
                    };
                logger.debug(msg);
                events_processed.push(bot.replyMessage(event.replyToken, msg)); 
                 
            }
            
            
        }); 
        
    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});