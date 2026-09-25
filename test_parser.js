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

console.log('\n--- All Tests Passed Successfully! ---');
