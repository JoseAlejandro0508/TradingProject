using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;

namespace Meta.Application;

public class GetMoneyValues
{
    private static readonly HttpClient HttpClient = CreateHttpClient();

    public async Task<decimal> GetMoneyValueAsync(string name)
    {
        string normalizedName = name.Trim().ToLowerInvariant();

        RateSource[] sources = normalizedName switch
        {
            "trx" =>
            [
                new RateSource(
                    "CoinGecko",
                    "https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd",
                    data => data["tron"]?["usd"]?.Value<decimal>()),
                new RateSource(
                    "CryptoCompare",
                    "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
                    data => data["USD"]?.Value<decimal>())
            ],
            "tether" =>
            [
                new RateSource(
                    "CoinGecko",
                    "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd",
                    data => data["tether"]?["usd"]?.Value<decimal>()),
                new RateSource(
                    "CryptoCompare",
                    "https://min-api.cryptocompare.com/data/price?fsym=USDT&tsyms=USD",
                    data => data["USD"]?.Value<decimal>())
            ],
            "cop" =>
            [
                new RateSource(
                    "ExchangeRate",
                    "https://open.er-api.com/v6/latest/USD",
                    data => data["rates"]?["COP"]?.Value<decimal>()),
                new RateSource(
                    "CryptoCompare",
                    "https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=COP",
                    data => data["COP"]?.Value<decimal>())
            ],
            _ => throw new Exception($"Moneda no encontrada en la respuesta: {normalizedName}")
        };

        List<string> failures = new();

        foreach (RateSource source in sources)
        {
            try
            {
                using HttpResponseMessage response = await HttpClient.GetAsync(source.Url);
                string payload = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    failures.Add($"{source.Name}: {(int)response.StatusCode} {response.ReasonPhrase} -> {payload}");
                    continue;
                }

                JObject data = JObject.Parse(payload);
                decimal? value = source.Parser(data);

                if (value.HasValue && value.Value > 0)
                {
                    return value.Value;
                }

                failures.Add($"{source.Name}: la respuesta no incluyó una tasa válida");
            }
            catch (Exception ex)
            {
                failures.Add($"{source.Name}: {ex.Message}");
            }
        }

        throw new Exception($"No fue posible obtener la tasa para {normalizedName}. Detalles: {string.Join(" | ", failures)}");
    }

    private static HttpClient CreateHttpClient()
    {
        HttpClient client = new()
        {
            Timeout = TimeSpan.FromSeconds(10)
        };

        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        client.DefaultRequestHeaders.UserAgent.ParseAdd("Meta-xi/1.0");
        return client;
    }

    private sealed record RateSource(string Name, string Url, Func<JObject, decimal?> Parser);
}