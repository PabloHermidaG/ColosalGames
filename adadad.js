//https://docs.google.com/spreadsheets/d/1V6b5HglQo_NMjtRlgb8MLJr1AU_JWdgKVEUfgnm5rDc/edit?usp=sharing

let SHEET_ID = '1V6b5HglQo_NMjtRlgb8MLJr1AU_JWdgKVEUfgnm5rDc'
let SHEET_TITLE = 'RESEÑA';
let SHEET_RANGE = 'A1:E18'

//let FULL_URL = ('https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=' + SHEET_TITLE + '&range=' + SHEET_RANGE);
let FULL_URL = ('https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=' + SHEET_TITLE);

fetch(FULL_URL)
  .then(res => res.text())
  .then(rep => {
    console.log(rep)
  })



