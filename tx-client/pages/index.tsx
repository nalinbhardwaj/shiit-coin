import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import * as secp from "noble-secp256k1";
import { useEffect, useState } from 'react';


function bytesToHex(uint8a: any) {
  let hex = '';
  for (let i = 0; i < uint8a.length; i++) {
      hex += uint8a[i].toString(16).padStart(2, '0');
  }
  return hex;
}


function stringToArray(bufferString: any) {
	let uint8Array = new TextEncoder().encode(bufferString);
	return uint8Array;
}


export default function Home() {
  const [privateKey, setPrivateKey] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();
  const [toAddress, setToAddress] = useState<string>();
  const [amount, setAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [nonce, setNonce] = useState<number>(0);
  const [sig, setSig] = useState<string>();


  useEffect(() => {
    if(privateKey){
      try{
        setPublicKey(secp.getPublicKey(privateKey));
      }
      catch(err) {
        console.log(err);
        setPublicKey(undefined);
      }
    }
  }, [privateKey]);


  const genSig = async () => {
    if(!privateKey || !toAddress){
      setSig(undefined);
      return;
    }
    const a = {  
      "from_adr": publicKey, 
      "to_adr": toAddress,
      "amt": amount,
      "fee": fee, 
      "nonce": nonce,
    }

    const string_rep = publicKey + '$' + toAddress + '$' + amount + '$' + fee + '$' + nonce;
    console.log(string_rep);
    const arr = stringToArray(string_rep);
    const lol = await secp.utils.sha256(arr);
    const hexHash = bytesToHex(lol);
    console.log(hexHash);
    const signature = await secp.sign(hexHash, privateKey);
    setSig(signature);
  }

  useEffect(() => {
    const defaultPrivKey = typeof window !== "undefined" ? localStorage.getItem("privateKey") : null;
    if (defaultPrivKey){
      setPrivateKey(defaultPrivKey);
    }
  }, [typeof window])


  const generatePrivateKey = () => {
    const privKey = bytesToHex(secp.utils.randomPrivateKey());
    setPrivateKey(privKey);
    if(typeof window !== "undefined"){
      localStorage.setItem("privateKey", privKey);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>ShiitCoin</title>
        <meta name="description" content="ShiitCoin: A blockchain on a spreadsheet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main} >
        <h1 className={styles.title}>
          ShiitCoin Transaction Generator
        </h1>

        <div className="form-control w-full mt-8">
          <label className="label">
            <span className="label-text">Private Key</span> 
            { (typeof window === "undefined" || !window.localStorage.getItem("privateKey")) && 
            <a href="#" onClick={generatePrivateKey} className="label-text-alt">
                  Generate new private key
                </a>
            }
          </label> 
          <input value={privateKey ? privateKey : ""} onChange={x => setPrivateKey(x.target.value)} type="text" placeholder="privatekey" className="input input-primary input-bordered" />
        </div> 
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Public Key</span>
          </label> 
          <input value={publicKey} type="text" placeholder="username" className="input input-secondary input-bordered" />
        </div> 
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Public key to</span>
          </label> 
          <input value={toAddress} onChange={x => setToAddress(x.target.value)} type="text" placeholder="username" className="input input-accent input-bordered" />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Amount</span>
          </label> 
          <input value={amount} onChange={x => setAmount(parseInt(x.target.value, 10))} type="number" placeholder="username" className="input input-accent input-bordered" />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Fee</span>
          </label> 
          <input value={fee} onChange={x => setFee(parseInt(x.target.value, 10))} type="number" placeholder="username" className="input input-accent input-bordered" />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Sequence</span>
          </label> 
          <input value={nonce} onChange={x => setNonce(parseInt(x.target.value, 10))} type="number" placeholder="username" className="input input-accent input-bordered" />
        </div>
        <button onClick={genSig} className="btn btn-primary mt-8">Generate Signature</button>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Signature</span>
          </label> 
          <input value={sig} type="text" placeholder="username" className="input input-accent input-bordered" />
        </div>
      </main>

      <footer className={styles.footer}>
          Made by <a href="https://nibnalin.me">nibnalin</a> and Adhyyan.
      </footer>
    </div>
  )
}
