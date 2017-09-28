var daysecs = 60 * 60 * 24;
var PrideCoinCrowdsale = artifacts.require("./PrideCoinCrowdsale.sol");
var PrideTokenForCrowdsale = artifacts.require("./PrideToken.sol");
var Stage = 
{
    Waiting: 0,
    PreICO: 1,
    Gold1: 2,
    Gold2: 3,
    Gold3: 4,
    Silver1: 5,
    Silver2: 6,
    Silver3: 7,
    Bronze1: 8,
    Bronze2: 9,
    Bronze3: 10,
    Ended: 11
} 

contract('PrideCoinCrowdsale', function(accounts) {
	var preICOBalance;
	var ICOContributions = 0;
	
	it("should start with correct parameters", function() {	
		var crowdsale;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.preICOStart.call();
		}).then(function(result) {
			assert.isTrue((result.valueOf() >= (new Date().getTime() / 1000) + daysecs - 60) && (result.valueOf() <= (new Date().getTime() / 1000) + daysecs), 'preICO should start tommorow');
			return crowdsale.ICOStartAfterDays.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), 22 * daysecs, "equal 22 days");
			return crowdsale.tokenSold.call();
		}).then(function(result) {
			token = result.valueOf();
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			instance.transferOwnership(crowdsale.address); // make the crowdsale contract the owner to allow issueing
			assert.equal(token, instance.address, 'tokenSold should equal to the token address');
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Waiting, 'should start in waiting stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), false, 'method should return false (not in ICO)');
		});
	});
	
	it("should prevent contributing if the preICO has not started yet", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			try
			{
				sendEther(accounts[1], crowdsale.address, 1);
			} catch(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[1]).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
						return PrideTokenForCrowdsale.deployed();
					}).then(function(instance) {
						return instance.balanceOf.call(accounts[1]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal to 0'); 
					});
				}
				else
					assert(false, err.toString());
			}
		});
	});
	
	it("should enter in pre-ICO stage after 1 day", function() {	
		var crowdsale;

		setCurrentEthTimestamp((new Date().getTime() / 1000) + daysecs);
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.PreICO, 'should equal to PreICO Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), false, 'method should return false (not in ICO)');
		});
	});
	
	it("should have give a bonus for the first 99 contribute in the pre-ICO stage", function() {	
		var crowdsale;
		var token;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[12], crowdsale.address, 1);
			return crowdsale.balanceOf.call(accounts[12]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			token = instance;
			return instance.balanceOf.call(accounts[12]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 250000000000, 'should equal to 2500 during pre-ICO bonus'); 
			var totalAccountBalance = 0;
			for(var i = 0; i < 98; i++) {
				sendEther(accounts[13], crowdsale.address, 1);
				totalAccountBalance += 250000000000;
				crowdsale.balanceOf.call(accounts[13]).then(function(result) {
					assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
					token.balanceOf.call(accounts[13]).then(function(result) {
						assert.equal(result.valueOf(), totalAccountBalance, 'should equal to 2300 during preICO bonus'); 
					});
				});
			}
		});
	});
	
	it("should have the correct exchange rate for the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[1], crowdsale.address, 1);
			return crowdsale.balanceOf.call(accounts[1]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[1]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 200000000000, 'should equal to 2000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 1 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[14], crowdsale.address, 25);
			return crowdsale.balanceOf.call(accounts[14]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[14]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 10000000000000, 'should equal to 10000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 2 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[15], crowdsale.address, 50);
			return crowdsale.balanceOf.call(accounts[15]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[15]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 50000000000000, 'should equal to 50000000000000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 3 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[16], crowdsale.address, 100);
			return crowdsale.balanceOf.call(accounts[16]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[16]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 240000000000000, 'should equal to 2400000000000000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 4 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[17], crowdsale.address, 200);
			return crowdsale.balanceOf.call(accounts[17]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[17]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1000000000000000, 'should equal to 10000000000000000 during preICO'); 
		});
	});
	
	it("should prevent contributing less than the pre-ICO minimum amount", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			try
			{
				sendEther(accounts[2], crowdsale.address, 0.4);
			} catch(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[2]).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
						return PrideTokenForCrowdsale.deployed();
					}).then(function(instance) {
						return instance.balanceOf.call(accounts[2]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal to 0 for less than minimum'); 
					});
				}
				else
					assert(false, err.toString());
			}
		});
	});
	
	it("should allow withdrawal of funds during the pre ICO", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			preICOBalance = parseInt(getBalance(crowdsale.address));
			ownerBalance = parseInt(getBalance(accounts[0]));
			return crowdsale.withdraw();
		}).then(function() {
			assert.equal((preICOBalance + ownerBalance) * Math.pow(10, 18), parseInt(getBalance(accounts[0])) * Math.pow(10, 18), 'balance after withdrawal should equal to contract balance + previous owner balance!');
		});
	});
	
	it("should prevent contributing if the ICO has not started", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			try
			{
				sendEther(accounts[1], crowdsale.address, 1);
			} catch(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[1]).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal to zero during preICO');
						return PrideTokenForCrowdsale.deployed();
					}).then(function(instance) {
						return instance.balanceOf.call(accounts[1]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 200000000000, 'should equal to 200000000000'); 
					});
				}
				else
					assert(false, err.toString());
			}
		});
	});
	
	it("should enter in waiting if the maximum amount for the pre-ICO stage was raised", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[1], crowdsale.address, 5000);
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Waiting, 'should equal to waiting');
		});
	});
	
	it("getRaisedAmount should return the correct amount raised in the pre ICO", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			preICOBalance += parseInt(getBalance(crowdsale.address));
			return crowdsale.getRaisedAmount.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), preICOBalance * Math.pow(10, 18), 'should equal to the contract balance');
		});
	});
	
	it("should enter in waiting stage after PreICO duration", function() {	
		var crowdsale;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.preICOEnd.call();
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + parseInt((result.valueOf())));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Waiting, 'should equal to PreICO Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), false, 'method should return false (not in ICO)');
		});
	});
	
	it("getRaisedAmount should return the amount raised in the pre ICO when in the waiting period", function() {	
		var crowdsale;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.getRaisedAmount.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), preICOBalance * Math.pow(10, 18), 'should equal to the contract balance');
		});
	});
	
	it("should allow to setICOMinAmountRaised in Waiting period", function() {	
		var crowdsale;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.setICOMinAmountRaised(2000 * Math.pow(10, 18));
		}).then(function(result) {
			return crowdsale.ICOMinAmountRaised.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), 2000 * Math.pow(10, 18), 'should equal to the new value');
		});
	});
	
	it("should allow withdrawal of funds during the waiting period", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			preICOBalance = parseInt(getBalance(crowdsale.address));
			ownerBalance = parseInt(getBalance(accounts[0]));
			return crowdsale.withdraw();
		}).then(function() {
			assert.equal((preICOBalance + ownerBalance) * Math.pow(10, 18), parseInt(getBalance(accounts[0])) * Math.pow(10, 18), 'balance after withdrawal should equal to contract balance + previous owner balance!');
		});
	});
	
	it("should enter in ICO stage when the time is right", function() {	
		var crowdsale;
		var preICOEnd;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.preICOEnd.call();
		}).then(function(result) {
			preICOEnd = result.valueOf();
			return crowdsale.ICOStartAfterDays.call();
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(preICOEnd) )); // date increment is the number of days in between the preICO end and the beginning of the ICO
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Gold1, 'should equal to Gold1 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should prevent withdrawal of funds during the ICO period", function() {	
		var crowdsale;
		var icoBalance;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			icoBalance = parseInt(getBalance(crowdsale.address));
			ownerBalance = parseInt(getBalance(accounts[0]));
			return crowdsale.withdraw();
		}).catch(function(err) {
			// contract threw exception
			if (err.toString().indexOf("invalid opcode") != -1) {
				console.log("Caught exception on calling, test is ok!");
				assert.notEqual((icoBalance + ownerBalance) * Math.pow(10, 18), parseInt(getBalance(accounts[0])) * Math.pow(10, 18), 'balance after withdrawal should equal to contract balance + previous owner balance!');
			}
			else
				assert(false, err.toString());
		});
	});
	
	it("getRaisedAmount should return 0 before anything is contributed during the ICO period", function() {	
		var crowdsale;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.getRaisedAmount.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), 0, 'should equal to zero before contributions');
		});
	});
	
	
	it("should have the correct exchange rate for the Gold1 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[3], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[3]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Gold1');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[3]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1500 * Math.pow(10, 8), 'should equal to 1500 during Gold1'); 
		});
	});
	
	// TODO: maybe remove
	it("should prevent contributing less than the ICO minimum amount during the ICO", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			
			sendEther(accounts[2], crowdsale.address, 0.009);
			return instance.balanceOf.call(accounts[2]).then(function(result) {
				assert.equal(result.valueOf(), 0, 'should equal to zero for less than minimum');
				return PrideTokenForCrowdsale.deployed();
			}).then(function(instance) {
				return instance.balanceOf.call(accounts[2]);
			}).then(function(result) {
				assert.equal(result.valueOf(), 0, 'should equal to 0 for less than minimum'); 
			});
		});
	});
	
	it("should prevent to setICOMinAmountRaised in ICO period", function() {	
		var crowdsale;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.setICOMinAmountRaised(30000 * Math.pow(10, 18));
		}).catch(function(err) {
			// contract threw exception
			if (err.toString().indexOf("invalid opcode") != -1) {
				console.log("Caught exception on calling, test is ok!");
				return crowdsale.ICOMinAmountRaised.call().then(function(result) {
					assert.notEqual(result.valueOf(), 30000 * Math.pow(10, 18), 'should equal to the new value');
				});
			}
			else
				assert(false, err.toString());
		});
	});
	
	it("should enter in Gold 2 stage after Gold 1", function() {	
		var crowdsale;
		var gold1Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.ICOStartAfterDays.call();
		}).then(function(result) {
			gold1Start = result.valueOf();
			return crowdsale.Gold1PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(gold1Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Gold2, 'should equal to Gold2 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Gold2 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[4], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[4]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Gold2');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[4]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1400 * Math.pow(10, 8), 'should equal to 1400 during Gold2'); 
		});
	});
	
	it("should enter in Gold 3 stage after Gold 2", function() {	
		var crowdsale;
		var gold2Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Gold1PhaseEnd.call();
		}).then(function(result) {
			gold2Start = result.valueOf();
			return crowdsale.Gold2PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(gold2Start) ));// + daysecs);
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Gold3, 'should equal to Gold3 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Gold3 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[5], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[5]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Gold3');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[5]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1300 * Math.pow(10, 8), 'should equal to 1300 during Gold3'); 
		});
	});
	
	it("should enter in Silver 1 stage after Gold 3", function() {	
		var crowdsale;
		var gold3Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Gold2PhaseEnd.call();
		}).then(function(result) {
			gold3Start = result.valueOf();
			return crowdsale.Gold3PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(gold3Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Silver1, 'should equal to Silver1 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Silver1 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[6], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[6]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Silver1');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[6]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1250 * Math.pow(10, 8), 'should equal to 1250 during Silver1'); 
		});
	});
	
	it("should enter in Silver 2 stage after Silver 1", function() {	
		var crowdsale;
		var silver1Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Gold3PhaseEnd.call();
		}).then(function(result) {
			silver1Start = result.valueOf();
			return crowdsale.Silver1PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(silver1Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Silver2, 'should equal to Silver2 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Silver2 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[7], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[7]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Silver2');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[7]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1200 * Math.pow(10, 8), 'should equal to 1200 during Silver2'); 
		});
	});
	
	it("should enter in Silver 3 stage after Silver 2", function() {	
		var crowdsale;
		var silver2Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Silver1PhaseEnd.call();
		}).then(function(result) {
			silver2Start = result.valueOf();
			return crowdsale.Silver2PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(silver2Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Silver3, 'should equal to Silver3 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Silver3 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[8], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[8]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Silver3');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[8]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1150 * Math.pow(10, 8), 'should equal to 1150 during Silver3'); 
		});
	});
	
	it("should enter in Bronze 1 stage after Silver 3", function() {	
		var crowdsale;
		var silver3Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Silver2PhaseEnd.call();
		}).then(function(result) {
			silver3Start = result.valueOf();
			return crowdsale.Silver3PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(silver3Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Bronze1, 'should equal to Bronze1 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Bronze 1 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[9], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[9]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Bronze 1');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[9]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1100 * Math.pow(10, 8), 'should equal to 1100 during Bronze 1'); 
		});
	});
	
	it("should enter in Bronze 2 stage after Bronze 1", function() {	
		var crowdsale;
		var bronze1Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Silver3PhaseEnd.call();
		}).then(function(result) {
			bronze1Start = result.valueOf();
			return crowdsale.Bronze1PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(bronze1Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Bronze2, 'should equal to Bronze2 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Bronze 2 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[10], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[10]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Bronze 2');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[10]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1050 * Math.pow(10, 8), 'should equal to 1050 during Bronze 2'); 
		});
	});
	
	it("should enter in Bronze 3 stage after Bronze 2", function() {	
		var crowdsale;
		var bronze2Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Bronze1PhaseEnd.call();
		}).then(function(result) {
			bronze2Start = result.valueOf();
			return crowdsale.Bronze2PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(bronze2Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Bronze3, 'should equal to Bronze3 Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), true, 'method should return true');
		});
	});
	
	it("should have the correct exchange rate for the Bronze 3 ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[11], crowdsale.address, 1);
			ICOContributions += 1;
			return crowdsale.balanceOf.call(accounts[11]);
		}).then(function(result) {
			assert.equal(result.valueOf(), Math.pow(10, 18), 'should equal to 1 during Bronze 3');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[11]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 1000 * Math.pow(10, 8), 'should equal to 1000 during Bronze 3'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 1 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[18], crowdsale.address, 25);
			ICOContributions += 25;
			return crowdsale.balanceOf.call(accounts[18]);
		}).then(function(result) {
			assert.equal(parseInt(result.valueOf()), 25 * Math.pow(10, 18), 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[18]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 5000000000000, 'should equal to 5000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 2 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[19], crowdsale.address, 50);
			ICOContributions += 50;
			return crowdsale.balanceOf.call(accounts[19]);
		}).then(function(result) {
			assert.equal(parseInt(result.valueOf()), 50 * Math.pow(10, 18), 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[19]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 25000000000000, 'should equal to 25000000000000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 3 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[20], crowdsale.address, 100);
			ICOContributions += 100;
			return crowdsale.balanceOf.call(accounts[20]);
		}).then(function(result) {
			assert.equal(parseInt(result.valueOf()), 100 * Math.pow(10, 18), 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[20]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 120000000000000, 'should equal to 120000000000000 during preICO'); 
		});
	});
	
	it("should have the correct exchange rate for Tier 4 large investor bonus in the pre-ICO stage", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[21], crowdsale.address, 200);
			ICOContributions += 200;
			return crowdsale.balanceOf.call(accounts[21]);
		}).then(function(result) {
			assert.equal(parseInt(result.valueOf()), 200 * Math.pow(10, 18), 'should equal to zero during preICO');
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.balanceOf.call(accounts[21]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 500000000000000, 'should equal to 500000000000000 during preICO'); 
		});
	});
	
	// Test subset 2 [ICO meets minimum target]
	/*it("should enter in Ended if maximum amount was raised", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			sendEther(accounts[9], crowdsale.address, 80000);
			sendEther(accounts[10], crowdsale.address, 80000);
			sendEther(accounts[11], crowdsale.address, 80000);
			sendEther(accounts[12], crowdsale.address, 80000);
			sendEther(accounts[13], crowdsale.address, 80000);
			ICOContributions += 400000;
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Ended, 'should equal to Ended Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), false, 'method should return false (not in ICO)');
		});
	}); */
	
	
	it("should enter in Ended stage after Bronze 3", function() {	
		var crowdsale;
		var bronze3Start;

		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.Bronze2PhaseEnd.call();
		}).then(function(result) {
			bronze3Start = result.valueOf();
			return crowdsale.Bronze3PhaseEnd.call(); 
		}).then(function(result) {
			setCurrentEthTimestamp(getCurrentEthTimestamp() + (parseInt(result.valueOf()) - parseInt(bronze3Start) ));
			return crowdsale.getStage.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), Stage.Ended, 'should equal to Ended Stage');
			return crowdsale.isICOInProgress.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), false, 'method should return false (not in ICO)');
		});
	});
	
	it("should prevent contributing after the ICO is over", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			try
			{
				sendEther(accounts[1], crowdsale.address, 1);
			} catch(err) {
				// contract threw exception
				if (err.toString().indexOf("invalid opcode") != -1) {
					console.log("Caught exception on calling, test is ok!");
					return instance.balanceOf.call(accounts[1]).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal to zero after ICO');
						return PrideTokenForCrowdsale.deployed();
					}).then(function(instance) {
						return instance.balanceOf.call(accounts[1]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 25000400000000000, 'should equal to 25000200000000000'); 
					});
				}
				else
					assert(false, err.toString());
			}
		});
	});
	
	// Test subset 1 [ICO does not meet minimum target] 
	it("should not allow withdrawal of funds if the minimum target for the ICO was not met", function() {	
		var crowdsale;
		var icoBalance = 0;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			icoBalance = parseInt(getBalance(crowdsale.address));
			ownerBalance = parseInt(getBalance(accounts[0]));
			return crowdsale.withdraw();
		}).then(function() {
			var newAccountBalance = parseInt(getBalance(accounts[0]));
			assert.notEqual((icoBalance + ownerBalance) * Math.pow(10, 18), newAccountBalance * Math.pow(10, 18), 'balance after withdrawal should equal to contract balance + previous owner balance!');
		});
	});
	
	it("should allow refunds if the ICO target was not met", function() {	
		var crowdsale;
		var contributed = 0;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			ownerBalance = parseInt(getBalance(accounts[6]));
			return crowdsale.balanceOf.call(accounts[6]);
		}).then(function(result) {
			contributed = parseInt(web3.fromWei(result.valueOf()));
			return crowdsale.refund({from: accounts[6]});
		}).then(function() {
			var accBalance = parseInt(getBalance(accounts[6]));
			assert.equal((contributed + ownerBalance) * Math.pow(10, 18), parseInt(accBalance) * Math.pow(10, 18), 'balance after withdrawal should equal to amount contributed + previous owner balance!');
			//return crowdsale.refund({from: accounts[6]}); // should not allow it the second time
		});
	}); 
	
	// END Test subset 1
	
	// Test subset 2 [ICO meets minimum target]
	/*
	it("should prevent refunds if the ICO target was met", function() {	
		var crowdsale;
		var contributed = 0;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			ownerBalance = parseInt(getBalance(accounts[8]));
			return crowdsale.balanceOf.call(accounts[8]);
		}).then(function(result) {
			contributed = parseInt(result.valueOf());
			return crowdsale.refund({from: accounts[8]});
		}).catch(function(err){
			if (err.toString().indexOf("invalid opcode") != -1) {
				console.log("Caught exception on calling, test is ok!");
				assert.notEqual((contributed + ownerBalance) * Math.pow(10, 18), parseInt(getBalance(accounts[8])) * Math.pow(10, 18), 'balance after withdrawal should not equal to amount contributed + previous owner balance!');
			}
			else
				assert(false, err.toString());
		});
	});
	
	it("should allow withdrawal of funds after the ICO has ended", function() {	
		var crowdsale;
		var icoBalance = 0;
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			icoBalance = parseInt(getBalance(crowdsale.address));
			ownerBalance = parseInt(getBalance(accounts[0]));
			return crowdsale.withdraw();
		}).then(function() {
			assert.equal((icoBalance + ownerBalance) * Math.pow(10, 18), parseInt(getBalance(accounts[0])) * Math.pow(10, 18), 'balance after refund should equal to contract balance + previous owner balance!');
		});
	}); */
	
	// End Test subset 2
	
	it("getRaisedAmount should return the correct amount raised in the ICO", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.getRaisedAmount.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), ICOContributions * Math.pow(10, 18), 'should equal to the contract balance');
		});
	});
	
	it("should not allow a total percentage higher than 100 for the promoters", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.addPromoter(accounts[22], 66);
		}).then(function(result) {
			return crowdsale.getPromoterPercentage.call(accounts[22]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 66, 'should equal 66!');
			return crowdsale.addPromoter(accounts[23], 15);
		}).then(function(result) {
			return crowdsale.getPromoterPercentage.call(accounts[23]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 15, 'should equal 15!');
			return crowdsale.addPromoter(accounts[24], 33);
		}).then(function(result) {
			return crowdsale.getPromoterPercentage.call(accounts[24]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 33, 'should equal 33!');
			return crowdsale.distributeTokenToPromoters();
		}).catch(function(err) {
			if (err.toString().indexOf("invalid opcode") != -1) {
				console.log("Caught exception on calling, test is ok!");
				return PrideTokenForCrowdsale.deployed().then(function(instance) {
					return instance.balanceOf.call(accounts[22]).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal 0!');
						return instance.balanceOf.call(accounts[23]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal 0!');
						return instance.balanceOf.call(accounts[24]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal 0!');
					});
				});
				
			}
			else
				assert(false, err.toString());
		});
	});
	
	it("should distribute tokens correctly for the promoters", function() {	
		var crowdsale;
		var token;
		var publicSupply;
		var totalSupply = 0;
		var promoterSupply = 0;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
		
			return crowdsale.setPromoterPercentage(accounts[24], 19);
		}).then(function(result) {
			return crowdsale.getPromoterPercentage.call(accounts[24]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 19, 'should equal 19!');
		}).then(function(result) {
			return crowdsale.publicSupply.call();
		}).then(function(result) {
			publicSupply = result.valueOf();
			return crowdsale.distributeTokenToPromoters();
		}).then(function(result) {
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			token = instance;
			return token.balanceOf.call(accounts[22]);
		}).then(function(result) {
			totalSupply = (publicSupply * 100) / 75;
			promoterSupply = 0.05 * totalSupply;
			
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 8)), Math.round((0.66 * promoterSupply) / Math.pow(10, 8)), 'should equal to 66 percent of the promoter supply!');
			return token.balanceOf.call(accounts[23]);
		}).then(function(result) {
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 7)), Math.round((0.15 * promoterSupply) / Math.pow(10, 7)), 'should equal to 15 percent of the promoter supply!');
			return token.balanceOf.call(accounts[24]);
		}).then(function(result) {
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 8)), Math.round((0.19 * promoterSupply) / Math.pow(10, 8)), 'should equal to 19 percent of the promoter supply!');
		});
	});
	
	it("should not allow a total percentage higher than 100 for bug hunters", function() {	
		var crowdsale;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
			return crowdsale.addBugHunter(accounts[25], 65);
		}).then(function(result) {
			return crowdsale.getBugHunterPercentage.call(accounts[25]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 65, 'should equal 65!');
			return crowdsale.addBugHunter(accounts[26], 45);
		}).then(function(result) {
			return crowdsale.getBugHunterPercentage.call(accounts[26]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 45, 'should equal 45!');
			return crowdsale.distributeTokenToBugHunters();
		}).catch(function(err) {
			if (err.toString().indexOf("invalid opcode") != -1) {
				console.log("Caught exception on calling, test is ok!");
				return PrideTokenForCrowdsale.deployed().then(function(instance) {
					return instance.balanceOf.call(accounts[25]).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal 0!');
						return instance.balanceOf.call(accounts[26]);
					}).then(function(result) {
						assert.equal(result.valueOf(), 0, 'should equal 0!');
					});
				});
				
			}
			else
				assert(false, err.toString());
		});
	});
	
	it("should distribute tokens correctly for bug hunters", function() {	
		var crowdsale;
		var token;
		var publicSupply;
		var totalSupply = 0;
		var bugHunterSupply = 0;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
		
			return crowdsale.setBugHunterPercentage(accounts[26], 35);
		}).then(function(result) {
			return crowdsale.getBugHunterPercentage.call(accounts[26]);
		}).then(function(result) {
			assert.equal(result.valueOf(), 35, 'should equal 35!');
		}).then(function(result) {
			return crowdsale.publicSupply.call();
		}).then(function(result) {
			publicSupply = result.valueOf();
			return crowdsale.distributeTokenToBugHunters();
		}).then(function(result) {
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			token = instance;
			return token.balanceOf.call(accounts[25]);
		}).then(function(result) {
			totalSupply = (publicSupply * 100) / 75;
			bugHunterSupply = 0.05 * totalSupply;
			
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 8)), Math.round((0.65 * bugHunterSupply) / Math.pow(10, 8)), 'should equal to 65 percent of the bug hunter supply!');
			return token.balanceOf.call(accounts[26]);
		}).then(function(result) {
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 8)), Math.round((0.35 * bugHunterSupply) / Math.pow(10, 8)), 'should equal to 35 percent of the bug hunter supply!');
		});
	});
	
	/*it('should transfer token contract ownership back to the original owner', function() {
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			return instance.transferTokenOwnership()
		}).then(function(result) {
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			return instance.owner.call();
		}).then(function(result) {
			assert.equal(result.valueOf(), accounts[0], 'should have correct address!');
		});
	}); */
	
	/*
	it("should distribute tokens correctly for dev team", function() {	
		var crowdsale;
		var token;
		var publicSupply;
		var totalSupply = 0;
		var devTeamSupply = 0;
		
		return PrideCoinCrowdsale.deployed().then(function(instance) {
			crowdsale = instance;
		
			return crowdsale.addDevTeamMember(accounts[28]);
		}).then(function(result) {
			return crowdsale.addDevTeamMember(accounts[29]);
		}).then(function(result) {
			return crowdsale.distributeTokenToDevTeam();
		}).then(function(result) {
			return crowdsale.publicSupply.call();
		}).then(function(result) {
			publicSupply = result.valueOf();
			return PrideTokenForCrowdsale.deployed();
		}).then(function(instance) {
			token = instance;
			return token.balanceOf.call(accounts[28]);
		}).then(function(result) {
			totalSupply = (publicSupply * 100) / 75;
			devTeamSupply = 0.15 * totalSupply;
			
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 8)), Math.round((devTeamSupply / 2) / Math.pow(10, 8)), 'should equal to half of the dev team supply!');
			return token.balanceOf.call(accounts[29]);
		}).then(function(result) {
			assert.equal(Math.round(parseInt(result.valueOf()) / Math.pow(10, 8)), Math.round((devTeamSupply / 2) / Math.pow(10, 8)), 'should equal to half of the dev team supply!'); 
		});
	}); */
});

function getCurrentEthTimestamp() {
	return web3.eth.getBlock(web3.eth.blockNumber).timestamp;
}

function snapshot() {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_snapshot", params: [], id: 0});
}

function setCurrentEthTimestamp(timestamp) {
	var mcurrentTimestamp = getCurrentEthTimestamp();
	var mincrement = Math.floor(timestamp - mcurrentTimestamp);

	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [mincrement], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
}
 
function getBalance(address) {
	return web3.fromWei(web3.eth.getBalance(address));
}

function sendEther(fromAddress, toAddress, value) {
	web3.eth.sendTransaction({"from": fromAddress, "to": toAddress, "value": web3.toWei(value), "gas": 0x30D40});
}

function revertNetwork() {
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_revert", params: [], id: 0});
	web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
}
