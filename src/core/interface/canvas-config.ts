import { Size } from '../size';

export interface ICanvasConfig {
  size: Size;
  centered: boolean;
  canvasTargetId: string;
  canvasColor: number;
  htmlTargetId: string;
}