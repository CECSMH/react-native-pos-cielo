# react-native-pos-cielo

SDK React Native para integração com terminais **Cielo LIO / Smart** via deep link — pagamentos, cancelamentos, consulta de terminal e impressão de recibos com layout customizável.

---

## Índice

- [Instalação](#instalação)
- [Configuração Android](#configuração-android)
- [Início rápido](#início-rápido)
- [API — Cielo](#api--cielo)
  - [`initialize`](#initializeclient_id-string-access_token-string-void)
  - [`is_running_on_pos`](#is_running_on_pos-promiseboolean)
  - [`get_terminal_info`](#get_terminal_info-promiseterminalinfo)
  - [`get_available_payments`](#get_available_payments-promisepaymentmethod)
  - [`request_payment`](#request_paymentrequest-paymentrequest-promisepaymentresult)
  - [`cancel_payment`](#cancel_paymentrequest-cancelrequest-promisecancelresult)
  - [`print`](#printinput-receiptlayout--receiptprintbuilder-promisevoid)
- [Impressão — ReceiptPrintBuilder](#impressão--receiptprintbuilder)
- [Enums](#enums)
- [Tratamento de erros](#tratamento-de-erros)
- [Exemplo completo](#exemplo-completo)
- [Licença](#licença)

---

## Instalação

```bash
npm install react-native-pos-cielo
# ou
yarn add react-native-pos-cielo
```

Este pacote utiliza a New Architecture do React Native (TurboModules). Certifique-se de que seu projeto está com a New Architecture habilitada.

---

## Configuração Android

Seu app precisa declarar um scheme próprio para receber a resposta do terminal após pagamento, cancelamento ou impressão, e informar esse mesmo scheme ao módulo.

### 1. Declarar o intent-filter de callback

Adicione à `Activity` principal do seu app, no `AndroidManifest.xml`:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:scheme="my_custom_scheme" />
</intent-filter>
```

### 2. Informar o scheme ao módulo

O valor de `android:scheme` acima **deve ser repetido** no `meta-data` a seguir, dentro de `<application>`:

```xml
<meta-data
    android:name="com.poscielo.CALLBACK_SCHEME"
    android:value="my_custom_scheme" />
```

Os dois valores (`data android:scheme` e `meta-data android:value`) precisam ser **idênticos** — é o que permite ao módulo montar a URL de callback correta ao chamar o terminal.

---

## Início rápido

```typescript
import Cielo from 'react-native-pos-cielo';

// 1. Verificar se o terminal Cielo está disponível
const available = await Cielo.is_running_on_pos();

if (available) {
  // 2. Inicializar (uma única vez, antes de qualquer outra operação)
  Cielo.initialize('SEU_CLIENT_ID', 'SEU_ACCESS_TOKEN');
}
```

---

## API — Cielo

Todos os métodos são estáticos, acessados diretamente pela classe `Cielo`.

### `initialize(client_id: string, access_token: string): void`

Inicializa o SDK com as credenciais do estabelecimento. Deve ser chamado uma única vez, antes de qualquer outra operação.

```typescript
Cielo.initialize('client_id', 'access_token');
```

### `is_running_on_pos(): Promise<boolean>`

Verifica se existe um app capaz de responder ao deep link da Cielo no dispositivo.

```typescript
if (await Cielo.is_running_on_pos()) {
  // habilitar fluxo de pagamento
}
```

### `get_terminal_info(): Promise<TerminalInfo>`

Retorna as informações técnicas do terminal físico atual.

```typescript
const info = await Cielo.get_terminal_info();
console.log(info.serial_number, info.battery_level);
```

| Campo | Tipo | Descrição |
|---|---|---|
| `battery_level` | `number` | Nível da bateria, decimal (`0.25` = 25%) |
| `device_model` | `string` | Modelo do dispositivo |
| `imei_number` | `string` | IMEI do terminal |
| `logic_number` | `string` | Número lógico do terminal |
| `merchant_code` | `string` | Código do estabelecimento (Merchant Code) |
| `serial_number` | `string` | Número de série do dispositivo |

**Lança:** `CieloError`

### `get_available_payments(): Promise<PaymentMethod[]>`

Retorna a lista de métodos de pagamento habilitados para este terminal. Ver [enum `PaymentMethod`](#paymentmethod).

**Lança:** `CieloError`

### `request_payment(request: PaymentRequest): Promise<PaymentResult>`

Inicia uma transação de pagamento.

```typescript
import { PaymentMethod } from 'react-native-pos-cielo';

const result = await Cielo.request_payment({
  value: 1000, // R$ 10,00, em centavos
  payment_code: PaymentMethod.CREDITO_AVISTA,
  installments: 0,
  reference: 'PEDIDO-001',
  email: 'cliente@exemplo.com', // opcional
});

console.log(result.card_mask, result.auth_code, result.cielo_code);
```

**`PaymentRequest`:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `value` | `number` | sim | Valor total em centavos (inteiro, > 0) |
| `payment_code` | `PaymentMethod` | sim | Método de pagamento |
| `installments` | `number` | sim | Parcelas (`0` para débito/crédito à vista) |
| `reference` | `string` | não | Referência interna do pedido |
| `merchant_code` | `string` | não | Código do estabelecimento (cenários Multi-EC) |
| `email` | `string` | não | E-mail para envio do comprovante |

**`PaymentResult`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único da transação |
| `status` | `PaymentStatus` | Status final da transação |
| `order_id` | `string` | ID do pedido (Order) na Cielo LIO |
| `amount` | `number` | Valor pago em centavos |
| `reference` | `string` | Referência interna enviada na requisição |
| `auth_code` | `string` | Código de autorização — **guarde para cancelamento** |
| `cielo_code` | `string` | NSU/código Cielo — **guarde para cancelamento** |
| `card_mask` | `string` | Cartão mascarado (ex: `"************8446"`) |
| `card_brand` | `string \| null` | Bandeira do cartão |
| `capture_type` | `CaptureType` | Forma de captura (EMV, contactless, etc.) |
| `payment_method` | `PaymentMethod \| string` | Método utilizado |
| `installments` | `number` | Parcelas aplicadas |
| `created_at` | `string` | Data/hora da criação |

**Lança:** `ValidationError` (dados de entrada inválidos) · `CieloError` (falha no terminal/transação)

### `cancel_payment(request: CancelRequest): Promise<CancelResult>`

Realiza o cancelamento (estorno) total ou parcial de uma transação anterior. Requer `order_id`, `auth_code` e `cielo_code` retornados pelo `PaymentResult` da transação original.

```typescript
const cancelResult = await Cielo.cancel_payment({
  order_id: result.order_id,
  auth_code: result.auth_code,
  cielo_code: result.cielo_code,
  value: result.amount, // total ou parcial, em centavos
});
```

**`CancelRequest`:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `order_id` | `string` | sim | ID do pedido original |
| `auth_code` | `string` | sim | Código de autorização original |
| `cielo_code` | `string` | sim | NSU/código Cielo original |
| `value` | `number` | sim | Valor a estornar em centavos (inteiro, > 0) |

**`CancelResult`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID da operação de cancelamento |
| `order_id` | `string` | ID do pedido |
| `status` | `PaymentStatus` | Status atual do pedido |
| `amount_canceled` | `number` | Valor estornado nesta operação, em centavos |
| `cancel_auth_code` | `string` | Código de autorização do estorno |
| `cancel_cielo_code` | `string` | NSU do estorno |
| `original_cielo_code` | `string \| null` | NSU da transação original |
| `card_mask` | `string` | Cartão mascarado que recebeu o estorno |
| `updated_at` | `string` | Data/hora da atualização |

**Lança:** `ValidationError` · `CieloError`

### `print(input: ReceiptLayout | ReceiptPrintBuilder): Promise<void>`

Envia um layout de recibo para impressão no terminal. Aceita tanto um `ReceiptLayout` já construído quanto uma instância de [`ReceiptPrintBuilder`](#impressão--receiptprintbuilder) — nesse caso, `.build()` é chamado internamente.

```typescript
import { ReceiptPrintBuilder, TextAlignment } from 'react-native-pos-cielo';

await Cielo.print(
  new ReceiptPrintBuilder()
    .addText('MINHA LOJA', { align: TextAlignment.CENTER, textSize: 24 })
    .addDivider()
);
```

**Lança:** `ValidationError` (layout vazio ou nós inválidos) · `CieloError`

---

## Impressão — ReceiptPrintBuilder

Builder fluente para montar layouts de recibo. Todos os métodos retornam `this` e podem ser encadeados. Finalize com `.build()` ou passe a instância diretamente para `Cielo.print()`.

```typescript
new ReceiptPrintBuilder(paperWidthMm?: 58 | 80)
```

`paperWidthMm` define a largura do papel térmico. Padrão: `58` — se seu papel for de 58mm, basta `new ReceiptPrintBuilder()`, sem argumentos.

### `addText(content: string, style?: PrintStyleOptions): this`

Adiciona uma linha de texto.

```typescript
.addText('MY COFFEE SHOP', {
  align: TextAlignment.CENTER,
  textSize: 24,
  typeface: TypefaceStyle.BOLD,
})
```

### `addColumns(columns: ColumnInput[], style?: PrintStyleOptions): this`

Adiciona uma linha com múltiplas colunas. Cada coluna pode ser uma `string` simples ou um objeto `{ text, align?, weight? }` para controle individual de alinhamento e largura relativa (como `flex-grow`). Por padrão, todas as colunas são alinhadas à esquerda, exceto a última (alinhada à direita) — ideal para pares label/valor.

```typescript
// Duas colunas, comportamento padrão (label/valor)
.addColumns(['Subtotal', 'R$ 46,50'], { textSize: 14 })

// Três colunas com pesos customizados
.addColumns([
  { text: '2x', weight: 0.6 },
  { text: 'Café Espresso', weight: 2.4 },
  { text: 'R$ 17,00', weight: 1 },
], { textSize: 16 })
```

### `addDivider(char?: string, style?: DividerStyle): this`

Adiciona uma linha divisória horizontal. Padrão: `'-'`, `DividerStyle.SOLID`.

```typescript
.addDivider('=', DividerStyle.SOLID)
```

### `addImage(source: string, sourceType?: ImageSourceType, options?: ImagePrintOptions): this`

Adiciona uma imagem (logo, assinatura, banner). Aceita base64, caminho de arquivo local ou URI de conteúdo.

```typescript
.addImage(base64Logo, ImageSourceType.BASE64, {
  align: TextAlignment.CENTER,
  width: 200, // altura calculada automaticamente mantendo a proporção
  marginBottom: 8,
})
```

Se apenas `width` **ou** `height` for informado, a outra dimensão é calculada mantendo a proporção original da imagem. Se nenhuma for informada, a imagem é ajustada à largura útil do papel.

### `addBarcode(data: string, symbology?: BarcodeSymbology, height?: number): this`

Adiciona um código de barras. Padrão: `BarcodeSymbology.CODE128`, altura `60`.

```typescript
.addBarcode('08429000123', BarcodeSymbology.CODE128, 70)
```

### `addQRCode(data: string, size?: number): this`

Adiciona um QR Code. Padrão: tamanho `150`.

```typescript
.addQRCode('https://minhaempresa.com/nfce?chave=12345', 160)
```

### `addFeed(lines?: number): this`

Adiciona espaçamento vertical (avanço de papel). Padrão: `1` linha.

### `build(): ReceiptLayout`

Finaliza a construção e retorna o objeto `ReceiptLayout` serializável. Não é necessário chamar manualmente se você for passar a instância do builder diretamente para `Cielo.print()`.

### `PrintStyleOptions`

Aplicável a `addText` e `addColumns`:

| Campo | Tipo | Padrão | Descrição |
|---|---|---|---|
| `align` | `TextAlignment` | `LEFT` | Alinhamento do texto |
| `textSize` | `number` | `14` | Tamanho da fonte (px) |
| `fontFamily` | `FontFamily` | `DEFAULT` | Família tipográfica |
| `typeface` | `TypefaceStyle` | `NORMAL` | Estilo (negrito, itálico) |
| `marginLeft` / `marginRight` / `marginTop` / `marginBottom` | `number` | `0` | Margens em px |
| `lineSpace` | `number` | `1.0` | Multiplicador de espaçamento entre linhas |

---

## Enums

#### `PaymentMethod`
Métodos de pagamento aceitos: `CREDITO_AVISTA`, `DEBITO_AVISTA`, `PIX`, `CREDITO_PARCELADO_ADM`, `CREDITO_PARCELADO_LOJA`, `VOUCHER_ALIMENTACAO`, `VOUCHER_REFEICAO`, `PRE_AUTORIZACAO`, entre outros. Consulte o arquivo de tipos para a lista completa.

#### `PaymentStatus`
`ENTERED` · `RE_ENTERED` · `PAID` · `CANCELED` · `CLOSED`

#### `CaptureType`
`EMV` · `DIGITADO` · `TRILHA` · `CONTACTLESS` · `QRCODE` · `OUTROS`

#### `TextAlignment`
`LEFT` · `CENTER` · `RIGHT`

#### `TypefaceStyle`
`NORMAL` · `BOLD` · `ITALIC` · `BOLD_ITALIC`

#### `FontFamily`
`DEFAULT` · `MONOSPACE` · `SANS_SERIF` · `SERIF` · `CONDENSED`

#### `DividerStyle`
`SOLID` · `DASHED` · `DOTTED`

#### `BarcodeSymbology`
`CODE128` · `EAN13` · `CODE39`

#### `ImageSourceType`
`BASE64` · `PATH` · `URI`

---

## Tratamento de erros


### `ValidationError`

Lançado **antes** de qualquer chamada ao terminal, quando os dados de entrada não atendem aos critérios mínimos (ex: valor de pagamento inválido, layout de impressão vazio).

```typescript
import { ValidationError } from 'react-native-pos-cielo';

try {
  await Cielo.request_payment(request);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.field, error.message);
  }
}
```

| Propriedade | Tipo | Descrição |
|---|---|---|
| `field` | `string` | Campo que causou a falha de validação |
| `message` | `string` | Descrição do erro |

### `CieloError`

Lançado quando o terminal, o SDK nativo ou a transação em si retornam uma falha.

```typescript
import CieloError from 'react-native-pos-cielo';
// ou: import { CieloError } from 'react-native-pos-cielo';

try {
  await Cielo.request_payment(request);
} catch (error) {
  if (error instanceof CieloError) {
    console.log(error.code, error.message);
  }
}
```

| Propriedade | Tipo | Descrição |
|---|---|---|
| `code` | `string` | Código do erro |
| `message` | `string` | Descrição do erro |

---

## Exemplo completo

```typescript
import Cielo, {
  ReceiptPrintBuilder,
  PaymentMethod,
  TextAlignment,
  TypefaceStyle,
  DividerStyle,
  ValidationError,
  CieloError,
} from 'react-native-pos-cielo';

// 1. Inicializar (uma única vez, no início do app)
Cielo.initialize('CLIENT_ID', 'ACCESS_TOKEN');

async function checkoutFlow() {
  try {
    if (!(await Cielo.is_running_on_pos())) {
      throw new Error('Terminal Cielo não disponível.');
    }

    // 2. Cobrar
    const payment = await Cielo.request_payment({
      value: 2300, // R$ 23,00
      payment_code: PaymentMethod.CREDITO_AVISTA,
      installments: 1,
      reference: `PEDIDO-${Date.now()}`,
    });

    // 3. Imprimir comprovante
    await Cielo.print(
      new ReceiptPrintBuilder(80)
        .addText('MY COFFEE SHOP', {
          align: TextAlignment.CENTER,
          textSize: 24,
          typeface: TypefaceStyle.BOLD,
        })
        .addDivider('=', DividerStyle.SOLID)
        .addColumns(['Cartão', payment.card_mask], { textSize: 14 })
        .addColumns(['Bandeira', payment.card_brand ?? '-'], { textSize: 14 })
        .addColumns(['TOTAL', `R$ ${(payment.amount / 100).toFixed(2)}`], {
          textSize: 18,
          typeface: TypefaceStyle.BOLD,
        })
        .addDivider()
        .addText('Obrigado pela preferência!', { align: TextAlignment.CENTER, textSize: 16 })
        .addFeed(3)
    );

    return payment;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.warn(`Dado inválido em "${error.field}": ${error.message}`);
    } else if (error instanceof CieloError) {
      console.error(`Erro Cielo [${error.code}]: ${error.message}`);
    } else {
      throw error;
    }
  }
}
```

---

## Requisitos

- Apenas **Android**
- Android minSdk 24+ (geralmente já atendido)

## Contribuição

Contribuições são muito bem-vindas! Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/sua-funcionalidade`).
3. Envie seus commits (`git commit -m 'Adiciona sua funcionalidade'`).
4. Faça o push para a branch (`git push origin feature/sua-funcionalidade`).
5. Abra um pull request.

## Apoie o Projeto ☕

Se esta biblioteca foi útil para você, considere me pagar um café!

Escaneie o código QR para doar (PIX):

![PIX donation QR code](https://api.qrserver.com/v1/create-qr-code/?data=00020126580014BR.GOV.BCB.PIX013698817f09-40db-47c0-adf3-0c69b99ef1635204000053039865802BR5924Carlos%20Eduardo%20Conceicao6009SAO%20PAULO62140510rmQmKYzFZ863046800)

Muito obrigado pelo seu apoio! 🚀

## Licença

Licença MIT. Veja o arquivo LICENSE para mais detalhes.
