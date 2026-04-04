using Microsoft.AspNetCore.Mvc;
using BespokeDuaApi.Models;
using BespokeDuaApi.Services;
using Newtonsoft.Json;
using System.Text;
using System.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/[controller]")]
public class DuaController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;
    private readonly UsageService _usageService;
    private readonly ILogger<DuaController> _logger;

    private const string GeminiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public DuaController(
        IConfiguration config,
        IHttpClientFactory factory,
        UsageService usageService,
        ILogger<DuaController> logger)
    {
        _config = config;
        _usageService = usageService;
        _logger = logger;
        _httpClient = factory.CreateClient();
        _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", _config["GeminiApiKey"]);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateDua([FromBody] DuaRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Text))
            return BadRequest("Dua text is required.");

        const int maxAttempts = 3;
        string lastRaw = string.Empty;
        string lastError = "Unknown error";

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            var result = await TryGenerateDua(request.Text, attempt);

            if (result.Success && result.Response != null)
            {
                await RecordUsageForUserIfPresentAsync(request.UserId);
                return Ok(result.Response);
            }

            lastRaw = result.Raw ?? string.Empty;
            lastError = result.Error ?? "Unknown error";
        }

        return StatusCode(502, new
        {
            message = "Failed to generate valid duas after retries",
            error = lastError,
            raw = lastRaw
        });
    }

    private async Task RecordUsageForUserIfPresentAsync(int? userId)
    {
        if (userId is not int id || id <= 0)
        {
            _logger.LogInformation(
                "Dua generated successfully; usage not updated because userId was missing or invalid in the request body.");
            return;
        }

        try
        {
            await _usageService.IncrementUsageAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record usage for user {UserId}", id);
        }
    }

    private async Task<(bool Success, DuaResponse? Response, string? Raw, string? Error)> TryGenerateDua(string userText, int attempt)
    {
        var prompt = BuildPrompt(userText, attempt);

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

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.PostAsync(GeminiUrl, content);
        }
        catch (Exception ex)
        {
            return (false, null, null, $"Gemini API call failed: {ex.Message}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return (false, null, responseContent, $"Gemini API returned status {(int)response.StatusCode}");
        }

        dynamic? gemini;
        try
        {
            gemini = JsonConvert.DeserializeObject(responseContent);
        }
        catch (Exception ex)
        {
            return (false, null, responseContent, $"Failed to deserialize Gemini wrapper response: {ex.Message}");
        }

        string rawText = gemini?.candidates?[0]?.content?.parts?[0]?.text ?? "";

        if (string.IsNullOrWhiteSpace(rawText))
            return (false, null, rawText, "Gemini returned empty response");

        rawText = CleanModelOutput(rawText);

        var entries = rawText
            .Split('£', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToArray();

        if (entries.Length != 3)
            return (false, null, rawText, $"Expected 3 £-separated entries but got {entries.Length}");

        var items = new DuaItem[3];

        for (int i = 0; i < 3; i++)
        {
            var parts = entries[i]
                .Split(new[] { "||" }, 2, StringSplitOptions.None)
                .Select(p => p.Trim())
                .ToArray();

            if (parts.Length != 2)
                return (false, null, rawText, $"Entry {i} did not contain exactly one dua/explanations split");

            var duaText = parts[0];
            var explanationsText = parts[1];

            if (string.IsNullOrWhiteSpace(duaText))
                return (false, null, rawText, $"Entry {i} had empty dua text");

            if (string.IsNullOrWhiteSpace(explanationsText))
                return (false, null, rawText, $"Entry {i} had empty explanations text");

            var explanationPairs = SplitExplanationPairs(explanationsText);

            var explanationsList = new List<Explanations>();

            foreach (var exp in explanationPairs)
            {
                var pair = exp
                    .Split(new[] { "::" }, 2, StringSplitOptions.None)
                    .Select(x => x.Trim())
                    .ToArray();

                if (pair.Length != 2)
                    continue;

                var name = pair[0];
                var explanation = pair[1];

                if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(explanation))
                    continue;

                explanationsList.Add(new Explanations
                {
                    Name = name,
                    Explanation = explanation
                });
            }

            if (explanationsList.Count == 0)
                return (false, null, rawText, $"Entry {i} produced no valid explanations");

            items[i] = new DuaItem
            {
                Dua = duaText,
                Explanations = explanationsList.ToArray()
            };
        }

        return (true, new DuaResponse { Duas = items }, rawText, null);
    }

    private string BuildPrompt(string userText, int attempt)
    {
        var retryNote = attempt > 1
            ? $@"

IMPORTANT RETRY INSTRUCTION:
Your previous response was invalid because it did not follow the required separator format exactly.
Regenerate the full response and follow the format with absolute precision.
Do not merge multiple explanation pairs into one.
Do not separate explanation pairs using new lines.
Use only `;;` between explanation pairs.
"
            : string.Empty;

        return $@"
You are an Islamic dua assistant that creates personalised duas.

Your task is to deeply understand the user's request and generate heartfelt duas tailored to their situation.

Steps:
1. Identify the emotional or life context of the request (e.g., anxiety, wealth, illness, guidance, marriage, hardship, gratitude).
2. Select the most relevant Names of Allah from the 99 Names that relate to the situation.
3. Write 3 unique duas that feel personal, natural, and sincere.
4. Each dua must include 1–3 Names of Allah with Arabic written immediately after the Name in parentheses.
5. For each dua, provide an explanation for EVERY Name of Allah used in that dua, explaining why that specific Name suits the user's situation.
6. Keep each dua concise and easy to recite.
7. Maintain proper Islamic etiquette and authenticity.
8. The explanations should be varied in wording and should not sound like copied glossary definitions.{retryNote}

OUTPUT FORMAT — FOLLOW EXACTLY:
- Return EXACTLY 3 entries.
- Each entry must have this exact structure:

dua text || Name (English Meaning)::short explanation;;Name2 (English Meaning)::short explanation

- Separate the 3 entries using the `£` symbol.
- Return plain text only.
- Do NOT return JSON.
- Do NOT return markdown.
- Do NOT include bullet points.
- Do NOT include numbering.
- Do NOT include any extra text before or after the 3 entries.
- Do NOT use `£`, `||`, `;;`, or `::` anywhere except as separators in the required format.

EXPLANATION RULES:
- Every Name used in the dua must appear in the explanation section.
- Do NOT skip any Name.
- The number of explanations must match the number of Names used in the dua.
- Each explanation must follow this exact pattern:
  Name (English Meaning)::Short explanation
- Example of format only:
  Salam (The Source of Peace)::Calling upon this Name brings a sense of calm, safety, and deep reassurance
- The example above is only to show the separator format, NOT the style, wording, or content you must copy.
- Do NOT give dictionary definitions of the Names unless genuinely relevant.
- Instead, explain freely and naturally what is beautiful, comforting, powerful, or fitting about calling upon that Name here.
- The explanation should feel personal and tailored, not generic or formulaic.
- Keep it concise, but allow it to sound warm, thoughtful, and varied.
- Write the explanations as natural, warm human language.
- Do NOT use meta wording such as:
  - ""this request""
  - ""the user""
  - ""the person""
  - ""the situation""
  - ""this dua is asking""
  - ""this name suits the request because""
- Do NOT sound analytical, robotic, or like an AI assistant.
- Instead, write as if gently explaining the beauty of the Name in a personal and meaningful way.
- The explanation should sound reflective, sincere, and emotionally natural.
- On the left side of `::`, write ONLY the Name and its English meaning in parentheses.
- On the right side of `::`, write ONLY the explanation.
- Do NOT leave any explanation empty.
- If a dua uses more than one Name, you MUST separate each explanation pair with `;;`
- Never place a second Name inside the explanation text of another Name
- Never put multiple Name::explanation pairs on separate lines
- Never use a newline to separate explanation pairs
- Only use `;;` to separate explanation pairs
- Correct example with two Names:
  Razzaq (The Provider)::Calling upon this Name carries hope in Allah's generosity and provision;;Latif (The Subtle One)::There is comfort in this Name, especially when ease is needed in ways the heart cannot yet see

DUA FORMAT GUIDELINE:
- Use one or more Names of Allah naturally within the dua.
- In the dua text itself, every Name MUST appear in this exact style:
  Ya Name (Arabic)
- Example of correct dua style:
  O Allah, Ya Salam (السلام), grant my beloved parents enduring peace and well-being in their bodies. Ya Hafiz (الحفيظ), protect them from all ailments and preserve their health always.
- The Arabic must appear immediately after the Name in parentheses.
- Do NOT write the Name without the Arabic in the dua text.
- The placement of the Names is flexible and should match the flow and meaning of the dua.
- Names can appear at the beginning, middle, or end of the dua.
- Do NOT force the dua to start with the Names.
- The dua should read naturally, emotionally, and fluently.
- Ensure the Names are integrated meaningfully, not randomly inserted.

Name rule (CRITICAL):
You MUST use names only from this list:
Rahman, Rahim, Malik, Quddus, Salam, Mumin, Muhaymin, Aziz, Jabbar, Mutakabbir,
Khaliq, Bari, Musawwir, Ghaffar, Qahhar, Wahhab, Razzaq, Fattah, Alim, Qabid,
Basit, Khafid, Rafi, Muizz, Mudhill, Sami, Basir, Hakam, Adl, Latif,
Khabir, Halim, Azim, Ghafur, Shakur, Aliyy, Kabir, Hafiz, Muqit, Hasib,
Jalil, Karim, Raqib, Mujib, Wasi, Hakim, Wadud, Majid, Baith, Shahid,
Haqq, Wakil, Qawiyy, Matin, Wali, Hamid, Muhsi, Mubdi, Muid, Muhyi,
Mumit, Hayy, Qayyum, Wajid, Majid, Wahid, Samad, Qadir, Muqtadir, Muqaddim,
Muakhkhir, Awwal, Akhir, Zahir, Batin, Waliyy, Mutaali, Barr, Tawwab, Muntaqim,
Afuw, Rauf, MalikAlMulk, DhulJalalWalIkram, Muqsit, Jami, Ghani, Mughni,
Mani, Darr, Nafi, Nur, Hadi, Badi, Baqi, Warith, Rashid, Sabur

FORMATTING RULES FOR NAMES:
- Always write: Ya + Name
- In the dua text, always write the Arabic immediately after the Name in parentheses
- Example: Ya Hafiz (الحفيظ)
- Never omit the Arabic in the dua text
- Never add Al / Ar / As / Ad / At to the English transliterated Name
- Never modify the names
- Use exactly as written in the approved list

STRICT OUTPUT VALIDATION:
- You MUST return exactly 3 entries.
- Every entry must contain:
  - non-empty dua text
  - `||`
  - at least 1 explanation pair
- Every explanation pair must contain:
  - non-empty Name (English Meaning)
  - non-empty explanation
- Every dua must include the Arabic for each Name used
- If a dua contains 2 or 3 Names, you MUST return 2 or 3 explanation pairs separated by `;;`
- Do NOT merge multiple Names into one explanation field
- If any field would be empty, regenerate the response.

User request:
{userText}
";
    }

    private static string CleanModelOutput(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
            return string.Empty;

        var cleaned = rawText.Trim();

        if (cleaned.StartsWith("```"))
        {
            cleaned = cleaned.Trim('`').Trim();

            if (cleaned.StartsWith("text", StringComparison.OrdinalIgnoreCase))
                cleaned = cleaned.Substring(4).Trim();
        }

        return cleaned;
    }

    private static List<string> SplitExplanationPairs(string explanationsText)
    {
        var results = new List<string>();

        if (string.IsNullOrWhiteSpace(explanationsText))
            return results;

        var firstPass = explanationsText
            .Split(new[] { ";;" }, StringSplitOptions.RemoveEmptyEntries)
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        foreach (var chunk in firstPass)
        {
            var recovered = RecoverMergedExplanationPairs(chunk);
            results.AddRange(recovered);
        }

        return results;
    }

    private static List<string> RecoverMergedExplanationPairs(string chunk)
    {
        var results = new List<string>();

        if (string.IsNullOrWhiteSpace(chunk))
            return results;

        var matches = Regex.Matches(chunk, @"[A-Za-z][A-Za-z0-9\s,'\-]+?\([^)]+\)::");

        if (matches.Count <= 1)
        {
            results.Add(chunk.Trim());
            return results;
        }

        for (int i = 0; i < matches.Count; i++)
        {
            int start = matches[i].Index;
            int end = (i < matches.Count - 1) ? matches[i + 1].Index : chunk.Length;

            var piece = chunk.Substring(start, end - start).Trim();

            if (!string.IsNullOrWhiteSpace(piece))
                results.Add(piece);
        }

        return results;
    }
    }