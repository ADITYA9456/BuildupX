const { exec } = require('child_process');

console.log('Running script to add rice varieties to the database...');

// Command to run the rice varieties script
const command = 'node -r next/dist/require-hook scripts/addRiceVarieties.js';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log(stdout);
});
