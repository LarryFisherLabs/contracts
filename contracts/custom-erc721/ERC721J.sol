// SPDX-License-Identifier: GPL-3.0
// Made using OpenZeppelin Contracts v4.9.0 as example

pragma solidity ^0.8.0;

import "./IERC721J.sol";
import "./helpers/IDenyList.sol";
import "./helpers/IExternalURI.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// !!!! TODO: Change functions from public to external and internal to private where possible !!!!

/**
* @dev Implementation of ERC721J Non-Fungible Token Standard, including the OZ Metadata extension.
*/
contract ERC721J is Context, ERC165, IERC721J, IERC721Metadata, Ownable {
    using Address for address;
    using Strings for uint256;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Base URI for all tokens
    string private _baseURI;

    // Contract address to get URIs of tokens to be used for future updates
    address private _URIContract;

    // Deny list contract address
    address private _denyListAddress;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    /**
    * @dev Initializes the contract by setting a `name`, a `symbol`, a 'base URI(URL)', and a 'deny list 
    * address' to the token collection.
    */
    constructor(string memory name_, string memory symbol_, string memory baseURI_, address denyListAddr_) {
        _name = name_;
        _symbol = symbol_;
        _baseURI = baseURI_;
        _denyListAddress = denyListAddr_;
    }

    /**
    * @dev See {IERC165-supportsInterface}.
    */
    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721J).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
    * @dev See {IERC721-balanceOf}.
    */
    function balanceOf(address owner_) external view override returns (uint256) {
        require(owner_ != address(0), "ERC721: address zero is not a valid owner");
        return _balances[owner_];
    }

    /**
    * @dev See {IERC721-ownerOf}.
    */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }

    /**
    * @dev See {IERC721Metadata-name}.
    */
    function name() external view override returns (string memory) {
        return _name;
    }

    /**
    * @dev See {IERC721Metadata-symbol}.
    */
    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    /**
    * @dev See {IERC721Metadata-tokenURI}.
    */
    function tokenURI(uint256 tokenId) external view override returns (string memory URI) {
        _requireMinted(tokenId);

        if (_URIContract != address(0)) URI = IExternalURI(_URIContract).getURI(tokenId);
        else {
            string memory baseURI = _baseURI;
            URI = bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
        }
    }

    /**
    * @dev See {IERC721J-updateBaseURI}.
    */
    function updateBaseURI(string memory newURI_) external onlyOwner {
        _baseURI = newURI_;
        if (_URIContract != address(0)) delete _URIContract;
    }

    /**
    * @dev See {IERC721J-setURIContract}.
    */
    function setURIContract(address uriAddress_) external onlyOwner {
        _URIContract = uriAddress_;
        if (bytes(_baseURI).length > 0) delete _baseURI;
    }

    /**
    * @dev See {IERC721J-setDenyContract}.
    */
    function setDenyContract(address denyAddress_) external onlyOwner {
        _denyListAddress = denyAddress_;
    }

    /**
    * @dev See {IERC721-approve}.
    */
    function approve(address to, uint256 tokenId) external override {
        address owner = ERC721J.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not token owner or approved for all"
        );

        _approve(to, tokenId);
    }

    /**
    * @dev See {IERC721-getApproved}.
    */
    function getApproved(uint256 tokenId) public view override returns (address) {
        _requireMinted(tokenId);

        return _tokenApprovals[tokenId];
    }

    /**
    * @dev See {IERC721-setApprovalForAll}.
    */
    function setApprovalForAll(address operator, bool approved) external override {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
    * @dev See {IERC721-isApprovedForAll}.
    */
    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
    * @dev See {IERC721-transferFrom}.
    */
    function transferFrom(address from, address to, uint256 tokenId) external override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");

        _transfer(from, to, tokenId);
    }

    /**
    * @dev See {IERC721-safeTransferFrom}.
    */
    function safeTransferFrom(address from, address to, uint256 tokenId) external override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
    * @dev See {IERC721-safeTransferFrom}.
    */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _safeTransfer(from, to, tokenId, data);
    }

    /**
    * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
    * are aware of the ERC721 protocol to prevent tokens from being forever locked.
    *
    * `data` is additional data, it has no specified format and it is sent in call to `to`.
    *
    * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
    * implement alternative mechanisms to perform token transfer, such as signature-based.
    *
    * Requirements:
    *
    * - `from` cannot be the zero address.
    * - `to` cannot be the zero address.
    * - `tokenId` token must exist and be owned by `from`.
    * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
    *
    * Emits a {Transfer} event.
    */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) private {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    /**
    * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
    */
    function _ownerOf(uint256 tokenId) private view returns (address) {
        return _owners[tokenId];
    }

    /**
    * @dev Returns whether `tokenId` exists.
    *
    * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
    *
    * Tokens start existing when they are minted (`_mint`)
    */
    function _exists(uint256 tokenId) private view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
    * @dev Returns whether `spender` is allowed to manage `tokenId`.
    *
    * Requirements:
    *
    * - `tokenId` must exist.
    */
    function _isApprovedOrOwner(address spender, uint256 tokenId) private view returns (bool) {
        address owner = ERC721J.ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    /**
    * @dev Mints `tokenId` and transfers it to `to`.
    *
    * Requirements:
    *
    * - `tokenId` must not exist.
    * - `to` cannot be the zero address.
    *
    * Emits a {Transfer} event.
    */
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");

        // Check that tokenId is not minted.
        require(!_exists(tokenId), "ERC721: token already minted");

        unchecked {
            // Ignore impossible overflow.
            _balances[to] += 1;
        }

        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function _simpleTransfer(address from, address to, uint256 tokenId) internal {
        require(ERC721J.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        // Clear approvals from the previous owner
        delete _tokenApprovals[tokenId];

        unchecked {
            // `_balances[from]` cannot overflow as that would require more tokens to be transferred
            // out than the owner initially received through minting and transferring in:
            // `from`'s balance is the number of token held, which is at least one before the current
            // transfer.
            // `_balances[to]` could overflow in the conditions described in `_mint`. That would require
            // all 2**256 token ids to be minted, which in practice is impossible.
            _balances[from] -= 1;
            _balances[to] += 1;
        }
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
    * @dev Transfers `tokenId` from `from` to `to`.
    *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
    *
    * Requirements:
    *
    * - `to` cannot be the zero address.
    * - `tokenId` token must be owned by `from`.
    *
    * Emits a {Transfer} event.
    */
    function _transfer(address from, address to, uint256 tokenId) private {
        require(ERC721J.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");

        _beforeTokenTransfer(from, to, tokenId);

        _simpleTransfer(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
    }

    /**
    * @dev Approve `to` to operate on `tokenId`
    *
    * Emits an {Approval} event.
    */
    function _approve(address to, uint256 tokenId) private {
        require(!(IDenyList(_denyListAddress).isDenied(to)), "This contract is blocked!");
        _tokenApprovals[tokenId] = to;
        emit Approval(ERC721J.ownerOf(tokenId), to, tokenId);
    }

    /**
    * @dev Approve `operator` to operate on all of `owner` tokens
    *
    * Emits an {ApprovalForAll} event.
    */
    function _setApprovalForAll(address owner, address operator, bool approved) private {
        require(!(IDenyList(_denyListAddress).isDenied(operator)), "This contract is blocked!");
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
    * @dev Reverts if the `tokenId` has not been minted yet.
    */
    function _requireMinted(uint256 tokenId) private view {
        require(_exists(tokenId), "ERC721: invalid token ID");
    }

    /**
    * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
    * The call is not executed if the target address is not a contract.
    *
    * @param from address representing the previous owner of the given token ID
    * @param to target address that will receive the tokens
    * @param tokenId uint256 ID of the token to be transferred
    * @param data bytes optional data to send along with the call
    * @return bool whether the call correctly returned the expected magic value
    */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.isContract()) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
    * @dev Hook that is called before any token transfer. This includes minting and burning. If {ERC721Consecutive} is
    * used, the hook may be called as part of a consecutive (batch) mint, as indicated by `batchSize` greater than 1.
    *
    * Calling conditions:
    *
    * - When `from` and `to` are both non-zero, ``from``'s tokens will be transferred to `to`.
    * - When `from` is zero, the tokens will be minted for `to`.
    * - When `to` is zero, ``from``'s tokens will be burned.
    * - `from` and `to` are never both zero.
    *
    * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
    */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual {}

    /**
    * @dev Hook that is called after any token transfer. This includes minting and burning. If {ERC721Consecutive} is
    * used, the hook may be called as part of a consecutive (batch) mint, as indicated by `batchSize` greater than 1.
    *
    * Calling conditions:
    *
    * - When `from` and `to` are both non-zero, ``from``'s tokens were transferred to `to`.
    * - When `from` is zero, the tokens were minted for `to`.
    * - When `to` is zero, ``from``'s tokens were burned.
    * - `from` and `to` are never both zero.
    *
    * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
    */
    function _afterTokenTransfer(address from, address to, uint256 tokenId) internal virtual {}
}