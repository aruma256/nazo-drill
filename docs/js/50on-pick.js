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
        // 「は」～「を」の文字リスト（特訓モード用）
        this.haWoChars = [];
        for (let row = 0; row < this.gojuonTable.length; row++) {
            for (let col = 0; col < this.gojuonTable[row].length; col++) {
                const char = this.gojuonTable[row][col];
                if (char) {
                    this.charToPosition[char] = { row, col };
                    this.validChars.push(char);
                    // col 1～5 は「は」～「を」の範囲（は、ま、や、ら、わ行）※「ん」は含まない
                    if (col >= 1 && col <= 5) {
                        this.haWoChars.push(char);
                    }
                }
            }
        }

        // 出題される単語リスト（外部ファイルから読み込み）
        this.words = window.GOJUON_PICK_WORDS || [];

        // モード（word: 単語モード, single: 1文字モード, ha-wo: 「は」～「を」特訓モード）
        this.mode = 'word';
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateQuestion() {
        if (this.mode === 'single') {
            return this.generateSingleCharQuestion();
        } else if (this.mode === 'ha-wo') {
            return this.generateHaWoQuestion();
        } else {
            return this.generateWordQuestion();
        }
    }

    /**
     * 単語モードの問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateWordQuestion() {
        // ランダムに単語を選択
        const word = DrillUtils.getRandomElement(this.words);

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
        const char = DrillUtils.getRandomElement(charList);
        const position = this.charToPosition[char];

        const markedCells = [{
            row: position.row,
            col: position.col,
            number: '●'
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
     * 「は」～「を」特訓モードの問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateHaWoQuestion() {
        return this.generateSingleCharQuestionFromList(this.haWoChars);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GojuonPickDrill = GojuonPickDrill;
}
