This is the repository for the Learning Blocks DApp Colony Hackathon submission.

# Development setup
## Global Prerequisites
- [NodeJs](https://nodejs.org)
- [NPM](https://nodejs.org)
- [Yarn](https://yarnpkg.com/en/)
- [Ganache](http://truffleframework.com/ganache/) or [Ganache-CLI](https://www.npmjs.com/package/ganache-cli)
- [Truffle](http://truffleframework.com/)
- [Metamask](https://metamask.io/) enabled browser

## Installation and first run

Formatted text like `this` is meant to be run in a terminal window.
Please run these steps in order.

### Step 0: Clone the repository
Clone this repository unless this was provided to you through a Pull Request
`git clone https://github.com/learning-blocks/learningblocks-colony-hackathon`

Enter into the folder:
`cd learningblocks-colony-hackathon`

### Step 1: Download and install all dependencies
`yarn`
(This might take some time.)

### Step 2: Start a local blockchain
`yarn start-ganache`

### Step 3: Deploy the colonyNetwork contracts
Open up a new terminal window in the same folder and run
`yarn deploy-colony-contracts`

### Step 4: Bootstrap the colonyNetwork with our own colony and sample data
`yarn bootstrap-colony`

### Step 5: Deploy the Learning Blocks contracts
`yarn deploy-learningblocks`


### Step 6: Run the development server
`yarn run start`

### Step 7: Import the den into Metamask
Restore a den in Metamask using the mnemonic seed phrase: `sense reduce shaft skin void genius bullet solve code trim anxiety month`

Enter a password of your choice.

### Step 8: Open the DApp front end and start interacting
In the same browser instance open the link:
[http://localhost:3000/](http://localhost:3000/)


# Colony Hackathon Notes
## Concept
We are connecting Learning Block courses and certificates to global colony skills.
Whenever students complete a course and earn their certificates, they also earn reputation in the MetaColony that is transferable to any other colony.

Please [read here for a more comprehensive project description](https://github.com/learning-blocks/colonyHackathon/blob/master/submissions/Learning%20Blocks.md).

## Notes
Full Metamask integration is planned for the future, but for the purpose of this demo the accounts to be used must be fixed.

### Accounts
The demo accounts are created by Ganache.

**accounts[0]** will be the Learning Blocks smart contract owner, the admin who can create new courses, and also the teacher/issuer who can issue certificates.

**accounts[1]** is the student's account in this demo.

A "Submit Review" task will be created when a Learning Blocks certificate is issued. The roles for this task are:

- MANAGER and EVALUATOR: **accounts[0]**
- EVALUATOR: **accounts[1]**

Permissions are related to the currently selected MetaMask account in the browser.


## User Flows

### Issuing of Learning Blocks courses and certificates

### Admin and teacher/issuer user flows
A Learning Blocks admin goes to [http://localhost:3000/admin](http://localhost:3000/admin) and creates a new course by filling out the form. The last drop down will associate this course with a global colony skill.

Colony skills will be maintained in the future by the global colony. For demo purposes 5 skills have been created during the colony-bootstrap process. The image will only be used for visual display. This image hash can be used for demo purposes: `QmYUYzCk7gpWcwhgEQKJXUJTNDBVH7B5ydhXhECuRDizx3`.

Clicking the submit button will trigger the MetaMask transaction.
There is not much visual feedback once the submit button is pressed. The browser Javascript console reveals a few more logs such as the IPFS data storage URLs and transaction receipts.

Once the transaction is mined, a click on the refresh button on the admin page will reload all of the courses and the table will update.

The next step is to issue a certificate once a student completes a course. Each Learning Blocks certificate is issued in the form of an ERC721 token with additional details stored on IPFS and linked to the token.

Certificates can be issued from [http://localhost:3000/teacher](http://localhost:3000/teacher). Ganache **accounts[0]** is authorized here to execute these transactions.

The course created in the previous step is now available in the dropdown list and should be selected.
Certificate issue dates and expiration dates are optional, but can be selected with the date picker.
The student Uport ID is currently being saved, but not being used.

The student Ethereum address is the address that the token will be sent to. This should be set to Ganache **accounts[1]** !! (`0xE9A671bBf9a0Cc825C09091Fbd0e08994BA94EFA`)


The points / grade is optional.

Clicking submit does the following:

- Saves the token metadata on IPFS
- Mints an ERC721 token and sends it to the student Ethereum address (A transaction will trigger MetaMask and needs to be submitted.)
- A colony task for submitting review will be created and the WORKER will be set to the student address. A required due date will also be set (in the future).

### Student User Flow

As a student (who is signed in to MetaMask with **acccounts[1]**):

Go to [http://localhost:3000/student](http://localhost:3000/student).
All of the Learning Block tokens that are owned by this account will be listed.
Clicking "Submit Review" will trigger the colony task workflow. This is not fully implemented in the user interface yet, but can be observed in the Javascript console.

- If no work has been submitted, we will submit an empty hash (This is to bypass the colony requirement.).
- We generate a rating secret and submit the review to the MANAGER from the student (This currently fails for unknown reasons.).

Not implemented yet:

- The Evaluator needs to leave a review for the student.
- Finalizing the task and paying out the rewards (There currently aren't any.). This allows for the student to earn the skill reputation in the colony.



