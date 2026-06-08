# Repo Runner Onboarding

This is the first-run experience WolfeLlama should show for non-coders.

## Welcome Message

WolfeLlama helps you run GitHub projects without fighting setup instructions.

Paste a GitHub repo link, let WolfeLlama identify the project type, fill any required settings, then use the guided project controls.

## Step 1: Paste a GitHub Link

The user starts with a public GitHub project URL.

Example:

- A React app
- A Vite app
- A Next app
- A Python app
- A local AI tool
- A small open-source utility

The app should explain that private repos may require GitHub access setup later.

## Step 2: Add the Project

After the user clicks Add Repo, the project appears in the Project Library.

The user should see:

- Project name
- Project status
- Project type when detected
- Local project path when available

## Step 3: Detect the Setup

The app should identify:

- App type
- Package manager
- Setup command
- Launch option
- Preview URL if known
- Environment fields if available

## Step 4: Fill Environment Fields

If the repo needs keys or settings, the user can enter them in the Environment Fields panel.

The app should keep these tied to that project only.

## Step 5: Prepare and Launch

The user should not need to know terminal commands.

The app should show simple project controls and explain what is happening in plain English.

## Step 6: Read Plain-English Logs

Raw logs can be visible, but the main explanation should say what the issue means.

Examples:

- Missing dependency
- Missing environment value
- Port already used
- Wrong start option
- Missing file

## Step 7: Ask AI for Help

If the project fails, the user clicks Explain Logs With AI.

WolfeLlama sends the log summary to Command Room so the selected local or cloud model can explain the likely fix.

## First-Run Success Goal

A new user should be able to understand this flow in under one minute:

1. Paste repo.
2. Add project.
3. Detect setup.
4. Fill settings.
5. Start project.
6. Read simple logs.
7. Ask AI for help.

## Product Rule

Repo Runner should feel like an app launcher, not a developer terminal.
