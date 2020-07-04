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

function datesEqual(date1,date2){//日付（月日）が等価ならtrueを返す
  return date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function setSFDate(date,start,finish){//開始時間と終了時間のStringをそれぞれDate型に入れることが多そうなので。2要素の配列に入れて返します
  let sDate = new Date(date);
  let fDate = new Date(date);
  let sTime = new Date(start);
  let fTime = new Date(finish);
  Logger.log([sDate, fDate, sTime, fTime])
  if(fTime.getHours() == 0 && fTime.getMinutes() == 0){//終了時間が0時の時、gas上では日付を跨いだ扱いにならないため、手動で+1
    fDate.setDate(fDate.getDate()+1);
  }
  sDate.setHours(sTime.getHours());
  sDate.setMinutes(sTime.getMinutes());     
  fDate.setHours(fTime.getHours());
  fDate.setMinutes(fTime.getMinutes()); 
  Logger.log([sDate, fDate])
  let array = [sDate,fDate];
  return array;
}

/**
* 個人予定シートの指定の行から指定の行までのイベントをカレンダーから削除
*
*/
function debugDeleteFromSheet(i = 1, j = 3){
  let answerSheet = spSheet.getSheetByName("個人予定フォーム");
  let ansDat = answerSheet.getDataRange().getValues(); //シートデータを取得
  
  for(; i < j ; i++){
    let id = ansDat[i][9];
    if(id && id != "checked" && id != "deleted"){ //idが入力されているならば
      let calendar = null;
      if(isActor(ansDat[i][1])){//役者ならば
        calendar = actorAndDirectorCal;
      } else {//裏方ならば
        calendar = backseatPlayerCal;  
      }
      let event = calendar.getEventById(id);
      event.deleteEvent();
    }
  }
  answerSheet.getRange(1, 1, ansDat.length, 10).setValues(ansDat);
}

function debugDelete() {
  let del = new Date(2020,6,19,0,0,0); // note: month は -1 ex) 2020年7月4日→(2020,6,4,0,0,0)
  //let cal = actorAndDirectorCal;
  let cal = backseatPlayerCal;
  let events = cal.getEventsForDay(del);
  Logger.log(del);
  for(let n=0; n<events.length; n++){
    if(events[n].getTitle() == "name"){ // note: 使うときに name を変える
      Logger.log(events[n].getTitle());
      events[n].deleteEvent()
      if(n%50 == 0 && n != 0) Utilities.sleep(1000)
    }
  }
}

/**
* 個人予定シートの指定のidのイベントをカレンダーから削除
*
*/
function debugDeleteById(id=null, calendar=null){
  let answerSheet = spSheet.getSheetByName("個人予定フォーム");
  let ansDat = answerSheet.getDataRange().getValues(); //シートデータを取得
  
  event = calendar.getEventById(id);
  event.deleteEvent();
  
  for(let i=1; i<ansDat.length; i++){
    if(ansDat[i][9] == id){
      ansDat[i][9] = "deleted";
      break;
    }
  }
  answerSheet.getRange(1, 1, ansDat.length, 10).setValues(ansDat);
}

