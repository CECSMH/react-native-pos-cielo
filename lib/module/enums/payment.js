"use strict";

export let PaymentMethod = /*#__PURE__*/function (PaymentMethod) {
  /** Pagamento com cartão da loja à vista. */
  PaymentMethod["CARTAO_LOJA_AVISTA"] = "CARTAO_LOJA_AVISTA";
  /** Pagamento de fatura do cartão da loja efetuado via cheque. */
  PaymentMethod["CARTAO_LOJA_PAGTO_FATURA_CHEQUE"] = "CARTAO_LOJA_PAGTO_FATURA_CHEQUE";
  /** Pagamento de fatura do cartão da loja efetuado em dinheiro. */
  PaymentMethod["CARTAO_LOJA_PAGTO_FATURA_DINHEIRO"] = "CARTAO_LOJA_PAGTO_FATURA_DINHEIRO";
  /** Parcelamento no cartão da loja em modalidade genérica quando não há distinção do administrador. */
  PaymentMethod["CARTAO_LOJA_PARCELADO"] = "CARTAO_LOJA_PARCELADO";
  /** Parcelamento do cartão da loja administrado por banco parceiro. */
  PaymentMethod["CARTAO_LOJA_PARCELADO_BANCO"] = "CARTAO_LOJA_PARCELADO_BANCO";
  /** Parcelamento no cartão da loja com condições definidas pelo próprio varejista. */
  PaymentMethod["CARTAO_LOJA_PARCELADO_LOJA"] = "CARTAO_LOJA_PARCELADO_LOJA";
  /** Simulação de crediário com cálculo de parcelas sem efetivar a venda. */
  PaymentMethod["CREDIARIO_SIMULACAO"] = "CREDIARIO_SIMULACAO";
  /** Venda realizada via crediário com registro da transação a prazo no sistema do lojista. */
  PaymentMethod["CREDIARIO_VENDA"] = "CREDIARIO_VENDA";
  /** Cartão de crédito, cobrança em uma única parcela na fatura do portador. */
  PaymentMethod["CREDITO_AVISTA"] = "CREDITO_AVISTA";
  /** Venda a prazo via crediário com instrumento de crédito, com análise e financiamento pelo lojista. */
  PaymentMethod["CREDITO_CREDIARIO_CREDITO"] = "CREDITO_CREDIARIO_CREDITO";
  /** Crédito parcelado administrado pela administradora. */
  PaymentMethod["CREDITO_PARCELADO_ADM"] = "CREDITO_PARCELADO_ADM";
  /** Crédito parcelado financiado pelo banco emissor. */
  PaymentMethod["CREDITO_PARCELADO_BNCO"] = "CREDITO_PARCELADO_BNCO";
  /** Crédito parcelado com condições definidas pela loja. */
  PaymentMethod["CREDITO_PARCELADO_LOJA"] = "CREDITO_PARCELADO_LOJA";
  /** Cartão de débito, liquidado à vista diretamente na conta do portador. */
  PaymentMethod["DEBITO_AVISTA"] = "DEBITO_AVISTA";
  /** Indica uma transação de débito utilizada para quitar a fatura de cartões da própria loja. Pode ter taxas diferenciadas para o Estabelecimento Comercial (EC). */
  PaymentMethod["DEBITO_PAGTO_FATURA_DEBITO"] = "DEBITO_PAGTO_FATURA_DEBITO";
  /** Transações com cartões de frotas com regras específicas de uso corporativo. */
  PaymentMethod["FROTAS"] = "FROTAS";
  /** Transferência/recebimento instantâneo via Pix. */
  PaymentMethod["PIX"] = "PIX";
  /** Reserva de limite com autorização pendente de captura. */
  PaymentMethod["PRE_AUTORIZACAO"] = "PRE_AUTORIZACAO";
  /** Benefício de cartão vale alimentação, restrita a estabelecimentos elegíveis. */
  PaymentMethod["VOUCHER_ALIMENTACAO"] = "VOUCHER_ALIMENTACAO";
  /** Voucher automotivo, um benefício relacionado a veículos e transporte. */
  PaymentMethod["VOUCHER_AUTO"] = "VOUCHER_AUTO";
  /** Benefício automotivo conforme regras do programa. */
  PaymentMethod["VOUCHER_AUTOMOTIVO"] = "VOUCHER_AUTOMOTIVO";
  /** Cartão de multibenefícios conforme regras do programa. */
  PaymentMethod["VOUCHER_BENEFICIOS"] = "VOUCHER_BENEFICIOS";
  /** Operação de consulta de saldo de benefício, sem movimentação financeira. */
  PaymentMethod["VOUCHER_CONSULTA_SALDO"] = "VOUCHER_CONSULTA_SALDO";
  /** Benefício de cultura conforme elegibilidade do benefício. */
  PaymentMethod["VOUCHER_CULTURA"] = "VOUCHER_CULTURA";
  /** Benefício de pedágio. */
  PaymentMethod["VOUCHER_PEDAGIO"] = "VOUCHER_PEDAGIO";
  /** Benefício de cartão vale refeição para consumo em restaurantes e afins. */
  PaymentMethod["VOUCHER_REFEICAO"] = "VOUCHER_REFEICAO";
  /** Benefício Vale-Pedágio, específico para transporte de cargas conforme regulamentação. */
  PaymentMethod["VOUCHER_VALE_PEDAGIO"] = "VOUCHER_VALE_PEDAGIO";
  return PaymentMethod;
}({});
export let PaymentStatus = /*#__PURE__*/function (PaymentStatus) {
  /** Pedido inserido/criado no sistema, aguardando interação. */
  PaymentStatus["ENTERED"] = "ENTERED";
  /** Pedido reiniciado ou reentrado para nova tentativa/fluxo. */
  PaymentStatus["RE_ENTERED"] = "RE_ENTERED";
  /** O pagamento foi realizado e o pedido foi pago com sucesso. */
  PaymentStatus["PAID"] = "PAID";
  /** O pedido ou pagamento foi cancelado. */
  PaymentStatus["CANCELED"] = "CANCELED";
  /** O pedido foi finalizado e fechado com sucesso (fluxo concluído). */
  PaymentStatus["CLOSED"] = "CLOSED";
  return PaymentStatus;
}({});
export let CaptureType = /*#__PURE__*/function (CaptureType) {
  /** Inserido via Chip (EMV) */
  CaptureType[CaptureType["EMV"] = 0] = "EMV";
  /** Dados do cartão digitados manualmente */
  CaptureType[CaptureType["DIGITADO"] = 1] = "DIGITADO";
  /** Cartão passado pela tarja magnética (Trilha 1 e Trilha 2) */
  CaptureType[CaptureType["TRILHA"] = 2] = "TRILHA";
  /** Pago por aproximação (NFC / Contactless) - CTLS_EMV ou CTLS_TRILHA */
  CaptureType[CaptureType["CONTACTLESS"] = 3] = "CONTACTLESS";
  /** Pago via leitura de código QR (Pix ou carteiras digitais) */
  CaptureType[CaptureType["QRCODE"] = 6] = "QRCODE";
  /** Entrada não mapeada ou manual sem especificações (NONE, TIBC_10, TIBC_30, EASY_ENTRY) */
  CaptureType[CaptureType["OUTROS"] = -1] = "OUTROS";
  return CaptureType;
}({});
//# sourceMappingURL=payment.js.map