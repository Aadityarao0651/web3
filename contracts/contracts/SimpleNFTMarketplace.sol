// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFTMarketplace is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct NFT {
        uint256 id;
        string name;
        string description;
        string imageHash;
        uint256 price;
        address owner;
    }

    mapping(uint256 => NFT) public nfts;

    event NFTCreated(
        uint256 indexed tokenId,
        string name,
        string description,
        string imageHash,
        uint256 price,
        address owner
    );

    event NFTBought(
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 price
    );

    constructor() ERC721("SimpleNFT", "SNFT") {}

    function createNFT(
        string memory name,
        string memory description,
        string memory imageHash,
        uint256 price
    ) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);

        nfts[newItemId] = NFT(
            newItemId,
            name,
            description,
            imageHash,
            price,
            msg.sender
        );

        emit NFTCreated(newItemId, name, description, imageHash, price, msg.sender);
    }

    function buyNFT(uint256 tokenId) public payable {
        require(_exists(tokenId), "NFT does not exist");
        require(msg.value >= nfts[tokenId].price, "Insufficient funds");
        require(ownerOf(tokenId) != msg.sender, "You already own this NFT");

        address seller = ownerOf(tokenId);

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        nfts[tokenId].owner = msg.sender;

        emit NFTBought(tokenId, msg.sender, seller, msg.value);
    }

    function getAllNFTs() public view returns (NFT[] memory) {
        uint256 total = _tokenIds.current();
        NFT[] memory items = new NFT[](total);
        for (uint i = 0; i < total; i++) {
            items[i] = nfts[i + 1];
        }
        return items;
    }

    function getTotalNFTs() public view returns (uint256) {
    return _tokenIds.current();
}
}
