"use strict";

/**
 * Representa as informações técnicas e de identificação de um terminal (POS).
 */
export default class TerminalInfo {
  /**
   * Nível da bateria do dispositivo (representado como um percentual em decimal, ex: 0.25 para 25%).
   */

  /**
   * Modelo do dispositivo físico.
   */

  /**
   * Número IMEI (International Mobile Equipment Identity) do terminal.
   */

  /**
   * Número lógico do terminal.
   */

  /**
   * Código de identificação do estabelecimento comercial (Merchant Code).
   */

  /**
   * Número de série físico do dispositivo.
   */

  constructor(init) {
    this.battery_level = init.battery_level;
    this.device_model = init.device_model;
    this.imei_number = init.imei_number;
    this.logic_number = init.logic_number;
    this.merchant_code = init.merchant_code;
    this.serial_number = init.serial_number;
  }
}

/**
 * Converte um objeto JSON (com propriedades em camelCase) em uma instância da classe TerminalInfo.
 * * @param {Object} json - O objeto JSON bruto recebido.
 * @param {number} json.batteryLevel - Nível da bateria.
 * @param {string} json.deviceModel - Modelo do dispositivo.
 * @param {string} json.imeiNumber - Número IMEI.
 * @param {string} json.logicNumber - Número lógico.
 * @param {string} json.merchantCode - Código do lojista.
 * @param {string} json.serialNumber - Número de série.
 * @returns {TerminalInfo} Uma nova instância de TerminalInfo preenchida.
 */
export function parse_terminal_info(json) {
  return new TerminalInfo({
    battery_level: json.batteryLevel,
    device_model: json.deviceModel,
    imei_number: json.imeiNumber,
    logic_number: json.logicNumber,
    merchant_code: json.merchantCode,
    serial_number: json.serialNumber
  });
}
//# sourceMappingURL=terminal.js.map