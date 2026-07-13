# Chat History Archive

Raw Claude Code session transcripts (`.jsonl`) copied from
`~/.claude/projects/C--Users-OWNER-Documents-script-workspace-poolmind/`
so they travel with this project folder when it moves to another machine.

## Restoring on a new computer

Claude Code maps sessions to a folder under `~/.claude/projects/` based on the
absolute path you launch `claude` from. To make these resumable again after
moving:

1. Open this project in the new location and run `claude` once (any command)
   so Claude Code creates its own `~/.claude/projects/<new-path>/` folder.
2. Copy the `.jsonl` files from here into that new folder.
3. Run `claude --resume <session-id>` (the filename without `.jsonl`), e.g.:
   ```
   claude --resume dda13920-f5f1-47af-900a-9af10c938122
   ```

These are just archival copies — editing or deleting them here has no effect
on the live sessions under `~/.claude/projects/`.
