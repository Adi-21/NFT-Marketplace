import 'text-encoding'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import Image from 'next/image'

export default function Home() {

    const [nfts, setNfts] = useState([])
    const [loadingstate, setLoadingState] = useState('not-loaded');

    useEffect(() => {
        loadNFts()
    }, [])

    async function loadNFts() {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
        const data = await marketContract.fetchMarketItems();

        const axiosConfig = {
            headers: {
                // Specify the content type of the request if necessary (e.g., JSON).
                'Content-Type': 'application/json',

                // If you are working with APIs that require authentication, include your API key or token.
                'Authorization': 'Bearer d5be48962dd3234964f0',

                // If your website is hosted on HTTPS and you're accessing Pinata over HTTPS, you can include this header.
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
        };

        const items = await Promise.allSettled(data.map(async i => {
            try {
                const tokenUri = await tokenContract.tokenURI(i.tokenId);
                const meta = await axios.get(tokenUri, axiosConfig);
                console.log(meta);
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.data.image,
                    name: meta.data.name,
                    description: meta.data.description
                };
                return item;
            } catch (error) {
                console.error("Axios error:", error);
                // Handle the error as needed, e.g., set a default value for the item.
                return null;
            }
        }));

        // Filter out any null items (items with errors)
        const validItems = items.filter(item => item !== null);

        setNfts(validItems);
        setLoadingState('loaded');
    }


    async function buyNft(nft) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)


        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

        const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
            value: price
        })
        await transaction.wait()
        loadNFts()
    }


    if (loadingstate === 'loaded' && !nfts.length) return (
        <h1 className="px-20 py-10 text-3xl">No items in Marketplace</h1>
    )

    return (
        <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: "1600px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <Image src={nft.image} alt="NFTs" />
                                <div className="p-4">
                                    <p style={{ height: "64px" }} className="text-2xl font-semibold">{nft.name}</p>
                                    <div style={{ height: '70px', overflow: 'hidden' }}>
                                        <p className="text-gray-400">{nft.description}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-black">
                                    <p className="text-2xl mb-4 font-bold text-white">
                                        {nft.price} ETH
                                    </p>
                                    <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>
                                        BUY
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}