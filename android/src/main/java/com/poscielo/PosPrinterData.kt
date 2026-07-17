package com.poscielo

import kotlinx.serialization.json.Json
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.SerializersModule

@Serializable
enum class TextAlignment { LEFT, CENTER, RIGHT }

@Serializable
enum class TypefaceStyle { NORMAL, BOLD, ITALIC, BOLD_ITALIC }

@Serializable
enum class FontFamily { DEFAULT, MONOSPACE, SANS_SERIF, SERIF, CONDENSED }

@Serializable
enum class DividerStyle { SOLID, DASHED, DOTTED }

@Serializable
enum class CutMode { FULL, PARTIAL }

@Serializable
enum class BarcodeSymbology { CODE128, EAN13, CODE39 }

@Serializable
enum class ImageSourceType { BASE64, PATH, URI }

@Serializable
data class PrintStyleOptions(
    val align: TextAlignment = TextAlignment.LEFT,
    val textSize: Float = 14f,
    val fontFamily: FontFamily = FontFamily.DEFAULT,
    val typeface: TypefaceStyle = TypefaceStyle.NORMAL,
    val marginLeft: Float = 0f,
    val marginRight: Float = 0f,
    val marginTop: Float = 0f,
    val marginBottom: Float = 0f,
    val lineSpace: Float = 1.0f
)

@Serializable
sealed class ReceiptNode {
    @Serializable
    @SerialName("text")
    data class Text(
        val content: String,
        val style: PrintStyleOptions
    ) : ReceiptNode()

    @Serializable
    @SerialName("divider")
    data class Divider(
        val char: String = "-",
        val style: DividerStyle = DividerStyle.SOLID
    ) : ReceiptNode()

    @Serializable
    @SerialName("barcode")
    data class Barcode(
        val data: String,
        val symbology: BarcodeSymbology = BarcodeSymbology.CODE128,
        val height: Float = 60f
    ) : ReceiptNode()

    @Serializable
    @SerialName("qrcode")
    data class QrCode(val data: String, val size: Float = 150f) : ReceiptNode()

    @Serializable
    @SerialName("feed")
    data class Feed(val lines: Int = 1) : ReceiptNode()

    @Serializable
    data class ColumnDef(
        val text: String,
        val align: TextAlignment = TextAlignment.LEFT,
        val weight: Float = 1f
    )
    
    @Serializable
    @SerialName("columns")
    data class Columns(
        val columns: List<ColumnDef>,
        val style: PrintStyleOptions
    ) : ReceiptNode()


    @Serializable
    @SerialName("image")
    data class Image(
        val source: String,
        val sourceType: ImageSourceType = ImageSourceType.BASE64,
        val align: TextAlignment = TextAlignment.CENTER,
        val width: Float? = null,
        val height: Float? = null,
        val marginTop: Float = 0f,
        val marginBottom: Float = 0f,
        val marginLeft: Float = 0f,
        val marginRight: Float = 0f
    ) : ReceiptNode()
}

@Serializable
data class ReceiptLayout(val paperWidthMm: Int, val nodes: List<ReceiptNode>)

object ReceiptJson {
    val instance: Json = Json {
        ignoreUnknownKeys = true
        classDiscriminator = "type"
        serializersModule = SerializersModule {
            polymorphic(ReceiptNode::class) {
                subclass(ReceiptNode.Text::class, ReceiptNode.Text.serializer())
                subclass(ReceiptNode.Columns::class, ReceiptNode.Columns.serializer())
                subclass(ReceiptNode.Divider::class, ReceiptNode.Divider.serializer())
                subclass(ReceiptNode.Barcode::class, ReceiptNode.Barcode.serializer())
                subclass(ReceiptNode.QrCode::class, ReceiptNode.QrCode.serializer())
                subclass(ReceiptNode.Feed::class, ReceiptNode.Feed.serializer())
                subclass(ReceiptNode.Image::class, ReceiptNode.Image.serializer())
            }
        }
    }

    fun parse(json: String): ReceiptLayout = instance.decodeFromString(json)
}