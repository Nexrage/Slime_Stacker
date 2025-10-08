export enum BlockType {
  RICK = 'rick',
  COO = 'coo',
  KINE = 'kine',
  STAR = 'star',
  BOMB = 'bomb',
  BRICK = 'brick',
}

export type BlockCell = { type: BlockType; cracked?: boolean } | null;
