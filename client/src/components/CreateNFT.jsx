import { useState } from 'react';
import { parseEther } from 'ethers';

const CreateNFT = ({ contract, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('File too large (max 100MB)');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Only image files are allowed');
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadToPinata = async () => {
    if (!image) return null;
    
    setStatus('Uploading to Pinata...');
    const formData = new FormData();
    formData.append('file', image);

    const metadata = JSON.stringify({
      name: name || 'NFT Image',
      description: description || 'NFT description'
    });
    formData.append('pinataMetadata', metadata);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.details || 'Failed to upload to Pinata');
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      setStatus(`Upload failed: ${error.message}`);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract || !image || !price) return;

    try {
      setIsCreating(true);
      setStatus('Starting NFT creation...');
      
      const ipfsHash = await uploadToPinata();
      if (!ipfsHash) {
        setStatus('Pinata upload failed');
        return;
      }

      setStatus('Creating NFT on blockchain...');
      const tx = await contract.createNFT(
        name || 'Unnamed NFT',
        description || 'No description',
        ipfsHash,
        parseEther(price)
      );
      
      await tx.wait();
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setPreview('');
      setStatus('NFT created successfully!');
      onCreate();
    } catch (error) {
      console.error("Error creating NFT:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="create-nft-section">
      <h2>Create New NFT</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>NFT Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome NFT"
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT"
          />
        </div>
        <div className="form-group">
          <label>NFT Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Price (ETH):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.01"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create NFT'}
        </button>
        {status && <p className="status">{status}</p>}
      </form>
    </section>
  );
};

export default CreateNFT;