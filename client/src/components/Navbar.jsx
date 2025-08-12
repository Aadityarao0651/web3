const Navbar = ({ account, connectWallet }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Simple NFT Marketplace</h1>
      </div>
      <div className="navbar-actions">
        {account ? (
          <button className="wallet-btn connected">
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </button>
        ) : (
          <button className="wallet-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;