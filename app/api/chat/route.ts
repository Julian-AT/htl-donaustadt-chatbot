import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RunnableSequence } from 'langchain/schema/runnable'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate
} from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { Pinecone } from '@pinecone-database/pinecone'

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key vars missing')
}

const TEMPLATE = `Du bist ein hilfreicher Chatbot der Fragen über die HTL Donaustadt aus sicht der Schule beantwortet.
Du bekommst eine Wissenbasis über die Schule und kannst Fragen beantworten.

Du musst folgende Regeln beachten beim beanworten der Fragen:
  - Wenn du die Antwort nicht weißt, sag, dass du es nicht weißt und erfinde keine zusätzlichen Informationen.
  - Gib möglichst viele Informationen aus dem Kontext wieder. 
  - Gib die Quelle für die Antwort(en) an, wenn du sie kennst.
  - Sei immer freundlich und duze den Benutzer. Schreibe aus der Sicht der Schule. zb. Wir sind eine höhere technische Lehranstalt.
  - Benutze das Markdown Format und gliedere deine Antwort in Absätze mit Überschriften.

--------------------------------------------------
KONTEXT:
{context}
--------------------------------------------------
CHATVERLAUF:
{chatHistory}
--------------------------------------------------
FRAGE:
{question}
--------------------------------------------------
ANTWORT:`

export async function POST(req: Request) {
  try {
    /* Fetch JSON request body */
    const json = await req.json()

    /* Destructure messages from body */
    const { messages, previewToken } = json

    /* Format messages */
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)

    /* Get current message content */
    const currentMessageContent = messages[messages.length - 1].content

    const model = new ChatOpenAI({
      temperature: 0.75,
      modelName: 'gpt-3.5-turbo',
      streaming: true,
      maxTokens: 3000
    })

    const pinecone = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT ?? '',
      apiKey: process.env.PINECONE_API_KEY ?? ''
    })

    /* Get pinecone index */
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX ?? '')

    if (!pineconeIndex) {
      throw new Error('Pinecone index not found')
    }

    /* Create vector store instance from pinecone index */
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex,
        textKey: 'text'
      }
    )

    const vectorStoreRetriever = vectorStore.asRetriever(8)

    const chain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory?: string }) =>
          input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) => {
          console.log(input.chatHistory)
          input.chatHistory ?? ''
        },
        context: async (input: { question: string; chatHistory?: string }) => {
          const relevantDocs = await vectorStoreRetriever.getRelevantDocuments(
            input.question
          )
          const serialized = relevantDocs
            .map(
              doc =>
                `TEXT: ${doc.pageContent}\n-------------------\nSOURCE: ${doc.metadata.source}\n\n`
            )
            .join('\n\n')
          return serialized
        }
      },
      PromptTemplate.fromTemplate(TEMPLATE),
      model,
      new StringOutputParser()
    ])

    const stream = await chain.stream({
      question: currentMessageContent,
      chatHistory: formattedPreviousMessages.join('\n')
    })

    return new StreamingTextResponse(stream)
  } catch (e: any) {
    console.log(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
