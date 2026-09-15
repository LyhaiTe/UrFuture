# Skills Specification

## Implemented data

`Skill` stores a unique name, category, and optional O*NET element ID.
`UserSkill` links a student and skill, stores proficiency, verification source,
and update time, and prevents duplicate evidence rows for the same source.

## Implemented behavior

Quiz evaluation writes quiz-derived skill proficiency. Knowledge retrieval exposes
student skill context to recommendation and chat prompts. The radar component
renders the current skill profile.

## Current limitation

A dedicated public skill-management API and automated transcript-to-skill
inference endpoint are not currently implemented.
