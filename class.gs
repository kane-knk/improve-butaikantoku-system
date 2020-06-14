/**
* SlackにPostするためのクラス
* @constructor
* @param{string} message 表示するメッセージ
*/
class Envelope {
  constructor(message){
    this.message = message;
    this.url = PropertiesService.getScriptProperties().getProperty('POST_URL');  //slackのWebhook URL,
    this.channel = PropertiesService.getScriptProperties().getProperty('POST_CHANNEL');  //ポストするスラックのチャンネル
    this.testChannel = PropertiesService.getScriptProperties().getProperty('TEST_CHANNEL'); 
    this.username = PropertiesService.getScriptProperties().getProperty('WEBHOOKS_USER_NAME');  //slackでリマインドするbotの表示名
  }
  
  /**
  * SlackにPost
  * @param {string} test "test"という文字列が入ってきたらtestチャンネルにポスト
  */
  sendHttpPost(test) {
    let channel = (test == "test" ? this.testChannel : this.channel);
    let jsonData =
        {
          "channel": channel,
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
* @param{string} calendarId member個人のカレンダーのId
* @param{object} targetCal スケジュールを反映するカレンダーのId
*/
class Member{
  constructor(name, job, calendarId){
    this.name = name;
    this.job = job;
    this.calendarId = calendarId;
    this.targetCal = null;
  }
  
  
  /*
  * 役者かチェック
  * @return{boolean}
  */
  isActor(){
    return this.job.includes('役者');
  }
  
  
  /*
  * 役者or演出かチェック
  * @return{boolean}
  */
  isActorOrDirector(){
    return this.job.includes('役者') || this.job.includes('演出');
  }
  
  
  /*
  * memberのインスタンスを返却
  * @param{array} datLine メンバー管理シートのdatの行成分
  * @return{object} member Memberクラスのインスタンス
  */
  getMember(datLine){
    let name = datLine[1];
    let job = datLine[2].split(", ");
    let calendarId = datLine[4];
    let member = new this.constructor(name, job, calendarId);
    return member
  }
  
  
  getMembers(dat){
    let members = [];
    for(let i=1; i<dat.length; i++){
      members.push(this.getMember(dat[i]));
    }
    return members;
  }
  
  
  /*
  * memberのscheduleを共有カレンダーに転写する
  */
  setSchedule(){
    if(this.isActorOrDirector){
      Logger.log(actorAndDirectorCal)
      this.targetCal = actorAndDirectorCal;
    } else {
      this.targetCal = backseatplayerCal;
    }
    
    // カレンダーIDの提供があるならば→ない場合はフォームから全員一律で処理
    if(this.calendarId){
      let memberCal = CalendarApp.getCalendarById(this.calendarId); // 個人カレンダーを取得 
      
      let checkStart = new Date()
      checkStart.setDate(new Date().getDate() + 3); // 3日後から
      let checkEnd = new Date();
      checkEnd.setDate(checkEnd.getDate() + 10); // 10日後まで
      let events = memberCal.getEvents(checkStart, checkEnd);
      Logger.log(events);
      //this.setEventsToSchduleCal(events);
      this.writeEventsToSheet(events);
    } 
  }
  
  
  /**
  * memberの個人カレンダーのイベントをカレンダーに反映
  * @param {array} events eventオブジェクトを格納する配列
  * @return {}
  */
  setEventsToSchduleCal(events){
    for (let event of events){
      this.targetCal.createEvent(
        this.name + '×',
        event.getStartTime(),
        event.getEndTime(),
          {description: event.getDescription()}
      )
    }
  }
  
  
  /**
  * memberの個人カレンダーのイベントをシートに反映→ログを取るため
  * @param {array} events eventオブジェクトを格納する配列
  * @return {}
  */
  writeEventsToSheet(events){
    let memberScheduleSheet = spSheet.getSheetByName(this.name);// 名前からシートを取得
    // sheetがなければ作る
    if(!memberScheduleSheet) memberScheduleSheet = spSheet.insertSheet(this.name);
    
    let dat = memberScheduleSheet.getDataRange().getValues();
    dat = this.eventSheetTopLine(dat);
    
    for (let event of events){
      let _dat = [];
      _dat[0] = event.getId(); //イベントIDを出力
      _dat[1] = event.getTitle();//イベントタイトルを出力
      _dat[2] = event.getStartTime(); // 開始日時を出力
      _dat[3] = event.getEndTime(); // 終了日時を出力
      _dat[4] = event.getLocation(); // 場所を出力
      _dat[5] = event.getDescription(); // 説明を取得
      if(!_dat[4]) _dat[4]="未定";
      if(!_dat[5]) _dat[5]="nothing";
      _dat[6] = new Date(); // 記録日時
      dat.push(_dat);
    }
    if(dat) memberScheduleSheet.getRange(1, 1, dat.length, 7).setValues(dat);
  }
  
  
  /**
  * eventを反映するシートの1行目を入力
  * @param {array} dat sheetの配列 
  * @return {array} dat
  */
  eventSheetTopLine(dat){
    let _dat = [];
    
    _dat[0] = "event ID";
    _dat[1] = "title";
    _dat[2] = "start Date";
    _dat[3] = "finish Date"
    _dat[4] = "location";
    _dat[5] = "description";
    _dat[6] = "checked"; // 記録日時
    
    dat[0] = _dat;  
    return dat;
  }
}


/**
* formから入力されたスケジュールを管理するクラス task→用事
* @constructor
*/
class Task {
  constructor(name, date){
    this.name = name;
    this.date = date;
    this.status = status; //参加できる、参加できない、参加できない時間帯がある
  }
}


/**
* formから入力されたシートデータの行と情報を結びつける
* @constructor
* @param{string} sheetName シートの名前
*/
class SheetColumns{
  constructor(sheetName){
    this.sheetName = sheetName;
  }
  
  
  /**
  * 個人予定のシート設定
  * @return {}
  */
  setTaskSheetColmun(){
    this.idColumn = 9;
    this.nameColumn = 1;
    this.dateColumn = 2;
    this.statusColumn = 3; //参加できる、できないetc
    this.descriptionColumn = 4;
    this.startTimeColumn = 5;
    this.finishTimeColumn = 6;
    
    this.recurrenceRuleColumn = 7;
    this.recurrenceNumColumn = 8;
  }
  
  
  /**
  * 稽古日程のシート設定
  * @return {}
  */
  setPracticeSheetColmun(){
    this.idColumn = 9;
    this.nameColumn = 1; //タイトル
    this.dateColumn = 2;
    this.startTimeColumn = 3;
    this.finishTimeColumn = 4;
    this.locationColumn = 5; //場所
    this.descriptionColumn = 6;
    
    this.recurrenceRuleColumn = 7;
    this.recurrenceNumColumn = 8;
  }
}