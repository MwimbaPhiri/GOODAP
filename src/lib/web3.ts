// Web3 utility functions for Base network integration

export interface Web3State {
  isConnected: boolean
  address: string | null
  balance: string
  chainId: number | null
}

export class BaseWallet {
  private provider: any = null
  private signer: any = null

  async connect(): Promise<Web3State> {
    try {
      // Check if MetaMask or similar wallet is installed
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        // Get provider and signer
        this.provider = new (window as any).ethers.providers.Web3Provider(window.ethereum)
        this.signer = this.provider.getSigner()
        
        // Get address
        const address = await this.signer.getAddress()
        
        // Get balance
        const balance = await this.provider.getBalance(address)
        const balanceInEth = (window as any).ethers.utils.formatEther(balance)
        
        // Get network
        const network = await this.provider.getNetwork()
        
        // Switch to Base network if not already on it
        await this.switchToBase()
        
        return {
          isConnected: true,
          address,
          balance: balanceInEth,
          chainId: network.chainId
        }
      } else {
        throw new Error('MetaMask not found. Please install MetaMask.')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      throw error
    }
  }

  async switchToBase(): Promise<void> {
    try {
      const baseChainId = '0x2105' // Base Mainnet chain ID
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: baseChainId }]
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: baseChainId,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }
            ]
          })
        } else {
          throw switchError
        }
      }
    } catch (error) {
      console.error('Error switching to Base network:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null
    this.signer = null
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }
    return await this.signer.signMessage(message)
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: (window as any).ethers.utils.parseEther(amount)
      })
      
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('Transaction error:', error)
      throw error
    }
  }

  async getBalance(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected')
    }

    const address = await this.signer.getAddress()
    const balance = await this.provider.getBalance(address)
    return (window as any).ethers.utils.formatEther(balance)
  }
}

// Mock wallet for development when MetaMask is not available
export class MockWallet {
  private mockAddress = '0x1234567890123456789012345678901234567890'
  private mockBalance = '1.2345'

  async connect(): Promise<Web3State> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      isConnected: true,
      address: this.mockAddress,
      balance: this.mockBalance,
      chainId: 8453 // Base chain ID
    }
  }

  async disconnect(): Promise<void> {
    // Mock disconnect
  }

  async signMessage(message: string): Promise<string> {
    return `mock_signature_${message}`
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    return `mock_tx_hash_${Date.now()}`
  }

  async getBalance(): Promise<string> {
    return this.mockBalance
  }
}

export const getWallet = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new BaseWallet()
  }
  return new MockWallet()
}