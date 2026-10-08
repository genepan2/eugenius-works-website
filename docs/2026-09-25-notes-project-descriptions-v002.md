# Project descriptions — working file

Fill in the **Your description** block under each project. Write however you like, rough is
fine. Then we align them into the short, consistent form the website needs.

Each entry has **From the code** so you are not starting from a blank page. That part is
what the repository says, not what I think it should be.

The site wants, per project: a title, one or two sentences stating the problem it solves,
and a URL if one exists.

Mark projects you do NOT want on the site with `SKIP`.

---

## ExtraSeat

**From the code**
`/Users/eugenpanov/Code/extraseat` — Next.js, Convex, Clerk, Recall.ai. Brings AI agents
into live video calls (Meet, Zoom, Teams) as participants. Built around persistent
workspaces: knowledge packs, pre-meeting briefings, and post-meeting memories you approve
before they are kept. The problem in the brief: meeting AI agents used to start from zero
every time, so you prepared context once and it was gone. Most mature repo of the ten:
landing page, v2 pricing, e2e tests, CI. Public repo. Last commit 2026-08-25.

**Open question:** is it live at a URL people can visit?

**Your description**

```

```

---

## Hushspeak

**From the code**
`/Users/eugenpanov/Code/hushSpeak` — Tauri, React, Rust, a forked visual-speech-recognition
pipeline, LLM correction. You mouth words silently at the webcam and it types them. No
voice.

**Correction from you:** the PRD frames this around speech impairments, but that is not the
real motivation. It is for working in cafés and co-working spaces, where talking to an AI
is faster than typing but feels uncomfortable in front of other people.

Working prototype, phase 4 of 5. Private, no release. Last commit 2026-02-01.

**Your description**

```

```

---

## Tripledigit

**From the code**
`/Users/eugenpanov/Code/tripledigit` — cold outreach for small, hypothesis-driven B2B
campaigns, roughly 50–300 contacts. The differentiator is AI-generated branded product
mockups, created lazily and only with permission, so email claims stay true and mockup
spend is not wasted. Providers behind adapters: Smartlead, InboxKit, ZeroBounce, Apollo,
Exa, HubSpot. Mockups hosted on Cloudflare R2.

**From you:** this started as the system you built for your first client, then you gave it
a different shape as its own product.

**Careful:** the repo contains a real client name, in `CONTEXT.md` and
a mailbox data file. The tool can be described publicly; the client
cannot be named.

No git remote. Last commit 2026-08-01.

**Your description**

```

```

---

## BetaView

**From the code**
`/Users/eugenpanov/Code/BetaView` — photograph a climbing wall, get a high-contrast,
colorblind-safe overlay on the holds of one route. The brief states the problem directly:
people with red-green color blindness cannot reliably tell climbing holds apart by color,
and even after finding the start, following the route up is nearly impossible.

Python prototype, hold detection and colour-signature classification. No runnable app yet.
Domain planned: betaview.app. Feature work stopped 2026-08-30.

**Open question:** still alive, or stopped?

**Your description**

```

```

---

## Client A project

**From the code**
A private client repository — Python pipeline plus a Next.js dashboard
generating product images of wooden animal sculptures with Gemini: scene calibration,
style transfer, concept generation.

**From you:** not a paid client — you are paid only when it brings customers. The idea is
to grow it into a system for creative people and agencies who need images for their
clients in specific situations.

**Careful:** the repo has a live `.env` with API keys and two business databases. Private
repo. Last commit 2026-06-08.

**Open question:** does this go on the site as a product idea, under its own name, or stay
private until it has one?

**Your description**

```

```

---

## Tab Grouper

**From the code**
`/Users/eugenpanov/Code/extension-tab-grouper` — Chrome extension. Sorts open tabs into
groups automatically by classifying each tab, and closes tabs untouched for N days, with a
review and undo step.

Your most recently active repo: 14 commits in three days, last 2026-09-24. Local only, no
remote. The README says the current API-key handling is not safe for a Chrome Web Store
listing.

**Open questions:** heading for the Web Store, or a personal tool? And is
`api.typesafe.ai`, which it calls for classification, yours?

**Your description**

```

```

---

## PickleTwirl

**From the code**
`/Users/eugenpanov/Code/PickleTwirl` — a pickleball paddle catalog built from real 3D
models rather than flat photos. Blender pipeline generating a model per paddle from
manufacturer references, with a documented fidelity scale for how faithful each model is.
One paddle done so far. Public repo, nothing shipped. Last real work 2026-09-23.

**Your description**

```

```

---

## rent-the-agent

**From the code**
`/Users/eugenpanov/Code/rent-the-agent` — aggregates rental listings and automates landlord
outreach through your own WhatsApp number. The brief names the problem: finding
medium-to-long-term rentals abroad is fragmented and unreliable, and agent fees are
steep. For digital nomads and expats.

Scaffold only: two commits, extensive planning docs, almost no code. Its own brief calls it
"a functional MVP for personal use and learning." No remote. Last commit 2026-09-06.

**Your description**

```

```

---

## Get Eugenius

**From the code**
`/Users/eugenpanov/Code/get-eugenius` — Next.js and Sanity. Your freelance business site,
mid-redesign. The positioning in the docs: custom AI content production systems for small
service firms that need to publish consistently but cannot hire a content team.

Already on the site as an ordinary project entry. Active daily, last commit 2026-09-24.

**Your description**

```

```

---

## Client B project

**From the code**
A private client repository — B2B outreach and lead generation: ICP scoring,
enrichment, campaign generation, HubSpot integration. Built on n8n with Apollo, Exa, and an
LLM.

**From you:** this is where Tripledigit came from — you built the pipeline for this client
first, then reshaped it into its own product. Not paid up front; commission when it brings
customers.

**Careful:** the repo names the client throughout and holds a live `.env` and real business
data.

**Suggestion:** this probably does not want a separate entry — it is Tripledigit's origin
story, not a second product. Say if you disagree.

**Your description**

```

```

---

## Anything missing?

Projects not in the ten directories, that should be on the site:

```
# projekte · eugenius works

<!-- status: live · in arbeit · prototyp · idee · pausiert -->

## image system
**in arbeit**
bilder für blogartikel, die aus dem inhalt selbst entstehen.
die meisten artikelbilder sind entweder generische stockfotos oder beliebige ki-generierungen, die nichts mit der marke zu tun haben. das image system arbeitet anders: ein template wird einmal gestaltet, seine elemente sind an eigenschaften des inhalts gebunden. jeder neue artikel ergibt so ein eigenes bild, das trotzdem immer zur visuellen identität passt – komponiert, nicht zufällig generiert.

## get eugenius
**in arbeit**
meine freelance-marke für visuelle identität im blog.
unternehmen, die regelmäßig veröffentlichen, bekommen für jeden artikel ein eigenes motiv in fester bildsprache, fertig für alle formate. technisch basiert das auf dem image system.

## extraseat
**live**
ki-experten, die als teilnehmer in echte videocalls kommen.
kleine firmen und startups brauchen oft fachwissen – marketing, recht, finanzen –, können sich aber keinen dauerhaften experten leisten. mit extraseat lädt man einen ki-experten in ein google-meet-call ein. er hört zu, denkt mit und antwortet in echtzeit, zusammen mit dem bestehenden team.

## pickletwirl
**in arbeit**
pickleball-schläger zum drehen, vergleichen und entdecken.
ein katalog, in dem jeder schläger als 3d-modell im browser gedreht werden kann – der "twirl", den jeder spieler kennt. dazu specs zum vergleichen und welche profis mit welchem schläger spielen.

## betaview
**prototyp**
kletterrouten sichtbar machen für farbenblinde.
mit rot-grün-schwäche ist es in der boulderhalle oft kaum möglich, die griffe einer route zu erkennen. betaview markiert auf einem foto der wand alle griffe derselben route, nachdem man einen davon angetippt hat – in farben, die auch farbenblinde klar unterscheiden.

## rent the agent
**in arbeit**
wohnungssuche in facebook-gruppen, strukturiert.
in vietnam läuft die wohnungssuche großteils über facebook – unübersichtlich, voller duplikate und makler. die chrome-extension filtert den feed nach relevanten angeboten, speichert sie und bewertet makler danach, wie gut ihre angebote wirklich sind.

## hushspeak
**pausiert**
diktieren, ohne dass jemand mithört.
spracheingabe ist schneller als tippen, aber im café will man nicht, dass alle zuhören. hushspeak soll sprache über die webcam erkennen – per lippenlesen statt mikrofon.

## tab grouper
**in arbeit**
ordnung in zu vielen offenen tabs.
eine chrome-extension, die offene tabs per klick mit ki in feste gruppen sortiert, duplikate schließt und alte tabs aufräumt.

## soundcloud playlist tool
**idee**
playlists nach eigenen regeln.
eine chrome-extension für soundcloud, mit der man die regeln für playlists selbst definiert: neue zusammenstellen, bestehende aufräumen, duplikate und tote tracks entfernen, große playlists aufteilen.

## triple digit
**idee**
kaltakquise mit dem ziel 100 % conversion.
eine agentur-idee rund um automatisierte, individuelle outreach-kampagnen – aufgebaut auf erfahrungen aus einer bestehenden kaltakquise-engine.

## llm finetuning
**idee**
ein sprachmodell, das in meinem stil schreibt.
ein gemeinsames experiment mit einem anderen indie hacker: ein llm auf eigene texte feintunen.
```

