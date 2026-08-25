/**
 * BETシステム - ベット額管理と払い戻し計算
 */

class BetSystem {
  /**
   * BETシステム設定
   */
  static CONFIG = {
    INITIAL_BET: 5000000,      // 初期BET: 500万
    RAISE_INCREMENT: 3000000,   // RAISE時の増加額: 300万
    MAX_BETS: [
      5000000,   // ラウンド1: 500万
      8000000,   // ラウンド2: 800万
      11000000,  // ラウンド3: 1100万
      14000000   // ラウンド4: 1400万
    ],
    BONUS_INITIAL_BALANCE: 65000000, // ボーナス開始時: 6500万
    FIXED_PAYOUTS: {
      0: 10000000, // 0勝: 1000万
      1: 15000000, // 1勝: 1500万
      2: 25000000, // 2勝: 2500万
      3: 40000000, // 3勝: 4000万
      4: 60000000  // 4勝: 6000万
    },
    PAYOUT_MULTIPLIERS: {
      0: 0.5,
      1: 0.8,
      2: 1.2,
      3: 2.0,
      4: 4.0
    }
  };

  /**
   * RAISE後の新しいBET額を計算
   * @param {number} currentBet - 現在のBET額
   * @param {number} round - ラウンド数（0～3）
   * @returns {number} 新しいBET額
   */
  static calculateRaise(currentBet, round = 0) {
    const maxBet = this.CONFIG.MAX_BETS[round] || this.CONFIG.MAX_BETS[3];
    const newBet = Math.min(currentBet + this.CONFIG.RAISE_INCREMENT, maxBet);
    return newBet;
  }

  /**
   * FOLDした時の損失額を計算
   * @param {number} currentBet - 現在のBET額
   * @returns {number} 失うBET額（1/2）
   */
  static calculateFoldLoss(currentBet) {
    return Math.floor(currentBet / 2);
  }

  /**
   * ボーナス終了後の払い戻し額を計算
   * @param {number} remainingBalance - ボーナス終了時の残りBET
   * @param {number} wins - 勝利数（0～4）
   * @returns {number} 最終払い戻し額
   */
  static calculatePayout(remainingBalance, wins) {
    // 勝利数が範囲外の場合は処理
    if (wins < 0 || wins > 4) {
      wins = Math.max(0, Math.min(4, wins));
    }

    const fixedPayout = this.CONFIG.FIXED_PAYOUTS[wins];
    const multiplier = this.CONFIG.PAYOUT_MULTIPLIERS[wins];
    
    // 最終払い戻し = 固定払い戻し + 残りBET × 倍率
    const totalPayout = fixedPayout + Math.floor(remainingBalance * multiplier);

    return totalPayout;
  }

  /**
   * ALL-IN時の処理
   * @param {number} bonusBalance - 現在のボーナスバランス
   * @returns {number} ALL-INされたBET額
   */
  static calculateAllIn(bonusBalance) {
    return bonusBalance;
  }

  /**
   * ラウンド別の最大BETを取得
   * @param {number} round - ラウンド数（0～3）
   * @returns {number} 最大BET額
   */
  static getMaxBet(round) {
    return this.CONFIG.MAX_BETS[round] || this.CONFIG.MAX_BETS[3];
  }

  /**
   * BET額が妥当かどうか検証
   * @param {number} bet - BET額
   * @param {number} round - ラウンド数
   * @param {number} balance - 現在のバランス
   * @returns {boolean} 妥当かどうか
   */
  static isValidBet(bet, round, balance) {
    const maxBet = this.getMaxBet(round);
    return bet >= 0 && bet <= Math.min(maxBet, balance);
  }

  /**
   * 平均ボーナス払い戻し額を計算（シミュレーション）
   * @param {number} simulations - シミュレーション回数
   * @returns {number} 平均払い戻し額
   */
  static simulateAveragePayout(simulations = 10000) {
    let totalPayout = 0;

    for (let i = 0; i < simulations; i++) {
      // ランダムに勝利数を決定（各勝利確率は50%と仮定）
      const wins = Math.floor(Math.random() * 5); // 0～4
      const remainingBalance = this.CONFIG.BONUS_INITIAL_BALANCE * (Math.random() * 0.8 + 0.2); // 20～100%残存
      
      const payout = this.calculatePayout(remainingBalance, wins);
      totalPayout += payout;
    }

    return Math.floor(totalPayout / simulations);
  }

  /**
   * BETシステムの詳細情報を取得
   * @returns {object} BETシステムの設定情報
   */
  static getSystemInfo() {
    return {
      initialBet: this.CONFIG.INITIAL_BET,
      raiseIncrement: this.CONFIG.RAISE_INCREMENT,
      maxBets: this.CONFIG.MAX_BETS,
      bonusInitialBalance: this.CONFIG.BONUS_INITIAL_BALANCE,
      fixedPayouts: this.CONFIG.FIXED_PAYOUTS,
      payoutMultipliers: this.CONFIG.PAYOUT_MULTIPLIERS,
      averagePayout: this.simulateAveragePayout()
    };
  }
}

module.exports = BetSystem;
