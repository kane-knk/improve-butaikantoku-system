/* 
該当する回答について、過去と未来に重複がないかを調べ、
過去の回答についてはカレンダーの削除処理、最新回答についてカレンダーの追加処理をし、datを返す

statusは定数
0→出席変更
1→稽古予定変更
id_columnはシートでイベントIDが記入される列、配列で使うので7(PracticeSheet)か9(AnswerSheet)
*/
function checkDuplicationAndAddEvent(dat,i,status){      
  let past_j;//過去に入力された予定の行を保持して、announceChangeに渡すための変数
  
  /* status毎に設定 */
  let id_column = null;//IDのカラム（列）
  let calender = null;
  if(status==0){
    id_column = 9;
    if(isActor(dat[i][1])){//役者ならば
      let calender = ActorAndDirectorCal;
    } else {//裏方ならば
      let calender = BackseatplayerCal;  
    }
  } else if (status == 1){
    id_column = 7;
    calender = EventCal;
  }
  
  /* 
  過去を検索　→　過去のデータは全てcheckされている前提
  過去回答のうち最新のものをチェック
  */
  for(let j=i-1;j>0;j--){
    Logger.log(j);
    if(dat[j][1] == dat[i][1] && datesEqual(dat[j][2],dat[i][2])){//同一人物or稽古かつ同日の予定なら
      past_j = j;//イベント削除及びannounceChanege用にjを保持
      j = 0;//終了
      
      /* 過去検索で得たpast_jについて削除処理 */
      if(!(dat[past_j][id_column] == "checked" || dat[past_j][id_column] == "deleated")){//IDの列が特定文字列ではないならば
        let evt = calender.getEventById(dat[past_j][id_column]);//過去のカレンダーイベントを削除
        evt.deleteEvent();
        /* イベント削除後にエラーが起こった場合、削除済みのイベントを削除できずエラーが誘発するため、即時に削除済みにデータ変更します */
        AnswerSheet.getRange(past_j + 1,id_column + 1).setValue("deleated");
        dat[past_j][id_column] = "deleated";
      }
    }
  }
  
  /* 未来を検索 → 最新の回答を発見するまで繰り返す必要がある　*/
  for(j=i+1;j<dat.length;j++){
    if(dat[j][1] == dat[i][1] && datesEqual(dat[j][2],dat[i][2])){//同一人物の同日の予定なら
      dat[i][id_column] = "checked";//最新ではない行にはIDの欄にcheckedを入れる
      i = j;//iを最新の予定の行数とする
    }  
  }
  
  /* 未来検索で得た最新のiについて、statusに対応する処理をしcalenderに反映*/
  if(status == 0){
    checkAttendance(dat,i,calender);
  } else if (status == 1) {
    if(dat[i][3] && dat[i][4]){//開始時間と終了時間が入力されているならば
      if(dat[i][3]<dat[i][4]){//時間の前後関係が狂ってなければ
        let dateArray = setSFDate(dat[i][2],dat[i][3],dat[i][4]);//開始時間と終了時間を配列に取得
        let evt = 　EventCal.createEvent(dat[i][1],dateArray[0],dateArray[1],{location:dat[i][5],description:dat[i][6]});
        dat[i][7]=evt.getId(); //イベントIDを入力 
      }else{
        dat[i][7]="checked";
      }
    } else　{
      dat[i][7]="checked";
    }
  }
  if(past_j) announceChange(dat,i,past_j,status);
  return dat;  
}


/* 未来検索により取得した最新の参加予定の回答について、イベントをカレンダーに追加 */
function checkAttendance(dat,i,calender){
  if(dat[i][3] == "参加できる"){
    dat[i][9] = "checked";
  } else { //参加できないor時間に制約がある
    let repeat = 1;
    if(dat[i][7]) repeat = dat[i][7];
    let rec = CalendarApp.newRecurrence().addWeeklyRule().times(repeat);
    
    if(dat[i][3] == "参加できない"){
      let eventSeries = calender.createAllDayEventSeries(dat[i][1],new Date(dat[i][2]),rec,
                                                         {description : dat[i][4]});                                                    
      dat[i][9] = eventSeries.getId();
    } else {//時間に制約がある
      if(dat[i][5]<dat[i][6]){//時間の前後関係が狂ってなければ
        let dateArray = setSFDate(dat[i][2],dat[i][5],dat[i][6]);//開始時間と終了時間をdate型にし、配列に取得
        let eventSeries = calender.createEventSeries(dat[i][1],dateArray[0],dateArray[1],rec,
                                                     {description : dat[i][4]});
        dat[i][9] = eventSeries.getId();
      } else {
        dat[i][9] = "checked";
      }
    }
  }
  return dat;
}

/* 
日時を比較して、二週間以内なら、statusに沿ってmessageを作る関数を呼びsendHttpPost
statusは定数
0→出席変更
1→稽古予定変更
*/
function announceChange(dat,i,j,status){
  let twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);//二週間後
  
  if(dat[j][2] > new Date() &&  dat[j][2] < twoWeeksLater){　//変更されたのが二週間以内の予定だった場合   
    if(status==0){
      let message = genAttendanceChanegeMessage(dat,i,j);
    }  else if(status==1){
      let message = genPracticeChangeMessage(dat,i,j);
    }
    let envelope = new Envelope(message);
    envelope.sendHttpPost(); //slackで通知
  }
}