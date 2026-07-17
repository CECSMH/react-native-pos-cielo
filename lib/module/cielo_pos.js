"use strict";

import { Linking } from "react-native";
import { parse_terminal_info } from "./interfaces/terminal.js";
import PosCielo from "./NativePosCielo.js";
import { parse_cielo_error, ValidationError } from "./interfaces/errors.js";
import { parse_cancel_result, parse_payment_result, validate_cancel_request, validate_payment_request, serialize_cancel_request, serialize_payment_request } from "./interfaces/payment.js";
import { ReceiptPrintBuilder } from "./receipt_print.js";
import { validate_print_layout } from "./interfaces/printer.js";
const CIELO_SCHEME = 'lio';

/**
 * Cielo.
 */
export default class Cielo {
  /**
   * Verifica se o aplicativo está sendo executado em um terminal POS (maquininha) físico da Cielo.
   */
  static async is_running_on_pos() {
    try {
      return await Linking.canOpenURL(`${CIELO_SCHEME}://print`);
    } catch {
      return false;
    }
    ;
  }
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
  static initialize(client_id, access_token) {
    PosCielo.initialize(client_id, access_token);
  }
  /**
   * Obtém as informações do terminal físico atual.
   * @returns {Promise<TerminalInfo>}
   * @throws {CieloError}
   */
  static async get_terminal_info() {
    try {
      const j_str = await PosCielo.getTerminalInfo();
      const raw_json = JSON.parse(j_str);
      return parse_terminal_info(raw_json);
    } catch (error) {
      throw parse_cielo_error(error);
    }
    ;
  }
  /**
   * Obtém a lista de métodos de pagamento disponíveis habilitados para este terminal.
   * @returns {Promise<PaymentMethod[]>}
   * @throws {CieloError}
   */
  static async get_available_payments() {
    try {
      const j_str = await PosCielo.getProductList();
      return JSON.parse(j_str);
    } catch (error) {
      throw parse_cielo_error(error);
    }
    ;
  }
  /**
   * Realiza uma transação de pagamento.
   * @param request
   * @returns {Promise<PaymentResult>} 
   * @throws {CieloError}
   * @throws {ValidationError}
   */
  static async request_payment(request) {
    try {
      validate_payment_request(request);
      const payload = serialize_payment_request(request);
      const j_str = await PosCielo.requestPayment(JSON.stringify(payload));
      const raw_response = JSON.parse(j_str);
      return parse_payment_result(raw_response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw parse_cielo_error(error);
    }
    ;
  }
  /**
  * Realiza o cancelamento (estorno) de uma transação anterior.
  * @param request Dados do estorno.
  * @throws {CieloError}
  * @throws {ValidationError}
  */
  static async cancel_payment(request) {
    try {
      validate_cancel_request(request);
      const raw = serialize_cancel_request(request);
      const j_str = await PosCielo.cancelPayment(JSON.stringify(raw));
      const r = JSON.parse(j_str);
      return parse_cancel_result(r);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw parse_cielo_error(error);
    }
    ;
  }
  /**
   * Imprime um recibo no terminal.
   * @param layout
   * @returns {Promise<void>}
   * @throws {CieloError}
   */
  static async print(input) {
    try {
      const layout = is_receipt_builder(input) ? input.build() : input;
      validate_print_layout(layout);
      await PosCielo.printText(JSON.stringify(layout));
    } catch (error) {
      throw parse_cielo_error(error);
    }
    ;
  }
}
;
function is_receipt_builder(input) {
  return input instanceof ReceiptPrintBuilder;
}
;
//# sourceMappingURL=cielo_pos.js.map