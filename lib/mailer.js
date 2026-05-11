import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === 'false' ? false : true, // true for 465, false for other ports
  auth: {
    user: "bushrajantubajan@gmail.com" || process.env.SMTP_USER,
    pass: "ispa hwym xvzr gxji" || process.env.SMTP_PASS,
  },
});

export const sendInquiryToAgent = async (agentEmail, inquiryDetails) => {
  const { propertyTitle, senderName, senderEmail, message } = inquiryDetails;

  const mailOptions = {
    from: `"SkyEstate Notifications" <${"bushrajantubajan@gmail.com" || process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `New Inquiry for: ${propertyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a; margin-bottom: 10px;">New Inquiry Received!</h2>
        <p style="color: #475569; font-size: 16px;">You have received a new inquiry on your listing: <strong>${propertyTitle}</strong></p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #334155;"><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p style="margin: 0; color: #334155; font-style: italic;">"${message}"</p>
        </div>

        <p style="color: #475569; font-size: 14px;">Log in to your SkyEstate Agent Dashboard to reply to this inquiry.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message from SkyEstate.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Inquiry email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    return false;
  }
};

export const sendReplyToUser = async (userEmail, replyDetails) => {
  const { propertyTitle, agentName, replyText, originalMessage } = replyDetails;

  const mailOptions = {
    from: `"SkyEstate Agent: ${agentName}" <${"bushrajantubajan@gmail.com" || process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Agent Reply: Inquiry for ${propertyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a; margin-bottom: 10px;">You've Got a Reply!</h2>
        <p style="color: #475569; font-size: 16px;"><strong>${agentName}</strong> has replied to your inquiry regarding <strong>${propertyTitle}</strong>.</p>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46; font-size: 15px; font-weight: bold;">Agent's Reply:</p>
          <p style="margin: 8px 0 0 0; color: #064e3b; font-size: 16px;">${replyText}</p>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 5px 0; color: #64748b; font-size: 13px;">Your Original Message:</p>
          <p style="margin: 0; color: #475569; font-style: italic; font-size: 14px;">"${originalMessage}"</p>
        </div>

        <p style="color: #475569; font-size: 14px;">If you have more questions, feel free to reply on the property details page.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message from SkyEstate.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reply email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reply email:', error);
    return false;
  }
};
