This is the repository for the LearningBlocks DApp Colony hackathon submission.

# Development setup
## Global Prerequisites
- [NodeJs](https://nodejs.org)
- [NPM](https://nodejs.org)
- [Yarn](https://yarnpkg.com/en/)
- [Ganache](http://truffleframework.com/ganache/) or [Ganache-CLI](https://www.npmjs.com/package/ganache-cli)
- [Truffle](http://truffleframework.com/)
- [Metamask](https://metamask.io/) enabled browser

## Installation and first run

Formated text like `this` is meant to be run in a terminal window
Please run this steps in order 

### Step 0: Clone the repository
Clone this repository unless this was provided to you through a Pull Request
`git clone https://github.com/learning-blocks/learningblocks-colony-hackathon`

Enter the folder: 
`cd learningblocks-colony-hackathon`

### Step 1: Download and install all dependencies
`yarn`
(This might take a while)

### Step 2: Start a local blockchain
`yarn start-ganache`

### Step 3: Deploy the colonyNetwork contracts
Open up a new terminal window in the same folder an run
`yarn deploy-colony-contracts`

### Step 4: Bootstrap the colonyNetwork with our own colony and some sample data
`yarn bootstrap-colony`

### Step 5: Deploy the Learning Blocks contracts
`yarn deploy-learningblocks`


### Step 6: Run the development server
`yarn run start`

### Step 7: Import the den into Metamask
Restore a den in Metamask using the mnemonic seedphrase : `sense reduce shaft skin void genius bullet solve code trim anxiety month`
Enter a password of your choice

### Step 8: Open the Dapp frontend and start interacting
In the same browser instance open the link: 
[http://localhost:3000/](http://localhost:3000/)


# Colony Hackathon notes
## Idea
We are connecting Learning Block courses to global colony skills.
Whenever students complete a course an earn their certificate they also earn reputation in the MetaColony that is transferabble to any other colony.


## Notes
Full on metamaks integration is planned for the future, but in order for this demo the accounts to be used need to be fixed.

##### Accounts
The demo accounts are created by Ganache.

**accounts[0]** will be the Learningblocks smart contract owner, the admin that can create new courses, and also the teacher that can issue certificates.

**accounts[1]** is the students account in this demo

A "Submit review" task will be created when a learninblocks certificate is issues. The roles for this task are

- MANAGER and EVALUATOR: accounts[0]
- EVALUATOR: accounts[1]

Permissons are related to the currently selected MetaMask account in the browser.


## User flows

### Learningblocks courses and certificates

### Admin and teacher user flows
A LearningBlocks admin goes to [http://localhost:3000/admin](http://localhost:3000/admin) and creates a new Course by filling out the form. The last dropdown will assosiate this course with a global colony skill.
Colony Skills will be maintained in the future by the global colony, for demo purposes 5 skills have been created during the colony-bootstrap process.
The image will only be used for visual display. This image hash can be used for demo purposes: `QmYUYzCk7gpWcwhgEQKJXUJTNDBVH7B5ydhXhECuRDizx3`.

Clicking the submit button will trigger the MetaMask transaction.
There is not much visual feedback once the submit button is pressed. The browser javascript console reveals a few more logs like the IPFS data storage urls and transaction receipts

Once the transaction is mined a click on the Refresh button on the admin page will reload all courses and the table will update.


The next step is to issue a certificate once a student completes a course. Each LearningBlocks certificarte is issues in the form of an ERC721 token with additional details stored on ipfs and linked to the token.

Certicates can be issued from [http://localhost:3000/teacher](http://localhost:3000/teacher). Ganache account[0] is authorized here to execute these transactions.

The course created in the previous step is now availabe in the dropdown list and should be selected.
Issue dates and expiraton dates are optional but can be seletcted with the Date picker.
The student Uport ID is currently being saved, but not being used.

The Student Etherum address is the address that the token will be send to. This should be set to Ganache **accounts[1]** !! (`0xE9A671bBf9a0Cc825C09091Fbd0e08994BA94EFA`)


The Points/Grade is optional

Clicking Submit will do the following:

- Save the token metadata on IPFS
- Mint an ERC721 token and send it to the student Etherum address ( Transaction will trigger MetaMask and needs to be submitted)
- A colony task for submitting review will be created and the WORKER will be set to the student address. A required due date will be set too (far in the future)

### Student user flow

As a student (Signed in to MetaMask with acccounts[1])

Go to [http://localhost:3000/student](http://localhost:3000/student)
All the learningBlock tokens that are owned by this account will be listed
Clicking "Submit Review" will kick off the colony task workflow. This is not fully implmented in the user interface yet, but can be observed in the javascript console.

- If no work has been submitted we will submit an empty hash (This is to bypass the colony requirement)
- We generate a rating secret and submit the review for the MANAGER from the student (This currently fails for unknown reasons)

Not implemented yet:

- The Evaluator needs to leave a review for the student
- Finalzing the taks and paying out the rewards (There aren't any currently). This will also earn the student the skill reputation in the Colony



