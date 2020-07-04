/* TODO: メンバーの役者演出チェックはMemberクラスのメソッドを使う この関数は削除する*/
function isActor(name){
  let actor = PropertiesService.getScriptProperties().getProperty("ACTOR");
  return actor.includes(name);
}

/* 
該当する回答について、過去と未来に重複がないかを調べ、
過去の回答についてはカレンダーの削除処理、最新回答についてカレンダーの追加処理をし、datを返す
*/
function checkDuplicationAndAddEvent(dat,i,columns){      
  let past_j;//過去に入力された予定の行を保持して、announceChangeに渡すための変数
  
  /* status毎に設定 */
  let calendar = null;
  if(columns.sheetName == "個人予定フォーム"){
    if(isActor(dat[i][columns.nameColumn])){//役者ならば
      calendar = actorAndDirectorCal;
    } else {//裏方ならば
      calendar = backseatPlayerCal;  
    }
  } else if (columns.sheetName == "稽古日程フォーム"){
    calendar = eventCal;
  }
  
  
  /* 
  過去を検索　→　過去のデータは全てcheckされている前提
  過去回答のうち最新のものをチェック
  */
  for(let j=i-1;j>0;j--){
    if(dat[j][columns.nameColumn] == dat[i][columns.nameColumn] 
       && datesEqual(dat[j][columns.dateColumn],dat[i][columns.dateColumn])){//同一人物or稽古かつ同日の予定なら
      past_j = j;//イベント削除及びannounceChanege用にjを保持
      j = 0;//終了
      
      /* 過去検索で得たpast_jについて削除処理 */
      if(!(dat[past_j][columns.idColumn] == "checked" || dat[past_j][columns.idColumn] == "deleted")){//IDの列が特定文字列ではないならば
        try{
          let evt = calendar.getEventById(dat[past_j][columns.idColumn]);//過去のカレンダーイベントを削除
          evt.deleteEvent();
        }catch(e){
          Logger.log(e + " :at Row " + past_j + ", " + columns.sheetName);
        }
        /* イベント削除後にエラーが起こった場合、削除済みのイベントを削除できずエラーが誘発するため、即時に削除済みにデータ変更します */
        /* TODO: トランザクション */
        answerSheet.getRange(past_j + 1, columns.idColumn + 1).setValue("deleted");
        dat[past_j][columns.idColumn] = "deleted";
      }
    }
  }
  
  /* 未来を検索 → 最新の回答を発見するまで繰り返す必要がある　*/
  for(j=i+1; j<dat.length; j++){
    if(dat[j][columns.nameColumn] == dat[i][columns.nameColumn] 
       && datesEqual(dat[j][columns.dateColumn],dat[i][columns.dateColumn])){//同一人物or稽古かつ同日の予定なら
      dat[i][columns.idColumn] = "checked";//最新ではない行にはIDの欄にcheckedを入れる
      i = j;//iを最新の予定の行数とする
    }  
  }
  
  /* 未来検索で得た最新のiについて、statusに対応する処理をしcalendarに反映*/
  if(columns.sheetName == "個人予定フォーム"){ //参加できるとかの判定が必要なのでそっちに流す
    checkAttendance(dat, i, calendar, columns);
  } else if (columns.sheetName == "稽古日程フォーム") { //イベント作るだけ
    createEventFromSheet(dat, i, calendar, columns);
  }
    
  if(past_j) announceChange(dat,i,past_j,columns);
  return dat;  
}


/* 未来検索により取得した最新の参加予定の回答について、イベントをカレンダーに追加 */
function checkAttendance(dat, i, calendar, columns){
  if(dat[i][columns.statusColumn] == "参加できる"){
    dat[i][columns.idColumn] = "checked";
  } else { //参加できないor時間に制約がある
    dat = createEventFromSheet(dat, i, calendar, columns);
  }
  return dat;
}


function createEventFromSheet(dat, i, calendar, columns){
  daylyRepeat = (dat[i][columns.recurrenceRuleColumn] == "日") ? dat[i][columns.recurrenceNumColumn] : 1; //三項演算子 条件 ? Trueの時の値 : falseの時の値
  weeklyRepeat = (dat[i][columns.recurrenceRuleColumn] == "週") ? dat[i][columns.recurrenceNumColumn] : 1;
  let rec = CalendarApp.newRecurrence()
                       .addDailyRule().times(daylyRepeat)
                       .addWeeklyRule().times(weeklyRepeat);
  let opt = {description : dat[i][columns.descriptionColumn]};
  if (columns.sheetName == "稽古日程フォーム") {
    opt.location = dat[i][columns.locationColumn];
  }
  
  if(dat[i][columns.startTimeColumn] && dat[i][columns.finishTimeColumn]){ //開始時間と終了時間が入力されているならば
    if(dat[i][columns.startTimeColumn] <= dat[i][columns.finishTimeColumn]){ //時間の前後関係が狂ってなければ
      let dateArray = setSFDate(dat[i][columns.dateColumn], 
                                dat[i][columns.startTimeColumn], dat[i][columns.finishTimeColumn]);//開始時間と終了時間をdate型にし、配列に取得
      let eventSeries = calendar.createEventSeries(dat[i][columns.nameColumn], dateArray[0], dateArray[1], rec, opt);
      dat[i][columns.idColumn] = eventSeries.getId();
    } else { //時間の前後関係が狂ってる場合は登録処理はしない
      dat[i][columns.idColumn] = "checked";
    }
  } else { // 開始時間と終了時間が入力されてなければ終日予定にする 
    let eventSeries = calendar.createAllDayEventSeries(dat[i][columns.nameColumn], new Date(dat[i][columns.dateColumn]), rec, opt);
    dat[i][columns.idColumn] = eventSeries.getId();
  }
  return dat
}


/* 
日時を比較して、1週間以内なら、statusに沿ってmessageを作る関数を呼びsendHttpPost
statusは定数
0→出席変更
1→稽古予定変更
*/
function announceChange(dat,i,j,columns){
  let twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 7);//1週間後
  let message = null;
  if(dat[j][2] > new Date() &&  dat[j][2] < twoWeeksLater){　//変更されたのが1週間以内の予定だった場合   
    if(columns.sheetName == "個人予定フォーム"){
      message = genAttendanceChanegeMessage(dat, i, j);
    }  else if(columns.sheetName == "稽古日程フォーム"){
      message = genPracticeChangeMessage(dat, i, j);
    }
    let envelope = new Envelope(message);
    envelope.sendHttpPost('test'); //slackで通知
  }
}