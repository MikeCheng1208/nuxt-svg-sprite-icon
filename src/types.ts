export type ModuleOptions = {
  input?: string;
  output?: string;
  defaultSprite?: string;
  elementClass?: string;
  optimize?: boolean;
  svgoOptions?: any;
  watchFiles?: boolean;
  devtoolsCompat?: boolean;
  injectDOMContainer?: boolean;
}

export type SpriteMap = {
  [spriteName: string]: {
    path: string
    symbols: string[]
  }
}
