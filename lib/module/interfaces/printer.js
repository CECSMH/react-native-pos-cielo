"use strict";

import { ValidationError } from "./errors.js";
export function validate_print_layout(layout) {
  if (layout.paperWidthMm !== 58 && layout.paperWidthMm !== 80) {
    throw new ValidationError("paper_with", `Largura de papel inválida: ${layout.paperWidthMm}mm. Use 58 ou 80.`);
  }
  ;
  if (!layout.nodes || layout.nodes.length === 0) {
    throw new ValidationError("empty_layout", 'O layout de impressão não pode estar vazio.');
  }
  ;
  layout.nodes.forEach((node, index) => {
    switch (node.type) {
      case 'text':
        if (!node.content || node.content.trim().length === 0) {
          throw new ValidationError("empty_layout", `Texto vazio no índice ${index}.`);
        }
        ;
        break;
      case 'columns':
        if (!node.columns || node.columns.length === 0) {
          throw new ValidationError("empty_layout", `Sem colunas definidas no índice ${index}.`);
        }
        ;
        break;
      case 'barcode':
        if (!node.data || node.data.trim().length === 0) {
          throw new ValidationError("empty_layout", `Código de barras sem dados no índice ${index}.`);
        }
        ;
        break;
      case 'qrcode':
        if (!node.data || node.data.trim().length === 0) {
          throw new ValidationError("empty_layout", `QR Code sem dados no índice ${index}.`);
        }
        ;
        break;
      case 'image':
        if (!node.source || node.source.trim().length === 0) {
          throw new ValidationError("empty_layout", `Imagem sem dados de origem no índice ${index}.`);
        }
        ;
        if (node.width !== undefined && node.width <= 0) {
          throw new ValidationError("empty_layout", `Largura de imagem inválida no índice ${index}.`);
        }
        ;
        if (node.height !== undefined && node.height <= 0) {
          throw new ValidationError("empty_layout", `Altura de imagem inválida no índice ${index}.`);
        }
        ;
        break;
      case 'feed':
        if (node.lines < 0) {
          throw new ValidationError("empty_layout", `Quantidade de linhas de avanço inválida no índice ${index}.`);
        }
        ;
        break;
    }
    ;
  });
}
;
//# sourceMappingURL=printer.js.map