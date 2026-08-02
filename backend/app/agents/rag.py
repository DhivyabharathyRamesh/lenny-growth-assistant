from pathlib import Path
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from app.config import get_settings

settings = get_settings()

vectorstore = None

def get_vectorstore():
    global vectorstore
    
    if vectorstore is not None:
        return vectorstore

    persist_directory = "./chroma_db"
    
    embeddings = OllamaEmbeddings(
        model="nomic-embed-text",
        base_url="http://127.0.0.1:11434"
    )

    # Load existing database (do NOT recreate)
    vectorstore = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )
    
    print("Loaded existing Chroma vectorstore")
    return vectorstore

def retrieve(query: str, k: int = 3) -> str:
    try:
        vs = get_vectorstore()
        docs = vs.similarity_search(query, k=k)
        
        if not docs:
            return "No relevant context found in the transcripts."
        
        context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        return f"Error retrieving context: {str(e)}"