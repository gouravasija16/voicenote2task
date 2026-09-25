/**
 * Generates an iCalendar (.ics) format file from parsed tasks that have due dates
 */

export function generateICS(tasks) {
  const tasksWithDates = tasks.filter(t => t.dueDateISO);
  if (tasksWithDates.length === 0) return null;

  const now = new Date();
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const nowStr = formatICSDate(now);

  const events = tasksWithDates.map((task, idx) => {
    const startDate = new Date(task.dueDateISO);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 mins duration default

    const summary = task.title.replace(/[,;]/g, ' ');
    const description = `VoiceNote2Task Auto-extracted Task\\nCategory: ${task.category}\\nPriority: ${task.priority}\\nOriginal context: ${task.originalSentence ? task.originalSentence.replace(/[,;]/g, ' ') : ''}`;

    return [
      'BEGIN:VEVENT',
      `UID:${task.id || 'task-' + idx}@voicenote2task`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      task.priority === 'high' ? 'PRIORITY:1' : 'PRIORITY:5',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VoiceNote2Task//Task Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events.join('\r\n'),
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadICS(tasks, filename = 'tasks.ics') {
  const content = generateICS(tasks);
  if (!content) return false;

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
