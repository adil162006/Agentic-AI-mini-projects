# Chatbot with Multiple Tools

A small interactive chatbot proof-of-concept that demonstrates how to integrate and orchestrate multiple helper tools in a conversational agent workflow. This repository contains a Jupyter Notebook demo showing example flows (search, code execution, file operations, and chaining tools) to enrich chat responses and enable multi-step task completion.

## Features

- Notebook-driven demo for an agentic chatbot that uses multiple tools.
- Example flows for: information lookup, tool orchestration, and simple task automation.
- Lightweight and easy to run locally via Jupyter Notebook.

## Prerequisites

- Windows, macOS, or Linux
- Python 3.9+ (3.10 recommended)
- pip

If you plan to run in a virtual environment (recommended):

PowerShell:
```powershell
python -m venv .venv; .\\.venv\\Scripts\\Activate.ps1
```

## Installation

1. Clone or download this repository.
2. (Optional) Create and activate a virtual environment (see above).
3. Install dependencies:
```powershell
pip install -r requirements.txt
# If no requirements.txt exists, install typical notebook packages:
pip install jupyterlab notebook ipykernel numpy pandas ipywidgets
```

> Note: If you add extra helper tools or libraries to the notebook, update `requirements.txt` accordingly.

## Quickstart — run the notebook

Open the project folder in a terminal and start Jupyter:

PowerShell:
```powershell
jupyter lab
# or
jupyter notebook
```

Then open `chatbotwithmultipletools.ipynb` in the browser and run the cells sequentially.

## What’s inside

- `chatbotwithmultipletools.ipynb` — Main demonstration notebook. Contains example code, explanations, and demos showing how to combine multiple tools in a chatbot workflow.
- `README.md` — Project README (this file).
- `requirements.txt` — Python dependencies for the demo (created/updated by the project owner).
- `CONTRIBUTING.md` — Simple contributing guidelines.
- `LICENSE` — Project license (MIT by default).

## Example usage

Inside the notebook you'll find example flows such as:
- Prompting the agent to search local data or call a helper function.
- Chaining tools (e.g., search -> summarize -> generate output).
- Running safe code snippets in an isolated environment (if enabled).

Each example is annotated and intended to be self-contained for learning and experimentation.

## Development notes

- Keep experiments in separate notebook cells so it's easy to re-run or reuse.
- If you add new tools or helper scripts, add their installation instructions to `requirements.txt` and document usage in the notebook.
- For reproducible demos, consider pinning dependency versions in `requirements.txt`.

## Contributing

Contributions are welcome! Please:

1. Fork the repo.
2. Create a branch (e.g., `feature/new-tool`).
3. Add your changes and update the notebook documentation.
4. Open a pull request describing your change.

If you'd like me to open a PR template or add CI checks, tell me what provider (GitHub Actions, etc.) you prefer.

## License

This repository includes an `LICENSE` file. By default a permissive MIT license is added — change the owner/year as needed.

---

If you want, I can also:
- Commit these files into the repository for you.
- Update the `LICENSE` owner name.
- Create a pinned `requirements.txt` with exact versions based on your environment.

Tell me which of those you'd like next.
