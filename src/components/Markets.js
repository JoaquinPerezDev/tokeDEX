import config from "../config.json";
import { useDispatch, useSelector } from "react-redux";
import { loadTokens } from "../store/interactions";

const Markets = () => {
  const provider = useSelector((state) => state.provider.connection);
  const chainId = useSelector((state) => state.provider.chainId);
  const dispatch = useDispatch();

  const marketHandler = async(e) => {
    loadTokens(provider, (e.target.value).split(","), dispatch);
  };

  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange={marketHandler}>
          <option
            value={`${config[chainId].rideToken.address}, ${config[chainId].mETH.address}`}
          >
            RIDE / mETH
          </option>
          <option
            value={`${config[chainId].rideToken.address}, ${config[chainId].mDAI.address}`}
          >
            RIDE / mDAI
          </option>
        </select>
      ) : (
        <div>
          <p>Not deployed to network</p>
        </div>
      )}

      <hr />
    </div>
  );
};

export default Markets;
