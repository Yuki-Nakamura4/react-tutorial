import { useState } from "react";

function Square({ value, onSquareClick, isWinnerSquare, isCurrentSquare }) {
  return (
    <button
      className={`square ${isWinnerSquare ? "winner" : ""} ${
        !isWinnerSquare && isCurrentSquare ? "current" : ""
      }`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, isDraw, currentMoveIndex }) {
  const { winner, line } = calculateWinner(squares);
  let status;
  if (isDraw) {
    status = "Draw";
  } else if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "x" : "o");
  }

  function handleClick(i) {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  // マス目をレンダーする関数
  function renderSquare(i) {
    const isWinnerSquare = winner && line && line.includes(i);
    const isCurrentSquare = i === currentMoveIndex;
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinnerSquare={isWinnerSquare}
        isCurrentSquare={isCurrentSquare}
      />
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {[...Array(3)].map((_, i) => (
        <div className="board-row" key={i}>
          {[...Array(3)].map((_, j) => {
            const index = i * 3 + j;
            return renderSquare(index);
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const isDraw = currentMove === 9 && !calculateWinner(currentSquares).winner;
  const currentMoveIndex = currentMove
    ? history[currentMove].findIndex(
        (value, index) => value !== (history[currentMove - 1] || [])[index]
      )
    : null;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleOrder() {
    setAscendingOrder(!ascendingOrder);
  }

  let moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      const clickedSquare = squares.findIndex(
        (value, index) => value !== history[move - 1][index]
      );
      const row = Math.floor(clickedSquare / 3) + 1;
      const col = (clickedSquare % 3) + 1;
      description =
        move === currentMove
          ? `You are at move #${currentMove} (row: ${row}, col: ${col})`
          : `Go to move #${move} (row: ${row}, col: ${col})`;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        {move === currentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  if (!ascendingOrder) {
    moves = moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          isDraw={isDraw}
          currentMoveIndex={currentMoveIndex}
        />
      </div>
      <div className="game-info">
        <div>
          <button onClick={toggleOrder}>
            {ascendingOrder ? "Descending Order" : "Ascending Order"}
          </button>
        </div>
        <ol reversed={!ascendingOrder}>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
}
