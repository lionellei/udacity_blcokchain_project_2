/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB, { valueEncoding : 'json' }); //!! need to set valueEncoding to json in order to store JSON objects
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
			self.db.get(key, function(err, value) {
				if (err) {
					console.log("Key: "+key+" not found. ");
					console.log(err);
					reject(err);
				}
				else {
					resolve(value);
				}
			});
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject() 
			self.db.put(key, value, function(err) {
				if (err) {
					console.log(err);
					reject(err);
				}
				else {
					resolve("Block " + key + " added to levelDB");
				}
			})
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject){
            // Add your code here, remember in Promises you need to resolve() or reject
			let count = 0;
			self.db.createReadStream()
				.on('data', function(data) {
					count ++;
				})
				.on('error', function(err) {
					console.log(err);
					reject(err);
				})
				.on('close', function() {
					resolve(count);
				});
        });
    }
        

}

module.exports.LevelSandbox = LevelSandbox;
