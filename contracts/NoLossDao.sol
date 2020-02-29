pragma solidity 0.5.16;

// import "./interfaces/IERC20.sol";
import "./interfaces/IAaveLendingPool.sol";
import "./interfaces/IADai.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

contract NoLossDao is Initializable {
    using SafeMath for uint256;

    mapping(address => uint256) public depositedDai;
    mapping(uint256 => address) public proposalOwner;
    mapping(uint256 => string) public proposalDetails;
    mapping(uint256 => mapping(uint256 => uint256)) public proposalVotes;

    mapping(address => uint256) public usersNominatedProject; // Means user can only have one project.
    mapping(address => uint256) public usersProposedProject;

    uint256 public topProject;

    uint256 public totalDepositedDai;
    uint256 public proposalAmount;

    IERC20 public daiContract;
    IAaveLendingPool public aaveLendingContract;
    IADai public adaiContract;
    address public admin;

    uint256 proposalIteration;

    uint256 proposalId;
    enum PropsalState {Active, Withdrawn} // Cooldown
    mapping(uint256 => PropsalState) public state; // ProposalId to current state

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier blankUser() {
        require(depositedDai[msg.sender] == 0, "User has no stake");
        _;
    }

    modifier noProposal() {
        require(
            usersProposedProject[msg.sender] == 0,
            "User has no current proposal"
        );
        _;
    }

    function initialize(
        address daiAddress,
        address aaveAddress,
        uint256 _proposalAmount, //Likely 50DAI to start with
        address _admin
    ) public initializer {
        daiContract = IERC20(daiAddress);
        aaveLendingContract = IAaveLendingPool(aaveAddress);
        adaiContract = IADai(aaveAddress);
        admin = msg.sender;
        proposalAmount = _proposalAmount;
    }

    function deposit(uint256 amount) public blankUser noProposal {
        // actions
        if (amount >= daiContract.allowance(msg.sender, address(this))) {
            revert("unable to pull required");
        }
        daiContract.transferFrom(msg.sender, address(this), amount);
        daiContract.approve(address(aaveLendingContract), amount);
        aaveLendingContract.deposit(
            address(daiContract), // This should be our address not the DAI contract?
            amount,
            0
        );

        //setting values
        depositedDai[msg.sender] = amount;
        totalDepositedDai = totalDepositedDai.add(amount);

    }

    function withdrawFull(uint256 amount) public {
        // Participant withdraws all there DAI and exits our system :(
        // Check the user exists in our system
        // Check the amount they have deposited
        // Exchange aDAI to DAI for this amount
        // Send them back their dai
        // Remove their amount of dai from the total we have
        // IMPORTANT, remove their vote amount...
    }

    function createProposal(string memory proposalHash)
        public
        returns (uint256 newProposalId)
    {
        if (
            proposalAmount >= daiContract.allowance(msg.sender, address(this))
        ) {
            revert("unable to pull required");
        }
        daiContract.transferFrom(msg.sender, address(this), proposalAmount);

        daiContract.approve(address(aaveLendingContract), proposalAmount);

        aaveLendingContract.deposit(
            address(daiContract), // This should be our address not the DAI contract?
            proposalAmount,
            0 /* We should research this referal code stuff... https://developers.aave.com/#referral-program */
        );

        totalDepositedDai = totalDepositedDai.add(proposalAmount);
        depositedDai[msg.sender] = depositedDai[msg.sender].add(proposalAmount);

        // So the first proposal will have an ID of 1
        newProposalId = proposalId.add(1);

        proposalDetails[newProposalId] = proposalHash;

        proposalOwner[newProposalId] = msg.sender;
    }

    function withdrawProposal() public {
        // Check if the msg.sender actually has a proposal
        // msg.sender can only have one proposal
        // If they revoke this porposal it becomes null
        // 1) set proposalDetails[newProposalId] to null?
        // 2) Send deposit amount of 'proposalAmount' back to msg.sender
        // 3) Make all the votes cast for this proposal null and void?
        // 4) proposal should have states, active, withdrawn, cooldown etc...
    }

    function vote(uint256 proposalIdToVoteFor) public {
        // Check the msg.sender has stake in the system
        // Check the msg.sender does not have an active or cooldown proposal
        // Check if the msg.sender has voted before (If so we want them to only vote once a week)
        // This is since, we will use the interest to pay gas fees for voting on their behalf?
        // Check if the msg.sender has given approval rights to our steward to vote on their behalf
        // Add the amount of votes to the respective ProposalID (default is 0 on deposit)

        uint256 currentProposal = usersNominatedProject[msg.sender];
        if (currentProposal != 0) {
            proposalVotes[proposalIteration][currentProposal] = proposalVotes[proposalIteration][currentProposal]
                .sub(depositedDai[msg.sender]);
        }

        proposalVotes[proposalIteration][proposalIdToVoteFor] = proposalVotes[proposalIteration][proposalIdToVoteFor]
            .add(depositedDai[msg.sender]);

        usersNominatedProject[msg.sender] = proposalIdToVoteFor;

        uint256 topProjectVotes = proposalVotes[proposalIteration][topProject];

        // TODO:: if they are equal there is a problem (we must handle this!!)
        if (proposalVotes[proposalIteration][proposalId] > topProjectVotes) {
            topProject = proposalId;
        }
    }

    function distributeFunds() public {
        // On a *whatever we decide basis* the funds are distributed to the winning project
        // E.g. every 2 weeks, the project with the most votes gets the generated interest.

        proposalIteration = proposalIteration.add(1);
        topProject = 0;
    }

    function delegateVoting() public {
        //TODO: MUCH LATER
        // Allow the steward (US) to vote on their behalf through scraping twitter
    }
}
