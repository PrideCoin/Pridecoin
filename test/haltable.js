var TestHaltable = artifacts.require("./TestHaltable.sol");

contract('TestHaltable', function(accounts) {
	it("should allow calls to be made when unhalted", function() {
		return TestHaltable.deployed().then(function(instance) {
			return instance.allowedWhenNotHalted.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, "should return true");
		});
	});

	it("should prevent calls to methods marked with stopInEmergency from being made when halted", function() {
		return TestHaltable.deployed().then(function(instance) {
			return instance.halt().then(function() {
				return instance.allowedWhenNotHalted.call();
			}).then(function(result) {
				assert(false, "allowedWhenNotHalted method was supposed to throw when halted but didn't!");
			}).catch(function(err) {
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling when halted, test is ok!");
				} 
				else
					assert(false, err.toString());
			});
		});
	});

	it("should allow calls to methods marked with onlyInEmergency when halted", function() {
		return TestHaltable.deployed().then(function(instance) {
			return instance.halt().then(function() {
				return instance.allowedInEmergency.call();
			}).then(function(result) {
				assert.equal(result.valueOf(), true, "should return true");
			}).catch(function(err) {
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling when halted, test is failed!");
				} 
				else
					assert(false, err.toString());
			});
		});
	});
});
