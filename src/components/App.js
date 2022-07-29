import { useEffect } from "react"
import { useDispatch } from "react-redux"
import config from "../config.json"
import {
  loadProvider,
  loadNetwork,
  loadTokens,
  loadExchange,
  loadAccount,
  subscribeToEvents
} from "../store/interactions"

import Navbar from "./Navbar"
import Markets from "./Markets"
import Balance from "./Balance"
import Order from './Order'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    //Connect ethers to the blockchain
    const provider = loadProvider(dispatch)
    //Fetch current network's chainId
    const chainId = await loadNetwork(provider, dispatch)
    //Reload page when network changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload()
    })
    //Fetch current account & balance from Metamask when changed
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch)
    })
    //Load token smart contracts
    const shr = config[chainId].shr
    const mETH = config[chainId].mETH
    await loadTokens(provider,[shr.address, mETH.address], dispatch)
    //Load exchange smart contracts
    const exchangeConfig = config[chainId].exchange
   
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    //Listen to events
    subscribeToEvents(exchange, dispatch)
  };

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>
      <Navbar />
      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets />
          <Balance />
          <Order />
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  )
}

export default App
