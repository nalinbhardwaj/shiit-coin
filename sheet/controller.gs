
DIFFICULTY = BigInt('0xf0000f9296758f559bed50f2ee6b749806893022dcc2b074650e7971cea5a23b');

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
    try {
      var res = verify(this.sig, this.tx_hash, this.from_adr);
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  getJSONrepr() {
    return JSON.stringify(this, null, 2);
  } 
}

class Block{
  constructor(){
    this.number_block_hash = 0;
    this.block_hash = 0;
    this.prev_block_hash = 0;
    this.nonce = 0;
    this.output_address = 0;
    this.height = 0;
    this.time = null;
    this.txs = [];
    this.coinbase = 500;
  }

  async computeBlockHash() {
    const block_list = [this.prev_block_hash, this.nonce, this.output_address, this.height, this.time, this.coinbase];
    for (var tx of this.txs) {
      block_list.push(tx.tx_hash);
    }
    const block_str = block_list.join('$');
    const hash = await utils.sha256(stringToArray(block_str));
    const hexHash = bytesToHex(hash);
    this.number_block_hash = bytesToNumber(hash);
    this.block_hash = hexHash;
  }

  getSheetRepr() {
    var res = [
      this.prev_block_hash,
      this.block_hash,
      this.output_address,
      this.height.toString(),
      this.time.toString(),
    ]
    for (var tx of this.txs) {
      res.push(tx.getJSONrepr());
    }
    return res;
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


var USER_ADDRESSES = {}; // sheet name -> user address

var USER_CHAINS = {}; // sheet name -> chain

var TX_POOL = {}; // tx hash -> tx

function verifyChain(chain) {
  // signature check here

  var values = {};
  var seqs = {};
  
  for(var block of chain) {

    // verifychain
    // - check block difficulty is fine
    // - verifytx -> seq, safe addition/subtraction
    // check 3 tx per block
    // genesis special case handling

    // computechain
    if (!(block.output_address in values)) {
      values[block.output_address] = 0;
    }
    values[block.output_address] = block.coinbase;

    for (var tx of block.txs) {
      // verifytx -> seq, safe addition/subtraction

      if (!(tx.from_adr in values)) {
        values[tx.from_adr] = 0;
      }
      if (!(tx.to_adr in values)) {
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
    } else {
      console.log("brutal savage rekt");
    }
  }
}


async function parseUserSheet(sheet) {
  var rows = sheet.getDataRange().getValues();

  var blocks = []
  USER_ADDRESSES[sheet.getName()] = rows[0][1];
  for (var row of rows.slice(2)){
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
      console.log("start reading", sheet.getName());
      await parseUserSheet(sheet);
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
  let columnCount = sourceValues[1].length;
  
  let targetSheet = spreadSheet.getSheetByName(target);
  let targetRange = targetSheet.getRange(2, 1, rowCount, columnCount);
  
  targetRange.setValues(sourceValues);
} 

function writeChain(target_name) {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  let target_sheet = spreadSheet.getSheetByName(target_name);
  let orig_target_range = target_sheet.getDataRange();
  let target_values = orig_target_range.getValues();
  let col_number = target_values[1].length;
  var res = [];
  for (var block of USER_CHAINS[target_name]) {
    res.push(block.getSheetRepr());
  }

  if (res.length > 0) {
    let target_range = target_sheet.getRange(3, 1, res.length, col_number);
    target_range.setValues(res);
  }
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
  var own_address = USER_ADDRESSES[own_name];
  console.log(USER_CHAINS);
  for(var user_name of users_to_check){
    var v = getSimilarity(own_chain, USER_CHAINS[user_name]);
    console.log(user_name, v);
    if(v > bestValue){
      bestValue = v;
      bestChain = user_name;
    }
  }

  if(bestValue > 0) {
    // Someone else has better chain, copy
    console.log('bestChain', bestChain);
    copyRowsWithSetValues(bestChain, own_name);
    USER_CHAINS[own_name] = USER_CHAINS[bestChain].slice();
  }
  if(!(own_name in USER_CHAINS && USER_CHAINS[own_name])) {
    USER_CHAINS[own_name] = []
  }
  own_chain = USER_CHAINS[own_name];
  console.log("own_chain", own_chain);

  // assemble block from tx pool
  console.log(TX_POOL);
  tx_list = Object.values(TX_POOL);
  tx_list.sort((txA, txB) => {txB.fee - txA.fee});
  tx_list = tx_list.slice(0, 3);

  var potential_block = new Block();
  potential_block.prev_block_hash = (own_chain.length > 0 ? own_chain[-1].block_hash : "0000");
  potential_block.output_address = own_address;
  potential_block.height = (own_chain.length > 0 ? own_chain[-1].height : 0) + 1;
  potential_block.txs = tx_list.slice();
  console.log(potential_block.txs);

  var d = new Date();
  potential_block.time = d.getTime();

  // mine
  for (var trial_nonce = 0; trial_nonce < 10000; trial_nonce++) {
    potential_block.nonce = trial_nonce;
    await potential_block.computeBlockHash();

    // console.log(potential_block.block_hash);
    if (potential_block.number_block_hash < DIFFICULTY) {
      console.log('success');
      own_chain.push(potential_block);
      break;
    }
  }
  writeChain(own_name);

  // tbd nonce
}
