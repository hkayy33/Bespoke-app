using System.Security.Claims;
using BespokeDuaApi.Data;

namespace BespokeDuaApi.Middleware
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, BespokeDuaDbContext dbContext)
        {
            var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    // For now, using a simple token validation (JWT can be implemented later)
                    var userId = ExtractUserIdFromToken(token);
                    if (userId > 0)
                    {
                        var user = await dbContext.Users.FindAsync(userId);
                        if (user != null)
                        {
                            var claims = new List<Claim>
                            {
                                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                                new Claim(ClaimTypes.Name, user.Username),
                                new Claim(ClaimTypes.Email, user.Email)
                            };

                            var identity = new ClaimsIdentity(claims, "Bearer");
                            context.User = new ClaimsPrincipal(identity);
                        }
                    }
                }
                catch
                {
                    // Token validation failed, continue without user
                }
            }

            await _next(context);
        }

        private int ExtractUserIdFromToken(string token)
        {
            // Placeholder: Parse token to extract user ID
            // In production, use JWT validation
            try
            {
                if (int.TryParse(token, out int userId))
                {
                    return userId;
                }
            }
            catch
            {
            }
            return 0;
        }
    }
}
