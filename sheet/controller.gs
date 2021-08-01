class Block{
  constructor(){
    this.block_hash = 0;
    this.prev_block_hash = 0;
    this.nonce = 0;
    this.output_address = 0;
    this.height = 0;
    this.time = null;
    this.txs = [];
    this.coinbase = 500;
  }
}


function getCharCodes(s){
    let charCodeArr = [];
    
    for(let i = 0; i < s.length; i++){
        let code = s.charCodeAt(i);
        charCodeArr.push(code);
    }
    
    return charCodeArr;
}

function stringToArray(bufferString) {
  return new Uint8Array(getCharCodes(bufferString));
}


class Transaction{
  constructor(){
    this.tx_hash = 0;
    this.from_adr = 0;
    this.to_adr = 0;
    this.amt = 0;
    this.fee = 0;
    this.sig = 0;
    this.seq = 0;
  }

  async computeTransactionHash(){
    const tx_str = this.from_adr + "$" + this.to_adr + "$" + this.amt + "$" + this.fee + "$" + this.seq;
    const hash = await utils.sha256(stringToArray(tx_str));
    const hexHash = bytesToHex(hash);
    this.tx_hash = hexHash;
  }

  verifyTransaction() {
    return verify(this.sig, this.tx_hash, this.from_adr);
  }
  
}

var USER_CHAINS = {}; // sheet name -> chain

var TX_POOL = {}; // tx hash -> tx

function verifyChain(chain) {
  // signature check here

  var values = {};
  var seqs = {};
  
  for(var block in chain) {

    // verifychain
  
    // computechain
    if (!(block.output_address in this.values)) {
      values[block.output_address] = 0;
    }
    values[block.output_address] = this.coinbase;

    for (var tx in block.txs) {
      // verifytx -> seq, safe addition/subtraction

      if (!(tx.from_adr in this.values)) {
        values[tx.from_adr] = 0;
      }
      if (!(tx.to_adr in this.values)) {
        values[tx.to_adr] = 0;
      }
      values[tx.from_adr] -= tx.amt + tx.fee;
      values[tx.to_adr] += tx.amt;
      values[block.output_address] += tx.fee;
      seqs[tx.from_adr] = tx.seq;
    }
  }
}



async function parseTransactionPool(sheet){
  var rows = sheet.getDataRange().getValues();
  for(var row of rows.slice(1)){
    var tx = new Transaction();
    for(var i = 0; i < rows[0].length; i += 1){
      tx[rows[0][i]] = row[i]
    }
    await tx.computeTransactionHash();
    if(tx.verifyTransaction()) {
      console.log("gg");
      TX_POOL[tx.tx_hash] = tx;
    }
  }
}


async function parseUserSheet(sheet) {
  var rows = sheet.getDataRange().getValues();

  var blocks = []
  for (var row of rows.slice(1)){
    var cur_block = new Block();
    raw_txs = row.slice(5);
    for(var raw_tx of raw_txs){
      var json_tx = JSON.parse(raw_tx);
      var tx = new Transaction();
      tx.from_adr = json_tx['from_adr'];
      tx.to_adr = json_tx['to_adr'];
      tx.amt = json_tx['amt'];
      tx.fee = json_tx['fee'];
      tx.sig = json_tx['sig'];
      tx.nonce = json_tx['nonce'];
      tx.tx_hash = computeHash(tx);
      await tx.computeTransactionHash();
      if(!tx.verifyTransaction()) {
        return;
      }
      cur_block.txs.push(tx);
    }

    cur_block.block_hash = row[0];
    cur_block.prev_block_hash = row[1];
    cur_block.output_address = row[2];
    cur_block.height = row[3];
    cur_block.time = row[4];
    blocks.push(cur_block);
  }
  if (verifyChain(blocks)) {
    USER_CHAINS[sheet.getName()] = blocks;
  }
  // WorldState.
}


async function readSheets(spreadsheet){
  TX_POOL = {};
  USER_CHAINS = {};
  var sheets = spreadsheet.getSheets();

  await parseTransactionPool(spreadsheet.getSheetByName('TransactionPool'));

  for (var sheet of sheets) {
    if (sheet.getName().startsWith('user_')) {
      // await parseUserSheet(sheet);
    }
  }
}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

function getSimilarity(alice_chain, bob_chain){

  for(var i = 0; i < alice_chain.length - 6; i++){
    if(bob_chain.length <= i){
      return -1;
    }
    if(alice_chain[i].block_hash != bob_chain[i].block_hash){
      return -1;
    }
  }

  if (bob_chain.length > alice_chain.length) return bob_chain.length;
  else return 0;
}

function copyRowsWithSetValues(source, target) {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let sourceSheet = spreadSheet.getSheetByName(source);
  
  let sourceRange = sourceSheet.getDataRange();
  let sourceValues = sourceRange.getValues();
  
  let rowCount = sourceValues.length;
  let columnCount = sourceValues[0].length;
  
  let targetSheet = spreadSheet.getSheetByName(target);
  let targetRange = targetSheet.getRange(1, 1, rowCount, columnCount);
  
  targetRange.setValues(sourceValues);
} 


async function main() {
  var own_name = "user_Alice";
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  await readSheets(spreadsheet);

  num_users = Object.keys(USER_CHAINS).length;

  var users_to_check = Object.keys(USER_CHAINS);
  const index = users_to_check.indexOf(own_name);
  if (index > -1) {
    users_to_check.splice(index, 1);
  }
  if (users_to_check.length > 7) {
    users_to_check = getRandomSubarray(users_to_check, 7);
  }

  console.log('users to check', users_to_check);

  var bestChain = null, bestValue = -1;
  var own_chain = USER_CHAINS[own_name];
  console.log(USER_CHAINS);
  for(var user_name of users_to_check){
    var v = getSimilarity(own_chain, USER_CHAINS[user_name]);
    console.log(user_name, v);
    if(v > bestValue){
      bestValue = v;
      bestChain = user_name;
    }
  }

  if(bestValue <= 0){
    // we have the longest chain.
    return;
  }
  console.log('bestChain', bestChain);
  
  copyRowsWithSetValues(bestChain, own_name);
}
