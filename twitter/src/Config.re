Dotenv.config();

[@bs.val]
external etherscan_endpoint: string = "process.env.ETHERSCAN_ENDPOINT";
[@bs.val] external mnemonic_string: string = "process.env.MNEMONIC_STRING";
[@bs.val] external provider_id: string = "process.env.PROVIDER_ID";
[@bs.val] external chain_id: int = "process.env.CHAIN_ID";
[@bs.val]
external dao_contract_address: string = "process.env.DAO_CONTRACT_ADDRESS";
[@bs.val] external twitter_user_id: string = "process.env.TWITTER_USER_ID";