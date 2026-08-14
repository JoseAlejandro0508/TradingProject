using Meta_xi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Meta_xi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TelegramController : ControllerBase
    {
        private readonly ITelegramService _telegramService;

        public TelegramController(ITelegramService telegramService)
        {
            _telegramService = telegramService;
        }

        /// <summary>
        /// Envía un mensaje de texto a Telegram
        /// </summary>
        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { error = "El mensaje no puede estar vacío." });
            }

            var success = await _telegramService.SendMessageAsync(
                request.Message,
                request.CustomToken
            );

            if (success)
            {
                return Ok(new { message = "Mensaje enviado exitosamente." });
            }

            return BadRequest(new { error = "Error al enviar el mensaje." });
        }

        /// <summary>
        /// Envía una foto a Telegram
        /// </summary>
        [HttpPost("send-photo")]
        public async Task<IActionResult> SendPhoto([FromForm] SendPhotoRequest request)
        {
            if (request.Photo == null || request.Photo.Length == 0)
            {
                return BadRequest(new { error = "La foto no puede estar vacía." });
            }

            if (string.IsNullOrWhiteSpace(request.Caption))
            {
                return BadRequest(new { error = "El caption no puede estar vacío." });
            }

            // Guardar el archivo temporalmente
            var tempPath = Path.Combine(Path.GetTempPath(), request.Photo.FileName);
            using (var stream = new FileStream(tempPath, FileMode.Create))
            {
                await request.Photo.CopyToAsync(stream);
            }

            try
            {
                var success = await _telegramService.SendPhotoAsync(tempPath, request.Caption);

                if (success)
                {
                    return Ok(new { message = "Foto enviada exitosamente." });
                }

                return BadRequest(new { error = "Error al enviar la foto." });
            }
            finally
            {
                // Eliminar el archivo temporal
                if (System.IO.File.Exists(tempPath))
                {
                    System.IO.File.Delete(tempPath);
                }
            }
        }
    }

    public class SendMessageRequest
    {
        public string Message { get; set; }
        public string? CustomToken { get; set; }
        public string? CustomChatId { get; set; }
    }

    public class SendPhotoRequest
    {
        public IFormFile Photo { get; set; }
        public string Caption { get; set; }
    }
}
