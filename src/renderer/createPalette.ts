import * as createPalette from '@mui/material/styles/createPalette';

declare module '@mui/material/styles/createPalette' {
  export interface TypeBackground {
    default: string;
    paper: string;
    dark: string;
  }
}
