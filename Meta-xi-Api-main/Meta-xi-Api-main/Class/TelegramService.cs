using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Meta_xi.Interfaces;

namespace Meta_xi.Application
{
    public class TelegramService : ITelegramService
    {
        private readonly string _botToken;
        private readonly string _chatbotToken;
        private readonly string _chatId;


        private readonly string _FinancechatId;
        private readonly string _SupportchatId;
        private readonly HttpClient _httpClient;
        private readonly string _telegramApiUrl;

        public TelegramService(HttpClient httpClient)
        {
            _httpClient = httpClient;

            // Leer desde variables de entorno
            _botToken = Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN")
                ?? throw new InvalidOperationException("TELEGRAM_BOT_TOKEN no está configurado en las variables de entorno.");
            _chatbotToken = Environment.GetEnvironmentVariable("CHAT_BOT_TOKEN")
                ?? throw new InvalidOperationException("CHAT_BOT_TOKEN no está configurado en las variables de entorno.");
            _FinancechatId = Environment.GetEnvironmentVariable("FINANCE_CHAT_ID")
                ?? throw new InvalidOperationException("FINANCE_CHAT_ID no está configurado en las variables de entorno.");
            _SupportchatId = Environment.GetEnvironmentVariable("SUPPORT_CHAT_ID")
                ?? throw new InvalidOperationException("SUPPORT_CHAT_ID no está configurado en las variables de entorno.");


            _telegramApiUrl = $"https://api.telegram.org/bot{_botToken}";
        }

        /// <summary>
        /// Envía un mensaje de texto a Telegram
        /// </summary>
        public async Task<bool> SendMessageAsync(
            string message,
            string? customToken = "finance"
            )
        {

            try
            {
                string token = "finance";
                string chatId = _FinancechatId;
                switch (customToken)
                {
                    case "finance":
                        token = _botToken;
                        chatId = _FinancechatId;
                        break;
                    case "chatbot":
                        token = _chatbotToken;
                        chatId = _SupportchatId;
                        break;

                }



                var apiUrl = $"https://api.telegram.org/bot{token}";

                var payload = new Dictionary<string, string>
                {
                    { "chat_id", chatId! },
                    { "text", message }
                };

                var content = new FormUrlEncodedContent(payload);
                var response = await _httpClient.PostAsync($"{apiUrl}/sendMessage", content);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[Telegram] Mensaje enviado exitosamente. Status: {response.StatusCode}");
                    return true;
                }

                Console.Error.WriteLine($"[Telegram] Error al enviar mensaje. Status: {response.StatusCode}");
                return false;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[Telegram] Excepción al enviar mensaje: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Envía una foto a Telegram
        /// </summary>
        public async Task<bool> SendPhotoAsync(string filePath, string caption)
        {
   
            try
            {
                if (!File.Exists(filePath))
                {
                    Console.Error.WriteLine($"[Telegram] Archivo no encontrado: {filePath}");
                    return false;
                }

                using (var form = new MultipartFormDataContent())
                {
                    form.Add(new StringContent(_FinancechatId), "chat_id");
                    form.Add(new StringContent(caption), "caption");

                    using (var fileStream = File.OpenRead(filePath))
                    {
                        form.Add(new StreamContent(fileStream), "photo", Path.GetFileName(filePath));

                        var response = await _httpClient.PostAsync($"{_telegramApiUrl}/sendPhoto", form);

                        if (response.IsSuccessStatusCode)
                        {
                            Console.WriteLine($"[Telegram] Foto enviada exitosamente. Status: {response.StatusCode}");
                            return true;
                        }

                        Console.Error.WriteLine($"[Telegram] Error al enviar foto. Status: {response.StatusCode}");
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[Telegram] Excepción al enviar foto: {ex.Message}");
                return false;
            }
        }
    }
}
