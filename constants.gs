//いくつかの定数と基礎的な関数を記述するファイル

//カレンダーID
let eventCalId = PropertiesService.getScriptProperties().getProperty("EVENT_CALENDAR_ID");
let actorAndDirectorCalId = PropertiesService.getScriptProperties().getProperty("ACTOR_AND_DIRECTOR_CALENDAR_ID");
let backseatplayerCalId = PropertiesService.getScriptProperties().getProperty("BACKSEATPLAYER_CALENDAR_ID");


//カレンダーを取得、名前は「"カレンダーを反映するシート名" + "Cal"」にする
let eventCal = CalendarApp.getCalendarById(eventCalId);//全体スケジュールカレンダーを取得
let actorAndDirectorCal = CalendarApp.getCalendarById(actorAndDirectorCalId);
let backseatplayerCal = CalendarApp.getCalendarById(backseatplayerCalId);


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

// TODO: 使うとこでだけ定義して使いたい
let answerSheet = spSheet.getSheetByName("個人予定フォーム");


let postUrl = PropertiesService.getScriptProperties().getProperty('POST_URL');  //slackのWebhook URL
let postChannel = PropertiesService.getScriptProperties().getProperty('POST_CHANNEL');  //ポストするスラックのチャンネル
let username = PropertiesService.getScriptProperties().getProperty('WEBHOOKS_USER_NAME');  //slackでリマインドするbotの表示名
