using System.Threading.Tasks;

namespace Meta_xi.Interfaces
{
    public interface ITelegramService
    {
        Task<bool> SendMessageAsync(string message, string? customToken = null);
        Task<bool> SendPhotoAsync(string filePath, string caption);
    }
}
