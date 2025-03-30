# Hackiethon2025
# 🚀 Productivity Timer with AI Note-Taking

A React widget developed for the Hackiethon 2025 Widget Challenge that combines time tracking with AI-powered note-taking.

![Productivity Timer Widget](https://via.placeholder.com/800x400?text=Productivity+Timer+Widget)

## 🌟 Features

- **⏱️ Productivity Timer**: Track time spent on different activities with start, pause, and reset functionality
- **📝 Note-Taking**: Add main ideas and detailed notes for each activity
- **🤖 AI-Powered Notes Expansion**: Integrate with Ollama to automatically expand brief notes into detailed documentation
- **🏷️ Tagging System**: Categorize activities with hashtags (#work, #study, etc.)
- **🔍 Search Functionality**: Find and calculate time spent on specific tags
- **📊 Activity History**: Review past activities with timestamps and elapsed time
- **📂 Notes Organization**: View all notes organized by tags

## 🛠️ Setup & Installation

### Prerequisites

1. **Node.js and npm**: Make sure you have Node.js and npm installed
2. **Ollama**: For AI note expansion, you'll need [Ollama](https://ollama.ai/) installed locally

### Installing Ollama

1. Download and install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. Pull the llama3.2 model:
   ```bash
   ollama pull llama3.2
   ```
3. Ensure Ollama is running in the background

### Widget Installation

1. Add the widget to your React project:
   ```bash
   npm install --save productivity-timer-widget  # Note: This is a placeholder, not an actual package
   ```
2. Or simply copy `MyWidget.jsx` into your project

## 🚀 Usage

### Basic Implementation

```jsx
import React from 'react';
import ProductivityTimer from './MyWidget';

function App() {
  return (
    <div className="App">
      <ProductivityTimer />
    </div>
  );
}

export default App;
```

### Using the Timer

1. **Start/Pause**: Click the Start/Pause button to control the timer
2. **Reset**: Click Reset to stop the current session and record it
3. **Activity Tracking**: After pausing/resetting, add a description and hashtags
4. **Note Taking**: Double-click on any activity to open the note editor
5. **AI Expansion**: With Ollama running, click "Generate with Ollama" to expand your brief notes

## 💡 How It Works

### Time Tracking

The widget uses React's `useState` and `useEffect` hooks to create a timer that tracks seconds. Activities are recorded with timestamps when you pause or reset the timer.

### Note-Taking System

Double-click on any activity to open a note editor where you can add:
- **Main Ideas**: Brief points about the activity
- **Detailed Notes**: Comprehensive notes about what you did

### Ollama Integration

The widget connects to a locally running Ollama instance to expand your brief notes:

1. Enter your main ideas in the notepad
2. Click "Generate with Ollama"
3. The widget sends a prompt to Ollama with your ideas and title
4. Ollama returns expanded, detailed notes in seconds

### Tagging System

Add hashtags to categorize activities:
- Use the `#tag` format in the category field
- Search for tags to calculate total time spent
- View notes organized by tags in the "View All Notes" section

## 🔧 Troubleshooting

### Ollama Integration Issues

- Ensure Ollama is running (`ollama serve`)
- Verify you have the llama3.2 model installed (`ollama list`)
- Check browser console for any connection errors

### Widget Display Issues

- Make sure your project has Tailwind CSS installed for styling
- Ensure your React version is compatible (16.8+ required for hooks)

## 🔍 Technical Details

- **Framework**: React.js with hooks
- **State Management**: React useState/useEffect
- **Styling**: Tailwind CSS classes
- **AI Integration**: Local Ollama API
- **Data Persistence**: In-memory only (no backend storage)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Developed for Hackiethon 2025
- Inspired by productivity techniques like Pomodoro and time blocking
- Uses Ollama for local AI processing (no data sent to external services)

## 📞 Contact

- GitHub: [@ukuku360](https://github.com/ukuku360)

---

Made with ❤️ for Hackiethon 2025
