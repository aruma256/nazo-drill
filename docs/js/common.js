/**
 * ナゾドリル 共通ユーティリティ
 */

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
 * 配列をシャッフル（Fisher-Yates）
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * LocalStorageにデータを保存
 * @param {string} key
 * @param {*} value
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

/**
 * LocalStorageからデータを読み込み
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return defaultValue;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.DrillBase = DrillBase;
    window.DrillUtils = {
        getRandomInt,
        getRandomElement,
        shuffleArray,
        saveToStorage,
        loadFromStorage
    };
}
