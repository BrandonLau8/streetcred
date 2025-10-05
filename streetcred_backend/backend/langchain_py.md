# LangChain Python Framework Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Getting Started](#getting-started)
4. [Key Components](#key-components)
5. [Use Case Scenarios](#use-case-scenarios)
6. [Advanced Patterns](#advanced-patterns)

---

## Introduction

**LangChain** is a framework for developing applications powered by large language models (LLMs). It simplifies every stage of the LLM application lifecycle, offering:

- **Open-source components** for building complex AI applications
- **Third-party integrations** with various LLM providers, vector stores, and tools
- **Chain and agent orchestration** for multi-step workflows
- **Memory management** for stateful conversations
- **Retrieval-Augmented Generation (RAG)** capabilities

---

## Core Concepts

### 1. **Chat Models**
Chat models are LLMs designed for conversational interfaces. They take messages as input and return AI-generated responses.

```python
from langchain_openai import ChatOpenAI

# Initialize a chat model
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Simple invocation
response = llm.invoke("What is LangChain?")
print(response.content)
```

### 2. **Prompts**
Prompts are templates that structure input to LLMs. LangChain provides powerful prompt management tools.

```python
from langchain_core.prompts import ChatPromptTemplate

# Create a prompt template
prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)
```

### 3. **Chains**
Chains combine multiple components (prompts, models, parsers) into a single workflow using the pipe (`|`) operator.

```python
from langchain_core.output_parsers import StrOutputParser

# Create a simple chain
chain = prompt | llm | StrOutputParser()

# Invoke the chain
result = chain.invoke({
    "context": "LangChain is a framework for LLM applications.",
    "question": "What is LangChain?"
})
```

### 4. **Retrievers**
Retrievers fetch relevant documents from vector stores or other data sources.

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Create embeddings and vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(
    ["LangChain simplifies LLM development"],
    embeddings
)

# Create retriever
retriever = vectorstore.as_retriever()
```

### 5. **Agents**
Agents use LLMs to decide which tools to use and in what order to accomplish tasks.

```python
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain import hub

# Pull a predefined agent prompt
prompt = hub.pull("hwchase17/openai-functions-agent")

# Create agent
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

---

## Getting Started

### Installation

```bash
pip install langchain langchain-openai langchain-community
```

### Basic Example

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Initialize model
llm = ChatOpenAI(model="gpt-3.5-turbo")

# Create prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("human", "{input}")
])

# Build chain
chain = prompt | llm | StrOutputParser()

# Use chain
response = chain.invoke({"input": "Explain quantum computing in simple terms"})
print(response)
```

---

## Key Components

### Document Loaders

Load documents from various sources for processing.

```python
from langchain_community.document_loaders import WebBaseLoader

# Load documents from a web page
loader = WebBaseLoader("https://docs.smith.langchain.com/overview")
documents = loader.load()
```

### Text Splitters

Split documents into manageable chunks for embedding and retrieval.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Split documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
documents = text_splitter.split_documents(documents)
```

### Vector Stores

Store and retrieve embeddings for semantic search.

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(documents, embeddings)

# Similarity search
query = "What is LangSmith?"
results = vectorstore.similarity_search(query)
```

### Memory

Maintain conversation history for chatbots.

```python
from langchain.memory import ConversationBufferMemory

# Create memory
memory = ConversationBufferMemory(memory_key="chat_history")

# Use with agents
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory
)
```

### Tools

Extend LLM capabilities with external functions.

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get the weather for a city."""
    # Replace with actual weather API call
    return f"The weather in {city} is sunny."

tools = [get_weather]
```

---

## Use Case Scenarios

### Use Case 1: Question Answering Chatbot

**Scenario:** Build a chatbot that answers questions based on your documentation.

```python
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. Load documents
loader = WebBaseLoader("https://docs.example.com")
documents = loader.load()

# 2. Split documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
documents = text_splitter.split_documents(documents)

# 3. Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(documents, embeddings)

# 4. Create retriever
retriever = vectorstore.as_retriever()

# 5. Initialize LLM
llm = ChatOpenAI(model="gpt-3.5-turbo")

# 6. Create RetrievalQA chain
qa_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=retriever
)

# 7. Ask questions
query = "What is your product pricing?"
result = qa_chain.invoke({"query": query})
print(result)
```

### Use Case 2: Retrieval-Augmented Generation (RAG)

**Scenario:** Answer questions using context from your documents for accurate, grounded responses.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

# Define prompt
prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")

# Helper function to format documents
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Create RAG chain
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Invoke chain
response = chain.invoke("What are the main features?")
print(response)
```

### Use Case 3: Conversational RAG with Memory

**Scenario:** Build a chatbot that remembers conversation history and retrieves relevant context.

```python
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# 1. Create history-aware retriever
condense_question_prompt = ChatPromptTemplate.from_messages([
    ("system", "Given a chat history and the latest user question, "
               "formulate a standalone question which can be understood "
               "without the chat history."),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
])

history_aware_retriever = create_history_aware_retriever(
    llm,
    vectorstore.as_retriever(),
    condense_question_prompt
)

# 2. Create QA chain
system_prompt = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise.\n\n{context}"
)

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
])

qa_chain = create_stuff_documents_chain(llm, qa_prompt)

# 3. Combine into conversational RAG chain
convo_qa_chain = create_retrieval_chain(
    history_aware_retriever,
    qa_chain
)

# 4. Use the chain
result = convo_qa_chain.invoke({
    "input": "What are autonomous agents?",
    "chat_history": [],
})
print(result["answer"])
```

### Use Case 4: Few-Shot Learning with Example Selectors

**Scenario:** Dynamically select relevant examples to improve LLM performance.

```python
from langchain.prompts import PromptTemplate, FewShotPromptTemplate
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# Example data
examples = [
    {
        "question": "What is the capital of France?",
        "answer": "The capital of France is Paris."
    },
    {
        "question": "What is the capital of Germany?",
        "answer": "The capital of Germany is Berlin."
    }
]

# Create embeddings and vector store for examples
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(
    [f"Question: {ex['question']}\nAnswer: {ex['answer']}" for ex in examples],
    embeddings
)

# Create semantic similarity example selector
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=1,
    search_kwargs={'score_threshold': 0.75}
)

# Define prompt template
example_prompt = PromptTemplate(
    input_variables=["question", "answer"],
    template="Question: {question}\nAnswer: {answer}"
)

# Create FewShotPromptTemplate
few_shot_prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="Here are some examples:",
    suffix="Question: {question}\nAnswer:",
    input_variables=["question"]
)

# Initialize LLM
llm = ChatOpenAI(model="gpt-3.5-turbo")

# Create chain
chain = few_shot_prompt | llm

# Invoke chain
response = chain.invoke({"question": "What is the capital of Spain?"})
print(response)
```

### Use Case 5: Tool-Using Agent

**Scenario:** Create an agent that can use tools like search engines or APIs to answer questions.

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_community.utilities import GoogleSearchAPIWrapper
from langchain_core.tools import Tool
from langchain import hub

# Create a search tool
search = GoogleSearchAPIWrapper()
tool = Tool(
    name="Google Search",
    description="Search Google for recent results.",
    func=search.run,
)
tools = [tool]

# Pull a React agent prompt
prompt = hub.pull("hwchase17/react")

# Initialize LLM
llm = ChatOpenAI(temperature=0)

# Create agent
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)

# Execute agent
response = agent_executor.invoke({
    "input": "What are the latest developments in AI?"
})
print(response)
```

### Use Case 6: Multi-Language RAG

**Scenario:** Build a RAG system that can answer questions in multiple languages.

```python
from operator import itemgetter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# Create prompt with language parameter
prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "Answer using information solely based on the following context:\n"
        "<Documents>\n{context}\n</Documents>\n"
        "Speak only in the following language: {language}"
    ),
    ("user", "{question}"),
])

# Create chain with language support
chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | llm
    | StrOutputParser()
)

# Invoke with language specification
result = chain.invoke({
    "question": "where did harrison work",
    "language": "italian"
})
print(result)
```

---

## Advanced Patterns

### Streaming Responses

Stream tokens as they're generated for better UX.

```python
for chunk in chain.stream({"input": "Tell me a story"}):
    print(chunk, end="", flush=True)
```

### Batch Processing

Process multiple inputs efficiently.

```python
inputs = [
    {"question": "What is AI?"},
    {"question": "What is ML?"},
    {"question": "What is DL?"}
]
results = chain.batch(inputs)
```

### Custom Output Parsers

Parse structured output from LLMs.

```python
from langchain_core.output_parsers import StrOutputParser

class CustomParser(StrOutputParser):
    def parse(self, text: str) -> dict:
        # Custom parsing logic
        return {"result": text.strip()}

chain = prompt | llm | CustomParser()
```

### Runnable Branching

Conditionally execute different chains based on input.

```python
from langchain_core.runnables import RunnableBranch

query_transforming_chain = RunnableBranch(
    (
        lambda x: len(x.get("messages", [])) == 1,
        (lambda x: x["messages"][-1].content) | retriever,
    ),
    query_transform_prompt | llm | StrOutputParser() | retriever,
)
```

### LangGraph for Stateful Agents

Use LangGraph for complex, stateful multi-agent workflows.

```python
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

# Create memory saver
memory = MemorySaver()

# Create agent with memory
agent_executor = create_react_agent(
    llm,
    [retrieve],
    checkpointer=memory
)

# Use with thread ID for conversation tracking
config = {"configurable": {"thread_id": "user_123"}}
response = agent_executor.invoke(
    {"messages": [{"role": "user", "content": "Hello!"}]},
    config
)
```

---

## Best Practices

1. **Use Appropriate Model Temperatures**
   - 0 for deterministic, factual responses
   - 0.7-1.0 for creative tasks

2. **Chunk Documents Appropriately**
   - Balance between context and specificity
   - Typical: 500-1000 tokens with 10-20% overlap

3. **Optimize Retrieval**
   - Use semantic similarity with score thresholds
   - Implement reranking for better results

4. **Handle Errors Gracefully**
   - Add error handling for API failures
   - Implement retry logic with exponential backoff

5. **Monitor Token Usage**
   - Track costs with built-in callbacks
   - Use smaller models when possible

6. **Secure API Keys**
   - Use environment variables
   - Never hardcode credentials

---

## Resources

- **Official Documentation:** https://python.langchain.com/docs/
- **LangChain Hub:** https://smith.langchain.com/hub
- **GitHub Repository:** https://github.com/langchain-ai/langchain
- **LangSmith (Observability):** https://smith.langchain.com/
- **Community:** LangChain Discord and GitHub Discussions

---

## Summary

LangChain provides a comprehensive framework for building LLM-powered applications with:

- **Flexible chains** for composing workflows
- **Powerful retrievers** for RAG applications
- **Intelligent agents** for autonomous task execution
- **Memory management** for stateful conversations
- **Tool integration** for extended capabilities

Start with simple chains, then progress to RAG systems and agents as your needs grow. The modular design makes it easy to build, test, and iterate on LLM applications.
