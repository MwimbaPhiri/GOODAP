'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { getWallet, Web3State } from '@/lib/web3'

interface WalletConnectProps {
  onConnect?: (state: Web3State) => void
  onDisconnect?: () => void
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [walletState, setWalletState] = useState<Web3State>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wallet = getWallet()

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      // For demo purposes, we'll start with disconnected state
      // In a real app, you'd check existing connection
    } catch (error) {
      console.error('Connection check error:', error)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      const state = await wallet.connect()
      setWalletState(state)
      onConnect?.(state)
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await wallet.disconnect()
      setWalletState({
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null
      })
      onDisconnect?.()
    } catch (error) {
      console.error('Wallet disconnect error:', error)
    }
  }

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (walletState.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-green-600" />
            <span>Wallet Connected</span>
          </CardTitle>
          <CardDescription>
            Your Base network wallet is ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Address:</span>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(walletState.address!)}
                </code>
                <Button size="sm" variant="ghost" onClick={copyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Balance:</span>
              <span className="font-mono">{parseFloat(walletState.balance).toFixed(4)} ETH</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network:</span>
              <Badge variant="secondary">Base</Badge>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => window.open(`https://basescan.org/address/${walletState.address}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </CardTitle>
        <CardDescription>
          Connect your Base network wallet to access Web3 features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            By connecting your wallet, you'll be able to:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Buy and sell event tickets as NFTs</li>
            <li>• Purchase event merchandise</li>
            <li>• Receive payments for your events</li>
            <li>• Access exclusive Web3 features</li>
          </ul>
        </div>

        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Make sure you have MetaMask or a compatible wallet installed
        </p>
      </CardContent>
    </Card>
  )
}