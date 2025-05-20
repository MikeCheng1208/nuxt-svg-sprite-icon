export type ModuleOptions = {
  input?: string
  output?: string
  defaultSprite?: string
  elementClass?: string
  optimize?: boolean
  svgoOptions?: any
}

export type SpriteMap = {
  [spriteName: string]: {
    path: string
    symbols: string[]
  }
}

