import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function PromptEditor({ onSend }) {
  const [prompt, setPrompt] = useState('');

  const handleSend = () => {
    if (prompt.trim()) {
      onSend(prompt);
      setPrompt('');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Enter your prompt"
        variant="outlined"
        fullWidth
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSend}>
        Send
      </Button>
    </Box>
  );
}