import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import cacheHandler from './cacheHandler';

const __DEV__ = process.env.NODE_ENV === 'development';

const network = Network.create(cacheHandler);

const relayEnvironment = new Environment({
  network,
  store: new Store(new RecordSource(), {
    gcReleaseBufferSize: 10,
  }),
  // @TODO - improve logger
  //log: __DEV__ ? RelayNetworkLoggerTransaction : null,
});

if (__DEV__) {
  global.relayEnvironment = relayEnvironment;
  global.debugRelayStore = () => relayEnvironment.getStore().getSource().toJSON();
}

export default relayEnvironment;
