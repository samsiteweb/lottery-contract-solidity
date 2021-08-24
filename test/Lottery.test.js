const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile')

let lottery;
let accounts;

beforeEach( async () => {
    //get accounts
    accounts = await web3.eth.getAccounts();

    // deploy an instance of lottery
    lottery = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data: bytecode}).send({from: accounts[0], gas: '1000000'});
})

describe('Lottery contract', () => {
    it('deploys contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter into the lottery', async() => {
        await lottery.methods.enterLotery().send({
            from: accounts[0],
            value: web3.utils.toWei('0.011', 'ether')
        });
        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[0]
        })
        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    });

    it('allows multiple accounts to enter into lottery', async() => {
        await lottery.methods.enterLotery().send({
            from: accounts[0],
            value: web3.utils.toWei('0.011', 'ether')
        });
        await lottery.methods.enterLotery().send({
            from: accounts[1],
            value: web3.utils.toWei('0.011', 'ether')
        });
        await lottery.methods.enterLotery().send({
            from: accounts[2],
            value: web3.utils.toWei('0.011', 'ether')
        });

        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[0]
        })
        const balance = await lottery.methods.getBalance().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])
        assert.equal(web3.utils.toWei('0.033', 'ether'), balance)
        assert.equal(3, players.length)
    });

    it('should fail when entrying the lattory with an invalid amount', async () => {
        try {
            await lottery.methods.enterLotery().send({
                from: accounts[0],
                value: 0
            });
            assert(false)
        } catch (error) {
            assert(error)
        }
    });

    it('should fail if not manager pick winner', async () => {
        try {
            await lottery.methods.lotteryWinner().send({
                from: accounts[1]
            })
            assert(false)
        } catch (error) {
            assert(error)
        }
        
    });

    it('end to end test', async () => {
        await lottery.methods.enterLotery().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalnce = await web3.eth.getBalance(accounts[0])
        await lottery.methods.lotteryWinner().send({
            from: accounts[0]
        })
        const finalBalnce = await web3.eth.getBalance(accounts[0])
        const difference = finalBalnce - initialBalnce
        assert(difference > web3.utils.toWei('1.8', 'ether'))
    })

})