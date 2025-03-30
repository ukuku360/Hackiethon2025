// test-ollama.js
const fetch = require('node-fetch').default;


async function testOllama() {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: 'Write a short paragraph expanding on this idea: Productivity is about systems, not willpower.',
        stream: false
      })
    });
    
    const data = await response.json();
    console.log("Response from Ollama:", data.response);
  } catch (error) {
    console.error("Error:", error);
  }
}

testOllama();