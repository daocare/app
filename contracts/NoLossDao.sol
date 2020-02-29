pragma solidity 0.5.16;

// import "./interfaces/IERC20.sol";
import "./interfaces/IAaveLendingPool.sol";
import "./interfaces/IADai.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

contract NoLossDao is Initializable {
    using SafeMath for uint256;

    mapping(address => uint256) public depositedDai;
    mapping(uint256 => address) public proposalOwner;
    mapping(uint256 => string) proposalDetails;

    uint256 public totalDepositedDai;
    uint256 public proposalAmount;

    IERC20 public daiContract;
    IAaveLendingPool public aaveLendingContract;
    IADai public adaiContract;
    address public admin;

    uint256 proposalId;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function initialize(
        address daiAddress,
        address aaveAddress,
        uint256 _proposalAmount //Likely 50DAI to start with
    ) public initializer {
        daiContract = IERC20(daiAddress);
        aaveLendingContract = IAaveLendingPool(aaveAddress);
        adaiContract = IADai(aaveAddress);
        admin = msg.sender;
        proposalAmount = _proposalAmount;
    }

    // function deposit(uint256 amount) internal {
    //     aaveLendingContract.deposit(
    //         address(daiContract),
    //         amount,
    //         0 /* We should research this referal code stuff... */
    //     );
    // }

    // I'm checking the current code compiles quick.
    // function withdraw(amount) public{
    //     require
    // }

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

        // TODO: approve the deposit below!!

        aaveLendingContract.deposit(
            address(daiContract), // This should be our address not the DAI contract?
            proposalAmount,
            0 /* We should research this referal code stuff... https://developers.aave.com/#referral-program */
        );

        totalDepositedDai = totalDepositedDai.add(proposalAmount);
        depositedDai[msg.sender] = depositedDai[msg.sender].add(proposalAmount);

        newProposalId = proposalId.add(1);

        proposalDetails[newProposalId] = proposalHash;

        proposalOwner[newProposalId] = msg.sender;
    }

    function withdrawProposal() public {
        // Check if the msg.sender actually has a proposal
        // If they do have a proposal
        // 1) set proposalDetails[newProposalId] to null?
        // 2)
    }

}
