async function generateResponse() {
  try {
    console.log('Starting request...');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "deepseek-r1:14b",  // Changed to more common model name
        prompt: "Why is the sky blue?",
        stream: false      // Explicitly enable streaming
      })
    });

    console.log('Received response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! ${response.status}: ${errorBody}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream completed');
          break;
        }

        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);

        const lines = chunk.split('\n').filter(l => l.trim() !== '');
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              result += parsed.response;
              console.log('Current response:', parsed.response);
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (parseError) {
            console.error('Parse error:', parseError, 'on line:', line);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log('Final result:', result);
    return result;

  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error; // Re-throw for further handling
  }
}

// Execute with error catching
generateResponse()
  .then(() => console.log('Process completed'))
  .catch(e => console.error('Top-level error:', e));
