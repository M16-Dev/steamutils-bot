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
- `deno task format` - Format code
- `deno task format:check` - Check formatting without making changes
- `deno task lint` - Run linter
- `deno task test` - Run tests
- `deno task check` - Run format check, linter, and tests (all at once)
- `deno task install-hooks` - Install Git pre-commit hooks

## Pre-commit Hooks

After installing hooks (`deno task install-hooks`), the following will run
automatically before each commit:

- ✅ Format check
- ✅ Linter
- ✅ Tests

If any of these steps fail, the commit will be blocked.
