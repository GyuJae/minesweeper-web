import { Enum, EnumType } from "ts-jenum";

@Enum("name")
export class CellState extends EnumType<CellState>() {
  static readonly CLOSED = new CellState("닫힘");
  static readonly OPENED = new CellState("열림");

  private constructor(public readonly name: string) {
    super();
  }
}
