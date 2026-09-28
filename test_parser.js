import assert from 'node:assert/strict';
import { parseVoiceNote } from './src/utils/parser.js';
import { SAMPLE_VOICE_NOTES } from './src/utils/samples.js';

console.log('--- Testing VoiceNote2Task NLP Engine ---');

SAMPLE_VOICE_NOTES.forEach((sample, i) => {
  console.log(`\nPreset ${i + 1}: ${sample.title}`);
  const result = parseVoiceNote(sample.text);
  console.log(`Extracted ${result.tasks.length} tasks from ${result.stats.wordCount} words (estimated ${result.stats.estimatedDurationSec}s speech)`);
  
  result.tasks.forEach((task, idx) => {
    console.log(`  [${idx + 1}] "${task.title}"`);
    console.log(`      Category: ${task.category} | Priority: ${task.priority} | Due: ${task.dueDate || 'None'}`);
    console.log(`      Original: "${task.originalSentence}"`);
  });
});

const multiActionResult = parseVoiceNote(
  'I need to call the dentist, pick up groceries, and email Sam about the project. Also, book a haircut.'
);
assert.deepEqual(
  multiActionResult.tasks.map((task) => task.title),
  ['Call the dentist', 'Pick up groceries', 'Email Sam about the project', 'Book a haircut']
);
assert.deepEqual(
  parseVoiceNote('I need to do two loads of laundry tonight and take out the recycling.')
    .tasks.map((task) => task.title),
  ['Do two loads of laundry', 'Take out the recycling']
);

console.log('\n--- All Tests Passed Successfully! ---');
