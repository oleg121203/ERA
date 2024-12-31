import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PromptEditor from './PromptEditor';

export default function CopilotPanel() {
    const [messages, setMessages] = useState([]);

    const handleSendPrompt = (copilotResponse) => {
        setMessages([...messages, { text: copilotResponse, sender: 'copilot' }]);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    GitHub Copilot Web
                </Typography>
                
                <Box sx={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    mb: 2,
                    p: 2,
                    bgcolor: '#f5f5f5' 
                }}>
                    {messages.map((msg, index) => (
                        <Paper 
                            key={index}
                            variant="outlined" 
                            sx={{ 
                                p: 2, 
                                mb: 1,
                                bgcolor: msg.sender === 'copilot' ? '#e3f2fd' : 'white'
                            }}
                        >
                            <Typography 
                                component="pre" 
                                sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {msg.text}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                <PromptEditor onSend={handleSendPrompt} />
            </Paper>
        </Box>
    );
}
