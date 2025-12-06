---
title: "Dev Journal"
description: "My Developer logbook"
date: "2025-12-03"
image: "/images/dev_journey.png"
tags: ["Dev Log", "AI"]
author: "ViSuReNa"
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
![Dev Log 2025-12-05](/images/dev_log_20251204.png)

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