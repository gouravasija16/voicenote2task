/**
 * VoiceNote2Task - Deterministic NLP & Sentence Structure Pattern Matcher
 * No external API required. 100% client-side pattern extraction.
 */

// Meta-commentary phrases to discard or trim (e.g. "let me write down what I need to do")
const META_COMMENTARY_REGEX = /^(?:okay\s*,?\s*so\s*)?(?:(?:let\s+me\s+(?:quickly\s+)?(?:jot\s+down|write\s+down|list|think\s+about|note\s+down|recap)\s+(?:what\s+(?:i|we)\s+(?:need|have)\s+to\s+(?:do|get\s+done)|my\s+tasks|things|everything))|(?:here\s+(?:is|are)\s+(?:a\s+few\s+)?things\s+(?:i|we)\s+need\s+to\s+do)|(?:quick\s+memo\s+(?:for\s+(?:the\s+week|today|tomorrow))?))\s*:?\s*/i;

// Comprehensive filler word and conversational hedge patterns
const FILLER_PREFIX_REGEX = /^(?:uh+|um+|er+|ah+|like|you know|basically|honestly|actually|so yeah|okay so|hey so|well|i mean|listen|right|just wanted to say that|i was thinking that|wait|oh yeah|oh and)\s*,?\s*/i;

// Action trigger prefixes to identify task intent and strip conversational wrappers
const ACTION_PREFIXES = [
  // Obligation / Intent
  { regex: /^(?:(?:hey\s+(?:team|everyone|guys)\s*,?\s*)?(?:so\s+)?(?:i\s+was\s+just\s+[^,.]*,\s*)?(?:and\s+)?(?:i\s+realized\s+)?(?:that\s+)?i\s+(?:really\s+)?(?:need|have|got|gotta)\s+to)\s+/i, replacement: '' },
  { regex: /^(?:(?:we\s+(?:really\s+)?(?:need|have|got|gotta)\s+to))\s+/i, replacement: '' },
  { regex: /^(?:(?:i\s+(?:really\s+)?(?:need|have|got|gotta)\s+to))\s+/i, replacement: '' },
  { regex: /^(?:(?:i|we)\s+must)\s+/i, replacement: '' },
  { regex: /^(?:(?:i|we)\s+should\s+(?:definitely|probably|also)?)\s+/i, replacement: '' },
  { regex: /^(?:(?:i'm|we're)\s+supposed\s+to)\s+/i, replacement: '' },
  // Reminders
  { regex: /^(?:(?:then\s+)?(?:please\s+)?remind\s+me\s+to)\s+/i, replacement: '' },
  { regex: /^(?:(?:and\s+oh\s+yeah\s*,?\s*)?(?:and\s+)?(?:also\s+)?(?:please\s+)?don'?t\s+forget\s+to)\s+/i, replacement: '' },
  { regex: /^(?:(?:please\s+)?do\s+not\s+forget\s+to)\s+/i, replacement: '' },
  { regex: /^(?:(?:also\s+)?(?:please\s+)?remember\s+to)\s+/i, replacement: '' },
  { regex: /^(?:(?:tomorrow\s+morning\s+)?(?:please\s+)?make\s+sure\s+(?:to|that\s+(?:i|we|you)))\s+/i, replacement: '' },
  { regex: /^(?:(?:please\s+)?be\s+sure\s+to)\s+/i, replacement: '' },
  { regex: /^(?:keep\s+in\s+mind\s+to)\s+/i, replacement: '' },
  // Requests / Directives
  { regex: /^(?:(?:oh\s*,?\s*and\s+)?(?:can|could|would)\s+(?:someone|you)\s+(?:please\s+)?)\s*/i, replacement: '' },
  { regex: /^(?:let'?s\s+(?:make\s+sure\s+to)?)\s*/i, replacement: '' },
  { regex: /^(?:please\s+)\s*/i, replacement: '' },
  // Conversational transitions at clause start
  { regex: /^(?:also\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:and\s+also\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:and\s+then\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:another\s+thing\s*,?\s*(?:there'?s\s+that\s+)?)/i, replacement: '' },
  { regex: /^(?:next\s+thing\s+is\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:on\s+top\s+of\s+that\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:plus\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:secondly\s*,?\s*|thirdly\s*,?\s*|finally\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:first\s+off\s*,?\s*|to\s+start\s+with\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:if\s+possible\s*,?\s*)/i, replacement: '' },
  { regex: /^(?:sometime\s+next\s+(?:week|month)\s*,?\s*)/i, replacement: '' },
];

// Common imperative / actionable verbs
const ACTION_VERBS = [
  'call', 'phone', 'ring', 'email', 'text', 'message', 'ping', 'slack', 'dm',
  'contact', 'reach out to', 'reply to', 'respond to', 'follow up with', 'sync with',
  'buy', 'purchase', 'order', 'pick up', 'grab', 'get', 'shop for', 'acquire',
  'fix', 'debug', 'repair', 'patch', 'resolve', 'solve', 'tackle',
  'deploy', 'ship', 'release', 'publish', 'push', 'merge',
  'schedule', 'book', 'set up', 'arrange', 'plan', 'reserve', 'organize',
  'meet with', 'chat with', 'talk to', 'discuss with',
  'write', 'draft', 'author', 'compose', 'prepare', 'create', 'build',
  'submit', 'send', 'forward', 'file', 'deliver',
  'pay', 'wire', 'transfer', 'invoice', 'settle', 'reimburse',
  'review', 'check', 'inspect', 'audit', 'test', 'validate', 'verify',
  'update', 'modify', 'revise', 'edit', 'refactor',
  'finish', 'complete', 'finalize', 'wrap up', 'close',
  'clean', 'tidy', 'wash', 'vacuum', 'declutter', 'sanitize',
  'print', 'scan', 'sign', 'read', 'research', 'investigate',
  'cancel', 'reschedule', 'renew', 'return', 'drop off'
];

// Priority dictionary with weightings
const URGENCY_PATTERNS = [
  { regex: /\b(?:urgent|urgently|emergency|critical|crucial)\b/i, priority: 'high', score: 3 },
  { regex: /\b(?:asap|a\.s\.a\.p\.?|right\s+now|right\s+away|immediately)\b/i, priority: 'high', score: 3 },
  { regex: /\b(?:high\s+priority|top\s+priority|highest\s+priority)\b/i, priority: 'high', score: 3 },
  { regex: /\b(?:must\s+do\s+today|today\s+itself|deadline\s+today|time[-\s]sensitive)\b/i, priority: 'high', score: 2 },
  { regex: /\b(?:blocking|blocker|p0|showstopper)\b/i, priority: 'high', score: 3 },
  { regex: /\b(?:low\s+priority|p3|no\s+rush|whenever|someday|eventually)\b/i, priority: 'low', score: 2 },
  { regex: /\b(?:sometime|if\s+possible|if\s+you\s+can|when\s+you\s+get\s+a\s+chance|maybe\s+later)\b/i, priority: 'low', score: 1 },
];

// Category dictionary with weighted keyword matching
const CATEGORY_DEFINITIONS = {
  technical: {
    label: 'Technical / Dev',
    color: '#8b5cf6', // Violet
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.35)',
    icon: 'code',
    keywords: [
      'bug', 'fix', 'api', 'server', 'database', 'deploy', 'repo', 'github', 'pr',
      'pull request', 'test', 'code', 'endpoint', 'webhook', 'backend', 'frontend',
      'crash', 'architecture', 'query', 'cache', 'gateway', 'dev', 'staging', 'prod',
      'production', 'release', 'git', 'refactor', 'exception', 'docker', 'aws',
      'pipeline', 'ci/cd', 'merge', 'unit test', 'lint', 'css', 'javascript', 'typescript', 'react',
      'latency', 'cluster', 'devops', 'infrastructure'
    ]
  },
  communication: {
    label: 'Communication',
    color: '#06b6d4', // Cyan
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.35)',
    icon: 'mail',
    keywords: [
      'call', 'email', 'text', 'message', 'reach out', 'follow up', 'ping', 'slack',
      'reply', 'contact', 'phone', 'talk to', 'discuss with', 'catch up with',
      'send note', 'chat', 'voicemail', 'zoom', 'inbox', 'dm', 'meeting to confirm'
    ]
  },
  work: {
    label: 'Work & Projects',
    color: '#3b82f6', // Blue
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.35)',
    icon: 'briefcase',
    keywords: [
      'project', 'client', 'meeting', 'report', 'presentation', 'deck', 'slides',
      'budget', 'sprint', 'standup', 'sync', 'boss', 'manager', 'colleague', 'team',
      'deliverable', 'proposal', 'contract', 'roadmap', 'q1', 'q2', 'q3', 'q4',
      'quarterly', 'investor', 'pitch', 'onboard', 'stakeholder', 'agenda', 'strategy',
      'kpi', 'okr', 'metrics', 'board deck', 'board', 'legal', 'vendor'
    ]
  },
  finance: {
    label: 'Finance',
    color: '#10b981', // Emerald
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.35)',
    icon: 'dollar-sign',
    keywords: [
      'bill', 'invoice', 'pay', 'payment', 'tax', 'taxes', 'bank', 'account', 'transfer',
      'wire', 'subscription', 'receipt', 'expense', 'payroll', 'refund', 'audit',
      'credit card', 'statement', 'insurance', 'fee', 'charge', 'deductible', 'reimbursement',
      'cost', 'price', 'salary', 'deposit', 'franchise tax', 'electric bill'
    ]
  },
  health: {
    label: 'Health & Wellness',
    color: '#ec4899', // Pink
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.35)',
    icon: 'heart',
    keywords: [
      'doctor', 'dentist', 'appointment', 'clinic', 'medicine', 'prescription',
      'pharmacy', 'workout', 'gym', 'therapy', 'therapist', 'checkup', 'vitamins',
      'dentistry', 'optometrist', 'hospital', 'trainer', 'dental', 'massage',
      'physio', 'blood test', 'vaccine', 'medication', 'eye exam', 'yoga', 'vet', 'shot'
    ]
  },
  shopping: {
    label: 'Shopping & Errands',
    color: '#f59e0b', // Amber
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.35)',
    icon: 'shopping-cart',
    keywords: [
      'buy', 'purchase', 'order', 'groceries', 'grocery', 'supermarket', 'market',
      'milk', 'bread', 'eggs', 'fruit', 'vegetables', 'amazon', 'store',
      'trader joe', 'target', 'walmart', 'costco', 'pick up', 'return', 'supplies',
      'shampoo', 'detergent', 'hardware', 'dry cleaning', 'air filters'
    ]
  },
  personal: {
    label: 'Personal & Life',
    color: '#a855f7', // Purple
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.35)',
    icon: 'user',
    keywords: [
      'mom', 'dad', 'kids', 'family', 'house', 'apartment', 'home', 'dog', 'cat',
      'pet', 'car', 'mechanic', 'oil change', 'laundry', 'clean', 'repair',
      'garden', 'gardening', 'weekend trip', 'vacation', 'flight', 'hotel', 'birthday',
      'gift', 'present', 'movie', 'party', 'haircut', 'clothes', 'luggage', 'pack', 'dinner', 'reservation', 'reserve a table'
    ]
  },
  general: {
    label: 'General Task',
    color: '#64748b', // Slate
    badgeBg: 'rgba(100, 116, 139, 0.15)',
    border: 'rgba(100, 116, 139, 0.35)',
    icon: 'check-square',
    keywords: []
  }
};

/**
 * Extracts and calculates human-readable due date and resolved ISO timestamp
 */
export function extractDueDate(text, baseDate = new Date()) {
  const lower = text.toLowerCase();

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];

  // Pattern 1: Relative times of day (today/tonight/this evening)
  if (/\b(?:tonight|this\s+evening)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setHours(20, 0, 0, 0);
    return {
      rawMatch: 'tonight',
      display: 'Tonight (8:00 PM)',
      iso: d.toISOString(),
      relative: 'Today'
    };
  }

  if (/\b(?:this\s+afternoon)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setHours(14, 0, 0, 0);
    return {
      rawMatch: 'this afternoon',
      display: 'This Afternoon (2:00 PM)',
      iso: d.toISOString(),
      relative: 'Today'
    };
  }

  if (/\b(?:end\s+of\s+day|by\s+eod|eod)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setHours(18, 0, 0, 0);
    return {
      rawMatch: 'end of day',
      display: 'End of Day (6:00 PM)',
      iso: d.toISOString(),
      relative: 'Today'
    };
  }

  if (/\b(?:today)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setHours(18, 0, 0, 0);
    return {
      rawMatch: 'today',
      display: 'Today',
      iso: d.toISOString(),
      relative: 'Today'
    };
  }

  // Pattern 2: Tomorrow variations
  const tomorrowMorningMatch = /\btomorrow\s+(?:morning|at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)\b/i.exec(lower);
  if (tomorrowMorningMatch) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    let hour = 9;
    let min = 0;
    if (tomorrowMorningMatch[1]) {
      hour = parseInt(tomorrowMorningMatch[1], 10);
      min = tomorrowMorningMatch[2] ? parseInt(tomorrowMorningMatch[2], 10) : 0;
      if (tomorrowMorningMatch[3]?.toLowerCase() === 'pm' && hour < 12) hour += 12;
      if (tomorrowMorningMatch[3]?.toLowerCase() === 'am' && hour === 12) hour = 0;
    }
    d.setHours(hour, min, 0, 0);
    return {
      rawMatch: tomorrowMorningMatch[0],
      display: `Tomorrow morning (${formatTime(d)})`,
      iso: d.toISOString(),
      relative: 'Tomorrow'
    };
  }

  if (/\btomorrow\s+(?:afternoon)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return {
      rawMatch: 'tomorrow afternoon',
      display: 'Tomorrow Afternoon (2:00 PM)',
      iso: d.toISOString(),
      relative: 'Tomorrow'
    };
  }

  if (/\btomorrow\s+(?:evening|night)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    d.setHours(20, 0, 0, 0);
    return {
      rawMatch: 'tomorrow night',
      display: 'Tomorrow Night (8:00 PM)',
      iso: d.toISOString(),
      relative: 'Tomorrow'
    };
  }

  if (/\btomorrow\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    return {
      rawMatch: 'tomorrow',
      display: 'Tomorrow',
      iso: d.toISOString(),
      relative: 'Tomorrow'
    };
  }

  // Pattern 3: Day after tomorrow
  if (/\bday\s+after\s+tomorrow\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 2);
    d.setHours(17, 0, 0, 0);
    return {
      rawMatch: 'day after tomorrow',
      display: `In 2 days (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: 'In 2 days'
    };
  }

  // Pattern 4: Relative Days/Weeks/Hours: "in 2 days", "in 3 hours", "in 2 weeks"
  const inTimeMatch = /\bin\s+(\d+)\s+(hours?|hrs?|days?|weeks?|months?)\b/i.exec(lower);
  if (inTimeMatch) {
    const amount = parseInt(inTimeMatch[1], 10);
    const unit = inTimeMatch[2].toLowerCase();
    const d = new Date(baseDate);
    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      d.setHours(d.getHours() + amount);
    } else if (unit.startsWith('day')) {
      d.setDate(d.getDate() + amount);
    } else if (unit.startsWith('week')) {
      d.setDate(d.getDate() + amount * 7);
    } else if (unit.startsWith('month')) {
      d.setMonth(d.getMonth() + amount);
    }
    return {
      rawMatch: inTimeMatch[0],
      display: `In ${amount} ${unit} (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: `In ${amount} ${unit}`
    };
  }

  // Pattern 5: Days of the week (e.g. "next Tuesday at 3pm", "on Friday", "by Monday")
  const dayMatch = /\b(?:(?:by|on|this|next|coming)\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:morning|afternoon|evening|night|at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?))?\b/i.exec(lower);
  if (dayMatch) {
    const targetDayName = dayMatch[1].toLowerCase();
    const targetDayIndex = daysOfWeek.indexOf(targetDayName);
    const currentDayIndex = baseDate.getDay();
    
    let daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
    if (daysToAdd === 0 || lower.includes('next ' + targetDayName)) {
      daysToAdd += 7;
    }

    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysToAdd);

    if (dayMatch[2]) {
      let hour = parseInt(dayMatch[2], 10);
      const min = dayMatch[3] ? parseInt(dayMatch[3], 10) : 0;
      const meridiem = dayMatch[4]?.toLowerCase();
      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
      d.setHours(hour, min, 0, 0);
    } else if (lower.includes('morning')) {
      d.setHours(9, 0, 0, 0);
    } else if (lower.includes('afternoon')) {
      d.setHours(14, 0, 0, 0);
    } else if (lower.includes('evening') || lower.includes('night')) {
      d.setHours(19, 0, 0, 0);
    } else {
      d.setHours(17, 0, 0, 0);
    }

    const capDay = targetDayName.charAt(0).toUpperCase() + targetDayName.slice(1);
    const timeStr = dayMatch[2] ? ` at ${formatTime(d)}` : '';
    return {
      rawMatch: dayMatch[0],
      display: `${capDay}${timeStr} (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: capDay
    };
  }

  // Pattern 6: "this weekend", "next weekend"
  if (/\b(?:this\s+weekend)\b/i.test(lower)) {
    const d = new Date(baseDate);
    const currentDay = d.getDay();
    const daysToSaturday = (6 - currentDay + 7) % 7;
    d.setDate(d.getDate() + (daysToSaturday === 0 ? 0 : daysToSaturday));
    d.setHours(12, 0, 0, 0);
    return {
      rawMatch: 'this weekend',
      display: `This Weekend (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: 'This Weekend'
    };
  }

  if (/\b(?:next\s+weekend)\b/i.test(lower)) {
    const d = new Date(baseDate);
    const currentDay = d.getDay();
    const daysToSaturday = ((6 - currentDay + 7) % 7) + 7;
    d.setDate(d.getDate() + daysToSaturday);
    d.setHours(12, 0, 0, 0);
    return {
      rawMatch: 'next weekend',
      display: `Next Weekend (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: 'Next Weekend'
    };
  }

  // Pattern 7: "next week", "sometime next week", "end of the week"
  if (/\b(?:end\s+of\s+(?:the\s+)?week|by\s+friday)\b/i.test(lower)) {
    const d = new Date(baseDate);
    const daysToFriday = (5 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + daysToFriday);
    d.setHours(17, 0, 0, 0);
    return {
      rawMatch: 'end of week',
      display: `End of Week (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: 'This Friday'
    };
  }

  if (/\b(?:next\s+week|sometime\s+next\s+week)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
    return {
      rawMatch: 'next week',
      display: `Next Week (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: 'Next Week'
    };
  }

  if (/\b(?:next\s+month|sometime\s+next\s+month)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    d.setHours(9, 0, 0, 0);
    return {
      rawMatch: 'next month',
      display: `Next Month (${formatDateShort(d)})`,
      iso: d.toISOString(),
      relative: 'Next Month'
    };
  }

  // Pattern 8: Specific clock time standalone: "at 4pm", "by 10:30 am", "before 5pm"
  const timeOnlyMatch = /\b(?:at|by|before)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i.exec(lower);
  if (timeOnlyMatch) {
    let hour = parseInt(timeOnlyMatch[1], 10);
    const min = timeOnlyMatch[2] ? parseInt(timeOnlyMatch[2], 10) : 0;
    const meridiem = timeOnlyMatch[3].toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    const d = new Date(baseDate);
    d.setHours(hour, min, 0, 0);
    if (d < baseDate) {
      d.setDate(d.getDate() + 1);
    }
    return {
      rawMatch: timeOnlyMatch[0],
      display: `${formatTime(d)} (${d.getDate() === baseDate.getDate() ? 'Today' : 'Tomorrow'})`,
      iso: d.toISOString(),
      relative: d.getDate() === baseDate.getDate() ? 'Today' : 'Tomorrow'
    };
  }

  // Pattern 9: Specific calendar dates like "October 15th", "Sep 28"
  const monthRegex = new RegExp(`\\b(${monthNames.join('|')}|${shortMonths.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');
  const monthMatch = monthRegex.exec(lower);
  if (monthMatch) {
    const mStr = monthMatch[1].toLowerCase();
    const dayNum = parseInt(monthMatch[2], 10);
    const mIdx = monthNames.findIndex(m => m.startsWith(mStr)) !== -1 
      ? monthNames.findIndex(m => m.startsWith(mStr)) 
      : shortMonths.findIndex(m => m === mStr);

    if (mIdx !== -1 && dayNum >= 1 && dayNum <= 31) {
      const d = new Date(baseDate);
      d.setMonth(mIdx);
      d.setDate(dayNum);
      d.setHours(17, 0, 0, 0);
      if (d < baseDate) {
        d.setFullYear(d.getFullYear() + 1);
      }
      return {
        rawMatch: monthMatch[0],
        display: formatDateShort(d),
        iso: d.toISOString(),
        relative: formatDateShort(d)
      };
    }
  }

  return null;
}

/**
 * Extracts priority from sentence text
 */
export function extractPriority(text) {
  let bestPriority = 'normal';
  let highestScore = 0;

  for (const item of URGENCY_PATTERNS) {
    if (item.regex.test(text)) {
      if (item.score > highestScore) {
        highestScore = item.score;
        bestPriority = item.priority;
      }
    }
  }

  return bestPriority;
}

/**
 * Categorizes the task based on semantic vocabulary
 */
export function extractCategory(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [catKey, catDef] of Object.entries(CATEGORY_DEFINITIONS)) {
    if (catKey === 'general') continue;
    let score = 0;
    for (const kw of catDef.keywords) {
      const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i');
      if (regex.test(lower)) {
        score += kw.length > 5 ? 3 : 2;
      }
    }
    scores[catKey] = score;
  }

  // Priority boost for primary action verbs:
  // e.g., "Email Alex to confirm coffee" -> communication (not shopping for coffee)
  if (/\b(?:call|phone|email|text|message|reach out|ping|slack)\b/i.test(lower) && !/\b(?:buy|order|purchase)\b/i.test(lower)) {
    scores['communication'] = (scores['communication'] || 0) + 4;
  }
  if (/\b(?:buy|order|purchase|groceries)\b/i.test(lower)) {
    scores['shopping'] = (scores['shopping'] || 0) + 4;
  }
  if (/\b(?:bug|fix|deploy|webhook|server|latency|endpoint|pr|pull request|auth)\b/i.test(lower)) {
    scores['technical'] = (scores['technical'] || 0) + 5;
  }
  if (/\b(?:dentist|doctor|appointment|vet)\b/i.test(lower)) {
    scores['health'] = (scores['health'] || 0) + 4;
  }
  if (/\b(?:tax|taxes|wire|invoice|bill)\b/i.test(lower)) {
    scores['finance'] = (scores['finance'] || 0) + 4;
  }

  let maxCategory = 'general';
  let maxScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = cat;
    }
  }

  return maxCategory;
}

/**
 * Splits raw rambling transcript into candidate thought segments
 */
export function splitIntoCandidateThoughts(rawText) {
  if (!rawText || !rawText.trim()) return [];

  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .trim();

  const spokenTransitions = [
    'and also', 'and then', 'oh and', 'oh yeah and', 'plus',
    'another thing is', 'next thing is', 'on top of that',
    'and don\'t forget to', 'and remember to', 'and make sure to',
    'and remind me to', 'also don\'t forget', 'also remember',
    'also make sure', 'wait,', 'secondly,', 'thirdly,', 'finally,'
  ];

  const SPLIT_TOKEN = '___SPLIT_HERE___';
  let processed = text;

  // Split on strong sentence punctuation
  processed = processed.replace(/([.?!;]+)(\s+)/g, `$1${SPLIT_TOKEN}`);
  // Split on newlines
  processed = processed.replace(/\n+/g, SPLIT_TOKEN);

  // Split on spoken conjunctions
  for (const trans of spokenTransitions) {
    const regex = new RegExp(`(\\s+)(?:${escapeRegExp(trans)})(\\s+)`, 'gi');
    processed = processed.replace(regex, `${SPLIT_TOKEN}$2`);
  }

  const rawCandidates = processed
    .split(SPLIT_TOKEN)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return rawCandidates;
}

/**
 * Cleans rambling sentence into a clean, concise, actionable task title
 */
export function cleanTaskTitle(sentence, dueDateMatch) {
  let cleaned = sentence;

  // 1. Strip leading meta-commentary (e.g., "Let me quickly jot down what I need to do")
  cleaned = cleaned.replace(META_COMMENTARY_REGEX, '').trim();

  // 2. Strip leading punctuation / dashes / bullets
  cleaned = cleaned.replace(/^[\s\-–—*•,.]+/, '').trim();

  // 3. Strip conversational narrative preamble before action verbs
  // e.g. "I was just walking back from lunch and I realized I really need to call Sarah"
  // -> "Call Sarah"
  const preambleMatch = /^(?:.*?\b(?:realized|thought|decided|figured)\s+(?:that\s+)?)(?:i\s+(?:really\s+)?(?:need|have|got|gotta)\s+to\s+)/i.exec(cleaned);
  if (preambleMatch) {
    cleaned = cleaned.slice(preambleMatch[0].length).trim();
  }

  // 4. Strip filler prefixes
  cleaned = cleaned.replace(FILLER_PREFIX_REGEX, '').trim();

  // 5. Strip action trigger prefixes (e.g. "I really need to ", "don't forget to ")
  for (const prefix of ACTION_PREFIXES) {
    if (prefix.regex.test(cleaned)) {
      cleaned = cleaned.replace(prefix.regex, prefix.replacement).trim();
    }
  }

  // Repeat filler check that might have been revealed
  cleaned = cleaned.replace(FILLER_PREFIX_REGEX, '').trim();

  // 6. Strip urgency words from title to avoid redundancy (displayed as badges)
  for (const urg of URGENCY_PATTERNS) {
    cleaned = cleaned.replace(urg.regex, '').trim();
  }

  // 7. Strip due date match from title to keep title clean
  if (dueDateMatch?.rawMatch) {
    const dateRegex = new RegExp(`\\b(?:by|on|at|before|for)?\\s*${escapeRegExp(dueDateMatch.rawMatch)}\\b`, 'gi');
    cleaned = cleaned.replace(dateRegex, '').trim();
  }

  // 8. Clean up dangling conjunctions, duplicate commas, and trailing punctuation
  cleaned = cleaned
    .replace(/^[\s,;:\-–—]+/, '')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*,\s*$/, '')
    .replace(/[.?!;]+$/, '')
    .trim();

  // 9. Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Checks if a candidate sentence is an actionable task or just background chatter/fragment
 */
export function isActionableTask(sentence) {
  const lower = sentence.toLowerCase().trim();

  // Ignore tiny snippets (< 6 characters or < 2 words)
  if (lower.length < 6 || lower.split(/\s+/).length < 2) {
    return false;
  }

  // Filter out pure meta urgency/status fragments with no action
  // e.g. "That's super urgent.", "No rush on that.", "It's time-sensitive."
  if (/^(?:that'?s\s+(?:super\s+)?urgent|no\s+rush\s+on\s+that|it'?s\s+blocking|that'?s\s+it|that'?s\s+all)\.?$/i.test(lower)) {
    return false;
  }

  // Filter out pure meta-commentary lines
  if (/^(?:(?:let\s+me\s+)?(?:quickly\s+)?(?:jot|write|think|note)\s+down\s+what\s+i\s+need\s+to\s+do)/i.test(lower)) {
    return false;
  }

  // Explicit non-tasks / pleasantries / background observations
  const nonTaskPhrases = [
    /^(?:the\s+weather\s+is|it'?s\s+such\s+a\s+nice\s+day|i\s+was\s+just\s+thinking\s+about\s+life)/i,
    /^(?:i\s+had\s+lunch|we\s+ate|i\s+woke\s+up)/i,
    /^(?:anyway\s*,?\s*that'?s\s+all|that'?s\s+it\s+for\s+now|talk\s+to\s+you\s+later)/i,
    /^(?:bye|goodbye|have\s+a\s+good\s+day|cheers)\b/i
  ];
  for (const nonTask of nonTaskPhrases) {
    if (nonTask.test(lower)) return false;
  }

  // Action intent indicator 1: Contains modal/action prefixes
  for (const prefix of ACTION_PREFIXES) {
    if (prefix.regex.test(sentence)) return true;
  }

  // Action intent indicator 2: Contains action verb
  for (const verb of ACTION_VERBS) {
    const verbRegex = new RegExp(`\\b${escapeRegExp(verb)}\\b`, 'i');
    if (verbRegex.test(lower)) {
      return true;
    }
  }

  // Action intent indicator 3: Has due date or urgency combined with a subject
  if (extractDueDate(sentence) !== null && lower.split(/\s+/).length >= 3) return true;

  return false;
}

/**
 * Main parser entry point: parses raw voice memo text into structured task items
 */
export function parseVoiceNote(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      rawText: '',
      tasks: [],
      stats: {
        totalCandidates: 0,
        totalTasks: 0,
        highPriority: 0,
        categoriesCount: {},
        wordCount: 0,
        estimatedDurationSec: 0
      }
    };
  }

  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDurationSec = Math.round(wordCount / 2.3);

  const candidateSentences = splitIntoCandidateThoughts(rawText);
  const tasks = [];
  const categoriesCount = {};

  candidateSentences.forEach((sentence, index) => {
    if (!isActionableTask(sentence)) {
      return;
    }

    const dueDate = extractDueDate(sentence);
    let priority = extractPriority(sentence);
    const category = extractCategory(sentence);
    const cleanedTitle = cleanTaskTitle(sentence, dueDate);

    // Skip if title collapsed to nothing or is too short
    if (!cleanedTitle || cleanedTitle.length < 3 || cleanedTitle.split(/\s+/).length < 2) {
      return;
    }

    // Tally category
    categoriesCount[category] = (categoriesCount[category] || 0) + 1;

    tasks.push({
      id: `task-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      title: cleanedTitle,
      category,
      categoryMeta: CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS.general,
      priority,
      dueDate: dueDate ? dueDate.display : null,
      dueDateISO: dueDate ? dueDate.iso : null,
      dueDateRelative: dueDate ? dueDate.relative : null,
      originalSentence: sentence.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    });
  });

  const highPriority = tasks.filter(t => t.priority === 'high').length;

  return {
    rawText,
    tasks,
    stats: {
      totalCandidates: candidateSentences.length,
      totalTasks: tasks.length,
      highPriority,
      categoriesCount,
      wordCount,
      estimatedDurationSec
    }
  };
}

// Helpers
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDateShort(date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { CATEGORY_DEFINITIONS };
