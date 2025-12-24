from langchain_core.prompts import ChatPromptTemplate

rag_template = """You are a helpful assistant. Use the following pieces of retrieved context to answer the user's question. 
If the information is not in the context, just say that you don't know.

Context:
{context}

Question: 
{input}
"""

rag_prompt = ChatPromptTemplate.from_template(rag_template)