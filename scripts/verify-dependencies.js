const { execSync } = require('child_process');

function checkDependencies() {
    try {
        // Verify Node.js dependencies
        execSync('npm list', { stdio: 'inherit' });
        
        // Verify Python dependencies
        execSync('pip list', { stdio: 'inherit' });
        
        console.log('✅ All dependencies verified successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Dependency verification failed:', error.message);
        process.exit(1);
    }
}

checkDependencies();
