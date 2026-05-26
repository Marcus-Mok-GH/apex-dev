var import_react11 = __toESM(require_react(), 1);
var import_store = __toESM(require_store(), 1);
function useStore() {
  return import_react11.useSyncExternalStore(import_store.subscribe, import_store.getSnapshot);
}

