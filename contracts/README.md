# No Loss Dao Contracts

In networks section of deployed builds (in NoLossDao_v0.json and PoolDeposits.json) are the contracts addresses. For upgradeable DAO, can also find address in kovan.json

### install

```bash
yarn
```

### Run the tests:

```bash
yarn run test
```

```bash
yarn run coverage
```

### Clean Deploy

```bash
yarn run clean
```

```bash
yarn run deploy -- --network <network name you want to deploy to>
```

If you want to save the deployment for the UI or the twitter bot:

```bash
yarn run save-deployment
```

### Upgrade

Prepair the upgrade by running instead of `yarn run clean`:

```bash
yarn run prepair-upgrade
```

#### Important After an upgrade or a deploy carefully examine the contents of both `deployed-builds/contracts` and `.openzeppelin` to make sure everything is in order before comiting or moving on.

### License

Code License:
MIT
