catch (err) {
    if (err.response && err.response.status === 401) {
      log(`Authentication failed for ${error.file}. Check your API key.`, 'error'); // Clearer message
     } else { // ... rest of error handling
