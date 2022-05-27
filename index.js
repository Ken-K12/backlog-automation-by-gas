/**
 * GASを利用して、Backlog登校時に自動でGoogle Chat通知を実施するプログラム
 * BacklogにてWebhock機能を利用し、GASのプログラムを呼び出す。
 */

doPost
//GoogleチャットでIncoming Webhookを利用したボット投稿を行う関数
//doPostでPostリクエストを受け取る
function doPost(e) {

    /**
     *e のpostDataを呼び出す。これで POST の中身を呼び出せる。
     * さらにgetDataAsString()を呼び出すことで中身を文字列として抜き出せる。
     * JSON.parse()を使って、呼び出した文字列をJSONに変換する。
     */
    let jsonString = e.postData.getDataAsString();
    console.log(jsonString);
    let data = JSON.parse(jsonString);

    
    // スレッド別で送信したい場合のWebhookURL
    let webhookUrl = 'https://chat.googleapis.com/v1/spaces/xxxxx/messages?key=xxxxx&token=xxxxx';

    // BacklogURL
    let backlogURLBase = 'https://xxxxx.backlog.com/view/';
    // 作成者
    let createdUser = data.createdUser.name;
    // タイプ
    let type = data.content.issueType.name;
    // 課題
    let summary = data.content.summary;
    // 内容
    let description = data.content.description;
    // 期日
    let dueDate = data.content.dueDate;
    // 期日が空の場合
    if(!dueDate){
        dueDate = "期日設定なし";
    }
    // 割り当て者
    let assignee = '';
    // 割り当て者がいればその名前
    if(data.content.assignee){
          assignee = data.content.assignee.name
        }else{
          assignee = "割り当て者なし";
        }
    // URL作成用
    let projectKey = data.project.projectKey;
    let keyId = String(data.content.key_id);
    
    // コメントの場合
    let commentId = '';
    if(data.content.comment){
      commentId = String(data.content.comment.id);
    }

    // バックログURL
    let backlogURL = backlogURLBase + projectKey + '-' + keyId;
    // コメントの場合
    if(data.content.comment){
      backlogURL = backlogURLBase + data.project.projectKey + '-' + keyId + '#comment' + '-' + commentId;
    }

    //スレッド別に送信したい場合はpayload (ヘッダー情報) にスレッドPathを入力する
    let thread = "spaces/xxxxx/threads/xxxxx";
    let payload = {
      'text' :
      'URL : ' + backlogURL + '\n' +
      '```' +       
      '【作成者】 ' + '\n' + createdUser + '\n' +
      '【タイプ】' + '\n' + type + '\n' + 
      '【課題】' + '\n' + summary + '\n' +
      '【内容】' + '\n' + description + '\n' +
      '【期日】' + '\n' + dueDate + '\n' +
      '```',
      'thread' : {
        'name' : thread
      }
    };

    //HTTPSのPOST時のオプションパラメータを設定する。APIの認証のため、headersの情報も必須
    let options = {
    'payload' : JSON.stringify(payload),
    'myamethod' : 'POST',
    'contentType' : 'application/json'
    };

    //WebhookのURL対しHTTP POSTを実行する
    let response = UrlFetchApp.fetch(webhookUrl,options);
}