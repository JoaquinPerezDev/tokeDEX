// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    //Struct is a way to model the order
    struct _Order {
        //Attributes of an order
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Deposit tokens
    function depositToken(address _token, uint256 _amount) public {
        //Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        //Update balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        //Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //Withdraw tokens
    function withdrawToken(address _token, uint256 _amount) public {
        //Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);
        //Transfer tokens to the user
        Token(_token).transfer(msg.sender, _amount);
        //Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        //Emit an event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //Check balances
    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    //Make orders
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

        orderCount = orderCount + 1;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    //Cancel orders
    function cancelOrder(uint256 _id) public {
        //Fetch the order
        _Order storage _order = orders[_id];
        //User must be address that places order
        require(address(_order.user) == msg.sender);
        //Order must exist
        require(_order.id == _id);
        //Cancel the order
        orderCancelled[_id] = true;
        //Emit an event
        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );
    }

    //Fill orders
    function fillOrder(uint256 _id) public {
        //Fetch order
        _Order storage _order = orders[_id];
        //Swapping tokens(trading)
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        //Fee is paid by the user who filler the order(msg.sender)
        //Fee is deducted from _amountGet
        uint _feeAmount = (_amountGet * feePercent) / 100;

        //Charges user for fee amount from _amountGet
        tokens[_tokenGet][msg.sender] =
            tokens[_tokenGet][msg.sender] -
            (_amountGet + _feeAmount);
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;
        //Transfers fee to fee account
        tokens[_tokenGet][feeAccount] =
            tokens[_tokenGet][feeAccount] +
            _feeAmount;
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
        tokens[_tokenGive][msg.sender] =
            tokens[_tokenGive][msg.sender] +
            _amountGive;
    }


    //Track fee account
}
