// messageの基礎部分を作る
function genBasisMessage(dat,i){
  let dayInJP = ["日", "月", "火", "水", "木", "金", "土"][dat[i][3]];
  
  let message =("こんにちは！明日"+ formDate(new Date(dat[i][2])) + "(" + dayInJP +")の" + dat[i][1] + "は" + 
    formTime(new Date(dat[i][4])) + "〜" + formTime(new Date(dat[i][7])) +
      "で、場所は" + dat[i][8] +"です！");
  
  if(dat[i][9] != "nothing") message += "\n備考："+ dat[i][9]; 
  return message;
}

//messageの欠席者連絡部分を作り、基礎部分を呼んで結合
function genAbsentMessage(dat,i) {
  let sheetName = "actorAndDirector";
  saveCalendarToSheet(sheetName);
  
  let actorSheet = spSheet.getSheetByName(sheetName);
  let actorDat = actorSheet.getDataRange().getValues();
  
  let tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate()+1);//明日の日付

  let pracArray = setSFDate(dat[i][2],dat[i][4],dat[i][7]);//イベントカレンダー用シートより、稽古の開始、終了時間を配列に取得
  let tomorrowAbs = [];
  let counter = 0;
  let message = null;
  
  for(let j = 0; j < actorDat.length;j++){
    let absArray = setSFDate(actorDat[j][2],actorDat[j][4],actorDat[j][7]);//役者演出カレンダー用シートより、欠席の開始、終了時間を配列に取得
    if (datesEqual(tomorrow,new Date(actorDat[j][2]))) {//同じ日付ならば
      if (absArray[0] < pracArray[1] && pracArray[0] < absArray[1]){//欠席終了が稽古開始時間より前、欠席開始が稽古終了時間より後である場合を除きます
        tomorrowAbs[counter] = [];
        tomorrowAbs[counter][0] = actorDat[j][1];                       
        if (absArray[0] <= pracArray[0]){//稽古開始前から欠席ならば
          tomorrowAbs[counter][1] = "稽古開始";
        } else {
          tomorrowAbs[counter][1] = actorDat[j][4];
        }
        if (pracArray[1] <= absArray[1]){//稽古終了後まで欠席なら
          tomorrowAbs[counter][2] = "稽古終了"
        } else {
          tomorrowAbs[counter][2] = actorDat[j][7];
        }
        counter++;
      }
    }
  }
  Logger.log(tomorrowAbs);
  if(tomorrowAbs != null){       
    let absMessage = "";             
    for(let j = 0;j < tomorrowAbs.length;j++){  
      absSTime = tomorrowAbs[j][1];
      absFTime = tomorrowAbs[j][2];
      if(absSTime != "稽古開始") {
        absSTime = formTime(tomorrowAbs[j][1]);
      }
      if(absFTime != "稽古終了") {
        absFTime = formTime(tomorrowAbs[j][2]);
      }
      absMessage += (tomorrowAbs[j][0] + "さんは" + absSTime + "～" + absFTime + "まで\n");
    } 
    message = (genBasisMessage(dat,i) + '\n' + "また、" + absMessage +"欠席です！よろしく！")    
    }else{
    message = (genBasisMessage(dat,i) + "よろしく！");
    }
  return message;
}

function genAttendanceChanegeMessage(dat,i,j){
  let message = (dat[j][1] + "さんが" + formDate(new Date(dat[j][2])) + "の予定を『" + dat[j][3] + "』から『" + dat[i][3] + "』に変更しました");
  return message;
}

function genPracticeChangeMessage(dat,i,j){
  let addmessage = "";      
  if(dat[i][4] == "") addmessage = "なしに";
  
  let message = (formDate(new Date(dat[j][2])) + "の予定を" + addmessage + "変更しました。確認をお願いします！");
  return message;
}


