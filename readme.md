This is the repository for the LearningBlocks DApp.

# Development setup
## Global Prerequisites
[NodeJs](https://nodejs.org)
[NPM](https://nodejs.org)
[Yarn](https://yarnpkg.com/en/)
[Ganache](http://truffleframework.com/ganache/) or [Ganache-CLI](https://www.npmjs.com/package/ganache-cli)
[Truffle](http://truffleframework.com/)
[Metamask](https://metamask.io/) enabled browser

### Download and install dependencies
`yarn`

### Compiling smart contracts
`truffle compile`

##' Launch Ganache or ganache-cli


### Deploy smartcontracts
This will deploy the smart contracts to the locally running network
`truffle migrate`



### Starting the app
Make sure the Ganache accounts are imported into Metamask. The easiest way is to create a new Metamask den using the MNEMONIC phrase generated by Ganache

The webfrontend can be started using
`yarn run start`

The local Dapp can now be accessed from
http://localhost:3000

### Basic usage
The owner Etherum account (deployer and first account listed by Ganache ) has all role based permissions by default. The basic flow for issuing a Learning Blocks token is:

1. Create a course in the admin section of the Dapp: http://localhost:3000/admin
2. Issue a token in the Teacher section of the Dapp: http://localhost:3000/teacher. The generated course from step 1 is now be available form the dropdown (assuming the block has been mined in the meantime).
The token will be send to the specified Etherum address.
3. Switch metamask accounts to the student address specified in step 2. Refreshing the page and going to http://localhost:3000/student will now list all previously created tokens owned by this account.


