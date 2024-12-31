background.onload = function() {
    console.log('Background image loaded successfully.');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
};
background.onerror = function() {
    console.error('Failed to load background image.');
};