import 'text-encoding'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'


import { nftmarketaddress, nftaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [loadingstate, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNfts()
    }, [])

    const axios = require('axios');

    async function loadNfts() {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()

            const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
            const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
            const data = await marketContract.fetchMyNFTs()

            const items = await Promise.all(data.map(async i => {
                const tokenUri = await tokenContract.tokenUri(i.tokenId)
                const meta = await axios.get(tokenUri)
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.data.image,
                }
                return item
            }))
            setNfts(items)
            setLoadingState('loaded')
        } catch (error) {
            console.error("Error fetching tokenUri:", error);
            // Handle the error, show a message, or retry the request
        }
    }

    if (loadingstate === 'loaded' && !nfts.length) return (
        <h1 className="py-10 px-20 text-3xl">No Assets Owned</h1>
    )
    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <image src={nft.image} />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl mb-4 font-bold text-white">
                                        {nft.price} ETH
                                    </p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}