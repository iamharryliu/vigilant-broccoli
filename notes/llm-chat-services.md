# LLM Chat Services

| Feature / Limit                  | **Google Gemini**                                                  | **ChatGPT (OpenAI)**                                                        | **Claude (Anthropic)**                                             |
| :------------------------------- | :----------------------------------------------------------------- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **Input Context Window**         | **1,000,000 tokens** (~750k words)                                 | **128,000 tokens** (~96k words)                                             | **200,000 tokens** (~150k words)                                   |
| **Max Output (Single Turn)**     | ~8,192 tokens (~6,000 words)                                       | ~4,096 to 8,192 tokens                                                      | ~4,096 to 8,192 tokens                                             |
| **Large Text/MD Paste Handling** | Exceptional (Auto-converts ultra-large text into attachment cards) | Moderate (Pasting massive blocks triggers warnings or auto-file conversion) | Strict (Consumes message limits quickly due to session token cost) |
| **UI Formatting & Rendering**    | Direct code blocks with clean copy buttons                         | Markdown rendering with built-in code block wrappers                        | Dedicated Artifacts side-panel for clean Markdown/code previews    |
| **Long Thread Retention**        | Maintains broad context across massive inputs                      | Relies on cross-chat memory + thread context window                         | High accuracy, but long threads rapidly exhaust usage caps         |
