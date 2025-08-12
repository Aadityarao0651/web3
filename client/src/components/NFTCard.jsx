import { formatEther } from 'ethers';

const NFTCard = ({ nft, contract, account, onBuy }) => {
  const handleBuy = async () => {
    try {
      const tx = await contract.buyNFT(nft.id, {
        value: nft.price 
      });
      await tx.wait();
      onBuy();
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert("Error buying NFT: " + error.message);
    }
  };

  return (
    <div className="nft-card">
      <div className="nft-image">
        <img 
          src={`https://ipfs.io/ipfs/${nft.imageHash}`}
          alt={nft.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
      </div>
      <div className="nft-details">
        <h3>{nft.name}</h3>
        {nft.description && <p className="description">{nft.description}</p>}
        <p className="price">{formatEther(nft.price)} ETH</p>
        <p className="owner">
          Owner: {`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
        </p>
        {account && account.toLowerCase() !== nft.owner.toLowerCase() && (
          <button className="buy-btn" onClick={handleBuy}>
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
};

export default NFTCard;