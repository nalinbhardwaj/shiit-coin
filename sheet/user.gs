// UrlFetchApp downloads the raw text of the files from the GitHub repository, and eval
// compiles the JS code file in the context.
eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/nalinbhardwaj/shiit-coin/main/sheet/controller.gs').getContentText());
eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/nalinbhardwaj/shiit-coin/main/sheet/secp256k1.gs').getContentText());

SELF_NAME = "FILL_HERE";

async function runner() {
  var spreadsheet = SpreadsheetApp.openByUrl(SHEET_URL);
  await main();
}