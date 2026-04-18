
const { execSync } = require('child_process');

try {
    console.log('Searching for process on port 5000...');
    const stdout = execSync('netstat -ano | findstr :5000').toString();
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
            console.log(`Killing process with PID: ${pid}`);
            try {
                execSync(`taskkill /F /PID ${pid}`);
                console.log(`✅ Successfully killed PID ${pid}`);
            } catch (e) {
                console.log(`Could not kill PID ${pid}: ${e.message}`);
            }
        }
    }
} catch (error) {
    console.log('Port 5000 seems to be already clear.');
}
