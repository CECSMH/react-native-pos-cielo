import { BarcodeSymbology, DividerStyle, ImageSourceType } from "./enums/printer";
import type { ColumnInput, ImagePrintOptions, PrintStyleOptions, ReceiptLayout } from "./interfaces/printer";
/**
 * Construtor de layouts de recibo para impressão.
 */
export declare class ReceiptPrintBuilder {
    private paperWidthMm;
    private nodes;
    /**
     * @param paperWidthMm Largura do papel em milímetros. Padrão: 58.
     */
    constructor(paperWidthMm?: 58 | 80);
    /**
     * Adiciona uma linha de texto ao recibo.
     * @param content Conteúdo do texto a ser exibido.
     * @param style Opções de estilo (alinhamento, tamanho, fonte, margens).
     */
    addText(content: string, style?: PrintStyleOptions): this;
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
    addColumns(columns: ColumnInput[], style?: PrintStyleOptions): this;
    /**
     * Adiciona uma linha divisória horizontal.
     * @param char Caractere utilizado para desenhar a linha. Padrão: '-'.
     * @param style Estilo da linha (sólida, tracejada, pontilhada). Padrão: SOLID.
     */
    addDivider(char?: string, style?: DividerStyle): this;
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
    addImage(source: string, sourceType?: ImageSourceType, options?: ImagePrintOptions): this;
    /**
     * Adiciona um código de barras ao recibo.
     * @param data Conteúdo a ser codificado.
     * @param symbology Padrão de codificação do código de barras. Padrão: CODE128.
     * @param height Altura do código de barras em pixels. Padrão: 60.
     */
    addBarcode(data: string, symbology?: BarcodeSymbology, height?: number): this;
    /**
     * Adiciona um QR Code ao recibo.
     * @param data Conteúdo a ser codificado (URL, texto, chave de acesso, etc).
     * @param size Tamanho do QR Code em pixels (largura e altura). Padrão: 150.
     */
    addQRCode(data: string, size?: number): this;
    /**
     * Adiciona espaçamento vertical (avanço de papel) ao recibo.
     * @param lines Quantidade de linhas a avançar. Padrão: 1.
     */
    addFeed(lines?: number): this;
    /**
     * Finaliza a construção e retorna o layout pronto para impressão.
     * @returns {ReceiptLayout} Estrutura serializável a ser enviada ao terminal.
     */
    build(): ReceiptLayout;
}
//# sourceMappingURL=receipt_print.d.ts.map