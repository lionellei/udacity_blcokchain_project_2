/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		// Add your Block properties
		// Example: this.hash = "";
		this.body = data;
		this.height = 0;
		this.timeStamp = '';
		this.previousBlockHash = '';
		this.hash = '';
	}
}

module.exports.Block = Block;