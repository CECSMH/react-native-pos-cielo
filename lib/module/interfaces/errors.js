"use strict";

/**
 * Erro customizado para operações falhas no SDK da Cielo.
 */
export default class CieloError extends Error {
  /**
   * Código do erro.
   */

  constructor(code, message) {
    super(message);
    this.name = "CieloError";
    this.code = code;
    this.message = message;
  }
}

/**
 * @param error
 * @returns {CieloError}
 */
export function parse_cielo_error(error) {
  if (error instanceof CieloError) {
    return error;
  }
  const code = error?.code || "UNKNOWN_ERROR";
  const message = error?.message || "Ocorreu um erro inesperado no terminal.";
  return new CieloError(code, message.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim());
}

/**
 * Erro lançado quando os dados de entrada de um pagamento não atendem aos critérios mínimos.
 */
export class ValidationError extends Error {
  /**
   * Propriedade específica que causou a falha de validação.
   */

  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.message = message;
  }
}
//# sourceMappingURL=errors.js.map