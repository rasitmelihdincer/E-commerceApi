import { Injectable, Inject } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
    @Inject('MAIL_SERVICE') private mailClient: ClientProxy,
  ) {}

  private formatContent(content: string) {
    return `
      <div style="text-align: center; font-size: 18px;">
        <h2 style="font-size: 24px; color: #333;">${content}</h2>
        <a href="#" class="button">Mağazaya Git</a>
      </div>
    `;
  }

  private getBaseTemplate(content: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Commerce</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          color: #333333;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666666;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .highlight {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 20px 0;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          color: #667eea;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>E-Commerce Store</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Bu email E-Commerce Store tarafından gönderilmiştir.</p>
          <div class="social-links">
            <a href="#">Facebook</a> |
            <a href="#">Twitter</a> |
            <a href="#">Instagram</a>
          </div>
          <p>© 2024 E-Commerce Store. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private async trackEmail(data: {
    subject: string;
    content: string;
    recipient: string;
    type: string;
    customerId?: number;
  }) {
    return this.prisma.email.create({
      data: {
        subject: data.subject,
        content: data.content,
        recipient: data.recipient,
        type: data.type,
        customerId: data.customerId,
        status: 'PENDING',
      },
    });
  }

  async sendCustomEmail(email: string, subject: string, content: string) {
    const emailRecord = await this.trackEmail({
      subject,
      content,
      recipient: email,
      type: 'CUSTOM',
    });

    this.mailClient.emit('send_custom_email', {
      email,
      subject,
      content: this.getBaseTemplate(this.formatContent(content)),
      emailId: emailRecord.id,
    });

    return emailRecord.id;
  }

  async sendOrderConfirmation(email: string, orderDetails: any) {
    const subject = 'Siparişiniz Onaylandı';
    const content = `Sipariş Numarası: #${orderDetails.id}\nToplam Tutar: ${orderDetails.totalPrice} TL`;

    const emailRecord = await this.trackEmail({
      subject,
      content,
      recipient: email,
      type: 'ORDER_CONFIRMATION',
    });

    this.mailClient.emit('send_order_confirmation', {
      email,
      subject,
      content: this.getBaseTemplate(`
        <h2>Siparişiniz için Teşekkürler!</h2>
        <p>Siparişiniz başarıyla oluşturuldu.</p>
        
        <div class="highlight">
          <h3>Sipariş Detayları</h3>
          <p>Sipariş Numarası: #${orderDetails.id}</p>
          <p>Toplam Tutar: ${orderDetails.totalPrice} TL</p>
        </div>

        <p>Siparişinizin durumunu kontrol etmek için aşağıdaki butonu kullanabilirsiniz:</p>
        <a href="#" class="button">Siparişimi Görüntüle</a>
        
        <p>Herhangi bir sorunuz varsa, müşteri hizmetlerimizle iletişime geçmekten çekinmeyin.</p>
      `),
      emailId: emailRecord.id,
    });

    return emailRecord.id;
  }

  async sendPaymentConfirmation(email: string, paymentDetails: any) {
    const subject = 'Ödemeniz Onaylandı';
    const content = `Ödeme Numarası: #${paymentDetails.id}\nTutar: ${paymentDetails.amount} TL`;

    const emailRecord = await this.trackEmail({
      subject,
      content,
      recipient: email,
      type: 'PAYMENT_CONFIRMATION',
    });

    this.mailClient.emit('send_payment_confirmation', {
      email,
      subject,
      content: this.getBaseTemplate(`
        <h2>Ödemeniz Başarıyla Gerçekleşti!</h2>
        <p>Ödemeniz başarıyla işleme alındı.</p>
        
        <div class="highlight">
          <h3>Ödeme Detayları</h3>
          <p>Ödeme Numarası: #${paymentDetails.id}</p>
          <p>Tutar: ${paymentDetails.amount} TL</p>
        </div>

        <p>Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecektir.</p>
        <a href="#" class="button">Siparişimi Takip Et</a>
      `),
      emailId: emailRecord.id,
    });

    return emailRecord.id;
  }

  async sendRefundConfirmation(email: string, refundDetails: any) {
    const subject = 'İade İşleminiz Onaylandı';
    const content = `Sipariş Numarası: #${refundDetails.orderId}\nİade Tutarı: ${refundDetails.amount} TL`;

    const emailRecord = await this.trackEmail({
      subject,
      content,
      recipient: email,
      type: 'REFUND_CONFIRMATION',
    });

    this.mailClient.emit('send_refund_confirmation', {
      email,
      subject,
      content: this.getBaseTemplate(`
        <h2>İade İşleminiz Tamamlandı</h2>
        <p>İade talebiniz başarıyla işleme alındı.</p>
        
        <div class="highlight">
          <h3>İade Detayları</h3>
          <p>Sipariş Numarası: #${refundDetails.orderId}</p>
          <p>İade Tutarı: ${refundDetails.amount} TL</p>
        </div>

        <p>İade tutarı 3-5 iş günü içerisinde hesabınıza yatırılacaktır.</p>
        <a href="#" class="button">İade Durumunu Kontrol Et</a>
      `),
      emailId: emailRecord.id,
    });

    return emailRecord.id;
  }

  async sendBulkEmail(subject: string, content: string) {
    const customers = await this.prisma.customer.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    const emailRecords = await Promise.all(
      customers.map((customer) =>
        this.trackEmail({
          subject,
          content,
          recipient: customer.email,
          type: 'BULK',
          customerId: customer.id,
        }),
      ),
    );

    const htmlContent = this.getBaseTemplate(this.formatContent(content));
    customers.forEach((customer, index) => {
      this.mailClient.emit('send_bulk_email', {
        email: customer.email,
        subject,
        content: htmlContent,
        customerId: customer.id,
        emailId: emailRecords[index].id,
      });
    });

    return {
      total: customers.length,
      message: 'Bulk email request received',
    };
  }

  private async handleEmailSending(data: {
    email: string;
    subject: string;
    content: string;
    emailId: number;
  }) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: data.subject,
        html: data.content,
      });

      await this.prisma.email.update({
        where: { id: data.emailId },
        data: { status: 'SENT' },
      });
    } catch (error) {
      await this.prisma.email.update({
        where: { id: data.emailId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  async handleCustomEmail(data: any) {
    return this.handleEmailSending(data);
  }

  async handleOrderConfirmationEmail(data: any) {
    return this.handleEmailSending(data);
  }

  async handlePaymentConfirmationEmail(data: any) {
    return this.handleEmailSending(data);
  }

  async handleRefundConfirmationEmail(data: any) {
    return this.handleEmailSending(data);
  }

  async handleBulkEmail(data: any) {
    return this.handleEmailSending(data);
  }

  async getEmailHistory(customerId?: number) {
    return this.prisma.email.findMany({
      where: customerId ? { customerId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
