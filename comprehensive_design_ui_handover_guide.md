# Design UI handover guide

How to hand the fotomoko UI design over from Figma to an AI agent (Claude Code, through the Figma MCP), including notes, states and animation.

The canvas templates already follow this flow (see `figma.md`). This guide covers the app UI around them: camera, capture, review, export.

## How the agent reads Figma

The agent gets a Figma node two ways:

- **Layer tree:** every layer with its type, name, text, position, size, colours, fonts and auto layout settings. Numbers are copied from here, never eyeballed.
- **Screenshot:** a picture of the node, used as the visual target and to read things the tree doesn't explain (like what an arrow points at).

What that means in practice:

| Thing | Can the agent read it? |
| --- | --- |
| Frames, auto layout, components, text layers | Yes, exactly |
| Colour / text styles and variables | Yes, as tokens |
| Sticky notes and text notes | Yes, if they're real text (not an image of text) and inside the linked node |
| Numbered markers (①②③) | Yes, matched by eye in the screenshot |
| Arrows | Partly. Seen in the screenshot only; crowded or crossing arrows can be misread |
| Anything outside the linked node | No. Notes floating next to a frame on the canvas are invisible |
| Prototype playback, screen recordings, video | No |
| Dev Mode annotations | Probably not (likely needs a paid plan, and unclear if the MCP passes them) |

The Figma teams are on the **Starter plan**, which has low MCP rate limits. Fewer, well-scoped links mean fewer calls.

## Setting up the Figma file

1. **A UI page.** Put all UI screens on their own page (e.g. **UI**), like the templates live on **Frames**. The agent maps it once in `figma.md`.
2. **One Section per screen.** Put each screen and its notes together in a Figma Section. Linking the section returns the design and the notes in one call.
3. **Phone first.** One phone-width frame per screen. Add a desktop frame only where the layout actually changes.
4. **Keep frames reasonably sized.** A very large frame comes back as an outline only, and each part then needs its own call.
5. **Auto layout everywhere in the UI.** Auto layout becomes flex with gaps and padding, which turns into responsive CSS. Without it the agent only gets absolute x/y positions (fine for the canvas templates, bad for a UI that has to fit many screens).
6. **Components and variants** for anything repeated: buttons, the template picker, inputs, toggles. Each component becomes one Svelte component. Put states (default, pressed, disabled, selected) in variants so they get built rather than guessed.
7. **Colour and text styles (or variables).** These become CSS variables instead of hex values copied one by one.

## Naming layers

Node ids are the real keys (they never change on rename), so names don't change the numbers the agent copies. Naming still helps in a few places:

- **Worth naming:**
  - Screens and sections: they become the headings in `figma.md` and how we talk about them.
  - Components: the name becomes the Svelte component name (`ShutterButton`, not `Frame 427`).
  - Parts with a job: `photo-slot`, `countdown`, `retake`. When a frame is too big and comes back as an outline, the agent picks which parts to fetch by name.
  - Anything that animates between states (see [Motion](#motion)): same element, same name in every frame.
- **Not worth it:** every rectangle, vector or wrapper group.

## States

Design the states, not just the happy path. Anything not designed gets invented. For fotomoko the important ones are:

- before camera permission is asked
- camera denied
- no camera found
- camera in use by another app (`NotReadableError`)
- no photos yet
- countdown / mid-capture
- review (retake, keep)
- exporting / download ready

Lay a flow out **left to right inside its section**, one frame per state, with a one-line label above each frame (e.g. `idle → countdown → captured → review`).

## Notes and annotations

Sticky notes work, with a few rules so the agent reads them reliably:

1. **Keep notes inside the screen's section**, never loose on the canvas.
2. **Use numbered markers instead of (or alongside) arrows.** Put a small numbered dot (①②③) on the element and a matching numbered note beside the frame. If you keep arrows for the team, keep them short and not crossing.
3. **Name the element in the note**, so it works even if an arrow is off:
   > ② ShutterButton: hold to burst-shoot 4 photos
4. **Plain text only**, no screenshots of text.
5. **Long logic goes in chat or the repo.** Edge cases, rules and "what if" behaviour are often clearer as text in the chat, in `backlog.md`, or in `motion.md` for animation.

## Motion

Animation is not built in Figma. Figma holds the still states; the motion is written as code.

### Division of work

- **Figma:** the start and end states as still frames, with matching layer names for elements that persist between them.
- **Spec:** the motion between states, written like anime.js (v4) in `motion.md`.
- **Browser:** the agent builds it, you try it and react, the agent tunes it. Most of the real motion design happens here.

### Spec format

Write it like anime.js v4. Use the **Figma layer names** as targets, since the HTML doesn't exist yet. Put the trigger and everything code can't express in comments.

```js
// capture → review
// trigger: last photo taken. Tapping during it: skip to the end.
createTimeline({ defaults: { ease: 'outExpo' } })
  .add('shutter', { scale: [1, 0.6], opacity: [1, 0], duration: 200, ease: 'inQuad' })
  .add('photo-strip', { y: ['100%', 0], duration: 450, ease: 'outBack(1.3)' }, '<<')
  .add('photo-slot', { scale: [0.8, 1], opacity: [0, 1], delay: stagger(90) }, '-=200');
```

- **It doesn't have to run.** Pseudo-code is fine; the agent checks the real API when building.
- **Rough numbers are fine.** `duration: 400 // ish, should feel weighty`: the number is a starting point, the comment is what matters.
- **Comments cover what code can't:**
  - the trigger
  - what happens if the user taps mid-animation (skip, reverse, ignore)
  - whether an element enters or leaves the page completely, or just moves
- **Global rules save time.** `// all buttons: scale 0.95 on press, 100ms` covers every button.
- **Words work too.** If you don't have numbers, describe the feel ("snappy", "bouncy", "like a receipt printing", "like the iOS camera thumbnail") and the agent picks values.

### Easing vocabulary

| Word | anime.js | Feel / use |
| --- | --- | --- |
| ease out | `outQuad`, `outExpo` | fast start, gentle stop. Things arriving |
| ease in | `inQuad` | slow start, fast exit. Things leaving |
| ease in-out | `inOutQuad` | smooth both ends. Things moving within the screen |
| overshoot / back | `outBack(1.3)` | goes a little past, then settles. Playful |
| spring | a spring ease (name depends on the anime.js version) | bouncy and physical |
| stagger | `delay: stagger(90)` | same animation on several items, a little apart |

### `motion.md`

One code block per transition, in the format above. It's the motion equivalent of `figma.md`: the reference that stays up to date as values get tuned, so nothing lives only in chat history.

### Tuning loop

1. The agent builds a transition from the spec and says what it picked ("slide 450ms, `outBack(1.3)`, photos 90ms apart").
2. You try it in the browser and react in plain language: "too slow", "less bounce", "photos should start before the strip lands".
3. The agent adjusts and updates `motion.md`. Repeat until it feels right.

Optional: a dev-only tuning panel on the test bench (sliders for speed, bounce, stagger). You tweak until it feels right, and the values get locked in.

### Implementation commitments

- **anime.js needs a yes first.** It's a runtime dependency, and `AGENTS.md` asks for approval before adding one. v4 is modular, so only the parts used get shipped. Svelte's built-in transitions (no extra cost) can cover simple fades and slides, with anime.js for the choreographed sequences.
- **All timings in one place.** Every duration and easing is a named value in one file, tunable without hunting through components.
- **Phone-friendly.** Animate only transform (position, scale, rotation) and opacity, which stay smooth on mid-range phones. Keep iOS Safari quirks in mind.
- **Reduced motion.** When the phone is set to reduce motion, big transitions get shortened or skipped.

## Sending a screen over

1. Copy the link to the screen's **Section** (right-click → Copy link; it includes the `node-id`).
2. Say whether it's final or still in progress.
3. Add a sentence or two in chat on anything not in the notes, and the motion spec if there is one.
4. The agent pulls it, reports what it could and couldn't read, and updates `figma.md`.

For the first screen, the agent reports back on how well the notes came through, and this guide gets adjusted from there.

## Checklist

- [ ] Screen is on the UI page, inside its own Section
- [ ] Phone-width frame (desktop only if the layout changes)
- [ ] Auto layout used
- [ ] Repeated pieces are components; states are variants
- [ ] Colours and text use styles or variables
- [ ] Components and important parts have real names
- [ ] Persistent elements share a name across state frames
- [ ] Error and empty states designed
- [ ] Notes are text, inside the Section, with numbered markers
- [ ] Motion spec written in `motion.md` (or chat) for each transition
- [ ] Link sent, with final / in progress noted
