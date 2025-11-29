/**
 * 数字toアルファベット ドリル
 * 1→A, 2→B, 3→C ... 26→Z と変換
 */
class NumberToAlphaDrill extends DrillBase {
    constructor() {
        super('123-abc');

        // EJOTY（5の倍数）の定義
        this.ejotyNumbers = [5, 10, 15, 20, 25]; // E, J, O, T, Y

        // 出題される単語リスト（外部ファイルから読み込み）
        this.words = window.NUMBER_TO_ALPHA_WORDS || [];

        // モード（ejoty: EJOTY特訓モード, single: 1文字モード, word: 単語モード）
        this.mode = 'single';

        // 重複出題防止用
        this.lastNumber = null; // 1文字系モード用
        this.lastWord = null;   // 単語モード用
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateQuestion() {
        if (this.mode === 'ejoty') {
            return this.generateEjotyQuestion();
        } else if (this.mode === 'word') {
            return this.generateWordQuestion();
        } else {
            return this.generateSingleQuestion();
        }
    }

    /**
     * EJOTY特訓モードの問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateEjotyQuestion() {
        const number = DrillUtils.getRandomElementExcluding(this.ejotyNumbers, this.lastNumber);
        this.lastNumber = number;

        const answer = DrillUtils.numberToAlpha(number);

        return {
            question: number.toString(),
            answer: answer
        };
    }

    /**
     * 1文字モードの問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateSingleQuestion() {
        // 1〜26のランダムな数字を生成（前回と異なるもの）
        let number;
        do {
            number = DrillUtils.getRandomInt(1, 26);
        } while (number === this.lastNumber);

        this.lastNumber = number;

        const answer = DrillUtils.numberToAlpha(number);

        return {
            question: number.toString(),
            answer: answer
        };
    }

    /**
     * 単語モードの問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateWordQuestion() {
        const word = DrillUtils.getRandomElementExcluding(this.words, this.lastWord);
        this.lastWord = word;

        // 各文字を数字に変換
        const numbers = [];
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const number = char.charCodeAt(0) - DrillUtils.ASCII_CODE_A + 1;
            numbers.push(number);
        }

        return {
            question: numbers.join(', '),
            answer: word
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.NumberToAlphaDrill = NumberToAlphaDrill;
}
