using Microsoft.AspNetCore.Mvc;
using BespokeDuaApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Linq;
using System;

[ApiController]
[Route("api/[controller]")]
public class DuaController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    private const string GeminiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public DuaController(IConfiguration config, IHttpClientFactory factory)
    {
        _config = config;
        _httpClient = factory.CreateClient();
        _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", _config["GeminiApiKey"]);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateDua([FromBody] DuaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest("Dua text is required.");

        var prompt = $@"
You are an Islamic dua assistant that creates personalized duas.

Your task is to deeply understand the user's request and generate heartfelt duas tailored to their situation.

Steps:
1. Identify the emotional or life context of the request (e.g., anxiety, wealth, illness, guidance, marriage, hardship, gratitude).
2. Select the most relevant Names of Allah from the 99 Names that relate to the situation.
3. Write 3 unique duas that feel personal, natural, and sincere.
4. Each dua must include 1–3 Names of Allah with Arabic and transliteration.
5. For each dua, also provide:
   - The main 99 Name of Allah you used (with English meaning)
   - A short explanation of why that Name fits the user's situation.
6. Keep each dua concise and easy to recite.
7. Maintain proper Islamic etiquette and authenticity.

Output format (VERY IMPORTANT):
- You must return EXACTLY 3 entries.
- Each entry must have this structure, in this exact order:
  dua text || main 99 Name used (with meaning) || short explanation
- Use the characters `||` as the separator between those 3 parts.
- Then separate the 3 entries from each other using the `£` symbol.
- Do NOT output JSON.
- Do NOT use `£` or `||` for anything other than the separators described above.

User request:
{request.Text}
";

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 2048,
                responseMimeType = "text/plain"
            }
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(payload),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(GeminiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, err);
        }

        var responseContent = await response.Content.ReadAsStringAsync();

        dynamic gemini = JsonConvert.DeserializeObject(responseContent);

        string jsonText =
            gemini?.candidates?[0]?.content?.parts?[0]?.text ?? "";

        if (string.IsNullOrWhiteSpace(jsonText))
            return StatusCode(500, "Gemini returned empty response");

        // Split into 3 entries by £ delimiter.
        var entries = jsonText
            .Split('£', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToArray();

        if (entries.Length != 3)
        {
            var snippet = jsonText.Length > 800 ? jsonText.Substring(0, 800) + "..." : jsonText;
            return StatusCode(502, new { message = "Gemini did not return 3 £-separated duas", count = entries.Length, rawSnippet = snippet });
        }

        // For each entry, split into 3 parts: dua || name || explanation
        var items = new DuaItem[3];
        for (int i = 0; i < 3; i++)
        {
            var parts = entries[i]
                .Split("||", StringSplitOptions.None)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToArray();

            if (parts.Length < 3)
            {
                var snippet = entries[i].Length > 400 ? entries[i].Substring(0, 400) + "..." : entries[i];
                return StatusCode(502, new { message = "Gemini did not return dua || name || explanation for entry", entryIndex = i, rawEntry = snippet });
            }

            items[i] = new DuaItem
            {
                Dua = parts[0],
                Name = parts[1],
                Explanation = parts[2]
            };
        }

        return Ok(new DuaResponse { Duas = items });
    }

    // (Gemini JSON DTOs removed — we now return plain text separated by £)
}