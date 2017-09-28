var PrideToken = artifacts.require("./PrideToken.sol");

contract('PrideToken', function(accounts) {
	it("should start with zero total supply", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.totalSupply.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, "should equal 0");
		});
	});
	
	it("should give the onwer 0 tokens", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.balanceOf.call(accounts[0]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, "should equal 0");
		});
	});
	
	it("should start locked", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.locked.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, "should equal true");
		});
	});
	
	it("should increase recipient balance when issueing", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.issue(accounts[0], 1000).then(function(result) {
				return instance.balanceOf.call(accounts[0]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 1000, "should equal 1000!");
				return instance.issue(accounts[3], 1310);
			}).then(function(result) {
				return instance.balanceOf.call(accounts[3]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 1310, "should equal 1310!");
			});
		});
	});
	
	it("should prevent transfers when locked", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.transfer(accounts[1], 500).then(function(result) {
				assert(false, "transfer method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[0]).then(function(result) {
					assert.equal(result.valueOf(), 1000, "should equal 500!");
				});
				}
				else
					assert(false, err.toString());
			});
		});
	});
	
	it("should prevent allowance transfers when locked", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.transferFrom(accounts[0], accounts[1], 500).then(function(result) {
				assert(false, "transfer method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[0]).then(function(result) {
					assert.equal(result.valueOf(), 1000, "should equal 500!");
				});
				}
				else
					assert(false, err.toString());
			});
		});
	});
	
	it("should prevent allowance approval when locked", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.approve(accounts[1], 100).then(function(result) {
				assert(false, "transfer method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.allowance.call(accounts[0], accounts[1]).then(function(result) {
						assert.equal(result.valueOf(), 0, "should equal 0!");
					}); 
				}
				else
					assert(false, err.toString());
			});
		});
	});
	
	it("should allow unlocking", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.unlock().then(function() {
				return instance.locked.call();
			}).then(function() {
				assert.equal(false.valueOf(), false, "should equal false");
			})
		});
	});
	
	it("should allow transfers when unlocked", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.transfer(accounts[1], 500).then(function(result) {
				return instance.balanceOf.call(accounts[1]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 500, "should equal 500!");
				return instance.balanceOf.call(accounts[0]).then(function(result) {
					assert.equal(result.valueOf(), 500, "should equal 500!");
				});
			});
		});
	});
	
	it("should prevent transfering more than the account balance", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.transfer(accounts[1], 5000).then(function(result) {
				return instance.balanceOf.call(accounts[1]);
			}).then(function(result) {
				assert(false, "transfer method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[0]).then(function(result) {
						assert.equal(result.valueOf(), 500, "should equal 500!");
					});
				}
				else
					assert(false, err.toString());
			});
		});
	});
	
	it("should allow only the owner to unlock", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.transferOwnership(accounts[1]).then(function(result) {
				return instance.unlock(); 
			}).then(function(result) {
				assert(false, "unlock method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
				}
				else
					assert(false, err.toString());
			});
		});
	});
	
	it("should allow only the owner to issue", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.transferOwnership(accounts[1]).then(function(result) {
				return instance.issue(accounts[0], 1000); 
			}).then(function(result) {
				assert(false, "issue method was supposed to throw but didn't!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
				}
				else
					assert(false, err.toString());
			});
		});
	});	
	
	it("should allow allowance approval when unlocked", function() {
		return PrideToken.deployed().then(function(instance) {
			return instance.approve(accounts[1], 100).then(function(result) {
				return instance.allowance.call(accounts[0], accounts[1]);
			}).then(function(result) { 
				assert.equal(result.valueOf(), 100, "should equal 100!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
				}
				
				assert(false, err.toString());
			});
		});
	});
	
	it("should prevent allowance transfers that exceed approved amount", function() {
		return PrideToken.deployed().then(function(instance) {
			var account1balance = 0;
			return instance.balanceOf.call(accounts[1]).then(function(result) {
				account1balance = result.valueOf();
				return instance.transferFrom(accounts[0], accounts[4], 101, {from: accounts[1] });
			}).then(function(result) {
				return instance.balanceOf.call(accounts[1]);
			}).then(function(result) {
				assert.equal(account1balance, result.valueOf(), 'should equal to initial accounts[1] balance!');
				return instance.balanceOf.call(accounts[0]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 400, "should equal 400!");
				return instance.balanceOf.call(accounts[4]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 100, "should equal 100!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test ok!");	
				}
				else
					assert(false, err.toString());
			});
		});
	});
	
	it("should allow allowance transfers", function() {
		return PrideToken.deployed().then(function(instance) {
			var account1balance = 0;
			return instance.balanceOf.call(accounts[1]).then(function(result) {
				account1balance = result.valueOf();
				return instance.transferFrom(accounts[0], accounts[4], 100, {from: accounts[1] });
			}).then(function(result) {
				return instance.balanceOf.call(accounts[1]);
			}).then(function(result) {
				assert.equal(account1balance, result.valueOf(), 'should equal to initial accounts[1] balance!');
				return instance.balanceOf.call(accounts[0]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 400, "should equal 400!");
				return instance.balanceOf.call(accounts[4]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 100, "should equal 100!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test failed!");	
				}
				assert(false, err.toString());
			});
		});
	});
	
	it("should prevent non-approved allowance transfers", function() {
		return PrideToken.deployed().then(function(instance) {
			var account1balance = 0;
			return instance.balanceOf.call(accounts[1]).then(function(result) {
				account1balance = result.valueOf();
				return instance.transferFrom(accounts[0], accounts[4], 100, {from: accounts[1] });
			}).then(function(result) {
				return instance.balanceOf.call(accounts[1]);
			}).then(function(result) {
				assert.equal(account1balance, result.valueOf(), 'should equal to initial accounts[1] balance!');
				return instance.balanceOf.call(accounts[0]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 400, "should equal 400!");
				return instance.balanceOf.call(accounts[4]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 100, "should equal 100!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test ok!");	
				}
				else
					assert(false, err.toString());
			});
		});
		
	});
	
	it("should prevent allowance transfers that exceed from balance", function() {
		return PrideToken.deployed().then(function(instance) {
			var account1balance = 0;
			return instance.balanceOf.call(accounts[1]).then(function(result) {
				account1balance = result.valueOf();
				return instance.approve(accounts[1], 1000);
			}).then(function(result) {
				return instance.transferFrom(accounts[0], accounts[4], 1000, {from: accounts[1] });
			}).then(function(result) {
				return instance.balanceOf.call(accounts[1]);
			}).then(function(result) {
				assert.equal(account1balance, result.valueOf(), 'should equal to initial accounts[1] balance!');
				return instance.balanceOf.call(accounts[0]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 400, "should equal 400!");
				return instance.balanceOf.call(accounts[4]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 100, "should equal 100!");
			}).catch(function(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test ok!");	
				}
				else
					assert(false, err.toString());
			});
		});
		
	});
	
});
