# 💩 ShiitCoin: Putting a blockchain on Google Sheets

![YOUTUBE VIDEO EMBED](TBD)

There are bad ideas, and then there are ideas so bad they actually go back around to being genius — this is one of those. Yes! We have an end to end blockchain working entirely off of a google sheet: transaction broadcasting, mining, wallets, gossip syncing — all of it!

ShiitCoin is obviously a troll project not meant to be rEaL mOnEy 💴 but <strike>we’re hoping to farm some internet points</strike> there’s some educational value to this project (i.e. the barebones of how a blockchain works) which we’ll share here along with a note on our adventures starting from bets on slack chat to this masterpiece of DeFi.

## 👻 Why are we subjecting you to this madness?

The origins of this project were humble, we started in our fictional garage (as coworkers at a startup) and faced a very practical problem: we often made KitKat bets with each other about the most random things, and we wanted a “secure” way to maintain this ledger.

We used to just put the ledger in our slack chat and committed the current chain state SHA to each other, but this mechanism kinda sucked: messages on slack are editable, you have no version history and there’s no clean way to look at the "chain" and understand why I owe Adhyyan 3 KitKats today when I used to owe him only 1 yesterday. 🤔

![](https://firebasestorage.googleapis.com/v0/b/firescript-577a2.appspot.com/o/imgs%2Fapp%2Fdustnib%2FARCz_M0l3P.png?alt=media&token=3b231a29-733b-4e2f-91ff-1974d22babd4)

Too poor to afford ETH gas or BTC fees to put our barter on-chain, we came up with the genius idea to making our own “blockchain” — completely on Google Sheets. 🙈

![](https://firebasestorage.googleapis.com/v0/b/firescript-577a2.appspot.com/o/imgs%2Fapp%2Fdustnib%2FUBKBkzS_SD.png?alt=media&token=db1d8c35-fad3-4f6e-9821-e9e52c9d34ef)

## 👾 Why is this even possible?

![](https://firebasestorage.googleapis.com/v0/b/firescript-577a2.appspot.com/o/imgs%2Fapp%2Fdustnib%2Fux1CHG08tg.png?alt=media&token=055f4c81-b215-415f-9bd2-2f83acf3db49)

TODO
- replace by a GIF
- add caption: You can visit the live ShiitCoin chain at [LINK]

Our system works by creating one google sheet for every client, and each of them run their own miner and gossip client as a script. When someone wants to make a transaction, they use their private key to sign the transaction and just put it into a public TransactionPool sheet. Miners can read this sheet to figure out what they want to do.

People often rave about what a great programming environment Excel and spreadsheets are (LINK), but honestly, Google Sheets are next level: daddy Google makes so much possible I wouldn't be surprised if someone figures out how to run an entire company off of it. For ShiitCoin, these features were clutch:

- Google Apps Script lets you write real JS code that can interact with Google Sheet with Google auth from the user (and pretty much everything else).
- Google Sheets has a concept of protected sheets where you can “lock” a sheet and make it so only you are allowed to write to it and restrict everyone else to read-only access (err, except the sheet creator, but let's ignore that for now). This property is the center piece of how we support all the clients on a single Google Sheets instance and still support gossip in a decentralised form.
- Apps Script supports time triggers which are pretty much a cron-equivalent for arbitrary script with generous compute limits, allowing clients to run their miners and gossip scripts hands-free. 

## 🎟 OK, I’m sold, give me the nitty-gritty

There's a lot going on in a "traditional" blockchain - wallets, mining, node syncing, transaction broadcasting etc. We came up with a spec to strip down to the minimal complexity based on what's possible in our context of Google Sheet. The main things we had to decide/figure out were:

- **Crypto**: How do we generate and verify signatures for transactions and blocks, and handle all the other cryptographic primitives needed for a blockchain?
- **Gossip**: How do we propagate communication between nodes, sync chains, resolve consensus disagreements, etc?
- **Mining**: How are new blocks created, and since we decided to go with simple Proof of Work, how do we mine them using Google Apps Script?
- **Wallets**: How do we handle public/private key pairs in this environment and how do we securely sign transactions without introducing replay attacks and such?

So let's break down each one:

### 🔐 Crypto

After struggling to figure out how to use external libraries in Google Apps Script's V8 runtime (due to compatibility issues between ES5/6 and Google Apps Script [runtime](https://developers.google.com/apps-script/guides/v8-runtime)), we ended up modifying Paul Miller's [noble-secp256k1 library](https://github.com/paulmillr/noble-secp256k1) to make it work in Google Apps Script runtime. Our fork is in [secp256k1.gs](https://github.com/nalinbhardwaj/shiit-coin/blob/main/sheet/secp256k1.gs) -- the main changes are around BigInt handling, [SHA256 digest computation](https://github.com/nalinbhardwaj/shiit-coin/blob/main/sheet/secp256k1.gs#L858) to use the inbuilt Google Apps Script `Utilities` library and [HMAC-SHA256 computation](https://github.com/nalinbhardwaj/shiit-coin/blob/main/sheet/secp256k1.gs#L593) to support the different syntactic sugar of V8 runtimes.

With this library set up, we were able to support all the primitive crypto operations needed for our use case: signing messages, verifying signatures, generating private/public keys pairs, etc.

### 💬 Gossip

In ShiitCoin, gossip (in the traditional sense of the word) is much simpler than regular chain clients: All peers can simply be discovered via the Google Sheet (__sad centralisation noises__) so you don't need [Kademlia](https://en.wikipedia.org/wiki/Kademlia) or other complicated discovery mechanisms, and the transaction pool is shared by everyone already.

So, the only complicated question to figure out is consensus. We implement something very similar to the idea of Nakamoto consensus, using a longest chain rule to settle any disagreements. Every node looks at the chains of \~7 other random nodes, and picks the longest chain, settling ties using a heuristic of similarity to the chain the node currently believes in. Notice that due to the Google Sheets centralisation, this is a much more __pull__ process than the usual back and forth of gossip between nodes, as every node publishes its current beliefs in real time.

### ⛏ Mining

For block generation, we went with a simple proof of work scheme, based on the same ideas as bitcoin - run SHA with random nonce until you create a block meeting certain difficulty threshold. To implement this in Google Apps Script, we depend on clients using the "Time Trigger" feature, which allows them to run a script every N minutes, running an attempt to mine a new block.

We set up the chain such that we only allow 3 transactions in each block, which simplifies transaction selection for mining software (besides simplifying the user interface of the sheet). Miners can simply go with picking the three transactions with highest offered fee to maximize their rewards. Note that this diverges significantly from BTC and ETH, which have a notion of weights for each transaction, turning block creation into a [knapsack problem](https://en.wikipedia.org/wiki/Knapsack_problem) for miners.

### 🏦 Wallet

A transaction in ShiitCoin is much simpler than a typical BTC/ETH transaction. It's simply a record of address a paying address b, without the capabilities to store arbitrary data or implement more complicated schemes. Further, we chose to give a model similar to Ethereum's Accounts for wallets as opposed to Bitcoin's UTXO. For our proof of concept, understanding and tracing the Account model is much cleaner.

As for handling public/private key pairs, we concluded that it would be unwise to try to put the private key related computation on the google sheet. Given our shared data model, it's very hard to not inadvertently leak it at any step. So we instead decided to implement a simple in-browser website to handle transaction signing and private key management: https://shiit-coin.vercel.app . While this made dealing with account nonce numbers a bit more cumbersome, it simplifies other aspects of wallet management: On first load, it allows you to generate or paste in a new private key, so armed with the nonce, you can use it to sign any transactions. We've also used the magic of local storage to make this private key persist in your browser storage, so you can refresh or come back later to your private key, always read to sign transactions.

As for the nonce, we've put it in the user spreadsheet (in the top row) and it is auto-updated by the Google Apps Script on every tick, so users can just copy-paste it from the sheet into the website.

## 🎭 That's all, folks

And with those pieces in place, you too can make your very own blockchain in a Google Sheet. If you're interested in setting up your own sheet/client, check out our client setup guide [here TBD]().

There were a lot of other emergent ideas we came up with along the way we were curious to explore, so if you're interested in any of these, hit us up!

- Since the chain is entirely on a spreadsheet now, what are the kinds of cool (interactive or otherwise) data analyses and visualisations can we do that are non-trivial otherwise? What's the equivalent of putting ETH/BTC on a spreadsheet and having the niceties of a spreadsheet-like query interface for those real chains? Are spreadsheets the poor man's [Dune](https://dune.xyz/home) or are there things Dune can learn from this age-old idea of spreadsheets?
- While there are some obvious points of centralisation (Google and the sheet admin itself) in this cryptocurrency, this seems like a nice project for a blockchain 101 course. What are other whacky ideas for blockchain deployments? What if your smart fridge mines using the extra cooling it generates? What if we tie proof of work to physical activity and calories burnt using your Apple Watch?

Surely, there's at least one good idea in these hypotheticals, hit us up if you have thoughts!

