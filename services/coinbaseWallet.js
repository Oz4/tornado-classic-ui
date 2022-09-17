import BN from 'bignumber.js'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

import { NETWORKS } from '@/constants'
import networkConfig from '@/networkConfig'

const RECONNECT_TIME = 3600000 // 1 hour

const getFirstRpcUrls = (acc, netId) => {
  const { rpcUrls } = networkConfig[`netId${netId}`]
  const [{ url }] = Object.values(rpcUrls)

  return { ...acc, [netId]: url }
}

const RPC = NETWORKS.reduce(getFirstRpcUrls, {})

const coinbaseWalletConnector = (chainId) => {
  try {
    const prevConnection = localStorage.getItem('coinbaseWalletTimeStamp')

    if (new BN(Date.now()).minus(prevConnection).isGreaterThanOrEqualTo(RECONNECT_TIME)) {
      localStorage.removeItem('coinbaseWallet')
    }

    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'Tornado Cash',
      appLogoUrl: '../assets/images/logo.svg',
      darkMode: true,
      overrideIsMetaMask: false,
      reloadOnDisconnect: false
    })

    const provider = coinbaseWallet.makeWeb3Provider(RPC, chainId)

    provider.injectedRequest = provider.enable

    localStorage.setItem('coinbaseWalletTimeStamp', Date.now())
    return provider
  } catch (err) {
    console.log(err)
    throw new Error('coinbaseWalletTimeStamp error: ', err)
  }
}

export default coinbaseWalletConnector
