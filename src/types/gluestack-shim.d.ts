import 'react';

declare module 'react' {
  interface Attributes {
    bg?: string;
    p?: string | number;
    px?: string | number;
    py?: string | number;
    m?: string | number;
    mx?: string | number;
    my?: string | number;
    mb?: string | number;
    gap?: string | number;
    space?: string | number;
  }
}
