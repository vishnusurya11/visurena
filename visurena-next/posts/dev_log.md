---
title: "Dev Journal"
description: "My Developer logbook"
date: "2025-12-03"
image: "/images/dev_journey.png"
tags: ["Dev Log", "AI"]
author: "ViSuReNa"


---
# [2025-12-07] - Laying Groundwork for the AI Dev Team

Tonight I accidentally started a second project while working on Palimpsest.

This began as a simple “quality of life” thing: I didn’t want to keep manually creating epics and tasks in GitHub. I just wanted a clean way to define all of Palimpsest’s work in one place and have it show up properly on the board.

But as I was wiring it up, I realised this is actually the first brick of something much bigger: an AI software development team that can plan, organize, break down work, finish tasks, and deliver the product I asked for.

The idea is simple:

- I don’t want to micromanage prompts.
- I want agents to handle **small, clear tasks**, not “build the entire project.”
- I want them to work **in parallel**, like real software engineers in a team.
- GitHub already has the structure for that: epics, stories, tasks, subtasks, status, history.

So I built some groundwork:

- All work is defined in a single YAML file.
- Each item has a stable ID like:
  - `PALI-E1` – Epic  
  - `PALI-E1-S1` – Story  
  - `PALI-E1-S1-T3` – Task  
  - `PALI-E1-S1-T3-ST2` – Sub-task  
- A Python script reads the YAML and:
  - Creates or updates GitHub issues for every epic, story, task, and sub-task  
  - Keeps titles and descriptions in sync with YAML  
  - Adds labels like `Epics`, `Stories`, `Tasks`, `Sub-tasks` plus `E1`, `S1`, `T3`, `ST2`, and `P0/P1/P2`  
  - Uses GitHub’s sub-issue API so epics own stories, stories own tasks, and tasks own subtasks in the Sub-issues panel  

Right now it “only” does planning: it turns a config file into a structured board. No agents are running yet. But this is exactly the kind of skeleton an AI dev team will need later:

- Clear hierarchy of work  
- Stable IDs  
- Machine-friendly labels  
- A place to plug in agents that can say: “Give me all `Tasks` in `E1` with priority `P0`” and just start working.

For now, I’m treating this as a **detour**, not a full pivot. Palimpsest is still the main project, and I’ll keep building it manually and semi-manually on top of this structure.

But I see the potential now.
![Dev Log 2025-12-07](/images/dev_log_20251207.png)
Once Palimpsest P0 is done, I want to come back to this and turn it into its own project: an AI-powered software development team where I describe the product I want, the system plans and breaks it down into work, agents pick up tasks, and GitHub becomes the shared brain and history of everything we’ve built.

Today’s win: I laid the tracks. Just a YAML-driven issue generator on the surface—but underneath, it’s the first step toward that future team.

---
# [2025-12-06] - From Plan to Epics, Stories, and Subtasks

I’ve spent a lot of time procrastinating—watching YouTube videos about new tech and LLM models instead of actually building anything. It always felt like I was “researching” or “planning,” but in reality I was just orbiting the work, not doing it.

Now that I have a concrete plan for Project Palimpsest, I finally have something solid to anchor myself to. Even if the plan is partially outdated in a few months, it will still do its job: give me a direction, a sequence, and a way to see progress. Once I turn this into tasks on GitHub, I’ll be able to open the board and instantly see where I am and what comes next. That alone should help me move from dreaming and procrastinating to actually shipping things. And if everything goes well, the cherry on top would be using this work to land a new job.

For Palimpsest, the next step is to translate the high-level phases into actual work items. My current approach is to start with one epic for each combination of phase and maturity level—P0, P1, and P2 for every phase—so I have fifteen starting epics. Under each epic, I’ll add concrete stories and subtasks that describe what needs to be built, tested, or experimented with. It’s the same way teams do it in real software development: begin with big shapes, then break them down as reality shows you what’s harder, messier, or more interesting than it looked on paper.

I know that as I go deeper, I’ll discover gaps in my plan. Some epics will need to be split, some stories will turn into entire mini-projects, and new subtasks will appear that I couldn’t have predicted from the outside. That’s fine. Today’s job isn’t to get it perfect—it’s to get the work out of my head and into a system where I can see it, track it, and push it forward one small piece at a time. The day isn’t over yet, and I’ll keep adding to this as I refine how Palimpsest turns from an idea into an actual, working pipeline.

## Draft Epics for Project Palimpsest
![Dev Log 2025-12-06](/images/dev_log_20251206.png)
For tracking, I’m going to use **PALI** as the prefix for everything related to this project.

### ID Structure (for future me)

I’m standardising everything around **Epic / Story / Task** in the ID itself:

- **Epic:** `PALI-EX`  
  - `X` = epic number  
  - Example: `PALI-E2`
- **Story:** `PALI-EX-SY`  
  - `X` = epic number  
  - `Y` = story number under that epic  
  - Example: `PALI-E2-S1`
- **Task/Subtask:** `PALI-EX-SY-TZ`  
  - `X` = epic  
  - `Y` = story  
  - `Z` = task under that story  
  - Example:  
    - `PALI-E2-S1-T1: Write wants/needs prompt`  
    - `PALI-E2-S1-T2: Parse JSON output`  
    - `PALI-E2-S1-T3: Validate across 3 books`

So if I see something like `PALI-E4-S2-T5`, I’ll know it’s:

- Task `T5`  
- under story `S2`  
- under epic `PALI-E4`

### Initial Epic List

Here’s the first set of epics I’m planning to create, mapped to the phases and P0/P1/P2 levels from the Palimpsest plan:

| Epic ID   | Phase / Level          | Working Title                                              |
|-----------|------------------------|------------------------------------------------------------|
| PALI-E1   | Phase 1 – P0           | Codex Ingestion Backbone (MVP)                                    |
| PALI-E2   | Phase 1 – P1           | Autonomous Library Harvester                              |
| PALI-E3   | Phase 1 – P2           | Omni-Format Codex Engine (HTML, PDF, etc.)                |
| PALI-E4   | Phase 2 – P0           | Summary Video Rail (MVP)                                  |
| PALI-E5   | Phase 2 – P1           | Timeline & Deep-Dive Analysis Tracks                      |
| PALI-E6   | Phase 2 – P2           | Visual & Audio Experimentation Playground                 |
| PALI-E7   | Phase 3 – P0           | Close Adaptation Layer (BBC-Style Remixes)                |
| PALI-E8   | Phase 3 – P1           | Adaptive Rewrite & Structural Variations                  |
| PALI-E9   | Phase 3 – P2           | New-Myth Retellings (Hamlet / Lion King / Baahubali Mode) |
| PALI-E10  | Phase 4 – P0           | New Story → Screen Pipeline (MVP)                         |
| PALI-E11  | Phase 4 – P1           | Analysis & Timelines for Generated Stories                |
| PALI-E12  | Phase 4 – P2           | Alternate Cuts, Tones & Commentary Layer                  |
| PALI-E13  | Phase 5 – P0           | Core Marketing Loop & Promo Snippets                      |
| PALI-E14  | Phase 5 – P1           | Performance & Sentiment Insight Hub                       |
| PALI-E15  | Phase 5 – P2           | Adaptive Feedback-Driven Strategy Engine                  |


And just to anchor the structure in my head, here’s a small concrete example of how I expect to break things down under one epic:

- `PALI-E1` – Codex Ingestion MVP  
  - `PALI-E1-S1` – Parse chapters from a single HTML source  
    - `PALI-E1-S1-T1` – Implement basic HTML loader  
    - `PALI-E1-S1-T2` – Detect chapter boundaries  
    - `PALI-E1-S1-T3` – Write Codex JSON to disk  

I don’t need to freeze this forever, but having a stable naming pattern now means future me can glance at an ID and instantly know which part of Palimpsest it belongs to, instead of having to dig through descriptions every time.

- **Repo:** [vishnusurya11/palimpsest](https://github.com/vishnusurya11/palimpsest)  
- **Project board:** [Palimpsest – PALI Board](https://github.com/users/vishnusurya11/projects/11)

I’ve also created a small sync script that reads from a YAML config file and automatically creates/updates **Epics**, **Stories**, **Tasks**, and **Sub-tasks** in the GitHub project. The YAML file is the single source of truth; running the script keeps the board aligned with the current structure and naming scheme.



---
# [2025-12-05] - Planning the Journey

Okay, time to plan my first proper project.

The idea is to take public domain books, break them down to extract character arcs and story structure, use that to generate summary and analysis videos, and then build new stories on top of those same underlying beats. Think BBC’s modern Sherlock: the setting and surface details are updated, the characters feel different, but the core mystery beats are still drawn from the original stories.

Another way to frame it is the shared narrative DNA between **Hamlet**, **The Lion King**, and **Baahubali**. On the surface they’re completely different—one is a Shakespearean tragedy, one is a Disney animation, and one is a massive Indian epic—but they’re all built on a very similar spine: a noble king, a jealous uncle, a prince forced into exile, and a return to reclaim the kingdom.

Here’s the pattern in a more concrete way:

| Story Element         | Hamlet                    | The Lion King        | Baahubali                            |
|----------------------|---------------------------|----------------------|--------------------------------------|
| Good king            | King Hamlet               | Mufasa               | Amarendra Baahubali                  |
| Usurping uncle       | Claudius                  | Scar                 | Bhallaladeva                         |
| Exiled / hidden heir | Hamlet sent away          | Simba in self-exile  | Mahendra Baahubali raised in hiding  |
| King’s murder        | Claudius kills the king   | Scar kills Mufasa    | Bhallaladeva engineers Amarendra’s death |
| Return and climax    | Hamlet’s tragic revenge   | Simba reclaims Pride Rock | Mahendra returns to reclaim Mahishmati |

That’s the kind of structural echo I want to capture: same bones, new body.

## Project Palimpsest
![Dev Log 2025-12-05](/images/dev_log_20251205.png)

I’m calling this **Project Palimpsest**.

A palimpsest is an old manuscript page that’s been scraped or washed so it can be written on again, but traces of the original text still show through underneath. That’s exactly what I’m trying to do here: write new stories on top of existing ones, with the old structure still faintly visible beneath the surface. It also matches where I am right now with AI—I'm not a master storyteller or model whisperer yet, so instead of pretending I know everything, I’m leaning on proven foundations: classic stories, solid structure, and clear bones. I want to use those as training wheels while I learn the craft.

For every phase, I’ll work in three passes: **P0, P1, and P2**.

- **P0** – The smallest end-to-end version that actually works. It proves the idea and gets something usable on screen.  
- **P1** – Make it solid and practical: better features, some automation, cleanup, and closing obvious gaps.  
- **P2** – Stretch goals and experiments: alternate approaches, wild ideas, and longer-term upgrades.  

The plan is simple: finish P0 for all phases, then loop back for P1, then P2.

## Phase 1 – Building the Codex

P0 is all about turning raw books into structured data. I’ll keep a list of books in a SQLite table. Each row will point to the HTML files already downloaded to a given path, along with any metadata I care about. The pipeline will walk that table, read each book, figure out where the chapters are, how many there are, and how the book is structured. Agents will then extract every chapter into a single **Codex JSON** file for that book.

Once the Codex exists, more agents enrich it with chapter summaries, character arcs, character wants vs needs, story structure, timelines, and any other useful metadata. The goal is that, by the end of Phase 1 P0, every book in the SQLite table has a complete Codex file sitting next to it.

P1 is about getting rid of the manual glue around that. Instead of me downloading HTML files and inserting rows into SQLite by hand, I want a small tool or agent that can fetch public domain books, drop the files into the right path, and register them in the table automatically.

P2 will expand beyond plain HTML. Once things are stable, I want the same pipeline to handle PDFs and other formats so I’m not stuck with only one kind of input.

## Phase 2 – Summary & Analysis Videos

Phase 2 takes the Codex files from Phase 1 and turns them into videos. For P0, the focus is on short, summary-style videos—something much lighter than a full audiobook. The flow is: read the Codex, script a tight summary, generate image prompts for key scenes and locations, convert the script to audio (for example, using Comfy), and then stitch images and audio into a watchable video.

From the same Codex, the system will also generate character visuals and settings, then use an image model to check that everything looks consistent. Once that works, the finished videos go up on YouTube.

For P1, I want to move beyond simple summaries and start leaning on the structural data inside the Codex: timeline videos that follow the story across time, character-focused breakdowns, and story-structure analysis videos.

P2 is where I start playing with different models, art styles, and formats to see what actually looks good on-screen and fits the tone of each story.

## Phase 3 – Generating New Stories

Phase 3 is where the system stops just explaining stories and starts creating them.

In P0, I want to stay very close to the original—almost a **BBC Sherlock–style remix**. The same core cast, the same basic setting, and the same major plot beats stay intact, but the execution shifts. Scenes can be tightened, reordered, combined, or split. Dialogue can be updated. Some moments get more focus, some get trimmed. It should still be very clear which original story it came from; it’s basically a sharper, modernized telling rather than a new myth.

P1 pushes a little further away from the source while still feeling like “the same story.” Here I can start bending character motivations, swapping the order of key events, or changing the outcomes of smaller subplots, as long as the emotional spine and core arc remain recognisable. On top of that, P1 is also where the usual refinement happens: revision passes, feedback (from agents or humans), and multiple rewrites so it reads like a deliberate adaptation, not just a straight retelling.

P2 is where I go full **Hamlet / Lion King / Baahubali mode**—keeping the narrative DNA but changing almost everything on the surface. New world, new cast, new genre if needed, and a very different aesthetic, while still following the same deep structure: the same kinds of promises, turns, and payoffs hidden inside a completely different shell. If P0 is “this is clearly the same case,” then P2 is “you’d only notice the connection if you know how to look for it.”

## Phase 4 – Adapting the New Story to Video

Phase 4 mirrors Phase 2, but now the input is the new story from Phase 3 instead of the original book. In P0, the pipeline generates character designs, environments, and key scenes, turns the new script into audio, and assembles full narrative videos for this fresh version of the story.

For P1, I want to treat the AI-created story with the same seriousness as the original, so it also gets timeline videos, character breakdowns, and structure and theme analysis.

P2 is where I can get weird: alternate cuts, different tones, or even “commentary” style videos that talk through how the AI made its choices and how the new story diverges from the original.

## Phase 5 – Marketing and Feedback

Phase 5 is about making sure this stuff doesn’t just live on my hard drive. P0 sets up a simple marketing loop: generate shorts and other promo formats and post them on X, YouTube, and other platforms to point people toward the full videos.

In P1, I want to track what actually happens after publishing: which videos get watched, how long people stay, what they comment, and what the overall sentiment looks like. That feedback should eventually feed back into how stories are chosen, structured, and presented.

P2 will be about evolving that loop—tuning the whole system based on what’s actually working instead of what just sounds good in my head.

## What Comes Next

This is the current plan for Project Palimpsest. The next step is to sit down with ChatGPT, Claude, and Gemini and break all of this into epics, milestones, stories, and subtasks in a GitHub Project. If I can get it out of my head and into a board, I’ll have nowhere left to hide behind “planning” and will actually have to build the thing.

---

# [2025-12-03] - Day 1

I feel like I’ve been falling behind lately. I keep dreaming big, planning huge ideas, and then procrastinating so much that it feels like I’m not moving anywhere at all. There’s so much to explore in AI, and the more I think about it, the more I realize that nothing will happen unless I actually sit down and build.

So today, I’m starting this dev log journal. Not for perfection—just to keep myself accountable. I want to track my progress, my experiments, my failures, and those rare moments where something finally clicks. I’m done just imagining the future I want. From today onward, I’m going to create it.
This is the first step. Day 1. Let’s go.

A big part of what held me back is perfectionism. I have so many ideas, but I keep waiting on them, thinking the output needs to be perfect from the start. I’ve been too afraid to fail, and that fear has already cost me so much time. So I’ve decided to be consistent instead. Quality will come with practice.

I’ve always been inspired by storytellers—especially Brandon Sanderson. His worldbuilding, his characters, his ability to pull readers into entire worlds… I want to do that too. I want to tell stories that make people feel something.

But the truth is, I’ve never written a story in my life. So when I turned to AI, hoping it would help, the results weren’t great. I tried uploading public-domain stories with text-to-speech, but the comments came fast—people calling the outputs sloppy, hating on AI. At first, it bothered me, but I think I understand why. These classic books already have a legacy. People know them, love them, expect something specific from them. When AI doesn’t match that expectation, they instantly reject it.

That made me realize the importance of setting expectations. I learned this from filmmaker S. S. Rajamouli—his dedication to mastering new skills and shaping them into powerful storytelling really inspires me. His mindset stuck with me.

When I tried generating my own stories, they were still terrible. But my engineering brain immediately went: “There has to be a structure behind everything.” And it’s true. Everything has a formula, a pattern, a rhythm. Stories follow structure. Math is patterns—and I’ve always been good at math. I enjoy patterns. So I want to bring that same structured thinking into storytelling with AI.

I’m also heavily inspired by the modern BBC Sherlock series. Steven Moffat and Mark Gatiss took classic Sherlock stories, placed them in modern-day London, shifted the plots just enough to surprise people, and still preserved the essence of the characters. I loved that. And Steven Moffat’s work on Doctor Who meant a lot to me too. His ability to tell emotional, self-contained stories inside short episodes really shaped how I think about storytelling. It made me want to do something similar—tight, meaningful, episodic stories that still feel big.

That’s exactly what I want to do with public-domain books. I want to study the stories people already love, extract the plot points, change the settings, reshape the characters, twist the arcs, and then create something completely different—even if the foundation comes from an older story.

That’s where I’m starting this journey.
Next step: figure out how to actually do it.