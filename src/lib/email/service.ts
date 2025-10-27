import nodemailer from 'nodemailer'

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour d'autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Types pour les emails
interface InvitationEmailData {
  email: string
  firstName: string
  lastName: string
  invitedByName: string
  inviteUrl: string
}

interface WelcomeEmailData {
  email: string
  firstName: string
  lastName: string
}

// Template d'email d'invitation
const getInvitationEmailTemplate = (data: InvitationEmailData) => {
  return {
    subject: `You're invited to join SalesUp as a Sales Agent`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Join SalesUp</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #1d4ed8; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .info-box { background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to SalesUp!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            
            <p>Great news! <strong>${data.invitedByName}</strong> has invited you to join SalesUp as a Sales Agent.</p>
            
            <div class="info-box">
              <strong>What is SalesUp?</strong><br>
              SalesUp is a powerful platform designed to help sales agents track their daily performance, manage insurance packages, and reach their sales goals with AI-powered insights.
            </div>
            
            <p>As a Sales Agent, you'll be able to:</p>
            <ul>
              <li>📊 Track your daily sales performance</li>
              <li>📈 Monitor your insurance rates and upgrade metrics</li>
              <li>🎯 Set and achieve your sales goals</li>
              <li>🤖 Get AI-powered feedback and recommendations</li>
              <li>📱 Access your dashboard from anywhere</li>
            </ul>
            
            <p>To get started, simply click the button below to create your account:</p>
            
            <div style="text-align: center;">
              <a href="${data.inviteUrl}" class="button">Create My Account</a>
            </div>
            
            <p><small>This invitation will expire in 7 days. If the button doesn't work, copy and paste this link into your browser:</small></p>
            <p><small style="word-break: break-all; color: #6b7280;">${data.inviteUrl}</small></p>
            
            <p>If you have any questions, feel free to reach out to your manager or our support team.</p>
            
            <p>Welcome to the team!</p>
          </div>
          <div class="footer">
            <p>This email was sent by SalesUp. If you received this email by mistake, please ignore it.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${data.firstName}!
      
      ${data.invitedByName} has invited you to join SalesUp as a Sales Agent.
      
      SalesUp is a platform to track your sales performance and reach your goals.
      
      Create your account here: ${data.inviteUrl}
      
      This invitation expires in 7 days.
      
      Welcome to the team!
    `
  }
}

// Template d'email de bienvenue
const getWelcomeEmailTemplate = (data: WelcomeEmailData) => {
  return {
    subject: `Welcome to SalesUp, ${data.firstName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SalesUp</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .tip-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Created Successfully!</h1>
          </div>
          <div class="content">
            <h2>Welcome aboard, ${data.firstName}!</h2>
            
            <p>Your SalesUp account has been created successfully. You can now start tracking your sales performance and reaching your goals!</p>
            
            <div class="tip-box">
              <strong>💡 Quick Start Tips:</strong><br>
              1. Log in to your dashboard<br>
              2. Fill your first daily entry<br>
              3. Set your performance goals<br>
              4. Start tracking your progress!
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Access Dashboard</a>
            </div>
            
            <p>If you need any help getting started, don't hesitate to reach out to your manager.</p>
            
            <p>Happy selling!</p>
          </div>
          <div class="footer">
            <p>The SalesUp Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome aboard, ${data.firstName}!
      
      Your SalesUp account has been created successfully.
      
      Log in here: ${process.env.NEXTAUTH_URL}/auth/signin
      
      Quick start: Fill your first daily entry and set your goals!
      
      Happy selling!
      The SalesUp Team
    `
  }
}

// Service d'envoi d'emails
export class EmailService {
  private transporter: any

  constructor() {
    this.transporter = createTransporter()
  }

  // Envoyer un email d'invitation
  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      const template = getInvitationEmailTemplate(data)
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: data.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('📧 Invitation email sent:', result.messageId)
      return true

    } catch (error) {
      console.error('❌ Error sending invitation email:', error)
      return false
    }
  }

  // Envoyer un email de bienvenue
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const template = getWelcomeEmailTemplate(data)
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: data.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('📧 Welcome email sent:', result.messageId)
      return true

    } catch (error) {
      console.error('❌ Error sending welcome email:', error)
      return false
    }
  }

  // Tester la configuration email
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ Email configuration is valid')
      return true
    } catch (error) {
      console.error('❌ Email configuration error:', error)
      return false
    }
  }
}

// Instance singleton
export const emailService = new EmailService()