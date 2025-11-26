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
        // 列: わ段, ら段, や段, ま段, は段, な段, た段, さ段, か段, あ段（右から左）
        this.gojuonTable = [
            ['わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'],
            ['',   'り', '',   'み', 'ひ', 'に', 'ち', 'し', 'き', 'い'],
            ['を', 'る', 'ゆ', 'む', 'ふ', 'ぬ', 'つ', 'す', 'く', 'う'],
            ['',   'れ', '',   'め', 'へ', 'ね', 'て', 'せ', 'け', 'え'],
            ['ん', 'ろ', 'よ', 'も', 'ほ', 'の', 'と', 'そ', 'こ', 'お']
        ];

        // 文字から位置へのマッピングを作成
        this.charToPosition = {};
        for (let row = 0; row < this.gojuonTable.length; row++) {
            for (let col = 0; col < this.gojuonTable[row].length; col++) {
                const char = this.gojuonTable[row][col];
                if (char) {
                    this.charToPosition[char] = { row, col };
                }
            }
        }

        // 出題される単語リスト
        this.words = [
            'くるま',
            'さかな',
            'とけい',
            'ほたる',
            'あたま',
            'せかい',
            'ひるね',
            'たから',
            'ふくろ',
            'やさい'
        ];
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: Object, answer: string }
     */
    generateQuestion() {
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
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GojuonPickDrill = GojuonPickDrill;
}
