@AGENTS.md

## Claude Code notes

### Figma MCP

- The connected Figma MCP is the **cloud** server (`claude_ai_Figma` tools), not the desktop one. The user is on Linux, which has no Figma desktop app.
- The cloud server can still see the user's current selection: `get_metadata` on any node of the file starts with a "Currently selected nodes" list. "Check what I selected" works if the user sends a link to the file.
- `get_metadata` on the whole page (`0:1`) is huge (the page holds ~40 reference images). Query the specific frame nodes instead.
- Before calling `get_design_context`, read `skill://figma/figma-design-to-code/SKILL.md` from the Figma MCP resources. Pass `skillNames: "resource:figma-design-to-code"`.
- `get_design_context` returns React and Tailwind code. Use it only for numbers (positions, sizes, fonts, colours, blend modes), then translate them into the canvas templates. Download SVG assets with `curl -L` into `public/assets/svg/`, because asset URLs expire after 7 days. Don't download the photo PNGs; the photos are user content.
- All the user's Figma teams are on the Starter plan, which has low MCP rate limits. Batch calls, and don't re-fetch what's already in the code.
