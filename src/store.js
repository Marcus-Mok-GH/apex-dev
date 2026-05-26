var require_store = __commonJS((exports, module2) => {
  var state = {
    messages: [],
    streamingContent: "",
    streamingThinking: "",
    isProcessing: false,
    showHelp: false,
    showSummary: false
  };
  var nextId = 1;
  var listeners = new Set;
  var renderer = null;
  function getSnapshot() {
    return state;
  }
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  function notify() {
    for (const fn of listeners)
      fn();
    if (renderer)
      renderer.requestRender();
  }
  function setState(partial) {
    state = { ...state, ...partial };
    notify();
  }
  function addMessage(msg) {
    const id = nextId++;
    state = { ...state, messages: [...state.messages, { id, ...msg }] };
    notify();
    return id;
  }
  function updateMessage(id, updates) {
    state = {
      ...state,
      messages: state.messages.map((m2) => m2.id === id ? { ...m2, ...updates } : m2)
    };
    notify();
  }
  function toggleMessageExpanded(id) {
    state = {
      ...state,
      messages: state.messages.map((m2) => m2.id === id ? { ...m2, expanded: !m2.expanded } : m2)
    };
    notify();
  }
  function updateStreaming(content, thinking) {
    state = { ...state, streamingContent: content || "", streamingThinking: thinking || "" };
    notify();
  }
  function clearStreaming() {
    state = { ...state, streamingContent: "", streamingThinking: "" };
    notify();
  }
  function finishStreaming(msg) {
    const id = nextId++;
    state = {
      ...state,
      streamingContent: "",
      streamingThinking: "",
      messages: [...state.messages, { id, ...msg }]
    };
    notify();
    return id;
  }
  function clearMessages() {
    state = { ...state, messages: [] };
    notify();
  }
  function setRenderer(r) {
    renderer = r;
  }
  function getRenderer() {
    return renderer;
  }
  module2.exports = {
    getSnapshot,
    subscribe,
    setState,
    addMessage,
    updateMessage,
    toggleMessageExpanded,
    updateStreaming,
    clearStreaming,
    finishStreaming,
    clearMessages,
    setRenderer,
    getRenderer
  };
});

