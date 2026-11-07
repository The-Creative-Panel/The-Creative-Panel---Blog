// Contact page cards: shadcn Card + Button, laid out like Untitled UI's contact sections
// (featured icon → title → supporting text → action). Rendered to HTML at build time
// (no client: directive), so they cost readers no JavaScript.
import { ArrowRight, BookOpen, Handshake, Mail, Mic, PenLine, ShieldCheck, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

/** Untitled UI "featured icon": the icon in a soft teal square with a faint outer ring */
function FeaturedIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-6 ring-primary/5">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  )
}

const mailto = (email: string, subject: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}`

/** The main card: the address itself, with a button that opens the reader's email app */
export function ContactEmail({ email }: { email: string }) {
  return (
    <Card className="mb-12 gap-0 rounded-xl py-0 shadow-xs">
      <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
        <div className="min-w-0">
          <FeaturedIcon icon={Mail} />
          <p className="!mb-1 text-[16px] text-muted-foreground">Email</p>
          <a href={`mailto:${email}`} className="break-all font-display text-[28px] font-semibold leading-tight !text-foreground no-underline hover:!text-primary sm:text-[34px]">
            {email}
          </a>
        </div>
        <Button asChild size="lg" className="h-11 rounded-lg px-5 text-[16px] font-semibold !text-primary-foreground no-underline">
          <a href={`mailto:${email}`}>
            Write to me <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

const TOPICS: { icon: LucideIcon; title: string; text: string; subject: string; extra?: { href: string; label: string } }[] = [
  { icon: PenLine, title: "Writing and the blog", text: "Questions about a post, ideas for future ones, or a correction if I got something wrong.", subject: "About the blog" },
  { icon: BookOpen, title: "The Halo", text: "Questions about the novel, the Astroseed Trilogy, or my writing process.", subject: "About The Halo" },
  { icon: Mic, title: "Press and interviews", text: "Interview requests, podcast appearances or features.", subject: "Press / interview request" },
  { icon: Handshake, title: "Collaborations", text: "Writing projects, guest posts, or anything else you have in mind.", subject: "Collaboration idea" },
  {
    icon: ShieldCheck,
    title: "Your data",
    text: "Requests about your comments or newsletter sign-up.",
    subject: "Data request",
    extra: { href: "/privacy", label: "Privacy Policy" },
  },
]

/** One card per reason to get in touch; each action opens an email with the topic filled in */
export function ContactTopics({ email }: { email: string }) {
  return (
    <ul className="!m-0 grid gap-4 !p-0 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {TOPICS.map((t) => (
        <li key={t.title} className="list-none">
          <Card className="h-full gap-0 rounded-xl py-0 shadow-xs transition-shadow hover:shadow-md">
            <CardHeader className="gap-2 px-6 pt-6">
              <FeaturedIcon icon={t.icon} />
              <CardTitle className="!m-0 font-display text-[20px] font-semibold uppercase leading-tight">{t.title}</CardTitle>
              <CardDescription className="text-[16px] leading-relaxed">
                {t.text}
                {t.extra && (
                  <>
                    {" "}
                    See the <a href={t.extra.href}>{t.extra.label}</a>.
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto border-t-0 bg-transparent px-6 pt-4 pb-6">
              <a href={mailto(email, t.subject)} className="inline-flex items-center gap-1.5 text-[16px] font-semibold !text-primary no-underline hover:underline">
                Email about this <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  )
}
