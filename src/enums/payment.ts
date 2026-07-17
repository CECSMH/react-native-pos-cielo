export enum PaymentMethod {
    /** Pagamento com cartão da loja à vista. */
    CARTAO_LOJA_AVISTA = 'CARTAO_LOJA_AVISTA',

    /** Pagamento de fatura do cartão da loja efetuado via cheque. */
    CARTAO_LOJA_PAGTO_FATURA_CHEQUE = 'CARTAO_LOJA_PAGTO_FATURA_CHEQUE',

    /** Pagamento de fatura do cartão da loja efetuado em dinheiro. */
    CARTAO_LOJA_PAGTO_FATURA_DINHEIRO = 'CARTAO_LOJA_PAGTO_FATURA_DINHEIRO',

    /** Parcelamento no cartão da loja em modalidade genérica quando não há distinção do administrador. */
    CARTAO_LOJA_PARCELADO = 'CARTAO_LOJA_PARCELADO',

    /** Parcelamento do cartão da loja administrado por banco parceiro. */
    CARTAO_LOJA_PARCELADO_BANCO = 'CARTAO_LOJA_PARCELADO_BANCO',

    /** Parcelamento no cartão da loja com condições definidas pelo próprio varejista. */
    CARTAO_LOJA_PARCELADO_LOJA = 'CARTAO_LOJA_PARCELADO_LOJA',

    /** Simulação de crediário com cálculo de parcelas sem efetivar a venda. */
    CREDIARIO_SIMULACAO = 'CREDIARIO_SIMULACAO',

    /** Venda realizada via crediário com registro da transação a prazo no sistema do lojista. */
    CREDIARIO_VENDA = 'CREDIARIO_VENDA',

    /** Cartão de crédito, cobrança em uma única parcela na fatura do portador. */
    CREDITO_AVISTA = 'CREDITO_AVISTA',

    /** Venda a prazo via crediário com instrumento de crédito, com análise e financiamento pelo lojista. */
    CREDITO_CREDIARIO_CREDITO = 'CREDITO_CREDIARIO_CREDITO',

    /** Crédito parcelado administrado pela administradora. */
    CREDITO_PARCELADO_ADM = 'CREDITO_PARCELADO_ADM',

    /** Crédito parcelado financiado pelo banco emissor. */
    CREDITO_PARCELADO_BNCO = 'CREDITO_PARCELADO_BNCO',

    /** Crédito parcelado com condições definidas pela loja. */
    CREDITO_PARCELADO_LOJA = 'CREDITO_PARCELADO_LOJA',

    /** Cartão de débito, liquidado à vista diretamente na conta do portador. */
    DEBITO_AVISTA = 'DEBITO_AVISTA',

    /** Indica uma transação de débito utilizada para quitar a fatura de cartões da própria loja. Pode ter taxas diferenciadas para o Estabelecimento Comercial (EC). */
    DEBITO_PAGTO_FATURA_DEBITO = 'DEBITO_PAGTO_FATURA_DEBITO',

    /** Transações com cartões de frotas com regras específicas de uso corporativo. */
    FROTAS = 'FROTAS',

    /** Transferência/recebimento instantâneo via Pix. */
    PIX = 'PIX',

    /** Reserva de limite com autorização pendente de captura. */
    PRE_AUTORIZACAO = 'PRE_AUTORIZACAO',

    /** Benefício de cartão vale alimentação, restrita a estabelecimentos elegíveis. */
    VOUCHER_ALIMENTACAO = 'VOUCHER_ALIMENTACAO',

    /** Voucher automotivo, um benefício relacionado a veículos e transporte. */
    VOUCHER_AUTO = 'VOUCHER_AUTO',

    /** Benefício automotivo conforme regras do programa. */
    VOUCHER_AUTOMOTIVO = 'VOUCHER_AUTOMOTIVO',

    /** Cartão de multibenefícios conforme regras do programa. */
    VOUCHER_BENEFICIOS = 'VOUCHER_BENEFICIOS',

    /** Operação de consulta de saldo de benefício, sem movimentação financeira. */
    VOUCHER_CONSULTA_SALDO = 'VOUCHER_CONSULTA_SALDO',

    /** Benefício de cultura conforme elegibilidade do benefício. */
    VOUCHER_CULTURA = 'VOUCHER_CULTURA',

    /** Benefício de pedágio. */
    VOUCHER_PEDAGIO = 'VOUCHER_PEDAGIO',

    /** Benefício de cartão vale refeição para consumo em restaurantes e afins. */
    VOUCHER_REFEICAO = 'VOUCHER_REFEICAO',

    /** Benefício Vale-Pedágio, específico para transporte de cargas conforme regulamentação. */
    VOUCHER_VALE_PEDAGIO = 'VOUCHER_VALE_PEDAGIO',
}

export enum PaymentStatus {
    /** Pedido inserido/criado no sistema, aguardando interação. */
    ENTERED = 'ENTERED',

    /** Pedido reiniciado ou reentrado para nova tentativa/fluxo. */
    RE_ENTERED = 'RE_ENTERED',

    /** O pagamento foi realizado e o pedido foi pago com sucesso. */
    PAID = 'PAID',

    /** O pedido ou pagamento foi cancelado. */
    CANCELED = 'CANCELED',

    /** O pedido foi finalizado e fechado com sucesso (fluxo concluído). */
    CLOSED = 'CLOSED'
}

export enum CaptureType {
    /** Inserido via Chip (EMV) */
    EMV = 0,

    /** Dados do cartão digitados manualmente */
    DIGITADO = 1,

    /** Cartão passado pela tarja magnética (Trilha 1 e Trilha 2) */
    TRILHA = 2,

    /** Pago por aproximação (NFC / Contactless) - CTLS_EMV ou CTLS_TRILHA */
    CONTACTLESS = 3,

    /** Pago via leitura de código QR (Pix ou carteiras digitais) */
    QRCODE = 6,

    /** Entrada não mapeada ou manual sem especificações (NONE, TIBC_10, TIBC_30, EASY_ENTRY) */
    OUTROS = -1
}