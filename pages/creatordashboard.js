import 'text-encoding'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { nftmarketaddress, nftaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import Image from 'next/image'

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])

    const [loadingstate, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNfts()
    }, [])

    const axios = require('axios');

    async function loadNfts() {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchMyNFTs()

        const items = await Promise.allSettled(data.map(async i => {
            try {
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
                return item;
            } catch (error) {
                console.error("Error fetching tokenUri:", error);
                // Handle the error, show a message, or retry the request
            }
        }))
        const soldItems = items.filter(i => i.sold)
        setSold(soldItems)
        setNfts(items)
        setLoadingState('loaded')
    }

    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <Image src={nft.image} alt="NFTs" />
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
            <div className="p-4">
                {
                    Boolean(sold.length) && (
                        < div >
                            <h2 className="text-2xl py-2">Items Created</h2>
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
                    )
                }
            </div>
        </div >
    )
}