const { spawn } = require('child_process');
const path = require('path');

// Order of seeding
const seeders = [
  'userSeeder.js',
  'listeningTestSeeder.js',
  'submittedTestSeeder.js'
];

async function runSeeder(seeder) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${seeder}...`);
    
    const seederProcess = spawn('node', [path.join(__dirname, seeder)], {
      stdio: 'inherit'
    });

    seederProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${seeder} completed successfully`);
        resolve();
      } else {
        console.error(`${seeder} failed with code ${code}`);
        reject(new Error(`${seeder} failed with code ${code}`));
      }
    });

    seederProcess.on('error', (err) => {
      console.error(`Error running ${seeder}:`, err);
      reject(err);
    });
  });
}

async function runSeeders() {
  try {
    for (const seeder of seeders) {
      await runSeeder(seeder);
    }
    console.log('All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
}

// Run all seeders
runSeeders(); 