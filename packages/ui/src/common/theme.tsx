const theme = {
  colors: {
    primary: '#FF9900',
    accent: '#FF590D',
    black: '#222222',
    background: '#fff',
    statusBar: '#f5f5f5',
    white: '#ffffff',
    text: '#666666',
    confirm: '#0E547F',
    warning: '#B30302',
    link: '#276EF1',
    c5: '#383838',
    c4: '#5C595A',
    c3: '#959091',
    c2: '#CFCFCF',
    c1: '#DCDCDC',
  },
  fontSizes: {
    extraLarge: '80px',
    h1: '50px',
    h2: '35px',
    title: '28px',
    h3: '20px',
    button: '18px',
    label: '16px',
    text: '14px',
  },
  fontWeights: {
    regular: '400',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
};

type Colors = typeof theme.colors;
type FontSizes = typeof theme.fontSizes;
type FontWeights = typeof theme.fontWeights;

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: Colors;
    fontSizes: FontSizes;
    fontWeights: FontWeights;
  }
}

export default theme;
