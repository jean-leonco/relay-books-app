/* eslint-disable no-console */
import { ConnectionHandler, RecordProxy, RecordSourceSelectorProxy } from 'relay-runtime';

interface ConnectionAddEdgeUpdaterOptions {
  store: RecordSourceSelectorProxy;
  rootID?: string;
  connectionName: string;
  edge: RecordProxy | null;
  before?: boolean;
}
export const connectionAddEdgeUpdater = ({
  store,
  rootID,
  connectionName,
  edge,
  before = true,
}: ConnectionAddEdgeUpdaterOptions) => {
  if (!edge) {
    return;
  }

  const parentProxy = rootID ? store.get(rootID) : store.getRoot();
  if (!parentProxy) {
    return;
  }

  const connection = ConnectionHandler.getConnection(parentProxy, connectionName);
  if (!connection) {
    return;
  }

  const newEndCursorOffset = connection.getValue('endCursorOffset') as number;
  connection.setValue(newEndCursorOffset + 1, 'endCursorOffset');
  const newCount = connection.getValue('count') as number;
  connection.setValue(newCount + 1, 'count');

  if (before) {
    ConnectionHandler.insertEdgeBefore(connection, edge);
  } else {
    ConnectionHandler.insertEdgeAfter(connection, edge);
  }
};

interface ConnectionDeleteEdgeUpdaterOptions {
  store: RecordSourceSelectorProxy;
  rootID?: string;
  connectionName: string;
  nodeID: string;
}
export const connectionDeleteEdgeUpdater = ({
  store,
  rootID,
  connectionName,
  nodeID,
}: ConnectionDeleteEdgeUpdaterOptions) => {
  const parentProxy = rootID ? store.get(rootID) : store.getRoot();
  if (!parentProxy) {
    return;
  }

  const connection = ConnectionHandler.getConnection(parentProxy, connectionName);
  if (!connection) {
    return;
  }

  const count = connection.getValue('count') as number;
  connection.setValue(count - 1, 'count');

  ConnectionHandler.deleteNode(connection, nodeID);
};
