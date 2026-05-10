/**
 * Question pool for Noghurt Brain.
 *
 * Placeholder content for v1; replace with curated questions later.
 * Type defs per docs/ARCHITECTURE.md § 8.
 *
 *   ~50 Classic + ~15 Decryptor (normal difficulty)
 *   ~10 Mainframe (hard, mixed types)
 *
 * Categories: science / internet / geography / retro
 * (history + pop_culture types are reserved for future expansion.)
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
// NORMAL POOL — Classic
// ─────────────────────────────────────────────────────────────────────────────
const CLASSIC_NORMAL: ClassicQuestion[] = [
  // SCIENCE
  { id:'sci-c-1', type:'classic', cat:'science', difficulty:'normal',
    prompt:'How far does light travel in 1 second (approximately)?',
    options:['30,000 km','300,000 km','3,000,000 km','30,000,000 km'], correct:1 },
  { id:'sci-c-2', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which gas makes up about 78% of Earth\'s atmosphere?',
    options:['Oxygen','Carbon Dioxide','Nitrogen','Hydrogen'], correct:2 },
  { id:'sci-c-3', type:'classic', cat:'science', difficulty:'normal',
    prompt:'What is the chemical symbol for gold?',
    options:['Go','Gd','Au','Ag'], correct:2 },
  { id:'sci-c-4', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which planet has the most moons (as currently confirmed)?',
    options:['Jupiter','Saturn','Uranus','Neptune'], correct:1 },
  { id:'sci-c-5', type:'classic', cat:'science', difficulty:'normal',
    prompt:'How many bones are in the adult human body?',
    options:['186','206','226','246'], correct:1 },
  { id:'sci-c-6', type:'classic', cat:'science', difficulty:'normal',
    prompt:'What pH value is considered neutral?',
    options:['0','7','14','10'], correct:1 },
  { id:'sci-c-7', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which scientist proposed the laws of motion?',
    options:['Einstein','Galileo','Newton','Darwin'], correct:2 },
  { id:'sci-c-8', type:'classic', cat:'science', difficulty:'normal',
    prompt:'What is the most abundant element in the universe?',
    options:['Oxygen','Carbon','Helium','Hydrogen'], correct:3 },
  { id:'sci-c-9', type:'classic', cat:'science', difficulty:'normal',
    prompt:'What is the speed of sound at sea level (approximately)?',
    options:['343 m/s','550 m/s','1,200 m/s','1 m/s'], correct:0 },
  { id:'sci-c-10', type:'classic', cat:'science', difficulty:'normal',
    prompt:'Which blood type is the universal donor?',
    options:['A+','O+','AB-','O-'], correct:3 },
  { id:'sci-c-11', type:'classic', cat:'science', difficulty:'normal',
    prompt:'How many chambers does a human heart have?',
    options:['2','3','4','5'], correct:2 },
  { id:'sci-c-12', type:'classic', cat:'science', difficulty:'normal',
    prompt:'What\'s the boiling point of water at sea level (°C)?',
    options:['90','100','120','212'], correct:1 },

  // INTERNET
  { id:'net-c-1', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What does "HTTP 404" mean?',
    options:['Server Error','Forbidden','Not Found','Redirect'], correct:2 },
  { id:'net-c-2', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which company created the React JavaScript library?',
    options:['Google','Microsoft','Facebook','Twitter'], correct:2 },
  { id:'net-c-3', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What does "TCP" stand for?',
    options:['Transit Cluster Protocol','Transmission Control Protocol','Total Carrier Pipe','Tracked Channel Provider'], correct:1 },
  { id:'net-c-4', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which port is HTTPS traffic typically on?',
    options:['80','443','8080','22'], correct:1 },
  { id:'net-c-5', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What year was YouTube founded?',
    options:['2003','2005','2007','2009'], correct:1 },
  { id:'net-c-6', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What\'s the maximum length of a tweet on X (formerly Twitter, free tier)?',
    options:['140','280','500','1000'], correct:1 },
  { id:'net-c-7', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Who founded Amazon?',
    options:['Bill Gates','Steve Jobs','Jeff Bezos','Elon Musk'], correct:2 },
  { id:'net-c-8', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What does "DNS" stand for?',
    options:['Domain Name System','Data Network Service','Dynamic Node Server','Direct Name Source'], correct:0 },
  { id:'net-c-9', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which programming language was created by Brendan Eich in 1995?',
    options:['Python','Ruby','JavaScript','PHP'], correct:2 },
  { id:'net-c-10', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What does "API" stand for?',
    options:['Active Page Index','Application Programming Interface','Automatic Public Identifier','Advanced Process Image'], correct:1 },
  { id:'net-c-11', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'Which company owns LinkedIn?',
    options:['Google','Meta','Microsoft','Salesforce'], correct:2 },
  { id:'net-c-12', type:'classic', cat:'internet', difficulty:'normal',
    prompt:'What\'s the most popular open-source web server?',
    options:['Nginx','IIS','LiteSpeed','Caddy'], correct:0 },

  // GEOGRAPHY
  { id:'geo-c-1', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'What is the capital of Australia?',
    options:['Sydney','Melbourne','Canberra','Perth'], correct:2 },
  { id:'geo-c-2', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which is the longest river in the world?',
    options:['Amazon','Nile','Yangtze','Mississippi'], correct:1 },
  { id:'geo-c-3', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Mount Everest is on the border of which two countries?',
    options:['India & Nepal','China & Nepal','China & India','Bhutan & Nepal'], correct:1 },
  { id:'geo-c-4', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which African country has the most pyramids?',
    options:['Egypt','Sudan','Libya','Algeria'], correct:1 },
  { id:'geo-c-5', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which sea is the saltiest body of water on Earth?',
    options:['Dead Sea','Red Sea','Black Sea','Caspian Sea'], correct:0 },
  { id:'geo-c-6', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'What\'s the capital of Canada?',
    options:['Toronto','Vancouver','Ottawa','Montreal'], correct:2 },
  { id:'geo-c-7', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which continent has the most countries?',
    options:['Asia','Europe','Africa','South America'], correct:2 },
  { id:'geo-c-8', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which country has Tokyo as its capital?',
    options:['China','Japan','South Korea','Vietnam'], correct:1 },
  { id:'geo-c-9', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'How many time zones does Russia span?',
    options:['7','9','11','13'], correct:2 },
  { id:'geo-c-10', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'What is the largest desert on Earth (by area)?',
    options:['Sahara','Gobi','Antarctic','Arabian'], correct:2 },
  { id:'geo-c-11', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'Which ocean is the deepest?',
    options:['Atlantic','Indian','Pacific','Arctic'], correct:2 },
  { id:'geo-c-12', type:'classic', cat:'geography', difficulty:'normal',
    prompt:'What\'s the smallest country in the world (by area)?',
    options:['Monaco','Vatican City','San Marino','Liechtenstein'], correct:1 },

  // RETRO
  { id:'ret-c-1', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'In Pac-Man, what color is the ghost CLYDE?',
    options:['Red','Pink','Cyan','Orange'], correct:3 },
  { id:'ret-c-2', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which company released the original Game Boy?',
    options:['Sega','Nintendo','Sony','Atari'], correct:1 },
  { id:'ret-c-3', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'What year did the Sony PlayStation 1 release in North America?',
    options:['1993','1995','1997','1999'], correct:1 },
  { id:'ret-c-4', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'In Tetris, what is the I-shaped piece called?',
    options:['Stick','Line','Bar','I-piece'], correct:3 },
  { id:'ret-c-5', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'What is the bestselling Nintendo console of all time?',
    options:['Wii','Game Boy','Nintendo DS','Switch'], correct:2 },
  { id:'ret-c-6', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which character is the protagonist of "The Legend of Zelda" series?',
    options:['Zelda','Link','Sheik','Ganondorf'], correct:1 },
  { id:'ret-c-7', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'How many ghosts are in the original Pac-Man?',
    options:['3','4','5','6'], correct:1 },
  { id:'ret-c-8', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which game introduced the term "easter egg" (hidden message in software)?',
    options:['Pong','Adventure (Atari 2600)','Space Invaders','Donkey Kong'], correct:1 },
  { id:'ret-c-9', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'What\'s the name of Mario\'s dinosaur companion?',
    options:['Bowser','Yoshi','Toad','Luigi'], correct:1 },
  { id:'ret-c-10', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which console had a controller with three handles?',
    options:['Sega Saturn','Nintendo 64','Atari Jaguar','3DO'], correct:1 },
  { id:'ret-c-11', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'What is the bestselling video game of all time?',
    options:['Tetris','Minecraft','GTA V','Wii Sports'], correct:1 },
  { id:'ret-c-12', type:'classic', cat:'retro', difficulty:'normal',
    prompt:'Which game series features the character Master Chief?',
    options:['Doom','Halo','Call of Duty','Destiny'], correct:1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// NORMAL POOL — Decryptor (typed answers, normalized via norm())
// ─────────────────────────────────────────────────────────────────────────────
const DECRYPTOR_NORMAL: DecryptorQuestion[] = [
  // SCIENCE
  { id:'sci-d-1', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The acronym DNA stands for…', answer:'DEOXYRIBONUCLEIC ACID' },
  { id:'sci-d-2', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The largest organ in the human body is the…', answer:'SKIN' },
  { id:'sci-d-3', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The unit of electrical resistance is the…', answer:'OHM' },
  { id:'sci-d-4', type:'decryptor', cat:'science', difficulty:'normal',
    prompt:'The galaxy that contains our solar system is the…', answer:'MILKY WAY' },

  // INTERNET
  { id:'net-d-1', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'WWW stands for…', answer:'WORLD WIDE WEB' },
  { id:'net-d-2', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'The CEO of Tesla and SpaceX is named…', answer:'ELON MUSK' },
  { id:'net-d-3', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'JSON stands for JavaScript ___ ___', answer:'OBJECT NOTATION' },
  { id:'net-d-4', type:'decryptor', cat:'internet', difficulty:'normal',
    prompt:'The Linux mascot is a penguin named…', answer:'TUX' },

  // GEOGRAPHY
  { id:'geo-d-1', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The currency of Japan is the…', answer:'YEN' },
  { id:'geo-d-2', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The capital of France is…', answer:'PARIS' },
  { id:'geo-d-3', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The world\'s largest country by area is…', answer:'RUSSIA' },
  { id:'geo-d-4', type:'decryptor', cat:'geography', difficulty:'normal',
    prompt:'The Eiffel Tower is in this city:', answer:'PARIS' },

  // RETRO
  { id:'ret-d-1', type:'decryptor', cat:'retro', difficulty:'normal',
    prompt:'Mario\'s plumber brother is named…', answer:'LUIGI' },
  { id:'ret-d-2', type:'decryptor', cat:'retro', difficulty:'normal',
    prompt:'The "fastest hedgehog alive" is named…', answer:'SONIC' },
  { id:'ret-d-3', type:'decryptor', cat:'retro', difficulty:'normal',
    prompt:'In Minecraft, you mine this material to craft a sword:', answer:'IRON' },
  { id:'ret-d-4', type:'decryptor', cat:'retro', difficulty:'normal',
    prompt:'The Pokémon mascot is an electric mouse named…', answer:'PIKACHU' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAINFRAME POOL — harder questions, mixed types
// ─────────────────────────────────────────────────────────────────────────────
const MAINFRAME_POOL: Question[] = [
  { id:'mf-1', type:'classic', cat:'science', difficulty:'mainframe',
    prompt:'In what year was the Higgs boson particle experimentally confirmed?',
    options:['1995','2008','2012','2018'], correct:2 },
  { id:'mf-2', type:'classic', cat:'internet', difficulty:'mainframe',
    prompt:'What was the first registered .com domain?',
    options:['ibm.com','apple.com','symbolics.com','hp.com'], correct:2 },
  { id:'mf-3', type:'classic', cat:'science', difficulty:'mainframe',
    prompt:'Which particle has no electric charge AND virtually no mass?',
    options:['Electron','Proton','Neutron','Neutrino'], correct:3 },
  { id:'mf-4', type:'classic', cat:'retro', difficulty:'mainframe',
    prompt:'The first commercially successful video game was…',
    options:['Pong','Spacewar!','Tennis for Two','Computer Space'], correct:0 },
  { id:'mf-5', type:'decryptor', cat:'geography', difficulty:'mainframe',
    prompt:'The deepest point in any ocean is the ___ ___ Trench.',
    answer:'MARIANA' },
  { id:'mf-6', type:'classic', cat:'internet', difficulty:'mainframe',
    prompt:'In what year did the Mosaic web browser launch (a precursor to Netscape)?',
    options:['1991','1993','1995','1997'], correct:1 },
  { id:'mf-7', type:'decryptor', cat:'science', difficulty:'mainframe',
    prompt:'The smallest unit of life is the…', answer:'CELL' },
  { id:'mf-8', type:'classic', cat:'geography', difficulty:'mainframe',
    prompt:'Which country has three capital cities?',
    options:['South Africa','Bolivia','Sri Lanka','Nigeria'], correct:0 },
  { id:'mf-9', type:'classic', cat:'retro', difficulty:'mainframe',
    prompt:'What was the first home video-game console released commercially?',
    options:['Atari 2600','Magnavox Odyssey','Coleco Telstar','Fairchild Channel F'], correct:1 },
  { id:'mf-10', type:'decryptor', cat:'internet', difficulty:'mainframe',
    prompt:'The TCP/IP protocol family was developed at this US agency in the 70s.', answer:'DARPA' },
];

export const QUESTIONS: Question[] = [...CLASSIC_NORMAL, ...DECRYPTOR_NORMAL, ...MAINFRAME_POOL];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

// ─────────────────────────────────────────────────────────────────────────────
// pickRoundQuestions: deterministic per seed (room id) so reconnect gets the
// same set. Uses the prototype's LCG pattern.
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

export function pickRoundQuestions(seed: string, normalCount = 5): RoundPick {
  const normalPool = [...CLASSIC_NORMAL, ...DECRYPTOR_NORMAL];
  const shuffled = seededShuffle(normalPool, seed);
  const questions = shuffled.slice(0, normalCount);
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
 *
 * Streak passed in is the streak BEFORE this question (so first correct
 * answer of a run gets mult=1.2 if you pass streak=1).
 */
export function calcScore(timeRemaining: number, streakAfter: number): number {
  const base = 500;
  const speed = Math.floor(Math.max(0, timeRemaining) * 50);
  const mult = 1 + streakAfter * 0.2;
  return Math.floor((base + speed) * mult);
}
