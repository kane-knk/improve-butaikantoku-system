function saveCalenderToSheet(name) {
  sheet = spSheet.getSheetByName(name);//名前からシートを取得
  let cal = eval(name+"Cal");//constantsでルールに従って定義したカレンダーを取得
  sheet.getRange('1:100').clear();//実行の都度、初期化をする
  let dat = [];  
  let today = new Date();//今日の日付  
  let endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);//1週間後までの予定を転記することにしました
  
  let Evts = cal.getEvents(today, endDate);
  let i = 0;
  for (let evt in Evts){
    let sTime = evt.getStartTime();//開始時間をDate型で取得
    let fTime = evt.getEndTime();//終了時間をDate型で取得
    dat[i] = [];
    dat[i][0] = evt.getId(); //イベントIDを出力
    dat[i][1] = evt.getTitle();//イベントタイトルを出力
    dat[i][2] = sTime.getFullYear() + "/" + (sTime.getMonth() + 1) + "/" + sTime.getDate();//開始日を出力
    dat[i][3] = sTime.getDay();//開始日の曜日を出力 note:0が日曜日
    dat[i][4] = sTime.getHours() + ":" + sTime.getMinutes() + ":" + sTime.getSeconds();//開始時間を出力
    dat[i][5] = fTime.getFullYear() + "/" + (fTime.getMonth() + 1) + "/" + fTime.getDate();//終了日時を出力
    dat[i][6] = fTime.getDay();//終了日の曜日を出力
    dat[i][7] = fTime.getHours() + ":" + fTime.getMinutes() + ":" + fTime.getSeconds();//終了時間を出力
    dat[i][8] = evt.getLocation();//場所を出力
    dat[i][9] = evt.getDescription();//説明を取得
    if(!dat[i][8])dat[i][8]="未定";
    if(!dat[i][9])dat[i][9]="nothing";
    i++;
  }
  if(dat)sheet.getRange(1, 1, i, 10).setValues(dat);
}