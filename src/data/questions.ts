/**
 * Question pool for Noghurt Brain.
 *
 * Style guide (channeling Trivial Pursuit at its best):
 *  - Hook over textbook. "Mario was originally called Jumpman" beats
 *    "Who is Mario?"
 *  - Plausible distractors. The wrong answers should make you actually
 *    think, not be cartoon-obvious throwaways.
 *  - Specificity creates story. "The first registered .com domain" reveals
 *    a piece of history that sticks; "What is a domain" doesn't.
 *  - Avoid trick questions. Difficulty comes from depth of knowledge, not
 *    from semantic gotchas.
 *  - Decryptor answers MUST be short and unambiguous (1-3 words). Server
 *    normalizes whitespace + non-alphanumerics so capitalization doesn't
 *    matter.
 *
 * Categories: science / internet / geography / retro
 * (history + pop_culture types reserved for future expansion.)
 */

export type Category = 'science' | 'internet' | 'geography' | 'retro' | 'history' | 'pop_culture';
export type Difficulty = 'normal' | 'mainframe';

export type ClassicQuestion = {
  id: string;
  type: 'classic';
  cat: Category;
  difficulty: Difficulty;
  prompt: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
};

export type DecryptorQuestion = {
  id: string;
  type: 'decryptor';
  cat: Category;
  difficulty: Difficulty;
  prompt: string;
  answer: string;
};

export type Question = ClassicQuestion | DecryptorQuestion;

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIC POOL — multiple choice, normal difficulty
// ─────────────────────────────────────────────────────────────────────────────
const CLASSIC_NORMAL: ClassicQuestion[] = [
  // ─── SCIENCE ──────────────────────────────────────────────────
  { id:'sci-c-1', type:'classic', cat:'science', difficulty:'normal',
    prompt:'How many hearts does an octopus have?',
    options:['1','2','3','5'], correct:2 },
  { id:'sci-c-2', type:'classic', cat:'science', difficulty:'normal',
    prompt:'At what temperature do Celsius and Fahrenheit read the same number?',
    options:['0°','-40°','-100°','-273°'], correct:1 },
  { id:'sci-c-3', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which planet rotates on its side, with its poles roughly facing the Sun?',
    options:['Saturn','Neptune','Uranus','Venus'], correct:2 },
  { id:'sci-c-4', type:'classic', cat:'science', difficulty:'normal',
    prompt:'A bolt of lightning is approximately how many times hotter than the surface of the Sun?',
    options:['Half as hot','About the same','5 times hotter','25 times hotter'], correct:2 },
  { id:'sci-c-5', type:'classic', cat:'science', difficulty:'normal',
    prompt:'What is the only natural mineral that humans regularly eat?',
    options:['Salt','Iron','Limestone','Quartz'], correct:0 },
  { id:'sci-c-6', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which famous scientist was born on Pi Day (March 14)?',
    options:['Stephen Hawking','Albert Einstein','Isaac Newton','Marie Curie'], correct:1 },
  { id:'sci-c-7', type:'classic', cat:'science', difficulty:'normal',
    prompt:'How long does it take light from the Sun to reach Earth?',
    options:['1 second','8 minutes','3 hours','1 day'], correct:1 },
  { id:'sci-c-8', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which is the only metal that is liquid at room temperature?',
    options:['Lead','Sodium','Mercury','Gallium'], correct:2 },
  { id:'sci-c-9', type:'classic', cat:'science', difficulty:'normal',
    prompt:'How many bones is a human born with — more than as an adult?',
    options:['180','206','270','340'], correct:2 },
  { id:'sci-c-10', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Bananas are slightly radioactive because they contain isotopes of which element?',
    options:['Iodine','Cesium','Potassium','Carbon'], correct:2 },
  { id:'sci-c-11', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which discovery did Alexander Fleming make by accident in 1928?',
    options:['DNA','Penicillin','X-rays','Insulin'], correct:1 },
  { id:'sci-c-12', type:'classic', cat:'science', difficulty:'normal',
    prompt:'A "year" on Mercury — one orbit around the Sun — lasts roughly how many Earth days?',
    options:['30','88','365','687'], correct:1 },
  { id:'sci-c-13', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Honey never spoils. Archaeologists found edible honey in tombs from how long ago?',
    options:['200 years','2,000 years','10,000 years','3,000+ years'], correct:3 },
  { id:'sci-c-14', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which body part has its own immune system, walled off from the rest of the body?',
    options:['Liver','Brain','Bone marrow','Spleen'], correct:1 },

  // ─── INTERNET ─────────────────────────────────────────────────
  { id:'net-c-1', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which programming language is named after a British comedy troupe?',
    options:['Java','Ruby','Python','Erlang'], correct:2 },
  { id:'net-c-2', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Google was originally registered as a research project under what name?',
    options:['BackRub','LinkRank','Pagey','Searcher'], correct:0 },
  { id:'net-c-3', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What did Jack Dorsey\'s very first tweet (2006) say?',
    options:['"hello world"','"just setting up my twttr"','"first!"','"the future is now"'], correct:1 },
  { id:'net-c-4', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What was the first item ever sold on eBay (1995)?',
    options:['A used Mac','A broken laser pointer','A Beanie Baby','A signed baseball'], correct:1 },
  { id:'net-c-5', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which year did the iPhone launch?',
    options:['2003','2005','2007','2009'], correct:2 },
  { id:'net-c-6', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'YouTube was founded in 2005 by three former employees of which company?',
    options:['Google','Yahoo','PayPal','Microsoft'], correct:2 },
  { id:'net-c-7', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Bitcoin\'s creator goes by the pseudonym...',
    options:['Vitalik Buterin','Satoshi Nakamoto','Hal Finney','Craig Wright'], correct:1 },
  { id:'net-c-8', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'HTTP error code 418 was added as a joke. What does it say?',
    options:['"I\'m a teapot"','"Not amused"','"Try again sober"','"Beep boop"'], correct:0 },
  { id:'net-c-9', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which company\'s name was inspired by a character\'s phrase in a Mel Brooks film?',
    options:['Yahoo','Spotify','Spam (the filtering term)','Netflix'], correct:2 },
  { id:'net-c-10', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Who is widely considered the world\'s first computer programmer?',
    options:['Grace Hopper','Ada Lovelace','Alan Turing','Margaret Hamilton'], correct:1 },
  { id:'net-c-11', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Mark Zuckerberg famously turned down Yahoo\'s offer to buy Facebook for...',
    options:['$100M','$500M','$1B','$5B'], correct:2 },
  { id:'net-c-12', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'The "@" symbol was first used in email by Ray Tomlinson in what year?',
    options:['1971','1983','1991','1995'], correct:0 },

  // ─── GEOGRAPHY ────────────────────────────────────────────────
  { id:'geo-c-1', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'What\'s the capital of Australia?',
    options:['Sydney','Canberra','Melbourne','Brisbane'], correct:1 },
  { id:'geo-c-2', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which country has the most natural lakes — over 2 million of them?',
    options:['Russia','Canada','Brazil','Finland'], correct:1 },
  { id:'geo-c-3', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'How many time zones does France span (counting overseas territories)?',
    options:['3','7','12','9'], correct:2 },
  { id:'geo-c-4', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which is the only country in the world whose flag is not rectangular?',
    options:['Switzerland','Vatican City','Nepal','Bhutan'], correct:2 },
  { id:'geo-c-5', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which continent is technically the largest desert on Earth?',
    options:['Africa','Asia','Antarctica','Australia'], correct:2 },
  { id:'geo-c-6', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'The Hawaiian alphabet has how many letters?',
    options:['13','19','22','26'], correct:0 },
  { id:'geo-c-7', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which country has three official capital cities (one each for the executive, legislative, and judicial branches)?',
    options:['Bolivia','Switzerland','Sri Lanka','South Africa'], correct:3 },
  { id:'geo-c-8', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Russia spans how many time zones?',
    options:['7','9','11','15'], correct:2 },
  { id:'geo-c-9', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which country has the longest coastline in the world?',
    options:['Russia','USA','Indonesia','Canada'], correct:3 },
  { id:'geo-c-10', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Mount Kilimanjaro is in which country?',
    options:['Kenya','Tanzania','Ethiopia','Uganda'], correct:1 },
  { id:'geo-c-11', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Istanbul is the only major city in the world built on which two continents?',
    options:['Europe and Africa','Europe and Asia','Asia and Africa','Asia and Oceania'], correct:1 },
  { id:'geo-c-12', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which is the only sea with no coastline?',
    options:['Sargasso Sea','Caspian Sea','Aral Sea','Coral Sea'], correct:0 },

  // ─── RETRO (gaming) ──────────────────────────────────────────
  { id:'ret-c-1', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'In Pac-Man, what color is the ghost CLYDE?',
    options:['Red','Pink','Cyan','Orange'], correct:3 },
  { id:'ret-c-2', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Mario was originally called what — back in his Donkey Kong debut?',
    options:['Plumber Joe','Jumpman','Mr. Video','Hopper'], correct:1 },
  { id:'ret-c-3', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Tetris was invented in 1984 in which country?',
    options:['Japan','USSR','USA','Sweden'], correct:1 },
  { id:'ret-c-4', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which game console is the bestselling of all time?',
    options:['Nintendo Wii','PlayStation 2','Xbox 360','Game Boy'], correct:1 },
  { id:'ret-c-5', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'The Konami Code starts with which two directions?',
    options:['Left, Right','Up, Down','Up, Up','Down, Down'], correct:2 },
  { id:'ret-c-6', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which Final Fantasy was the first released on the original PlayStation in 1997?',
    options:['Final Fantasy V','Final Fantasy VI','Final Fantasy VII','Final Fantasy VIII'], correct:2 },
  { id:'ret-c-7', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'How many Pokémon were in the original 1996 Pokémon Red & Blue?',
    options:['100','151','251','386'], correct:1 },
  { id:'ret-c-8', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'The first 3D Mario game was...',
    options:['Mario Kart 64','Super Mario 64','Mario Sunshine','Mario Party'], correct:1 },
  { id:'ret-c-9', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Halo: Combat Evolved launched alongside which console in 2001?',
    options:['Nintendo GameCube','PlayStation 2','Xbox','Sega Dreamcast'], correct:2 },
  { id:'ret-c-10', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which company released the legendary E.T. game in 1982 — buried by the millions in a New Mexico landfill?',
    options:['Atari','Coleco','Mattel','Nintendo'], correct:0 },
  { id:'ret-c-11', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'In which game did the term "easter egg" (hidden secret) originate?',
    options:['Pac-Man','Adventure (Atari 2600)','Donkey Kong','Pong'], correct:1 },
  { id:'ret-c-12', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'GTA stands for...',
    options:['Grand Theft Auto','Global Travel Association','Game Theory Arcade','Gone The Animation'], correct:0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// DECRYPTOR POOL — typed answers, normalized via norm()
// (Keep answers short — 1-3 words, unambiguous, no homophone traps)
// ─────────────────────────────────────────────────────────────────────────────
const DECRYPTOR_NORMAL: DecryptorQuestion[] = [
  // SCIENCE
  { id:'sci-d-1', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The hardest naturally occurring substance on Earth is the…',
    answer:'DIAMOND' },
  { id:'sci-d-2', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The galaxy that contains our solar system is the…',
    answer:'MILKY WAY' },
  { id:'sci-d-3', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The largest organ in the human body is the…',
    answer:'SKIN' },
  { id:'sci-d-4', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'A scientist who studies earthquakes is called a…',
    answer:'SEISMOLOGIST' },
  { id:'sci-d-5', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'DNA stands for deoxyribonucleic ___',
    answer:'ACID' },

  // INTERNET
  { id:'net-d-1', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'WWW stands for…',
    answer:'WORLD WIDE WEB' },
  { id:'net-d-2', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'The "father of the World Wide Web" — last name only:',
    answer:'BERNERS-LEE' },
  { id:'net-d-3', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'Linux\'s mascot — a penguin named…',
    answer:'TUX' },
  { id:'net-d-4', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'Twitter\'s original name (before vowels):',
    answer:'TWTTR' },

  // GEOGRAPHY
  { id:'geo-d-1', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The country shaped like a boot is…',
    answer:'ITALY' },
  { id:'geo-d-2', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The capital of Iceland is…',
    answer:'REYKJAVIK' },
  { id:'geo-d-3', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The world\'s smallest sovereign state is…',
    answer:'VATICAN CITY' },
  { id:'geo-d-4', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The river that runs through London is the…',
    answer:'THAMES' },

  // RETRO
  { id:'ret-d-1', type:'decryptor', cat:'retro', difficulty:'normal',
    prompt:'Mario\'s plumber brother is…',
    answer:'LUIGI' },
  { id:'ret-d-2', type:'decryptor', cat:'retro', difficulty:'normal',
    prompt:'The yellow electric Pokémon mascot is…',
    answer:'PIKACHU' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAINFRAME POOL — harder, mixed types. The finale.
// ─────────────────────────────────────────────────────────────────────────────
const MAINFRAME_POOL: Question[] = [
  { id:'mf-1', type:'classic', cat:'science', difficulty:'mainframe',
    prompt:'In what year was the Higgs boson particle experimentally confirmed?',
    options:['1995','2008','2012','2018'], correct:2 },
  { id:'mf-2', type:'classic', cat:'internet', difficulty:'mainframe',
    prompt:'What was the very first registered .com domain (1985)?',
    options:['ibm.com','symbolics.com','apple.com','att.com'], correct:1 },
  { id:'mf-3', type:'decryptor', cat:'geography', difficulty:'mainframe',
    prompt:'The country with more pyramids than Egypt is…',
    answer:'SUDAN' },
  { id:'mf-4', type:'classic', cat:'retro', difficulty:'mainframe',
    prompt:'What was the first commercially sold home video game console?',
    options:['Atari 2600','Magnavox Odyssey','Coleco Telstar','Fairchild Channel F'], correct:1 },
  { id:'mf-5', type:'classic', cat:'science', difficulty:'mainframe',
    prompt:'Which planet has the most moons in our solar system (currently confirmed)?',
    options:['Jupiter','Saturn','Uranus','Neptune'], correct:1 },
  { id:'mf-6', type:'decryptor', cat:'internet', difficulty:'mainframe',
    prompt:'The U.S. agency where TCP/IP was developed in the 1970s:',
    answer:'DARPA' },
  { id:'mf-7', type:'classic', cat:'geography', difficulty:'mainframe',
    prompt:'The deepest known point in any ocean is in the Mariana Trench. What is its name?',
    options:['Tonga Deep','Java Trench','Challenger Deep','Sirena Hollow'], correct:2 },
  { id:'mf-8', type:'classic', cat:'science', difficulty:'mainframe',
    prompt:'What rare condition causes a person to be born with two different colored eyes?',
    options:['Albinism','Heterochromia','Vitiligo','Aniridia'], correct:1 },
  { id:'mf-9', type:'decryptor', cat:'retro', difficulty:'mainframe',
    prompt:'The first commercially successful video game (Atari, 1972) was…',
    answer:'PONG' },
  { id:'mf-10', type:'classic', cat:'internet', difficulty:'mainframe',
    prompt:'Which language was the first to be created specifically for the World Wide Web?',
    options:['JavaScript','HTML','PHP','Perl'], correct:1 },
];

export const QUESTIONS: Question[] = [...CLASSIC_NORMAL, ...DECRYPTOR_NORMAL, ...MAINFRAME_POOL];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

// ─────────────────────────────────────────────────────────────────────────────
// pickRoundQuestions: deterministic per seed (room id) so reconnect gets the
// same set. Uses an LCG seeded shuffle from the prototype's fakeQRCells.
// ─────────────────────────────────────────────────────────────────────────────

function seededShuffle<T>(items: T[], seed: string): T[] {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type RoundPick = {
  questions: Question[];
  mainframe: Question;
};

export type PickSettings = {
  categories: Category[];
  rounds_count: number;
};

export function pickRoundQuestions(seed: string, settings: PickSettings): RoundPick {
  const allowed = new Set(settings.categories);
  const eligible = [...CLASSIC_NORMAL, ...DECRYPTOR_NORMAL].filter((q) =>
    allowed.has(q.cat),
  );
  // Fall back to the full pool if the host's selection somehow ends up
  // empty — shouldn't happen (server-side validation rejects 0 cats) but
  // safer than throwing during gameplay.
  const pool = eligible.length > 0 ? eligible : [...CLASSIC_NORMAL, ...DECRYPTOR_NORMAL];
  const shuffled = seededShuffle(pool, seed);
  const questions = shuffled.slice(0, settings.rounds_count);
  // Mainframe pool unfiltered — every game gets a mainframe regardless
  // of category settings (the mainframe is its own pool, deliberately
  // small + curated).
  const mainframe = seededShuffle(MAINFRAME_POOL, seed + '-mf')[0];
  return { questions, mainframe };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers shared with grading
// ─────────────────────────────────────────────────────────────────────────────

/** Strip everything except A-Z / 0-9, uppercase. Matches prototype `norm()`. */
export function norm(s: string | null | undefined): string {
  return (s ?? '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Returns true if `answer` is correct for question `q`. */
export function isCorrect(q: Question, answer: unknown): boolean {
  if (answer == null) return false;
  if (q.type === 'classic') return answer === q.correct;
  if (q.type === 'decryptor') return norm(String(answer)) === norm(q.answer);
  return false;
}

/**
 * Score formula (matches prototype):
 *   base = 500
 *   speed = floor(timeRemaining * 50)
 *   mult = 1 + streak * 0.2
 *   score = floor((base + speed) * mult)
 */
export function calcScore(timeRemaining: number, streakAfter: number): number {
  const base = 500;
  const speed = Math.floor(Math.max(0, timeRemaining) * 50);
  const mult = 1 + streakAfter * 0.2;
  return Math.floor((base + speed) * mult);
}
