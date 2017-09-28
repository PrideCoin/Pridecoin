// get abstraction for TestOwner contract
//chai.config.includeStack = true;

var TestOwner = artifacts.require("./TestOwnable.sol");

contract('TestOnwable', function(accounts) {
	it("should allow only owner made calls", function() {
//		assert.equal(true, false);
		
		return TestOwner.deployed().then(function(instance) {
			return instance.testOnlyOwner.call().then(function(result) {
				assert.equal(result.valueOf(), true, "should return true");				
				return instance.transferOwnership(accounts[1]);
			}).then(function(result) {
				return instance.testOnlyOwner.call(); 
			}).then(function(result) {
				assert(false, "testOnlyOwner method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
				}
				else
					assert(false, err.toString());
				//assert.throws(result.valueOf(), "Should throw exception");
			});
		});
	});
});
// assert.equal(.valueOf(), true);
