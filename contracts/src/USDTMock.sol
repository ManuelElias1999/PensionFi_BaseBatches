// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDTMock is ERC20 {
    constructor() ERC20("Tether USD Mock", "USDT") {
        _mint(msg.sender, 1_000_000_000 * 10 ** 6); // 1,000,000,000 USDT para pruebas
    }

    // Override decimals a 6 para simular USDT real
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
