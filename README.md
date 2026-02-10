# Steam Bot

Discord bot for Steam integration.

## Setup for New Developers

### 1. Clone the repository

```bash
git clone https://github.com/M16-Dev/steam-bot.git
cd steam-bot
```

### 2. Configure environment variables

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### 3. Install Git hooks

To automatically run formatting, linting, and tests before each commit:

```bash
deno task install-hooks
```

### 4. Run the project

```bash
deno task dev
```

## Available Commands

- `deno task dev` - Run in development mode with hot-reload
- `deno task start` - Run in production mode
- `deno task deploy` - Deploy slash commands to Discord
- `deno task format` - Format code
- `deno task format:check` - Check formatting without making changes
- `deno task lint` - Run linter
- `deno task test` - Run tests
- `deno task check` - Run format check, linter, and tests (all at once)
- `deno task install-hooks` - Install Git pre-commit hooks

## Architecture

### 📁 Project Structure

```
src/
├── commands/               # Slash commands (auto-loaded)
│   ├── ping.ts
│   └── general/
│       └── ping2.ts
├── events/                 # Discord events (auto-loaded)
│   ├── ready.ts
│   └── interactionCreate.ts
├── components/             # Interactive components (auto-loaded)
│   ├── buttons/
│   ├── modals/
│   └── select-menus/
├── interactionHandlers/    # Interaction logic grouped and exported to functions for reuse  
├── services/               # APIs and business logic
├── utils/                  # Helper functions
├── types/                  # TypeScript type definitions
├── loaders/                # Auto-loading system
└── bot.ts                  # Main bot class
```

### Adding New Features

#### Create a Slash Command

Create a file in `src/commands/`:

```typescript
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("mycommand")
        .setDescription("My command description"),

    async execute(interaction) {
        await interaction.reply("Hello!");
    },
} satisfies Command;
```

Then deploy: `deno task deploy`

#### Create an Event Handler

Create a file in `src/events/`:

```typescript
import type { Event } from "../types/event.ts";

export default {
    name: "messageCreate",

    async execute(message) {
        // Handle the event
    },
} satisfies Event<"messageCreate">;
```

#### Create a Component (Button, Modal, etc.)

Create a file in `src/components/buttons/`:

```typescript
import type { Component } from "../../types/component.ts";

export default {
    customId: "my-button",

    async execute(interaction) {
        await interaction.reply("Button clicked!");
    },
} satisfies Component;
```

You can also use MessageComponentCollectors for creating actions for components without defining them in /components. In such case, remember to prefix their
customID with '$' to mark them as handled locally by MessageComponentCollector and to implement rate limiting.

All files are automatically loaded on bot startup!

## Pre-commit Hooks

After installing hooks (`deno task install-hooks`), the following will run automatically before each commit:

- ✅ Format check
- ✅ Linter
- ✅ Tests

If any of these steps fail, the commit will be blocked.
