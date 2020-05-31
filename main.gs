//稽古日程をslackにmentionしたい！
//稽古日程と日付を比較し実行
function slackMentionByEvtSheet() {
  saveCalendarToSheet("Event");
  let dat = EventSheet.getDataRange().getValues();//イベントシートのデータを配列に取得
  let tomorrow = new Date()
  tomorrow.setDate(new Date().getDate()+1);//明日の日付
  for (i = 1; i < dat.length; i++) {
    let sDate = new Date(dat[i][2]);//シート上の日付を取得 
    let message = null;
    if (sDate.getDate() == tomorrow.getDate()) {//日付が次の日ならば実行
      if(dat[i][1] == "稽古") message = genAbsentMessage(dat,i);//イベントタイトルが「稽古」なら実行
      if(dat[i][1] == "スタッフ会議") message = genBasisMessage(dat,i);
    }
    if (message) {
      let envelope = new Envelope(message);
      envelope.sendHttpPost();
    }
  }
}    


/* 個人予定の回答シートから、回答をカレンダーに反映 */
function addTaskEvents(){
  let sheetName = "個人予定フォーム";
  let columns = new SheetColumns(sheetName);
  columns.setTaskSheetColmun();
  let answerSheet = spSheet.getSheetByName(sheetName);
  let ansDat = answerSheet.getDataRange().getValues(); //シートデータを取得
  
  let i = PropertiesService.getScriptProperties().getProperty("CHECKED_ROW"); // チェック済みの行数をロード
  i = (parseInt(i, 10));
  if(!i) i = 1;
  
  for(;i<ansDat.length;i++){
    if(!ansDat[i][columns.idColumn]){//未チェックの回答ならば
      ansDat = checkDuplicationAndAddEvent(ansDat, i, columns);      
    }
  }
  answerSheet.getRange(1, 1, i, 10).setValues(ansDat);
  PropertiesService.getScriptProperties().setProperty("CHECKED_ROW", i); //チェック済みの行数をセーブ
}


/* 舞台監督用のフォームに入力した回答シートから、回答をカレンダーに反映 */
function addTaskEventsForBukan() {
  let sheetName = "稽古日程フォーム";
  let columns = new SheetColumns(sheetName);
  columns.setPracticeSheetColmun();
  let practiceSheet = spSheet.getSheetByName(sheetName);
  let practiceDat = practiceSheet.getDataRange().getValues(); //シートデータを取得
  
  let i = PropertiesService.getScriptProperties().getProperty("CHECKED_ROW_PRACTICE_SHEET"); // チェック済みの行数をロード
  i = (parseInt(i, 10));
  if(!i) i = 1;
  
  for(;i<practiceDat.length;i++){
    if(!practiceDat[i][columns.idColumn]){//未チェックの回答ならば
      practiceDat[i][columns.nameColumn] = practiceDat[i][columns.nameColumn] ? practiceDat[i][columns.nameColumn] : "稽古"; //三項演算子 条件 ? Trueの時の値 : falseの時の値
      practiceDat[i][columns.locationColumn] = practiceDat[i][columns.locationColumn] ? practiceDat[i][columns.locationColumn] : "未定";
      practiceDat = checkDuplicationAndAddEvent(practiceDat, i, columns);
    }    
  }
  practiceSheet.getRange(1,1,i,10).setValues(practiceDat);//データをシートに出力
  PropertiesService.getScriptProperties().setProperty("CHECKED_ROW_PRACTICE_SHEET", i); //チェック済みの行数をセーブ
}

/* 締め切り入力用のフォームに入力した回答シートから、回答をカレンダーに反映 */
function addDeadline() {
  let deadDat = DeadSheet.getDataRange().getValues(); //シートデータを取得
  for(let i=1;i<deadDat.length;i++){
    if(!deadDat[i][4]){//未チェックの回答ならば
      
      /* イベントタイトルを設定*/
      let title = deadDat[i][1] + ":" + deadDat[i][3];
      /* イベントの追加・スプレッドシートへの入力 */
      let evt = PracticeCal.createAllDayEvent(title,deadDat[i][2],{description:deadDat[i][1]}); //カレンダーにタスクをイベントとして追加    
      deadDat[i][4]=evt.getId(); //イベントIDを入力
    }
  }
  DeadSheet.getRange(1,1,i,5).setValues(deadDat); //データをシートに出力
}
