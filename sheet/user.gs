eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/nalinbhardwaj/shiit-coin/main/sheet/controller.gs').getContentText());
eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/nalinbhardwaj/shiit-coin/main/sheet/secp256k1.gs').getContentText());

SELF_NAME = "FILL_HERE";

async function runner() {
  var spreadsheet = SpreadsheetApp.openByUrl(SHEET_URL);
  await main();
}