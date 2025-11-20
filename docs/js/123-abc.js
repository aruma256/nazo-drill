/**
 * 数字toアルファベット ドリル
 * 1→A, 2→B, 3→C ... 26→Z と変換
 */
class NumberToAlphaDrill extends DrillBase {
    constructor() {
        super('123-abc');
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateQuestion() {
        // 1〜26のランダムな数字を生成
        const number = DrillUtils.getRandomInt(1, 26);

        // 対応するアルファベットを計算
        const answer = DrillUtils.numberToAlpha(number);

        return {
            question: number.toString(),
            answer: answer
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.NumberToAlphaDrill = NumberToAlphaDrill;
}
