import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import cacheHandler from './cacheHandler';
import { RelayNetworkLoggerTransaction } from './RelayNetworkLoggerTransaction';
import { setupSubscription } from './setupSubscription';

const __DEV__ = process.env.NODE_ENV === 'development';

const network = Network.create(cacheHandler, setupSubscription);

const relayEnvironment = new Environment({
  network,
  store: new Store(new RecordSource(), {
    gcReleaseBufferSize: 10,
  }),
  // @TODO - improve logger
  //log: __DEV__ ? RelayNetworkLoggerTransaction : null,
});

if (__DEV__) {
  //window.relayEnvironment = relayEnvironment;
  //window.debugRelayStore = () => relayEnvironment.getStore().getSource().toJSON();
}

export default relayEnvironment;
