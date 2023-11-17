import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RunnableSequence } from 'langchain/schema/runnable'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { Pinecone } from '@pinecone-database/pinecone'

export const runtime = 'edge'

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key vars missing')
}

const TEMPLATE = `Du bist ein hilfreicher Chatbot der Fragen über die HTL Donaustadt aus sicht der Schule beantwortet.
Du bekommst eine Wissenbasis über die Schule und kannst Fragen beantworten. Wenn du etwas nicht weißt, sag einfach, dass du es nicht weißt.

Du musst folgende Regeln beachten beim beanworten der Fragen:
  - Wenn du die Antwort nicht weißt, sag, dass du es nicht weißt und erfinde keine zusätzlichen Informationen.
  - Gib möglichst viele Informationen aus dem Kontext wieder. 
  - Sei immer freundlich und duze den Benutzer.
  - Benutze das Markdown Format und gliedere deine Antwort in Absätze mit Überschriften.
  - Führe alle Quellen, die du für deine Antwort genutzt hast, getrennt am Ende der Antwort an. zb. [Quelle](https://www.htl-donaustadt.at/home)
  - Wenn du die Frage basierend auf dem Kontext nicht lösen kannst, sag, dass du es nicht weißt und gib dem Benutzer die Möglichkeit, die Frage umzuformulieren. Gib trotzdem potentielle Quellen an, um die Frage zu beantworten.

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


Wenn du die Frage basierend auf dem Kontext nicht lösen kannst, sag, dass du es nicht weißt und gib dem Benutzer die Möglichkeit, die Frage umzuformulieren. Gib trotzdem potentielle Quellen an, um die Frage zu beantworten.
`

export async function POST(req: Request) {
  try {
    /* Fetch JSON request body */
    const json = await req.json()

    /* Destructure messages from body */
    const { messages } = json

    /* Format messages */
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)

    /* Get current message content */
    const currentMessageContent = messages[messages.length - 1].content

    const model = new ChatOpenAI({
      temperature: 0.69,
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

    const vectorStoreRetriever = vectorStore.asRetriever(3)

    const chain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory?: string }) =>
          input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) => {
          input.chatHistory ?? ''
        },
        context: async (input: { question: string; chatHistory?: string }) => {
          const relevantDocs = await vectorStoreRetriever.getRelevantDocuments(
            input.question
          )
          const serialized = relevantDocs
            .map(
              (doc, index) =>
                `${index + 1}. CONTEXT: ${doc.pageContent}\nSOURCE: ${
                  doc.metadata.source
                }\n`
            )
            .join('\n\n')
          console.log(serialized)
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

    const encoder = new TextEncoder()
    const tes = {
      start() {},
      transform(chunk: string, controller: any) {
        controller.enqueue(encoder.encode(chunk))
      }
    }

    /* Create a transform stream that encodes the text to unit8 */
    let __info_holder = new WeakMap() /* info holder */
    class EdgeRuntimeTransformer extends TransformStream {
      constructor() {
        let t = { ...tes }
        super(t)
        __info_holder.set(this, t)
      }
      get encoding() {
        return __info_holder.get(this).encoder.encoding
      }
    }

    return new StreamingTextResponse(
      stream.pipeThrough(new EdgeRuntimeTransformer())
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
