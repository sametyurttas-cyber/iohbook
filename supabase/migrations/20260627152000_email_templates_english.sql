-- Convert active transactional email templates to English copy.

with english_templates(key, subject, preview_text, body_html, body_text) as (
  values
    (
      'welcome',
      'Welcome to the IOH Universe',
      'Your first step into the IOH book universe is complete.',
      '<p>Hello {{userName}},</p><p>Thank you for joining the IOH universe. Your account has been created successfully.</p><p>Sign-in email: {{email}}</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">View My Account</a></p>',
      'Hello {{userName}},\n\nThank you for joining the IOH universe. Your account has been created successfully.\n\nEmail: {{email}}\n\nYour account: {{accountUrl}}'
    ),
    (
      'order_received',
      'Order Received: {{orderCode}}',
      'Your order has been created and is waiting for payment confirmation.',
      '<p>Hello {{userName}},</p><p>Your order request <strong>{{orderCode}}</strong> has been received and is waiting for payment confirmation.</p><p>You can follow your order details from the link below:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Track Order</a></p>',
      'Hello {{userName}},\n\nYour order request {{orderCode}} has been received and is waiting for payment confirmation.\n\nOrder details: {{accountUrl}}'
    ),
    (
      'order_paid',
      'Your Order Is Confirmed: {{orderCode}}',
      'Your payment has been verified successfully.',
      '<p>Hello {{userName}},</p><p>The payment for your order <strong>{{orderCode}}</strong> has been successfully verified.</p><p>You can view your order details and status from the link below:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">View Order</a></p>',
      'Hello {{userName}},\n\nThe payment for your order {{orderCode}} has been successfully verified.\n\nView order: {{accountUrl}}'
    ),
    (
      'payment_failed',
      'Payment Attempt Failed: {{orderCode}}',
      'Your payment could not be completed.',
      '<p>Hello {{userName}},</p><p>The payment attempt for your order <strong>{{orderCode}}</strong> was not completed.</p><p>Please check your payment details and try again.</p><p><a href="{{checkoutUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Try Payment Again</a></p>',
      'Hello {{userName}},\n\nThe payment attempt for your order {{orderCode}} was not completed. Please try again.\n\nCheckout: {{checkoutUrl}}'
    ),
    (
      'order_cancelled',
      'Your Order Has Been Cancelled: {{orderCode}}',
      'Your order cancellation has been completed.',
      '<p>Hello {{userName}},</p><p>Your order <strong>{{orderCode}}</strong> has been cancelled.</p><p>If payment was collected, the refund process will be handled through the payment provider.</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Order Details</a></p>',
      'Hello {{userName}},\n\nYour order {{orderCode}} has been cancelled. You can review the details in your account:\n\nYour account: {{accountUrl}}'
    ),
    (
      'order_refunded',
      'Your Refund Is Complete: {{orderCode}}',
      'Your refund has been completed.',
      '<p>Hello {{userName}},</p><p>The refund for your order <strong>{{orderCode}}</strong> has been completed and sent to the payment provider.</p><p>The refunded amount may take a few business days to appear, depending on your bank or card provider.</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Order Details</a></p>',
      'Hello {{userName}},\n\nThe refund for your order {{orderCode}} has been completed and sent to the payment provider.\n\nYour account: {{accountUrl}}'
    ),
    (
      'order_shipped',
      'Your Order Has Shipped: {{orderCode}}',
      'Your order has shipped.',
      '<p>Hello {{userName}},</p><p>Your order <strong>{{orderCode}}</strong> has been shipped.</p><p>Tracking number: <strong>{{trackingNumber}}</strong></p><p><a href="{{trackingUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Track Shipment</a></p>',
      'Hello {{userName}},\n\nYour order {{orderCode}} has been shipped.\n\nTracking number: {{trackingNumber}}\nTracking link: {{trackingUrl}}'
    ),
    (
      'digital_delivery_ready',
      'Your Digital Book Is Ready: {{bookTitle}}',
      'Your digital book formats are available in your account.',
      '<p>Hello {{userName}},</p><p>Your purchased book <strong>{{bookTitle}}</strong> is ready to download.</p><p>Your PDF/EPUB files are not sent as email attachments and are never exposed through permanent public links. Please sign in to your account to download securely:</p><p><a href="{{downloadUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Open Downloads</a></p>',
      'Hello {{userName}},\n\nYour purchased book {{bookTitle}} is ready to download.\n\nSign in and download securely: {{downloadUrl}}'
    ),
    (
      'amazon_verification_received',
      'Your Amazon Verification Was Received',
      'Your Amazon purchase or review verification is now in review.',
      '<p>Hello {{userName}},</p><p>Your Amazon verification submission for <strong>{{verificationTitle}}</strong> has been received successfully.</p><p>Our operations team will review it as soon as possible.</p>',
      'Hello {{userName}},\n\nYour Amazon verification submission for {{verificationTitle}} has been received successfully. Our operations team will review it as soon as possible.'
    ),
    (
      'amazon_verification_approved',
      'Your Amazon Submission Was Approved (+{{pointsAmount}} IOH Points)',
      'Your Amazon verification was approved and your IOH Points were added.',
      '<p>Hello {{userName}},</p><p>Your verification submission for <strong>{{verificationTitle}}</strong> has been approved.</p><p><strong>{{pointsAmount}} IOH Points</strong> have been added to your account.</p><p>You can view your current balance and rewards here:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">View Rewards</a></p>',
      'Hello {{userName}},\n\nYour verification submission for {{verificationTitle}} has been approved. {{pointsAmount}} IOH Points have been added to your account.\n\nView rewards: {{accountUrl}}'
    ),
    (
      'amazon_verification_rejected',
      'Your Amazon Submission Was Rejected',
      'Your Amazon verification could not be approved.',
      '<p>Hello {{userName}},</p><p>Your verification submission for <strong>{{verificationTitle}}</strong> could not be approved.</p><p>Reason: <strong>{{adminReply}}</strong></p><p>You can review the details and submit again from your account:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">View Submission</a></p>',
      'Hello {{userName}},\n\nYour verification submission for {{verificationTitle}} could not be approved.\n\nReason: {{adminReply}}\n\nView submission: {{accountUrl}}'
    ),
    (
      'amazon_admin_reply',
      'New Message About Your Amazon Submission: {{verificationTitle}}',
      'An administrator left a message on your submission.',
      '<p>Hello {{userName}},</p><p>An administrator left a message about your <strong>{{verificationTitle}}</strong> submission:</p><blockquote style="border-left:4px solid #c9a75d;padding-left:12px;margin:18px 0;color:#d8d0c8;">{{adminReply}}</blockquote><p>You can reply or review the status here:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Review Submission</a></p>',
      'Hello {{userName}},\n\nAn administrator left a message about your {{verificationTitle}} submission:\n\n"{{adminReply}}"\n\nReview submission: {{accountUrl}}'
    ),
    (
      'points_awarded',
      'IOH Points Added to Your Account (+{{pointsAmount}} Points)',
      'New IOH Points have been added to your account.',
      '<p>Hello {{userName}},</p><p><strong>{{pointsAmount}} IOH Points</strong> have been added to your account.</p><p><strong>Reason:</strong> {{pointsReason}}</p><p><strong>Current Balance:</strong> {{currentBalance}} IOH Points</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">View My Account</a></p>',
      'Hello {{userName}},\n\n{{pointsAmount}} IOH Points have been added to your account.\n\nReason: {{pointsReason}}\nCurrent Balance: {{currentBalance}} IOH Points\n\nView my account: {{accountUrl}}'
    ),
    (
      'campaign_email',
      '{{subject}}',
      '{{subject}}',
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.6;color:#d8d0c8;">{{body}}<hr style="border:none;border-top:1px solid #333;margin:20px 0;" /><p style="font-size:12px;color:#888;text-align:center;">You are receiving this email because you opted in to IOHBOOK communications.<br />To change your preferences or unsubscribe, please <a href="{{unsubscribeUrl}}" style="color:#e7c574;text-decoration:underline;">visit your profile</a>.</p></div>',
      '{{body}}\n\n---\nYou are receiving this email because you opted in to IOHBOOK communications.\nUnsubscribe or update preferences: {{unsubscribeUrl}}'
    )
)
update public.email_templates t
set subject = e.subject,
    preview_text = e.preview_text,
    body_html = e.body_html,
    body_text = e.body_text,
    updated_at = now()
from english_templates e
where t.key = e.key;
