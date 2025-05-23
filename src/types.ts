export type SvgoOptions = {
  plugins?: Array<string | { name: string; params?: Record<string, any> }>;
  multipass?: boolean;
  precision?: number;
  floatPrecision?: number;
  js2svg?: {
    indent?: number;
    pretty?: boolean;
  };
}

export type ModuleOptions = {
  input?: string;
  output?: string;
  defaultSprite?: string;
  elementClass?: string;
  optimize?: boolean;
  svgoOptions?: SvgoOptions;
}

export type SpriteMap = {
  readonly [spriteName: string]: {
    readonly path: string;
    readonly symbols: readonly string[];
  };
}

export type SpriteGenerationResult = {
  readonly spriteMap: SpriteMap;
  readonly spriteContent: Record<string, string>;
}
