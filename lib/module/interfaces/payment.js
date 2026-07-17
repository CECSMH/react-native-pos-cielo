"use strict";

import { CaptureType, PaymentMethod, PaymentStatus } from "../enums/payment.js";
import { ValidationError } from "./errors.js";
/**
 * @param request 
 */
export function serialize_payment_request(request) {
  return {
    value: request.value,
    paymentCode: request.payment_code,
    installments: request.installments,
    reference: request.reference,
    merchantCode: request.merchant_code,
    email: request.email
  };
}
export class PaymentResult {
  /** ID único da transação gerado pela Cielo LIO */

  /** Status final da transação */

  /** ID único do pedido (Order) gerado na raiz da Cielo LIO */

  /** Valor total da transação pago pelo cliente em centavos (ex: 1500 para R$ 15,00) */

  /** Sua referência interna enviada no início do pagamento */

  /** Código de autorização da adquirente (Cielo) */

  /** NSU / Código interno gerado pela Cielo */

  /** Cartão mascarado utilizado (ex: "************8446") */

  /** Bandeira do cartão utilizado (ex: "VISA", "MASTERCARD", "ELO") */

  /** Tipo de captura/entrada física do cartão (ex: CONTACTLESS, EMV, DIGITADO) */

  /** Método de pagamento utilizado convertido para o nosso Enum */

  /** Número final de parcelas aplicadas na transação */

  /** Data e hora em que a transação foi criada (formato string legível) */

  constructor(init) {
    this.id = init.id;
    this.status = init.status;
    this.amount = init.amount;
    this.reference = init.reference;
    this.auth_code = init.auth_code;
    this.cielo_code = init.cielo_code;
    this.card_mask = init.card_mask;
    this.payment_method = init.payment_method;
    this.installments = init.installments;
    this.created_at = init.created_at;
    this.card_brand = init.card_brand;
    this.order_id = init.order_id;
    this.capture_type = init.capture_type;
  }
}
;

/**
 * Converte o monstro de JSON aninhado retornado pela Cielo LIO em uma estrutura limpa e plana.
 * @param raw O JSON bruto retornado pela ponte nativa.
 */
export function parse_payment_result(raw) {
  const payment = raw.payments?.[0];
  const fields = payment?.paymentFields;
  const raw_product = fields?.productName || "";
  const payment_method = Object.values(PaymentMethod).includes(raw_product) ? raw_product : raw_product;
  const raw_status = raw.status?.toUpperCase() || "";
  const status = Object.values(PaymentStatus).includes(raw_status) ? raw_status : PaymentStatus.ENTERED;
  const rawCaptureValue = parseInt(fields?.cardCaptureType || "", 10);
  let capture_type;
  switch (rawCaptureValue) {
    case 0:
      capture_type = CaptureType.EMV;
      break;
    case 1:
      capture_type = CaptureType.DIGITADO;
      break;
    case 2:
      capture_type = CaptureType.TRILHA;
      break;
    case 3:
      capture_type = CaptureType.CONTACTLESS;
      break;
    case 6:
      capture_type = CaptureType.QRCODE;
      break;
    default:
      capture_type = CaptureType.OUTROS;
      break;
  }
  const brand = payment?.brand || null;
  return new PaymentResult({
    id: payment?.id || raw.id,
    status,
    amount: raw.paidAmount || raw.price,
    reference: raw.reference,
    auth_code: payment?.authCode || "",
    cielo_code: payment?.cieloCode || "",
    card_mask: payment?.mask || fields?.pan || "",
    card_brand: brand ? brand.toUpperCase() : null,
    payment_method,
    capture_type,
    order_id: raw.id,
    installments: fields?.numberOfQuotas ? parseInt(fields.numberOfQuotas, 10) : 1,
    created_at: raw.createdAt
  });
}
;
export function validate_payment_request(request) {
  if (typeof request.value !== "number" || isNaN(request.value)) {
    throw new ValidationError("value", "O valor do pagamento deve ser um número.");
  }
  if (!Number.isInteger(request.value)) {
    throw new ValidationError("value", "O valor deve ser um número inteiro (representando os centavos). Ex: 1000 para R$ 10,00.");
  }
  if (request.value <= 0) {
    throw new ValidationError("value", "O valor do pagamento deve ser maior do que zero.");
  }
  if (!request.payment_code) {
    throw new ValidationError("payment_code", "O método de pagamento é obrigatório.");
  }
  if (!Object.values(PaymentMethod).includes(request.payment_code)) {
    throw new ValidationError("payment_code", `Método de pagamento inválido.`);
  }
  if (typeof request.installments !== "number" || !Number.isInteger(request.installments) || request.installments < 0) {
    throw new ValidationError("installments", "A quantidade de parcelas deve ser um número inteiro não negativo.");
  }
  if (request.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new ValidationError("email", "O e-mail fornecido possui um formato inválido.");
    }
  }
}

/**
 * Representa os dados necessários para realizar o cancelamento (estorno) de uma transação.
 */

/**
 * Valida os dados para garantir que a requisição de cancelamento seja íntegra.
 */
export function validate_cancel_request(request) {
  if (!request.order_id || typeof request.order_id !== "string" || request.order_id.trim() === "") {
    throw new ValidationError("order_id", "O ID do pedido original é obrigatório.");
  }
  if (typeof request.value !== "number" || isNaN(request.value)) {
    throw new ValidationError("value", "O valor de cancelamento deve ser um número válido.");
  }
  if (!Number.isInteger(request.value)) {
    throw new ValidationError("value", `O valor de cancelamento deve ser um número inteiro representando os centavos (enviado: ${request.value}).`);
  }
  if (request.value <= 0) {
    throw new ValidationError("value", "O valor de cancelamento deve ser maior do que zero.");
  }
  if (!request.auth_code || request.auth_code.trim() === "") {
    throw new ValidationError("auth_code", "O código de autorização (auth_code) é obrigatório para o estorno.");
  }
  if (!request.cielo_code || request.cielo_code.trim() === "") {
    throw new ValidationError("cielo_code", "O código NSU da Cielo (cielo_code) é obrigatório para o estorno.");
  }
}
export function serialize_cancel_request(request) {
  return {
    orderId: request.order_id,
    authCode: request.auth_code,
    cieloCode: request.cielo_code,
    value: request.value
  };
}
export class CancelResult {
  /** ID único da operação de cancelamento gerado pela Cielo LIO */

  /** ID do pedido global (Order ID) na Cielo LIO */

  /** Status atual do pedido (ex: "ENTERED", "CANCELED") */

  /** Valor que foi cancelado/estornado nesta operação em centavos */

  /** Código de autorização do estorno */

  /** NSU / Código interno do estorno gerado pela Cielo */

  /** NSU da transação original que foi cancelada */

  /** Cartão mascarado que recebeu o estorno */

  /** Data e hora da atualização do cancelamento */

  constructor(init) {
    this.id = init.id;
    this.order_id = init.order_id;
    this.status = init.status;
    this.amount_canceled = init.amount_canceled;
    this.cancel_auth_code = init.cancel_auth_code;
    this.cancel_cielo_code = init.cancel_cielo_code;
    this.original_cielo_code = init.original_cielo_code;
    this.card_mask = init.card_mask;
    this.updated_at = init.updated_at;
  }
}
export function parse_cancel_result(raw) {
  const cancel_payment = raw.payments?.[raw.payments.length - 1];
  const fields = cancel_payment?.paymentFields;
  const raw_status = raw.status?.toUpperCase() || "";
  const status = Object.values(PaymentStatus).includes(raw_status) ? raw_status : PaymentStatus.ENTERED;
  return new CancelResult({
    id: cancel_payment?.id || raw.id,
    order_id: raw.id,
    status: status,
    amount_canceled: cancel_payment?.amount || raw.price,
    cancel_auth_code: cancel_payment?.authCode || "",
    cancel_cielo_code: cancel_payment?.cieloCode || "",
    original_cielo_code: fields?.originalTransactionId || null,
    card_mask: cancel_payment?.mask || fields?.pan || "",
    updated_at: raw.updatedAt
  });
}
;
//# sourceMappingURL=payment.js.map