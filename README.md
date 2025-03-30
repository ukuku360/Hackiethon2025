# Hackiethon2025 Project

A productivity tracking application with intelligent note-taking capabilities using local LLMs.

## Features

- **Productivity Timer**: Track time spent on different activities
- **Tagging System**: Categorize your activities with hashtags
- **Smart Notes**: Take detailed notes for each activity
- **AI Enhancement**: Generate expanded notes from brief ideas using local LLM (Ollama)
- **Analytics**: View time spent on different categories of work

## Components

### Main Files

- `src/MyWidget.jsx`: The main React component with the productivity timer and note-taking functionality
- `src/test-ollama.cjs`: A simple test script to verify Ollama connection

### Local LLM Integration

This project uses [Ollama](https://ollama.ai/) with the llama3.2 model for generating expanded notes from brief points. Make sure you have Ollama installed and the llama3.2 model downloaded for this feature to work.

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Make sure Ollama is installed and running with the llama3.2 model
4. Start the development server: `npm start`

## Technologies Used

- React
- Tailwind CSS
- Ollama (Local LLM)

## License

MIT