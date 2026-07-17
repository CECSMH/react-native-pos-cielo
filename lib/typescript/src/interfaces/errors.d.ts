/**
 * Erro customizado para operações falhas no SDK da Cielo.
 */
export default class CieloError extends Error {
    /**
     * Código do erro.
     */
    readonly code: string;
    constructor(code: string, message: string);
}
/**
 * @param error
 * @returns {CieloError}
 */
export declare function parse_cielo_error(error: any): CieloError;
/**
 * Erro lançado quando os dados de entrada de um pagamento não atendem aos critérios mínimos.
 */
export declare class ValidationError extends Error {
    /**
     * Propriedade específica que causou a falha de validação.
     */
    readonly field: string;
    constructor(field: string, message: string);
}
//# sourceMappingURL=errors.d.ts.map