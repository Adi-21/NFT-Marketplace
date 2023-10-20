require("@nomicfoundation/hardhat-toolbox");

// const fs = require("fs")
// const privateKey = fs.readFileSync(".secret").toString()
// const projectId = "SyOFb3S3_TNhX25e1YzZklZPdVzQO-VO"
// const projectId = "WnLfofnxqEWAj6Rtz_343Xb7J-tgA8Dc"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    hardhat:{
      chainId : 1337,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/WnLfofnxqEWAj6Rtz_343Xb7J-tgA8Dc",
      accounts: ["0x5cc8ffd0e7dd7ace7876f7bd10d4078c539f4b1c1472fcec76947a9202ca2471"]
    }
  },
  solidity: "0.8.17",
};
