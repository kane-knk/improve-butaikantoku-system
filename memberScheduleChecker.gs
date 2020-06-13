/** 
 * sheetからカレンダーIDを取得して処理開始
 * @param {string} sheetName sheetの名前 
 * @return {}  
 */
function memberScheduleCheck() {
  let memberSheet = spSheet.getSheetByName("メンバー管理");
  let dat = memberSheet.getDataRange().getValues();
  let members = Member.prototype.getMembers(dat);
  Logger.log(members);
  
  for(let member in members) {
    if (member.calendarId){
      
    }
  }
}

