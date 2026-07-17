import { BarcodeSymbology, DividerStyle, FontFamily, ImageSourceType, TextAlignment, TypefaceStyle } from "./enums/printer";
import type { ColumnDef, ColumnInput, ImagePrintOptions, PrintStyleOptions, ReceiptLayout, ReceiptNode } from "./interfaces/printer";


const DEFAULT_STYLE: Required<PrintStyleOptions> = {
    align: TextAlignment.LEFT,
    textSize: 14,
    fontFamily: FontFamily.DEFAULT,
    typeface: TypefaceStyle.NORMAL,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    lineSpace: 1.0,
};

function resolve_style(overrides?: PrintStyleOptions): Required<PrintStyleOptions> {
    return { ...DEFAULT_STYLE, ...overrides };
}

/**
 * Construtor de layouts de recibo para impressão.
 */
export class ReceiptPrintBuilder {
    private nodes: ReceiptNode[] = [];
    /**
     * @param paperWidthMm Largura do papel em milímetros. Padrão: 58.
     */
    constructor(private paperWidthMm: 58 | 80 = 58) { }

    /**
     * Adiciona uma linha de texto ao recibo.
     * @param content Conteúdo do texto a ser exibido.
     * @param style Opções de estilo (alinhamento, tamanho, fonte, margens).
     */
    addText(content: string, style?: PrintStyleOptions): this {
        this.nodes.push({ type: 'text', content, style: resolve_style(style) });
        return this;
    }
    /**
     * Adiciona uma linha com múltiplas colunas.
     * Cada coluna pode ser um texto simples (string) ou um objeto com controle
     * individual de alinhamento e largura relativa.
     * Por padrão, todas as colunas são alinhadas à esquerda, exceto a última,
     * que é alinhada à direita
     * @example
     * // Duas colunas (label/valor), comportamento padrão
     * .addColumns(['Subtotal', 'R$ 46,50'])
     * 
     * @example
     * // Três colunas com pesos e alinhamentos customizados
     * .addColumns([
     *   { text: '2x', weight: 0.5 },
     *   { text: 'Café Espresso', weight: 2, align: TextAlignment.LEFT },
     *   { text: 'R$ 17,00', weight: 1, align: TextAlignment.RIGHT },
     * ])
     * 
     * @param columns Lista de colunas (strings ou ColumnDef) a serem exibidas na linha.
     * @param style Opções de estilo (tamanho, fonte, margens) aplicadas à linha inteira.
     * @returns {this} Para encadeamento de chamadas.
     */
    addColumns(columns: ColumnInput[], style?: PrintStyleOptions): this {
        const resolved_columns: ColumnDef[] = columns.map((col, index) => {
            const is_last = index === columns.length - 1;
            if (typeof col === 'string') {
                return {
                    text: col,
                    align: is_last ? TextAlignment.RIGHT : TextAlignment.LEFT,
                    weight: 1,
                };
            }
            return {
                text: col.text,
                align: col.align ?? (is_last ? TextAlignment.RIGHT : TextAlignment.LEFT),
                weight: col.weight ?? 1,
            };
        });

        this.nodes.push({ type: 'columns', columns: resolved_columns, style: resolve_style(style) });
        return this;
    }

    /**
     * Adiciona uma linha divisória horizontal.
     * @param char Caractere utilizado para desenhar a linha. Padrão: '-'.
     * @param style Estilo da linha (sólida, tracejada, pontilhada). Padrão: SOLID.
     */
    addDivider(char = '-', style: DividerStyle = DividerStyle.SOLID): this {
        this.nodes.push({ type: 'divider', char, style });
        return this;
    }

    /**
    * Adiciona uma imagem.
    *
    * 
    * @param source Dados da imagem: string base64, caminho de arquivo ou URI,
    * de acordo com `sourceType`.
    * @param sourceType Origem dos dados da imagem. Padrão: BASE64.
    * @param options Opções de estilo (alinhamento, dimensões, margens).
    * @returns {this} Para encadeamento de chamadas.
    */
    addImage(source: string, sourceType: ImageSourceType = ImageSourceType.BASE64, options?: ImagePrintOptions): this {
        this.nodes.push({
            type: 'image',
            source,
            sourceType,
            align: options?.align ?? TextAlignment.CENTER,
            width: options?.width,
            height: options?.height,
            marginTop: options?.marginTop ?? 0,
            marginBottom: options?.marginBottom ?? 0,
            marginLeft: options?.marginLeft ?? 0,
            marginRight: options?.marginRight ?? 0,
        });
        return this;
    }

    /**
     * Adiciona um código de barras ao recibo.
     * @param data Conteúdo a ser codificado.
     * @param symbology Padrão de codificação do código de barras. Padrão: CODE128.
     * @param height Altura do código de barras em pixels. Padrão: 60.
     */
    addBarcode(data: string, symbology: BarcodeSymbology = BarcodeSymbology.CODE128, height = 60): this {
        this.nodes.push({ type: 'barcode', data, symbology, height });
        return this;
    }

    /**
     * Adiciona um QR Code ao recibo.
     * @param data Conteúdo a ser codificado (URL, texto, chave de acesso, etc).
     * @param size Tamanho do QR Code em pixels (largura e altura). Padrão: 150.
     */
    addQRCode(data: string, size = 150): this {
        this.nodes.push({ type: 'qrcode', data, size });
        return this;
    }

    /**
     * Adiciona espaçamento vertical (avanço de papel) ao recibo.
     * @param lines Quantidade de linhas a avançar. Padrão: 1.
     */
    addFeed(lines = 1): this {
        this.nodes.push({ type: 'feed', lines });
        return this;
    }

    /**
     * Finaliza a construção e retorna o layout pronto para impressão.
     * @returns {ReceiptLayout} Estrutura serializável a ser enviada ao terminal.
     */
    build(): ReceiptLayout {
        return { paperWidthMm: this.paperWidthMm, nodes: this.nodes };
    }
}