/**
 * ナゾドリル 共通ユーティリティ
 */

/**
 * 定数
 */
const ASCII_CODE_A = 65; // 'A'のASCIIコード

/**
 * ドリルの基底クラス
 */
class DrillBase {
    constructor(drillName) {
        this.drillName = drillName;
        this.currentQuestion = null;
        this.previousQuestion = null;
        this.score = 0;
        this.totalQuestions = 0;
        this.mode = null;
    }

    /**
     * モードを設定する
     * @param {string} mode - モード
     */
    setMode(mode) {
        this.mode = mode;
    }

    /**
     * 問題を生成する（サブクラスでオーバーライド）
     * @returns {Object} { question: string, answer: string, options?: string[] }
     */
    generateQuestion() {
        throw new Error('generateQuestion() must be implemented by subclass');
    }

    /**
     * 問題を出題する（前回と同じ問題を避ける）
     */
    presentQuestion() {
        const maxRetries = 100;
        let newQuestion;
        let retries = 0;

        // 前回と異なる問題が出るまで生成（最大100回）
        do {
            newQuestion = this.generateQuestion();
            retries++;
        } while (
            this.previousQuestion &&
            newQuestion.question === this.previousQuestion.question &&
            retries < maxRetries
        );

        this.currentQuestion = newQuestion;
        this.previousQuestion = newQuestion;
        this.totalQuestions++;
        return this.currentQuestion;
    }

    /**
     * 回答をチェックする
     * @param {string} userAnswer - ユーザーの回答
     * @returns {boolean} 正解ならtrue
     */
    checkAnswer(userAnswer) {
        if (!this.currentQuestion) {
            throw new Error('No question has been presented');
        }

        const isCorrect = this.normalizeAnswer(userAnswer) ===
                         this.normalizeAnswer(this.currentQuestion.answer);

        if (isCorrect) {
            this.score++;
        }

        return isCorrect;
    }

    /**
     * 回答を正規化する（大文字小文字、空白などを統一）
     * @param {string} answer
     * @returns {string}
     */
    normalizeAnswer(answer) {
        return answer.toString().trim().toUpperCase();
    }

    /**
     * スコアを取得
     * @returns {Object} { score: number, total: number, percentage: number }
     */
    getScore() {
        return {
            score: this.score,
            total: this.totalQuestions,
            percentage: this.totalQuestions > 0
                ? Math.round((this.score / this.totalQuestions) * 100)
                : 0
        };
    }

    /**
     * スコアをリセット
     */
    resetScore() {
        this.score = 0;
        this.totalQuestions = 0;
        this.currentQuestion = null;
        this.previousQuestion = null;
    }
}

/**
 * ランダムな整数を生成
 * @param {number} min - 最小値（含む）
 * @param {number} max - 最大値（含む）
 * @returns {number}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列からランダムに要素を選択
 * @param {Array} array
 * @returns {*}
 */
function getRandomElement(array) {
    return array[getRandomInt(0, array.length - 1)];
}

/**
 * 前回の値を除外して配列からランダムに選択
 * @param {Array} array - 選択元の配列
 * @param {*} lastValue - 除外する前回の値（nullなら除外なし）
 * @param {Function} [getKey] - 比較用キー取得関数（省略時は値そのもの）
 * @returns {*} 選択された要素
 */
function getRandomElementExcluding(array, lastValue, getKey = x => x) {
    if (lastValue === null || array.length <= 1) {
        return getRandomElement(array);
    }
    const filtered = array.filter(item => getKey(item) !== lastValue);
    return getRandomElement(filtered.length > 0 ? filtered : array);
}

/**
 * 数字をアルファベットに変換する（1→A, 2→B, ...）
 * @param {number} number - 1〜26の数字
 * @returns {string} 対応するアルファベット（A-Z）
 */
function numberToAlpha(number) {
    return String.fromCharCode(ASCII_CODE_A + number - 1);
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.DrillBase = DrillBase;
    window.DrillUtils = {
        ASCII_CODE_A,
        getRandomInt,
        getRandomElement,
        getRandomElementExcluding,
        numberToAlpha
    };
}
