## Agent-Based Models and Agentic UIs

This is a companion repository for the blog post [here](https://dhruv-sharma.ovh/post/abms-agentic-llms/). The type systems for a generic Agent-Based model is available in [ABMTypeSystem](ABMTypeSystem.fs), and the type system for the agentic UI can be found in [AgenticUITypeSystem](AgenticUITypeSystem.fs).

## Running the toy model

The toy model is a UI navigator prompted via LLMs. Its implemented in TypeScript. Once you have `npm` installed, running `npm install` and `npm start` should be enough. 

The code requires an OpenAI API key to be stored in an `.env` file. The key should be stored as `OPENAI_API_KEY`.