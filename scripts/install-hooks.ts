// Install Git hooks

console.log("Installing Git hooks...");

// Read the pre-commit script
const preCommitContent = await Deno.readTextFile("scripts/pre-commit");

// Write to .git/hooks/pre-commit
await Deno.writeTextFile(".git/hooks/pre-commit", preCommitContent);

// Make it executable (on Unix systems)
if (Deno.build.os !== "windows") {
  await Deno.chmod(".git/hooks/pre-commit", 0o755);
}

console.log("✅ Git hooks installed successfully!");
console.log(
  "The pre-commit hook will now run format, lint, and tests before each commit.",
);
