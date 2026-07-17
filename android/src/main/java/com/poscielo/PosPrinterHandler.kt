package com.poscielo

import android.net.Uri
import kotlin.math.ceil
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Typeface
import android.content.Context
import android.graphics.BitmapFactory
import com.google.zxing.BarcodeFormat
import com.google.zxing.common.BitMatrix
import com.google.zxing.MultiFormatWriter

class ReceiptBitmapRenderer(private val dpi: Int = 203, private val context: Context? = null) {
    private fun mm_to_px(mm: Int): Int = ceil(mm * dpi / 25.4).toInt()

    fun render(layout: ReceiptLayout): Bitmap {
        val width = mm_to_px(layout.paperWidthMm-8) // margem da impressora

        var total_height = 0f
        val measure_paint = Paint(Paint.ANTI_ALIAS_FLAG)

        for (node in layout.nodes) {
            total_height += measure_node_height(node, width, measure_paint)
        }

        val bitmap = Bitmap.createBitmap(width, ceil(total_height).toInt().coerceAtLeast(1), Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.WHITE)

        var y = 0f
        for (node in layout.nodes) {
            y = draw_node(canvas, node, width, y)
        }
        return bitmap
    }

    //-- Measuring
    private fun measure_node_height(node: ReceiptNode, width: Int, paint: Paint): Float {
        return when (node) {
            is ReceiptNode.Text -> text_block_height(node.content, node.style, width, paint)
            is ReceiptNode.Columns -> columns_block_height(node.style, paint)
            is ReceiptNode.Divider -> 20f
            is ReceiptNode.Barcode -> node.height + 16f 
            is ReceiptNode.QrCode -> node.size + 8f
            is ReceiptNode.Feed -> node.lines * 20f
            is ReceiptNode.Image -> image_block_height(node, width)
        }
    }

    private fun image_block_height(node: ReceiptNode.Image, canvasWidth: Int): Float {
        val bitmap = decode_image(node) ?: return 0f
        val (_, h) = resolve_target_size(bitmap, node, canvasWidth)
        bitmap.recycle()
        return node.marginTop + node.marginBottom + h
    }

    private fun text_block_height(content: String, style: PrintStyleOptions, canvasWidth: Int, paint: Paint): Float {
        apply_style(paint, style)
        val usable_width = canvasWidth - style.marginLeft - style.marginRight
        val lines = wrap_text(content, paint, usable_width)
        val fm = paint.fontMetrics
        val line_height = (fm.descent - fm.ascent) * style.lineSpace
        return style.marginTop + style.marginBottom + (line_height * lines.size)
    }

    private fun columns_block_height(style: PrintStyleOptions, paint: Paint): Float {
        apply_style(paint, style)
        val fm = paint.fontMetrics
        val line_height = (fm.descent - fm.ascent) * style.lineSpace
        return style.marginTop + style.marginBottom + line_height
    }

    //-- Drawing
    private fun draw_node(canvas: Canvas, node: ReceiptNode, width: Int, startY: Float): Float {
        return when (node) {
            is ReceiptNode.Text -> draw_text(canvas, node.content, node.style, width, startY)
            is ReceiptNode.Columns -> draw_columns(canvas, node, width, startY)
            is ReceiptNode.Divider -> draw_divider(canvas, node, width, startY)
            is ReceiptNode.Barcode -> draw_barcode(canvas, node, width, startY)
            is ReceiptNode.QrCode -> draw_qr_code(canvas, node, width, startY)
            is ReceiptNode.Feed -> startY + (node.lines * 20f)
            is ReceiptNode.Image -> draw_image(canvas, node, width, startY)
        }
    }

    private fun draw_image(canvas: Canvas, node: ReceiptNode.Image, canvasWidth: Int, startY: Float): Float {
        val original = decode_image(node) ?: run {
            return startY
        }

        val (targetW, targetH) = resolve_target_size(original, node, canvasWidth)
        val scaled = Bitmap.createScaledBitmap(original, targetW.toInt(), targetH.toInt(), true)
        if (scaled !== original) original.recycle()

        val usableWidth = canvasWidth - node.marginLeft - node.marginRight
        val x = when (node.align) {
            TextAlignment.LEFT -> node.marginLeft
            TextAlignment.CENTER -> node.marginLeft + (usableWidth - targetW) / 2f
            TextAlignment.RIGHT -> node.marginLeft + usableWidth - targetW
        }
        val y = startY + node.marginTop

        canvas.drawBitmap(scaled, x, y, null)
        scaled.recycle()

        return y + targetH + node.marginBottom
    }

    private fun draw_text(canvas: Canvas, content: String, style: PrintStyleOptions, canvasWidth: Int, startY: Float): Float {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        apply_style(paint, style)

        val usable_width = canvasWidth - style.marginLeft - style.marginRight
        val lines = wrap_text(content, paint, usable_width)
        val fm = paint.fontMetrics
        val line_height = (fm.descent - fm.ascent) * style.lineSpace

        var y = startY + style.marginTop - fm.ascent
        for (line in lines) {
            val x = resolve_x(paint, line, style.align, style.marginLeft, canvasWidth - style.marginRight)
            canvas.drawText(line, x, y, paint)
            y += line_height
        }
        return y + fm.descent + style.marginBottom
    }

    private fun draw_columns(canvas: Canvas, node: ReceiptNode.Columns, canvasWidth: Int, startY: Float): Float {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        apply_style(paint, node.style)
        val fm = paint.fontMetrics
        val y = startY + node.style.marginTop - fm.ascent

        val usableWidth = canvasWidth - node.style.marginLeft - node.style.marginRight
        val totalWeight = node.columns.sumOf { it.weight.toDouble() }.toFloat().coerceAtLeast(0.001f)

        var xCursor = node.style.marginLeft
        for (col in node.columns) {
            val colWidth = usableWidth * (col.weight / totalWeight)
            val x = when (col.align) {
                TextAlignment.LEFT -> xCursor
                TextAlignment.CENTER -> xCursor + (colWidth - paint.measureText(col.text)) / 2f
                TextAlignment.RIGHT -> xCursor + colWidth - paint.measureText(col.text)
            }
            canvas.drawText(col.text, x, y, paint)
            xCursor += colWidth
        }

        return y + fm.descent + node.style.marginBottom
    }

    private fun draw_divider(canvas: Canvas, node: ReceiptNode.Divider, canvasWidth: Int, startY: Float): Float {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            textSize = 16f
            typeface = Typeface.MONOSPACE
            style = Paint.Style.FILL_AND_STROKE
            strokeWidth = 16f * 0.04f
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
        }
        val char_width = paint.measureText(node.char.ifEmpty { "-" })
        val repeatCount = (canvasWidth / char_width).toInt().coerceAtLeast(1)
        val line = when (node.style) {
            DividerStyle.SOLID -> node.char.repeat(repeatCount)
            DividerStyle.DASHED -> "- ".repeat(repeatCount / 2)
            DividerStyle.DOTTED -> ". ".repeat(repeatCount / 2)
        }

        val fm = paint.fontMetrics
        val y = startY - fm.ascent
        canvas.drawText(line, 0f, y, paint)
        return startY + 20f
    }

    private fun draw_barcode(canvas: Canvas, node: ReceiptNode.Barcode, canvasWidth: Int, startY: Float): Float {
        val format = when (node.symbology) {
            BarcodeSymbology.CODE128 -> BarcodeFormat.CODE_128
            BarcodeSymbology.EAN13 -> BarcodeFormat.EAN_13
            BarcodeSymbology.CODE39 -> BarcodeFormat.CODE_39
        }
        val barcodeWidth = (canvasWidth * 0.8f).toInt()
        val matrix: BitMatrix = MultiFormatWriter().encode(
            node.data, format, barcodeWidth, node.height.toInt()
        )
        val barcodeBitmap = matrix_to_bitmap(matrix)
        val x = (canvasWidth - barcodeBitmap.width) / 2f
        canvas.drawBitmap(barcodeBitmap, x, startY, null)
        return startY + barcodeBitmap.height + 16f
    }

    private fun draw_qr_code(canvas: Canvas, node: ReceiptNode.QrCode, canvasWidth: Int, startY: Float): Float {
        val size = node.size.toInt()
        val matrix: BitMatrix = MultiFormatWriter().encode(
            node.data, BarcodeFormat.QR_CODE, size, size
        )
        val qrBitmap = matrix_to_bitmap(matrix)
        val x = (canvasWidth - qrBitmap.width) / 2f
        canvas.drawBitmap(qrBitmap, x, startY, null)
        return startY + qrBitmap.height + 8f
    }

    private fun matrix_to_bitmap(matrix: BitMatrix): Bitmap {
        val w = matrix.width
        val h = matrix.height
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        for (x in 0 until w) {
            for (y in 0 until h) {
                bmp.setPixel(x, y, if (matrix.get(x, y)) Color.BLACK else Color.WHITE)
            }
        }
        return bmp
    }

    //-- Helpers 

    private fun resolve_target_size(bitmap: Bitmap, node: ReceiptNode.Image, canvasWidth: Int): Pair<Float, Float> {
        val intrinsicW = bitmap.width.toFloat()
        val intrinsicH = bitmap.height.toFloat()
        val aspectRatio = intrinsicH / intrinsicW

        return when {
            node.width != null && node.height != null -> node.width to node.height
            node.width != null -> node.width to (node.width * aspectRatio)
            node.height != null -> (node.height / aspectRatio) to node.height
            else -> {
                val usableWidth = canvasWidth - node.marginLeft - node.marginRight
                val fitWidth = minOf(usableWidth, intrinsicW)
                fitWidth to (fitWidth * aspectRatio)
            }
        }
    }

    private fun decode_image(node: ReceiptNode.Image): Bitmap? {
        return try {
            when (node.sourceType) {
                ImageSourceType.BASE64 -> {
                    val cleaned = node.source.substringAfter("base64,", node.source)
                    val bytes = android.util.Base64.decode(cleaned, android.util.Base64.DEFAULT)
                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                }
                ImageSourceType.PATH -> {
                    BitmapFactory.decodeFile(node.source)
                }
                ImageSourceType.URI -> {
                    val ctx = context ?: run {
                        return null
                    }
                    ctx.contentResolver.openInputStream(Uri.parse(node.source))?.use {
                        BitmapFactory.decodeStream(it)
                    }
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun apply_style(paint: Paint, style: PrintStyleOptions) {
        paint.textSize = style.textSize * 1.06f
        paint.color = Color.BLACK
        paint.typeface = resolve_typeface(style.fontFamily, style.typeface)
        paint.style = Paint.Style.FILL_AND_STROKE
        paint.strokeWidth = style.textSize * 0.04f
        paint.strokeJoin = Paint.Join.ROUND
        paint.strokeCap = Paint.Cap.ROUND
    }

    private fun resolve_typeface(family: FontFamily, style: TypefaceStyle): Typeface {
        val base = when (family) {
            FontFamily.DEFAULT -> Typeface.DEFAULT
            FontFamily.MONOSPACE -> Typeface.MONOSPACE
            FontFamily.SANS_SERIF -> Typeface.SANS_SERIF
            FontFamily.SERIF -> Typeface.SERIF
            FontFamily.CONDENSED -> Typeface.DEFAULT
        }
        val styleFlag = when (style) {
            TypefaceStyle.NORMAL -> Typeface.NORMAL
            TypefaceStyle.BOLD -> Typeface.BOLD
            TypefaceStyle.ITALIC -> Typeface.ITALIC
            TypefaceStyle.BOLD_ITALIC -> Typeface.BOLD_ITALIC
        }
        return Typeface.create(base, styleFlag)
    }

    private fun resolve_x(paint: Paint, text: String, align: TextAlignment, marginLeft: Float, rightBound: Float): Float {
        val textWidth = paint.measureText(text)
        return when (align) {
            TextAlignment.LEFT -> marginLeft
            TextAlignment.CENTER -> marginLeft + ((rightBound - marginLeft) - textWidth) / 2f
            TextAlignment.RIGHT -> rightBound - textWidth
        }
    }

    private fun wrap_text(text: String, paint: Paint, maxWidth: Float): List<String> {
        if (maxWidth <= 0) return listOf(text)
        val words = text.split(" ")
        val lines = mutableListOf<String>()
        var current = StringBuilder()

        for (word in words) {
            val candidate = if (current.isEmpty()) word else "$current $word"
            if (paint.measureText(candidate) <= maxWidth) {
                current = StringBuilder(candidate)
            } else {
                if (current.isNotEmpty()) lines.add(current.toString())
                current = StringBuilder(word)
            }
        }
        if (current.isNotEmpty()) lines.add(current.toString())
        return if (lines.isEmpty()) listOf("") else lines
    }
}