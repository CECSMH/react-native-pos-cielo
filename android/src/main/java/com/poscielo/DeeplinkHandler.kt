package com.poscielo

import java.util.UUID
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject
import android.util.Base64
import android.app.Activity
import android.content.Intent 
import android.content.Context
import android.content.pm.PackageManager
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.coroutines.CompletableDeferred
import androidx.appcompat.app.AppCompatActivity

class DeeplinkHandler(private val activity: AppCompatActivity) {
    companion object {
        private const val TAG = "DeeplinkHandler"
        private const val SCHEME = "lio"
    
        private const val META_DATA_KEY = "com.poscielo.CALLBACK_SCHEME"
        private const val REQUEST_TIMEOUT_MS = 35_000L
        private const val DEFAULT_CALLBACK_SCHEME = "pos_cielo_module"
    }

    private val CALLBACK_SCHEME: String by lazy { resolve_callback_scheme(activity.applicationContext) }
    private var client_id: String = ""
    private var access_token: String = ""

    private val pending_requests = mutableMapOf<String, CompletableDeferred<Result>>()

    private fun resolve_callback_scheme(context: Context): String {
        return try {
            val package_name = context.packageName ?: return DEFAULT_CALLBACK_SCHEME
            val app_info = context.packageManager.getApplicationInfo(package_name, PackageManager.GET_META_DATA)
            val configured = app_info?.metaData?.getString(META_DATA_KEY)
            if (!configured.isNullOrBlank()) configured else DEFAULT_CALLBACK_SCHEME
        } catch (e: Throwable) { 
            DEFAULT_CALLBACK_SCHEME
        }
    }
    fun initialize(client_id: String, access_token: String) {
        this.client_id = client_id
        this.access_token = access_token
    }

    fun handle_new_intent(intent: Intent){
        val data = intent.data ?: return
        val endpoint = data.host ?: return

        val deferred = pending_requests.remove(endpoint) ?: return

        try {
            val response_base64 = data.getQueryParameter("response")
            val response_code = data.getQueryParameter("responsecode")?.toIntOrNull() ?: -1

            if (response_base64 != null) {
                val decoded = String(Base64.decode(response_base64, Base64.DEFAULT))
                val json = try { JSONObject(decoded) } catch (e: Exception) { JSONObject() }
                val code = json.optInt("code", response_code)

                if (response_code == 0 || code == 0) {
                    deferred.complete(Result.Success(decoded))
                } else {
                    val reason = json.optString("reason", "Unknown error")
                    deferred.complete(Result.Error(code.toString(), reason))
                }
            } else {
                deferred.complete(Result.Error("NO_RESPONSE", "No response data"))
            }
        } catch (e: Exception) {
            deferred.complete(Result.Error("PARSE_ERROR", e.message ?: "Unknown parse error"))
        }
    }

    suspend fun get_terminal_info(): Result {
        return execute_deep_link(
            endpoint = "terminalinfo",
            json_payload = null
        )
    }

    suspend fun get_product_list(): Result {
        return execute_deep_link(
            endpoint = "enabledproducts",
            json_payload = """{ "clientID": "$client_id", "accessToken": "$access_token" }""".trimIndent()
        )
    }

    suspend fun request_payment(payment_data: String): Result {
       try {
            val raw_json = JSONObject(payment_data)

            val payment_value = raw_json.getLong("value") 

            raw_json.put("clientID", client_id)
            raw_json.put("accessToken", access_token)

            val item = JSONObject().apply {
                put("name", "Geral")
                put("quantity", 1)
                put("sku", "10")
                put("unitOfMeasure", "unidade")
                put("unitPrice", payment_value)
            }

            val items_array = JSONArray().apply { put(item) }
            raw_json.put("items", items_array)

            val json_str = raw_json.toString()

            return execute_deep_link("payment", json_str)
        } catch (e: Exception) {
            return DeeplinkHandler.Result.Error(
                code = "PARSE_ERROR",
                message = e.message ?: "Erro ao processar os dados de pagamento"
            )
        }
    }

    suspend fun cancel_payment(cancel_data: String): Result {
       try {
            val raw = JSONObject(cancel_data)

            val payload = JSONObject().apply {
                put("clientID", client_id)
                put("accessToken", access_token)
                put("id", raw.getString("orderId"))
                put("value", raw.getLong("value"))
                put("authCode", raw.getString("authCode"))   
                put("cieloCode", raw.getString("cieloCode")) 
            }
            return execute_deep_link("payment-reversal", payload.toString())
        } catch (e: Exception) {
            return DeeplinkHandler.Result.Error(
                code = "PARSE_ERROR",
                message = e.message ?: "Erro ao processar os dados de pagamento"
            )
        }
    }

    suspend fun print_text(data: String): Result {
        return execute_deep_link(endpoint = "print", json_payload = data)
    }

    private suspend fun execute_deep_link(endpoint: String, json_payload: String?, timeout_ms: Long = REQUEST_TIMEOUT_MS): Result {
        val deferred = CompletableDeferred<Result>()

        pending_requests[endpoint] = deferred

        try {
            val json_string = json_payload ?: "{}"

            val base64_request = Base64.encodeToString(json_string.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
  
            val uri = Uri.Builder()
                .scheme(SCHEME)
                .authority(endpoint)
                .appendQueryParameter("request", base64_request)
                .appendQueryParameter("urlCallback", "$CALLBACK_SCHEME://$endpoint")
                .build()
  
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }

            activity.startActivity(intent)
        } catch(e: Exception) {
            pending_requests.remove(endpoint)
            return Result.Error("LAUNCH_ERROR", e.message ?: "Failed to launch intent")
        }
        
        val result = withTimeoutOrNull(timeout_ms) { deferred.await() }

        return if (result != null) {
            result
        } else {
            pending_requests.remove(endpoint)
            Result.Error("TIMEOUT", "Nenhuma resposta recebida do terminal em ${timeout_ms}ms.")
        }
    }

    private fun handle_success_response(data: Intent?): Result {
        data?.data?.getQueryParameter("response")?.let { base64_response ->
            try {
                val decoded = String(Base64.decode(base64_response, Base64.DEFAULT))
                return Result.Success(decoded)
            } catch (e: Exception) {}
        }
        return Result.Error("INVALID_RESPONSE", "Could not parse response")
    }
   
    sealed class Result {
        data class Success(val result: String) : Result()
        data class Error(val code: String, val message: String) : Result()
        object Unknown : Result()
    }
}