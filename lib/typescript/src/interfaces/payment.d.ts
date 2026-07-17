import { CaptureType, PaymentMethod, PaymentStatus } from "../enums/payment";
export type PaymentRequest = {
    /**
     * Valor total da transação em centavos (ex: 1000 para R$ 10,00).
     */
    value: number;
    /**
     * Tipo/método de pagamento escolhido.
     */
    payment_code: PaymentMethod;
    /**
     * Quantidade de parcelas (0 para débito ou crédito à vista).
     */
    installments: number;
    /**
     * Identificador único do pedido/transação no seu sistema.
     * @optional
     */
    reference?: string;
    /**
     * Código do estabelecimento comercial (útil para cenários Multi-EC).
     * @optional
     */
    merchant_code?: string;
    /**
     * E-mail do cliente para envio do comprovante.
     * @optional
     */
    email?: string;
};
/**
 * @param request
 */
export declare function serialize_payment_request(request: PaymentRequest): object;
export declare class PaymentResult {
    /** ID único da transação gerado pela Cielo LIO */
    id: string;
    /** Status final da transação */
    status: PaymentStatus;
    /** ID único do pedido (Order) gerado na raiz da Cielo LIO */
    order_id: string;
    /** Valor total da transação pago pelo cliente em centavos (ex: 1500 para R$ 15,00) */
    amount: number;
    /** Sua referência interna enviada no início do pagamento */
    reference: string;
    /** Código de autorização da adquirente (Cielo) */
    auth_code: string;
    /** NSU / Código interno gerado pela Cielo */
    cielo_code: string;
    /** Cartão mascarado utilizado (ex: "************8446") */
    card_mask: string;
    /** Bandeira do cartão utilizado (ex: "VISA", "MASTERCARD", "ELO") */
    card_brand: string | null;
    /** Tipo de captura/entrada física do cartão (ex: CONTACTLESS, EMV, DIGITADO) */
    capture_type: CaptureType;
    /** Método de pagamento utilizado convertido para o nosso Enum */
    payment_method: PaymentMethod | string;
    /** Número final de parcelas aplicadas na transação */
    installments: number;
    /** Data e hora em que a transação foi criada (formato string legível) */
    created_at: string;
    constructor(init: PaymentResult);
}
/**
 * Converte o monstro de JSON aninhado retornado pela Cielo LIO em uma estrutura limpa e plana.
 * @param raw O JSON bruto retornado pela ponte nativa.
 */
export declare function parse_payment_result(raw: RawCieloPaymentResponse): PaymentResult;
export declare function validate_payment_request(request: PaymentRequest): void;
export interface RawCieloPaymentField {
    productName: string;
    primaryProductName: string;
    secondaryProductName: string;
    pan: string;
    numberOfQuotas: string;
    cardCaptureType: string;
    cardLabelApplication: string;
    paymentTransactionId: string;
}
export interface RawCieloPaymentItem {
    id: string;
    amount: number;
    authCode: string;
    cieloCode: string;
    mask: string;
    merchantCode: string;
    brand: string;
    terminal: string;
    paymentFields: RawCieloPaymentField;
}
export interface RawCieloPaymentResponse {
    id: string;
    reference: string;
    status: "PAID" | "PENDING" | "CANCELLED" | string;
    price: number;
    paidAmount: number;
    payments: RawCieloPaymentItem[];
    createdAt: string;
}
/**
 * Representa os dados necessários para realizar o cancelamento (estorno) de uma transação.
 */
export type CancelRequest = {
    /**
     * ID único do pedido gerado originalmente pela Cielo.
     */
    order_id: string;
    /** Código de autorização original */
    auth_code: string;
    /** NSU / Código Cielo original */
    cielo_code: string;
    /**
     * Valor a ser estornado em centavos (ex: 1500 para estornar R$ 15,00).
     * Pode ser o valor total da venda ou um valor parcial.
     */
    value: number;
};
/**
 * Valida os dados para garantir que a requisição de cancelamento seja íntegra.
 */
export declare function validate_cancel_request(request: CancelRequest): void;
export declare function serialize_cancel_request(request: CancelRequest): {
    orderId: string;
    authCode: string;
    cieloCode: string;
    value: number;
};
export declare class CancelResult {
    /** ID único da operação de cancelamento gerado pela Cielo LIO */
    id: string;
    /** ID do pedido global (Order ID) na Cielo LIO */
    order_id: string;
    /** Status atual do pedido (ex: "ENTERED", "CANCELED") */
    status: PaymentStatus;
    /** Valor que foi cancelado/estornado nesta operação em centavos */
    amount_canceled: number;
    /** Código de autorização do estorno */
    cancel_auth_code: string;
    /** NSU / Código interno do estorno gerado pela Cielo */
    cancel_cielo_code: string;
    /** NSU da transação original que foi cancelada */
    original_cielo_code: string | null;
    /** Cartão mascarado que recebeu o estorno */
    card_mask: string;
    /** Data e hora da atualização do cancelamento */
    updated_at: string;
    constructor(init: CancelResult);
}
export declare function parse_cancel_result(raw: RawCieloPaymentResponse): CancelResult;
export interface RawCieloPaymentField {
    productName: string;
    primaryProductName: string;
    secondaryProductName: string;
    pan: string;
    numberOfQuotas: string;
    paymentTransactionId: string;
    cardCaptureType: string;
    entranceMode?: string;
    originalTransactionId?: string;
}
export interface RawCieloPaymentItem {
    id: string;
    amount: number;
    authCode: string;
    cieloCode: string;
    mask: string;
    merchantCode: string;
    terminal: string;
    brand: string;
    paymentFields: RawCieloPaymentField;
}
export interface RawCieloPaymentResponse {
    id: string;
    reference: string;
    status: string;
    price: number;
    paidAmount: number;
    payments: RawCieloPaymentItem[];
    createdAt: string;
    updatedAt: string;
    type: string;
}
//# sourceMappingURL=payment.d.ts.map