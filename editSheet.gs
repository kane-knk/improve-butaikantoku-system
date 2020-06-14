function saveCalendarToSheet(name) {
  let sheet = spSheet.getSheetByName(name);//名前からシートを取得
  let cal = eval(name+"Cal");//constantsでルールに従って定義したカレンダーを取得
  sheet.getRange('1:100').clear();//実行の都度、初期化をする
  //TODO: 最上行は項目の説明にしたい(最上行からデータが始まってるのをやめたい)
  let dat = [];  
  let today = new Date();//今日の日付  
  let endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);//1週間後までの予定を転記することにしました
  
  let events = cal.getEvents(today, endDate);
  if(!events) return;
  for (let evt of events){
    let sTime = evt.getStartTime();//開始時間をDate型で取得
    let fTime = evt.getEndTime();//終了時間をDate型で取得
    dat_i = [];
    dat_i[0] = evt.getId(); //イベントIDを出力
    dat_i[1] = evt.getTitle();//イベントタイトルを出力
    dat_i[2] = sTime.getFullYear() + "/" + (sTime.getMonth() + 1) + "/" + sTime.getDate();//開始日を出力
    dat_i[3] = sTime.getDay();//開始日の曜日を出力 note:0が日曜日
    dat_i[4] = sTime.getHours() + ":" + sTime.getMinutes() + ":" + sTime.getSeconds();//開始時間を出力
    dat_i[5] = fTime.getFullYear() + "/" + (fTime.getMonth() + 1) + "/" + fTime.getDate();//終了日時を出力
    dat_i[6] = fTime.getDay();//終了日の曜日を出力
    dat_i[7] = fTime.getHours() + ":" + fTime.getMinutes() + ":" + fTime.getSeconds();//終了時間を出力
    dat_i[8] = evt.getLocation();//場所を出力
    dat_i[9] = evt.getDescription();//説明を取得
    if(!dat_i[8])dat_i[8]="未定";
    if(!dat_i[9])dat_i[9]="nothing";
    dat.push(dat_i)
  }

  if(dat) sheet.getRange(1, 1, dat.length, dat_i.length).setValues(dat);
}


/**
 * memberの個人カレンダーのイベントをシートに反映
 * @param {string} name memberの名前
 * @param {array} events eventオブジェクトを格納する配列
 * @return {}
 */
function oldWriteEventsToSheet(name, events){
  let memberScheduleSheet = spSheet.getSheetByName(name);// 名前からシートを取得
  // sheetがなければ作る
  if(!memberScheduleSheet) memberScheduleSheet = spSheet.insertSheet(name);
  
  let dat = memberScheduleSheet.getDataRange().getValues();
  dat = eventSheetTopLine(dat);
  
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
function eventSheetTopLine(dat){
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