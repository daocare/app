## Twitter part

cd twitter
node Twitter.js
This will run the twitter server

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Firebase setup

Install:

```
npm i -g firebase-tools
```

Login:

```
firebase login
```

## Functions

Deploy a function:

```
firebase deploy --only function:someFunction
```

## UI setup

Copy `.env.example` values to the `.env` file. Then retrieve the contract address and network ID from the `./contracts/.openzeppelin` folder and get firebase credentials from https://console.firebase.google.com . (for the internal team, there is an example in the keybase folder)

## UI Deploy

> The application runs out of memory and such is first built locally and the build directory is uploaded to the hosting. Thus it requires the .env variables to be set for each deploy.

(Make sure to use the correct .env vars when deploying mainnet or kovan)

```
yarn build
```

```
firebase login
```

To deploy mainnet instance

```
firebase use default
```

To deploy to kovan instance

```
firebase use kovan
```

or

```
firebase use daocare-kovan
```

```
firebase deploy
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
