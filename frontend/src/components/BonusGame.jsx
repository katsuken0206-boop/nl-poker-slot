import React from 'react';
import '../styles/BonusGame.css';

/**
 * ボーナスゲーム（ポーカー）画面コンポーネント
 */
function BonusGame({ playerData, api }) {
  const [currentOpponentIndex, setCurrentOpponentIndex] = React.useState(0);
  const [playerHand, setPlayerHand] = React.useState([]);
  const [communityCards, setCommunityCards] = React.useState([]);
  const [winRate, setWinRate] = React.useState(0.5);
  const [currentBet, setCurrentBet] = React.useState(5000000);
  const [winCount, setWinCount] = React.useState(0);
  const [message, setMessage] = React.useState('準備中...');
  const [isWaiting, setIsWaiting] = React.useState(true);

  const opponents = ['ゾンフィ', 'ダスロ', '書物', '龍'];
  const currentOpponent = opponents[currentOpponentIndex];

  /**
   * ボーナスゲーム開始時の初期化
   */
  React.useEffect(() => {
    if (playerData.gameData && playerData.gameData.playerHand) {
      setPlayerHand(playerData.gameData.playerHand || []);
      setCommunityCards(playerData.gameData.communityCards || []);
      setCurrentBet(playerData.gameData.initialBet || 5000000);
      setWinCount(playerData.gameData.winCount || 0);
      setIsWaiting(false);
      setMessage(`${currentOpponent}との対戦開始！`);
    }
  }, [playerData.gameData]);

  /**
   * ポーカーアクション処理
   */
  const handleAction = (action) => {
    if (isWaiting || !api) return;

    setIsWaiting(true);
    setMessage(`${action}を選択しました...`);

    api.pokerAction(action);

    // 結果受信
    const handleResult = (data) => {
      setWinRate(data.winRate);
      setCurrentBet(data.newBet);

      if (data.action === 'FOLD') {
        setMessage('❌ フォールドしました');
      } else if (data.action === 'CALL') {
        setMessage('✓ コールしました');
      } else if (data.action === 'RAISE') {
        setMessage('⬆️ レイズしました');
      } else if (data.action === 'CHECK') {
        setMessage('➡️ チェックしました');
      } else if (data.action === 'ALL_IN') {
        setMessage('🚀 ALL-IN！');
      }

      // 次のカード公開
      if (data.bettingRound >= 3) {
        setTimeout(() => {
          api.getBonusResult();
        }, 1000);
      } else {
        setIsWaiting(false);
      }

      api.off('POKER_ACTION_RESULT', handleResult);
    };

    api.on('POKER_ACTION_RESULT', handleResult);
  };

  /**
   * 次の対戦へ
   */
  React.useEffect(() => {
    const handleNextOpponent = (data) => {
      setCurrentOpponentIndex(data.opponentIndex);
      setWinCount(data.wins);
      setMessage(`${opponents[data.opponentIndex]}との対戦開始！`);
      setIsWaiting(false);

      api.off('NEXT_OPPONENT', handleNextOpponent);
    };

    api.on('NEXT_OPPONENT', handleNextOpponent);

    return () => api.off('NEXT_OPPONENT', handleNextOpponent);
  }, []);

  return (
    <div className="bonus-game">
      <div className="poker-table">
        {/* 対戦相手情報 */}
        <div className="opponent-section">
          <h3 className="opponent-name">対戦中: {currentOpponent}</h3>
          <p className="opponent-description">
            {currentOpponent === 'ゾンフィ' && '弱い役でも勝負しやすい'}
            {currentOpponent === 'ダスロ' && '慎重で、強い役を中心に勝負'}
            {currentOpponent === '書物' && 'ブラフが多く、弱い役でも積極的に勝負'}
            {currentOpponent === '龍' && 'ギャンブラーで、CALL・RAISEが多い'}
          </p>
        </div>

        {/* プレイヤーハンド */}
        <div className="player-hand section">
          <h4>あなたの手札</h4>
          <div className="cards">
            {playerHand.map((card, idx) => (
              <div key={idx} className="card">
                {card}
              </div>
            ))}
          </div>
        </div>

        {/* コミュニティカード */}
        <div className="community-section section">
          <h4>コミュニティカード</h4>
          <div className="cards">
            {communityCards.map((card, idx) => (
              <div key={idx} className="card">
                {card}
              </div>
            ))}
          </div>
        </div>

        {/* 勝率表示 */}
        <div className="win-rate-section">
          <h4>現在の勝率</h4>
          <div className="win-rate-bar">
            <div
              className="win-rate-fill"
              style={{ width: `${winRate * 100}%` }}
            ></div>
          </div>
          <p className="win-rate-percent">{(winRate * 100).toFixed(1)}%</p>
        </div>

        {/* BET情報 */}
        <div className="bet-info-section">
          <p>現在のBET: {(currentBet / 1000000).toFixed(1)}M</p>
          <p>残高: {(playerData.gameData.bonusBalance / 1000000).toFixed(1)}M</p>
          <p>勝利数: {winCount} / 4</p>
        </div>

        {/* メッセージ */}
        <div className="message-box">
          <p>{message}</p>
        </div>
      </div>

      {/* アクション選択ボタン */}
      <div className="actions">
        <button
          className="action-btn fold-btn"
          onClick={() => handleAction('FOLD')}
          disabled={isWaiting}
        >
          FOLD<br /><small>勝負を降りる</small>
        </button>
        <button
          className="action-btn call-btn"
          onClick={() => handleAction('CALL')}
          disabled={isWaiting}
        >
          CALL<br /><small>同額で勝負</small>
        </button>
        <button
          className="action-btn raise-btn"
          onClick={() => handleAction('RAISE')}
          disabled={isWaiting}
        >
          RAISE<br /><small>ベット上げ</small>
        </button>
        <button
          className="action-btn check-btn"
          onClick={() => handleAction('CHECK')}
          disabled={isWaiting}
        >
          CHECK<br /><small>次へ進む</small>
        </button>
        <button
          className="action-btn allin-btn"
          onClick={() => handleAction('ALL_IN')}
          disabled={isWaiting}
        >
          ALL-IN<br /><small>全賭け</small>
        </button>
      </div>
    </div>
  );
}

export default BonusGame;
