## setting up credentials.

Firebase credentials are at `./src/lib/firebasefirebase_service_key.json`. See `firebase_service_key.example.json` for reference.

Twitter credentials are at `./config.js`. See `config.example.js` for examples.

Ethereum credentials are at `./src/lib/Secrets.re`. See `SecrectsExample.re`.

## Running the code:

Run the service for development (in 2 tabs):

```
yarn run re:watch
yarn run watch
```

Run the service for production (in 2 tabs):

```
yarn run re:build
yarn run start
```
