export enum BlockType {
  GREEN_JELLY = 'green_jelly',
  RED_JELLY = 'red_jelly',
  BLUE_JELLY = 'blue_jelly',
  STAR = 'star',
  BOMB = 'bomb',
  BRICK = 'brick',
}

export type BlockCell = { type: BlockType; cracked?: boolean } | null;
