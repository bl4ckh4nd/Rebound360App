import { createTransport } from 'nodemailer';
import type { Requisition } from '../../shared/types';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface EmailConfig {
  from?: string;
  bcc?: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig = {}) {
    this.config = {
      from: config.from || process.env.EMAIL_FROM || 'noreply@company.com',
      bcc: config.bcc || process.env.EMAIL_BCC
    };
  }

  async sendApprovalRequest(requisition: Requisition, approverEmail: string) {
    const subject = `Genehmigung erforderlich: ${requisition.title}`;
    const html = `
      <h2>Neue Genehmigungsanfrage</h2>
      <p>Eine neue Beschaffungsanforderung benötigt Ihre Genehmigung:</p>
      <ul>
        <li><strong>Titel:</strong> ${requisition.title}</li>
        <li><strong>Anforderer:</strong> ${requisition.requesterName}</li>
        <li><strong>Abteilung:</strong> ${requisition.department}</li>
        <li><strong>Gesamtbetrag:</strong> ${requisition.totalAmount} ${requisition.currency}</li>
      </ul>
      <p>Bitte prüfen Sie die Anforderung im System.</p>
    `;

    return this.sendEmail(approverEmail, subject, html);
  }

  async sendStatusUpdate(requisition: Requisition, recipientEmail: string) {
    let subject = '';
    let statusText = '';

    switch (requisition.status) {
      case 'approved':
        subject = `Anforderung genehmigt: ${requisition.title}`;
        statusText = 'wurde genehmigt';
        break;
      case 'rejected':
        subject = `Anforderung abgelehnt: ${requisition.title}`;
        statusText = 'wurde abgelehnt';
        break;
      case 'manager_approval':
        subject = `Anforderung in Prüfung: ${requisition.title}`;
        statusText = 'wird vom Abteilungsleiter geprüft';
        break;
      case 'finance_approval':
        subject = `Anforderung in Finanzprüfung: ${requisition.title}`;
        statusText = 'wird von der Finanzabteilung geprüft';
        break;
      default:
        subject = `Status-Update: ${requisition.title}`;
        statusText = `hat den Status "${requisition.status}"`;
    }

    const html = `
      <h2>Status-Update zu Ihrer Beschaffungsanforderung</h2>
      <p>Ihre Anforderung "${requisition.title}" ${statusText}.</p>
      <p>Details zur Anforderung:</p>
      <ul>
        <li><strong>Titel:</strong> ${requisition.title}</li>
        <li><strong>Status:</strong> ${requisition.status}</li>
        <li><strong>Gesamtbetrag:</strong> ${requisition.totalAmount} ${requisition.currency}</li>
      </ul>
      <p>Sie können den aktuellen Status jederzeit im System einsehen.</p>
    `;

    return this.sendEmail(recipientEmail, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: this.config.from,
        to,
        bcc: this.config.bcc,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}