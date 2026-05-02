const { spawn } = require('child_process');

function run(command, args, name) {
    const process = spawn(command, args, { shell: true });
    process.stdout.on('data', (data) => console.log(`[${name}] ${data.toString().trim()}`));
    process.stderr.on('data', (data) => console.error(`[${name}] ERROR: ${data.toString().trim()}`));
    return process;
}

console.log('Starting Server and Bot...');
run('node', ['server.js'], 'SERVER');
run('node', ['bot.js'], 'BOT');
