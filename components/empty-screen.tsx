import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'
import { ThemeToggle } from './theme-toggle'

const exampleMessages = [
  {
    heading: 'Erzähle mir etwas über die HTL Donaustadt',
    message: 'Erzähle mir so viel du weißt über die HTL Donaustadt'
  },
  {
    heading: 'Kontaktinformationen der HTL Donaustadt',
    message: 'Wie kann ich die HTL Donaustadt kontaktieren?'
  },
  {
    heading: 'Einzigartige/Nennenswerte Projekte der HTL Donaustadt',
    message: 'Nenne mir einzigartige Projekte der HTL Donaustadt'
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border border-border bg-background p-7">
        <h1 className="mb-2 text-lg font-semibold">
          HTL Donaustadt - AI Chatbot 🏫
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          HTL Donaustadt AI Chatbot. Wissensbasis beinhält alle Daten
          <br /> (Blog Posts, Statische Seiten, etc.) der HTL Donaustadt seit
          2011.
          <br />
          <br />
          <b>Technologien:</b>
          <br />
          &emsp; • GPT 3.5-Turbo (AI) 🤖
          <br />
          &emsp; • NextJS 14 (Frontend) ⭐️ <br />
          &emsp; • Vercel AI SDK (Middleware)⚡️
          <br />
          &emsp; • LangchainJS (Middleware) 🦜
          <br />
          &emsp; • Pinecone (Vektordatenbank) 🌲 <br />
          <br /> <b>Notiz:</b>
          &nbsp; Chatverläufe werden <b>nicht</b> gespeichert. <br />
          Deine Eingaben werden nur für die Dauer der aktuellen Sitzung
          gespeichert.
        </p>
        <br />
        <hr />
        <br />
        <p className="leading-normal text-muted-foreground">
          Du kannst mich alles über die HTL Donaustadt fragen, <br />
          oder mit einer der unteren Optionen beginnen. Viel Spaß! 🤗
        </p>
        <br />
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
