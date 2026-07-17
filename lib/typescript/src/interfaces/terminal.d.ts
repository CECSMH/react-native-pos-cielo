/**
 * Representa as informações técnicas e de identificação de um terminal (POS).
 */
export default class TerminalInfo {
    /**
     * Nível da bateria do dispositivo (representado como um percentual em decimal, ex: 0.25 para 25%).
     */
    battery_level: number;
    /**
     * Modelo do dispositivo físico.
     */
    device_model: string;
    /**
     * Número IMEI (International Mobile Equipment Identity) do terminal.
     */
    imei_number: string;
    /**
     * Número lógico do terminal.
     */
    logic_number: string;
    /**
     * Código de identificação do estabelecimento comercial (Merchant Code).
     */
    merchant_code: string;
    /**
     * Número de série físico do dispositivo.
     */
    serial_number: string;
    constructor(init: {
        battery_level: number;
        device_model: string;
        imei_number: string;
        logic_number: string;
        merchant_code: string;
        serial_number: string;
    });
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
export declare function parse_terminal_info(json: any): TerminalInfo;
//# sourceMappingURL=terminal.d.ts.map