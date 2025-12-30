/**
 * 数字→アルファベット ドリル用 単語リスト
 *
 * 条件:
 * - 中学校で習う英単語
 * - 3文字または4文字
 * - 1単語に同じ文字を含まない
 */
export const NUMBER_TO_ALPHA_WORDS: readonly string[] = [
  // 3文字の単語
  'ACE', 'ACT', 'AGE', 'AIR', 'ANT', 'ARM', 'ART',
  'BAD', 'BAG', 'BAT', 'BED', 'BIG', 'BOX', 'BOY', 'BUG', 'BUS', 'BUT', 'BUY',
  'CAN', 'CAP', 'CAR', 'CAT', 'COW', 'CRY', 'CUP', 'CUT',
  'DAY', 'DIG', 'DOG', 'DOT', 'DRY',
  'EAR', 'EAT', 'EGG', 'ELF', 'END', 'EYE',
  'FAN', 'FAR', 'FAT', 'FIT', 'FLY', 'FOG', 'FOR', 'FOX', 'FUN',
  'GAP', 'GAS', 'GEM', 'GET', 'GUN', 'GUY', 'GYM',
  'HAD', 'HAM', 'HAS', 'HAT', 'HEN', 'HID', 'HIM', 'HIS', 'HIT', 'HOP', 'HOT', 'HUG',
  'ICE', 'INK',
  'JAM', 'JET', 'JOB', 'JOG', 'JOY',
  'KEY', 'KID', 'KIT',
  'LAW', 'LAY', 'LED', 'LEG', 'LET', 'LIP', 'LOG', 'LOT', 'LOW',
  'MAD', 'MAN', 'MAP', 'MAT', 'MEN', 'MET', 'MIX', 'MOM', 'MUD',
  'NET', 'NEW', 'NOT', 'NOW', 'NUT',
  'OIL', 'OLD', 'ONE', 'ORB', 'OUR', 'OUT', 'OWL', 'OWN',
  'PAN', 'PAY', 'PEN', 'PET', 'PIE', 'PIG', 'PIN', 'PIT', 'POT', 'PUT',
  'RAN', 'RAT', 'RAW', 'RAY', 'RED', 'ROW', 'RUN',
  'SAD', 'SAT', 'SAW', 'SAY', 'SEA', 'SET', 'SHE', 'SHY', 'SIT', 'SIX', 'SKI', 'SKY', 'SON', 'SOY', 'SPY', 'SUM', 'SUN',
  'TAG', 'TAP', 'TAX', 'TEA', 'TEN', 'THE', 'TIE', 'TIP', 'TOE', 'TON', 'TOP', 'TOY', 'TRY',
  'USE',
  'VAN',
  'WAR', 'WAS', 'WAX', 'WAY', 'WEB', 'WED', 'WET', 'WHO', 'WHY', 'WIN', 'WON',
  'YES', 'YET',
  'ZIP', 'ZOO',
  // 4文字の単語
  'ACID', 'AREA', 'AUTO',
  'BACK', 'BAKE', 'BAND', 'BANK', 'BASE', 'BATH', 'BEAM', 'BEAN', 'BEAR', 'BEAT', 'BELT', 'BEST', 'BIRD', 'BITE', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOLD', 'BOLT', 'BONE', 'BOOK', 'BORN', 'BOTH', 'BULK', 'BUMP', 'BURN', 'BUSY',
  'CAGE', 'CAKE', 'CAMP', 'CARD', 'CARE', 'CASE', 'CASH', 'CITY', 'CLUB', 'COAT', 'CODE', 'COIN', 'COLD', 'COOL', 'COPY', 'CORN', 'COST', 'CURE',
  'DARK', 'DATE', 'DEEP', 'DESK', 'DISH', 'DISK', 'DIVE', 'DONE', 'DOOR', 'DOWN', 'DRAW', 'DROP', 'DRUG', 'DRUM', 'DUTY',
  'EARN', 'EAST', 'EASY', 'EVEN', 'EVIL', 'EXAM',
  'FACE', 'FACT', 'FAIL', 'FAIR', 'FAKE', 'FALL', 'FAME', 'FARM', 'FAST', 'FATE', 'FEAR', 'FEEL', 'FILE', 'FILM', 'FIND', 'FINE', 'FIRE', 'FISH', 'FLAG', 'FLAT', 'FLOW', 'FOOD', 'FORK', 'FORM', 'FOUR', 'FREE', 'FROG', 'FUEL', 'FULL', 'FUND',
  'GAIN', 'GAME', 'GATE', 'GEAR', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GLUE', 'GOAL', 'GOAT', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAB', 'GRAY', 'GREW', 'GROW',
  'HAIR', 'HALF', 'HALL', 'HAND', 'HANG', 'HARD', 'HARM', 'HATE', 'HAVE', 'HEAD', 'HEAL', 'HEAR', 'HEAT', 'HELD', 'HELP', 'HERE', 'HERO', 'HIDE', 'HIGH', 'HILL', 'HINT', 'HOLD', 'HOLE', 'HOME', 'HOOK', 'HOPE', 'HOUR', 'HUGE', 'HUNT', 'HURT',
  'ICON', 'IDEA', 'INFO', 'IRON', 'ITEM',
  'JAIL', 'JOIN', 'JOKE', 'JUMP', 'JUNE', 'JUST',
  'KICK', 'KILL', 'KIND', 'KING', 'KNOW',
  'LACK', 'LADY', 'LAKE', 'LAMP', 'LAND', 'LAST', 'LATE', 'LEAD', 'LEAF', 'LEFT', 'LESS', 'LIFE', 'LIFT', 'LIKE', 'LINE', 'LINK', 'LION', 'LIST', 'LIVE', 'LOAD', 'LOCK', 'LONG', 'LOOK', 'LOSE', 'LOSS', 'LOST', 'LOUD', 'LOVE', 'LUCK',
  'MADE', 'MAIL', 'MAIN', 'MAKE', 'MALE', 'MANY', 'MARK', 'MASK', 'MATE', 'MEAL', 'MEAN', 'MEAT', 'MENU', 'MILE', 'MILK', 'MIND', 'MINE', 'MISS', 'MODE', 'MOOD', 'MOON', 'MORE', 'MOST', 'MOVE', 'MUCH', 'MUST',
  'NAIL', 'NAME', 'NAVY', 'NEAR', 'NECK', 'NEED', 'NEST', 'NEWS', 'NEXT', 'NICE', 'NINE', 'NONE', 'NOON', 'NOSE', 'NOTE',
  'OKAY', 'ONCE', 'ONLY', 'OPEN', 'OVEN', 'OVER',
  'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PEAK', 'PICK', 'PINK', 'PIPE', 'PLAN', 'PLAY', 'PLUS', 'POEM', 'POLE', 'POND', 'POOL', 'PORT', 'POSE', 'POST', 'PRAY', 'PULL', 'PUMP', 'PURE', 'PUSH',
  'RACE', 'RAIL', 'RAIN', 'RANK', 'RATE', 'READ', 'REAL', 'RICE', 'RICH', 'RIDE', 'RING', 'RISE', 'RISK', 'ROAD', 'ROCK', 'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'RULE', 'RUSH',
  'SAFE', 'SALE', 'SALT', 'SAME', 'SAND', 'SAVE', 'SEAL', 'SEAT', 'SEED', 'SEEK', 'SELF', 'SEND', 'SENT', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SILK', 'SING', 'SITE', 'SIZE', 'SKIN', 'SKIP', 'SLOW', 'SNAP', 'SNOW', 'SOFT', 'SOLD', 'SOME', 'SONG', 'SOON', 'SOUL', 'SOUP', 'SPIN', 'SPOT', 'STAR', 'STAY', 'STEP', 'STOP', 'SUIT', 'SWAN', 'SWIM',
  'TAIL', 'TAKE', 'TALE', 'TALK', 'TALL', 'TANK', 'TAPE', 'TASK', 'TAXI', 'TEAM', 'TECH', 'TELL', 'TENT', 'TEST', 'TEXT', 'TILE', 'TIME', 'TINY', 'TIRE', 'TONE', 'TOOL', 'TOUR', 'TOWN', 'TRAP', 'TRAY', 'TREE', 'TRIO', 'TRIP', 'TRUE', 'TUBE', 'TUNE', 'TURN', 'TWIN', 'TYPE',
  'UNDO', 'UNIT', 'USER',
  'VERB', 'VERY', 'VIEW', 'VOTE',
  'WAIT', 'WAKE', 'WALK', 'WALL', 'WANT', 'WARM', 'WARN', 'WARS', 'WASH', 'WAVE', 'WEAK', 'WEAR', 'WEEK', 'WELL', 'WEST', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WIPE', 'WIRE', 'WISE', 'WISH', 'WITH', 'WOLF', 'WOOD', 'WOOL', 'WORD', 'WORK', 'WRAP',
  'YARD', 'YEAR', 'YELL', 'YOGA', 'YOUR',
  'ZERO', 'ZONE', 'ZOOM',
]
