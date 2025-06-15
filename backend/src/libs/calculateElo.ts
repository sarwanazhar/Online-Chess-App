function calculateElo(
    whiteElo: number,
    blackElo: number,
    winner: 'white' | 'black' | 'draw'
  ) {
    const K = 32;
    const expectedWhite = 1 / (1 + 10 ** ((blackElo - whiteElo) / 400));
    const expectedBlack = 1 - expectedWhite;
  
    const actualWhite = winner === 'white' ? 1 : winner === 'draw' ? 0.5 : 0;
    const actualBlack = winner === 'black' ? 1 : winner === 'draw' ? 0.5 : 0;
  
    const newWhite = Math.round(whiteElo + K * (actualWhite - expectedWhite));
    const newBlack = Math.round(blackElo + K * (actualBlack - expectedBlack));
  
    return { newWhite, newBlack };
  }
  
export default calculateElo;