import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../components/ThemeContext";

export default function TicTacToe() {
  const { colors } = useTheme();

  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState(0);

  const getWinner = (b: string[]) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, c, d] of winningCombinations) {
      if (b[a] !== "" && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return null;
  };

  const winner = getWinner(board);

  const onPressButton = (cell: number) => {
    if (winner) {
      alert(`Player ${winner} wins!`);
      return;
    }
    if (board[cell] !== "") return;

    const newBoard = [...board];
    newBoard[cell] = turn % 2 === 0 ? "O" : "X";
    setBoard(newBoard);
    setTurn(turn + 1);
  };

  const renderCell = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.child, { borderColor: colors.primary }]}
      onPress={() => onPressButton(index)}
    >
      <Text style={[styles.symbol, { color: colors.text }]}>{board[index]}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.rowcontainer}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.rowcontainer}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.rowcontainer}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>

        <Text style={{ marginTop: 10, color: colors.text }}>
          Turn: {turn % 2 === 0 ? "O" : "X"}
        </Text>

        {winner && (
          <Text style={{ marginTop: 10, color: colors.text, fontWeight: "bold" }}>
            Winner: {winner}
          </Text>
        )}
      </View>

      <Button
        title="Reset"
        onPress={() => {
          setBoard(Array(9).fill(""));
          setTurn(0);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  child: {
    padding: 10,
    borderWidth: 2,
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rowcontainer: {
    flexDirection: "row",
  },
  symbol: {
    fontSize: 48,
    fontWeight: "bold",
  },
});