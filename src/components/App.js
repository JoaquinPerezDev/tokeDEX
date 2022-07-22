import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
} from "../store/interactions";
import config from "../config.json";
import Navbar from "./Navbar";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    //Connect ethers to the blockchain
    const provider = loadProvider(dispatch);
    //Fetch current network's chainId
    const chainId = await loadNetwork(provider, dispatch);
    //Fetch current account and balance from Metamask
    const account = await loadAccount(provider, dispatch);

    //Load token smart contracts
    const rideToken = config[chainId].rideToken;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [rideToken.address, mETH.address], dispatch);

    //Load exchange smart contracts
    const exchangeConfig = config[chainId].exchange;
    await loadExchange(provider, exchangeConfig.address, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      <Navbar />
      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}

          {/* Balance */}

          {/* Order */}
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
  );
}

export default App;
