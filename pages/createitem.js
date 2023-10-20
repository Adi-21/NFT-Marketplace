import { useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { uploadToIPFS } from './ipfsUploader'

export default function CreateItem() {
  const [file, setFile] = useState(null);
  const [ipfsLink, setIpfsLink] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    setFile(e.target.files[0]);
    setFileUrl(URL.createObjectURL(e.target.files[0]));

  }

  async function createItem() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return alert("Fill all credentials")

    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    console.log(data);
    try {
      console.log("hii");
      const imageURI = await uploadToIPFS(file);
      setIpfsLink(imageURI);
      createSale(imageURI);

    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }


  async function createSale(imageURI) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()


    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(imageURI)
    let tx = await transaction.wait()

    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
    const listingPrice = await contract.getListingPrice();

    transaction = await contract.createMarketItem(
      nftaddress, tokenId, price, { value: listingPrice }
    )
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2 " aria-describedby="user_avatar_help" id="user_avatar" type="file"
          name="Asset"
          onChange={onChange} />

        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={createItem} className="font-bold mt-4 bg-pink-500 hover:bg-pink-800 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}