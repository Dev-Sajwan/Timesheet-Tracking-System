using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;
using System.Net.Mail;

public class EmailService : IEmailService
{
    private readonly GraphServiceClient _graphClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        GraphServiceClient graphClient,
        IConfiguration configuration,
        ILogger<EmailService> logger)
    {
        _graphClient = graphClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string email,
        string subject,
        string htmlMessage)
    {
        var senderEmail =
            _configuration["EmailSettings:SenderEmail"];

        var senderName =
            _configuration["EmailSettings:SenderName"]
            ?? "Timesheet System";

        if (string.IsNullOrWhiteSpace(senderEmail))
        {
            throw new InvalidOperationException(
                "EmailSettings:SenderEmail is not configured.");
        }

        var message = new Message
        {
            Subject = subject,

            Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content = htmlMessage
            },

            ToRecipients = new List<Recipient>
            {
                new Recipient
                {
                    EmailAddress = new EmailAddress
                    {
                        Address = email
                    }
                }
            }
        };

        try
        {
            await _graphClient
                .Users[senderEmail]
                .SendMail
                .PostAsync(
                    new SendMailPostRequestBody
                    {
                        Message = message,
                        SaveToSentItems = true
                    });

            _logger.LogInformation(
                "Microsoft Graph accepted an email request for {Email}",
                email);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Microsoft Graph failed to send email to {Email}",
                email);

            throw;
        }
    }
}