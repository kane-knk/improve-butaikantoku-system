/**
 * SlackにPostするためのクラス
 * @constructor
 * @param{string} message 表示するメッセージ
 */
class Envelope {
  constructor(message){
    this.message = message;
    this.url = PropertiesService.getScriptProperties().getProperty('POST_URL');  //slackのWebhook URL,
    this.channel = PropertiesService.getScriptProperties().getProperty('POST_CHANNEL');  //ポストするスラックのチャンネル,
    this.username = PropertiesService.getScriptProperties().getProperty('WEBHOOKS_USER_NAME');  //slackでリマインドするbotの表示名
  }
  
  
  sendHttpPost() {
    let jsonData =
      {
        "channel": this.channel,
        "username": this.username,
        "text": this.message,
        "icon_emoji": ":panda_face:",
      };
    let payload = JSON.stringify(jsonData);
    let options =
      {
        "method": "post",
        "contentType": "application/json",
        "payload": payload
      };
    UrlFetchApp.fetch(this.url,options); 
  }
}


/**
 * メンバーの情報を持たせるクラス
 * @constructor
 * @param{string} name 名前
 * @param{array} job 役職
 */
class Member {
  constructor(name, job, calenderId){
    this.name = name;
    this.job = job;
    this.calenderId = calenderId;
  }
  
  isActor() {
    return this.job.includes('actor')
  }
}

