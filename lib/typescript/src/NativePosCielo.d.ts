import { type TurboModule } from 'react-native';
export interface Spec extends TurboModule {
    initialize(client_id: string, access_token: string): void;
    getTerminalInfo(): Promise<string>;
    getProductList(): Promise<string>;
    requestPayment(data: string): Promise<string>;
    cancelPayment(data: string): Promise<string>;
    printText(data: string): Promise<string>;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativePosCielo.d.ts.map