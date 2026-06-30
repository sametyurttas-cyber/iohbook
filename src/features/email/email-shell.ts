type EmailShellInput = {
  body: string;
  preview: string;
  title: string;
};

export const IOH_EMAIL_BUTTON_STYLE =
  "display:inline-block;background:#e7c574;color:#06070a;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;border:1px solid #f3d98d;box-shadow:0 18px 38px rgba(231,197,116,0.22);";

const IOH_EMAIL_QUOTE_STYLE =
  "border-left:1px solid #e7c574;padding:18px 20px;margin:22px 0;color:#efe9dd;background:#10151e;border-radius:0 18px 18px 0;";

function escapeEmailHtml(value: string) {
  return value.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return m;
    }
  });
}

export function brandEmailBody(body: string) {
  return body
    .replace(
      /style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;"/g,
      `style="${IOH_EMAIL_BUTTON_STYLE}"`
    )
    .replace(
      /border-left:4px solid #c9a75d;padding-left:12px;margin:18px 0;color:#d8d0c8;/g,
      IOH_EMAIL_QUOTE_STYLE
    )
    .replace(/color:#c9a75d;/g, "color:#e7c574;")
    .replace(/border-top:1px solid #333/g, "border-top:1px solid #2b2e39");
}

export function renderIohEmailShell(input: EmailShellInput) {
  const title = escapeEmailHtml(input.title);
  const preview = escapeEmailHtml(input.preview || input.title);
  const body = brandEmailBody(input.body);

  return `<!doctype html>
<html>
  <head>
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;background:#05060a;color:#f5efe5;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preview}</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#05060a;background-image:radial-gradient(circle at 50% 0%, rgba(231,197,116,0.16), transparent 34%), radial-gradient(circle at 15% 35%, rgba(71,173,255,0.10), transparent 28%), linear-gradient(180deg,#08090d 0%,#05060a 100%);padding:46px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:720px;">
            <tr>
              <td style="padding:0 4px 18px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-size:18px;line-height:1;letter-spacing:0.34em;text-transform:uppercase;color:#f5efe5;font-weight:900;">IOH</td>
                    <td align="right" style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#8e96a8;">Universe / Book</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #2b2e39;border-radius:24px;overflow:hidden;background:#101116;background-image:linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0) 46%),radial-gradient(circle at 80% 0%,rgba(231,197,116,0.18),transparent 38%);box-shadow:0 34px 90px rgba(0,0,0,0.55);">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:36px 34px 22px;border-bottom:1px solid #2b2e39;">
                      <div style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#e7c574;">System / Transmission</div>
                      <div style="font-size:76px;line-height:0.86;letter-spacing:0.10em;text-transform:uppercase;color:#1d2028;font-weight:900;margin:18px 0 -2px;">IOH</div>
                      <h1 style="margin:0;max-width:620px;font-size:34px;line-height:1.08;color:#f5efe5;font-weight:900;letter-spacing:0;">${title}</h1>
                      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:22px;">
                        <tr>
                          <td style="border:1px solid rgba(231,197,116,0.35);border-radius:999px;padding:7px 12px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.20em;text-transform:uppercase;color:#e7c574;background:rgba(231,197,116,0.08);">Verified Signal</td>
                          <td style="width:8px;"></td>
                          <td style="border:1px solid rgba(71,173,255,0.22);border-radius:999px;padding:7px 12px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.20em;text-transform:uppercase;color:#9ecfff;background:rgba(71,173,255,0.08);">Secure Notice</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 34px 36px;color:#d9d4cb;font-size:15px;line-height:1.72;">
                      ${body}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 34px;border-top:1px solid #2b2e39;background:#0b0c11;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#777f91;">IOH</td>
                          <td align="right" style="font-size:12px;line-height:1.6;color:#8d8790;">This is an automated IOHBOOK notification. Your card details are never stored on the site.</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
