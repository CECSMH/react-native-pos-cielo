import type { BarcodeSymbology, DividerStyle, FontFamily, ImageSourceType, TextAlignment, TypefaceStyle } from "../enums/printer";
export interface PrintStyleOptions {
    align?: TextAlignment;
    textSize?: number;
    fontFamily?: FontFamily;
    typeface?: TypefaceStyle;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    marginBottom?: number;
    lineSpace?: number;
}
export interface ImagePrintOptions {
    align?: TextAlignment;
    width?: number;
    height?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
}
export interface ReceiptLayout {
    paperWidthMm: 58 | 80;
    nodes: ReceiptNode[];
}
interface BaseNode {
    type: string;
}
interface TextNode extends BaseNode {
    type: 'text';
    content: string;
    style: Required<PrintStyleOptions>;
}
interface ColumnsNode extends BaseNode {
    type: 'columns';
    columns: ColumnDef[];
    style: Required<PrintStyleOptions>;
}
interface DividerNode extends BaseNode {
    type: 'divider';
    char: string;
    style: DividerStyle;
}
interface BarcodeNode extends BaseNode {
    type: 'barcode';
    data: string;
    symbology: BarcodeSymbology;
    height: number;
}
interface QRCodeNode extends BaseNode {
    type: 'qrcode';
    data: string;
    size: number;
}
interface FeedNode extends BaseNode {
    type: 'feed';
    lines: number;
}
interface ImageNode extends BaseNode {
    type: 'image';
    source: string;
    sourceType: ImageSourceType;
    align: TextAlignment;
    width?: number;
    height?: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
}
export type ReceiptNode = TextNode | ColumnsNode | DividerNode | BarcodeNode | QRCodeNode | FeedNode | ImageNode;
export interface ColumnDef {
    /** Texto a ser exibido na coluna. */
    text: string;
    /** Alinhamento do texto dentro da coluna. Padrão: LEFT, exceto a última coluna (RIGHT). */
    align?: TextAlignment;
    /** Peso relativo de largura da coluna, similar a flex-grow. Padrão: 1. */
    weight?: number;
}
export type ColumnInput = string | ColumnDef;
export declare function validate_print_layout(layout: ReceiptLayout): void;
export {};
//# sourceMappingURL=printer.d.ts.map