import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Cielo, {
  ReceiptPrintBuilder,
  TextAlignment,
  TypefaceStyle,
  FontFamily,
  DividerStyle,
  BarcodeSymbology,
  PaymentMethod,
} from 'react-native-pos-cielo';

import type { PaymentRequest, CancelRequest } from 'react-native-pos-cielo';
import type { PaymentResult } from 'react-native-pos-cielo';

const CLIENT_ID = "<sua chave aqui>";
const ACCESS_TOKEN = "<sua chave aqui>";

export default function App() {
  const [log, setLog] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  // Test inputs for payment
  const [amount, setAmount] = useState('1000'); // centavos -> R$ 10,00
  const [installments, setInstallments] = useState('1');

  // Holds the last successful payment so Cancel can reference it
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);

  useEffect(() => {
    try {
      Cielo.initialize(CLIENT_ID, ACCESS_TOKEN);
      setInitialized(true);
      appendLog('initialize', 'OK');
    } catch (error) {
      appendError('initialize', error);
    }
  }, []);

  const appendLog = (label: string, data: unknown) => {
    const formatted =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    setLog((prev) => `[${label}]\n${formatted}\n\n${prev}`);
  };

  const appendError = (label: string, error: unknown) => {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    setLog((prev) => `[${label} - ERROR]\n${message}\n\n${prev}`);
  };

  // --- Terminal Info ---
  const handleGetTerminalInfo = async () => {
    try {
      const info = await Cielo.get_terminal_info();
      appendLog('get_terminal_info', info);
    } catch (error) {
      appendError('get_terminal_info', error);
    }
  };

  // --- Payment Methods ---
  const handleGetPaymentMethods = async () => {
    try {
      const methods = await Cielo.get_available_payments();
      appendLog('get_available_payments', methods);
    } catch (error) {
      appendError('get_available_payments', error);
    }
  };

  // --- Request Payment ---
  const handleRequestPayment = async (method: PaymentMethod) => {
    try {
      const request: PaymentRequest = {
        value: parseInt(amount, 10),
        payment_code: method,
        installments: method === PaymentMethod.CREDITO_AVISTA ? parseInt(installments, 10) : 0,
        reference: `TEST-${Date.now()}`,
        // merchant_code: undefined,
        // email: undefined,
      };
      const result = await Cielo.request_payment(request);
      setLastPayment(result);
      appendLog('request_payment', result);
    } catch (error) {
      appendError('request_payment', error);
    }
  };

  // --- Cancel Payment (uses last successful payment) ---
  const handleCancelPayment = async () => {
    if (!lastPayment) {
      appendError('cancel_payment', 'Nenhum pagamento realizado nesta sessão para cancelar.');
      return;
    }
    try {
      const request: CancelRequest = {
        order_id: lastPayment.order_id,
        auth_code: lastPayment.auth_code,
        cielo_code: lastPayment.cielo_code,
        value: lastPayment.amount, // estorno total; ajuste para parcial se necessário
      };
      const result = await Cielo.cancel_payment(request);
      appendLog('cancel_payment', result);
    } catch (error) {
      appendError('cancel_payment', error);
    }
  };

  const handleCheckPos = async () => {
    try {
      const available = await Cielo.is_running_on_pos();
      appendLog('is_running_on_pos', available ? '✅ Cielo disponível' : '❌ Cielo não encontrado');
    } catch (error) {
      appendError('is_running_on_pos', error);
    }
  };

  // --- Print ---
  const handlePrint = async () => {
    try {


      const layout = new ReceiptPrintBuilder()
        .addText('MY COFFEE SHOP', {
          align: TextAlignment.CENTER,
          textSize: 28,
          typeface: TypefaceStyle.BOLD,
          marginBottom: 4,
        })
        .addText('Av. Paulista, 1000 - Bela Vista', {
          align: TextAlignment.CENTER,
          textSize: 16,
        })
        .addText('CNPJ: 12.345.678/0001-90', {
          align: TextAlignment.CENTER,
          textSize: 16,
          fontFamily: FontFamily.MONOSPACE,
        })
        .addFeed(1)
        .addDivider('=', DividerStyle.SOLID)
        .addColumns(['Data: 16/07/2026', 'Hora: 11:15'], { textSize: 16 })
        .addText('Pedido: #08429', { align: TextAlignment.LEFT, textSize: 16 })
        .addDivider('-', DividerStyle.DASHED)
        .addText('ITENS', {
          align: TextAlignment.LEFT,
          textSize: 18,
          typeface: TypefaceStyle.BOLD,
          marginBottom: 4,
        })
        .addColumns(
          [
            { text: '2x', weight: 0.6 },
            { text: 'Café Espresso', weight: 2.4 },
            { text: 'R$ 17,00', weight: 1 },
          ],
          { textSize: 20 }
        )
        .addColumns(
          [
            { text: '1x', weight: 0.6 },
            { text: 'Pão de Queijo', weight: 2.4 },
            { text: 'R$ 6,00', weight: 1 },
          ],
          { textSize: 20 }
        )
        .addDivider('-', DividerStyle.DASHED)
        .addColumns(['Subtotal', 'R$ 23,00'], { textSize: 18 })
        .addColumns(['TOTAL', 'R$ 23,00'], {
          textSize: 22,
          typeface: TypefaceStyle.BOLD,
          marginTop: 4,
          marginBottom: 4,
        })
        .addDivider('=', DividerStyle.SOLID)
        .addText('Consulte a Nota Fiscal:', {
          align: TextAlignment.CENTER,
          textSize: 16,
          marginTop: 8,
          marginBottom: 4,
        })
        .addQRCode('https://example.com/nfce?chave=12345', 160)
        .addFeed(1)
        .addText('Código do Pedido:', {
          align: TextAlignment.CENTER,
          textSize: 16,
          marginBottom: 4,
        })
        .addBarcode('08429000123', BarcodeSymbology.CODE128, 70)
        .addFeed(1)
        .addDivider('=', DividerStyle.SOLID)
        .addText('Obrigado pela preferência!', {
          align: TextAlignment.CENTER,
          textSize: 18,
          typeface: TypefaceStyle.BOLD,
          marginTop: 4,
        })
        .addText('Volte Sempre!', {
          align: TextAlignment.CENTER,
          textSize: 16,
          marginBottom: 8,
        })
        .addFeed(15)
        .build();

      const result = await Cielo.print(layout);
      appendLog('print', result);
    } catch (error) {
      appendError('print', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cielo POS Test Harness</Text>
        <Text style={styles.status}>
          Status: {initialized ? '✅ Initialized' : '⏳ Initializing...'}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ambiente</Text>
          <Button label="Verificar disponibilidade Cielo" onPress={handleCheckPos} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terminal</Text>
          <Button label="Get Terminal Info" onPress={handleGetTerminalInfo} />
          <Button label="Get Payment Methods" onPress={handleGetPaymentMethods} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.label}>Valor (centavos)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.label}>Parcelas (crédito)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={installments}
            onChangeText={setInstallments}
          />
          <Button
            label="Pagar (Crédito)"
            onPress={() => handleRequestPayment(PaymentMethod.CREDITO_AVISTA)}
          />
          <Button
            label="Pagar (Débito)"
            onPress={() => handleRequestPayment(PaymentMethod.DEBITO_AVISTA)}
          />
          <Button
            label="Pagar (PIX)"
            onPress={() => handleRequestPayment(PaymentMethod.PIX)}
          />

          <Text style={styles.label}>
            {lastPayment
              ? `Último pagamento: ${lastPayment.order_id} (R$ ${(lastPayment.amount / 100).toFixed(2)})`
              : 'Nenhum pagamento realizado ainda'}
          </Text>
          <Button label="Cancelar Último Pagamento" onPress={handleCancelPayment} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Print</Text>
          <Button label="Print Test Receipt" onPress={handlePrint} />
        </View>

        <View style={styles.logBox}>
          <Text style={styles.logText}>{log}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  status: { fontSize: 12, color: '#666', marginBottom: 16 },
  section: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 12, color: '#666', marginBottom: 4, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  logBox: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
  },
  logText: { color: '#c9d1d9', fontFamily: 'monospace', fontSize: 12 },
});