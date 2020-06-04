# No Loss Dao Contracts

In networks section of the deployed builds (in NoLossDao_v0.json and PoolDeposits.json) are the contracts' addresses. For upgradeable DAO, can also find address in `kovan.json` (in `.openzeppelin` folder)

## Install

```bash
yarn
```

## Run the tests

```bash
yarn run test
yarn run coverage
```

## Clean Deploy

```bash
yarn run clean
yarn run deploy -- --network <network name you want to deploy to>
```

If you want to save the deployment for the UI or the twitter bot:

```bash
yarn run save-deployment
```

### Upgrade

Prepare the upgrade by running the below, instead of `yarn run clean`:

```bash
yarn run prepair-upgrade
```

**IMPORTANT! After an upgrade or a deploy, carefully examine the contents of both `deployed-builds/contracts` and `.openzeppelin` to ensure everything is in order before comiting or moving on**

### License

Code License:
MIT
