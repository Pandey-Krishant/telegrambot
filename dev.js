const { spawn } = require('child_process');

function run(command, args, name) {
    const child = spawn(command, args, { shell: true, stdio: 'inherit' });
    
    child.on('error', (err) => {
        console.error(`[${name}] Failed to start:`, err);
    });

    child.on('exit', (code) => {
        if (code !== 0) {
            console.error(`[${name}] Exited with code ${code}`);
            process.exit(code);
        }
    });

    return child;
}

console.log('--- DEPLOYMENT STARTING ---');
console.log('Starting Server and Bot in parallel...');

run('node', ['server.js'], 'SERVER');
run('node', ['bot.js'], 'BOT');

