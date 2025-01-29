import fetch from 'node-fetch'; // Install with: npm install node-fetch@3

async function generateResponse() {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "deepseek-r1:14b", // Confirm model name (e.g., "llama3", "mistral")
        prompt: "Why is the sky blue?",
        stream: true // Ensure streaming is enabled
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle Node.js stream (no getReader() needed)
    response.body.on('data', (chunk) => {
      try {
        const parsed = JSON.parse(chunk.toString());
        process.stdout.write(parsed.response); // Write to console
      } catch (error) {
        console.error("Chunk parse error:", error);
      }
    });

    response.body.on('end', () => {
      console.log("\nStream complete.");
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

generateResponse();