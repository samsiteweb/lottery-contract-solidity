pragma solidity ^0.4.17;

    contract Lottery {
        address public manager;
        address[] public players;
        
        function Lottery() public {
            manager = msg.sender;
        }
        
        function enterLotery() public payable {
            require(msg.value > .01 ether);
            players.push(msg.sender);
        }
        
        function genRandomNumber() private view returns(uint) {
           return uint(keccak256(block.difficulty, now, players));
        }
        
        function getAllPlayers() public view returns(address[]) {
            return players; 
        }
        
        function getBalance() public view returns(uint) {
            return this.balance;
        }
        
        function lotteryWinner() public protected {
            uint index = genRandomNumber() % players.length;
            players[index].transfer(this.balance);
            players = new address[](0);
        }
        
        modifier protected() {
            require(manager == msg.sender);
            _;
        }
        
}  