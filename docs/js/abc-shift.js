/**
 * アルファベットシフト ドリル
 * A+1→B, Z-1→Y のようにアルファベットをずらす
 */
class AlphaShiftDrill extends DrillBase {
    constructor() {
        super('abc-shift');
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateQuestion() {
        // A〜Zのランダムなアルファベットを生成
        const baseCode = DrillUtils.getRandomInt(0, 25); // 0-25
        const baseChar = String.fromCharCode(65 + baseCode); // A=65

        // このアルファベットに対して有効なシフト量の候補を計算
        // -5〜+5の範囲で、0を除き、かつ結果がA-Z範囲内（0-25）に収まるもの
        const validShifts = [];
        for (let shift = -5; shift <= 5; shift++) {
            if (shift === 0) continue; // 0は除外
            const shiftedCode = baseCode + shift;
            if (shiftedCode >= 0 && shiftedCode <= 25) {
                validShifts.push(shift);
            }
        }

        // 有効なシフト量の中からランダムに1つ選ぶ
        const shift = validShifts[DrillUtils.getRandomInt(0, validShifts.length - 1)];
        const shiftedCode = baseCode + shift;
        const answer = String.fromCharCode(65 + shiftedCode);

        // 問題文を生成
        const sign = shift > 0 ? '+' : '';
        const question = `${baseChar}${sign}${shift}`;

        return {
            question: question,
            answer: answer
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.AlphaShiftDrill = AlphaShiftDrill;
}
