/* eslint-disable no-console */
import { isArray, isObject } from 'lodash/fp';
import { ConnectionHandler, RecordSourceSelectorProxy } from 'relay-runtime';

import { JSObject } from '@booksapp/types';

interface ConnectionDeleteEdgeUpdaterOptions {
  parentId: string;
  connectionName: string;
  nodeId: string;
  store: RecordSourceSelectorProxy;
  filters?: JSObject;
}

interface ConnectionUpdaterParams {
  store: RecordSourceSelectorProxy;
  parentId: string;
  connectionName: string;
  edge: any;
  before?: boolean;
  filters?: JSObject;
  cursor?: string;
}

interface connectionTransferEdgeUpdaterParams {
  store: RecordSourceSelectorProxy;
  sourceParentId: string;
  destinationParentId: string;
  connectionName: string;
  newEdge: any;
  deletedId: string;
  before?: boolean;
  filters?: JSObject;
  cursor?: string;
}

export function connectionUpdater(args: ConnectionUpdaterParams) {
  const { store, parentId, connectionName, edge, before, filters, cursor } = args;
  if (!edge) {
    // eslint-disable-next-line no-console
    console.log('[Connection Updater] Maybe you forgot to pass an edge:', edge);
    return;
  }
  if (!parentId) {
    // eslint-disable-next-line no-console
    console.log('[Connection Updater] Maybe you forgot to pass a parentId:', parentId);
    return;
  }

  const parentProxy = store.get(parentId);
  if (!parentProxy) {
    // eslint-disable-next-line no-console
    console.log('[Connection Updater] Maybe this parentProxy is invalid:', parentProxy);
    return;
  }
  const connection = ConnectionHandler.getConnection(parentProxy, connectionName);

  if (!connection) {
    // eslint-disable-next-line no-console
    console.log('[Connection Updater] Maybe this connection is not in relay store yet:', connectionName);
    return;
  }

  const newEndCursorOffset = connection.getValue('endCursorOffset');
  connection.setValue(Number(newEndCursorOffset) + 1, 'endCursorOffset');

  const newCount = connection.getValue('count');
  connection.setValue(Number(newCount) + 1, 'count');

  if (before) {
    ConnectionHandler.insertEdgeBefore(connection, edge);
  } else {
    ConnectionHandler.insertEdgeAfter(connection, edge);
  }
}

export function connectionDeleteEdgeUpdater({
  parentId,
  connectionName,
  nodeId,
  store,
  filters,
}: ConnectionDeleteEdgeUpdaterOptions) {
  const parentProxy = parentId === null ? store.getRoot() : store.get(parentId);
  const connection = ConnectionHandler.getConnection(parentProxy, connectionName, filters);

  if (!connection) {
    // eslint-disable-next-line no-console
    console.log(
      `Connection ${connectionName} not found on ${parentId}, maybe this connection is not in relay store yet`,
    );
    return;
  }

  const count = connection.getValue('count');
  connection.setValue(count - 1, 'count');

  ConnectionHandler.deleteNode(connection, nodeId);
}
