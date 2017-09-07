 pragma solidity ^0.4.11;

// (c) 2017 Pridecoin Project. The MIT License
 
contract PrideCoinCrowdsale is Ownable, Haltable, Mortal
{
    // Crowdsale details
    uint256 public preICOMaxAmount = 5000;
    uint256 public ICOMinAmountRaised = 2500;
    uint256 public ICOMaxAmountRaised = 330000;
    uint256 public minAcceptedAmountPreICO = 0.5 ether;
    uint256 public minAcceptedAmountICO = 0.01 ether;

    // Eth to Token rate
    uint256 public ratePreICO = 2000;
    uint256 public rateGold1 = 1500;
    uint256 public rateGold2 = 1400;
    uint256 public rateGold3 = 1300;
    uint256 public rateSilver1 = 1250;
    uint256 public rateSilver2 = 1200;
    uint256 public rateSilver3 = 1150;
    uint256 public rateBronze1 = 1100;
    uint256 public rateBronze2 = 1050;
    uint256 public rateBronze3 = 1000;

    uint256 public preICOStart; // the date when the PRE ICO (Diamond stage) Starts
    uint256 public preICOEnd = 15 days;
    uint256 public ICOStartAfterDays = 22 days; // wait 7 days until the ICO (adjustable)
    uint256 public Gold1PhaseEnd = 27 days;
    uint256 public Gold2PhaseEnd = 32 days;
    uint256 public Gold3PhaseEnd = 37 days;
    uint256 public Silver1PhaseEnd = 42 days;
    uint256 public Silver2PhaseEnd = 47 days;
    uint256 public Silver3PhaseEnd = 52 days;
    uint256 public Bronze1PhaseEnd = 57 days;
    uint256 public Bronze2PhaseEnd = 62 days;
    uint256 public Bronze3PhaseEnd = 67 days;

    enum Stage {
        Waiting,
        PreICO,
        Gold1,
        Gold2,
        Gold3,
        Silver1,
        Silver2,
        Silver3,
        Bronze1,
        Bronze2,
        Bronze3,
        Ended
    }

    // Crowdsale state variables
    uint256 public raisedPreICO;
    uint256 public raisedICO;

    // token contract interface
    Token public tokenSold;

    // Invested balances
    mapping (address => uint256) balances;
    address[] bugHunters;
    address[] promoters;
    address[] devTeam;


    /*
     * Require that the current stage is equal to parameter
     * 
     * @param _stage expected stage to test for
     */
    modifier atStage(Stage _stage) {
        require(getStage() == _stage);
        _;
    }

    /*
     * Returns the current stage of the crowdsale contract
     * @return The current contract Stage
     */
    function getStage() public constant returns (Stage) {
    
        if (now < preICOStart) return Stage.Waiting;
        
        var interICOWaitingPeriodStart = preICOStart + preICOEnd;
        var Gold1Start = preICOStart + ICOStartAfterDays;
        var Gold2Start = preICOStart + Gold1PhaseEnd;
        var Gold3Start = preICOStart + Gold2PhaseEnd;
        var Silver1Start = preICOStart + Gold3PhaseEnd;
        var Silver2Start = preICOStart + Silver1PhaseEnd;
        var Silver3Start = preICOStart + Silver2PhaseEnd;
        var Bronze1Start = preICOStart + Silver3PhaseEnd;
        var Bronze2Start = preICOStart + Bronze1PhaseEnd;
        var Bronze3Start = preICOStart + Bronze2PhaseEnd;
        var Bronze3End = preICOStart + Bronze3PhaseEnd;
        
        if (now >= preICOStart && now < interICOWaitingPeriodStart && raisedPreICO < preICOMaxAmount) return Stage.PreICO;
        if ((now >= interICOWaitingPeriodStart && now < Gold1Start) || raisedPreICO >= preICOMaxAmount) return Stage.Waiting; // waiting for ICO start
        if (raisedICO < ICOMaxAmountRaised)
        {
            if (now >= Gold1Start && now < Gold2Start) return Stage.Gold1;
            if (now >= Gold2Start && now < Gold3Start) return Stage.Gold2;
            if (now >= Gold3Start && now < Silver1Start) return Stage.Gold3;
            if (now >= Silver1Start && now < Silver2Start) return Stage.Silver1;
            if (now >= Silver2Start && now < Silver3Start) return Stage.Silver2;
            if (now >= Silver3Start && now < Bronze1Start) return Stage.Silver3;
            if (now >= Bronze1Start && now < Bronze2Start) return Stage.Bronze1;
            if (now >= Bronze2Start && now < Bronze3Start) return Stage.Bronze2;
            if (now >= Bronze3Start && now < Bronze3End) return Stage.Bronze3;
        }
        if ((now >= Bronze3End) || raisedICO >= ICOMaxAmountRaised) return Stage.Ended;
    }
    

    /*
     * Get balance of `_investor` 
     * 
     * @param _investor The address from which the balance will be retrieved
     * @return The balance
     */
    function balanceOf(address _investor) constant returns (uint256 balance) {
        return balances[_investor];
    }
    
    
    /*
     * Add a bug hunter's address to the list
     * 
     * @param _hunter The address of the bug hunter (used for token distribution)
     */
    function addBugHunter(address _hunter) onlyOwner {
        bugHunters.push(_hunter);
    }
    
    /*
     * Add a dev team member's address to the list
     * 
     * @param _promoter The promoter's address (used for token distribution)
     */
    function addPromoter(address _promoter) onlyOwner {
        promoters.push(_promoter);
    }
    
    /*
     * Add a dev team member's address to the list
     * 
     * @param _member The address of the team member (used for token distribution)
     */
    function addDevTeamMember(address _member) onlyOwner {
        devTeam.push(_member);
    }
    

    /*
     * Construct
     *
     * @param _tokenAddress The address of the PrideCoin token contact
     * @param _preICOStart The unix timestamp when the preICO starts
     * @param _ICOStartAfterDays The number of days (in seconds) after which the ICO starts
     */
    function PrideCoinCrowdsale(address _tokenAddress, uint256 _preICOStart, uint256 _ICOStartAfterDays) {
        tokenSold = Token(_tokenAddress);
        preICOStart = _preICOStart;
        ICOStartAfterDays = _ICOStartAfterDays;
    }

    /*
     * Set the start of the preICO
     *
     *@param _preICOStart The unix timestamp when the preICO starts
     */
     function SetPreICOStart(uint256 _preICOStart) onlyOwner{
        preICOStart = _preICOStart;
     }
     
     /*
     * Set the start of the preICO
     *
     *@param _ICOStartAfterDays The days (in seconds) after which the ICO starts
     */
     function SetICOStart(uint256 _ICOStartAfterDays) onlyOwner{
        ICOStartAfterDays = _ICOStartAfterDays;
     }
     
    
    /*
     * Convert `_wei` to an amount in Token using 
     * the current rate
     *
     * @param _wei amount of wei to convert
     * @return The amount in Token
     */
    function toToken(uint256 _wei) constant returns (uint256 amount) {
        var stage = getStage();
        require (stage != Stage.Waiting && stage != Stage.Ended);
    
        uint256 rate = 0;
        var eth = _wei / 1 ether;

        if (stage == Stage.PreICO) {
            rate = ratePreICO;
        } else if (stage == Stage.Gold1) {
           rate = rateGold1;
        } else if (stage == Stage.Gold2) {
            rate = rateGold2;
        } else if (stage == Stage.Gold3) {
            rate = rateGold3;
        } else if (stage == Stage.Silver1) {
            rate = rateSilver1;
        } else if (stage == Stage.Silver2) {
            rate = rateSilver2;
        } else if (stage == Stage.Silver3) {
            rate = rateSilver3;
        } else if (stage == Stage.Bronze1) {
            rate = rateBronze1;
        } else if (stage == Stage.Bronze2) {
            rate = rateBronze2;
        } else if (stage == Stage.Bronze3) {
            rate = rateBronze3;
        }
        
        if (eth >= 25 && eth < 50) // stage 1 multiplier
            rate = rate * 2;
        else if (eth >= 50 && eth < 100)
            rate = rate * 5;
        else if (eth >= 100 && eth < 200)
            rate = rate * 12;
        else if (eth >= 200)
            rate = rate * 25;
        
        return _wei * rate / 1 ether; 
    }


    /*
     * Transfer the money stored in the contract to the owner
     */
    function withdraw() onlyOwner stopInEmergency {
        // can widthdraw during preICO and before ICO, but not during the ICO itself
        require(!isICOInProgress() && raisedICO >= ICOMinAmountRaised);

        require(tokenSold.unlock());
        require(owner.send(this.balance));
        
        // distribute token to the elligible groups
        uint256 publicSupply = tokenSold.totalSupply(); // 75% for the public
        uint256 wholeSupply = (publicSupply * 100) / 75;
        uint256 bugHunterSupply = 5 * wholeSupply / 10 ** 2;
        uint256 promoterSupply = 5 * wholeSupply / 10 ** 2;
        uint256 devTeamSupplly = 15 * wholeSupply / 10 ** 2;
        
        if (bugHunters.length > 0)
        {
            var bugHunterTokenSlice = bugHunterSupply / bugHunters.length;
            for (uint256 i = 0; i < bugHunters.length; i++) {
                tokenSold.issue(bugHunters[i], bugHunterTokenSlice);
            }
        }
        
        
        if (promoters.length > 0)
        {
            var promoterTokenSlice = promoterSupply / promoters.length;
            for (uint256 j = 0; j < promoters.length; j++) {
                tokenSold.issue(promoters[j], promoterTokenSlice);
            }
        }
        
        if (devTeam.length > 0)
        {
            var devTeamTokenSlice = devTeamSupplly / devTeam.length;
            for (uint256 k = 0; k < devTeam.length; k++) {
                tokenSold.issue(devTeam[k], devTeamTokenSlice);
            }
        }
    }

    /*
     * Refund in the case of an unsuccessful crowdsale. The 
     * crowdsale is considered unsuccessful if minAmount was 
     * not raised before end
     */
    function refund() atStage(Stage.Ended) stopInEmergency {

        // Only allow refunds if we haven't raised ICOMinAmountRaised
        require (raisedICO < ICOMinAmountRaised);

        uint256 receivedAmount = balances[msg.sender];
        balances[msg.sender] = 0;

        if (receivedAmount > 0 && !msg.sender.send(receivedAmount)) {
            balances[msg.sender] = receivedAmount;
        }
    }

    /*
     * Returns true if the ICO is in progress
     */
    function isICOInProgress() constant returns (bool) {
        var stage = getStage();
        return stage != Stage.Waiting && stage != Stage.PreICO && stage != Stage.Ended;
    }
    
    /*
     * Receives Eth and issue tokens to the sender
     */
    function () payable stopInEmergency{
        var stage = getStage();
        //require(stage != Stage.Ended); we need to discuss this // don't allow any donations after the ICO is over
        
        // Enforce min amount
        if ((stage == Stage.PreICO && msg.value >= minAcceptedAmountPreICO) || (isICOInProgress() && msg.value >= minAcceptedAmountICO))
        {

            uint256 received = msg.value;        
            uint256 valueInToken = toToken(msg.value);

            require (tokenSold.issue(msg.sender, valueInToken));

            // Add the amount of ethereum donated to a user balance for a possible future refund
            if (isICOInProgress()) {
                balances[msg.sender] += received; 
                raisedICO += received;
            }
            else if (stage == Stage.PreICO)
                raisedPreICO += received;
        }
    }
}
