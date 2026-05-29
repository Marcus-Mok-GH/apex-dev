var require_tools = __commonJS((exports, module2) => {
  var toolDefs = [
    {
      type: "function",
      function: {
        name: "Read",
        description: "Read the contents of a file. Returns line-numbered content. Always read a file before editing it.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to read (absolute or relative to project root)." },
            start_line: { type: "number", description: "Start line (1-indexed). Omit to read from beginning." },
            end_line: { type: "number", description: "End line (1-indexed). Omit to read to end (max 500 lines)." }
          },
          required: ["path"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Write",
        description: "Create a new file or completely overwrite an existing file. For modifying existing files, prefer Edit instead.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to write." },
            content: { type: "string", description: "Full content to write." }
          },
          required: ["path", "content"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Edit",
        description: "Replace an exact string in a file with new content. The old_str must match exactly (including whitespace). For existing files, this is preferred over Write.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to edit." },
            old_str: { type: "string", description: "Exact string to find (must be unique in the file)." },
            new_str: { type: "string", description: "Replacement string." }
          },
          required: ["path", "old_str", "new_str"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Patch",
        description: "Apply multiple find-and-replace edits to a single file atomically. Use when you need to make several changes to the same file.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to patch." },
            edits: {
              type: "array",
              description: "Array of edits to apply in order.",
              items: {
                type: "object",
                properties: {
                  old_str: { type: "string", description: "Exact string to find." },
                  new_str: { type: "string", description: "Replacement string." }
                },
                required: ["old_str", "new_str"]
              }
            }
          },
          required: ["path", "edits"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Bash",
        description: "Execute a shell command. Use for running tests, builds, git commands, installing packages, checking syntax, etc. Commands have a 60-second timeout.",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string", description: "Shell command to execute." },
            cwd: { type: "string", description: "Working directory (defaults to project root)." }
          },
          required: ["command"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Grep",
        description: "Search for a pattern across files using regex. Returns matching lines with file paths and line numbers.",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string", description: "Regex pattern to search for." },
            path: { type: "string", description: "Directory or file to search in (defaults to project root)." },
            include: { type: "string", description: 'File glob pattern to include, e.g. "*.js" or "*.ts"' },
            case_sensitive: { type: "boolean", description: "Case-sensitive search (default: false)." }
          },
          required: ["pattern"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Glob",
        description: "Find files matching a glob pattern. Returns file paths sorted by modification time.",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string", description: 'Glob pattern like "**/*.js", "src/**/*.ts", "*.json"' },
            cwd: { type: "string", description: "Base directory for the search (defaults to project root)." }
          },
          required: ["pattern"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ListDir",
        description: "List the contents of a directory. Shows files and subdirectories with type indicators.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Directory path to list (defaults to project root)." },
            recursive: { type: "boolean", description: "If true, list recursively (max depth 3)." }
          },
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "UndoEdit",
        description: "Undo the last edit made to a specific file, restoring its previous content.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to undo the last edit for." }
          },
          required: ["path"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Task",
        description: "Spawn a sub-task by executing a sequence of shell commands for a complex multi-step operation. Useful for build-test-fix cycles.",
        parameters: {
          type: "object",
          properties: {
            description: { type: "string", description: "Brief description of the task." },
            commands: {
              type: "array",
              description: "Shell commands to execute in sequence. Stops on first failure.",
              items: { type: "string" }
            }
          },
          required: ["description", "commands"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "WebSearch",
        description: "Search the web using Exa AI. Returns relevant results with titles, URLs, and text snippets. Use this to find up-to-date information, documentation, or answers from the internet.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to execute." },
            num_results: { type: "number", description: "Number of results to return (default: 5, max: 10)." },
            type: { type: "string", description: 'Search type: "auto" (default), "neural", or "keyword".' },
            include_domains: {
              type: "array",
              description: 'Only return results from these domains, e.g. ["github.com", "stackoverflow.com"].',
              items: { type: "string" }
            },
            category: { type: "string", description: 'Filter by category: "news", "research paper", "tweet", "company", "personal site", etc.' }
          },
          required: ["query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "FilePickerMax",
        description: 'Spawn a file-picker sub-agent that deeply explores the codebase to find files relevant to a prompt. It scans the full directory tree and previews every source file, then uses the most capable model to identify and rank the relevant files. Use this when you need to locate files related to a concept, feature, bug, or pattern. NEVER send generic prompts like "give me an overview of the codebase" — always specify the exact type of files you want.',
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: 'Specify the exact type of files you need. NEVER ask for a generic overview. Be specific — e.g. "show me the main entry point and routing files", "files that handle user authentication", "all React components related to the dashboard", "where database migrations are defined".' }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "TodoList",
        description: "Manage a persistent todo list for tracking tasks. Supports adding, listing, completing, and removing items. The list is saved to .apex-todos.json in the project root.",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["add", "list", "done", "remove", "clear"],
              description: 'Action to perform: "add" a new item, "list" all items, "done" to mark complete, "remove" to delete, "clear" to remove all completed.'
            },
            text: { type: "string", description: 'Text for the todo item (required for "add").' },
            index: { type: "number", description: 'Item index (1-based, required for "done" and "remove").' }
          },
          required: ["action"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Thinker",
        description: "Spawn a deep reasoning/planning sub-agent. It analyzes the problem, considers multiple approaches, and returns a structured plan. Use for complex tasks that benefit from careful planning before implementation.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The question or task to reason about deeply." }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ThinkerBestOfN",
        description: "Spawn N parallel thinking agents that each independently reason about the same problem, then a selector picks the best response. Use for critical decisions that benefit from multiple perspectives.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The question or task to reason about from multiple angles." },
            n: { type: "number", description: "Number of parallel thinking passes (default: 3, max: 5)." }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "EditorMultiPrompt",
        description: "Spawn multiple editor agents in parallel, each with a different implementation strategy, then a selector picks the best result and applies it. Use for important code changes where you want to explore multiple approaches.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The coding task to implement." },
            strategies: {
              type: "array",
              description: "Array of 2-3 different implementation strategies to try in parallel.",
              items: { type: "string" }
            },
            files: {
              type: "array",
              description: "File paths and their contents that each editor will work with.",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", description: "File path." },
                  content: { type: "string", description: "Current file content." }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["prompt", "strategies", "files"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "CodeReview",
        description: "Spawn a code reviewer that analyzes all files modified this session for bugs, security issues, edge cases, and code quality. Call this after making code changes.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of what was changed and why, to give the reviewer context." },
            files: {
              type: "array",
              description: "Optional additional file paths to include in the review.",
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "CodeReviewMulti",
        description: "Spawn multiple code reviewers in parallel, each analyzing from a different perspective (correctness, security, performance, etc.).",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of the changes to review." },
            perspectives: {
              type: "array",
              description: 'Review perspectives, e.g. ["correctness and logic", "security vulnerabilities", "performance and efficiency"].',
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Commander",
        description: "Spawn a terminal command specialist agent that determines and executes the right shell commands for a task. It plans the commands, explains them, then executes them in sequence.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of what needs to be accomplished via terminal commands." }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ContextPruner",
        description: "Summarize the current conversation history to free up context space. Automatically invoked in MAX mode but can be called manually. Replaces verbose conversation history with a concise summary preserving all critical information.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ResearcherWeb",
        description: "Search the web and synthesize results into a clear answer using an LLM. Use when you need up-to-date information, best practices, or answers that may not be in your training data. Falls back to LLM knowledge if web search is unavailable.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The question to research. Be specific for better results." },
            domains: {
              type: "array",
              description: 'Optional list of domains to restrict search to (e.g. ["stackoverflow.com", "github.com"]).',
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ResearcherDocs",
        description: "Search technical documentation for a library or framework and synthesize a precise answer with API details and code examples. Use when you need to verify API signatures, find usage patterns, or check library behavior.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The documentation question. Include the library/framework name and version if relevant." },
            library: { type: "string", description: 'The library or framework name (e.g. "React", "Express", "Prisma").' }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "GeneralAgent",
        description: "Spawn an independent general-purpose agent that reads specified files and solves a problem. Use when you need deep independent analysis, complex reasoning with full file context, or a second opinion. More powerful than Thinker because it receives actual file contents.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The problem to solve. Be specific about what analysis or output you need." },
            filePaths: {
              type: "array",
              description: "File paths to read and provide as context. The agent will analyze these files to solve the problem.",
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    }
  ];
  module2.exports = { toolDefs };
});

