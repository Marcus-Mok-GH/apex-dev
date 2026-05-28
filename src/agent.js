var require_agent = __commonJS((exports, module2) => {
  var {
    currentModels,
    MAX_TOOL_ITERATIONS,
    nvidiaClient,
    session,
    sleep
  } = require_config();
  var { buildSystemPrompt } = require_prompt();
  var { toolDefs } = require_tools();
  var { executeTool } = require_toolExecutors();
  var { toolDetailStr } = require_utils3();
  var store = require_store();
  var {
    parseThinkBlocks,
    findThinkClose,
    stripStrayCloseTag,
    splitAtPartialTag
  } = require_thinking();
  var isProcessing = false;
  function getIsProcessing() {
    return isProcessing;
  }
  async function handleUserInput(userInput) {
    isProcessing = true;
    store.setState({ isProcessing: true });
    session.turnCount++;
    store.addMessage({ role: "user", content: userInput });
    session.conversationHistory.push({ role: "user", content: userInput });
    let turnTokens = 0;
    try {
      store.addMessage({ role: "divider" });
      const systemPrompt = buildSystemPrompt();
      let messages = [
        { role: "system", content: systemPrompt },
        ...session.conversationHistory
      ];
      let iterations = 0;
      while (iterations < MAX_TOOL_ITERATIONS) {
        iterations++;
        let stream;
        const maxRetries = 3;
        for (let attempt = 0;attempt <= maxRetries; attempt++) {
          try {
            stream = await nvidiaClient.chat.completions.create({
              model: currentModels.NVIDIA_MODEL,
              messages: messages.map((m2) => {
                const clean = { role: m2.role, content: m2.content };
                if (m2.tool_calls)
                  clean.tool_calls = m2.tool_calls.map((tc) => ({
                    id: tc.id,
                    type: "function",
                    function: { name: tc.function.name, arguments: tc.function.arguments }
                  }));
                if (m2.tool_call_id)
                  clean.tool_call_id = m2.tool_call_id;
                if (m2.role === "assistant" && !m2.content)
                  clean.content = null;
                return clean;
              }),
              max_tokens: 4096,
              temperature: 0.6,
              top_p: 0.95,
              tools: toolDefs,
              tool_choice: "auto",
              stream: true
            });
            break;
          } catch (apiErr) {
            if (attempt < maxRetries && apiErr.status >= 400 && apiErr.status < 500) {
              await sleep(1000 * Math.pow(2, attempt));
              continue;
            }
            throw apiErr;
          }
        }
        let fullContent = "";
        const toolCallDeltas = {};
        const toolCallMsgIds = {};
        const seenToolCalls = new Set;
        let finishReason = null;
        let streamUsage = null;
        let reasoningText = "";
        let displayState = "buffering";
        let contentAccum = "";
        let thinkAccum = "";
        let displayContent = "";
        let thinkContent = "";
        let lastFlushTime = Date.now();
        for await (const chunk of stream) {
          if (chunk.usage)
            streamUsage = chunk.usage;
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) {
            if (chunk.choices?.[0]?.finish_reason)
              finishReason = chunk.choices[0].finish_reason;
            continue;
          }
          if (chunk.choices[0].finish_reason)
            finishReason = chunk.choices[0].finish_reason;
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index;
              if (!toolCallDeltas[idx]) {
                toolCallDeltas[idx] = { id: tc.id || "", name: tc.function?.name || "", arguments: "" };
              }
              if (tc.id)
                toolCallDeltas[idx].id = tc.id;
              if (tc.function?.name) {
                toolCallDeltas[idx].name = tc.function.name;
                if (!seenToolCalls.has(idx)) {
                  seenToolCalls.add(idx);
                  toolCallMsgIds[idx] = store.addMessage({
                    role: "tool",
                    name: tc.function.name,
                    detail: "...",
                    status: "pending"
                  });
                }
              }
              if (tc.function?.arguments) {
                toolCallDeltas[idx].arguments += tc.function.arguments;
              }
            }
          }
          if (delta.reasoning_content) {
            reasoningText += delta.reasoning_content;
            store.updateStreaming(displayContent, reasoningText);
          }
          if (delta.content) {
            fullContent += delta.content;
            const hasTool = Object.keys(toolCallDeltas).length > 0;
            if (displayState === "streaming") {
              contentAccum += delta.content;
              contentAccum = stripStrayCloseTag(contentAccum);
              const openIdx = contentAccum.indexOf("<think>");
              if (openIdx !== -1) {
                if (openIdx > 0)
                  displayContent += contentAccum.slice(0, openIdx);
                thinkAccum = contentAccum.slice(openIdx + 7);
                contentAccum = "";
                displayState = "thinking";
                const closeMatch = findThinkClose(thinkAccum);
                if (closeMatch) {
                  const thought = thinkAccum.slice(0, closeMatch.pos).trim();
                  const after = thinkAccum.slice(closeMatch.pos + closeMatch.len);
                  thinkAccum = "";
                  if (thought)
                    store.addMessage({ role: "thinking", content: thought });
                  displayState = "streaming";
                  contentAccum = after;
                  if (!hasTool && after)
                    displayContent += after;
                  contentAccum = "";
                  thinkContent = "";
                } else {
                  thinkContent = thinkAccum;
                }
              } else {
                const { safe, pending } = splitAtPartialTag(contentAccum);
                contentAccum = pending;
                if (!hasTool && safe)
                  displayContent += safe;
              }
              store.updateStreaming(displayContent, thinkContent || reasoningText);
            } else if (displayState === "thinking") {
              thinkAccum += delta.content;
              const closeMatch = findThinkClose(thinkAccum);
              if (closeMatch) {
                const thought = thinkAccum.slice(0, closeMatch.pos).trim();
                const after = thinkAccum.slice(closeMatch.pos + closeMatch.len);
                thinkAccum = "";
                if (thought)
                  store.addMessage({ role: "thinking", content: thought });
                displayState = "streaming";
                contentAccum = after;
                if (!hasTool && after)
                  displayContent += after;
                contentAccum = "";
                thinkContent = "";
                store.updateStreaming(displayContent, reasoningText);
              } else {
                thinkContent = thinkAccum;
                store.updateStreaming(displayContent, thinkContent || reasoningText);
              }
            } else {
              contentAccum += delta.content;
              contentAccum = stripStrayCloseTag(contentAccum);
              const openIdx = contentAccum.indexOf("<think>");
              if (openIdx !== -1) {
                const before = contentAccum.slice(0, openIdx);
                thinkAccum = contentAccum.slice(openIdx + 7);
                contentAccum = "";
                if (!hasTool && before.trim())
                  displayContent += before;
                displayState = "thinking";
                const closeMatch = findThinkClose(thinkAccum);
                if (closeMatch) {
                  const thought = thinkAccum.slice(0, closeMatch.pos).trim();
                  const after = thinkAccum.slice(closeMatch.pos + closeMatch.len);
                  thinkAccum = "";
                  if (thought)
                    store.addMessage({ role: "thinking", content: thought });
                  displayState = "streaming";
                  contentAccum = after;
                  if (!hasTool && after)
                    displayContent += after;
                  contentAccum = "";
                  thinkContent = "";
                } else {
                  thinkContent = thinkAccum;
                }
                store.updateStreaming(displayContent, thinkContent || reasoningText);
              } else {
                const { safe, pending } = splitAtPartialTag(contentAccum);
                if (safe.length > 0) {
                  displayState = "streaming";
                  if (!hasTool)
                    displayContent += safe;
                  contentAccum = pending;
                  store.updateStreaming(displayContent, reasoningText);
                }
              }
            }
          }
          const now = Date.now();
          if (now - lastFlushTime > 16) {
            lastFlushTime = now;
            await new Promise((r) => setTimeout(r, 1));
          }
        }
        if (displayState === "thinking") {
          const thought = (thinkAccum + contentAccum).trim();
          if (thought)
            store.addMessage({ role: "thinking", content: thought });
          thinkAccum = "";
          contentAccum = "";
        } else if (displayState === "buffering") {
          const hasTool = Object.keys(toolCallDeltas).length > 0;
          if (!hasTool && contentAccum.trim())
            displayContent += contentAccum;
          contentAccum = "";
        } else if (contentAccum) {
          const hasTool = Object.keys(toolCallDeltas).length > 0;
          if (!hasTool)
            displayContent += contentAccum;
          contentAccum = "";
        }
        if (reasoningText.trim()) {
          store.addMessage({ role: "thinking", content: reasoningText.trim() });
        }
        const { content: parsedContent } = parseThinkBlocks(fullContent);
        turnTokens += streamUsage?.total_tokens || 0;
        const sortedIndices = Object.keys(toolCallDeltas).sort((a, b2) => a - b2);
        const toolCalls = sortedIndices.map((idx) => ({
          id: toolCallDeltas[idx].id,
          type: "function",
          function: { name: toolCallDeltas[idx].name, arguments: toolCallDeltas[idx].arguments }
        }));
        const msg = {
          role: "assistant",
          content: fullContent || null,
          ...toolCalls.length > 0 ? { tool_calls: toolCalls } : {}
        };
        if (toolCalls.length > 0) {
          store.clearStreaming();
          messages.push(msg);
          if (displayContent.trim()) {
            store.addMessage({ role: "assistant", content: displayContent.trim() });
          }
          sortedIndices.forEach((idx, i) => {
            const tc = toolCalls[i];
            let toolArgs;
            try {
              toolArgs = JSON.parse(tc.function.arguments);
            } catch {
              toolArgs = {};
            }
            const detail = toolDetailStr(tc.function.name, toolArgs);
            const msgId = toolCallMsgIds[idx];
            if (msgId)
              store.updateMessage(msgId, { detail, status: "running" });
          });
          const toolPromises = toolCalls.map(async (toolCall, i) => {
            const toolName = toolCall.function.name;
            let toolArgs;
            try {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } catch {
              toolArgs = {};
            }
            const detail = toolDetailStr(toolName, toolArgs);
            const callStart = Date.now();
            const msgId = toolCallMsgIds[sortedIndices[i]];
            const result = await executeTool(toolName, toolArgs, (partial) => {
              if (msgId)
                store.updateMessage(msgId, { output: partial });
            });
            const success = !result.startsWith("Error");
            const elapsed = Date.now() - callStart;
            session.toolCallCount++;
            if (msgId) {
              store.updateMessage(msgId, {
                detail,
                status: success ? "done" : "error",
                success,
                elapsed,
                output: result
              });
            }
            if ((toolName === "Edit" || toolName === "Patch") && success) {
              store.addMessage({ role: "diff", filename: toolArgs.path, content: result });
            }
            return { id: toolCall.id, result };
          });
          const toolResults = await Promise.all(toolPromises);
          for (const { id, result } of toolResults) {
            messages.push({ role: "tool", tool_call_id: id, content: result });
          }
          if (finishReason === "stop")
            break;
          displayContent = "";
          continue;
        }
        if (fullContent) {
          const cleanedContent = parsedContent.trim() || fullContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
          if (cleanedContent) {
            store.finishStreaming({ role: "assistant", content: cleanedContent });
          } else {
            store.clearStreaming();
          }
          session.conversationHistory.push({ role: "assistant", content: cleanedContent || fullContent });
        } else {
          store.clearStreaming();
        }
        break;
      }
      if (iterations >= MAX_TOOL_ITERATIONS) {
        store.addMessage({ role: "system", content: `⚠ Reached maximum tool iterations (${MAX_TOOL_ITERATIONS}). Stopping.` });
      }
      session.totalTokens += turnTokens;
    } catch (err) {
      store.clearStreaming();
      let errorMsg = `Error: ${err.message}`;
      if (err.status) {
        errorMsg += `\nStatus: ${err.status}`;
      }
      store.addMessage({ role: "system", content: errorMsg });
    }
    store.addMessage({ role: "divider" });
    isProcessing = false;
    store.setState({ isProcessing: false });
  }
  module2.exports = {
    handleUserInput,
    getIsProcessing
  };
});
