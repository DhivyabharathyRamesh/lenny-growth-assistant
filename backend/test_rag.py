from app.agents.rag import load_and_index_transcripts, retrieve

print("Loading transcripts...")
load_and_index_transcripts()

print("\nTesting retrieval...\n")

query = "What is product-market fit?"

context = retrieve(query)

print(context)