using System.Security.Claims;
using BespokeDuaApi.Auth;
using BespokeDuaApi.Data;
using BespokeDuaApi.DTO;
using BespokeDuaApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BespokeDuaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanController : ControllerBase
{
    /// <summary>Must match <c>SubscriptionManager.plusMonthlyProductID</c> on iOS.</summary>
    public const string PlusMonthlyProductId = "com.Stylistic.bespokeDua.subscription.monthly";

    private readonly BespokeDuaDbContext _context;

    public PlanController(BespokeDuaDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Links an Apple subscription (original transaction id) to the signed-in user and sets <see cref="PlanType.Subscribed"/>.
    /// </summary>
    [Authorize(AuthenticationSchemes = UserIdBearerAuthenticationHandler.SchemeName)]
    [HttpPatch("subscribe")]
    public async Task<ActionResult<GetUserDto>> Subscribe([FromBody] SubscribePlanDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.OriginalTransactionId))
            return BadRequest(new { message = "originalTransactionId is required." });

        if (string.IsNullOrWhiteSpace(dto.ProductId) ||
            !string.Equals(dto.ProductId.Trim(), PlusMonthlyProductId, StringComparison.Ordinal))
            return BadRequest(new { message = "Unknown or missing productId." });

        var transactionId = dto.OriginalTransactionId.Trim();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        var ownership = await _context.SubscriptionOwnerships
            .FirstOrDefaultAsync(o => o.OriginalTransactionId == transactionId);

        if (ownership != null && ownership.UserId != userId)
        {
            if (!dto.ConfirmTransfer)
            {
                return Conflict(new
                {
                    message =
                        "This Apple subscription is linked to another account. Confirm transfer to move it here."
                });
            }

            var previousUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == ownership.UserId);
            if (previousUser != null)
                previousUser.Plan = PlanType.Free;

            ownership.UserId = userId;
            ownership.ProductId = dto.ProductId!.Trim();
        }
        else if (ownership == null)
        {
            _context.SubscriptionOwnerships.Add(new SubscriptionOwnership
            {
                OriginalTransactionId = transactionId,
                ProductId = dto.ProductId!.Trim(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            ownership.ProductId = dto.ProductId!.Trim();
        }

        user.Plan = PlanType.Subscribed;
        await _context.SaveChangesAsync();

        return Ok(new GetUserDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            Plan = user.Plan.ToString(),
            LastRequestDate = user.LastRequestDate
        });
    }
}
