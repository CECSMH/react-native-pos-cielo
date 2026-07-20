package com.poscielo

import androidx.appcompat.app.AppCompatActivity

import android.app.Activity
import android.content.Intent

import java.io.File
import android.net.Uri
import org.json.JSONArray
import android.util.Base64
import org.json.JSONObject
import android.graphics.Bitmap
import java.io.FileOutputStream

import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CoroutineScope

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.ReactApplicationContext

class PosCieloModule(val reactContext: ReactApplicationContext) : NativePosCieloSpec(reactContext), ActivityEventListener {
  companion object { const val NAME = NativePosCieloSpec.NAME }

  init { reactContext.addActivityEventListener(this) }

  private val current_activity: AppCompatActivity? get() = reactContext.currentActivity as? AppCompatActivity;

  private var deeplink_handler: DeeplinkHandler? = null

  override fun initialize(client_id: String, access_token: String): Unit {
    current_activity?.let {
      deeplink_handler = DeeplinkHandler(it);
      deeplink_handler?.initialize(client_id, access_token);
    }
  }

  override fun getTerminalInfo(promise: Promise): Unit {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        val result = deeplink_handler!!.get_terminal_info()
        result_treatment(result, promise)
      } catch (e: Exception) {
        promise.reject("EXCEPTION", e.message ?: "Unknown error")
      }
    }
  };

  override fun getProductList(promise: Promise): Unit {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        val result = deeplink_handler!!.get_product_list()
        result_treatment(result, promise)
      } catch (e: Exception) {
        promise.reject("EXCEPTION", e.message ?: "Unknown error")
      }
    } 
  }

  override fun requestPayment(data: String, promise: Promise): Unit {
    CoroutineScope(Dispatchers.Main).launch {
     try {
       val result = deeplink_handler!!.request_payment(data)
       result_treatment(result, promise)
     } catch (e: Exception) {
       promise.reject("EXCEPTION", e.message ?: "Unknown error")
     }
    }
  };

  override fun cancelPayment(data: String, promise: Promise): Unit {
    CoroutineScope(Dispatchers.Main).launch {
     try {
       val result = deeplink_handler!!.cancel_payment(data)
       result_treatment(result, promise)
     } catch (e: Exception) {
       promise.reject("EXCEPTION", e.message ?: "Unknown error")
     }
    }
  };

  override fun printText(data: String, promise: Promise): Unit{
    CoroutineScope(Dispatchers.Main).launch {
     try {
        val layout = ReceiptJson.parse(data)
        val bitmap = ReceiptBitmapRenderer().render(layout)

        val external_cache_dir = reactApplicationContext.externalCacheDir
        if (external_cache_dir == null) {
            promise.reject("PRINT_ERROR", "Erro ao acessar cache do dispositivo.")
            return@launch
        }
        
        if (!external_cache_dir.exists()) {
            external_cache_dir.mkdirs()
        }
        
        val cache_file = File(external_cache_dir, "cielo_receipt.jpg")
        val out_stream = FileOutputStream(cache_file)
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out_stream)
        out_stream.flush()
        out_stream.close()
        
        val print_image_json = JSONObject().apply {
          put("operation", "PRINT_IMAGE")
          put("styles", JSONArray().apply { put(JSONObject()) })
          put("value", JSONArray().apply { put(cache_file.absolutePath) })
        }
        
       val result = deeplink_handler!!.print_text(print_image_json.toString())
       result_treatment(result, promise)
     } catch (e: Exception) {
       promise.reject("EXCEPTION", e.message ?: "Unknown error")
     }
    }
  }

  override fun onNewIntent(intent: Intent): Unit {
    deeplink_handler?.let { it.handle_new_intent(intent) }
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?): Unit {}

  private fun result_treatment(result: DeeplinkHandler.Result, promise: Promise): Unit {
    when (result) {
      is DeeplinkHandler.Result.Success -> {
          promise.resolve(result.result)
      }
      is DeeplinkHandler.Result.Error -> {
          promise.reject(result.code, result.message)
      }
      else -> {
          promise.reject("UNKNOWN_ERROR", "Unexpected result")
      }
    }
  }
}
