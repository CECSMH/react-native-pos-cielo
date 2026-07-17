import type TerminalInfo from "./interfaces/terminal.ts";
import type { PaymentMethod } from "./enums/payment.ts";
import { PaymentResult, type CancelRequest, type PaymentRequest } from "./interfaces/payment";
import { ReceiptPrintBuilder } from "./receipt_print.js";
import { type ReceiptLayout } from "./interfaces/printer.js";
/**
 * Cielo.
 */
export default class Cielo {
    /**
     * Verifica se o aplicativo está sendo executado em um terminal POS (maquininha) físico da Cielo.
     */
    static is_running_on_pos(): Promise<boolean>;
    /**
     * Inicializa o SDK da Cielo com as credenciais do estabelecimento.
     *
     * Deve ser chamado uma única vez, antes de qualquer outra operação
     * (consulta de terminal, listagem de métodos de pagamento, transação
     * de pagamento, cancelamento ou impressão).
     *
     * @param client_id Identificador do client cadastrado na Cielo.
     * @param access_token Token de acesso para autenticação.
     */
    static initialize(client_id: string, access_token: string): void;
    /**
     * Obtém as informações do terminal físico atual.
     * @returns {Promise<TerminalInfo>}
     * @throws {CieloError}
     */
    static get_terminal_info(): Promise<TerminalInfo>;
    /**
     * Obtém a lista de métodos de pagamento disponíveis habilitados para este terminal.
     * @returns {Promise<PaymentMethod[]>}
     * @throws {CieloError}
     */
    static get_available_payments(): Promise<PaymentMethod[]>;
    /**
     * Realiza uma transação de pagamento.
     * @param request
     * @returns {Promise<PaymentResult>}
     * @throws {CieloError}
     * @throws {ValidationError}
     */
    static request_payment(request: PaymentRequest): Promise<PaymentResult>;
    /**
    * Realiza o cancelamento (estorno) de uma transação anterior.
    * @param request Dados do estorno.
    * @throws {CieloError}
    * @throws {ValidationError}
    */
    static cancel_payment(request: CancelRequest): Promise<import("./index.js").CancelResult>;
    /**
     * Imprime um recibo no terminal.
     * @param layout
     * @returns {Promise<void>}
     * @throws {CieloError}
     */
    static print(input: ReceiptLayout | ReceiptPrintBuilder): Promise<void>;
}
//# sourceMappingURL=cielo_pos.d.ts.map