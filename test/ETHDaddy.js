const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("ETHDaddy", () => {

  let ethDaddy, deployer, owner1
  const NAME = 'ETH Daddy'
  const SYMBOL = 'ETHD'

  beforeEach(async () => {
    //Setup Accounts
    [deployer, owner1] = await ethers.getSigners()

    //Deploy Contract
    const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
    ethDaddy = await ETHDaddy.deploy('ETH Daddy', 'ETHD')

    //List a domain
    const transaction = await ethDaddy.connect(deployer).list('jack.eth', tokens(10))
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('has a name', async () => {
      const result = await ethDaddy.name()
      expect(result).to.equal(NAME)
    })

    it('has a symbol', async () => {
      const result = await ethDaddy.symbol()
      expect(result).to.equal(SYMBOL)
    })

    it('Sets the owner', async () => {
      const result = await ethDaddy.owner()
      expect(result).to.equal(deployer.address)
    })

    it('Returns to the max supply', async () => {
      const result = await ethDaddy.maxSupply()
      expect(result).to.equal(1)
    })

    it('Return to the total supply', async () => {
      const result = await ethDaddy.totalSupply()
      expect(result).to.equal(0)
    })
  })

  describe('Domain', () => {
    it("Retuns domain attributes", async () => {
      let domain = await ethDaddy.getDomain(1);
      expect(domain.name).to.be.equal('jack.eth');
      expect(domain.cost).to.be.equal(tokens(10));
      expect(domain.isOwned).to.be.equal(false);
    })
  })

  describe('Minting', () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("10", "ether")

    beforeEach(async () => {
      const transaction = await ethDaddy.connect(owner1).mint(ID, { value: AMOUNT })
      await transaction.wait()
    })

    it('Updates the owner', async () => {
      const owner = await ethDaddy.ownerOf(ID)
      expect(owner).to.equal(owner1.address)
    })

    it('Updates domain status', async () => {
      const domain = await ethDaddy.getDomain(ID)
      expect(domain.isOwned).to.be.equal(true)
    })

    it('Updates the contract balance', async () => {
      const result = await ethDaddy.getBalance();
      expect(result).to.equal(AMOUNT)
    })

    it('Update total supply', async () => {
      const result = await ethDaddy.totalSupply()
      expect(result).to.equal(1)
    })
  })

  describe('Withdrawing', () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits('10', 'ether')
    let beforeBalance

    beforeEach(async () => {
      beforeBalance = await ethers.provider.getBalance(deployer.address)

      let transaction = await ethDaddy.connect(owner1).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await ethDaddy.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates owner balance', async () => {
      const afterBalance = await ethers.provider.getBalance(deployer.address)
      expect(afterBalance).to.be.greaterThan(beforeBalance)
    })

    it('Updates contract balance', async () => {
      const result = await ethDaddy.getBalance()
      expect(result).to.be.equal(0)
    })
  })
})
