import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import './App.css';
import Navbar from './components/Navbar';
import NFTCard from './components/NFTCard';
import CreateNFT from './components/CreateNFT';
import contractABI from './contracts/SimpleNFTMarketplace.json';

function App() {
  const [account, setAccount] = useState('');
  const [nfts, setNfts] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const switchToLocalhost = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return false;
    } 

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }], 
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x7A69",
              chainName: "Hardhat Localhost",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["http://127.0.0.1:8545/"],
              blockExplorerUrls: null,
            }],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add localhost network:", addError);
          return false;
        }
      } else {
        console.error("Failed to switch to localhost:", switchError);
        return false;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const switched = await switchToLocalhost();
    if (!switched) {
      alert("Please switch to Hardhat Localhost network in MetaMask and try again.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new Contract(contractAddress, contractABI.abi, signer);
      setContract(nftContract);

      await loadNFTs(nftContract);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const loadNFTs = async (contract) => {
    try {
      setLoading(true);
      const total = await contract.getTotalNFTs();
      const items = [];

      for (let i = 1; i <= total; i++) {
        try {
          const nft = await contract.nfts(i);

          items.push({
            id: nft.id.toString(),
            name: nft.name,
            description: nft.description,
            imageHash: nft.imageHash,
            price: nft.price,
            owner: nft.owner,
          });
        } catch (err) {
          console.warn(`Error loading NFT ${i}:`, err);
        }
      }

      setNfts(items);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNFT = () => {
    loadNFTs(contract);
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const switched = await switchToLocalhost();
          if (!switched) {
            alert("Please switch to Hardhat Localhost network in MetaMask.");
            return;
          }

          setAccount(accounts[0]);
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const nftContract = new Contract(contractAddress, contractABI.abi, signer);
          setContract(nftContract);
          await loadNFTs(nftContract);
        }
      }
    };

    checkWalletConnection();
  }, []);

  return (
    <div className="app">
      <Navbar account={account} connectWallet={connectWallet} />

      <main className="main-content">
        <CreateNFT contract={contract} onCreate={handleCreateNFT} />

        <section className="marketplace-section">
          <h2>NFT Marketplace</h2>
          {loading ? (
            <div className="loading">Loading NFTs...</div>
          ) : nfts.length === 0 ? (
            <div className="empty-state">No NFTs found in marketplace</div>
          ) : (
            <div className="nft-grid">
              {nfts.map((nft, index) => (
                <NFTCard
                  key={index}
                  nft={nft}
                  contract={contract}
                  account={account}
                  onBuy={() => loadNFTs(contract)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
