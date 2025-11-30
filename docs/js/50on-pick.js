/**
 * 五十音表の文字拾いドリル
 * 五十音表のマークされたマスから文字を順に読み取る
 */
class GojuonPickDrill extends DrillBase {
    constructor() {
        super('50on-pick');

        // 五十音表の定義（横向き：行=あいうえお、列=あかさたな...わ）
        // 右端があいうえお、左端がん
        // 行: あ列, い列, う列, え列, お列
        // 列: ん, わ段, ら段, や段, ま段, は段, な段, た段, さ段, か段, あ段（右から左）
        this.gojuonTable = [
            ['ん', 'わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'],
            ['',   '',   'り', '',   'み', 'ひ', 'に', 'ち', 'し', 'き', 'い'],
            ['',   '',   'る', 'ゆ', 'む', 'ふ', 'ぬ', 'つ', 'す', 'く', 'う'],
            ['',   '',   'れ', '',   'め', 'へ', 'ね', 'て', 'せ', 'け', 'え'],
            ['',   'を', 'ろ', 'よ', 'も', 'ほ', 'の', 'と', 'そ', 'こ', 'お']
        ];

        // 文字から位置へのマッピングを作成
        this.charToPosition = {};
        // 有効な文字のリスト（1文字モード用）
        this.validChars = [];
        // 「た」～「も」の文字リスト（特訓モード用）
        this.taMoChars = [];
        for (let row = 0; row < this.gojuonTable.length; row++) {
            for (let col = 0; col < this.gojuonTable[row].length; col++) {
                const char = this.gojuonTable[row][col];
                if (char) {
                    this.charToPosition[char] = { row, col };
                    this.validChars.push(char);
                    // col 4～7 は「た」～「も」の範囲（た、な、は、ま行）
                    if (col >= 4 && col <= 7) {
                        this.taMoChars.push(char);
                    }
                }
            }
        }

        // 出題される単語リスト（外部ファイルから読み込み）
        this.words = window.GOJUON_PICK_WORDS || [];

        // モード（word: 単語モード, single: 1文字モード, ta-mo: 「た」～「も」特訓モード）
        this.mode = 'word';

        // 重複出題防止用
        this.lastCol = null;   // 1文字系モード用：前回のcol
        this.lastWord = null;  // 単語モード用：前回の単語
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateQuestion() {
        if (this.mode === 'single') {
            return this.generateSingleCharQuestion();
        } else if (this.mode === 'ta-mo') {
            return this.generateTaMoQuestion();
        } else {
            return this.generateWordQuestion();
        }
    }

    /**
     * 単語モードの問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateWordQuestion() {
        const word = DrillUtils.getRandomElementExcluding(this.words, this.lastWord);
        this.lastWord = word;

        // 各文字の位置を取得し、数字を割り当てる
        const markedCells = [];
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const position = this.charToPosition[char];
            if (position) {
                markedCells.push({
                    row: position.row,
                    col: position.col,
                    number: i + 1
                });
            }
        }

        return {
            question: JSON.stringify(markedCells),
            answer: word
        };
    }

    /**
     * 1文字モードの問題を生成する（共通処理）
     * @param {Array} charList - 選択対象の文字配列
     * @returns {Object} { question: Object, answer: string }
     */
    generateSingleCharQuestionFromList(charList) {
        const char = DrillUtils.getRandomElementExcluding(
            charList,
            this.lastCol,
            c => this.charToPosition[c].col
        );
        const position = this.charToPosition[char];
        this.lastCol = position.col;

        const markedCells = [{
            row: position.row,
            col: position.col,
            number: 1
        }];

        return {
            question: JSON.stringify(markedCells),
            answer: char
        };
    }

    /**
     * 1文字モードの問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateSingleCharQuestion() {
        return this.generateSingleCharQuestionFromList(this.validChars);
    }

    /**
     * 「た」～「も」特訓モードの問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateTaMoQuestion() {
        return this.generateSingleCharQuestionFromList(this.taMoChars);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GojuonPickDrill = GojuonPickDrill;
}
