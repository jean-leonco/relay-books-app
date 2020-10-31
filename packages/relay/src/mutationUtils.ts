/* eslint-disable no-console */
import { isArray, isObject } from 'lodash/fp';
import { ConnectionHandler, RecordProxy, RecordSourceSelectorProxy } from 'relay-runtime';

import { JSObject } from '@booksapp/types';

import { isScalar } from './utils';

interface ListRecordRemoveUpdaterOptions {
  parentId: string;
  itemId: string;
  parentFieldName: string;
  store: RecordSourceSelectorProxy;
}

interface ListRecordAddUpdaterOptions {
  parentId: string;
  item: JSObject;
  type: string;
  parentFieldName: string;
  store: RecordSourceSelectorProxy;
}

interface OptimisticConnectionUpdaterOptions {
  parentId: string;
  store: RecordSourceSelectorProxy;
  connectionName: string;
  item: JSObject;
  customNode: any | null;
  itemType: string;
}

interface ConnectionDeleteEdgeUpdaterOptions {
  parentId: string;
  connectionName: string;
  nodeId: string;
  store: RecordSourceSelectorProxy;
  filters?: JSObject;
}

interface CopyObjScalarsToProxyOptions {
  object: JSObject;
  proxy: RecordProxy;
}

export function listRecordRemoveUpdater({ parentId, itemId, parentFieldName, store }: ListRecordRemoveUpdaterOptions) {
  const parentProxy = store.get(parentId);
  const items = parentProxy.getLinkedRecords(parentFieldName);

  parentProxy.setLinkedRecords(
    items.filter((record) => record._dataID !== itemId),
    parentFieldName,
  );
}

export function listRecordAddUpdater({ parentId, item, type, parentFieldName, store }: ListRecordAddUpdaterOptions) {
  const node = store.create(item.id, type);

  Object.keys(item).forEach((key) => {
    node.setValue(item[key], key);
  });

  const parentProxy = store.get(parentId);
  const items = parentProxy.getLinkedRecords(parentFieldName);

  parentProxy.setLinkedRecords([...items, node], parentFieldName);
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

export function optimisticConnectionUpdater({
  parentId,
  store,
  connectionName,
  item,
  customNode,
  itemType,
}: OptimisticConnectionUpdaterOptions) {
  const node = customNode || store.create(item.id, itemType);

  !customNode &&
    Object.keys(item).forEach((key) => {
      if (isScalar(item[key])) {
        node.setValue(item[key], key);
      } else {
        node.setLinkedRecord(item[key], key);
      }
    });

  const edge = store.create('client:newEdge:' + node._dataID.match(/[^:]+$/)[0], `${itemType}Edge`);
  edge.setLinkedRecord(node, 'node');

  connectionUpdater({ store, parentId, connectionName, edge });
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

export function connectionTransferEdgeUpdater({
  store,
  connectionName,
  newEdge,
  sourceParentId,
  destinationParentId,
  deletedId,
  before,
  filters,
}) {
  if (newEdge) {
    // get source and destination connection
    const sourceParentProxy = store.get(sourceParentId);
    const sourceConnection = ConnectionHandler.getConnection(sourceParentProxy, connectionName, filters);

    const destinationParentProxy = store.get(destinationParentId);
    const destinationConnection = ConnectionHandler.getConnection(destinationParentProxy, connectionName, filters);

    // if source nor destination connection were found, connectionTransfer wont complete
    if (!sourceConnection || !destinationConnection) {
      // eslint-disable-next-line no-console
      console.log('maybe this connection is not in relay store yet:', connectionName);
      return;
    }

    // new edge cursor stuffs
    const newEndCursorOffset = destinationConnection.getValue('endCursorOffset');
    destinationConnection.setValue(newEndCursorOffset + 1, 'endCursorOffset');

    const newCount = destinationConnection.getValue('count');
    destinationConnection.setValue(newCount + 1, 'count');

    if (before) {
      ConnectionHandler.insertEdgeBefore(destinationConnection, newEdge);
    } else {
      ConnectionHandler.insertEdgeAfter(destinationConnection, newEdge);
    }

    ConnectionHandler.deleteNode(sourceConnection, deletedId);
  }
}

export function copyObjScalarsToProxy({ object, proxy }: CopyObjScalarsToProxyOptions) {
  Object.keys(object).forEach((key) => {
    if (isObject(object[key]) || isArray(object[key])) {
      return;
    }
    proxy.setValue(object[key], key);
  });
}

interface MutationCallbackResult {
  onCompleted: (response: any) => void;
  onError: () => void;
}

interface MutationCallbackArgs {
  mutationName: string;
  successMessage?: string | ((response?: any) => string) | null;
  infoMessage?: string | ((response?: any) => string) | null;
  warningMessage?: string | ((response?: any) => string) | null;
  errorMessage: string;
  afterCompleted?: (response: any) => void;
  afterError?: () => void;
}

// @TODO - implement error alerts
export const getMutationCallbacks = ({
  mutationName,
  successMessage,
  infoMessage,
  warningMessage,
  errorMessage,
  afterCompleted,
  afterError,
}: MutationCallbackArgs): MutationCallbackResult => {
  return {
    onCompleted: (response: any) => {
      const data = response[mutationName];

      if (!data || data.error) {
        console.log(`error: ${(data && data.error) || errorMessage}`);

        afterError && afterError();
        return;
      }

      successMessage &&
        console.log(`success: ${typeof successMessage === 'function' ? successMessage(response) : successMessage}`);

      infoMessage && console.log(`info: ${typeof infoMessage === 'function' ? infoMessage(response) : infoMessage}`);

      warningMessage &&
        console.log(`warning: ${typeof warningMessage === 'function' ? warningMessage(response) : warningMessage}`);

      afterCompleted && afterCompleted(response);
    },
    onError: () => {
      console.log(`error: ${errorMessage}`);
      afterError && afterError();
    },
  };
};
