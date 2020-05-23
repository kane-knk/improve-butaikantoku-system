//いくつかの定数と基礎的な関数を記述するファイル

//カレンダーID
let eventCalId = PropertiesService.getScriptProperties().getProperty("EVENT_CALENDAR_ID");
let actorAndDirectorCalId = PropertiesService.getScriptProperties().getProperty("ACTOR_AND_DIRECTOR_CALENDAR_ID");
let backseatplayerCalId = PropertiesService.getScriptProperties().getProperty("BACKSEATPLAYER_CALENDAR_ID");


//カレンダーを取得、名前は「"カレンダーを反映するシート名" + "Cal"」にする
let EventCal = CalendarApp.getCalendarById(eventCalId);//全体スケジュールカレンダーを取得
let ActorAndDirectorCal = CalendarApp.getCalendarById(actorAndDirectorCalId);
Logger.log('hoge' + EventCal )
let BackseatplayerCal = CalendarApp.getCalendarById(backseatplayerCalId);


//スプレッドシートを取得
let sheetID = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
let spSheet = SpreadsheetApp.openById(sheetID);

/*各シートを取得*/
//let EventSheet = spSheet.getSheetByName("Event");
//let Actor = spSheet.getSheetByName("Actor");
//let AnswerSheet = spSheet.getSheetByName("Answer"); 
//let PracticeSheet = spSheet.getSheetByName("PracticeDay");
//let DeadSheet = spSheet.getSheetByName("Dead");
//let ConstantsSheet = spSheet.getSheetByName("SystemConstants");


// シート上で定義する定数
//let systemDat = ConstantsSheet.getDataRange().getValues();

let postUrl = PropertiesService.getScriptProperties().getProperty('POST_URL');  //slackのWebhook URL
let postChannel = PropertiesService.getScriptProperties().getProperty('POST_CHANNEL');  //ポストするスラックのチャンネル
let username = PropertiesService.getScriptProperties().getProperty('WEBHOOKS_USER_NAME');  //slackでリマインドするbotの表示名


/* 

関数

*/
function formDate(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "M月dd日");
}

function formTime(date) {//Utilities.formatDate(date, timeZone, format)はDate型をフォーマットされた文字列に変換
  return Utilities.formatDate(date, "JST", "HH:mm");
}

function zeroPadding(num,length){//numがlengthの長さになるように頭に0を入れる関数 「0埋め js」とかでググろう
  return ('0000000000' + num).slice(-length);
}

/* 
typeに"Date"などの型名を指定し、objにオブジェクトを渡すと、型が一致ならtrue、不一致ならfalseを返す
例: let now = new Date();
is("String",now)//false
is("Date",now)//true
*/
function is(type, obj) {
  let clas = Object.prototype.toString.call(obj).slice(8, -1);
  return obj !== undefined && obj !== null && clas === type;
}



/* 

オリジナルの関数

*/

//function isActor(name){//役者などのSystemConstantsシートE列に登録したメンバーならtrueを返す
//  for(let i=1;i<　systemDat.length;i++){
//    if(name == systemDat[i][4]) return true;
//  }
//  return false; 
//}

function datesEqual(date1,date2){//日付（月日）が等価ならtrueを返す
  return date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function setSFDate(date,start,finish){//開始時間と終了時間のStringをそれぞれDate型に入れることが多そうなので。2要素の配列に入れて返します
  let sDate = new Date(date);
  let fDate = new Date(date);
  let sTime = new Date(start);
  let fTime = new Date(finish);
  if(fTime.getHours() == 0 && fTime.getMinutes() == 0){//終了時間が0時の時、gas上では日付を跨いだ扱いにならないため、手動で+1
    fDate.setDate(fDate.getDate()+1);
  }
  sDate.setHours(sTime.getHours());
  sDate.setMinutes(sTime.getMinutes());     
  fDate.setHours(fTime.getHours());
  fDate.setMinutes(fTime.getMinutes()); 
  
  let array = [sDate,fDate];
  return array;
}

function debugDelete() {
  let del = new Date(2018,9,22,0,0,0); 
  let events = ActorAndDirectorCal.getEventsForDay(del);
  Logger.log(del);
  for(let n=0; n<events.length; n++){
    if(events[n].getTitle() == "name"){
      Logger.log(events[n].getTitle());
      events[n].deleteEvent()
    }
  }
}