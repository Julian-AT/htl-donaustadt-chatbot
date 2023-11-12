import { pinecone } from '@/lib/pinecone-client'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'

async function initChain() {
  const model = new ChatOpenAI({
    temperature: 0.3,
    streaming: true
  })
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX ?? '')

  /* create vectorstore*/
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: pineconeIndex,
      textKey: 'text'
    }
  )

  return ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    { returnSourceDocuments: true }
  )
}

export const chain = await initChain()
