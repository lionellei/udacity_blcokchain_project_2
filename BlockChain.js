/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock().then(function(result) {
			console.log(result);
		}).catch(function(error) {
			console.log(error);
		});
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
		let self = this;
		return new Promise(function(resolve, reject) {
			self.getBlockHeight().then(function(height) {
				if (height != 0) {
					resolve("Genesis block already existed");
				} 
				else {
					var genesis = new Block.Block("Genesis Block!");
					genesis.height = 0;
					genesis.timeStamp = new Date().getTime().toString().slice(0,-3);
					genesis.previousBlockHash = '';
					genesis.hash = SHA256(JSON.stringify(genesis)).toString();
					resolve(self.db.addLevelDBData(0, JSON.stringify(genesis)));
				}
			})
			.catch(function(err) {
				console.log(err);
				reject(err);
			});
		});
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
		let self = this;
		return self.db.getBlocksCount();
    }

    // Add new block
    addBlock(block) {
        // Add your code here
		let self = this;
		return new Promise(function(resolve, reject) {
			self.getBlockHeight().then(function(height) {
				block.height = height;
		      	block.timeStamp = new Date().getTime().toString().slice(0,-3);
				//console.log("current height: "+height);
				
				// get the previous block:
				return self.getBlock(height-1);
			})
			.then(function(previousBlockString) {
				var previousBlock = JSON.parse(previousBlockString)
				block.previousBlockHash = previousBlock.hash;
				block.hash = SHA256(JSON.stringify(block)).toString();
				return self.db.addLevelDBData(block.height, JSON.stringify(block)); 
			})
			.then(resolve)
			.catch(function(err) {
				console.log(err);
				reject(err);
			});
		});
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
		let self = this;
		return self.db.getLevelDBData(height).then(function(blockString) {
			return JSON.parse(blockString);
		});

    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
		let self = this;
		return new Promise(function(resolve, reject) {
			self.getBlock(height).then(function(block){
				var storedHash = block.hash;
				block.hash='';
				var recalculatedHash = SHA256(JSON.stringify(block)).toString();
				if (storedHash == recalculatedHash) {
					console.log("block hash same");
					resolve(true);
				} else {
					resolve(false);
				}
			})
			.catch(function (getBlock_err) {
				console.log(getBlock_err);
				reject(getBlock_err)
			});
		});
    }

	// Validate Blockchain
    validateChain() {
		let self = this;
		return new Promise(function(resolve, reject) {
			self.getBlockHeight()
			.then(function(height) {
				var promises = Array.from(Array(height).keys()).map(function(i) {
					// first check if the hash linking is valid
					return self.getBlock(i).then(function(currentBlock) {
						if (i>0) {
							return self.getBlock(i-1)
							.then(function(previousBlock) {
								return previousBlock.hash == currentBlock.previousBlockHash;
							})
							.catch(function(err) {
								reject(err);
							})
						} else {
							return true;
						}
					})
					.then(function(linkValid) {
						return self.validateBlock(i);
					})
					.catch(function(err) {
						reject(err);
					})
				});
				
				return Promise.all(promises);
			})
			.then(function(arrayOfResolvedValue) {
				var listOfErrors = arrayOfResolvedValue.filter(function(value) {
						return !value;
					});
				resolve(listOfErrors);
			})
			.catch(function(err) {
				console.log(err);
				reject(err);
			})
		});
	}

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
