# 🛡️ Security Policy

## 🚨 Reporting Security Vulnerabilities

We take the security of Pen2PDF seriously. If you discover a security vulnerability, please help us protect our users by reporting it responsibly.

### 📧 How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **GitHub Security Advisories** (Preferred):
   - Go to the [Security tab](https://github.com/H0NEYP0T-466/Pen2PDF/security) of our repository
   - Click "Report a vulnerability"
   - Fill out the security advisory form

2. **Email Contact**:
   - Send an email to the maintainer via GitHub profile
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### 📋 What to Include

When reporting a security vulnerability, please include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours of your report
- **Status Update**: Within 7 days with an assessment of the report
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

### 🔒 Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Yes             |
| < 1.0   | ❌ No              |

### 🏆 Security Best Practices

When contributing to or using Pen2PDF:

#### For Users:
- Keep your API keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Regularly update to the latest version
- Report suspicious behavior or potential vulnerabilities

#### For Developers:
- Follow secure coding practices
- Validate all user inputs
- Use HTTPS for all communications
- Keep dependencies updated
- Never commit secrets or sensitive data

### 🔐 Security Features

Pen2PDF implements several security measures:

- **Environment Variable Protection**: API keys stored in environment variables
- **Input Validation**: Server-side validation of file uploads and user inputs
- **CORS Configuration**: Proper CORS setup for API endpoints
- **File Type Validation**: Strict file type checking for uploads
- **Rate Limiting**: Protection against abuse (when implemented)

### 🚫 Out of Scope

The following are generally considered out of scope for security reports:

- Issues in third-party dependencies (report to the respective maintainers)
- Social engineering attacks
- Physical attacks
- Denial of service attacks requiring excessive resources

### 🏅 Recognition

We believe in recognizing security researchers who help keep our project safe:

- Security researchers will be credited in our security advisories (with permission)
- We maintain a security acknowledgments section for significant contributions
- We may feature notable security contributions in our release notes

### 📞 Questions?

If you have questions about this security policy, please open a regular GitHub issue with the `question` label or contact the maintainers through GitHub.

---

**Remember**: When in doubt, please report it. We'd rather investigate a false positive than miss a real security issue.

Thank you for helping keep Pen2PDF and our users safe! 🙏