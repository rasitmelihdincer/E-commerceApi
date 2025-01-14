import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
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
    status?: string;
  }) {
    return this.prisma.email.create({
      data: {
        subject: data.subject,
        content: data.content,
        recipient: data.recipient,
        type: data.type,
        customerId: data.customerId,
        status: data.status || 'SENT',
      },
    });
  }

  async sendTestEmail() {
    const subject = 'Hoş Geldiniz!';
    const content = this.getBaseTemplate(`
      <h2>Merhaba!</h2>
      <p>E-Commerce Store'a hoş geldiniz. Bu bir test emailidir.</p>
      <div class="highlight">
        <p>🎉 Yeni üyelere özel %10 indirim fırsatını kaçırmayın!</p>
      </div>
      <a href="#" class="button">Alışverişe Başla</a>
    `);

    try {
      await this.mailerService.sendMail({
        to: 'melihdincerparacim@gmail.com',
        subject,
        html: content,
      });

      await this.trackEmail({
        subject,
        content,
        recipient: 'melihdincerparacim@gmail.com',
        type: 'TEST',
      });

      return true;
    } catch (error) {
      await this.trackEmail({
        subject,
        content,
        recipient: 'melihdincerparacim@gmail.com',
        type: 'TEST',
        status: 'FAILED',
      });
      throw error;
    }
  }

  async sendOrderConfirmation(email: string, orderDetails: any) {
    const subject = 'Siparişiniz Onaylandı';
    const content = this.getBaseTemplate(`
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
    `);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: content,
      });

      await this.trackEmail({
        subject,
        content,
        recipient: email,
        type: 'ORDER_CONFIRMATION',
      });
    } catch (error) {
      await this.trackEmail({
        subject,
        content,
        recipient: email,
        type: 'ORDER_CONFIRMATION',
        status: 'FAILED',
      });
      throw error;
    }
  }

  async sendPaymentConfirmation(email: string, paymentDetails: any) {
    const subject = 'Ödemeniz Onaylandı';
    const content = this.getBaseTemplate(`
      <h2>Ödemeniz Başarıyla Gerçekleşti!</h2>
      <p>Ödemeniz başarıyla işleme alındı.</p>
      
      <div class="highlight">
        <h3>Ödeme Detayları</h3>
        <p>Ödeme Numarası: #${paymentDetails.id}</p>
        <p>Tutar: ${paymentDetails.amount} TL</p>
      </div>

      <p>Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecektir.</p>
      <a href="#" class="button">Siparişimi Takip Et</a>
    `);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: content,
      });

      await this.trackEmail({
        subject,
        content,
        recipient: email,
        type: 'PAYMENT_CONFIRMATION',
      });
    } catch (error) {
      await this.trackEmail({
        subject,
        content,
        recipient: email,
        type: 'PAYMENT_CONFIRMATION',
        status: 'FAILED',
      });
      throw error;
    }
  }

  async sendRefundConfirmation(email: string, refundDetails: any) {
    const subject = 'İade İşleminiz Onaylandı';
    const content = this.getBaseTemplate(`
      <h2>İade İşleminiz Tamamlandı</h2>
      <p>İade talebiniz başarıyla işleme alındı.</p>
      
      <div class="highlight">
        <h3>İade Detayları</h3>
        <p>Sipariş Numarası: #${refundDetails.orderId}</p>
        <p>İade Tutarı: ${refundDetails.amount} TL</p>
      </div>

      <p>İade tutarı 3-5 iş günü içerisinde hesabınıza yatırılacaktır.</p>
      <a href="#" class="button">İade Durumunu Kontrol Et</a>
    `);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: content,
      });

      await this.trackEmail({
        subject,
        content,
        recipient: email,
        type: 'REFUND_CONFIRMATION',
      });
    } catch (error) {
      await this.trackEmail({
        subject,
        content,
        recipient: email,
        type: 'REFUND_CONFIRMATION',
        status: 'FAILED',
      });
      throw error;
    }
  }

  async sendBulkEmail(subject: string, content: string) {
    const formattedContent = this.formatContent(content);
    const htmlContent = this.getBaseTemplate(formattedContent);
    const customers = await this.prisma.customer.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    const results = await Promise.allSettled(
      customers.map(async (customer) => {
        try {
          await this.mailerService.sendMail({
            to: customer.email,
            subject,
            html: htmlContent,
          });

          await this.trackEmail({
            subject,
            content: htmlContent,
            recipient: customer.email,
            type: 'BULK',
            customerId: customer.id,
          });

          return { success: true, email: customer.email };
        } catch (error) {
          await this.trackEmail({
            subject,
            content: htmlContent,
            recipient: customer.email,
            type: 'BULK',
            customerId: customer.id,
            status: 'FAILED',
          });
          return {
            success: false,
            email: customer.email,
            error: error.message,
          };
        }
      }),
    );

    return {
      total: customers.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      details: results,
    };
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
