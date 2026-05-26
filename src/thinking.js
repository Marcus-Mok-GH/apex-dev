var require_thinking = __commonJS((exports, module2) => {
  function parseThinkBlocks(text) {
    const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|think>)/g;
    const thoughts = [];
    let match;
    while ((match = thinkRegex.exec(text)) !== null) {
      const content = match[1].trim();
      if (content)
        thoughts.push(content);
    }
    const cleaned = text.replace(/<think>[\s\S]*?(?:<\/think>|think>)/g, "").trim();
    return { thoughts, content: cleaned };
  }
  function findThinkClose(text) {
    const fullClose = text.indexOf("</think>");
    if (fullClose !== -1)
      return { pos: fullClose, len: 8 };
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const idx = text.indexOf("think>", searchFrom);
      if (idx === -1)
        break;
      if (idx === 0 || text[idx - 1] !== "<")
        return { pos: idx, len: 6 };
      searchFrom = idx + 6;
    }
    return null;
  }
  function stripStrayCloseTag(text) {
    return text.replace(/<\/think>/g, "").replace(/(?<!<)think>/g, "");
  }
  function splitAtPartialTag(text) {
    const prefixes = [
      "</think>",
      "</think",
      "</thin",
      "</thi",
      "</th",
      "</t",
      "</",
      "<think>",
      "<think",
      "<thin",
      "<thi",
      "<th",
      "<t",
      "<"
    ];
    for (const prefix of prefixes) {
      if (text.endsWith(prefix)) {
        if (prefix === "</think>" || prefix === "think>") {
          return { safe: text.slice(0, -prefix.length), pending: "" };
        }
        return { safe: text.slice(0, -prefix.length), pending: prefix };
      }
    }
    return { safe: text, pending: "" };
  }
  module2.exports = {
    parseThinkBlocks,
    findThinkClose,
    stripStrayCloseTag,
    splitAtPartialTag
  };
});

