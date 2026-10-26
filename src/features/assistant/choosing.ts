import type { AssistantChoice } from './types';

/**
 * Picking one of several people with the same name by saying (or typing)
 * which: "pehla", "second", "2", "class 5 wala", "5 A". Only a short reply
 * counts, so a new question asked while the choice is open is not mistaken
 * for an answer to it.
 */

const SPACE = '(^|\\s)';
const END = '(\\s|$)';
const ordinal = (words: string) => new RegExp(`${SPACE}(${words})${END}`);

const ORDINALS: Array<[RegExp, number]> = [
  [ordinal('1|1st|first|ek|pehla|pahla|pehli|pahli|pehle|pahle|पहला|पहली|पहले|एक'), 0],
  [ordinal('2|2nd|second|two|do|dusra|doosra|dusri|doosri|dusre|doosre|दूसरा|दूसरी|दूसरे|दो'), 1],
  [ordinal('3|3rd|third|three|teen|tin|teesra|tisra|teesri|tisri|तीसरा|तीसरी|तीसरे|तीन'), 2],
  [ordinal('4|4th|fourth|four|char|chautha|chauthi|चौथा|चौथी|चार'), 3],
  [ordinal('5|5th|fifth|five|paanch|panch|panchva|panchvi|पांचवां|पांचवी|पाँचवाँ|पांच|पाँच'), 4],
  [ordinal('6|6th|sixth|six|chhe|chhah|chhata|chhati|छठा|छठी|छह'), 5],
];
const LAST = ordinal('last|aakhri|akhri|antim|आख़िरी|आखिरी|अंतिम');

/** Words that say nothing about which one. */
const FILLER = new Set(
  'class kaksha cls std wala wali wale vala vali vale waala waali the one wo vo woh vah yeh ye ka ki ke ko hai वाला वाली वाले कक्षा वो वह'.split(
    ' ',
  ),
);

/** Letters, vowel signs (Hindi's matras are marks, not letters), digits, spaces and hyphens. */
const KEEP = /[^\p{L}\p{M}\p{N}\s-]/gu;

const wordsOf = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(KEEP, ' ')
    .split(/\s+/)
    .flatMap((word) => [word, ...(word.includes('-') ? word.split('-') : [])])
    .filter(Boolean);

export function choiceFromReply(reply: string, choices: AssistantChoice[]): AssistantChoice | null {
  const text = reply.toLowerCase().replace(KEEP, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean);
  if (words.length === 0 || words.length > 5 || choices.length === 0) return null;

  // By what sets one apart: its class, section or admission number.
  const meaningful = words.filter((word) => !FILLER.has(word));
  const scores = choices.map((choice) => {
    const label = new Set(wordsOf(choice.label));
    return meaningful.filter((word) => label.has(word)).length;
  });
  const best = Math.max(...scores);
  if (best > 0 && scores.filter((score) => score === best).length === 1)
    return choices[scores.indexOf(best)]!;

  // By position in the list.
  if (LAST.test(text)) return choices[choices.length - 1]!;
  for (const [pattern, index] of ORDINALS)
    if (pattern.test(text) && choices[index]) return choices[index]!;
  return null;
}

const ORDINAL_EN = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
const ORDINAL_HI = ['पहला', 'दूसरा', 'तीसरा', 'चौथा', 'पाँचवाँ', 'छठा'];

/** The question "which one?" as it should be spoken, with each choice read out by its position. */
export function choicesSpeech(
  question: string,
  choices: AssistantChoice[],
  hindi: boolean,
): string {
  const label = (choice: AssistantChoice) =>
    choice.label
      .replace(/,?\s*\b[A-Z]{2,4}-\d{2,}(-\d+)*\b/g, '')
      .replace(/\s[—–]\s/g, ', ')
      .trim();
  const headline = question.split('\n')[0]!.replace(/[*“”"]/g, '');
  const listed = choices.map(
    (choice, index) => `${(hindi ? ORDINAL_HI : ORDINAL_EN)[index] ?? index + 1}: ${label(choice)}`,
  );
  return hindi
    ? `${headline} ${listed.join('। ')}। बोलिए पहला, दूसरा, या कक्षा।`
    : `${headline} ${listed.join('. ')}. Say first, second, or the class.`;
}
