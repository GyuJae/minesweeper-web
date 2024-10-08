import { describe, expect, test, vi } from '@/libs/test';

import { DefaultBoard } from '../board/default-board';
import { GridCell } from '../cell/grid-cell';
import { GridCellCollection } from '../cell-collection/grid-cell-collection';
import { GridCellPosition } from '../cell-position/grid-cell-position';
import { CellState } from '../cell-state/cell-state.enum';
import { EmptyCellType } from '../cell-type/empty-cell-type';
import { MineCellType } from '../cell-type/mine-cell-type';
import { NumberCellType } from '../cell-type/number-cell-type';
import { GameLevel } from '../game-level/game-level.enum';
import { ClickSound } from '../game-sound/click-sound';
import { ErrorSound } from '../game-sound/error-sound';
import { ExplosionSound } from '../game-sound/explosion-sound';
import { FlagSound } from '../game-sound/flag-sound';
import { SuccessSound } from '../game-sound/success-sound';

describe('지뢰찾기 게임 규칙', () => {
  test('게임 시작 시 설정한 난이도에 맞게 보드 크기가 정해집니다.', () => {
    // given
    const gameLevel = GameLevel.EASY;

    // when
    const board = DefaultBoard.of(gameLevel);

    // then
    expect(board.getRowSize()).toBe(gameLevel.getRowSize());
    expect(board.getColumnSize()).toBe(gameLevel.getColumnSize());
  });

  test('처음 생성된 보드는 모든 칸이 닫힌 상태입니다.', () => {
    // given
    const gameLevel = GameLevel.EASY;

    // when
    const board = DefaultBoard.of(gameLevel);

    // then
    for (const cell of board.getCells()) {
      expect(cell.isClosed()).toBeTruthy();
    }
  });

  test('열림 상태가 아무것도 없는 경우 지뢰가 배치되지 않습니다.', () => {
    // given
    const gameLevel = GameLevel.EASY;

    // when
    const board = DefaultBoard.of(gameLevel);

    // then
    for (const cell of board.getCells()) {
      expect(cell.isOpened()).toBeFalsy();
      expect(cell.isMine()).toBeFalsy();
    }
  });

  test('처음 셸이 열리는 경우에 지뢰가 무작위로 배치됩니다.', () => {
    // given
    const gameLevel = GameLevel.EASY;
    const board = DefaultBoard.of(gameLevel);
    const position = GridCellPosition.of(0, 0);

    // when
    const newBoard = board.openCell(position);

    // then
    expect(newBoard.isOpenedCell(position)).toBeTruthy();
    expect(newBoard.hasUnopenedMines()).toBeTruthy();
  });

  test('처음 셸이 열리는 경우에도 지뢰가 이미 배치되어 있다면 지뢰는 다시 배치되지 않습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(0, 0));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isMine()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isMine()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 3)).getNearbyMineCount()).toBe(1);

    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 0)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 1)).getNearbyMineCount()).toBe(2);
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 2)).getNearbyMineCount()).toBe(2);
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 3)).getNearbyMineCount()).toBe(1);

    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 0)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 1)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 2)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 3)).getNearbyMineCount()).toBe(0);

    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 0)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isMine()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 2)).getNearbyMineCount()).toBe(1);
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 3)).getNearbyMineCount()).toBe(0);
  });

  test('섈을 클릭 시 지뢰일 경우 게임이 종료됩니다. ', () => {
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(
      gameLevel,
      GridCellCollection.of(gameLevel, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when2
    const newBoard = board.openCell(GridCellPosition.of(0, 1));

    // then
    const cell = newBoard.findCellByPosition(GridCellPosition.of(0, 1));
    expect(newBoard.isGameOver()).toBeTruthy();
    expect(cell.isOpened()).toBeTruthy();
  });

  test('셸 클릭 시 지뢰일 경우 게임이 종료되며 보드에 나와 있는 모든 지뢰 셸이 열립니다.', () => {
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(
      gameLevel,
      GridCellCollection.of(gameLevel, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(0, 1));

    // then
    expect(newBoard.isGameOver()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isOpened()).toBeTruthy();
  });

  test('셸을 클릭 시 지뢰가 아니며 인접한 지뢰가 있을 경우 인접한 지뢰의 개수가 표시됩니다.', () => {
    // given
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(
      gameLevel,
      GridCellCollection.of(gameLevel, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(2, 0));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 3)).isOpened()).toBeFalsy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 0)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 2)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 3)).isOpened()).toBeFalsy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 2)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 3)).isOpened()).toBeFalsy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 0)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 2)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 3)).isOpened()).toBeFalsy();
  });

  test('셀을 클릭 시 인접 지뢰가 없을 경우, 빈 셀이 모두 열리고 숫자 셀을 만날 때까지 자동으로 열림.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(3, 3));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 3)).isOpened()).toBeFalsy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 0)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 3)).isOpened()).toBeTruthy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 0)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 3)).isOpened()).toBeTruthy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 0)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 3)).isOpened()).toBeTruthy();
  });

  test('셀을 클릭 시 인접 지뢰가 없을 경우, 재귀적으로 숫자셸을 만나기 전까지 빈 셀이 모두 열립니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(3, 3));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isOpened()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 3)).isOpened()).toBeTruthy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 1)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(1, 3)).isOpened()).toBeTruthy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 1)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(2, 3)).isOpened()).toBeTruthy();

    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 2)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 3)).isOpened()).toBeTruthy();
  });

  test('사용자가 지뢰가 아닌 모든 셸을 열면 게임에서 승리합니다.', () => {
    // given
    // when
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.OPENED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // then
    expect(board.isGameClear()).toBeTruthy();
  });

  test('열지 않은 지뢰가 아닌 셸이 있는 경우 승리가 아닙니다', () => {
    // given
    // when
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(
      gameLevel,
      GridCellCollection.of(gameLevel, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.OPENED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // then
    expect(board.isGameClear()).toBeFalsy();
  });

  test('닫혀 있는 지뢰 셸을 열면 게임을 패배하게 됩니다.', () => {
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(
      gameLevel,
      GridCellCollection.of(gameLevel, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(3, 1));

    // then
    expect(newBoard.isGameOver()).toBeTruthy();
  });

  test('닫혀 있는 셸 중에서 깃발을 꽂을 수 있습니다.', () => {
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(gameLevel, GridCellCollection.of(gameLevel));

    // when
    const newBoard = board.toggleFlag(GridCellPosition.of(0, 0));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isFlagged()).toBeTruthy();
  });

  test('열려 있는 셀에 깃발을 꽂을 수 없습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board.toggleFlag(GridCellPosition.of(0, 0)).ifThrowGameException(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
  });

  test('깃발을 꽂은 셸의 깃발을 다시 제거하고 닫혀 있는 상태로 복구됩니다.', () => {
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(gameLevel, GridCellCollection.of(gameLevel));

    // when
    const newBoard = board.toggleFlag(GridCellPosition.of(0, 0)).toggleFlag(GridCellPosition.of(0, 0));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isFlagged()).toBeFalsy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isClosed()).toBeTruthy();
  });

  test("남은 깃발의 개수는 '지뢰 개수 - 깃발 개수' 입니다.", () => {
    // given
    const gameLevel = GameLevel.VERY_EASY;
    const board = DefaultBoard.of(gameLevel, GridCellCollection.of(gameLevel));

    // when
    const newBoard = board.toggleFlag(GridCellPosition.of(0, 0)).toggleFlag(GridCellPosition.of(0, 1));

    // then
    expect(newBoard.getRemainingFlagCount()).toBe(gameLevel.getMineCount() - 2);
  });

  test('모든 셸이 닫힌 상태에서 처음 숫자 셸을 클릭하여 열린 경우 처음 열린 경우로 확인할 수 있습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const newBoard = board.openCell(GridCellPosition.of(0, 0));
    const mockCallback = vi.fn();

    // when
    newBoard.ifFirstOpenedCell(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
  });

  test('모든 셸이 닫힌 상태에서 처음 비어 있는 셸을 클릭하여 열린 경우 처음 열린 경우로 확인할 수 있습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const newBoard = board.openCell(GridCellPosition.of(3, 3));
    const mockCallback = vi.fn();

    // when
    newBoard.ifFirstOpenedCell(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
  });

  test('깃발이 꽂혀 있는 해당 셸을 열 수 없습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.FLAGGED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board.openCell(GridCellPosition.of(0, 0)).ifThrowGameException(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
  });

  test('깃발이 꽂혀 있는 셸은 주변 셸을 클릭해도 해당 셸은 열리지 않습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.FLAGGED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(3, 3));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 2)).isFlagged()).toBeTruthy();
  });

  test('지뢰 수 초과하여 깃발을 꽂을 수 없습니다.', () => {
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.FLAGGED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board.toggleFlag(GridCellPosition.of(0, 3)).ifThrowGameException(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
  });

  test('지뢰 수에 맞게 모든 깃발을 꽂고 깃발이 꽂혀 있는 셸을 제거 할 수 있습니다.', () => {
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.FLAGGED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.toggleFlag(GridCellPosition.of(0, 0));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isFlagged()).toBeFalsy();
  });

  test('이미 열려 있는 셸은 다시 열 수 없습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board.openCell(GridCellPosition.of(0, 0)).ifThrowGameException(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
  });

  test('이전 셀을 열었을 때 게임 규칙으로 인해 변화가 없었더라도, 이후 규칙에 따른 셀 변화가 발생하면 예외는 자동으로 해제됩니다', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board.openCell(GridCellPosition.of(0, 0)).openCell(GridCellPosition.of(2, 3)).ifThrowGameException(mockCallback);

    // then
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('처음 모두 닫혀 있는 보드에 깃발을 꽂은 후, 셸 하나 열였을 때 깃발은 제거가 됩니다.', () => {
    // given
    const board = DefaultBoard.of(GameLevel.VERY_EASY);
    const newBoard = board.toggleFlag(GridCellPosition.of(0, 0));

    // when
    const openedBoard = newBoard.openCell(GridCellPosition.of(0, 1));

    // then
    expect(openedBoard.findCellByPosition(GridCellPosition.of(0, 1)).isOpened()).toBeTruthy();
    expect(openedBoard.findCellByPosition(GridCellPosition.of(0, 0)).isFlagged()).toBeFalsy();
  });

  test('처음 열려 있는 셸이 없는 경우에 여러개 깃발을 꽂아도 셸 하나를 열면 모든 깃발은 제거가 됩니다.', () => {
    // given
    const board = DefaultBoard.of(GameLevel.VERY_EASY);
    const newBoard = board
      .toggleFlag(GridCellPosition.of(0, 0))
      .toggleFlag(GridCellPosition.of(0, 1))
      .toggleFlag(GridCellPosition.of(0, 2));

    // when
    const openedBoard = newBoard.openCell(GridCellPosition.of(0, 3));

    // then
    expect(openedBoard.findCellByPosition(GridCellPosition.of(0, 0)).isFlagged()).toBeFalsy();
    expect(openedBoard.findCellByPosition(GridCellPosition.of(0, 1)).isFlagged()).toBeFalsy();
    expect(openedBoard.findCellByPosition(GridCellPosition.of(0, 2)).isFlagged()).toBeFalsy();
  });

  test('첫 번째 셀이 열릴 때 콜백이 호출할 수 있습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board
      .openCell(GridCellPosition.of(0, 0))
      .ifFirstOpenedCell(mockCallback)
      .openCell(GridCellPosition.of(3, 3))
      .ifFirstOpenedCell(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('지뢰 셸을 열었을 때 콜백을 호출할 수 있습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board
      .openCell(GridCellPosition.of(0, 0))
      .ifGameOver(mockCallback)
      .openCell(GridCellPosition.of(3, 1))
      .ifGameOver(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('게임이 클리어 했을 떄 콜백을 호출할 수 있습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const mockCallback = vi.fn();

    // when
    board
      .openCell(GridCellPosition.of(0, 0))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(0, 3))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(1, 0))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(1, 3))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(1, 1))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(1, 2))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(2, 0))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(2, 1))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(2, 2))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(2, 3))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(3, 0))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(3, 2))
      .ifGameClear(mockCallback)
      .openCell(GridCellPosition.of(3, 3))
      .ifGameClear(mockCallback);

    // then
    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('닫혀 있는 지뢰셸에 깃발을 꽂았을 때 해당 셸을 클릭해도 열 수 없습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(0, 1));

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isFlagged()).toBeTruthy();
  });

  test('보드의 모든 지뢰셸을 꽃 셸로 바꿀 수 있습니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.OPENED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.changeAllMineCellsToFlowers();

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isFlower()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isFlower()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isFlower()).toBeTruthy();
  });

  test("게임 클리어 시 모든 셸이 열리며, 지뢰셸은 '꽃'으로 변경됩니다.", () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.OPENED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );

    // when
    const newBoard = board.openCell(GridCellPosition.of(0, 0)).changeAllMineCellsToFlowers();

    // then
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 0)).isOpened()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 1)).isFlower()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(0, 2)).isFlower()).toBeTruthy();
    expect(newBoard.findCellByPosition(GridCellPosition.of(3, 1)).isFlower()).toBeTruthy();
  });

  test('지뢰가 아니며 게임 규칙에 위반되지 않은 셸을 클릭 시 클릭 소리가 납니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.FLAGGED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const clickSoundSpy = vi.spyOn(ClickSound.prototype, 'play').mockImplementation(() => {});
    const errorSoundSpy = vi.spyOn(ErrorSound.prototype, 'play').mockImplementation(() => {});
    const successSoundSpy = vi.spyOn(SuccessSound.prototype, 'play').mockImplementation(() => {});
    const explosionSoundSpy = vi.spyOn(ExplosionSound.prototype, 'play').mockImplementation(() => {});
    const flagSoundSpy = vi.spyOn(FlagSound.prototype, 'play').mockImplementation(() => {});

    // when
    board.playSound(GridCellPosition.of(0, 3));

    // then
    expect(clickSoundSpy).toHaveBeenCalled();
    expect(errorSoundSpy).not.toHaveBeenCalled();
    expect(successSoundSpy).not.toHaveBeenCalled();
    expect(explosionSoundSpy).not.toHaveBeenCalled();
    expect(flagSoundSpy).not.toHaveBeenCalled();
  });

  test('지뢰셸을 클릭 시 폭발 소리가 납니다.', () => {
    // given
    const board = DefaultBoard.of(
      GameLevel.VERY_EASY,
      GridCellCollection.of(GameLevel.VERY_EASY, [
        [
          GridCell.of(CellState.OPENED, NumberCellType.of(1), GridCellPosition.of(0, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 1)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(0, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(0, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(2), GridCellPosition.of(1, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(1, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 0)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 2)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(2, 3)),
        ],
        [
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 0)),
          GridCell.of(CellState.CLOSED, MineCellType.of(), GridCellPosition.of(3, 1)),
          GridCell.of(CellState.CLOSED, NumberCellType.of(1), GridCellPosition.of(3, 2)),
          GridCell.of(CellState.CLOSED, EmptyCellType.of(), GridCellPosition.of(3, 3)),
        ],
      ]),
    );
    const clickSoundSpy = vi.spyOn(ClickSound.prototype, 'play').mockImplementation(() => {});
    const errorSoundSpy = vi.spyOn(ErrorSound.prototype, 'play').mockImplementation(() => {});
    const successSoundSpy = vi.spyOn(SuccessSound.prototype, 'play').mockImplementation(() => {});
    const explosionSoundSpy = vi.spyOn(ExplosionSound.prototype, 'play').mockImplementation(() => {});
    const flagSoundSpy = vi.spyOn(FlagSound.prototype, 'play').mockImplementation(() => {});

    // when
    board.playSound(GridCellPosition.of(0, 1));

    // then
    expect(clickSoundSpy).not.toHaveBeenCalled();
    expect(errorSoundSpy).not.toHaveBeenCalled();
    expect(successSoundSpy).not.toHaveBeenCalled();
    expect(explosionSoundSpy).toHaveBeenCalled();
    expect(flagSoundSpy).not.toHaveBeenCalled();
  });
});
